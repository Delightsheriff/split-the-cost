import { vars } from "nativewind";
import React from "react";
import { useColorScheme, View } from "react-native";
import { palette, type Palette } from "./tokens";

const channels = (hex: string) =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(" ");

const toVars = (p: Palette) =>
  vars({
    "--bg": channels(p.background),
    "--surface": channels(p.surface),
    "--surface-muted": channels(p.surfaceMuted),
    "--ink": channels(p.ink),
    "--ink-muted": channels(p.inkMuted),
    "--ink-faint": channels(p.inkFaint),
    "--line": channels(p.hairline),
    "--pos": channels(p.positive),
    "--neg": channels(p.negative),
  });

const themes = { light: toVars(palette.light), dark: toVars(palette.dark) };

/** The palette for the current colour scheme, for places classes can't reach (headers, SVG, tab bars). */
export function useTheme() {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  return { scheme, colors: palette[scheme] } as const;
}

/** Puts the colour scheme's variables on the tree so `bg-bg`, `text-ink` and friends resolve. */
export function ThemeRoot({ children }: { children: React.ReactNode }) {
  const { scheme, colors } = useTheme();
  return <View style={[{ flex: 1, backgroundColor: colors.background }, themes[scheme]]}>{children}</View>;
}
