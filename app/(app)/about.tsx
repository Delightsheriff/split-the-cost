import { useTheme } from "@/src/theme/theme";
import { Moodling } from "@/src/ui/Moodling";
import { PressableScale } from "@/src/ui/PressableScale";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { ScrollView, Text, View } from "react-native";

export default function About() {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      <View className="items-center pt-6">
        <Moodling balanceCents={1} size={96} />
        <Text className="text-ink font-manropeHeavy text-2xl mt-5">{Constants.expoConfig?.name ?? "Split the Cost"}</Text>
        <Text className="text-ink-muted font-manrope text-[15px] mt-1">Version {Constants.expoConfig?.version ?? "1.0.0"}</Text>
        <Text className="text-ink-muted font-manrope text-base text-center leading-6 mt-4">
          Shared costs for flats, trips and Friday lunches, settled in as few payments as possible.
        </Text>
      </View>

      <View className="bg-surface rounded-3xl mt-8 overflow-hidden">
        <PressableScale static onPress={() => router.push("/privacy")} className="flex-row items-center px-4 h-14">
          <Text className="flex-1 text-ink font-manropeSemi text-base">Privacy policy</Text>
          <ChevronRight size={18} color={colors.inkFaint} />
        </PressableScale>
      </View>

      <Text className="text-ink-faint font-manrope text-xs text-center leading-5 mt-8">
        Characters animated with Rive. Set in Manrope.
      </Text>
    </ScrollView>
  );
}
