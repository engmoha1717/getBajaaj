import { useAuth } from "@clerk/expo";
import { useMutation } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";

export type DriverApplication = {
  licenseNumber: string;
  vehicleMake: string;
  vehicleModel: string;
  vehiclePlate: string;
};

export function useApplyToDrive() {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (input: DriverApplication) =>
      apiFetch("/api/drivers/me", await getToken(), {
        method: "POST",
        body: JSON.stringify(input),
      }),
  });
}
