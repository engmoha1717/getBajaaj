import { useAuth } from "@clerk/expo";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";

export type MyDriverProfile = {
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  isOnline: boolean;
  vehicleMake: string;
  vehicleModel: string;
  vehiclePlate: string;
  averageRating: number | null;
  ratingCount: number;
};

export function useMyDriverProfile() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["my-driver-profile"],
    enabled: isSignedIn,
    queryFn: async () => apiFetch<MyDriverProfile>("/api/drivers/me", await getToken()),
  });
}
