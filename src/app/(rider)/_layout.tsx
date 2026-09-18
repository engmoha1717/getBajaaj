import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";

export default function RiderLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  // Guards this whole section, not just the sign-out button: any time
  // Clerk's session goes away (manual sign-out, expired token, etc.)
  // this layout re-renders and bounces back to "/" immediately — no
  // refresh needed, because it's watching isSignedIn live, not just
  // checking it once on mount.
  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
