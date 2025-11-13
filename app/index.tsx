import { Text, View} from "react-native";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-3xl">this is a tezadsffdsft.</Text>
      <StatusBar style="auto"></StatusBar>
      <Link href="/profile" style={{color: "blue"}}>Go to profile</Link>

    </View>
  );
}



