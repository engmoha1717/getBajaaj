import "../global.css";

import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import { enableFreeze } from "react-native-screens";

// Required once, at module scope, so the in-app browser used for Google/
// Apple OAuth properly closes and hands control back to the app.
WebBrowser.maybeCompleteAuthSession();

// Keep the splash screen up until the brand font is ready — otherwise
// the first frame flashes in the system font, then swaps once it loads.
SplashScreen.preventAutoHideAsync();

// react-native-screens freezes inactive screens' React trees as a perf
// optimization. Disabling it: every structural fix for the "Couldn't
// find a navigation context" crash (explicit Stack.Screen, <Slot>
// instead of <Tabs>, flattening nested groups, latest expo-router
// patch) failed, always at the same trigger (a screen re-rendering
// after having been mounted for a moment) — exactly the shape of a
// screen-freeze/thaw bug, not something fixable from the JS side.
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
        <Stack screenOptions={{ headerShown: false }} />
      </QueryClientProvider>
    </ClerkProvider>
  );
}
