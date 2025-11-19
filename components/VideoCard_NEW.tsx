import { icons } from '@/constants';
import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface VideoCardProps {
  video: {
    title: string;
    thumbnail: string;
    video: string;
    creator: {
      username: string;
      avatar: string;
    };
  };
}

const VideoCard: React.FC<VideoCardProps> = ({video: {title, thumbnail, video, creator:{ username, avatar}} }) => {
  const [play, setPlay] = useState(false)
  
  // Debug: Log the video data
  console.log('VideoCard - video data:', { title, thumbnail, video, creator: { username, avatar } });
  
  return (
    <View className='flex-col items-center px-4 mb-14'>
        {/* Header with avatar, title, and menu */}
        <View className='flex-row gap-3 items-start w-full'>
            <View className='w-[46px] h-[46px] rounded-lg border border-secondary justify-center items-center p-0.5'>
                <Image 
                  source={{ uri: avatar }} 
                  className='w-full h-full rounded-lg'
                  resizeMode='cover'
                  onError={() => console.log('Avatar image failed to load:', avatar)}
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
            <View className='pt-2'>
                <Image source={icons.menu}
                    className='w-5 h-5'
                    resizeMode='contain'
                    />
            </View>
        </View>
        
        {/* Video thumbnail */}
        {play ? (
            <Text className='text-white'>Playing...</Text>
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
                  onError={() => console.log('Thumbnail image failed to load:', thumbnail)}
                  onLoad={() => console.log('Thumbnail image loaded successfully:', thumbnail)}
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