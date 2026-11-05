import { categoryColors, type Category } from "@/src/theme/tokens";
import { CarFront, Fuel, ShoppingBasket, Sparkles, UtensilsCrossed, type LucideIcon } from "lucide-react-native";
import React from "react";
import { View } from "react-native";

export const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  food: UtensilsCrossed,
  transport: CarFront,
  supplies: ShoppingBasket,
  fuel: Fuel,
  other: Sparkles,
};

export const CATEGORY_LABELS: Record<Category, string> = {
  food: "Food",
  transport: "Transport",
  supplies: "Supplies",
  fuel: "Fuel",
  other: "Other",
};

export const asCategory = (type: string): Category => (type in categoryColors ? (type as Category) : "other");

/** The category's colour as a rounded tile with its icon. */
export function CategoryBadge({ type, size = 44 }: { type: string; size?: number }) {
  const category = asCategory(type);
  const Icon = CATEGORY_ICONS[category];
  return (
    <View
      style={{ width: size, height: size, borderRadius: size * 0.32, backgroundColor: categoryColors[category] }}
      className="items-center justify-center"
    >
      <Icon size={size * 0.48} color="#0E0E10" strokeWidth={2.25} />
    </View>
  );
}
