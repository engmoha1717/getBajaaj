import { useSignIn } from "@clerk/expo";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { OAuthButtons } from "@/components/oauth-buttons";

export default function SignInScreen() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const isSubmitting = fetchStatus === "fetching";

  const onSubmit = async () => {
    setFormError(null);
    try {
      const { error } = await signIn.password({ emailAddress, password });
      if (error) {
        console.error("[sign-in:password]", error);
        setFormError(error.longMessage ?? "Couldn't sign in. Check your details and try again.");
        return;
      }
      if (signIn.status === "complete") {
        await signIn.finalize({ navigate: () => router.replace("/") });
      } else {
        setFormError("Additional verification is required — not supported in this app yet.");
      }
    } catch (err) {
      console.error("[sign-in:unexpected]", err);
      const message = err instanceof Error ? err.message : String(err);
      setFormError(`Couldn't sign in: ${message}`);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white dark:bg-neutral-950"
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center gap-6 px-6 py-16"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center gap-3">
          <Image
            source={require("../../../assets/images/rickshaw-logo.png")}
            style={{ width: 56, height: 56, borderRadius: 14 }}
          />
          <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            Welcome back
          </Text>
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            Sign in to book your next auto.
          </Text>
        </View>

        <OAuthButtons onError={setFormError} />

        <View className="flex-row items-center gap-3">
          <View className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
          <Text className="text-xs text-neutral-400 dark:text-neutral-500">
            or continue with email
          </Text>
          <View className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
        </View>

        <View className="gap-4">
          <TextInput
            value={emailAddress}
            onChangeText={setEmailAddress}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#9ca3af"
            className="rounded-xl border border-neutral-300 px-4 py-3 text-base text-neutral-900 dark:border-neutral-700 dark:text-neutral-50"
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            placeholderTextColor="#9ca3af"
            className="rounded-xl border border-neutral-300 px-4 py-3 text-base text-neutral-900 dark:border-neutral-700 dark:text-neutral-50"
          />

          {formError && <Text className="text-sm text-red-500">{formError}</Text>}

          <Pressable
            onPress={onSubmit}
            disabled={isSubmitting}
            className="rounded-full bg-[#FFB800] px-8 py-3.5 active:opacity-80 disabled:opacity-50"
          >
            <Text className="text-center text-base font-semibold text-[#271900]">
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Text>
          </Pressable>
        </View>

        <Link href="/sign-up">
          <Text className="text-center text-sm text-neutral-500 dark:text-neutral-400">
            Don&apos;t have an account? Sign up
          </Text>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
