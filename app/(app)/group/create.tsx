import InputField from "@/src/components/ui/InputField";
import MemberItem from "@/src/components/ui/MemberItem";
import { useAuth } from "@/src/contexts/AuthContext";
import { useCreateGroup } from "@/src/services/group.service";
import { GroupForm, groupSchema } from "@/src/types/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const CreateGroup = () => {
  const { user } = useAuth();
  const router = useRouter();
  const createGroup = useCreateGroup();
  const [emailInput, setEmailInput] = useState("");
  const authenticatedUserEmail = user?.email ?? "";

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<GroupForm>({
    resolver: zodResolver(groupSchema),
    defaultValues: { name: "", members: [authenticatedUserEmail] },
  });

  const members = watch("members");
  const additionalMembers = members.slice(1);
  const isSubmitting = createGroup.isPending;

  const handleAddEmail = () => {
    const normalized = emailInput.toLowerCase().trim();
    const emailSchema = groupSchema.shape.members.element;
    const result = emailSchema.safeParse(normalized);

    if (!result.success || !normalized || members.includes(normalized)) {
      setEmailInput("");
      return;
    }

    setValue("members", [...members, normalized], { shouldValidate: true });
    setEmailInput("");
  };

  const onSubmit = async (data: GroupForm) => {
    try {
      await createGroup.mutateAsync({
        name: data.name,
        members: Array.from(
          new Set(data.members.map((e) => e.toLowerCase().trim())),
        ),
      });
      router.back();
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        className="flex-1 bg-background-dark"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-10">
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                label="Group Name"
                placeholder="E.g., Weekend Trip"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.name?.message}
                editable={!isSubmitting}
              />
            )}
          />

          <View className="mb-4">
            <Text className="text-white text-xl font-bold font-manropeBold mb-4">
              Members
            </Text>

            <MemberItem email={authenticatedUserEmail} isUser />

            {additionalMembers.map((email) => (
              <MemberItem
                key={email}
                email={email}
                onRemove={() =>
                  setValue(
                    "members",
                    members.filter((m) => m !== email),
                    { shouldValidate: true },
                  )
                }
                disabled={isSubmitting}
              />
            ))}

            <InputField
              placeholder="Enter email address"
              value={emailInput}
              onChangeText={setEmailInput}
              onSubmitEditing={handleAddEmail}
              editable={!isSubmitting}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.members?.message}
            />

            <TouchableOpacity
              onPress={handleAddEmail}
              disabled={isSubmitting}
              className="w-full rounded-xl bg-surface-dark border-[2px] border-dashed border-white/10 py-4 items-center"
            >
              <Text className="text-primary text-lg font-semibold font-manrope">
                + Add Member
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View className="px-6 pb-8 pt-4 bg-[#0d1a0f]">
        <TouchableOpacity
          onPress={() => handleSubmit(onSubmit)()}
          disabled={isSubmitting}
          className={`w-full rounded-full py-4 items-center ${isSubmitting ? "bg-primary/50" : "bg-primary"}`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-lg font-bold font-manropeBold">
              Create Group
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CreateGroup;
