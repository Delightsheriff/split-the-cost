import { accent } from "@/src/theme/tokens";
import { NativeTabs } from "expo-router/native-tabs";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabsLayout() {
  return (
    // The tab screens don't pad for the status bar themselves yet.
    <View style={{ flex: 1, backgroundColor: "#102216" }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <NativeTabs tintColor={accent.settled} minimizeBehavior="onScrollDown">
          <NativeTabs.Trigger name="index">
            <NativeTabs.Trigger.Label>Groups</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon sf={{ default: "person.3", selected: "person.3.fill" }} md="group" />
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="activity">
            <NativeTabs.Trigger.Label>Activity</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon sf={{ default: "clock", selected: "clock.fill" }} md="history" />
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="profile">
            <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon
              sf={{ default: "person.crop.circle", selected: "person.crop.circle.fill" }}
              md="account_circle"
            />
          </NativeTabs.Trigger>
        </NativeTabs>
      </SafeAreaView>
    </View>
  );
}
