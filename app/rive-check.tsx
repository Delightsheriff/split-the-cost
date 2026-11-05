import { Fit, RiveView, useRiveFile } from "@rive-app/react-native";
import { Redirect } from "expo-router";
import { Text, View } from "react-native";

// Development-only check that the Rive runtime loads and plays a file.
// Open with splitthecostapp://rive-check. Delete once the onboarding .riv ships.
const SAMPLE = "https://cdn.rive.app/animations/vehicles.riv";

export default function RiveCheck() {
  const { riveFile, error } = useRiveFile(SAMPLE);

  if (!__DEV__) return <Redirect href="/" />;

  return (
    <View style={{ flex: 1, backgroundColor: "#F4F4F1", justifyContent: "center", padding: 24, gap: 16 }}>
      <Text style={{ fontFamily: "Manrope-Bold", fontSize: 22 }}>Rive runtime check</Text>
      {riveFile ? (
        <RiveView
          file={riveFile}
          autoPlay
          fit={Fit.Contain}
          style={{ width: "100%", height: 360 }}
          onError={(e) => console.error("Rive error:", e.message)}
        />
      ) : (
        <Text style={{ fontFamily: "Manrope-Regular" }}>{error ? `Failed: ${error.message}` : "Loading…"}</Text>
      )}
    </View>
  );
}
