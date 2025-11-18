import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalContext } from "../context/GlobalProvider";
import { signOut } from "../lib/database";

const Profile = () => {
  const { user, setUser, setIsLogged } = useGlobalContext();

  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLogged(false);
    router.replace("/(auth)/sign-in");
  };

  if (!user) {
    return (
      <SafeAreaView className="bg-primary h-full">
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-white text-xl mb-4">Please sign in to view profile</Text>
          <TouchableOpacity 
            className="bg-secondary px-6 py-3 rounded-lg"
            onPress={() => router.push('/(auth)/sign-in')}
          >
            <Text className="text-white font-semibold">Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-primary h-full">
      <View className="w-full flex justify-center items-center mt-6 mb-12 px-4">
        
        {/* Logout Button */}
        <TouchableOpacity
          onPress={logout}
          className="flex w-full items-end mb-10"
        >
          <Text className="text-secondary text-lg">Logout</Text>
        </TouchableOpacity>

        {/* Avatar */}
        <View className="w-16 h-16 border border-secondary rounded-lg flex justify-center items-center">
          <Image
            source={{ uri: user?.avatar_url || 'https://via.placeholder.com/64x64?text=Avatar' }}
            className="w-[90%] h-[90%] rounded-lg"
            resizeMode="cover"
          />
        </View>

        {/* Username */}
        <Text className="text-white text-lg mt-5 font-semibold">
          {user?.username || 'Username'}
        </Text>

        {/* Stats */}
        <View className="mt-5 flex flex-row">
          <View className="mr-10 items-center">
            <Text className="text-white text-xl font-semibold">0</Text>
            <Text className="text-gray-100">Posts</Text>
          </View>
          <View className="items-center">
            <Text className="text-white text-xl font-semibold">0</Text>
            <Text className="text-gray-100">Followers</Text>
          </View>
        </View>

        {/* Debug Info */}
        <View className="mt-10 w-full bg-black-200 p-4 rounded-lg">
          <Text className="text-white font-semibold mb-2">Debug Info:</Text>
          <Text className="text-gray-300 text-sm">ID: {user?.id}</Text>
          <Text className="text-gray-300 text-sm">Username: {user?.username}</Text>
          <Text className="text-gray-300 text-sm">Full Name: {user?.full_name}</Text>
        </View>

      </View>
    </SafeAreaView>
  );
};

export default Profile;