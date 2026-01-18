import React, { ReactNode } from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  rightIcon?: ReactNode; // Added to support Mail, Eye, etc.
}

const InputField = ({ label, error, rightIcon, ...props }: InputFieldProps) => (
  <View className="mb-4">
    {label && (
      <Text className="text-white text-lg font-semibold font-manropeBold leading-normal pb-2 ml-1">
        {label}
      </Text>
    )}
    <View className="flex-row items-center w-full rounded-xl bg-[#1c271f] border border-gray-700 px-4">
      <TextInput
        className="flex-1 text-white h-14 text-base font-manrope"
        placeholderTextColor="#9db9a6"
        {...props}
      />
      {rightIcon && <View className="ml-2">{rightIcon}</View>}
    </View>
    {error && <Text className="text-red-500 text-sm mt-1 ml-1">{error}</Text>}
  </View>
);

export default InputField;
