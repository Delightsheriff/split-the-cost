import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
}

const InputField = ({ label, error, ...props }: InputFieldProps) => (
  <View className="mb-4">
    {label && (
      <Text className="text-white text-lg font-medium leading-normal font-manrope mb-4">
        {label}
      </Text>
    )}
    <View className="flex-row items-center w-full rounded-xl bg-[#1c271f] border border-gray-700 px-4">
      <TextInput
        className="flex-1 text-white h-14 text-base font-manrope"
        placeholderTextColor="#9db9a6"
        {...props}
      />
    </View>
    {error && <Text className="text-red-500 text-sm mt-1 ml-1">{error}</Text>}
  </View>
);

export default InputField;
