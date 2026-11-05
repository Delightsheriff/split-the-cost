/**
 * Design tokens for the revamp. Screens move onto these one at a time;
 * until then the NativeWind classes in tailwind.config.js stay in use.
 */

export const palette = {
  light: {
    background: "#F4F4F1",
    surface: "#FFFFFF",
    surfaceMuted: "#ECECE8",
    ink: "#0E0E10",
    inkMuted: "#6B6B70",
    inkFaint: "#A3A3A8",
    hairline: "rgba(14, 14, 16, 0.08)",
  },
  dark: {
    background: "#0B0B0D",
    surface: "#18181B",
    surfaceMuted: "#232327",
    ink: "#F4F4F1",
    inkMuted: "#A1A1A6",
    inkFaint: "#5E5E63",
    hairline: "rgba(244, 244, 241, 0.08)",
  },
} as const;

/** The brand green doubles as the "settled up" colour. */
export const accent = {
  settled: "#13EC5B",
  owed: "#13EC5B",
  owes: "#FF5A36",
} as const;

/** One colour per expense category, used for chips, rings and charts. */
export const categoryColors = {
  food: "#FF8A00",
  transport: "#2F80FF",
  supplies: "#8B5CF6",
  fuel: "#FFD400",
  other: "#FF6FAE",
} as const;

/** Assigned to group members in order, for split rings and avatars. */
export const memberColors = ["#2F80FF", "#FFD400", "#0E0E10", "#8B5CF6", "#FF8A00", "#13EC5B"] as const;

export const radius = { sm: 10, md: 16, lg: 24, xl: 32, pill: 999 } as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const type = {
  regular: "Manrope-Regular",
  bold: "Manrope-Bold",
} as const;

export type Palette = (typeof palette)["light"];
