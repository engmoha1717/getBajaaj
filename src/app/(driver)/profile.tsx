import { useAuth, useUser } from "@clerk/expo";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

import { DriverTabBarShell } from "@/components/DriverTabBarShell";
import { useMyDriverProfile } from "@/lib/useMyDriverProfile";

export default function DriverProfile() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { data: profile } = useMyDriverProfile();

  const initial = (user?.firstName ?? user?.primaryEmailAddress?.emailAddress ?? "?")
    .charAt(0)
    .toUpperCase();

  return (
    <DriverTabBarShell>
      <View className="flex-1 gap-6 bg-surface px-6 pt-20">
        <View className="items-center gap-3">
          {user?.imageUrl ? (
            <Image
              source={{ uri: user.imageUrl }}
              style={{ width: 72, height: 72, borderRadius: 36 }}
            />
          ) : (
            <View className="h-[72px] w-[72px] items-center justify-center rounded-full bg-primary">
              <Text className="font-jakarta-extrabold text-2xl text-ink">{initial}</Text>
            </View>
          )}
          <View className="items-center gap-0.5">
            <Text className="font-jakarta-bold text-lg text-ink">{user?.fullName || "Driver"}</Text>
            <Text className="font-jakarta-medium text-sm text-muted">
              {user?.primaryEmailAddress?.emailAddress}
            </Text>
          </View>
        </View>

        <View className="gap-3 rounded-2xl border border-divider bg-card p-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <Text className="font-jakarta-medium text-sm text-muted">Vehicle</Text>
            <Text className="font-jakarta-bold text-sm text-ink">
              {profile?.vehicleMake} {profile?.vehicleModel}
            </Text>
          </View>
          <View className="h-px bg-divider" />
          <View className="flex-row items-center justify-between">
            <Text className="font-jakarta-medium text-sm text-muted">Plate</Text>
            <Text className="font-jakarta-bold text-sm text-ink">{profile?.vehiclePlate}</Text>
          </View>
          <View className="h-px bg-divider" />
          <View className="flex-row items-center justify-between">
            <Text className="font-jakarta-medium text-sm text-muted">Status</Text>
            <Text className="font-jakarta-bold text-sm text-accent">{profile?.status}</Text>
          </View>
        </View>

        <Pressable
          onPress={() => signOut()}
          className="h-14 items-center justify-center rounded-full border border-divider bg-card active:opacity-70"
        >
          <Text className="font-jakarta-bold text-base text-ink">Sign out</Text>
        </Pressable>
      </View>
    </DriverTabBarShell>
  );
}
