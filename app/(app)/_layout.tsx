import { Tabs } from "expo-router";
import { ReceiptCentIcon, User, Users } from "lucide-react-native";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  background: "#102216",
  tabBar: "rgba(26, 44, 34, 0.95)",
  primary: "#13ec5b",
  inactive: "#6b7280",
} as const;

const TAB_BAR_CONFIG = {
  paddingTop: 10,
  paddingBottom: 10,
  backgroundColor: COLORS.tabBar,
  borderTopWidth: 0,
} as const;

const TAB_LABEL_STYLE = {
  fontSize: 10,
  fontFamily: "Manrope-Regular",
  fontWeight: "medium" as const,
};

export default function AppLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: TAB_BAR_CONFIG,
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.inactive,
            tabBarLabelStyle: TAB_LABEL_STYLE,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Groups",
              tabBarIcon: ({ focused }) => (
                <Users
                  color={focused ? COLORS.primary : COLORS.inactive}
                  fill={focused ? COLORS.primary : COLORS.inactive}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="activity"
            options={{
              title: "Activity",
              tabBarIcon: ({ focused }) => (
                <ReceiptCentIcon
                  color={focused ? COLORS.primary : COLORS.inactive}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ focused }) => (
                <User
                  color={focused ? COLORS.primary : COLORS.inactive}
                  fill={focused ? COLORS.primary : COLORS.inactive}
                />
              ),
            }}
          />
        </Tabs>
      </SafeAreaView>
    </View>
  );
}
