import { useAuth } from "@clerk/expo";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type { Ride } from "@/lib/useCreateRide";

export function useCancelRide(id: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () =>
      apiFetch<Ride>(`/api/rides/${id}`, await getToken(), {
        method: "PATCH",
        body: JSON.stringify({ status: "CANCELLED" }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ride", id] }),
  });
}
