import { useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

export default function SignUpScreen() {
  const { signUp, fetchStatus } = useSignUp();
  const router = useRouter();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isSubmitting = fetchStatus === "fetching";

  const onSubmitDetails = async () => {
    setFormError(null);
    const { error } = await signUp.password({ emailAddress, password });
    if (error) {
      setFormError(error.longMessage ?? "Couldn't create your account.");
      return;
    }
    if (signUp.status === "complete") {
      await signUp.finalize({ navigate: () => router.replace("/") });
      return;
    }
    const { error: sendError } = await signUp.verifications.sendEmailCode();
    if (sendError) {
      setFormError(sendError.longMessage ?? "Couldn't send a verification code.");
      return;
    }
    setPendingVerification(true);
  };

  const onVerifyCode = async () => {
    setFormError(null);
    const { error } = await signUp.verifications.verifyEmailCode({ code });
    if (error) {
      setFormError(error.longMessage ?? "That code didn't work.");
      return;
    }
    if (signUp.status === "complete") {
      await signUp.finalize({ navigate: () => router.replace("/") });
    }
  };

  if (pendingVerification) {
    return (
      <View className="flex-1 justify-center gap-4 bg-white px-6 dark:bg-neutral-950">
        <Text className="mb-2 text-3xl font-bold text-neutral-900 dark:text-neutral-50">
          Check your email
        </Text>
        <Text className="text-neutral-500 dark:text-neutral-400">
          Enter the code we sent to {emailAddress}.
        </Text>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="Verification code"
          keyboardType="number-pad"
          placeholderTextColor="#9ca3af"
          className="rounded-xl border border-neutral-300 px-4 py-3 text-base text-neutral-900 dark:border-neutral-700 dark:text-neutral-50"
        />
        {formError && <Text className="text-sm text-red-500">{formError}</Text>}
        <Pressable
          onPress={onVerifyCode}
          disabled={isSubmitting}
          className="rounded-full bg-neutral-900 px-8 py-3 active:opacity-80 disabled:opacity-50 dark:bg-neutral-50"
        >
          <Text className="text-center text-base font-semibold text-white dark:text-neutral-900">
            {isSubmitting ? "Verifying…" : "Verify"}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center gap-4 bg-white px-6 dark:bg-neutral-950">
      <Text className="mb-2 text-3xl font-bold text-neutral-900 dark:text-neutral-50">
        Create your account
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
        onPress={onSubmitDetails}
        disabled={isSubmitting}
        className="rounded-full bg-neutral-900 px-8 py-3 active:opacity-80 disabled:opacity-50 dark:bg-neutral-50"
      >
        <Text className="text-center text-base font-semibold text-white dark:text-neutral-900">
          {isSubmitting ? "Creating account…" : "Sign up"}
        </Text>
      </Pressable>

      <Link href="/sign-in">
        <Text className="text-center text-sm text-neutral-500 dark:text-neutral-400">
          Already have an account? Sign in
        </Text>
      </Link>
    </View>
  );
}
