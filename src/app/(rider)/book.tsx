import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

import { useCreateRide } from "@/lib/useCreateRide";
import { useCurrentLocation } from "@/lib/useCurrentLocation";

// Flat placeholder — real fare needs real distance, which needs real
// dropoff coordinates (see the comment on dropoffLat/dropoffLng below).
const PLACEHOLDER_FARE = 90;

export default function BookRide() {
  const { driverId, driverName, dropoff } = useLocalSearchParams<{
    driverId?: string;
    driverName?: string;
    dropoff?: string;
  }>();
  const createRide = useCreateRide();
  const { address: pickupAddress, setAddress: setPickupAddress, coords: pickupCoords, loading: locating } =
    useCurrentLocation();
  // Lazy initializer, not a synced prop — a quick-destination chip sets
  // this once on navigation; typing afterward shouldn't get overwritten
  // by the param on every re-render.
  const [dropoffAddress, setDropoffAddress] = useState(() => dropoff ?? "");

  const canSubmit = pickupAddress.trim().length > 0 && dropoffAddress.trim().length > 0;

  function handleRequestRide() {
    createRide.mutate(
      {
        pickupAddress,
        pickupLat: pickupCoords?.lat ?? 0,
        pickupLng: pickupCoords?.lng ?? 0,
        // No address search/maps yet — dropoff is text-only for now, so
        // there's no real coordinate to store. A later phase (Google
        // Places or similar) replaces this with a real geocoded value.
        dropoffAddress,
        dropoffLat: 0,
        dropoffLng: 0,
        ...(driverId ? { driverId } : {}),
      },
      { onSuccess: (ride) => router.push(`/(rider)/ride/${ride.id}`) },
    );
  }

  return (
    <View className="flex-1 gap-6 bg-surface px-4 pt-20">
      <View className="gap-1">
        <Text className="font-jakarta-extrabold text-[28px] leading-9 tracking-tight text-ink">
          Where to?
        </Text>
        <Text className="font-jakarta-medium text-sm text-muted">
          Enter your pickup and drop-off to request a ride.
        </Text>
      </View>

      {driverName ? (
        <View className="flex-row items-center gap-2 rounded-2xl border border-divider bg-card px-4 py-3">
          <MaterialIcons name="electric-rickshaw" size={18} color="#008744" />
          <Text className="flex-1 font-jakarta-semibold text-sm text-ink">
            Requesting <Text className="font-jakarta-bold">{driverName}</Text> directly
          </Text>
        </View>
      ) : null}

      <View className="rounded-3xl border border-divider bg-card px-4 py-2 shadow-sm">
        <View className="flex-row items-center gap-3 py-3">
          <View className="h-2.5 w-2.5 rounded-full bg-accent" />
          <TextInput
            value={pickupAddress}
            onChangeText={setPickupAddress}
            placeholder={locating ? "Finding your location…" : "Pickup address"}
            placeholderTextColor="#6B7280"
            className="flex-1 font-jakarta-semibold text-base text-ink"
          />
          {locating && <ActivityIndicator size="small" color="#121212" />}
        </View>

        <View className="ml-[4.5px] h-4 border-l border-dashed border-divider" />

        <View className="h-px bg-divider" />

        <View className="flex-row items-center gap-3 py-3">
          <View className="h-2.5 w-2.5 rotate-45 bg-danger" />
          <TextInput
            value={dropoffAddress}
            onChangeText={setDropoffAddress}
            placeholder="Where are you going?"
            placeholderTextColor="#6B7280"
            className="flex-1 font-jakarta-semibold text-base text-ink"
          />
        </View>
      </View>

      <View className="flex-row items-center justify-between rounded-2xl border border-divider bg-card px-4 py-3">
        <Text className="font-jakarta-medium text-sm text-muted">Estimated fare</Text>
        <Text className="font-jakarta-extrabold text-2xl tracking-tight text-ink">
          ₹{PLACEHOLDER_FARE}
        </Text>
      </View>

      {createRide.isError && (
        <Text className="font-jakarta-medium text-sm text-danger">
          {createRide.error instanceof Error ? createRide.error.message : "Something went wrong."}
        </Text>
      )}

      <Pressable
        onPress={handleRequestRide}
        disabled={!canSubmit || createRide.isPending}
        className="h-14 items-center justify-center rounded-full bg-ink active:opacity-80 disabled:opacity-40"
      >
        {createRide.isPending ? (
          <ActivityIndicator color="#FFB800" />
        ) : (
          <Text className="font-jakarta-bold text-base tracking-wide text-white">
            REQUEST RIDE
          </Text>
        )}
      </Pressable>
    </View>
  );
}
