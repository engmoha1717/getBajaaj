import { useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

export default function SignInScreen() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const isSubmitting = fetchStatus === "fetching";

  const onSubmit = async () => {
    setFormError(null);
    const { error } = await signIn.password({ emailAddress, password });
    if (error) {
      setFormError(error.longMessage ?? "Couldn't sign in. Check your details and try again.");
      return;
    }
    if (signIn.status === "complete") {
      await signIn.finalize({ navigate: () => router.replace("/") });
    } else {
      setFormError("Additional verification is required — not supported in this app yet.");
    }
  };

  return (
    <View className="flex-1 justify-center gap-4 bg-white px-6 dark:bg-neutral-950">
      <Text className="mb-2 text-3xl font-bold text-neutral-900 dark:text-neutral-50">
        Sign in
      </Text>

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
        className="rounded-full bg-neutral-900 px-8 py-3 active:opacity-80 disabled:opacity-50 dark:bg-neutral-50"
      >
        <Text className="text-center text-base font-semibold text-white dark:text-neutral-900">
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Text>
      </Pressable>

      <Link href="/sign-up">
        <Text className="text-center text-sm text-neutral-500 dark:text-neutral-400">
          Don't have an account? Sign up
        </Text>
      </Link>
    </View>
  );
}
