import { View, Text, TextInput } from 'react-native'
import React, { useState } from 'react'

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

      <View className='border-2 border-zinc-800 w-full h-16 px-4 bg-slate-600 rounded-2xl focus:border-s-accent items-center'>
        <TextInput 
        className='flex-1 text-white font-psemibold text-base'
        value={value}
        placeholder={placeholder}
        placeholderTextColor='#7b7b8b'
        onChangeText={handleChangeText}
        secureTextEntry={title === 'Password' && !showPassword}
        {...props}
        />

      </View>
    </View>
  )
}

export default FormField