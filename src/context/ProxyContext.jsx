import { createContext, useContext, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const ProxyContext = createContext(null)

// Flow stages
export const STAGES = {
  STEALTH_ENTRY: 'stealth_entry',
  DIAGNOSTIC: 'diagnostic',
  REVELATION: 'revelation',
  LETTER: 'letter',
}

export function ProxyProvider({ children }) {
  const [username, setUsername] = useLocalStorage('username', null)
  const [personaId, setPersonaId] = useLocalStorage('persona_id', null)
  const [answers, setAnswers] = useLocalStorage('answers', [])

  // Current stage in the flow
  const [stage, setStage] = useState(() => {
    // Resume from where user left off
    if (personaId) return STAGES.LETTER
    if (answers.length > 0) return STAGES.DIAGNOSTIC
    if (username) return STAGES.DIAGNOSTIC
    return STAGES.STEALTH_ENTRY
  })

  const value = {
    // State
    username,
    personaId,
    answers,
    stage,

    // Actions
    setUsername,
    setPersonaId,
    setAnswers,
    setStage,

    // Helpers
    addAnswer: (answer) => setAnswers(prev => [...prev, answer]),
    resetFlow: () => {
      setUsername(null)
      setPersonaId(null)
      setAnswers([])
      setStage(STAGES.STEALTH_ENTRY)
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
