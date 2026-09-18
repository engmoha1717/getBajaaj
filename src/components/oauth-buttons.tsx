import { useSSO } from "@clerk/expo/experimental";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export function OAuthButtons({
  onError,
}: {
  onError: (message: string) => void;
}) {
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const onPress = async (strategy: "oauth_google" | "oauth_apple") => {
    try {
      const { createdSessionId } = await startSSOFlow({ strategy });
      if (!createdSessionId) {
        // User cancelled the browser flow, or it didn't complete — not an error.
        return;
      }
      router.replace("/");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`[oauth:${strategy}]`, err);
      const message = err instanceof Error ? err.message : String(err);
      onError(`Couldn't sign in with ${strategy === "oauth_google" ? "Google" : "Apple"}: ${message}`);
    }
  };

  return (
    <View className="gap-3">
      <Pressable
        onPress={() => onPress("oauth_google")}
        className="flex-row items-center justify-center gap-2.5 rounded-full border border-neutral-300 bg-white px-6 py-3.5 active:opacity-70 dark:border-neutral-700 dark:bg-neutral-900"
      >
        <View className="size-5 items-center justify-center rounded-full bg-white">
          <Text className="text-sm leading-none font-bold text-[#4285F4]">
            G
          </Text>
        </View>
        <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
          Continue with Google
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onPress("oauth_apple")}
        className="flex-row items-center justify-center gap-2.5 rounded-full bg-black px-6 py-3.5 active:opacity-70 dark:bg-white"
      >
        <Text className="text-base font-semibold text-white dark:text-black">
          Continue with Apple
        </Text>
      </Pressable>
    </View>
  );
}
