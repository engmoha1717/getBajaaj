import { useAuth } from "@clerk/expo";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

import { useCreateRide } from "@/lib/useCreateRide";

// Flat placeholder — real fare needs real distance, which needs real
// dropoff coordinates (see the comment on dropoffLat/dropoffLng below).
const PLACEHOLDER_FARE = 90;

export default function RiderHome() {
  const { signOut } = useAuth();
  const createRide = useCreateRide();

  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(true);
  const [dropoffAddress, setDropoffAddress] = useState("");

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocating(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = position.coords;
      setPickupCoords({ lat: latitude, lng: longitude });

      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (place) {
        const parts = [place.name, place.street, place.city].filter(Boolean);
        setPickupAddress(parts.join(", "));
      }
      setLocating(false);
    })();
  }, []);

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
      },
      { onSuccess: (ride) => router.push(`/(rider)/ride/${ride.id}`) },
    );
  }

  return (
    <View className="flex-1 gap-6 bg-white px-6 pt-20 dark:bg-neutral-950">
      <View className="gap-1">
        <Text className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
          Where to?
        </Text>
        <Text className="text-base text-neutral-500 dark:text-neutral-400">
          Enter your pickup and drop-off to request a ride.
        </Text>
      </View>

      <View className="gap-3">
        <View className="gap-1.5">
          <Text className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            Pickup
          </Text>
          <View className="flex-row items-center gap-2 rounded-2xl border border-neutral-200 px-4 py-3 dark:border-neutral-800">
            {locating && <ActivityIndicator size="small" />}
            <TextInput
              value={pickupAddress}
              onChangeText={setPickupAddress}
              placeholder={locating ? "Finding your location…" : "Pickup address"}
              placeholderTextColor="#9ca3af"
              className="flex-1 text-base text-neutral-900 dark:text-neutral-50"
            />
          </View>
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            Drop-off
          </Text>
          <View className="rounded-2xl border border-neutral-200 px-4 py-3 dark:border-neutral-800">
            <TextInput
              value={dropoffAddress}
              onChangeText={setDropoffAddress}
              placeholder="Where are you going?"
              placeholderTextColor="#9ca3af"
              className="text-base text-neutral-900 dark:text-neutral-50"
            />
          </View>
        </View>
      </View>

      <View className="flex-row items-center justify-between rounded-2xl bg-neutral-100 px-4 py-3 dark:bg-neutral-900">
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">Estimated fare</Text>
        <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
          ₹{PLACEHOLDER_FARE}
        </Text>
      </View>

      {createRide.isError && (
        <Text className="text-sm text-red-600 dark:text-red-400">
          {createRide.error instanceof Error ? createRide.error.message : "Something went wrong."}
        </Text>
      )}

      <Pressable
        onPress={handleRequestRide}
        disabled={!canSubmit || createRide.isPending}
        className="rounded-full bg-[#FFB800] px-8 py-4 active:opacity-80 disabled:opacity-40"
      >
        {createRide.isPending ? (
          <ActivityIndicator color="#271900" />
        ) : (
          <Text className="text-center text-base font-semibold text-[#271900]">
            Request ride
          </Text>
        )}
      </Pressable>

      <Pressable onPress={() => signOut()} className="items-center py-2">
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">Sign out</Text>
      </Pressable>
    </View>
  );
}
