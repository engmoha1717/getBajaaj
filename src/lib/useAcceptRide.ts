import { useAuth } from "@clerk/expo";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";

export function useAcceptRide() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rideId: string) =>
      apiFetch(`/api/rides/${rideId}/accept`, await getToken(), { method: "POST" }),
    onSuccess: () => {
      // Someone else's accept could have already removed this ride (or
      // any other) from the list — refetch rather than trust local state.
      queryClient.invalidateQueries({ queryKey: ["available-rides"] });
    },
  });
}
