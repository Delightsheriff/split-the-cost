import { useTheme } from "@/src/theme/theme";
import React, { ReactNode } from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  rightIcon?: ReactNode;
}

const InputField = ({ label, error, rightIcon, ...props }: InputFieldProps) => {
  const { colors } = useTheme();
  return (
    <View className="mb-4">
      {label && <Text className="text-ink-muted font-manropeSemi text-[13px] pb-2 ml-1">{label}</Text>}
      <View className={`flex-row items-center w-full rounded-2xl bg-surface border px-4 ${error ? "border-neg" : "border-line"}`}>
        <TextInput
          className="flex-1 text-ink h-14 text-base font-manropeSemi"
          placeholderTextColor={colors.inkFaint}
          accessibilityLabel={label}
          {...props}
        />
        {rightIcon && <View className="ml-2">{rightIcon}</View>}
      </View>
      {error && <Text className="text-neg font-manropeSemi text-[13px] mt-1.5 ml-1">{error}</Text>}
    </View>
  );
};

export default InputField;
