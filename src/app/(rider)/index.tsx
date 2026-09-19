import { MaterialIcons } from "@expo/vector-icons";
import { useUser } from "@clerk/expo";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useRef } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

import { TabBarShell } from "@/components/TabBarShell";
import { useCurrentLocation } from "@/lib/useCurrentLocation";
import { useNearbyDrivers } from "@/lib/useNearbyDrivers";

export default function RiderHome() {
  const { user } = useUser();
  const { address, loading, coords, refresh: refreshLocation } = useCurrentLocation();
  const { data: drivers, isLoading: driversLoading } = useNearbyDrivers(coords);
  const showLoading = loading || driversLoading;
  const mapRef = useRef<MapView>(null);
  // Driven by a route param rather than useState so the view choice
  // survives back/forward navigation and deep links.
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
              <Pressable
                onPress={() => refreshLocation()}
                disabled={loading}
                className="flex-row items-center gap-1 active:opacity-60"
              >
                <MaterialIcons name="location-on" size={13} color="#008744" />
                <Text numberOfLines={1} className="flex-1 font-jakarta-medium text-xs text-muted">
                  {loading ? "Finding you…" : address || "Tap to set your location"}
                </Text>
                <MaterialIcons name="refresh" size={13} color="#6B7280" />
              </Pressable>
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

        <Pressable
          onPress={() => router.push("/(rider)/book")}
          className="mx-4 mb-3 flex-row items-center rounded-2xl border border-divider bg-card px-4 py-3 shadow-sm"
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

        <View className="mx-4 mb-4 flex-row rounded-full border border-divider bg-card p-1">
          {(["map", "list"] as const).map((option) => (
            <Pressable
              key={option}
              onPress={() => router.setParams({ view: option })}
              className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-full py-2 ${
                view === option ? "bg-surface" : ""
              }`}
              // Toggling NativeWind's `shadow-sm` class conditionally is a known
              // trigger for the "Couldn't find a navigation context" crash (its
              // runtime CSS parsing races React Navigation's context init) —
              // https://github.com/nativewind/nativewind/issues/1557. Applying
              // the shadow as a plain RN style sidesteps that class-interop path.
              style={
                view === option
                  ? {
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }
                  : undefined
              }
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

        {view === "map" ? (
          coords ? (
            <View className="mx-4 flex-1 overflow-hidden rounded-3xl border border-divider">
              <MapView
                ref={mapRef}
                className="flex-1"
                showsUserLocation
                initialRegion={{
                  latitude: coords.lat,
                  longitude: coords.lng,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
              >
                {(drivers ?? []).map((driver) => (
                  <Marker
                    key={driver.id}
                    coordinate={{ latitude: driver.lat, longitude: driver.lng }}
                    title={driver.name}
                    description={`${driver.vehicleMake} ${driver.vehicleModel} — ${driver.distanceKm.toFixed(1)} km`}
                    onCalloutPress={() =>
                      router.push({
                        pathname: "/(rider)/book",
                        params: { driverId: driver.id, driverName: driver.name },
                      })
                    }
                  />
                ))}
              </MapView>

              <Pressable
                onPress={async () => {
                  const fresh = await refreshLocation();
                  if (fresh) {
                    mapRef.current?.animateToRegion({
                      latitude: fresh.lat,
                      longitude: fresh.lng,
                      latitudeDelta: 0.05,
                      longitudeDelta: 0.05,
                    });
                  }
                }}
                className="absolute right-3 top-3 h-11 w-11 items-center justify-center rounded-full bg-card shadow-md active:opacity-70"
              >
                <MaterialIcons name="my-location" size={20} color="#008744" />
              </Pressable>

              <View className="absolute bottom-3 left-3 flex-row items-center gap-1.5 rounded-full bg-card px-3 py-1.5 shadow-sm">
                <View className="h-2 w-2 rounded-full bg-accent" />
                <Text className="font-jakarta-bold text-[11px] text-ink">
                  {drivers?.length ?? 0} verified auto{drivers?.length === 1 ? "" : "s"} nearby
                </Text>
              </View>
            </View>
          ) : (
            <View className="mx-4 flex-1 items-center justify-center rounded-3xl border border-dashed border-divider bg-card">
              <View className="h-14 w-14 items-center justify-center rounded-full bg-surface">
                <MaterialIcons name="my-location" size={24} color="#6B7280" />
              </View>
              <Text className="mt-3 font-jakarta-bold text-sm text-muted">
                Finding your location…
              </Text>
            </View>
          )
        ) : showLoading ? (
          <View className="mx-4 flex-1 items-center justify-center rounded-3xl border border-dashed border-divider bg-card">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-surface">
              <MaterialIcons name="electric-rickshaw" size={24} color="#6B7280" />
            </View>
            <Text className="mt-3 font-jakarta-bold text-sm text-muted">
              Finding drivers nearby…
            </Text>
          </View>
        ) : !drivers?.length ? (
          <View className="mx-4 flex-1 items-center justify-center rounded-3xl border border-dashed border-divider bg-card">
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
        ) : (
          <ScrollView className="mx-4 flex-1" contentContainerStyle={{ gap: 12 }}>
            {drivers.map((driver) => (
              <Pressable
                key={driver.id}
                onPress={() =>
                  router.push({
                    pathname: "/(rider)/book",
                    params: { driverId: driver.id, driverName: driver.name },
                  })
                }
                className="flex-row items-center gap-3 rounded-2xl border border-divider bg-card px-4 py-3 active:opacity-70"
              >
                <View className="h-10 w-10 items-center justify-center rounded-full bg-surface">
                  <MaterialIcons name="electric-rickshaw" size={20} color="#008744" />
                </View>
                <View className="flex-1">
                  <Text className="font-jakarta-bold text-sm text-ink">{driver.name}</Text>
                  <Text className="font-jakarta-medium text-xs text-muted">
                    {driver.vehicleMake} {driver.vehicleModel}
                  </Text>
                </View>
                <Text className="font-jakarta-bold text-xs text-muted">
                  {driver.distanceKm.toFixed(1)} km
                </Text>
                <MaterialIcons name="chevron-right" size={20} color="#6B7280" />
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </TabBarShell>
  );
}
