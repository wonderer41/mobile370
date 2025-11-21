import EmptyState from '@/components/EmptyState';
import VideoCard from '@/components/VideoCard';
import { useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { Alert, FlatList, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchInput from '../../components/SearchInput';
import { searchPosts } from '../lib/database';
import useAppwrite from '../lib/useAppWrite';


const Search: React.FC = () => {

  const {query} = useLocalSearchParams();
  const searchQuery = Array.isArray(query) ? query[0] : query || '';

  // Memoize the search function to prevent recreating on every render
  const searchFunction = useMemo(() => {
    return () => searchPosts(searchQuery);
  }, [searchQuery]);

  const { data: posts, refetch} = useAppwrite(searchFunction);

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
            <View className='my-6 px-4'>
                  <Text className='font-pmedium text-sm text-gray-400'>
                    Search Results
                  </Text>
                  <Text className='text-2xl font-psemibold text-white'>
                    {searchQuery}
                  </Text>
            <View className='mt-6 mb-8'>
              <SearchInput initialQuery={searchQuery}/>
            </View>
            </View>
          )}
          ListEmptyComponent={() => (
            <EmptyState
              title="No videos found"
              subtitle='No videos match your search criteria. Please try a different query.'
           />
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
        />
      
    </SafeAreaView>
  )
}

export default Search