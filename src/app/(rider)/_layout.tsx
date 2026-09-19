import { Stack } from "expo-router";

// Reachability (signed in + role !== DRIVER) is owned by
// RootNavigator's Stack.Protected — this layout no longer checks auth
// itself, which is what used to race that same check on sign-out and
// crash with "Maximum update depth exceeded".
export default function RiderLayout() {
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
      <Stack.Screen name="become-driver" />
    </Stack>
  );
}
