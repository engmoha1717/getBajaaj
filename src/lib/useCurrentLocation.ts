import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";

export type Coords = { lat: number; lng: number };

// Shared by the Home top-bar label and the booking form's pickup
// pre-fill — same GPS permission + reverse-geocode, two call sites.
export function useCurrentLocation() {
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<Coords | null>(null);
  const [loading, setLoading] = useState(true);

  // Pulled out of the mount effect so a screen can also call this on
  // demand (e.g. tapping the address label to retry) — fetching once
  // automatically, not continuously, and again only when asked for.
  // Returns the fresh coords directly, not just via state — a caller
  // that needs them immediately (e.g. animating a map camera) would
  // otherwise be racing React's render cycle for the updated `coords`.
  const refresh = useCallback(async (): Promise<Coords | null> => {
    setLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setLoading(false);
      return null;
    }

    const position = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = position.coords;
    const next = { lat: latitude, lng: longitude };
    setCoords(next);

    const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
    setAddress(place ? [place.name, place.street, place.city].filter(Boolean).join(", ") : "");
    setLoading(false);
    return next;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { address, setAddress, coords, loading, refresh };
}
