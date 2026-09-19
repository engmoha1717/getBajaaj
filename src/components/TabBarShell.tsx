import { MaterialIcons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import type { ComponentProps, ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

type IconName = ComponentProps<typeof MaterialIcons>["name"];

// Plain UI, not a routing construct — expo-router's nested-navigator
// group for tabs ((rider)/(tabs)/...) was the trigger for a
// "Couldn't find a navigation context" crash on iOS, reproducible only
// on-device, that survived removing <Tabs> for <Slot>, updating to the
// latest expo-router patch, and ruling out every hook/library involved
// (Clerk, icons, NativeWind, React Compiler). The one thing shared by
// every failing attempt was the extra nested-group navigation layer
// itself. Flattening it out — these 4 screens now live directly under
// (rider)/, and this component just renders the tab bar chrome around
// whatever screen wraps it — removes that layer entirely.
const TABS: { href: "/(rider)" | "/(rider)/activity" | "/(rider)/wallet" | "/(rider)/profile"; match: string; icon: IconName; label: string }[] = [
  { href: "/(rider)", match: "/", icon: "electric-rickshaw", label: "Home" },
  { href: "/(rider)/activity", match: "/activity", icon: "receipt-long", label: "Activity" },
  { href: "/(rider)/wallet", match: "/wallet", icon: "account-balance-wallet", label: "Wallet" },
  { href: "/(rider)/profile", match: "/profile", icon: "person", label: "Profile" },
];

export function TabBarShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <View className="flex-1">
      <View className="flex-1">{children}</View>

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
