import type { Section } from "@/src/content/pages";
import React, { type ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** A long read: an optional intro, then titled sections of plain paragraphs. */
export function DocPage({ sections, intro, footer }: { sections: Section[]; intro?: ReactNode; footer?: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}>
      {intro}
      {sections.map((s) => (
        <View key={s.title} className="mt-6">
          <Text className="text-ink font-manropeBold text-lg" accessibilityRole="header">
            {s.title}
          </Text>
          {s.body.map((p) => (
            <Text key={p} className="text-ink-muted font-manrope text-base leading-6 mt-2">
              {p}
            </Text>
          ))}
        </View>
      ))}
      {footer}
    </ScrollView>
  );
}
