import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'

import { icons } from '../constants';

interface FormFieldProps{
    title: string;
    value: string;
    placeholder?: string;
    handleChangeText: (text: string) => void;
    otherStyles?: string;
    [key: string]: any;
}

const FormField = ({title, value, placeholder, handleChangeText, otherStyles, ...props}: FormFieldProps) => {

    const [showPassword, setshowPassword] = useState<boolean>(false)
  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <Text className='text-base text-gray-100 font-pmedium'>{title}</Text>

      <View className='border-2 border-zinc-800 w-full h-16 px-4 bg-black rounded-2xl focus:border-s-accent items-center flex-row'>
        <TextInput 
        className='flex-1 text-white font-psemibold text-base'
        value={value}
        placeholder={placeholder}
        placeholderTextColor='#7b7b8b'
        onChangeText={handleChangeText}
        secureTextEntry={title === 'Password' && !showPassword}
        {...props}
        />
        
        {title === 'Password' && (
            <TouchableOpacity onPress={() => setshowPassword(!showPassword)}>
                <Image source={!showPassword ? icons.eye : icons.eyeHide } className='w-6 h-6' resizeMode='contain'/>
            </TouchableOpacity>
        )}

      </View>
    </View>
  )
}

export default FormField