import { useAuth } from "@clerk/expo";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";

export type CurrentUser = {
  role: "RIDER" | "DRIVER" | "ADMIN";
  hasDriverProfile: boolean;
};

export function useCurrentUser() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["me"],
    enabled: isSignedIn,
    queryFn: async () => apiFetch<CurrentUser>("/api/me", await getToken()),
  });
}
