import EmptyState from '@/components/EmptyState';
import { icons } from '@/constants';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLikeCount, getLikedVideos, toggleLike } from '../lib/database';
import useAppwrite from '../lib/useAppWrite';

const Bookmark = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});
  const { data: likedVideos, refetch } = useAppwrite(getLikedVideos);

  // Fetch like counts for all videos
  useEffect(() => {
    const fetchLikeCounts = async () => {
      if (!likedVideos || likedVideos.length === 0) return;
      
      const counts: Record<number, number> = {};
      for (const video of likedVideos) {
        if (video.id) {
          try {
            const count = await getLikeCount(video.id);
            counts[video.id] = count;
          } catch (error) {
            console.error('Error fetching like count:', error);
          }
        }
      }
      setLikeCounts(counts);
    };
    
    fetchLikeCounts();
  }, [likedVideos]);

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

  const handleUnlike = async (videoId: number) => {
    try {
      await toggleLike(videoId);
      await refetch();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to unlike');
    }
  };

  const filteredVideos = likedVideos?.filter((video) =>
    video?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderVideoItem = ({ item }: { item: typeof likedVideos[0] }) => {
    if (!item || !item.creator) return null;
    
    return (
    <View className="mb-6">
      <View className="flex-row items-center mb-3">
        <Image
          source={{ uri: item.creator.avatar }}
          className="w-12 h-12 rounded-lg border-2 border-secondary-100"
          resizeMode="cover"
        />
        <View className="flex-1 ml-3">
          <Text className="text-white font-psemibold text-sm" numberOfLines={1}>
            {item.title}
          </Text>
          <Text className="text-gray-400 font-pregular text-xs">
            {item.creator.username}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center space-x-4">
        {/* Comment Icon */}
        <TouchableOpacity className="items-center">
          <View className="w-12 h-12 rounded-full bg-black-200 items-center justify-center">
            <Image
              source={icons.menu}
              className="w-6 h-6 tint-white"
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>

        {/* Like Button */}
        <TouchableOpacity
          onPress={() => item.id && handleUnlike(item.id)}
          className="items-center"
        >
          <View className="w-12 h-12 rounded-full bg-black-200 items-center justify-center">
            <Image
              source={icons.like}
              className="w-7 h-7"
              resizeMode="contain"
              tintColor="#FF9C01"
            />
          </View>
          {item.id && likeCounts[item.id] > 0 && (
            <Text className="text-white text-xs font-pregular mt-1">
              {likeCounts[item.id]}
            </Text>
          )}
        </TouchableOpacity>

        {/* Video Thumbnail */}
        <TouchableOpacity
          className="flex-1 ml-4"
          activeOpacity={0.7}
          onPress={() => {
            // TODO: Navigate to video detail screen
            Alert.alert('Navigate', `Open video: ${item.title}`);
          }}
        >
          <Image
            source={{ uri: item.thumbnail }}
            className="w-full h-32 rounded-2xl"
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>

      <Text className="text-gray-400 text-xs mt-2 ml-2">favorite comments</Text>
    </View>
    );
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={filteredVideos}
        keyExtractor={(item) => item.$id}
        renderItem={renderVideoItem}
        contentContainerClassName="px-4"
        ListHeaderComponent={() => (
          <View className="my-6">
            <Text className="text-white text-2xl font-psemibold mb-6">
              Liked Videos
            </Text>

            {/* Search Bar */}
            <View className="w-full h-14 px-4 bg-black-100 rounded-2xl border-2 border-black-200 focus:border-secondary flex-row items-center mb-6">
              <TextInput
                className="flex-1 text-white font-pregular text-base"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search your favorite videos"
                placeholderTextColor="#7b7b8b"
              />
              <TouchableOpacity>
                <Image
                  source={icons.search}
                  className="w-5 h-5"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No saved videos"
            subtitle="Start liking videos to see them here"
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

export default Bookmark;