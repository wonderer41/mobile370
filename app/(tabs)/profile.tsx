import { icons } from "@/constants";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Alert, FlatList, Image, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "../../components/EmptyState";
import VideoCard from "../../components/VideoCard";
import { useGlobalContext } from "../context/GlobalProvider";
import { getUserPosts, signOut } from "../lib/database";
import useAppwrite from "../lib/useAppWrite";

const Profile = () => {
  const { user, setUser, setIsLogged } = useGlobalContext();

  // Fetch user's posts only if user exists
  const getUserPostsFunction = useMemo(() => {
    if (!user?.id) {
      return () => Promise.resolve([]); // Return empty array if no user
    }
    return () => getUserPosts(user.id);
  }, [user?.id]);

  const { data: posts, refetch } = useAppwrite(getUserPostsFunction);

  const [refreshing, setRefreshing] = React.useState<boolean>(false);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await refetch();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to refresh');
    } finally {
      setRefreshing(false);
    }
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLogged(false);
    router.replace("/sign-in");
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
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id?.toString() || item.$id || Math.random().toString()}
        renderItem={({ item }) => (
          <View className="px-4 mb-3">
            <VideoCard video={item} />
          </View>
        )}
        ListHeaderComponent={() => (
          <View className="w-full flex justify-center items-center mt-6 mb-12 px-4">
            
            {/* Logout Button */}
            <TouchableOpacity
              onPress={logout}
              className="flex w-full items-end mb-10"
            >
              <Image  source={icons.logout}
              resizeMode="contain"
              className="w-6 h-6"

              />
            </TouchableOpacity>

            {/* Avatar */}
            <View className="w-16 h-16 border border-secondary rounded-lg flex justify-center items-center">
              <Image
                source={{ 
                  uri: user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=random`
                }}
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
                <Text className="text-white text-xl font-semibold">{posts?.length || 0}</Text>
                <Text className="text-gray-100">Posts</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-xl font-semibold">0</Text>
                <Text className="text-gray-100">Followers</Text>
              </View>
            </View>

            {/* My Videos Section */}
            <View className="w-full mt-8 mb-4">
              <Text className="text-white text-xl font-semibold">My Videos</Text>
            </View>

          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No videos found"
            subtitle="Upload your first video to see it here!"
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

export default Profile;