import { useAuth } from "@clerk/expo";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";

export function useStartRide() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rideId, otp }: { rideId: string; otp: string }) =>
      apiFetch(`/api/rides/${rideId}/start`, await getToken(), {
        method: "POST",
        body: JSON.stringify({ otp }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-driver-ride"] });
    },
  });
}
