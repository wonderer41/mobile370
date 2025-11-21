import React, { useState } from 'react'
import { ScrollView, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Formfield from '../../components/Formfield'

const Create = () => {

  const [form , setForm ] = useState({
    title: '',
    video: null,
    thumbnail: null,
    prompt: ''
  })

  return (
  <SafeAreaView className='bg-primary h-full'>
    <ScrollView className='px-4 my-6'>
      <Text className='text-white text-2xl text-white font-psemibold'>
        Upload Video
        </Text>
      <Formfield
        title="Video Title"
      />
    </ScrollView>

  </SafeAreaView>
  )
}

export default Create