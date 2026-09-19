import { MaterialIcons } from "@expo/vector-icons";
import { router, Slot, usePathname } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";

type IconName = ComponentProps<typeof MaterialIcons>["name"];

// Hand-built tab bar instead of expo-router's <Tabs> (which wraps
// React Navigation's native BottomTabNavigator). <Tabs> was throwing
// "Couldn't find a navigation context" on iOS the moment a screen
// inside it called setState — confirmed via a diagnostic error
// boundary that the crash originates right at the top of the tab
// screen's render, inside that navigator's own machinery, not in our
// code. <Slot> just renders whichever child route matches the current
// URL — no native tab-navigator involved, so that failure mode isn't
// possible here.
const TABS: { href: "/(rider)/(tabs)" | "/(rider)/(tabs)/activity" | "/(rider)/(tabs)/wallet" | "/(rider)/(tabs)/profile"; match: string; icon: IconName; label: string }[] = [
  { href: "/(rider)/(tabs)", match: "/", icon: "electric-rickshaw", label: "Home" },
  { href: "/(rider)/(tabs)/activity", match: "/activity", icon: "receipt-long", label: "Activity" },
  { href: "/(rider)/(tabs)/wallet", match: "/wallet", icon: "account-balance-wallet", label: "Wallet" },
  { href: "/(rider)/(tabs)/profile", match: "/profile", icon: "person", label: "Profile" },
];

export default function TabsLayout() {
  const pathname = usePathname();

  return (
    <View className="flex-1">
      <View className="flex-1">
        <Slot />
      </View>

      <View className="flex-row border-t border-divider bg-card" style={{ height: 64 }}>
        {TABS.map((tab) => {
          const focused = pathname === tab.match;
          const color = focused ? "#121212" : "#6B7280";
          return (
            <Pressable
              key={tab.href}
              onPress={() => router.replace(tab.href)}
              className="flex-1 items-center justify-center gap-1"
            >
              <MaterialIcons name={tab.icon} size={22} color={color} />
              <Text
                className={`font-jakarta-bold text-[10px] tracking-wide ${focused ? "text-ink" : "text-muted"}`}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
