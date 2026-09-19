import { useSignUp } from "@clerk/expo";
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
    try {
      const { error } = await signUp.password({ emailAddress, password });
      if (error) {
        console.warn("[sign-up:password]", error);
        setFormError(error.longMessage ?? "Couldn't create your account.");
        return;
      }
      if (signUp.status === "complete") {
        await signUp.finalize({ navigate: () => router.replace("/") });
        return;
      }
      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        console.warn("[sign-up:sendEmailCode]", sendError);
        setFormError(sendError.longMessage ?? "Couldn't send a verification code.");
        return;
      }
      setPendingVerification(true);
    } catch (err) {
      console.error("[sign-up:unexpected]", err);
      const message = err instanceof Error ? err.message : String(err);
      setFormError(`Couldn't create your account: ${message}`);
    }
  };

  const onVerifyCode = async () => {
    setFormError(null);
    try {
      const { error } = await signUp.verifications.verifyEmailCode({ code });
      if (error) {
        console.warn("[sign-up:verifyEmailCode]", error);
        setFormError(error.longMessage ?? "That code didn't work.");
        return;
      }
      if (signUp.status === "complete") {
        await signUp.finalize({ navigate: () => router.replace("/") });
      }
    } catch (err) {
      console.error("[sign-up:verify-unexpected]", err);
      const message = err instanceof Error ? err.message : String(err);
      setFormError(`Couldn't verify: ${message}`);
    }
  };

  const logo = (
    <View className="items-center gap-3">
      <Image
        source={require("../../../assets/images/rickshaw-logo.png")}
        style={{ width: 56, height: 56, borderRadius: 14 }}
      />
    </View>
  );

  if (pendingVerification) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 bg-white dark:bg-neutral-950"
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center gap-6 px-6 py-16"
          keyboardShouldPersistTaps="handled"
        >
          {logo}
          <View className="items-center gap-2">
            <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              Check your email
            </Text>
            <Text className="text-center text-sm text-neutral-500 dark:text-neutral-400">
              Enter the code we sent to {emailAddress}.
            </Text>
          </View>

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
            className="rounded-full bg-[#FFB800] px-8 py-3.5 active:opacity-80 disabled:opacity-50"
          >
            <Text className="text-center text-base font-semibold text-[#271900]">
              {isSubmitting ? "Verifying…" : "Verify"}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white dark:bg-neutral-950"
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center gap-6 px-6 py-16"
        keyboardShouldPersistTaps="handled"
      >
        {logo}
        <View className="items-center gap-1">
          <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            Create your account
          </Text>
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            Join GetBajaaj — zero surge, always.
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
          <View className="gap-1.5">
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry
              placeholderTextColor="#9ca3af"
              className="rounded-xl border border-neutral-300 px-4 py-3 text-base text-neutral-900 dark:border-neutral-700 dark:text-neutral-50"
            />
            <Text className="text-xs text-neutral-400 dark:text-neutral-500">
              At least 15 characters.
            </Text>
          </View>

          {formError && <Text className="text-sm text-red-500">{formError}</Text>}

          {/* Bot-protection mount point Clerk requires in custom sign-up
              flows — renders only on web; iOS/Android skip it entirely.
              Without it, web sign-ups can be silently blocked as
              suspected bots with no way to prove otherwise. */}
          <View nativeID="clerk-captcha" />

          <Pressable
            onPress={onSubmitDetails}
            disabled={isSubmitting}
            className="rounded-full bg-[#FFB800] px-8 py-3.5 active:opacity-80 disabled:opacity-50"
          >
            <Text className="text-center text-base font-semibold text-[#271900]">
              {isSubmitting ? "Creating account…" : "Sign up"}
            </Text>
          </Pressable>
        </View>

        <Link href="/sign-in">
          <Text className="text-center text-sm text-neutral-500 dark:text-neutral-400">
            Already have an account? Sign in
          </Text>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
