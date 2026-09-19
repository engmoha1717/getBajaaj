import { MaterialIcons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";

import { DriverTabBarShell } from "@/components/DriverTabBarShell";
import { useMyRides } from "@/lib/useMyRides";

export default function DriverEarnings() {
  const { data: rides, isLoading } = useMyRides(true);

  const total = (rides ?? []).reduce((sum, ride) => sum + Number(ride.fare ?? 0), 0);
  const tripCount = rides?.length ?? 0;

  const today = new Date().toDateString();
  const todayTotal = (rides ?? [])
    .filter((ride) => new Date(ride.completedAt).toDateString() === today)
    .reduce((sum, ride) => sum + Number(ride.fare ?? 0), 0);

  return (
    <DriverTabBarShell>
      <ScrollView className="flex-1 bg-surface pt-16" contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="px-4 pb-3">
          <Text className="font-jakarta-extrabold text-2xl text-ink">Earnings</Text>
          <Text className="font-jakarta-medium text-sm text-muted">
            Zero commission — 100% of the fare is yours.
          </Text>
        </View>

        <View className="mx-4 gap-4 rounded-2xl bg-ink p-5 shadow-sm">
          <Text className="font-jakarta-bold text-[11px] uppercase tracking-wider text-white/60">
            Today's earnings
          </Text>
          <Text className="font-jakarta-extrabold text-4xl text-white">₹{todayTotal}</Text>
          <View className="flex-row gap-3">
            <View className="flex-1 rounded-xl bg-white/10 p-3">
              <Text className="font-jakarta-bold text-[10px] uppercase text-white/60">
                All-time
              </Text>
              <Text className="font-jakarta-extrabold text-lg text-primary">₹{total}</Text>
            </View>
            <View className="flex-1 rounded-xl bg-white/10 p-3">
              <Text className="font-jakarta-bold text-[10px] uppercase text-white/60">Trips</Text>
              <Text className="font-jakarta-extrabold text-lg text-white">{tripCount}</Text>
            </View>
          </View>
        </View>

        <View className="mx-4 mt-4 flex-row items-center gap-3 rounded-2xl border border-divider bg-card p-4 shadow-sm">
          <View className="h-9 w-9 items-center justify-center rounded-full bg-accent/10">
            <MaterialIcons name="handshake" size={18} color="#008744" />
          </View>
          <View className="flex-1">
            <Text className="font-jakarta-bold text-sm text-ink">Zero commission guarantee</Text>
            <Text className="font-jakarta-medium text-xs text-muted">
              Bank payouts aren't set up yet — this is a running total, not a transferable
              balance.
            </Text>
          </View>
        </View>

        {!isLoading && rides?.length ? (
          <View className="mx-4 mt-4 gap-2">
            <Text className="font-jakarta-bold text-sm text-ink">Recent trips</Text>
            {rides.slice(0, 5).map((ride) => (
              <View
                key={ride.id}
                className="flex-row items-center justify-between rounded-2xl border border-divider bg-card p-4 shadow-sm"
              >
                <Text className="flex-1 font-jakarta-semibold text-sm text-ink" numberOfLines={1}>
                  {ride.pickupAddress} → {ride.dropoffAddress}
                </Text>
                <Text className="font-jakarta-extrabold text-sm text-accent">
                  ₹{ride.fare ?? "—"}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </DriverTabBarShell>
  );
}
