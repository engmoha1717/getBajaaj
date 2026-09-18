import { Text, View } from "react-native";

export default function Activity() {
  return (
    <View className="flex-1 items-center justify-center gap-2 bg-surface px-6">
      <Text className="font-jakarta-extrabold text-2xl text-ink">Activity</Text>
      <Text className="text-center font-jakarta-medium text-sm text-muted">
        Ride history goes here in a later phase.
      </Text>
    </View>
  );
}
