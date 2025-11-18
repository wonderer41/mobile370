import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'
import 'react-native-url-polyfill/auto'

const supabaseUrl = 'https://kyakbdjhqzjwkvimdtgn.supabase.co'
const supabasePublishableKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5YWtiZGpocXpqd2t2aW1kdGduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNDIwMDYsImV4cCI6MjA3ODkxODAwNn0.CVPPrfZ1tYtV06D_fcnKwUxCgN3z1rSFqSNJ9vfgcLo'

// Use AsyncStorage for mobile, localStorage for web
const storage = Platform.OS === 'web' ? {
  getItem: (key: string) => {
    if (typeof window !== 'undefined') {
      return Promise.resolve(window.localStorage.getItem(key))
    }
    return Promise.resolve(null)
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value)
    }
    return Promise.resolve()
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key)
    }
    return Promise.resolve()
  },
} : AsyncStorage

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})