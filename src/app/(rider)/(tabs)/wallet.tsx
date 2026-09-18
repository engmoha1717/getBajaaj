import { Text, View } from "react-native";

export default function Wallet() {
  return (
    <View className="flex-1 items-center justify-center gap-2 bg-surface px-6">
      <Text className="font-jakarta-extrabold text-2xl text-ink">Wallet</Text>
      <Text className="text-center font-jakarta-medium text-sm text-muted">
        Payments & wallet go here in a later phase.
      </Text>
    </View>
  );
}
