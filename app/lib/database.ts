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
    
    // Use username for both username and full_name if fullName is empty
    const displayName = fullName && fullName.trim() !== '' ? fullName : username;
    
    // Create auth user - this will send confirmation email if email confirmation is enabled
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Store user metadata to create profile later after email confirmation
        data: {
          username: username,
          full_name: displayName,
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
    return await createUserProfile(authData.user.id, username, displayName)
    
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
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User must be authenticated to upload files')
    }
    
    // Generate unique filename with user ID for better organization
    const fileExt = file.split('.').pop() || (type === 'image' ? 'jpg' : 'mp4')
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    
    // Determine bucket name based on file type
    const bucketName = 'videos1' // Using same bucket for both
    
    // Read file as ArrayBuffer for React Native
    const response = await fetch(file)
    const arrayBuffer = await response.arrayBuffer()
    
    console.log(`Uploading ${type} to bucket: ${bucketName}, path: ${type}s/${fileName}`)
    
    // Upload file to Supabase Storage with upsert enabled to bypass some RLS issues
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(`${type}s/${fileName}`, arrayBuffer, {
        contentType: type === 'image' ? 'image/jpeg' : 'video/mp4',
        upsert: true  // Changed to true to potentially bypass RLS issues
      })

    if (error) {
      console.error('Storage upload error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      throw new Error(`Upload failed: ${error.message}`)
    }

    // Get public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path)

    if (!publicUrlData?.publicUrl) {
      throw new Error('Failed to get public URL for uploaded file')
    }

    console.log(`${type} uploaded successfully:`, publicUrlData.publicUrl)
    return publicUrlData.publicUrl
    
  } catch (error: any) {
    console.error('File upload error:', error)
    throw new Error(`File upload failed: ${error.message}`)
  }
}

// Video Functions

// Create Video Post
export async function createVideoPost(form: VideoForm) {
  try {
    console.log('Creating video post with form:', { title: form.title, userId: form.userId })
    
    // Upload files to Supabase Storage
    console.log('Uploading thumbnail:', form.thumbnail)
    console.log('Uploading video:', form.video)
    
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, 'image'),
      uploadFile(form.video, 'video'),
    ])

    console.log('Files uploaded successfully:', { thumbnailUrl, videoUrl })

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

    if (error) {
      console.error('Database insert error:', error)
      throw error
    }
    
    console.log('Video post created successfully:', data.id)
    return data
  } catch (error: any) {
    console.error('createVideoPost error:', error)
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
    
    // Transform data to match component expectations
    const transformedData = data?.map(item => ({
      $id: item.id.toString(),
      id: item.id,
      title: item.title,
      thumbnail: item.thumbnailurl,
      video: item.videourl,
      creator: {
        username: item.profiles?.username || 'Unknown',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.profiles?.username || 'User')}&background=FF9C01&color=fff&size=128`
      }
    })) || []
    
    return transformedData
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
    
    // Transform data to match component expectations
    const transformedData = data?.map(item => ({
      $id: item.id.toString(),
      id: item.id,
      title: item.title,
      thumbnail: item.thumbnailurl,
      video: item.videourl,
      creator: {
        username: item.profiles?.username || 'Unknown',
        avatar: item.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.profiles?.username || 'User')}&background=random`
      }
    })) || []
    
    return transformedData
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
    
    // Transform data to match component expectations
    const transformedData = data?.map(item => ({
      $id: item.id.toString(),
      id: item.id,
      title: item.title,
      thumbnail: item.thumbnailurl,
      video: item.videourl,
      creator: {
        username: item.profiles?.username || 'Unknown',
        avatar: item.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.profiles?.username || 'User')}&background=random`
      }
    })) || []
    
    return transformedData
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
    
    // Transform data to match component expectations  
    const transformedData = data?.map(item => ({
      $id: item.id.toString(),
      id: item.id,
      title: item.title,
      thumbnail: item.thumbnailurl,
      video: item.videourl,
      creator: {
        username: item.profiles?.username || 'Unknown',
        avatar: item.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.profiles?.username || 'User')}&background=random`
      }
    })) || []
    
    return transformedData
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

// Like Functions

// Toggle like on a video
export async function toggleLike(videoId: number) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('likes')
      .select('*')
      .eq('user_id', user.id)
      .eq('video_id', videoId)
      .single()

    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', user.id)
        .eq('video_id', videoId)

      if (error) throw error
      return { liked: false }
    } else {
      // Like
      const { error } = await supabase
        .from('likes')
        .insert([{ user_id: user.id, video_id: videoId }])

      if (error) throw error
      return { liked: true }
    }
  } catch (error: any) {
    throw new Error(error.message)
  }
}

// Get liked videos for current user
export async function getLikedVideos() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // First get the liked video IDs
    const { data: likes, error: likesError } = await supabase
      .from('likes')
      .select('video_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (likesError) throw likesError
    if (!likes || likes.length === 0) return []

    // Then get the videos with their profiles
    const videoIds = likes.map(l => l.video_id)
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select(`
        id,
        title,
        thumbnailurl,
        prompt,
        videourl,
        creator,
        created_at,
        profiles:creator (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .in('id', videoIds)

    if (videosError) throw videosError

    // Transform the data to match our Video interface
    const result = videos
      .filter((video: any) => !!video.profiles)
      .map((video: any) => ({
        $id: video.id.toString(),
        id: video.id,
        title: video.title,
        thumbnail: video.thumbnailurl,
        video: video.videourl,
        prompt: video.prompt,
        creator: {
          id: video.profiles.id,
          username: video.profiles.username,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(video.profiles.username)}&background=FF9C01&color=fff&size=128`
        },
        created_at: video.created_at
      }))
    
    return result
  } catch (error: any) {
    console.error('getLikedVideos catch error:', error)
    throw new Error(error.message)
  }
}

// Get like count for a video
export async function getLikeCount(videoId: number) {
  try {
    const { count, error } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('video_id', videoId)

    if (error) throw error
    return count || 0
  } catch (error: any) {
    throw new Error(error.message)
  }
}

// Check if current user has liked a video
export async function isVideoLiked(videoId: number) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data, error } = await supabase
      .from('likes')
      .select('*')
      .eq('user_id', user.id)
      .eq('video_id', videoId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return !!data
  } catch (error: any) {
    throw new Error(error.message)
  }
}

// Get user's total likes count
export async function getUserLikesCount(userId: string) {
  try {
    const { count, error } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) throw error
    return count || 0
  } catch (error: any) {
    throw new Error(error.message)
  }
}