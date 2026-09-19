import { useAuth } from "@clerk/expo";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";

export function useRateRide(rideId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (score: number) =>
      apiFetch(`/api/rides/${rideId}/rate`, await getToken(), {
        method: "POST",
        body: JSON.stringify({ score }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ride", rideId] });
    },
  });
}
