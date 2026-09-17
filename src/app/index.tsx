import { Pressable, Text, View } from "react-native";

export default function Home() {
  return (
    <View className="flex-1 items-center justify-center gap-6 bg-white px-6 dark:bg-neutral-950">
      <View className="items-center gap-2">
        <Text className="text-4xl font-bold text-neutral-900 dark:text-neutral-50">
          GetBajaaj
        </Text>
        <Text className="text-base text-neutral-500 dark:text-neutral-400">
          Book your ride in minutes.
        </Text>
      </View>

      <Pressable className="rounded-full bg-neutral-900 px-8 py-3 active:opacity-80 dark:bg-neutral-50">
        <Text className="text-base font-semibold text-white dark:text-neutral-900">
          Get Started
        </Text>
      </Pressable>
    </View>
  );
}
