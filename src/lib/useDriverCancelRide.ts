import { useAuth } from "@clerk/expo";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";

export function useDriverCancelRide() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rideId: string) =>
      apiFetch(`/api/rides/${rideId}/driver-cancel`, await getToken(), { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-driver-ride"] });
    },
  });
}
