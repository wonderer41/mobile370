import { View, Text, Image, ImageSourcePropType } from 'react-native'
import React from 'react'
import { Tabs, Redirect } from 'expo-router';

import { icons } from '../../constants';

interface TabIconProps{
    icon: ImageSourcePropType;
    color: string;
    name: string;
    focused: boolean;
}

const TabIcon = ({icon, color, focused, name }: TabIconProps) => {
    return(
        <View className='items-center justify-center gap-1 w-16'>
            <Image 
            source={icon}
            resizeMode="contain"
            tintColor={color}
            className="w-7 h-7 mt-8"
            />
            <Text className={`${focused ? 'font-psemibold': 'font-pregular'} text-xs`} 
            style={{color: color}}
            numberOfLines={1}
            >
                {name}
            </Text>
        </View>
    )
}

const TabsLayout = () => {
  return (
    <>
    <Tabs
    screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#F7901E',
        tabBarInactiveTintColor: '#4A4545',
        tabBarStyle: {
            backgroundColor: '#B6B8BA',
            borderTopWidth: 1,
            borderTopColor: '#4E5558',
            height: 84,
        }
    }}
    >
               <Tabs.Screen
            name='home'
            options={{
                title: "Home",
                headerShown: false,
                tabBarIcon: ({color, focused }) => (
                    <TabIcon 
                    icon={icons.home}
                    color={color}
                    name="Home"
                    focused={focused}

                    />
                )
            }

            }
        />
        <Tabs.Screen
            name='bookmark'
            options={{
                title: "Bookmark",
                headerShown: false,
                tabBarIcon: ({color, focused }) => (
                    <TabIcon 
                    icon={icons.bookmark}
                    color={color}
                    name="Bookmark"
                    focused={focused}

                    />
                )
            }

            }
        />
 
    <Tabs.Screen
            name='create'
            options={{
                title: "Create",
                headerShown: false,
                tabBarIcon: ({color, focused }) => (
                    <TabIcon 
                    icon={icons.plus}
                    color={color}
                    name="Create"
                    focused={focused}

                    />
                )
            }

            }
        />
    <Tabs.Screen
            name='profile'
            options={{
                title: "Profile",
                headerShown: false,
                tabBarIcon: ({color, focused }) => (
                    <TabIcon 
                    icon={icons.profile}
                    color={color}
                    name="Profile"
                    focused={focused}

                    />
                )
            }

            }
        />
    </Tabs>
    </>
  )
}

export default TabsLayout