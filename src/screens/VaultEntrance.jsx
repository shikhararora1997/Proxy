import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useProxy, STAGES } from '../context/ProxyContext'
import { CursorBlink } from '../components/ui/CursorBlink'

/**
 * Vault Entrance (Login/Signup)
 *
 * Simplified auth flow for demo (no passwords):
 * - Ask if new user → Yes/No
 * - New user: enter name → create profile → onboarding
 * - Existing user: enter name → lookup profile → dashboard
 */
export function VaultEntrance() {
  const { login, createUser, isOnline } = useAuth()
  const { setStage, setUsername } = useProxy()

  // Modes: 'ask' -> 'identify' (existing) or 'create' (new) -> 'processing' -> 'result'
  const [mode, setMode] = useState('ask')
  const [isNewUser, setIsNewUser] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null) // 'granted' | 'denied'

  const inputRef = useRef(null)

  useEffect(() => {
    if (mode === 'identify' || mode === 'create') {
      const timer = setTimeout(() => inputRef.current?.focus(), 500)
      return () => clearTimeout(timer)
    }
  }, [mode])

  const handleNewUserChoice = (isNew) => {
    setIsNewUser(isNew)
    setMode(isNew ? 'create' : 'identify')
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return

    setMode('processing')
    setError(null)

    if (isNewUser) {
      // Clear any old localStorage data for fresh start
      localStorage.removeItem('proxy_answers')
      localStorage.removeItem('proxy_persona_id')
      localStorage.removeItem('proxy_accepted')
      localStorage.removeItem('proxy_chat_history')
      localStorage.removeItem('proxy_ledger_entries')

      // Create new user
      const { data, error: createError } = await createUser(trimmed)

      if (createError) {
        setResult('denied')
        setError(createError.message)
        setTimeout(() => {
          setMode('create')
          setResult(null)
          setName('')
        }, 2000)
        return
      }

      // Success - new user goes to onboarding
      setResult('granted')
      setUsername(trimmed)
      setTimeout(() => {
        setStage(STAGES.DIAGNOSTIC)
      }, 1500)
    } else {
      // Find existing user
      const { data, error: loginError } = await login(trimmed)

      if (loginError) {
        setResult('denied')
        setError(loginError.message)
        setTimeout(() => {
          setMode('identify')
          setResult(null)
          setName('')
        }, 2000)
        return
      }

      // Success - existing user goes to dashboard
      setResult('granted')
      setUsername(data.display_name || trimmed)
      setTimeout(() => {
        // Check if they have a persona (completed onboarding)
        if (data.persona_id) {
          setStage(STAGES.DASHBOARD)
        } else {
          // No persona yet, send to onboarding
          setStage(STAGES.DIAGNOSTIC)
        }
      }, 1500)
    }
  }

  return (
    <div className="h-screen-safe w-full bg-black flex items-center justify-center overflow-hidden">
      {/* Scan lines overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255, 255, 255, 0.1) 2px,
            rgba(255, 255, 255, 0.1) 4px
          )`,
        }}
      />

      {/* Result overlay */}
      <AnimatePresence>
        {result && (
          <ResultOverlay result={result} error={error} />
        )}
      </AnimatePresence>

      {/* Main content */}
      <motion.div
        className="w-full max-w-md px-6"
        animate={{
          x: result === 'denied' ? [0, -10, 10, -10, 10, 0] : 0,
        }}
        transition={{ duration: 0.4 }}
      >
        {/* Offline warning */}
        {!isOnline && (
          <motion.div
            className="mb-8 p-3 border border-yellow-500/30 rounded bg-yellow-500/10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-yellow-500/80 font-mono text-xs text-center">
              OFFLINE MODE — Database not configured
            </p>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-block mb-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <LockIcon />
          </motion.div>
          <h1 className="text-white/40 font-mono text-xs tracking-[0.3em]">
            THE VAULT
          </h1>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Step 1: Ask if new user */}
          {mode === 'ask' && (
            <motion.div
              key="ask"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <p className="text-white/90 font-mono text-lg mb-8">
                Are you a new visitor?
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => handleNewUserChoice(true)}
                  className="px-8 py-3 border border-white/30 text-white/70 font-mono text-sm
                           hover:border-white/60 hover:text-white hover:bg-white/5
                           transition-all duration-300 tracking-wider"
                >
                  YES
                </button>
                <button
                  onClick={() => handleNewUserChoice(false)}
                  className="px-8 py-3 border border-white/30 text-white/70 font-mono text-sm
                           hover:border-white/60 hover:text-white hover:bg-white/5
                           transition-all duration-300 tracking-wider"
                >
                  NO
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2a: Identify existing user */}
          {mode === 'identify' && (
            <motion.form
              key="identify"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <label className="block text-white/90 font-mono text-lg mb-6">
                Identify yourself.
              </label>
              <div className="flex items-center">
                <span className="text-white/40 font-mono mr-3">{'>'}</span>
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent text-white font-mono text-lg outline-none hide-caret"
                    autoComplete="off"
                    autoCapitalize="off"
                  />
                  <span className="absolute top-0 left-0 pointer-events-none font-mono text-lg text-transparent">
                    {name}<CursorBlink />
                  </span>
                </div>
              </div>
              <div className="mt-4 h-px bg-white/20" />
              <div className="mt-6 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('ask')
                    setName('')
                  }}
                  className="text-white/30 font-mono text-xs hover:text-white/50 transition-colors"
                >
                  ← BACK
                </button>
                <p className="text-white/20 font-mono text-xs tracking-wider">
                  PRESS ENTER
                </p>
              </div>
            </motion.form>
          )}

          {/* Step 2b: Create new user */}
          {mode === 'create' && (
            <motion.form
              key="create"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <label className="block text-white/90 font-mono text-lg mb-6">
                What's your name?
              </label>
              <div className="flex items-center">
                <span className="text-white/40 font-mono mr-3">{'>'}</span>
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent text-white font-mono text-lg outline-none hide-caret"
                    autoComplete="off"
                    autoCapitalize="words"
                  />
                  <span className="absolute top-0 left-0 pointer-events-none font-mono text-lg text-transparent">
                    {name}<CursorBlink />
                  </span>
                </div>
              </div>
              <div className="mt-4 h-px bg-white/20" />
              <div className="mt-6 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('ask')
                    setName('')
                  }}
                  className="text-white/30 font-mono text-xs hover:text-white/50 transition-colors"
                >
                  ← BACK
                </button>
                <p className="text-white/20 font-mono text-xs tracking-wider">
                  PRESS ENTER
                </p>
              </div>
            </motion.form>
          )}

          {/* Processing step */}
          {mode === 'processing' && (
            <motion.div
              key="processing"
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.p
                className="text-white/60 font-mono text-sm tracking-wider"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {isNewUser ? 'CREATING PROFILE' : 'VERIFYING IDENTITY'}
              </motion.p>
              <div className="mt-6 flex justify-center gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-white/50 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

function ResultOverlay({ result, error }) {
  const isGranted = result === 'granted'

  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background flash */}
      <motion.div
        className="absolute inset-0"
        style={{ backgroundColor: isGranted ? '#22C55E' : '#EF4444' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0.1] }}
        transition={{ duration: 0.5 }}
      />

      {/* Text */}
      <motion.div
        className="text-center z-10"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <motion.p
          className="font-mono text-2xl md:text-4xl tracking-wider font-bold"
          style={{ color: isGranted ? '#22C55E' : '#EF4444' }}
          animate={{
            textShadow: isGranted
              ? ['0 0 20px #22C55E', '0 0 40px #22C55E', '0 0 20px #22C55E']
              : ['0 0 20px #EF4444', '0 0 40px #EF4444', '0 0 20px #EF4444'],
          }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          {isGranted ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
        </motion.p>
        {error && (
          <p className="mt-4 text-white/50 font-mono text-xs">
            {error}
          </p>
        )}
      </motion.div>

      {/* Scan line effect */}
      <motion.div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
      >
        <motion.div
          className="w-full h-1"
          style={{ backgroundColor: isGranted ? '#22C55E' : '#EF4444' }}
          animate={{ y: ['-100vh', '100vh'] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>
    </motion.div>
  )
}

function LockIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      className="text-white/40"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}
