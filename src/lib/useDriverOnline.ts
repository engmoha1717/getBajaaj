import { useAuth } from "@clerk/expo";
import { useMutation } from "@tanstack/react-query";
import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";

import { apiFetch } from "@/lib/api";

type LocationPing = { isOnline: boolean; lat?: number; lng?: number };

// Drives the driver app's go-online toggle: while online, GPS is
// watched continuously (not polled once) and every fix is pushed to
// the backend so riders' nearby-driver queries stay fresh.
export function useDriverOnline() {
  const { getToken } = useAuth();
  const [online, setOnline] = useState(false);
  const [onlineSince, setOnlineSince] = useState<Date | null>(null);
  const [lastFix, setLastFix] = useState<{ lat: number; lng: number } | null>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const report = useMutation({
    mutationFn: async (input: LocationPing) =>
      apiFetch("/api/drivers/me", await getToken(), {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
  });

  const goOnline = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    subscriptionRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 25 },
      (position) => {
        const { latitude, longitude } = position.coords;
        setLastFix({ lat: latitude, lng: longitude });
        report.mutate({ isOnline: true, lat: latitude, lng: longitude });
      },
    );
    setOnline(true);
    setOnlineSince(new Date());
  }, [report]);

  // Stops the GPS watch if this hook's owner unmounts (navigating away,
  // or getting signed out) while still "online" — without this, the
  // subscription and its PATCH-per-fix would keep running forever,
  // driverless, since only goOffline() used to remove it.
  useEffect(() => {
    return () => subscriptionRef.current?.remove();
  }, []);

  const goOffline = useCallback(() => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
    setOnline(false);
    setOnlineSince(null);
    report.mutate({ isOnline: false });
  }, [report]);

  return {
    online,
    onlineSince,
    goOnline,
    goOffline,
    isSaving: report.isPending,
    error: report.error instanceof Error ? report.error.message : null,
    lastFix,
  };
}
