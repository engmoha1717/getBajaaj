import { useAuth, useUser } from "@clerk/expo";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

import { TabBarShell } from "@/components/TabBarShell";

export default function Profile() {
  const { user } = useUser();
  const { signOut } = useAuth();

  const initial = (user?.firstName ?? user?.primaryEmailAddress?.emailAddress ?? "?")
    .charAt(0)
    .toUpperCase();

  return (
    <TabBarShell>
      <View className="flex-1 gap-6 bg-surface px-6 pt-20">
        <View className="items-center gap-3">
          {user?.imageUrl ? (
            <Image source={{ uri: user.imageUrl }} style={{ width: 72, height: 72, borderRadius: 36 }} />
          ) : (
            <View className="h-[72px] w-[72px] items-center justify-center rounded-full bg-primary">
              <Text className="font-jakarta-extrabold text-2xl text-ink">{initial}</Text>
            </View>
          )}
          <View className="items-center gap-0.5">
            <Text className="font-jakarta-bold text-lg text-ink">
              {user?.fullName || "Rider"}
            </Text>
            <Text className="font-jakarta-medium text-sm text-muted">
              {user?.primaryEmailAddress?.emailAddress}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => signOut()}
          className="h-14 items-center justify-center rounded-full border border-divider bg-card active:opacity-70"
        >
          <Text className="font-jakarta-bold text-base text-ink">Sign out</Text>
        </Pressable>
      </View>
    </TabBarShell>
  );
}
