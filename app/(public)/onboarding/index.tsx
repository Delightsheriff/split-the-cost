import OnboardingItem from "@/src/components/ui/onboardingItem";
import OnboardingPaginator from "@/src/components/ui/onboardingPaginator";
import { useRouter } from "expo-router";
import { ArrowRight, Wallet } from "lucide-react-native";
import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Pressable,
  Text,
  View,
  ViewToken,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import onboardingData from "../../../src/services/data";

const Onboarding = () => {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToIndex = useCallback((index: number) => {
    slidesRef.current?.scrollToIndex({ index, animated: true });
  }, []);

  const handleSkip = useCallback(() => {
    router.push("/(public)/auth/login");
  }, [router]);

  const handleNext = useCallback(() => {
    if (currentIndex < onboardingData.length - 1) {
      scrollToIndex(currentIndex + 1);
    } else {
      router.push("/(public)/auth/register");
    }
  }, [currentIndex, router, scrollToIndex]);

  return (
    <SafeAreaView className="flex-1 bg-background-dark">
      {/* Header with padding */}
      <View className="px-6 flex-row items-center justify-between pt-4 pb-2">
        <View className="flex-row items-center gap-2">
          <View className="w-10 h-10 rounded-xl bg-primary items-center justify-center shadow-lg shadow-primary/20">
            <Wallet size={24} color="#102216" />
          </View>
          <View className="flex-row items-center">
            <Text className="text-xl font-extrabold tracking-tight text-white font-manropeBold">
              Split
            </Text>
            <Text className="text-xl font-extrabold tracking-tight text-primary font-manropeBold">
              It
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleSkip}
          className="px-4 py-2 active:opacity-70"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text className="text-sm text-slate-500 font-manropeBold">Skip</Text>
        </Pressable>
      </View>

      {/* FlatList - NO horizontal padding, uses full screen width */}
      <View className="flex-1">
        <FlatList
          ref={slidesRef}
          data={onboardingData}
          renderItem={({ item }) => (
            <OnboardingItem item={item} width={screenWidth} />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id.toString()}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          windowSize={3}
        />
      </View>

      {/* Footer with padding */}
      <View className="px-6 pb-6">
        <OnboardingPaginator
          data={onboardingData}
          scrollX={scrollX}
          width={screenWidth}
        />

        <Pressable
          className="bg-primary py-5 rounded-2xl items-center flex-row justify-center gap-2 shadow-lg shadow-primary/30 active:opacity-90"
          onPress={handleNext}
        >
          <Text className="text-background-dark font-manropeBold text-lg font-bold">
            Next
          </Text>
          <ArrowRight color="#102216" size={20} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Onboarding;
