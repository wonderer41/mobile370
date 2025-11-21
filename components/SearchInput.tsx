import React, { useState } from 'react';
import { Alert, Image, TextInput, TouchableOpacity, View } from 'react-native';

import { router, usePathname } from 'expo-router';
import { icons } from '../constants';

interface SearchInputProps {
    initialQuery?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({ initialQuery }) => {
    const pathname = usePathname();
    const [query, setQuery] = useState(initialQuery || '');

    // Sync internal state when initialQuery changes
    React.useEffect(() => {
        if (initialQuery !== undefined) {
            setQuery(initialQuery);
        }
    }, [initialQuery]);

    return (
        <View className='border-2 border-zinc-800 w-full h-16 px-4 bg-black rounded-2xl focus:border-s-accent items-center flex-row space-x-4'>
            <TextInput 
                className='text-base mt-0.5 text-white flex-1 font-pregular'
                value={query}
                placeholder="Search for a video"
                placeholderTextColor='#cdcde0'
                onChangeText={(e) => setQuery(e)}
            />
            
            <TouchableOpacity
                onPress={() => {
                    if (!query) {
                        return Alert.alert('Missing query', "Please input something to search for");
                    }

                    if (pathname.startsWith('/search')) {
                        router.setParams({ query });   
                    } else {
                        router.push(`/search/${query}`);
                    }
                }}
            >
                <Image 
                    source={icons.search}
                    className='w-5 h-5'
                    resizeMode='contain'
                />
            </TouchableOpacity>
        </View>
    );
}

export default SearchInput