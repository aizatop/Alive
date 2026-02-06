import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ============================================
// ФУНКЦИИ АУТЕНТИФИКАЦИИ
// ============================================

export async function signUp(email, password, username) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    })
    
    if (error) throw error
    
    // Создаем профиль пользователя
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        { id: data.user.id, email: email, username: username }
      ])
    
    if (profileError) throw profileError
    
    return { success: true, user: data.user }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })
    
    if (error) throw error
    return { success: true, session: data.session }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export function getCurrentUser() {
  return supabase.auth.getUser()
}

// ============================================
// ФУНКЦИИ ПРОФИЛЯ
// ============================================

export async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return { success: true, profile: data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function updateUserProfile(userId, updates) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
    
    if (error) throw error
    return { success: true, profile: data[0] }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ============================================
// ФУНКЦИИ ПУТЕШЕСТВИЙ
// ============================================

export async function recordVisit(userId, country, duration = 0) {
  try {
    const { data, error } = await supabase
      .from('visits')
      .insert([
        { 
          user_id: userId, 
          country: country,
          duration_minutes: duration
        }
      ])
      .select()
    
    if (error) throw error
    return { success: true, visit: data[0] }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function getUserVisits(userId) {
  try {
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .eq('user_id', userId)
      .order('visited_at', { ascending: false })
    
    if (error) throw error
    return { success: true, visits: data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ============================================
// ФУНКЦИИ ДРУЗЕЙ
// ============================================

export async function sendFriendRequest(userId, friendId) {
  try {
    const { data, error } = await supabase
      .from('friends')
      .insert([
        { 
          user_id: userId, 
          friend_id: friendId,
          status: 'pending'
        }
      ])
      .select()
    
    if (error) throw error
    return { success: true, request: data[0] }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function acceptFriendRequest(userId, friendId) {
  try {
    const { data, error } = await supabase
      .from('friends')
      .update({ status: 'accepted' })
      .eq('user_id', friendId)
      .eq('friend_id', userId)
      .select()
    
    if (error) throw error
    return { success: true, friend: data[0] }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function getUserFriends(userId) {
  try {
    const { data, error } = await supabase
      .from('friends')
      .select('friend_id, friends(id, username, avatar_url)')
      .eq('user_id', userId)
      .eq('status', 'accepted')
    
    if (error) throw error
    return { success: true, friends: data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ============================================
// ФУНКЦИИ СООБЩЕНИЙ
// ============================================

export async function sendMessage(senderId, recipientId, content) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          sender_id: senderId,
          recipient_id: recipientId,
          content: content
        }
      ])
      .select()
    
    if (error) throw error
    return { success: true, message: data[0] }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function getMessages(userId, otherId) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${userId})`)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return { success: true, messages: data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ============================================
// REAL-TIME ПОДПИСКИ
// ============================================

export function subscribeToMessages(userId, callback) {
  return supabase
    .channel(`messages:recipient_id=eq.${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${userId}`
      },
      (payload) => {
        callback(payload.new)
      }
    )
    .subscribe()
}

export function subscribeToFriendRequests(userId, callback) {
  return supabase
    .channel(`friends:friend_id=eq.${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'friends',
        filter: `friend_id=eq.${userId}`
      },
      (payload) => {
        callback(payload.new)
      }
    )
    .subscribe()
}
