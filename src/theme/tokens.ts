/**
 * Design tokens. Neutrals and money colours change with the colour scheme and
 * reach NativeWind as CSS variables (see theme.tsx); the playful colours are the
 * same in both schemes because they always sit under dark ink.
 */

export const palette = {
  light: {
    background: "#F4F4F1",
    surface: "#FFFFFF",
    surfaceMuted: "#ECECE8",
    ink: "#0E0E10",
    inkMuted: "#6B6B70",
    inkFaint: "#A3A3A8",
    hairline: "#E2E2DE",
    /** Money text: green and red dark enough to read on white. */
    positive: "#0A8A3A",
    negative: "#D2401C",
  },
  dark: {
    background: "#0B0B0D",
    surface: "#18181B",
    surfaceMuted: "#232327",
    ink: "#F4F4F1",
    inkMuted: "#A1A1A6",
    inkFaint: "#5E5E63",
    hairline: "#26262A",
    positive: "#13EC5B",
    negative: "#FF6B4A",
  },
} as const;

/** Fills. The brand green doubles as the "settled up" colour. */
export const accent = {
  settled: "#13EC5B",
  owed: "#13EC5B",
  owes: "#FF5A36",
  /** Always readable on top of any fill colour below. */
  onFill: "#0E0E10",
} as const;

/** One colour per expense category, used for chips, rings and charts. */
export const categoryColors = {
  food: "#FF8A00",
  transport: "#2F80FF",
  supplies: "#8B5CF6",
  fuel: "#FFD400",
  other: "#FF6FAE",
} as const;

export type Category = keyof typeof categoryColors;

/** Member colours for avatars and split rings, picked by user id so a person keeps theirs everywhere. */
export const memberColors = ["#2F80FF", "#FFD400", "#FF6FAE", "#8B5CF6", "#FF8A00", "#13EC5B", "#00C2D1", "#FF5A36"] as const;

export function memberColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return memberColors[Math.abs(hash) % memberColors.length];
}

export const radius = { sm: 10, md: 16, lg: 24, xl: 32, pill: 999 } as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const type = {
  regular: "Manrope-Regular",
  semibold: "Manrope-SemiBold",
  bold: "Manrope-Bold",
  heavy: "Manrope-ExtraBold",
} as const;

export type Palette = { [K in keyof (typeof palette)["light"]]: string };
