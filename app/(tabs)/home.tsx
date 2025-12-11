import EmptyState from '@/components/EmptyState';
import VideoCard from '@/components/VideoCard';
import React from 'react';
import { Alert, FlatList, Image, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchInput from '../../components/SearchInput';
import Trending from '../../components/Trending';
import { images } from '../../constants';
import { useGlobalContext } from '../context/GlobalProvider';
import { getAllPosts, getLatestPosts } from '../lib/database';
import useAppwrite from '../lib/useAppWrite';

interface HomeItem {
  id: number;
}


const Home: React.FC = () => {
  const { user } = useGlobalContext();
  const { data: posts, refetch} = useAppwrite(getAllPosts);
  const { data: latestPosts } = useAppwrite(getLatestPosts);

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
  }

  const data3: HomeItem[] = [
    { id: 1 }, 
    { id: 2 }, 
    { id: 3 }
  ];

  return (
    <SafeAreaView className="bg-primary h-full">
        
        <FlatList
          data={posts}
          keyExtractor={(item) => item.title.toString()}
          renderItem={({ item }) => (
            <View className="bg-secondary p-4 mb-3 rounded-lg">
              <VideoCard video={item}/>
            </View>
          )}
          ListHeaderComponent={() => (
            <View className='my-6 px-4 space-y-6'>
              <View className='justify-between items-start flex-row mb-6'>
                <View>
                  <Image 
                  source={images.logoSmall}
                  className='w-9 h-10 mb-2'
                  resizeMode='contain'
                  />
                </View>
                <View className='items-end'>
                  <Text className='font-pmedium text-sm text-gray-400'>
                    Welcome back 
                  </Text>
                  <Text className='text-2xl font-psemibold text-white'>
                    {user?.username || 'Guest'}
                  </Text>
                </View>
              </View>
              <SearchInput />

              <View className='w-full flex-1 pt-5 pb-8'>
                <Text className='text-gray-100 text-lg font-pregular mb-3'>
                  Latest Videos
                </Text>
                {latestPosts && latestPosts.length > 0 ? (
                  <Trending posts={latestPosts}/>
                ) : (
                  <Text className='text-gray-400 text-center'>No trending videos available</Text>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={() => (
            <EmptyState
              title="No videos found"
              subtitle='be the first to upload a video'
           />
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
        />
      
    </SafeAreaView>
  )
}

export default Home