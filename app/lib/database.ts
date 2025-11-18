import { supabase } from './supabase'

// Types for our database
export interface Profile {
  id: string
  username: string
  full_name: string
  avatar_url: string
  created_at: string
  updated_at: string
}

export interface Video {
  id: number
  title: string
  thumbnailurl: string
  prompt: string
  videourl: string
  creator: string
  created_at: string
}

export interface VideoForm {
  title: string
  prompt: string
  thumbnail: any
  video: any
  userId: string
}

// Auth Functions

// Sign Up - Create user and profile
export async function createUser(email: string, password: string, username: string, fullName: string) {
  try {
    console.log('Creating user with email:', email)
    
    // Create auth user - this will send confirmation email if email confirmation is enabled
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Store user metadata to create profile later after email confirmation
        data: {
          username: username,
          full_name: fullName,
        }
      }
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('User creation failed')

    console.log('User created:', authData.user.id)
    console.log('Email confirmed:', authData.user.email_confirmed_at)
    console.log('Session present:', !!authData.session)

    // If email confirmation is required and user isn't confirmed yet
    if (!authData.session && !authData.user.email_confirmed_at) {
      console.log('Email confirmation required')
      return {
        needsEmailConfirmation: true,
        email: email,
        message: 'Please check your email for a confirmation link'
      }
    }

    // If user is confirmed or email confirmation is disabled, create profile
    return await createUserProfile(authData.user.id, username, fullName)
    
  } catch (error: any) {
    console.error('CreateUser error:', error)
    throw new Error(error.message)
  }
}

// Helper function to create user profile
async function createUserProfile(userId: string, username: string, fullName: string) {
  try {
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      console.log('Profile already exists for user:', userId)
      return existingProfile
    }

    console.log('Creating profile for user:', userId)

    // Create profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          username,
          full_name: fullName,
          avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
        }
      ])
      .select()
      .single()

    if (profileError) {
      console.error('Profile creation error:', profileError)
      throw profileError
    }

    console.log('Profile created successfully:', profileData)
    return profileData
  } catch (error: any) {
    console.error('Profile creation error:', error)
    throw error
  }
}

// Create profile after email confirmation
export async function createProfileAfterConfirmation() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.log('Auth error in createProfileAfterConfirmation:', error.message)
      return null
    }
    
    if (!user) {
      console.log('No authenticated user found in createProfileAfterConfirmation')
      return null
    }

    if (!user.email_confirmed_at) {
      console.log('Email not confirmed yet in createProfileAfterConfirmation')
      return null
    }

    // Get user metadata stored during signup
    const username = user.user_metadata?.username || user.email?.split('@')[0] || 'user'
    const fullName = user.user_metadata?.full_name || username

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (existingProfile) {
      console.log('Profile already exists')
      return existingProfile
    }

    // Create the profile now that email is confirmed
    return await createUserProfile(user.id, username, fullName)
  } catch (error: any) {
    console.error('Error creating profile after confirmation:', error)
    return null
  }
}

// Sign In
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  } catch (error: any) {
    throw new Error(error.message)
  }
}

// Get Current User
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    // If there's an auth error or no user, return null quietly
    if (error || !user) {
      return null
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.log('Profile error:', profileError.message)
      return null
    }

    // If profile exists but has NULL values, fix it
    if (profile && (!profile.username || !profile.full_name)) {
      console.log('Profile has NULL values, fixing...')
      return await fixNullProfile()
    }
    
    return profile
  } catch (error: any) {
    // Only log actual errors, not "no session" cases
    if (!error.message.includes('Auth session missing')) {
      console.log('Error getting current user:', error.message)
    }
    return null
  }
}

// Sign Out
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return true
  } catch (error: any) {
    throw new Error(error.message)
  }
}

// Fix existing profile with NULL values
export async function fixNullProfile() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log('No user logged in for profile fix')
      return null
    }

    // Get username from email
    const username = user.email?.split('@')[0] || 'user'
    
    // Update the profile with actual data
    const { data, error } = await supabase
      .from('profiles')
      .update({
        username: username,
        full_name: username,
        avatar_url: `https://ui-avatars.com/api/?name=${username}&background=random`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.log('Error fixing profile:', error.message)
      return null
    }
    return data
  } catch (error: any) {
    console.log('Error in fixNullProfile:', error.message)
    return null
  }
}

// Profile Functions

// Update Profile
export async function updateProfile(userId: string, updates: Partial<Profile>) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error: any) {
    throw new Error(error.message)
  }
}

// Get Profile by ID
export async function getProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  } catch (error: any) {
    throw new Error(error.message)
  }
}

// File Upload Functions

// Upload File to Supabase Storage
export async function uploadFile(file: any, type: 'image' | 'video'): Promise<string> {
  try {
    if (!file) throw new Error('No file provided')

    // For now, we'll use placeholder URLs until file upload is properly configured
    // You'll need to set up Supabase Storage and implement actual file upload
    
    // Generate unique filename
    const fileExt = file.uri?.split('.').pop() || (type === 'image' ? 'jpg' : 'mp4')
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    
    // TODO: Implement actual file upload to Supabase Storage
    // For now, return a placeholder URL
    const placeholderUrl = type === 'image' 
      ? `https://via.placeholder.com/400x300.jpg?text=${encodeURIComponent(fileName)}`
      : `https://sample-videos.com/zip/10/mp4/SampleVideo_${Math.floor(Math.random() * 10)}.mp4`
    
    return placeholderUrl
  } catch (error: any) {
    throw new Error(`File upload failed: ${error.message}`)
  }
}

// Video Functions

// Create Video Post
export async function createVideoPost(form: VideoForm) {
  try {
    // Upload files
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, 'image'),
      uploadFile(form.video, 'video'),
    ])

    // Create video record
    const { data, error } = await supabase
      .from('videos')
      .insert([
        {
          title: form.title,
          thumbnailurl: thumbnailUrl,
          videourl: videoUrl,
          prompt: form.prompt,
          creator: form.userId,
        }
      ])
      .select(`
        *,
        profiles:creator (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (error) throw error
    return data
  } catch (error: any) {
    throw new Error(error.message)
  }
}

// Get All Videos
export async function getAllPosts() {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        profiles:creator (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error: any) {
    throw new Error(error.message)
  }
}

// Get User Videos
export async function getUserPosts(userId: string) {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        profiles:creator (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('creator', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error: any) {
    throw new Error(error.message)
  }
}

// Search Videos
export async function searchPosts(query: string) {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        profiles:creator (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .ilike('title', `%${query}%`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error: any) {
    throw new Error(error.message)
  }
}

// Get Latest Videos
export async function getLatestPosts() {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        profiles:creator (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(7)

    if (error) throw error
    return data || []
  } catch (error: any) {
    throw new Error(error.message)
  }
}

// Get Video by ID
export async function getVideoById(videoId: number) {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        profiles:creator (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('id', videoId)
      .single()

    if (error) throw error
    return data
  } catch (error: any) {
    throw new Error(error.message)
  }
}