import { useAuth } from "@clerk/expo";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";

export type PastRide = {
  id: string;
  status: "COMPLETED" | "CANCELLED";
  pickupAddress: string;
  dropoffAddress: string;
  fare: string | null;
  requestedAt: string;
  completedAt: string | null;
  driver: { user: { name: string } } | null;
};

export function useRideHistory() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["ride-history"],
    enabled: isSignedIn,
    queryFn: async () => apiFetch<PastRide[]>("/api/rides/history", await getToken()),
  });
}
