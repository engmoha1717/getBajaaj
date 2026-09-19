import { Image } from "expo-image";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

// Only reachable when signed out — RootNavigator's Stack.Protected
// guards this whole screen, so no auth check needed here.
export default function Home() {
  return (
    <View className="flex-1 justify-between bg-white px-6 pt-20 pb-10 dark:bg-neutral-950">
      <View className="items-center gap-4">
        <Image
          source={require("../../assets/images/rickshaw-logo.png")}
          style={{ width: 72, height: 72, borderRadius: 18 }}
        />
        <View className="flex-row items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1">
          <View className="size-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
          <Text className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            Zero surge, always
          </Text>
        </View>
      </View>

      <View className="items-center gap-4">
        <Text className="text-center text-4xl font-bold text-neutral-900 dark:text-neutral-50">
          Your auto, booked{"\n"}in seconds.
        </Text>
        <Text className="max-w-xs text-center text-base text-neutral-500 dark:text-neutral-400">
          Transparent meter fares, verified drivers, and instant OTP
          safety — GetBajaaj brings Bengaluru&apos;s autos to your pocket.
        </Text>
      </View>

      <View className="gap-4">
        <Link
          href="/sign-up"
          asChild
        >
          <Pressable className="rounded-full bg-[#FFB800] px-8 py-4 active:opacity-80">
            <Text className="text-center text-base font-semibold text-[#271900]">
              Get Started
            </Text>
          </Pressable>
        </Link>
        <Link href="/sign-in">
          <Text className="text-center text-sm text-neutral-500 dark:text-neutral-400">
            Already have an account? Sign in
          </Text>
        </Link>
      </View>
    </View>
  );
}
