import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

import { useApplyToDrive } from "@/lib/useApplyToDrive";

export default function BecomeDriver() {
  const apply = useApplyToDrive();
  const queryClient = useQueryClient();
  const [licenseNumber, setLicenseNumber] = useState("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");

  const canSubmit =
    licenseNumber.trim().length > 0 &&
    vehicleMake.trim().length > 0 &&
    vehicleModel.trim().length > 0 &&
    vehiclePlate.trim().length > 0;

  function handleSubmit() {
    apply.mutate(
      { licenseNumber, vehicleMake, vehicleModel, vehiclePlate },
      {
        onSuccess: async () => {
          // The server already flipped this account's role to DRIVER,
          // but RootNavigator's Stack.Protected guards read the
          // cached ["me"] query, not the server directly — refetch it
          // and wait for that to land *before* navigating, so "/"
          // doesn't render with the stale RIDER role for a moment and
          // bounce back into (rider) before the real data arrives.
          await queryClient.invalidateQueries({ queryKey: ["me"] });
          router.replace("/");
        },
      },
    );
  }

  return (
    <View className="flex-1 gap-6 bg-surface px-4 pt-20">
      <View className="gap-1">
        <Text className="font-jakarta-extrabold text-[28px] leading-9 tracking-tight text-ink">
          Drive with us
        </Text>
        <Text className="font-jakarta-medium text-sm text-muted">
          Tell us about your vehicle and license to start driving.
        </Text>
      </View>

      <View className="gap-3 rounded-3xl border border-divider bg-card px-4 py-4 shadow-sm">
        <TextInput
          value={licenseNumber}
          onChangeText={setLicenseNumber}
          placeholder="Driving license number"
          placeholderTextColor="#6B7280"
          autoCapitalize="characters"
          className="font-jakarta-semibold text-base text-ink"
        />
        <View className="h-px bg-divider" />
        <TextInput
          value={vehicleMake}
          onChangeText={setVehicleMake}
          placeholder="Vehicle make (e.g. Bajaj)"
          placeholderTextColor="#6B7280"
          className="font-jakarta-semibold text-base text-ink"
        />
        <View className="h-px bg-divider" />
        <TextInput
          value={vehicleModel}
          onChangeText={setVehicleModel}
          placeholder="Vehicle model (e.g. RE Compact)"
          placeholderTextColor="#6B7280"
          className="font-jakarta-semibold text-base text-ink"
        />
        <View className="h-px bg-divider" />
        <TextInput
          value={vehiclePlate}
          onChangeText={setVehiclePlate}
          placeholder="Vehicle plate number"
          placeholderTextColor="#6B7280"
          autoCapitalize="characters"
          className="font-jakarta-semibold text-base text-ink"
        />
      </View>

      {apply.isError && (
        <Text className="font-jakarta-medium text-sm text-danger">
          {apply.error instanceof Error ? apply.error.message : "Something went wrong."}
        </Text>
      )}

      <Pressable
        onPress={handleSubmit}
        disabled={!canSubmit || apply.isPending}
        className="h-14 items-center justify-center rounded-full bg-ink active:opacity-80 disabled:opacity-40"
      >
        {apply.isPending ? (
          <ActivityIndicator color="#FFB800" />
        ) : (
          <Text className="font-jakarta-bold text-base tracking-wide text-white">
            SUBMIT APPLICATION
          </Text>
        )}
      </Pressable>
    </View>
  );
}
