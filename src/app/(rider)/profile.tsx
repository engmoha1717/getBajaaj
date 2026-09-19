import { MaterialIcons } from "@expo/vector-icons";
import { useAuth, useUser } from "@clerk/expo";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { TabBarShell } from "@/components/TabBarShell";
import { useRideHistory } from "@/lib/useRideHistory";

export default function Profile() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { data: rides } = useRideHistory();

  const ridesTaken = (rides ?? []).filter((ride) => ride.status === "COMPLETED").length;

  const initial = (user?.firstName ?? user?.primaryEmailAddress?.emailAddress ?? "?")
    .charAt(0)
    .toUpperCase();

  return (
    <TabBarShell>
      <ScrollView className="flex-1 bg-surface pt-16" contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="mx-4 mb-3 flex-row items-center gap-4 rounded-2xl border border-divider bg-card p-4 shadow-sm">
          {user?.imageUrl ? (
            <Image source={{ uri: user.imageUrl }} style={{ width: 56, height: 56, borderRadius: 28 }} />
          ) : (
            <View className="h-14 w-14 items-center justify-center rounded-full bg-primary">
              <Text className="font-jakarta-extrabold text-xl text-ink">{initial}</Text>
            </View>
          )}
          <View className="flex-1">
            <Text className="font-jakarta-bold text-base text-ink" numberOfLines={1}>
              {user?.fullName || "Rider"}
            </Text>
            <Text className="font-jakarta-medium text-sm text-muted" numberOfLines={1}>
              {user?.primaryEmailAddress?.emailAddress}
            </Text>
          </View>
        </View>

        <View className="mx-4 mb-4 flex-row items-center justify-center gap-2 rounded-2xl border border-divider bg-card p-4 shadow-sm">
          <View className="h-8 w-8 items-center justify-center rounded-full bg-primary/20">
            <MaterialIcons name="electric-rickshaw" size={18} color="#7c5800" />
          </View>
          <View>
            <Text className="font-jakarta-extrabold text-lg text-ink">{ridesTaken}</Text>
            <Text className="font-jakarta-bold text-[10px] uppercase tracking-wider text-muted">
              Rides taken
            </Text>
          </View>
        </View>

        <View className="mx-4 mb-2 gap-1">
          <Text className="px-1 font-jakarta-bold text-[11px] uppercase tracking-wider text-muted">
            Account
          </Text>
          <View className="overflow-hidden rounded-2xl border border-divider bg-card shadow-sm">
            <Link href="/(rider)/become-driver" asChild>
              <Pressable className="flex-row items-center gap-3 p-4 active:opacity-70">
                <View className="h-10 w-10 items-center justify-center rounded-lg bg-surface">
                  <MaterialIcons name="badge" size={20} color="#121212" />
                </View>
                <View className="flex-1">
                  <Text className="font-jakarta-bold text-sm text-ink">Become a driver</Text>
                  <Text className="font-jakarta-medium text-xs text-muted">
                    Apply with your license and vehicle details
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#6B7280" />
              </Pressable>
            </Link>
            <View className="h-px bg-divider" />
            <Pressable
              onPress={() => signOut()}
              className="flex-row items-center gap-3 p-4 active:opacity-70"
            >
              <View className="h-10 w-10 items-center justify-center rounded-lg bg-surface">
                <MaterialIcons name="logout" size={20} color="#D9383A" />
              </View>
              <View className="flex-1">
                <Text className="font-jakarta-bold text-sm text-danger">Sign out</Text>
                <Text className="font-jakarta-medium text-xs text-muted">
                  Switch account or sign out of this phone
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#D9383A" />
            </Pressable>
          </View>
        </View>

        <Text className="mt-4 text-center font-jakarta-medium text-xs text-muted">
          RickshawGo • Made in Bengaluru
        </Text>
      </ScrollView>
    </TabBarShell>
  );
}
