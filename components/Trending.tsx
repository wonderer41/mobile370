import React from 'react';
import { FlatList, Text } from 'react-native';

interface TrendingProps {
    posts: { $id: string; id: number }[];
}

const Trending: React.FC<TrendingProps> = ({ posts }: TrendingProps) => {
  return (
    <FlatList
    data={posts}
    keyExtractor={(item) => item.$id}
    renderItem={({item}) => (
         <Text className="text-xl text-white">Item {item.id}</Text>
        
    )}
    horizontal
    />

  )
}

export default Trending