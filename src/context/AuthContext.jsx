import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AuthContext = createContext(null)

// Hash password using SHA-256 (for demo purposes - production would use bcrypt)
async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(isSupabaseConfigured())

  // Check for existing session on mount
  useEffect(() => {
    const savedUserId = localStorage.getItem('proxy_user_id')
    if (savedUserId && isSupabaseConfigured()) {
      fetchProfile(savedUserId)
    } else {
      setLoading(false)
    }
  }, [])

  // Fetch user profile by ID
  const fetchProfile = async (userId) => {
    if (!supabase) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (data) {
      setProfile(data)
      localStorage.setItem('proxy_user_id', data.id)
    } else {
      if (error) console.log('Profile fetch error:', error.message)
      localStorage.removeItem('proxy_user_id')
    }

    setLoading(false)
    return data
  }

  // Login - find existing user by username and verify password
  const login = async (username, password) => {
    if (!supabase) {
      return { error: { message: 'Database not configured' } }
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username.toLowerCase())
      .maybeSingle()

    if (error) {
      console.log('Login error:', error)
      return { error: { message: 'Login failed' } }
    }

    if (!data) {
      return { error: { message: 'User not found' } }
    }

    // Verify password
    const passwordHash = await hashPassword(password)
    if (data.password_hash !== passwordHash) {
      return { error: { message: 'Incorrect password' } }
    }

    setProfile(data)
    localStorage.setItem('proxy_user_id', data.id)
    return { data, error: null }
  }

  // Create new user with password
  const createUser = async (username, password) => {
    if (!supabase) {
      return { error: { message: 'Database not configured' } }
    }

    // Check if username already exists (use maybeSingle to avoid 406 error)
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .maybeSingle()

    if (existing) {
      return { error: { message: 'Name already taken' } }
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create new profile
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        username: username.toLowerCase(),
        display_name: username,
        password_hash: passwordHash,
      })
      .select()
      .single()

    if (error) {
      console.log('Create user error:', error)
      return { error: { message: error.message || 'Failed to create account' } }
    }

    setProfile(data)
    localStorage.setItem('proxy_user_id', data.id)
    return { data, error: null }
  }

  // Logout
  const logout = () => {
    setProfile(null)
    localStorage.removeItem('proxy_user_id')
  }

  // Update profile (e.g., set persona after onboarding)
  const updateProfile = async (updates) => {
    if (!supabase || !profile) return { error: { message: 'Not logged in' } }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id)
      .select()
      .single()

    if (error) {
      return { error }
    }

    setProfile(data)
    return { data, error: null }
  }

  const value = {
    profile,
    loading,
    isOnline,
    isAuthenticated: !!profile,
    login,
    createUser,
    logout,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
