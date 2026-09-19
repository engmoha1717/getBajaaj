import { useAuth } from "@clerk/expo";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";

export type CompletedRide = {
  id: string;
  pickupAddress: string;
  dropoffAddress: string;
  // Prisma's Decimal serializes to a JSON string, not a number.
  fare: string | null;
  completedAt: string;
  rider: { name: string };
};

export function useMyRides(enabled: boolean) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["my-rides"],
    enabled,
    queryFn: async () => apiFetch<CompletedRide[]>("/api/rides/mine", await getToken()),
  });
}
