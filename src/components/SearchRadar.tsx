import { useEffect, useState } from "react";
import { AccessibilityInfo, View } from "react-native";
import { Image } from "expo-image";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

// RN has no `prefers-reduced-motion` media query — this is the real
// equivalent, checked once and used to fall back to static rings
// instead of the looping pulse.
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced);
  }, []);
  return reduced;
}

function PulseRing({
  size,
  color,
  delay,
  reduced,
}: {
  size: number;
  color: string;
  delay: number;
  reduced: boolean;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    progress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 1800, easing: Easing.out(Easing.ease) }), -1, false),
    );
  }, [reduced]);

  const style = useAnimatedStyle(() => {
    const scale = reduced ? 1 : 0.6 + progress.value * 0.6;
    const opacity = reduced ? 0.25 : (1 - progress.value) * 0.5;
    return { transform: [{ scale }], opacity };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

function LiveDot({ reduced }: { reduced: boolean }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    progress.value = withRepeat(withTiming(1, { duration: 1200, easing: Easing.out(Easing.ease) }), -1, false);
  }, [reduced]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: reduced ? 1 : 1 + progress.value }],
    opacity: reduced ? 0 : 1 - progress.value,
  }));

  return (
    <View className="absolute -bottom-0.5 -right-0.5 h-6 w-6 items-center justify-center">
      <Animated.View
        style={[
          { position: "absolute", width: 24, height: 24, borderRadius: 12, backgroundColor: "#008744" },
          ringStyle,
        ]}
      />
      <View className="h-6 w-6 items-center justify-center rounded-full bg-accent">
        <View className="h-2 w-2 rounded-full bg-white" />
      </View>
    </View>
  );
}

export function SearchRadar() {
  const reduced = useReducedMotion();

  return (
    <View className="aspect-square w-full max-w-[280px] items-center justify-center self-center rounded-full bg-surface">
      <PulseRing size={280} color="#FFB800" delay={0} reduced={reduced} />
      <PulseRing size={220} color="#008744" delay={400} reduced={reduced} />
      <PulseRing size={160} color="#FFB800" delay={800} reduced={reduced} />

      <View className="h-24 w-24 items-center justify-center rounded-full bg-card p-2 shadow-md">
        <Image
          source={require("../../assets/images/rickshaw-logo.png")}
          style={{ width: "100%", height: "100%", borderRadius: 999 }}
        />
        <LiveDot reduced={reduced} />
      </View>
    </View>
  );
}
