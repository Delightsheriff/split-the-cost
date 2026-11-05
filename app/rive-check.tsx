import { Fit, RiveView, useRiveFile, useRiveNumber, useRiveString, useViewModelInstance } from "@rive-app/react-native";
import checkRiv from "@/assets/rive/check.riv";
import { Redirect } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

// Development-only check that a bundled, data-bound Rive file renders and takes values from React.
// Open with splitthecostapp://rive-check. Delete once the onboarding .riv ships.
const steps = [
  { title: "Split bills", progress: 33 },
  { title: "Track who owes", progress: 66 },
  { title: "Settle up", progress: 100 },
];

export default function RiveCheck() {
  const { riveFile, error } = useRiveFile(checkRiv);
  const { instance } = useViewModelInstance(riveFile, { async: true });
  const { setValue: setTitle } = useRiveString("title", instance);
  const { setValue: setProgress } = useRiveNumber("progress", instance);
  // The step lives in React rather than being read back from the file, which updates asynchronously.
  const [step, setStep] = useState(-1);

  if (!__DEV__) return <Redirect href="/" />;

  const next = () => {
    const i = (step + 1) % steps.length;
    setStep(i);
    setTitle(steps[i].title);
    setProgress(steps[i].progress);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F4F4F1", justifyContent: "center", padding: 24, gap: 16 }}>
      <Text style={{ fontFamily: "Manrope-Bold", fontSize: 22 }}>Rive runtime check</Text>
      {riveFile && instance ? (
        <RiveView
          file={riveFile}
          dataBind={instance}
          autoPlay
          fit={Fit.Contain}
          style={{ width: "100%", aspectRatio: 1 }}
          onError={(e) => console.warn("Rive error:", e.message)}
        />
      ) : (
        <Text style={{ fontFamily: "Manrope-Regular" }}>{error ? `Failed: ${error.message}` : "Loading…"}</Text>
      )}
      <Pressable onPress={next} style={{ backgroundColor: "#0E0E10", borderRadius: 999, padding: 16, alignItems: "center" }}>
        <Text style={{ fontFamily: "Manrope-Bold", color: "#F4F4F1" }}>Next step ({step + 1}/{steps.length})</Text>
      </Pressable>
    </View>
  );
}
