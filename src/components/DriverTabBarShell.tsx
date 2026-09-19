import { MaterialIcons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import type { ComponentProps, ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

type IconName = ComponentProps<typeof MaterialIcons>["name"];

// Same 4 icons/labels as the Stitch "RickshawGo Auto Hailing App" project's
// driver bottom nav (fmd_good/account_balance_wallet/receipt_long/badge),
// translated to their @expo/vector-icons MaterialIcons equivalents.
const TABS: { href: "/(driver)" | "/(driver)/earnings" | "/(driver)/trips" | "/(driver)/profile"; match: string; icon: IconName; label: string }[] = [
  { href: "/(driver)", match: "/", icon: "fmd-good", label: "Duty" },
  { href: "/(driver)/earnings", match: "/earnings", icon: "account-balance-wallet", label: "Earnings" },
  { href: "/(driver)/trips", match: "/trips", icon: "receipt-long", label: "Trips" },
  { href: "/(driver)/profile", match: "/profile", icon: "badge", label: "Profile" },
];

export function DriverTabBarShell({ children }: { children: ReactNode }) {
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
