import { Stack } from "expo-router";

// Reachability (signed in + role === DRIVER) is owned by
// RootNavigator's Stack.Protected — this layout no longer checks auth
// itself, which is what used to race that same check on sign-out and
// crash with "Maximum update depth exceeded".
export default function DriverLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
