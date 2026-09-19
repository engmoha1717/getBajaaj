import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Linking, Pressable, ScrollView, Share, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

import { SearchRadar } from "@/components/SearchRadar";
import { useCancelRide } from "@/lib/useCancelRide";
import { useNearbyDrivers } from "@/lib/useNearbyDrivers";
import { useRateRide } from "@/lib/useRateRide";
import { useRide } from "@/lib/useRide";

const STATUS_LABEL: Record<string, string> = {
  REQUESTED: "Looking for a driver…",
  ACCEPTED: "Driver on the way",
  IN_PROGRESS: "Ride in progress",
  COMPLETED: "Ride completed",
  CANCELLED: "Ride cancelled",
};

const FLAT_FARE = 90;

export default function RideStatus() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: ride, isLoading } = useRide(id);
  const cancelRide = useCancelRide(id);
  const rateRide = useRateRide(id);
  const [selectedScore, setSelectedScore] = useState(0);

  // Real count of online drivers near the pickup point, not the
  // mockup's fabricated "8 verified drivers" — reuses the same
  // nearby-drivers query Rider Home uses.
  const { data: nearbyDrivers } = useNearbyDrivers(
    ride ? { lat: ride.pickupLat, lng: ride.pickupLng } : null,
  );

  if (isLoading || !ride) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color="#121212" />
      </View>
    );
  }

  if (ride.status === "CANCELLED") {
    return (
      <View className="flex-1 items-center justify-center gap-6 bg-surface px-6">
        <Text className="font-jakarta-extrabold text-2xl text-ink">Ride cancelled</Text>
        <Pressable
          onPress={() => router.replace("/(rider)")}
          className="h-14 items-center justify-center rounded-full bg-primary px-8 active:opacity-80"
        >
          <Text className="font-jakarta-bold text-base text-ink">Request another ride</Text>
        </Pressable>
      </View>
    );
  }

  const hasDriverLocation = ride.driver?.lastLat != null && ride.driver?.lastLng != null;
  const isEnRoute = ride.status === "ACCEPTED" || ride.status === "IN_PROGRESS";

  return (
    <View className="flex-1 bg-surface">
      <View className="flex-row items-center gap-3 px-4 pb-3 pt-16">
        <Pressable
          onPress={() => router.canGoBack() && router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-card active:opacity-70"
        >
          <MaterialIcons name="arrow-back" size={20} color="#121212" />
        </Pressable>
        <Text className="font-jakarta-bold text-base text-ink">Ride status</Text>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
        <View className="items-center gap-3 py-4">
          {ride.status === "REQUESTED" && <SearchRadar />}
          <Text className="font-jakarta-extrabold text-xl text-ink">
            {STATUS_LABEL[ride.status] ?? ride.status}
          </Text>
          {ride.status === "REQUESTED" ? (
            <Text className="font-jakarta-medium text-sm text-muted">
              {nearbyDrivers?.length
                ? `Contacting ${nearbyDrivers.length} driver${nearbyDrivers.length === 1 ? "" : "s"} near your pickup`
                : "Searching for drivers near your pickup…"}
            </Text>
          ) : null}
        </View>

        {ride.status === "REQUESTED" ? (
          <View className="flex-row items-center gap-2 rounded-xl bg-accent/10 px-4 py-3">
            <MaterialIcons name="verified" size={18} color="#008744" />
            <Text className="flex-1 font-jakarta-semibold text-xs text-accent">
              Zero Surge • 100% Direct Driver Fare
            </Text>
          </View>
        ) : null}

        {ride.status === "ACCEPTED" && ride.startOtp ? (
          <View className="items-center gap-2 rounded-2xl border border-divider bg-card px-6 py-4 shadow-sm">
            <Text className="font-jakarta-bold text-[10px] uppercase tracking-wider text-muted">
              Give this code to {ride.driver?.user.name ?? "your driver"}
            </Text>
            <Text className="font-jakarta-extrabold text-4xl tracking-[10px] text-ink">
              {ride.startOtp}
            </Text>
            <Text className="font-jakarta-medium text-xs text-muted">
              Share only once you're seated in the auto
            </Text>
          </View>
        ) : null}

        {isEnRoute && ride.driver ? (
          <View className="gap-3 rounded-2xl border border-divider bg-card p-4 shadow-sm">
            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-primary">
                <Text className="font-jakarta-extrabold text-lg text-ink">
                  {ride.driver.user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-jakarta-bold text-base text-ink" numberOfLines={1}>
                  {ride.driver.user.name}
                </Text>
                <Text className="font-jakarta-medium text-xs text-muted" numberOfLines={1}>
                  {ride.driver.vehicleMake} {ride.driver.vehicleModel}
                </Text>
                <View className="mt-1 self-start rounded bg-primary px-1.5 py-0.5">
                  <Text className="font-jakarta-extrabold text-[10px] tracking-wider text-ink">
                    {ride.driver.vehiclePlate}
                  </Text>
                </View>
              </View>
              {ride.driver.user.phone ? (
                <Pressable
                  onPress={() => Linking.openURL(`tel:${ride.driver!.user.phone}`)}
                  className="h-11 w-11 items-center justify-center rounded-full bg-surface active:opacity-70"
                >
                  <MaterialIcons name="call" size={20} color="#008744" />
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : null}

        {isEnRoute && hasDriverLocation ? (
          <View className="h-48 overflow-hidden rounded-2xl border border-divider">
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

        <View className="gap-2 rounded-2xl border border-divider bg-card p-4 shadow-sm">
          <View className="flex-row items-start gap-2">
            <MaterialIcons name="trip-origin" size={16} color="#008744" />
            <Text className="flex-1 font-jakarta-semibold text-sm text-ink">
              {ride.pickupAddress}
            </Text>
          </View>
          <View className="ml-2 h-3 w-px bg-divider" />
          <View className="flex-row items-start gap-2">
            <MaterialIcons name="location-on" size={16} color="#D9383A" />
            <Text className="flex-1 font-jakarta-semibold text-sm text-ink">
              {ride.dropoffAddress}
            </Text>
          </View>
        </View>

        {isEnRoute ? (
          <View className="flex-row items-center justify-between rounded-2xl border border-divider bg-card px-4 py-3 shadow-sm">
            <View>
              <Text className="font-jakarta-bold text-[10px] uppercase tracking-wider text-muted">
                Fare
              </Text>
              <Text className="font-jakarta-extrabold text-2xl text-ink">₹{FLAT_FARE}</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <MaterialIcons name="payments" size={16} color="#008744" />
              <Text className="font-jakarta-semibold text-sm text-ink">UPI / Cash to driver</Text>
            </View>
          </View>
        ) : null}

        {isEnRoute ? (
          <Pressable
            onPress={() =>
              Share.share({
                message: `I'm on my way via RickshawGo with ${ride.driver?.user.name ?? "my driver"} (${ride.driver?.vehiclePlate ?? ""}). Pickup: ${ride.pickupAddress}. Drop-off: ${ride.dropoffAddress}.`,
              }).catch(() => {})
            }
            className="h-12 flex-row items-center justify-center gap-2 rounded-full border border-divider bg-card active:opacity-70"
          >
            <MaterialIcons name="ios-share" size={16} color="#121212" />
            <Text className="font-jakarta-bold text-sm text-ink">Share ride details</Text>
          </Pressable>
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
              <Text className="font-jakarta-medium text-xs text-muted">You rated this ride</Text>
            </View>
          ) : (
            <View className="items-center gap-3 rounded-2xl border border-divider bg-card px-6 py-5 shadow-sm">
              <Text className="font-jakarta-bold text-sm text-ink">
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
                <Text className="font-jakarta-medium text-xs text-danger">
                  {rateRide.error instanceof Error
                    ? rateRide.error.message
                    : "Something went wrong."}
                </Text>
              ) : null}
              <Pressable
                onPress={() => rateRide.mutate(selectedScore)}
                disabled={selectedScore === 0 || rateRide.isPending}
                style={selectedScore === 0 || rateRide.isPending ? { opacity: 0.4 } : undefined}
                className="h-12 w-full items-center justify-center rounded-full bg-primary"
              >
                <Text className="font-jakarta-bold text-sm text-ink">
                  {rateRide.isPending ? "Submitting…" : "Submit rating"}
                </Text>
              </Pressable>
            </View>
          )
        ) : null}

        {ride.status === "REQUESTED" && (
          <Pressable
            onPress={() => cancelRide.mutate()}
            disabled={cancelRide.isPending}
            style={cancelRide.isPending ? { opacity: 0.4 } : undefined}
            className="h-14 items-center justify-center rounded-full border border-divider bg-card active:opacity-70"
          >
            <Text className="font-jakarta-bold text-base text-ink">
              {cancelRide.isPending ? "Cancelling…" : "Cancel ride"}
            </Text>
          </Pressable>
        )}

        {ride.status === "COMPLETED" && (
          <Pressable
            onPress={() => router.replace("/(rider)")}
            className="h-14 items-center justify-center rounded-full bg-primary active:opacity-80"
          >
            <Text className="font-jakarta-bold text-base text-ink">Book another ride</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}
