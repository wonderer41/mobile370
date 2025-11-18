import EmptyState from '@/components/EmptyState';
import React from 'react';
import { Alert, FlatList, Image, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchInput from '../../components/SearchInput';
import Trending from '../../components/Trending';
import { images } from '../../constants';
import { getAllPosts } from '../lib/database';
import useAppwrite from '../lib/useAppWrite';

interface HomeItem {
  id: number;
}


const Home: React.FC = () => {

  const { data: posts, refetch} = useAppwrite(getAllPosts);

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

  console.log(posts);

  const data3: HomeItem[] = [
    { id: 1 }, 
    { id: 2 }, 
    { id: 3 }
  ];

  return (
    <SafeAreaView className="bg-primary h-full">
        
        <FlatList
          data={data3}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View className="bg-secondary p-4 mb-3 rounded-lg">
              <Text className="text-xl text-white">Item {item.id}</Text>
            </View>
          )}
          ListHeaderComponent={() => (
            <View className='my-6 px-4 space-y-6'>
              <View className='justify-between items-start flex-row mb-6'>
                <Text className='font-pmedium text-sm text-gray-400'>
                  Welcome back 
                </Text>
                <Text className='text-2xl font-psemibold text-white'>
                  Gerardo
                </Text>
              </View>
              <View className='mt-1.5'>
                <Image 
                source={images.logoSmall}
                className='w-9 h-10'
                resizeMode='contain'
                />

              </View>
              <SearchInput
              title='searchbar'
              value='bar'
              handleChangeText={(text) => {}}
              placeholder='search for a video'
              otherStyles='mt-1'
              />

              <View className='w-full flex-1 pt-5 pb-8'>
                <Text className='text-gray-100 text-lg font-pregular mb-3'>
                  Latest Videos
                </Text>
                <Trending posts={[
                  {$id: "1", id: 1},
                  {$id: "2", id: 2},
                  {$id: "3", id: 3}
                ]}/>

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