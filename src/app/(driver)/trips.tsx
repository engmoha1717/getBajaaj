import { MaterialIcons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";

import { DriverTabBarShell } from "@/components/DriverTabBarShell";
import { useMyRides } from "@/lib/useMyRides";

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function DriverTrips() {
  const { data: rides, isLoading } = useMyRides(true);

  return (
    <DriverTabBarShell>
      <View className="flex-1 bg-surface pt-16">
        <View className="px-4 pb-3">
          <Text className="font-jakarta-extrabold text-2xl text-ink">Trips</Text>
          <Text className="font-jakarta-medium text-sm text-muted">
            Your completed ride history
          </Text>
        </View>

        {isLoading ? (
          <Text className="px-4 font-jakarta-medium text-sm text-muted">Loading…</Text>
        ) : !rides?.length ? (
          <View className="flex-1 items-center justify-center gap-2 px-8">
            <MaterialIcons name="receipt-long" size={22} color="#6B7280" />
            <Text className="text-center font-jakarta-medium text-sm text-muted">
              No completed trips yet.
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1 px-4"
            contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
          >
            {rides.map((ride) => (
              <View
                key={ride.id}
                className="gap-2 rounded-2xl border border-divider bg-card p-4 shadow-sm"
              >
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1 flex-row items-center gap-2">
                    <View className="h-9 w-9 items-center justify-center rounded-lg bg-surface">
                      <MaterialIcons name="local-taxi" size={18} color="#121212" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-jakarta-bold text-sm text-ink" numberOfLines={1}>
                        {ride.pickupAddress} → {ride.dropoffAddress}
                      </Text>
                      <Text className="font-jakarta-medium text-xs text-muted">
                        {timeAgo(ride.completedAt)}
                      </Text>
                    </View>
                  </View>
                  <Text className="font-jakarta-extrabold text-base text-accent">
                    ₹{ride.fare ?? "—"}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </DriverTabBarShell>
  );
}
