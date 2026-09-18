import { useAuth } from "@clerk/expo";
import { useMutation } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";

export type RideRequestInput = {
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
};

export type Ride = RideRequestInput & {
  id: string;
  status: "REQUESTED" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
};

export function useCreateRide() {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (input: RideRequestInput) =>
      apiFetch<Ride>("/api/rides", await getToken(), {
        method: "POST",
        body: JSON.stringify(input),
      }),
  });
}
