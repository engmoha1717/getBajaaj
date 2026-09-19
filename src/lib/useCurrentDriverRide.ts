import { useAuth } from "@clerk/expo";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";

export type CurrentDriverRide = {
  id: string;
  pickupAddress: string;
  dropoffAddress: string;
  rider: { name: string; phone: string | null };
} | null;

export function useCurrentDriverRide(enabled: boolean) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["current-driver-ride"],
    enabled,
    refetchInterval: 4000,
    queryFn: async () => apiFetch<CurrentDriverRide>("/api/rides/current", await getToken()),
  });
}
