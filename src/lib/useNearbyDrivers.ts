import { useAuth } from "@clerk/expo";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type { Coords } from "@/lib/useCurrentLocation";

export type NearbyDriver = {
  id: string;
  name: string;
  vehicleMake: string;
  vehicleModel: string;
  distanceKm: number;
  lat: number;
  lng: number;
};

// Polls rather than pushes — good enough for a list view; a real-time
// feed (websocket/SSE) would replace this once drivers move on a map.
export function useNearbyDrivers(coords: Coords | null) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["nearby-drivers", coords?.lat, coords?.lng],
    enabled: coords !== null,
    refetchInterval: 10000,
    queryFn: async () =>
      apiFetch<NearbyDriver[]>(
        `/api/drivers/nearby?lat=${coords!.lat}&lng=${coords!.lng}`,
        await getToken(),
      ),
  });
}
