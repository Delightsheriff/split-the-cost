import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

const welcome = () => {
  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 justify-center items-center bg-gray-200">
        <View className="bg-red-700 p-4 flex items-center justify-center ">
          <Text className="text-xl text-center font-bold text-blue-500">
            Welcome to Nativewind!
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default welcome;

const styles = StyleSheet.create({});
