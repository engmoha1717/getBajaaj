import "../global.css";

import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import { enableFreeze } from "react-native-screens";

import { useCurrentUser } from "@/lib/useCurrentUser";
import { useRegisterPushToken } from "@/lib/useRegisterPushToken";

// Required once, at module scope, so the in-app browser used for Google/
// Apple OAuth properly closes and hands control back to the app.
WebBrowser.maybeCompleteAuthSession();

// Keep the splash screen up until the brand font is ready — otherwise
// the first frame flashes in the system font, then swaps once it loads.
SplashScreen.preventAutoHideAsync();

// react-native-screens freezes inactive screens' React trees as a perf
// optimization. Disabled while chasing a "Couldn't find a navigation
// context" crash that turned out to be unrelated (a NativeWind
// conditionally-toggled `shadow-*` class racing context init, see
// (rider)/index.tsx) — left off since it's a no-op on the flat (rider)
// stack this app now uses, not because freeze itself was ever the cause.
enableFreeze(false);

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <QueryClientProvider client={queryClient}>
        <RootNavigator />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

// Every top-level auth/role gate lives here, via Stack.Protected, instead
// of each route group deciding for itself whether it's reachable. The
// previous approach — every group's own layout returning <Redirect>
// from render when isSignedIn/role didn't match — raced itself during
// sign-out (isSignedIn flips, one layout redirects, the next screen's
// layout re-evaluates before the first navigation settles, ...) and
// crashed with "Maximum update depth exceeded". Stack.Protected is
// expo-router's own answer to that: it manages the transition when a
// guard flips while its screen is focused, instead of us re-deriving
// navigation state on every render.
function RootNavigator() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading: roleLoading } = useCurrentUser();

  // The QueryClient above is created once for the app's whole lifetime,
  // but its cache is keyed by query name ("me", "my-driver-profile", …),
  // not by which account is signed in. Sign out of account A and into
  // account B without a full app reload (exactly what testing this app
  // by hand involves) and B's first render would briefly serve A's
  // cached role/driver data under those same keys. Clearing the cache
  // on every userId change (including to/from null on sign-out) makes
  // each account start from a clean slate.
  useEffect(() => {
    queryClient.clear();
  }, [userId, queryClient]);

  useRegisterPushToken();

  if (!isLoaded || (isSignedIn && roleLoading)) return null;

  const isDriver = data?.role === "DRIVER";

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={isSignedIn && !isDriver}>
        <Stack.Screen name="(rider)" />
      </Stack.Protected>

      <Stack.Protected guard={isSignedIn && isDriver}>
        <Stack.Screen name="(driver)" />
      </Stack.Protected>
    </Stack>
  );
}
