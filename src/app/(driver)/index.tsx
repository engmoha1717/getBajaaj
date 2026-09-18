import { useAuth } from "@clerk/expo";
import { Pressable, Text, View } from "react-native";

export default function DriverHome() {
  const { signOut } = useAuth();

  return (
    <View className="flex-1 items-center justify-center gap-6 bg-[#FFB800] px-6">
      <View className="items-center gap-2">
        <Text className="text-3xl font-bold text-[#271900]">Driver home</Text>
        <Text className="text-base text-[#5e4200]">
          Go-online / accept-ride goes here in a later phase.
        </Text>
      </View>

      <Pressable
        onPress={() => signOut()}
        className="rounded-full bg-[#271900] px-8 py-3 active:opacity-80"
      >
        <Text className="text-base font-semibold text-white">Sign out</Text>
      </Pressable>
    </View>
  );
}
