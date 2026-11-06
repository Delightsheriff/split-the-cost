import { useTheme } from "@/src/theme/theme";
import { ChevronLeft, X } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";

/** The top of a form sheet: a title, a close button, and a back button for multi-step sheets. */
export function SheetHeader({ title, onClose, onBack }: { title: string; onClose: () => void; onBack?: () => void }) {
  const { colors } = useTheme();
  const button = "w-9 h-9 rounded-full bg-surface items-center justify-center";
  return (
    <View className="flex-row items-center gap-3 px-5 pt-6 pb-2">
      {onBack && (
        <Pressable onPress={onBack} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back" className={button}>
          <ChevronLeft size={20} color={colors.ink} strokeWidth={2.5} />
        </Pressable>
      )}
      <Text className="flex-1 text-ink font-manropeHeavy text-xl" numberOfLines={1} accessibilityRole="header">
        {title}
      </Text>
      <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel="Close" className={button}>
        <X size={18} color={colors.inkMuted} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}
