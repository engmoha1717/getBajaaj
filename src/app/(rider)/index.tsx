import { useAuth } from "@clerk/expo";
import { Pressable, Text, View } from "react-native";

export default function RiderHome() {
  const { signOut } = useAuth();

  return (
    <View className="flex-1 items-center justify-center gap-6 bg-white px-6 dark:bg-neutral-950">
      <View className="items-center gap-2">
        <Text className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
          Rider home
        </Text>
        <Text className="text-base text-neutral-500 dark:text-neutral-400">
          Ride request goes here in a later phase.
        </Text>
      </View>

      <Pressable
        onPress={() => signOut()}
        className="rounded-full bg-neutral-900 px-8 py-3 active:opacity-80 dark:bg-neutral-50"
      >
        <Text className="text-base font-semibold text-white dark:text-neutral-900">
          Sign out
        </Text>
      </Pressable>
    </View>
  );
}
