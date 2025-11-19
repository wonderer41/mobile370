import { icons } from '@/constants';
import React, { useState } from 'react';
import { FlatList, Image, ImageBackground, Text, TouchableOpacity, View } from 'react-native';

interface TrendingItemProps {
  activeItem: string;
  item: {
    $id?: string;
    id?: string | number;
    thumbnail: string;
  };
}

const TrendingItem: React.FC<TrendingItemProps> = ({activeItem, item}) => {
  const [play, setPlay] = useState(false)

    return (
        <View className="mr-4">
          {play ? (
            <Text className='text-white'>Playing...</Text>
          ) : (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setPlay(true)}
              className='relative justify-center items-center'
            >
                <ImageBackground
                  source={{ uri: item.thumbnail }}
                  className='w-56 h-72 rounded-[35px] my-5 overflow-hidden shadow-lg shadow-black/40'
                  resizeMode='cover'
                  style={{ justifyContent: 'center', alignItems: 'center' }}
                >
                  <Image 
                    source={icons.play}
                    className='w-12 h-12'
                    resizeMode='contain'
                  />
                </ImageBackground>

              </TouchableOpacity>
             ) }

        </View>
    )
};


interface TrendingProps {
    posts: { 
      $id?: string; 
      id?: string | number;
      thumbnail: string; 
    }[];
}

const Trending: React.FC<TrendingProps> = ({ posts }) => {
  const [activeItem, setActiveItem] = useState<string>('');

  // Set initial active item when posts change
  React.useEffect(() => {
    if (posts && posts.length > 0) {
      const firstItemId = posts[0].$id || posts[0].id?.toString() || '0';
      setActiveItem(firstItemId);
    }
  }, [posts]);

  // Early return if no posts to avoid rendering empty FlatList
  if (!posts || posts.length === 0) {
    return null;
  }

  const viewableItemsChanged = ({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems.length > 0) {
      const itemId = viewableItems[0].item.$id || viewableItems[0].item.id?.toString() || '0';
      setActiveItem(itemId);
    }
  };

  return (
    <FlatList
      data={posts}
      keyExtractor={(item, index) => {
        // Ensure we always have a unique key
        const key = item.$id || item.id || `trending-item-${index}`;
        return key.toString();
      }}
      renderItem={({item, index}) => {
        return <TrendingItem activeItem={activeItem} item={item} />;
      }}
      onViewableItemsChanged={viewableItemsChanged}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 50
      }}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingLeft: 20,
        paddingRight: 20,
      }}
      decelerationRate='normal'
    />
  );
}

export default Trending