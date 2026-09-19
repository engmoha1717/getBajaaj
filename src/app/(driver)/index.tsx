import { useAuth } from "@clerk/expo";
import { Pressable, Text, View } from "react-native";

import { useDriverOnline } from "@/lib/useDriverOnline";

export default function DriverHome() {
  const { signOut } = useAuth();
  const { online, goOnline, goOffline, isSaving, error, lastFix } = useDriverOnline();

  return (
    <View className="flex-1 items-center justify-center gap-6 bg-[#FFB800] px-6">
      <View className="items-center gap-2">
        <Text className="text-3xl font-bold text-[#271900]">Driver home</Text>
        <Text className="text-base text-[#5e4200]">
          {online ? "You're online — sharing your location." : "You're offline."}
        </Text>
        <Text className="text-center text-xs text-[#5e4200]">
          {lastFix ? `GPS fix: ${lastFix.lat.toFixed(4)}, ${lastFix.lng.toFixed(4)}` : "GPS fix: none yet"}
        </Text>
        {error ? (
          <Text className="text-center text-sm font-semibold text-red-700">{error}</Text>
        ) : null}
      </View>

      <Pressable
        onPress={() => (online ? goOffline() : goOnline())}
        disabled={isSaving}
        // Opacity dimming while saving is done via inline style, not a
        // conditionally-toggled NativeWind class — see the "Couldn't
        // find a navigation context" fix in (rider)/index.tsx.
        style={isSaving ? { opacity: 0.5 } : undefined}
        className="rounded-full bg-[#271900] px-8 py-3 active:opacity-80"
      >
        <Text className="text-base font-semibold text-white">
          {online ? "Go offline" : "Go online"}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => signOut()}
        className="rounded-full border border-[#271900] px-8 py-3 active:opacity-80"
      >
        <Text className="text-base font-semibold text-[#271900]">Sign out</Text>
      </Pressable>
    </View>
  );
}
