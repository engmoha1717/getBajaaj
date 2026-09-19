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

  // Explicit Stack.Screen entries, not the bare auto-discovery form —
  // Expo's own docs specifically call this out for a Stack that
  // contains a nested navigator group ((tabs) is itself a <Tabs>, not
  // a plain screen), which is exactly this case.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="book" />
      <Stack.Screen name="ride/[id]" />
    </Stack>
  );
}
