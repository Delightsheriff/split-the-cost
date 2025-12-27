export const COLORS = {
  background: "#102216",
  tabBar: "rgba(26, 44, 34, 0.95)",
  primary: "#13ec5b",
  inactive: "#6b7280",
} as const;

export const TAB_BAR_CONFIG = {
  paddingTop: 10,
  paddingBottom: 10,
  backgroundColor: COLORS.tabBar,
  borderTopWidth: 0,
} as const;

export const TAB_LABEL_STYLE = {
  fontSize: 10,
  fontFamily: "Manrope-Regular",
  fontWeight: "medium" as const,
};
