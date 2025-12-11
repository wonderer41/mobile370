import { icons } from '@/constants';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useState } from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import { getLikeCount, isVideoLiked, toggleLike } from '../app/lib/database';

interface VideoCardProps {
  video: {
    id?: number;
    title: string;
    thumbnail: string;
    video: string;
    creator: {
      username: string;
      avatar: string;
    };
  };
}

const VideoCard: React.FC<VideoCardProps> = ({video: {id, title, thumbnail, video, creator:{ username, avatar}} }) => {
  const [play, setPlay] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  
  // Check if it's a direct video URL
  const isDirectVideo = video && (
    video.includes('.mp4') || 
    video.includes('.m3u8') ||
    video.includes('.mov')
  );
  
  const videoSource = isDirectVideo ? { uri: video } : null;
  
  // Create video player
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = false;
    player.muted = false;
  });

  // Check if video is liked on mount
  React.useEffect(() => {
    const checkLikedAndCount = async () => {
      if (!id) return;
      try {
        const [isLiked, count] = await Promise.all([
          isVideoLiked(id),
          getLikeCount(id)
        ]);
        setLiked(isLiked);
        setLikeCount(count);
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };
    checkLikedAndCount();
  }, [id]);

  const handleLike = async () => {
    if (!id) return;
    
    try {
      const result = await toggleLike(id);
      setLiked(result.liked);
      setLikeCount(prev => result.liked ? prev + 1 : prev - 1);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to like video');
    }
  };

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

  // Listen for status changes
  React.useEffect(() => {
    if (!player) return;
    
    const subscription = player.addListener('statusChange', ({ status, error }) => {
      if (error) {
        console.error('Video error:', error.message);
        setHasError(true);
      }
      if (status === 'readyToPlay') {
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
    
    if (play) {
      player.play();
    } else {
      player.pause();
    }
  }, [play, player]);
  
  return (
    <View className='flex-col items-center px-4 mb-14'>
        {/* Header with avatar, title, and menu */}
        <View className='flex-row gap-3 items-start w-full'>
            <View className='w-[46px] h-[46px] rounded-lg border border-secondary justify-center items-center p-0.5'>
                <Image 
                  source={{ uri: avatar }} 
                  className='w-full h-full rounded-lg'
                  resizeMode='cover'
                />
            </View>
            <View className='justify-center flex-1 ml-3'>
                <Text className='text-white text-sm font-pmediumbold'
                    numberOfLines={1}
                >
                    {title}
                </Text>
                <Text className='text-xs text-gray-100 font-pregular'
                    numberOfLines={1}>
                    {username}
                </Text>
            </View>
            <View className='flex-row items-center gap-4 pt-2'>
                {/* Like button */}
                <TouchableOpacity onPress={handleLike} className='flex-row items-center gap-1'>
                  <Image 
                    source={icons.like}
                    className='w-5 h-5'
                    resizeMode='contain'
                    tintColor={liked ? '#FF9C01' : '#FFFFFF'}
                  />
                  {likeCount > 0 && (
                    <Text className='text-white text-xs font-pregular'>
                      {likeCount}
                    </Text>
                  )}
                </TouchableOpacity>
                {/* Menu icon */}
                <Image source={icons.menu}
                    className='w-5 h-5'
                    resizeMode='contain'
                    />
            </View>
        </View>
        
        {/* Video section */}
        {play ? (
            <View style={{ width: '100%', height: 240, borderRadius: 12, overflow: 'hidden', marginTop: 12, backgroundColor: '#000' }}>
              {!isDirectVideo || hasError ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                  <Text style={{ color: '#fff', textAlign: 'center', marginBottom: 10 }}>
                    {!isDirectVideo ? 'Vimeo embed URLs not supported' : 'Failed to load video'}
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
              className='w-full h-60 rounded-xl mt-3 relative justify-center items-center'
            >
                <Image 
                  source={{uri: thumbnail}}
                  className='w-full h-full rounded-xl'
                  resizeMode='cover'
                />
                <Image 
                  source={icons.play}
                  className='w-12 h-12 absolute'
                  resizeMode='contain'
                />
            </TouchableOpacity>
        )}
    </View>
  )
}

export default VideoCard