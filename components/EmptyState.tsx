import { router } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";
import { images } from "../constants";
import CustomButton from "./CustomButton";

interface EmptyStateProps {
  title: string;
  subtitle: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({title, subtitle}) => {
  return (
    <View className="justify-center items-center px-4">
      <Image
        source={images.empty}
        className="w-[270px] h-[215px]"
        resizeMode="contain"
      />
      <Text className="text-xl text-center font-psemibold text-white mt-2">{title}</Text>
    <Text className="font-pmedium text-sm text-gray-400">{subtitle}</Text>
    <CustomButton 
    title='Create a video'
    handlePress={() => router.push('/create')}
    containerStyles="w-full bg-accent my-5"

    />
    </View>
  );
};

export default EmptyState;
