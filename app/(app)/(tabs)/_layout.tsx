import { useTheme } from "@/src/theme/theme";
import { NativeTabs } from "expo-router/native-tabs";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    // The tab screens draw their own titles, so they only need the status bar inset.
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <NativeTabs tintColor={colors.ink} minimizeBehavior="onScrollDown">
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
  );
}
