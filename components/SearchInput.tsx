import React, { useState } from 'react';
import { Image, TextInput, TouchableOpacity, View } from 'react-native';

import { icons } from '../constants';

interface searchInputProps{
    title: string;
    value: string;
    placeholder?: string;
    handleChangeText: (text: string) => void;
    otherStyles?: string;
    [key: string]: any;
}

const SearchInput = ({title, value, placeholder, handleChangeText, otherStyles, ...props}: searchInputProps) => {

    const [showPassword, setshowPassword] = useState<boolean>(false)
  return (


      <View className='border-2 border-zinc-800 w-full h-16 px-4 bg-black rounded-2xl focus:border-s-accent items-center flex-row space-x-4'>
        <TextInput 
        className='text-base mt-0.5 text-white flex-1 font-pregular'
        value={value}
        placeholder="search for a video"
        placeholderTextColor='#7b7b8b'
        onChangeText={handleChangeText}
        secureTextEntry={title === 'Password' && !showPassword}
        {...props}
        />
        
        <TouchableOpacity>
            <Image source={icons.search}
                className='w-5 h-5'
                resizeMode='contain'

            />
        </TouchableOpacity>


      </View>
    
  )
}

export default SearchInput