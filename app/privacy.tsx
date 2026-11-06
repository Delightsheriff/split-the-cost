import { PRIVACY, PRIVACY_UPDATED } from "@/src/content/pages";
import { DocPage } from "@/src/ui/DocPage";
import { Text } from "react-native";

// Lives outside the signed-in and signed-out groups so both can open it.
export default function Privacy() {
  return <DocPage sections={PRIVACY} intro={<Text className="text-ink-faint font-manropeSemi text-sm">Updated {PRIVACY_UPDATED}</Text>} />;
}
