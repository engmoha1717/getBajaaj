import { useAuth } from "@clerk/expo";
import { useQuery } from "@tanstack/react-query";

export type CurrentUser = {
  role: "RIDER" | "DRIVER" | "ADMIN";
  hasDriverProfile: boolean;
};

export function useCurrentUser() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["me"],
    enabled: isSignedIn,
    queryFn: async (): Promise<CurrentUser> => {
      const token = await getToken();
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load current user");
      return res.json();
    },
  });
}
