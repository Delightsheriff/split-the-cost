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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const CreateGroup = () => {
  const { user } = useAuth();
  const router = useRouter();

  const authenticatedUserEmail = user?.email ?? "";
  const createGroup = useCreateGroup();

  const [emailInput, setEmailInput] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<GroupForm>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      members: [authenticatedUserEmail],
    },
  });

  const members = watch("members");
  const additionalMembers = members.slice(1);

  const handleAddEmail = () => {
    const normalized = emailInput.toLowerCase().trim();

    const emailSchema = groupSchema.shape.members.element;
    const result = emailSchema.safeParse(normalized);

    if (!result.success || !normalized) {
      setEmailInput("");
      return;
    }

    if (members.includes(normalized)) {
      setEmailInput("");
      return;
    }

    setValue("members", [...members, normalized], { shouldValidate: true });
    setEmailInput("");
  };

  const handleRemoveEmail = (email: string) => {
    const filtered = members.filter((m) => m !== email);
    setValue("members", filtered, { shouldValidate: true });
  };

  const onSubmit = async (data: GroupForm) => {
    const uniqueMembers = Array.from(
      new Set(data.members.map((e) => e.toLowerCase().trim())),
    );

    if (!uniqueMembers.includes(authenticatedUserEmail)) {
      uniqueMembers.unshift(authenticatedUserEmail);
    }

    try {
      await createGroup.mutateAsync({
        name: data.name,
        members: uniqueMembers,
      });

      router.back();
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  const isSubmitting = createGroup.isPending;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        className="flex-1 bg-background-dark"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6">
          <View className="mt-10">
            {/* Group Name */}
            <View className="mb-4">
              <Text className="text-white text-lg font-medium leading-normal font-manrope mb-4">
                Group Name
              </Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View className="flex-row items-center w-full rounded-xl bg-[#1c271f] border border-gray-700 px-4">
                    <TextInput
                      className="flex-1 text-white h-14 text-base font-manrope"
                      placeholder="E.g., Weekend Trip"
                      placeholderTextColor="#9db9a6"
                      keyboardType="default"
                      autoCapitalize="words"
                      autoComplete="off"
                      returnKeyType="next"
                      editable={!isSubmitting}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  </View>
                )}
              />
              {errors.name && (
                <Text className="text-red-500 text-sm mt-1 ml-1">
                  {errors.name.message}
                </Text>
              )}
            </View>

            {/* Members */}
            <View className="mb-4">
              <Text className="text-white text-xl font-bold leading-tight tracking-[-0.015em] font-manropeBold mb-4">
                Members
              </Text>

              {/* Authenticated user (non-removable) */}
              <View className="flex-row items-center w-full rounded-xl bg-[#1c271f] border border-gray-700 px-4 h-14 mb-3">
                <Text className="flex-1 text-white text-base font-manrope">
                  {authenticatedUserEmail}
                </Text>
                <Text className="text-gray-500 text-sm">You</Text>
              </View>

              {/* Additional members */}
              {additionalMembers.map((email) => (
                <View
                  key={email}
                  className="flex-row items-center w-full rounded-xl bg-[#1c271f] border border-gray-700 px-4 h-14 mb-3"
                >
                  <Text className="flex-1 text-white text-base font-manrope">
                    {email}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveEmail(email)}
                    disabled={isSubmitting}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text className="text-gray-400 text-xl font-bold">×</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {/* Email input */}
              <View className="flex-row items-center w-full rounded-xl bg-[#1c271f] border border-gray-700 px-4 mb-3">
                <TextInput
                  className="flex-1 text-white h-14 text-base font-manrope"
                  placeholder="Enter email address"
                  placeholderTextColor="#9db9a6"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="done"
                  editable={!isSubmitting}
                  value={emailInput}
                  onChangeText={setEmailInput}
                  onSubmitEditing={handleAddEmail}
                />
                {emailInput.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setEmailInput("")}
                    disabled={isSubmitting}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text className="text-gray-400 text-xl font-bold">×</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Add Member button */}
              <TouchableOpacity
                onPress={handleAddEmail}
                disabled={isSubmitting}
                className="w-full rounded-xl bg-surface-dark border-[2px] border-dashed border-white/10 py-4 items-center"
              >
                <Text className="text-primary text-lg font-semibold font-manrope">
                  + Add Member
                </Text>
              </TouchableOpacity>

              {errors.members && (
                <Text className="text-red-500 text-sm mt-2 ml-1">
                  {errors.members.message}
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed bottom button */}
      <View className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-[#0d1a0f]">
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className={`w-full rounded-full py-4 items-center ${
            isSubmitting ? "bg-primary/50" : "bg-primary"
          }`}
          activeOpacity={0.8}
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
