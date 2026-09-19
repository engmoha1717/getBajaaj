import { MaterialIcons } from "@expo/vector-icons";
import { useUser } from "@clerk/expo";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { TabBarShell } from "@/components/TabBarShell";
import { useCurrentLocation } from "@/lib/useCurrentLocation";

export default function RiderHome() {
  const { user } = useUser();
  const { address, loading } = useCurrentLocation();
  // Driven by a route param, not useState — every setState-triggered
  // re-render of this screen crashed with "Couldn't find a navigation
  // context" on iOS (confirmed not fixable via explicit Stack.Screen,
  // <Slot> instead of <Tabs>, flattening the nested tabs group,
  // updating expo-router, or disabling react-native-screens' freeze
  // optimization — five separate structural fixes, same crash every
  // time). router.setParams() re-renders this screen through
  // expo-router's own update path instead of a local setState call,
  // sidestepping whatever that specific trigger is entirely.
  const { view: viewParam } = useLocalSearchParams<{ view?: string }>();
  const view = viewParam === "list" ? "list" : "map";

  const initial = (user?.firstName ?? user?.primaryEmailAddress?.emailAddress ?? "?")
    .charAt(0)
    .toUpperCase();

  return (
    <TabBarShell>
      <View className="flex-1 bg-surface">
        <View className="flex-row items-center justify-between gap-3 px-4 pb-3 pt-16">
          <View className="flex-1 flex-row items-center gap-3">
            <Image
              source={require("../../../assets/images/rickshaw-logo.png")}
              style={{ width: 32, height: 32, borderRadius: 8 }}
            />
            <View className="flex-1">
              <View className="flex-row items-center gap-1.5">
                <Text className="font-jakarta-bold text-base text-ink">RickshawGo</Text>
                <View className="rounded-full bg-primary px-2 py-0.5">
                  <Text className="font-jakarta-extrabold text-[10px] tracking-wider text-ink">
                    BLR
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center gap-1">
                <MaterialIcons name="location-on" size={13} color="#008744" />
                <Text numberOfLines={1} className="flex-1 font-jakarta-medium text-xs text-muted">
                  {loading ? "Finding you…" : address || "Location unavailable"}
                </Text>
              </View>
            </View>
          </View>

          <Pressable onPress={() => router.push("/(rider)/profile")}>
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

        <View className="mx-4 mb-4 flex-row rounded-full border border-divider bg-card p-1">
          {(["map", "list"] as const).map((option) => (
            <Pressable
              key={option}
              onPress={() => router.setParams({ view: option })}
              className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-full py-2 ${
                view === option ? "bg-surface shadow-sm" : ""
              }`}
            >
              <MaterialIcons
                name={option === "map" ? "map" : "format-list-bulleted"}
                size={16}
                color={view === option ? "#121212" : "#6B7280"}
              />
              <Text
                className={`font-jakarta-bold text-xs ${view === option ? "text-ink" : "text-muted"}`}
              >
                {option === "map" ? "Map View" : "List View"}
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
            <View className="items-center px-8">
              <View className="h-14 w-14 items-center justify-center rounded-full bg-surface">
                <MaterialIcons name="electric-rickshaw" size={24} color="#6B7280" />
              </View>
              <Text className="mt-3 font-jakarta-bold text-sm text-muted">
                No drivers nearby yet
              </Text>
              <Text className="mt-1 text-center font-jakarta-medium text-xs text-muted">
                We're still onboarding drivers in your area — check back soon.
              </Text>
            </View>
          )}
        </View>

        <View className="p-4">
          <Pressable
            onPress={() => router.push("/(rider)/book")}
            className="flex-row items-center rounded-2xl border border-divider bg-card px-4 py-3 shadow-sm"
          >
            <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-primary">
              <MaterialIcons name="near-me" size={18} color="#121212" />
            </View>
            <View className="flex-1">
              <Text className="font-jakarta-bold text-[10px] uppercase tracking-wider text-muted">
                Destination
              </Text>
              <Text className="font-jakarta-bold text-base text-ink">Where to in Bengaluru?</Text>
            </View>
            <View className="ml-1 h-10 w-10 items-center justify-center rounded-full bg-surface">
              <MaterialIcons name="mic" size={18} color="#6B7280" />
            </View>
          </Pressable>
        </View>
      </View>
    </TabBarShell>
  );
}
