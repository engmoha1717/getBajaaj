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

  // Flat structure on purpose: index/activity/wallet/profile are all
  // direct children here (each renders its own <TabBarShell> around
  // its content, a plain UI wrapper, not a nested navigator). Kept this
  // way for simplicity — the "Couldn't find a navigation context" crash
  // once blamed on the nested (tabs) group was actually a NativeWind
  // conditional `shadow-*` class issue, see (rider)/index.tsx. book/ride
  // stay full-screen pushes with no tab bar.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="activity" />
      <Stack.Screen name="wallet" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="book" />
      <Stack.Screen name="ride/[id]" />
    </Stack>
  );
}
