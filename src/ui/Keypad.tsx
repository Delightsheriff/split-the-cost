import type { Key } from "@/src/domain/expression";
import { useTheme } from "@/src/theme/theme";
import * as Haptics from "expo-haptics";
import { Delete } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";
import { PressableScale } from "./PressableScale";

const ROWS: Key[][] = [
  ["7", "8", "9", "÷"],
  ["4", "5", "6", "×"],
  ["1", "2", "3", "−"],
  [".", "0", "back", "+"],
];

const LABELS: Partial<Record<Key, string>> = { ".": "·", "÷": "÷", "×": "×", "−": "−", "+": "+" };
const SPOKEN: Partial<Record<Key, string>> = { ".": "point", "÷": "divide", "×": "times", "−": "minus", "+": "plus", back: "delete" };

/** A calculator keypad. Holding delete clears everything. */
export function Keypad({ onKey, onClear }: { onKey: (key: Key) => void; onClear: () => void }) {
  const { colors } = useTheme();
  return (
    <View className="gap-2">
      {ROWS.map((row, i) => (
        <View key={i} className="flex-row gap-2">
          {row.map((key) => {
            const operator = "÷×−+".includes(key);
            return (
              <PressableScale
                key={key}
                onPress={() => {
                  Haptics.selectionAsync();
                  onKey(key);
                }}
                onLongPress={
                  key === "back"
                    ? () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        onClear();
                      }
                    : undefined
                }
                accessibilityRole="button"
                accessibilityLabel={SPOKEN[key] ?? key}
                className={`flex-1 h-14 rounded-2xl items-center justify-center ${operator ? "bg-surface-muted" : "bg-surface"}`}
              >
                {key === "back" ? (
                  <Delete size={22} color={colors.ink} strokeWidth={2} />
                ) : (
                  <Text className={`font-manropeBold ${operator ? "text-ink-muted text-[30px]" : "text-ink text-2xl"}`}>{LABELS[key] ?? key}</Text>
                )}
              </PressableScale>
            );
          })}
        </View>
      ))}
    </View>
  );
}
