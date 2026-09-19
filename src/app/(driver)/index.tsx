import { MaterialIcons } from "@expo/vector-icons";
import { useUser } from "@clerk/expo";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Pressable, Text, TextInput, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

import { DriverTabBarShell } from "@/components/DriverTabBarShell";
import { useAcceptRide } from "@/lib/useAcceptRide";
import { useAvailableRides } from "@/lib/useAvailableRides";
import { useCompleteRide } from "@/lib/useCompleteRide";
import { useCurrentDriverRide } from "@/lib/useCurrentDriverRide";
import { useDriverOnline } from "@/lib/useDriverOnline";
import { useMyDriverProfile } from "@/lib/useMyDriverProfile";
import { useMyRides } from "@/lib/useMyRides";
import { useStartRide } from "@/lib/useStartRide";

function formatDuration(ms: number) {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

// Matches the server-side version in /api/rides/nearby — small enough
// (and needed on both a Next.js route and this Expo app, two separate
// packages) that sharing the function isn't worth a shared package.
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// The flat rate every ride in this app currently settles at (see the
// comment on /api/rides/[id]/complete) — shown upfront on the request
// card too, rather than a fake per-ride "offer" amount, since it's
// exactly what accepting this ride will actually pay.
const FLAT_FARE = 90;

const STATUS_COPY: Record<string, string> = {
  PENDING: "Your application is under review — we'll notify you once it's approved.",
  REJECTED: "Your driver application wasn't approved.",
  SUSPENDED: "Your driver account is currently suspended.",
};

export default function DriverHome() {
  const { user } = useUser();
  const { data: profile, isLoading: profileLoading } = useMyDriverProfile();
  const { online, onlineSince, goOnline, goOffline, isSaving, error, lastFix } =
    useDriverOnline();
  const isApproved = profile?.status === "APPROVED";

  const { data: currentRide } = useCurrentDriverRide(isApproved);
  const hasActiveRide = !!currentRide;

  const { data: availableRides } = useAvailableRides(isApproved && online && !hasActiveRide);
  const acceptRide = useAcceptRide();
  const completeRide = useCompleteRide();
  const startRide = useStartRide();
  const [otpInput, setOtpInput] = useState("");

  // Otherwise a stale 4-digit guess from a finished ride would carry
  // over and sit pre-filled (and possibly wrong) for the next one.
  useEffect(() => {
    setOtpInput("");
  }, [currentRide?.id]);

  // useDriverOnline's `online` is local React state — it always starts
  // false on a fresh mount (app reload, cold start), even if the
  // server still has isOnline: true from before. Without this, a
  // driver who reloads while genuinely online sees "Go online" (wrong)
  // and, worse, GPS reporting never resumes even though the database
  // still thinks they're online. Resync once the real server value
  // loads.
  useEffect(() => {
    if (profile?.isOnline && !online) {
      goOnline();
    }
    // Deliberately just [profile?.isOnline]: this is a one-time catch-up
    // on load, not a continuous sync — goOnline/goOffline already keep
    // the server in step with every subsequent local toggle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.isOnline]);

  // "Pass" has no backend concept — every driver sees the same
  // unfiltered queue, so there's nothing to persist server-side.
  // Hiding a passed request locally (until it's re-fetched away by
  // someone accepting it, or this screen remounts) is enough for what
  // "pass" actually needs to do: stop showing me this one.
  const [passedIds, setPassedIds] = useState<Set<string>>(new Set());
  const nextRequest = availableRides?.find((ride) => !passedIds.has(ride.id));
  const remainingCount = availableRides
    ? availableRides.filter((ride) => !passedIds.has(ride.id)).length - (nextRequest ? 1 : 0)
    : 0;
  const distanceToPickup =
    nextRequest && lastFix
      ? haversineKm(lastFix.lat, lastFix.lng, nextRequest.pickupLat, nextRequest.pickupLng)
      : null;

  const { data: rides } = useMyRides(isApproved);
  const today = new Date().toDateString();
  const todayRides = (rides ?? []).filter(
    (ride) => new Date(ride.completedAt).toDateString() === today,
  );
  const todayTotal = todayRides.reduce((sum, ride) => sum + Number(ride.fare ?? 0), 0);
  const todayTripCount = todayRides.length;

  // Recomputed on every render, which is enough here — this screen
  // already re-renders every few seconds from the rides/availableRides
  // polling above, so a dedicated ticking timer would be redundant.
  const timeOnlineLabel = onlineSince
    ? formatDuration(Date.now() - onlineSince.getTime())
    : "0m";

  const initial = (user?.firstName ?? user?.primaryEmailAddress?.emailAddress ?? "?")
    .charAt(0)
    .toUpperCase();

  if (profileLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface px-6">
        <Text className="font-jakarta-medium text-base text-muted">Loading your profile…</Text>
      </View>
    );
  }

  if (!isApproved) {
    return (
      <DriverTabBarShell>
        <View className="flex-1 items-center justify-center gap-3 bg-surface px-8">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-card">
            <MaterialIcons name="hourglass-top" size={24} color="#6B7280" />
          </View>
          <Text className="font-jakarta-extrabold text-2xl text-ink">Driver home</Text>
          <Text className="text-center font-jakarta-medium text-sm text-muted">
            {profile ? STATUS_COPY[profile.status] : "Unable to load your driver status."}
          </Text>
        </View>
      </DriverTabBarShell>
    );
  }

  return (
    <DriverTabBarShell>
      <View className="flex-1 bg-surface">
      <View className="flex-row items-center justify-between gap-3 px-4 pb-3 pt-16">
        <View className="flex-1 flex-row items-center gap-3">
          <Image
            source={require("../../../assets/images/rickshaw-logo.png")}
            style={{ width: 32, height: 32, borderRadius: 8 }}
          />
          <View className="flex-row items-center gap-1.5">
            <Text className="font-jakarta-bold text-base text-ink">RickshawGo</Text>
            <View className="rounded bg-primary px-2 py-0.5">
              <Text className="font-jakarta-extrabold text-[10px] tracking-wider text-ink">
                SARATHI
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row items-center gap-1.5 rounded-full bg-card px-3 py-1.5 shadow-sm">
          <View className={`h-2 w-2 rounded-full ${online ? "bg-accent" : "bg-muted"}`} />
          <Text className="font-jakarta-extrabold text-[10px] uppercase tracking-wider text-ink">
            {online ? "Online" : "Offline"}
          </Text>
        </View>
      </View>

      <View className="mx-4 mb-3 gap-3 rounded-2xl border border-divider bg-card p-4 shadow-sm">
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-1 flex-row items-center gap-3">
            {user?.imageUrl ? (
              <Image
                source={{ uri: user.imageUrl }}
                style={{ width: 48, height: 48, borderRadius: 24 }}
              />
            ) : (
              <View className="h-12 w-12 items-center justify-center rounded-full bg-primary">
                <Text className="font-jakarta-extrabold text-lg text-ink">{initial}</Text>
              </View>
            )}
            <View className="flex-1">
              <Text className="font-jakarta-bold text-base text-ink" numberOfLines={1}>
                {user?.fullName || "Driver"}
              </Text>
              <View className="mt-0.5 flex-row items-center gap-1.5">
                <View className="rounded bg-primary px-1.5 py-0.5">
                  <Text className="font-jakarta-extrabold text-[10px] tracking-wider text-ink">
                    {profile?.vehiclePlate}
                  </Text>
                </View>
                <Text className="font-jakarta-medium text-xs text-muted" numberOfLines={1}>
                  {profile?.vehicleMake} {profile?.vehicleModel}
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            onPress={() => (online ? goOffline() : goOnline())}
            disabled={isSaving || hasActiveRide}
            style={isSaving || hasActiveRide ? { opacity: 0.5 } : undefined}
            className={`h-11 flex-row items-center gap-1.5 rounded-full px-4 active:opacity-80 ${
              online ? "bg-accent" : "bg-ink"
            }`}
          >
            <MaterialIcons name="power-settings-new" size={16} color="#FFFFFF" />
            <Text className="font-jakarta-extrabold text-xs uppercase tracking-wide text-white">
              {online ? "Offline" : "Online"}
            </Text>
          </Pressable>
        </View>

        {online ? (
          // bg-accent/10 as a plain style, not a NativeWind opacity-suffixed
          // class — this bar mounts/unmounts on the same `online` toggle
          // that already crashed once with "Couldn't find a navigation
          // context" from exactly this class pattern (see (rider)/index.tsx).
          <View
            className="flex-row items-center gap-2 rounded-lg px-3 py-2"
            style={{ backgroundColor: "rgba(0, 135, 68, 0.1)" }}
          >
            <MaterialIcons name="radar" size={16} color="#008744" />
            <Text
              className="flex-1 font-jakarta-semibold text-xs text-accent"
              numberOfLines={1}
            >
              Searching for ride requests near you…
            </Text>
          </View>
        ) : null}

        <View className="flex-row gap-2">
          <View className="flex-1 items-center gap-0.5 rounded-lg bg-surface p-2">
            <Text className="font-jakarta-bold text-[9px] uppercase tracking-wider text-muted">
              Today's Earnings
            </Text>
            <Text className="font-jakarta-extrabold text-lg text-accent">₹{todayTotal}</Text>
            <Text className="font-jakarta-medium text-[10px] text-muted">
              {todayTripCount} trip{todayTripCount === 1 ? "" : "s"} done
            </Text>
          </View>
          <View className="flex-1 items-center gap-0.5 rounded-lg bg-surface p-2">
            <Text className="font-jakarta-bold text-[9px] uppercase tracking-wider text-muted">
              Time Online
            </Text>
            <Text className="font-jakarta-extrabold text-lg text-ink">{timeOnlineLabel}</Text>
            <Text className="font-jakarta-medium text-[10px] text-muted">
              {online ? "Active shift" : "Not on duty"}
            </Text>
          </View>
        </View>

        <Text className="text-center font-jakarta-medium text-[10px] text-muted">
          {lastFix
            ? `GPS fix: ${lastFix.lat.toFixed(4)}, ${lastFix.lng.toFixed(4)}`
            : "GPS fix: none yet"}
        </Text>
        {error ? (
          <Text className="text-center font-jakarta-bold text-xs text-danger">{error}</Text>
        ) : null}
      </View>

      {online && lastFix ? (
        // Real map, real position — matches the mockup's map-viewport
        // slot, but this one isn't a static illustration. No fake
        // "+₹25 surge" style badges: those imply a real earnings bonus
        // that doesn't exist here, which is the same problem as a
        // fabricated fare figure. "High demand" alone doesn't promise
        // money, so it stays honest while still reading as live and busy.
        <View
          className="mx-4 mb-3 overflow-hidden rounded-2xl border border-divider"
          style={{ height: 160 }}
        >
          <MapView
            className="flex-1"
            region={{
              latitude: lastFix.lat,
              longitude: lastFix.lng,
              latitudeDelta: 0.03,
              longitudeDelta: 0.03,
            }}
          >
            <Marker
              coordinate={{ latitude: lastFix.lat, longitude: lastFix.lng }}
              title="You"
              pinColor="#FFB800"
            />
          </MapView>
          <View className="absolute left-2 top-2 flex-row items-center gap-1.5 rounded-full bg-card px-2.5 py-1 shadow-sm">
            <MaterialIcons name="local-fire-department" size={14} color="#D9383A" />
            <Text className="font-jakarta-bold text-[10px] text-ink">High demand nearby</Text>
          </View>
        </View>
      ) : null}

      {online ? (
        // Real progress (todayTripCount, already computed above for the
        // earnings stat), no fake reward money — the mockup's version of
        // this card promises "+₹250 Extra" for hitting the target, which
        // would be a fabricated bonus with no incentive system behind it.
        <View className="mx-4 mb-3 gap-2 rounded-2xl border border-divider bg-card p-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View
                className="h-7 w-7 items-center justify-center rounded-lg"
                style={{ backgroundColor: "rgba(0, 135, 68, 0.15)" }}
              >
                <MaterialIcons name="military-tech" size={16} color="#008744" />
              </View>
              <Text className="font-jakarta-bold text-sm text-ink">Today's progress</Text>
            </View>
            <Text className="font-jakarta-extrabold text-xs text-accent">
              {Math.min(100, Math.round((todayTripCount / 12) * 100))}%
            </Text>
          </View>
          <View className="h-2 overflow-hidden rounded-full bg-surface">
            <View
              className="h-full rounded-full bg-accent"
              style={{ width: `${Math.min(100, (todayTripCount / 12) * 100)}%` }}
            />
          </View>
          <Text className="font-jakarta-medium text-xs text-muted">
            {todayTripCount} of 12 rides today
            {todayTripCount < 12 ? ` — ${12 - todayTripCount} to go` : " — nice work!"}
          </Text>
        </View>
      ) : null}

      {hasActiveRide ? (
        // shadow-sm as a plain style here too — this whole card mounts as a
        // fresh subtree on the same online/hasActiveRide state change that
        // already crashed once via a NativeWind class racing navigation
        // context init (see the other bg-*/10 fixes in this file).
        <View
          className="mx-4 gap-3 rounded-2xl border border-divider bg-card p-4"
          style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
        >
          <View className="flex-row items-center justify-between">
            <View
              className="flex-row items-center gap-1.5 rounded-full px-2.5 py-1"
              style={{ backgroundColor: "rgba(0, 135, 68, 0.1)" }}
            >
              <MaterialIcons name="electric-rickshaw" size={14} color="#008744" />
              <Text className="font-jakarta-extrabold text-[10px] uppercase tracking-wider text-accent">
                {currentRide.status === "ACCEPTED" ? "Heading to pickup" : "In progress"}
              </Text>
            </View>
            <Text className="font-jakarta-extrabold text-xl text-ink">₹{FLAT_FARE}</Text>
          </View>

          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-primary">
              <Text className="font-jakarta-extrabold text-base text-ink">
                {currentRide.rider.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text className="flex-1 font-jakarta-bold text-sm text-ink" numberOfLines={1}>
              {currentRide.rider.name}
            </Text>
            {currentRide.rider.phone ? (
              <Pressable
                onPress={() => Linking.openURL(`tel:${currentRide.rider.phone}`)}
                className="h-10 w-10 items-center justify-center rounded-full bg-surface active:opacity-70"
              >
                <MaterialIcons name="call" size={18} color="#008744" />
              </Pressable>
            ) : null}
          </View>

          <View className="gap-2 rounded-xl bg-surface p-3">
            <View className="flex-row items-start gap-2">
              <MaterialIcons name="trip-origin" size={16} color="#008744" />
              <Text className="flex-1 font-jakarta-semibold text-sm text-ink">
                {currentRide.pickupAddress}
              </Text>
            </View>
            <View className="ml-2 h-3 w-px bg-divider" />
            <View className="flex-row items-start gap-2">
              <MaterialIcons name="location-on" size={16} color="#D9383A" />
              <Text className="flex-1 font-jakarta-semibold text-sm text-ink">
                {currentRide.dropoffAddress}
              </Text>
            </View>
          </View>

          {currentRide.status === "ACCEPTED" ? (
            <View className="gap-2">
              <Text className="font-jakarta-bold text-[10px] uppercase tracking-wider text-muted">
                Ask the rider for their start code
              </Text>
              <TextInput
                value={otpInput}
                onChangeText={(text) => setOtpInput(text.replace(/[^0-9]/g, "").slice(0, 4))}
                placeholder="0000"
                placeholderTextColor="#6B7280"
                keyboardType="number-pad"
                maxLength={4}
                className="rounded-xl border border-divider bg-surface px-4 py-3 text-center font-jakarta-extrabold text-2xl tracking-[8px] text-ink"
              />
              {startRide.isError ? (
                <Text className="text-center font-jakarta-bold text-xs text-danger">
                  {startRide.error instanceof Error
                    ? startRide.error.message
                    : "Something went wrong."}
                </Text>
              ) : null}
              <Pressable
                onPress={() => startRide.mutate({ rideId: currentRide.id, otp: otpInput })}
                disabled={otpInput.length !== 4 || startRide.isPending}
                style={otpInput.length !== 4 || startRide.isPending ? { opacity: 0.5 } : undefined}
                className="h-14 items-center justify-center rounded-full bg-accent active:opacity-80"
              >
                {startRide.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="font-jakarta-extrabold text-sm uppercase tracking-wide text-white">
                    Start ride
                  </Text>
                )}
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => completeRide.mutate(currentRide.id)}
              disabled={completeRide.isPending}
              style={completeRide.isPending ? { opacity: 0.5 } : undefined}
              className="h-14 items-center justify-center rounded-full bg-ink active:opacity-80"
            >
              {completeRide.isPending ? (
                <ActivityIndicator color="#FFB800" />
              ) : (
                <Text className="font-jakarta-extrabold text-sm uppercase tracking-wide text-white">
                  Complete ride
                </Text>
              )}
            </Pressable>
          )}
        </View>
      ) : online && nextRequest ? (
        <View
          className="mx-4 gap-3 rounded-2xl border-2 border-accent bg-card p-4"
          style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}
        >
          <View className="flex-row items-center justify-between">
            <View
              className="flex-row items-center gap-1.5 rounded-full px-2.5 py-1"
              style={{ backgroundColor: "rgba(217, 56, 58, 0.1)" }}
            >
              <MaterialIcons name="priority-high" size={14} color="#D9383A" />
              <Text className="font-jakarta-extrabold text-[10px] uppercase tracking-wider text-danger">
                Incoming request
              </Text>
            </View>
            <Text className="font-jakarta-extrabold text-2xl text-ink">₹{FLAT_FARE}</Text>
          </View>

          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-primary">
              <Text className="font-jakarta-extrabold text-base text-ink">
                {nextRequest.rider.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="font-jakarta-bold text-sm text-ink" numberOfLines={1}>
                {nextRequest.rider.name}
              </Text>
              {distanceToPickup !== null ? (
                <Text className="font-jakarta-medium text-xs text-muted">
                  {distanceToPickup.toFixed(1)} km to pickup
                </Text>
              ) : null}
            </View>
          </View>

          <View className="gap-2 rounded-xl bg-surface p-3">
            <View className="flex-row items-start gap-2">
              <MaterialIcons name="trip-origin" size={16} color="#008744" />
              <Text className="flex-1 font-jakarta-semibold text-sm text-ink">
                {nextRequest.pickupAddress}
              </Text>
            </View>
            <View className="ml-2 h-3 w-px bg-divider" />
            <View className="flex-row items-start gap-2">
              <MaterialIcons name="location-on" size={16} color="#D9383A" />
              <Text className="flex-1 font-jakarta-semibold text-sm text-ink">
                {nextRequest.dropoffAddress}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => acceptRide.mutate(nextRequest.id)}
            disabled={acceptRide.isPending}
            style={acceptRide.isPending ? { opacity: 0.5 } : undefined}
            className="h-14 flex-row items-center justify-center gap-2 rounded-full bg-accent active:opacity-80"
          >
            <MaterialIcons name="check-circle" size={20} color="#FFFFFF" />
            <Text className="font-jakarta-extrabold text-sm uppercase tracking-wide text-white">
              Accept ride
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setPassedIds((prev) => new Set(prev).add(nextRequest.id))}
            className="h-11 items-center justify-center rounded-full bg-surface active:opacity-70"
          >
            <Text className="font-jakarta-bold text-xs uppercase tracking-wide text-muted">
              Pass
            </Text>
          </Pressable>

          {remainingCount > 0 ? (
            <Text className="text-center font-jakarta-medium text-xs text-muted">
              +{remainingCount} more waiting
            </Text>
          ) : null}
        </View>
      ) : online ? (
        <View className="flex-1 items-center justify-center gap-2 px-8">
          <MaterialIcons name="search" size={22} color="#6B7280" />
          <Text className="font-jakarta-medium text-sm text-muted">
            No ride requests right now.
          </Text>
        </View>
      ) : (
        <View className="flex-1 items-center justify-center gap-2 px-8">
          <MaterialIcons name="bedtime" size={22} color="#6B7280" />
          <Text className="text-center font-jakarta-medium text-sm text-muted">
            Go online to see ride requests.
          </Text>
        </View>
      )}
      </View>
    </DriverTabBarShell>
  );
}
