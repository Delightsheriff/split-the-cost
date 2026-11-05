import scenes from "@/assets/rive/splitit.riv";
import { useRiveFile, type TypedRiveFile } from "@rive-app/react-native";
import React, { createContext, useContext, type ReactNode } from "react";

export type ScenesFile = TypedRiveFile<typeof scenes>;

const ScenesContext = createContext<ScenesFile | null>(null);

/** Loads the app's Rive scenes once so every Moodling and success burst shares one file. */
export function RiveScenesProvider({ children }: { children: ReactNode }) {
  const { riveFile, error } = useRiveFile(scenes);
  if (error) console.warn("Rive scenes failed to load:", error.message);
  return <ScenesContext.Provider value={riveFile ?? null}>{children}</ScenesContext.Provider>;
}

/** The loaded scenes, or null while loading or if they failed; callers draw a fallback then. */
export const useRiveScenes = () => useContext(ScenesContext);
