import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(isSupabaseConfigured())

  // Initialize auth state
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Fetch user profile
  const fetchProfile = async (userId) => {
    if (!supabase) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      setLoading(false)
      return null
    }

    setProfile(data)
    setLoading(false)
    return data
  }

  // Sign up with username/password
  const signUp = async (username, password) => {
    if (!supabase) {
      return { error: { message: 'Database not configured' } }
    }

    // Create auth user with username in metadata
    const { data, error } = await supabase.auth.signUp({
      email: `${username.toLowerCase()}@proxy.local`, // Fake email for auth
      password,
      options: {
        data: { username }
      }
    })

    if (error) {
      // Handle duplicate username
      if (error.message.includes('already registered')) {
        return { error: { message: 'Username already taken' } }
      }
      return { error }
    }

    return { data, error: null }
  }

  // Sign in with username/password
  const signIn = async (username, password) => {
    if (!supabase) {
      return { error: { message: 'Database not configured' } }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${username.toLowerCase()}@proxy.local`,
      password
    })

    if (error) {
      return { error }
    }

    return { data, error: null }
  }

  // Sign out
  const signOut = async () => {
    if (!supabase) return

    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  // Update profile (e.g., set persona after onboarding)
  const updateProfile = async (updates) => {
    if (!supabase || !user) return { error: { message: 'Not authenticated' } }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      return { error }
    }

    setProfile(data)
    return { data, error: null }
  }

  const value = {
    user,
    profile,
    loading,
    isOnline,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
    updateProfile,
    fetchProfile,
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
