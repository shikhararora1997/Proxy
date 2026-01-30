import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useAuth } from './AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { ALL_PERSONA_IDS } from '../config/personas'

const ProxyContext = createContext(null)

// Flow stages
export const STAGES = {
  VAULT_ENTRANCE: 'vault_entrance',
  STEALTH_ENTRY: 'stealth_entry',
  DIAGNOSTIC: 'diagnostic',
  REVELATION: 'revelation',
  LETTER: 'letter',
  DASHBOARD: 'dashboard',
  REFLECTION: 'reflection', // 3-day review screen
}

export function ProxyProvider({ children }) {
  const { profile, isAuthenticated, loading: authLoading, updateProfile } = useAuth()

  const [username, setUsername] = useLocalStorage('username', null)
  const [personaId, setPersonaId] = useLocalStorage('persona_id', null)
  const [answers, setAnswers] = useLocalStorage('answers', [])
  const [hasAccepted, setHasAccepted] = useLocalStorage('accepted', false)

  // Determine initial stage based on auth state
  const getInitialStage = () => {
    // If Supabase is configured, check auth
    if (isSupabaseConfigured()) {
      if (!isAuthenticated) return STAGES.VAULT_ENTRANCE
      if (profile?.onboarding_complete) return STAGES.DASHBOARD
      if (profile?.persona_id) return STAGES.LETTER
      return STAGES.DIAGNOSTIC
    }

    // Fallback to localStorage flow (offline mode)
    if (personaId && hasAccepted) return STAGES.DASHBOARD
    if (personaId) return STAGES.LETTER
    if (answers.length > 0) return STAGES.DIAGNOSTIC
    if (username) return STAGES.DIAGNOSTIC
    return STAGES.STEALTH_ENTRY
  }

  const [stage, setStage] = useState(STAGES.VAULT_ENTRANCE)

  // Update stage when auth state changes
  useEffect(() => {
    if (!authLoading) {
      setStage(getInitialStage())
    }
  }, [authLoading, isAuthenticated, profile])

  // Sync persona to Supabase when set
  const setPersonaIdWithSync = async (id) => {
    setPersonaId(id)
    if (isSupabaseConfigured() && profile) {
      await updateProfile({ persona_id: id })
    }
  }

  // Accept proxy and mark onboarding complete
  const acceptProxy = async () => {
    setHasAccepted(true)
    if (isSupabaseConfigured() && profile) {
      await updateProfile({ onboarding_complete: true })
    }
    setStage(STAGES.DASHBOARD)
  }

  // Check if 3-day reflection should trigger (after 5pm AND 3+ days since last review)
  const shouldTriggerReflection = useCallback(() => {
    if (!profile) return false

    const now = new Date()
    const hour = now.getHours()

    // Only trigger after 5pm (17:00)
    if (hour < 17) return false

    // Check days since last review
    const lastReview = profile.last_review_at ? new Date(profile.last_review_at) : null
    if (!lastReview) {
      // First time user - check if they've been active for at least 3 days
      const createdAt = profile.created_at ? new Date(profile.created_at) : null
      if (!createdAt) return false
      const daysSinceCreation = (now - createdAt) / (1000 * 60 * 60 * 24)
      return daysSinceCreation >= 3
    }

    const daysSinceReview = (now - lastReview) / (1000 * 60 * 60 * 24)
    return daysSinceReview >= 3
  }, [profile])

  // Mark reflection as complete
  const completeReflection = async () => {
    if (isSupabaseConfigured() && profile) {
      await updateProfile({ last_review_at: new Date().toISOString() })
    }
    setStage(STAGES.DASHBOARD)
  }

  // Track rejected personas so we cycle through all before repeating
  const rejectedRef = useRef(new Set())

  const rerollPersona = useCallback(async () => {
    const current = profile?.persona_id || personaId
    rejectedRef.current.add(current)

    // If all rejected, reset the set (loop endlessly)
    if (rejectedRef.current.size >= ALL_PERSONA_IDS.length) {
      rejectedRef.current = new Set([current])
    }

    const available = ALL_PERSONA_IDS.filter(id => !rejectedRef.current.has(id))
    const next = available[Math.floor(Math.random() * available.length)]

    setPersonaId(next)
    if (isSupabaseConfigured() && profile) {
      await updateProfile({ persona_id: next })
    }

    // Go back to revelation to show the new persona dramatically
    setStage(STAGES.REVELATION)
  }, [personaId, profile, setPersonaId, updateProfile, setStage])

  // Get effective username/persona (prefer profile if authenticated)
  const effectiveUsername = profile?.username || username
  const effectivePersonaId = profile?.persona_id || personaId

  const value = {
    // State
    username: effectiveUsername,
    personaId: effectivePersonaId,
    answers,
    stage,
    hasAccepted,
    isOnline: isSupabaseConfigured(),

    // Actions
    setUsername,
    setPersonaId: setPersonaIdWithSync,
    setAnswers,
    setStage,
    setHasAccepted,

    // Helpers
    addAnswer: (answer) => setAnswers(prev => [...prev, answer]),
    acceptProxy,
    rerollPersona,
    shouldTriggerReflection,
    completeReflection,
    resetFlow: () => {
      // Clear localStorage directly to ensure clean state
      localStorage.removeItem('proxy_username')
      localStorage.removeItem('proxy_persona_id')
      localStorage.removeItem('proxy_answers')
      localStorage.removeItem('proxy_accepted')
      localStorage.removeItem('proxy_chat_history')
      localStorage.removeItem('proxy_ledger_entries')
      localStorage.removeItem('proxy_user_id')
      localStorage.removeItem('proxy_tutorial_complete')

      // Force reload to reset all state cleanly
      window.location.reload()
    },
  }

  return (
    <ProxyContext.Provider value={value}>
      {children}
    </ProxyContext.Provider>
  )
}

export function useProxy() {
  const context = useContext(ProxyContext)
  if (!context) {
    throw new Error('useProxy must be used within a ProxyProvider')
  }
  return context
}
