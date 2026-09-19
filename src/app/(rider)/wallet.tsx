import { MaterialIcons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";

import { TabBarShell } from "@/components/TabBarShell";
import { useRideHistory } from "@/lib/useRideHistory";

export default function Wallet() {
  const { data: rides, isLoading } = useRideHistory();

  const completedRides = (rides ?? []).filter((ride) => ride.status === "COMPLETED");
  const totalSpent = completedRides.reduce((sum, ride) => sum + Number(ride.fare ?? 0), 0);

  return (
    <TabBarShell>
      <ScrollView className="flex-1 bg-surface pt-16" contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="px-4 pb-3">
          <Text className="font-jakarta-extrabold text-2xl text-ink">Wallet</Text>
          <Text className="font-jakarta-medium text-sm text-muted">Pay via UPI or cash to your driver</Text>
        </View>

        <View className="mx-4 gap-1 rounded-2xl bg-ink p-5 shadow-sm">
          <Text className="font-jakarta-bold text-[11px] uppercase tracking-wider text-white/60">
            Total spent
          </Text>
          <Text className="font-jakarta-extrabold text-4xl text-white">
            {isLoading ? "…" : `₹${totalSpent}`}
          </Text>
          <Text className="font-jakarta-medium text-xs text-white/60">
            {completedRides.length} completed ride{completedRides.length === 1 ? "" : "s"}
          </Text>
        </View>

        <View className="mx-4 mt-4 flex-row items-center gap-3 rounded-2xl border border-divider bg-card p-4 shadow-sm">
          <View className="h-9 w-9 items-center justify-center rounded-full bg-accent/10">
            <MaterialIcons name="account-balance-wallet" size={18} color="#008744" />
          </View>
          <View className="flex-1">
            <Text className="font-jakarta-bold text-sm text-ink">No saved payment method yet</Text>
            <Text className="font-jakarta-medium text-xs text-muted">
              Every ride is paid directly to your driver — cash or UPI. There's no in-app
              balance to top up.
            </Text>
          </View>
        </View>
      </ScrollView>
    </TabBarShell>
  );
}
