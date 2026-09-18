import { Tabs } from "expo-router";
import { Text, View } from "react-native";

function TabLabel({ focused, label }: { focused: boolean; label: string }) {
  return (
    <View className="items-center gap-1 pt-1">
      <View className={`h-1 w-1 rounded-full ${focused ? "bg-ink" : "bg-transparent"}`} />
      <Text
        className={`font-jakarta-semibold text-xs ${focused ? "text-ink" : "text-muted"}`}
      >
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
        options={{ tabBarIcon: ({ focused }) => <TabLabel focused={focused} label="Home" /> }}
      />
      <Tabs.Screen
        name="activity"
        options={{ tabBarIcon: ({ focused }) => <TabLabel focused={focused} label="Activity" /> }}
      />
      <Tabs.Screen
        name="wallet"
        options={{ tabBarIcon: ({ focused }) => <TabLabel focused={focused} label="Wallet" /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ tabBarIcon: ({ focused }) => <TabLabel focused={focused} label="Profile" /> }}
      />
    </Tabs>
  );
}
