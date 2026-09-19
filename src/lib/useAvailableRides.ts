import { useAuth } from "@clerk/expo";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";

export type AvailableRide = {
  id: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  requestedAt: string;
  rider: { name: string };
};

// Polls only while the driver is online — mirrors useRide's polling
// approach on the rider side, since there's no push/websocket layer yet.
export function useAvailableRides(enabled: boolean) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["available-rides"],
    enabled,
    refetchInterval: 4000,
    queryFn: async () => apiFetch<AvailableRide[]>("/api/rides/available", await getToken()),
  });
}
