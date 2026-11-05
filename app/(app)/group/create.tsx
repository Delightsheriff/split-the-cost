import { useAuth } from "@/src/contexts/AuthContext";
import { useCreateGroup } from "@/src/services/group.service";
import { useTheme } from "@/src/theme/theme";
import { GroupForm, groupSchema } from "@/src/types/schema";
import { Avatar } from "@/src/ui/Avatar";
import { PressableScale } from "@/src/ui/PressableScale";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Plus, X } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { ActivityIndicator, Alert, KeyboardAvoidingView, ScrollView, Text, TextInput, View } from "react-native";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CreateGroup() {
  const { user } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const createGroup = useCreateGroup();
  const [email, setEmail] = useState("");
  const me = user?.email ?? "";

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitted },
    setValue,
  } = useForm<GroupForm>({
    resolver: zodResolver(groupSchema),
    defaultValues: { name: "", members: [me] },
  });

  const name = useWatch({ control, name: "name" });
  const members = useWatch({ control, name: "members" });
  const busy = createGroup.isPending;
  const normalized = email.toLowerCase().trim();
  const canAdd = groupSchema.shape.members.element.safeParse(normalized).success && !members.includes(normalized);
  // Array.from keeps an emoji whole, so "🏖️ Beach" gets the emoji as its tile.
  const initial = Array.from(name.trim())[0]?.toUpperCase();

  const add = () => {
    if (!canAdd) return;
    setValue("members", [...members, normalized], { shouldValidate: true });
    setEmail("");
  };

  const onSubmit = async (data: GroupForm) => {
    try {
      await createGroup.mutateAsync({ name: data.name.trim(), members: [...new Set(data.members.map((e) => e.toLowerCase().trim()))] });
      router.back();
    } catch (error) {
      Alert.alert("Couldn't create group", error instanceof Error ? error.message : "");
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        <View className="flex-row items-center gap-4">
          <View className="w-16 h-16 rounded-[20px] bg-surface-muted items-center justify-center">
            <Text className="text-ink font-manropeHeavy text-2xl">{initial || "?"}</Text>
          </View>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!busy}
                autoFocus
                placeholder="Group name"
                placeholderTextColor={colors.inkFaint}
                returnKeyType="next"
                accessibilityLabel="Group name"
                className="flex-1 text-ink font-manropeHeavy text-3xl"
              />
            )}
          />
        </View>
        {errors.name && <Text className="text-neg font-manropeSemi text-[13px] mt-2">{errors.name.message}</Text>}

        <Text className="text-ink-faint font-manropeBold text-xs uppercase tracking-widest mt-10 mb-2">Who&apos;s in</Text>
        <View className="bg-surface rounded-3xl px-4">
          {members.map((m, i) => (
            <Animated.View
              key={m}
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(150)}
              layout={LinearTransition.duration(200)}
              className={`flex-row items-center gap-3 py-3 ${i > 0 ? "border-t border-line" : ""}`}
            >
              <Avatar user={i === 0 && user ? user : { _id: m, name: m }} size="sm" />
              <Text className="flex-1 text-ink font-manropeSemi text-[15px]" numberOfLines={1}>
                {i === 0 ? "You" : m}
              </Text>
              {i > 0 && (
                <PressableScale
                  onPress={() => setValue("members", members.filter((x) => x !== m), { shouldValidate: isSubmitted })}
                  disabled={busy}
                  hitSlop={10}
                  accessibilityLabel={`Remove ${m}`}
                  className="w-7 h-7 rounded-full bg-surface-muted items-center justify-center"
                >
                  <X size={14} color={colors.inkMuted} strokeWidth={2.5} />
                </PressableScale>
              )}
            </Animated.View>
          ))}

          <View className="flex-row items-center gap-3 py-2 border-t border-line">
            <TextInput
              value={email}
              onChangeText={setEmail}
              onSubmitEditing={add}
              editable={!busy}
              placeholder="Add by email"
              placeholderTextColor={colors.inkFaint}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              submitBehavior="submit"
              accessibilityLabel="Member email"
              className="flex-1 text-ink font-manropeSemi text-[15px] py-2"
            />
            <PressableScale
              onPress={add}
              disabled={!canAdd || busy}
              accessibilityLabel="Add member"
              className="w-9 h-9 rounded-full bg-ink items-center justify-center"
            >
              <Plus size={18} color={colors.background} strokeWidth={2.75} />
            </PressableScale>
          </View>
        </View>
        {errors.members && <Text className="text-neg font-manropeSemi text-[13px] mt-2">{errors.members.message}</Text>}
        <Text className="text-ink-muted font-manrope text-[13px] mt-3">You can also share an invite link once the group exists.</Text>
      </ScrollView>

      <View className="px-5 pt-3" style={{ paddingBottom: insets.bottom + 8 }}>
        <PressableScale haptic onPress={() => handleSubmit(onSubmit)()} disabled={busy} className="bg-lime rounded-full h-14 items-center justify-center">
          {busy ? <ActivityIndicator color="#0E0E10" /> : <Text className="text-onfill font-manropeBold text-base">Create group</Text>}
        </PressableScale>
      </View>
    </KeyboardAvoidingView>
  );
}
