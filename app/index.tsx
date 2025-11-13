import { Text, View} from "react-native";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "./global.css";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">this is a tet.</Text>
      <StatusBar style="auto"></StatusBar>
      <Link href="/profile" style={{color: "blue"}}>Go to profile</Link>

    </View>
  );
}



