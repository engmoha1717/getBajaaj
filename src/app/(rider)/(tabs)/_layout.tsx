import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { Text, View } from "react-native";

type IconName = ComponentProps<typeof MaterialIcons>["name"];

// Icon names match the RickshawGo Stitch project's own bottom nav
// (Material Symbols Outlined `electric_rickshaw`/`receipt_long`/
// `account_balance_wallet`/`person`) — MaterialIcons uses the same
// names, hyphenated, and happens to include all four exactly.
function TabIcon({ focused, icon, label }: { focused: boolean; icon: IconName; label: string }) {
  const color = focused ? "#121212" : "#6B7280";
  return (
    <View className="items-center gap-1 pt-1">
      <MaterialIcons name={icon} size={22} color={color} />
      <Text className={`font-jakarta-bold text-[10px] tracking-wide ${focused ? "text-ink" : "text-muted"}`}>
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { height: 64, borderTopColor: "#EBECEF" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="electric-rickshaw" label="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="receipt-long" label="Activity" />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="account-balance-wallet" label="Wallet" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="person" label="Profile" />,
        }}
      />
    </Tabs>
  );
}
