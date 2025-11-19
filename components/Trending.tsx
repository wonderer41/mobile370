import { icons } from '@/constants';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useState } from 'react';
import { FlatList, Image, ImageBackground, Text, TouchableOpacity, View } from 'react-native';

interface TrendingItemProps {
  activeItem: string;
  item: {
    $id?: string;
    id?: string | number;
    thumbnail: string;
    video: string;
  };
}

const TrendingItem: React.FC<TrendingItemProps> = ({activeItem, item}) => {
  const [play, setPlay] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Create player with video source - check if it's a direct video URL
  const isDirectVideo = item.video && (
    item.video.includes('.mp4') || 
    item.video.includes('.m3u8') ||
    item.video.includes('.mov')
  );
  
  const videoSource = isDirectVideo ? { uri: item.video } : null;
  
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = false;
    player.muted = false;
  });

  // Listen for playback end
  React.useEffect(() => {
    if (!player) return;
    
    const subscription = player.addListener('playToEnd', () => {
      setPlay(false);
      player.pause();
      player.currentTime = 0;
    });

    return () => {
      subscription.remove();
    };
  }, [player]);

  // Listen for status changes to debug
  React.useEffect(() => {
    if (!player) return;
    
    const subscription = player.addListener('statusChange', ({ status, error }) => {
      console.log('Video status:', status, 'for URL:', item.video);
      if (error) {
        console.error('Video error:', error.message);
        setHasError(true);
      }
      if (status === 'readyToPlay') {
        console.log('Video ready to play!');
        setHasError(false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [player]);

  // Control playback based on play state
  React.useEffect(() => {
    if (!player) return;
    
    console.log('Play state changed:', play, 'Video URL:', item.video, 'Is direct video:', isDirectVideo);
    
    if (play) {
      if (!isDirectVideo) {
        console.warn('This is not a direct video URL. Vimeo embed URLs need to be converted to direct video URLs.');
      }
      player.play();
    } else {
      player.pause();
    }
  }, [play, player]);

    return (
        <View className="mr-4">
          {play ? (
            <View style={{ width: 224, height: 288, borderRadius: 35, overflow: 'hidden', marginVertical: 20, backgroundColor: '#000' }}>
              {!isDirectVideo || hasError ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                  <Text style={{ color: '#fff', textAlign: 'center', marginBottom: 10 }}>
                    {!isDirectVideo ? 'Vimeo embed URLs not supported' : 'Failed to load video'}
                  </Text>
                  <Text style={{ color: '#999', fontSize: 12, textAlign: 'center' }}>
                    {item.video}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setPlay(false)}
                    style={{ marginTop: 20, padding: 10, backgroundColor: '#333', borderRadius: 5 }}
                  >
                    <Text style={{ color: '#fff' }}>Go Back</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <VideoView 
                  player={player}
                  style={{ width: '100%', height: '100%' }}
                  contentFit='contain'
                  nativeControls={true}
                />
              )}
            </View>
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
      video: string;
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