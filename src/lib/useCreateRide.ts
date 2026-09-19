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
  // Set when requesting a specific driver from the nearby-drivers list —
  // the server creates the ride straight into ACCEPTED for that driver
  // instead of the open queue.
  driverId?: string;
};

export type Ride = RideRequestInput & {
  id: string;
  status: "REQUESTED" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  startOtp: string | null;
  driver: { lastLat: number | null; lastLng: number | null; user: { name: string } } | null;
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
