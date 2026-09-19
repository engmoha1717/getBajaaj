import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

import { SearchRadar } from "@/components/SearchRadar";
import { useCancelRide } from "@/lib/useCancelRide";
import { useRateRide } from "@/lib/useRateRide";
import { useRide } from "@/lib/useRide";

const STATUS_LABEL: Record<string, string> = {
  REQUESTED: "Looking for a driver…",
  ACCEPTED: "Driver on the way",
  IN_PROGRESS: "Ride in progress",
  COMPLETED: "Ride completed",
  CANCELLED: "Ride cancelled",
};

export default function RideStatus() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: ride, isLoading } = useRide(id);
  const cancelRide = useCancelRide(id);
  const rateRide = useRateRide(id);
  const [selectedScore, setSelectedScore] = useState(0);

  if (isLoading || !ride) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-950">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (ride.status === "CANCELLED") {
    return (
      <View className="flex-1 items-center justify-center gap-6 bg-white px-6 dark:bg-neutral-950">
        <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          Ride cancelled
        </Text>
        <Pressable
          onPress={() => router.replace("/(rider)")}
          className="rounded-full bg-[#FFB800] px-8 py-4 active:opacity-80"
        >
          <Text className="text-base font-semibold text-[#271900]">Request another ride</Text>
        </Pressable>
      </View>
    );
  }

  const hasDriverLocation =
    ride.driver?.lastLat != null && ride.driver?.lastLng != null;

  return (
    <View className="flex-1 justify-between bg-white px-6 pt-24 pb-10 dark:bg-neutral-950">
      <View className="items-center gap-4">
        {ride.status === "REQUESTED" && <SearchRadar />}
        <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          {STATUS_LABEL[ride.status] ?? ride.status}
        </Text>
      </View>

      {ride.status === "ACCEPTED" && ride.startOtp ? (
        <View className="items-center gap-2 rounded-2xl bg-[#FFFDF5] px-6 py-4">
          <Text className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Give this code to {ride.driver?.user.name ?? "your driver"}
          </Text>
          <Text className="text-4xl font-extrabold tracking-[10px] text-[#121212]">
            {ride.startOtp}
          </Text>
        </View>
      ) : null}

      {ride.status === "COMPLETED" ? (
        ride.rating ? (
          <View className="items-center gap-1">
            <View className="flex-row gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <MaterialIcons
                  key={n}
                  name={n <= ride.rating!.score ? "star" : "star-border"}
                  size={20}
                  color="#FFB800"
                />
              ))}
            </View>
            <Text className="text-xs text-neutral-500 dark:text-neutral-400">
              You rated this ride
            </Text>
          </View>
        ) : (
          <View className="items-center gap-3 rounded-2xl bg-neutral-50 px-6 py-5 dark:bg-neutral-900">
            <Text className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
              Rate {ride.driver?.user.name ?? "your driver"}
            </Text>
            <View className="flex-row gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <Pressable key={n} onPress={() => setSelectedScore(n)}>
                  <MaterialIcons
                    name={n <= selectedScore ? "star" : "star-border"}
                    size={32}
                    color="#FFB800"
                  />
                </Pressable>
              ))}
            </View>
            {rateRide.isError ? (
              <Text className="text-xs text-red-500">
                {rateRide.error instanceof Error ? rateRide.error.message : "Something went wrong."}
              </Text>
            ) : null}
            <Pressable
              onPress={() => rateRide.mutate(selectedScore)}
              disabled={selectedScore === 0 || rateRide.isPending}
              className="w-full items-center rounded-full bg-[#FFB800] py-3 active:opacity-80 disabled:opacity-40"
            >
              <Text className="font-semibold text-[#271900]">
                {rateRide.isPending ? "Submitting…" : "Submit rating"}
              </Text>
            </Pressable>
          </View>
        )
      ) : null}

      {(ride.status === "ACCEPTED" || ride.status === "IN_PROGRESS") && hasDriverLocation ? (
        <View className="h-48 overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <MapView
            className="flex-1"
            region={{
              latitude: ride.driver!.lastLat!,
              longitude: ride.driver!.lastLng!,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
          >
            <Marker
              coordinate={{ latitude: ride.driver!.lastLat!, longitude: ride.driver!.lastLng! }}
              title={ride.driver?.user.name}
              pinColor="#008744"
            />
          </MapView>
        </View>
      ) : null}

      <View className="gap-3 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
        <View className="gap-0.5">
          <Text className="text-xs font-medium text-neutral-400">Pickup</Text>
          <Text className="text-base text-neutral-900 dark:text-neutral-50">
            {ride.pickupAddress}
          </Text>
        </View>
        <View className="gap-0.5">
          <Text className="text-xs font-medium text-neutral-400">Drop-off</Text>
          <Text className="text-base text-neutral-900 dark:text-neutral-50">
            {ride.dropoffAddress}
          </Text>
        </View>
      </View>

      {ride.status === "REQUESTED" && (
        <Pressable
          onPress={() => cancelRide.mutate()}
          disabled={cancelRide.isPending}
          className="rounded-full border border-neutral-300 px-8 py-4 active:opacity-70 disabled:opacity-40 dark:border-neutral-700"
        >
          <Text className="text-center text-base font-semibold text-neutral-900 dark:text-neutral-50">
            {cancelRide.isPending ? "Cancelling…" : "Cancel ride"}
          </Text>
        </Pressable>
      )}

      {ride.status === "COMPLETED" && (
        <Pressable
          onPress={() => router.replace("/(rider)")}
          className="rounded-full bg-[#FFB800] px-8 py-4 active:opacity-80"
        >
          <Text className="text-center text-base font-semibold text-[#271900]">
            Book another ride
          </Text>
        </Pressable>
      )}
    </View>
  );
}
