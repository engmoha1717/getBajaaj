import { useUser } from "@clerk/expo";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { useCurrentLocation } from "@/lib/useCurrentLocation";

export default function RiderHome() {
  const { user } = useUser();
  const { address, loading } = useCurrentLocation();
  const [view, setView] = useState<"map" | "list">("map");

  const initial = (user?.firstName ?? user?.primaryEmailAddress?.emailAddress ?? "?")
    .charAt(0)
    .toUpperCase();

  return (
    <View className="flex-1 bg-surface">
      <View className="flex-row items-center justify-between px-4 pb-3 pt-16">
        <View className="flex-1 pr-3">
          <Text className="font-jakarta-medium text-xs text-muted">Current location</Text>
          <Text numberOfLines={1} className="font-jakarta-bold text-base text-ink">
            {loading ? "Finding you…" : address || "Location unavailable"}
          </Text>
        </View>

        <Pressable onPress={() => router.push("/(rider)/(tabs)/profile")}>
          {user?.imageUrl ? (
            <Image
              source={{ uri: user.imageUrl }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
          ) : (
            <View className="h-10 w-10 items-center justify-center rounded-full bg-primary">
              <Text className="font-jakarta-extrabold text-base text-ink">{initial}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <View className="flex-row self-start rounded-full border border-divider bg-card mx-4 mb-4 p-1">
        {(["map", "list"] as const).map((option) => (
          <Pressable
            key={option}
            onPress={() => setView(option)}
            className={`rounded-full px-4 py-1.5 ${view === option ? "bg-ink" : ""}`}
          >
            <Text
              className={`font-jakarta-bold text-xs ${view === option ? "text-white" : "text-muted"}`}
            >
              {option === "map" ? "MAP VIEW" : "LIST VIEW"}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="mx-4 flex-1 items-center justify-center rounded-3xl border border-dashed border-divider bg-card">
        {view === "map" ? (
          <>
            <View className="h-14 w-14 items-center justify-center rounded-full bg-surface">
              <View className="h-3 w-3 rounded-full bg-accent" />
            </View>
            <Text className="mt-3 font-jakarta-bold text-sm text-muted">
              Map view — coming soon
            </Text>
          </>
        ) : (
          <Text className="font-jakarta-bold text-sm text-muted">List view — coming soon</Text>
        )}
      </View>

      <View className="p-4">
        <Pressable
          onPress={() => router.push("/(rider)/book")}
          className="h-14 flex-row items-center gap-3 rounded-full border border-divider bg-card px-5 shadow-sm"
        >
          <View className="h-2.5 w-2.5 rotate-45 bg-danger" />
          <Text className="font-jakarta-semibold text-base text-muted">Where are you going?</Text>
        </Pressable>
      </View>
    </View>
  );
}
