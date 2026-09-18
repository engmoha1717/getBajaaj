import { useAuth } from "@clerk/expo";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type { Ride } from "@/lib/useCreateRide";

export function useRide(id: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["ride", id],
    queryFn: async () => apiFetch<Ride>(`/api/rides/${id}`, await getToken()),
    // No driver-accept flow exists yet, so nothing moves this ride along
    // on its own — polling is what will notice a status change, whether
    // from a future real accept flow or us flipping it in Neon to test.
    refetchInterval: 4000,
  });
}
