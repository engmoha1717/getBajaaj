import { Stack } from "expo-router";

// Reachability (signed out) is owned by RootNavigator's Stack.Protected
// — this layout no longer checks auth itself.
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
