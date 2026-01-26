import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useProxy, STAGES } from '../context/ProxyContext'
import { CursorBlink } from '../components/ui/CursorBlink'

/**
 * Vault Entrance (Login/Signup)
 *
 * Speakeasy-style authentication:
 * - Terminal aesthetic
 * - Username + Password (no email)
 * - "ACCESS GRANTED" / "ACCESS DENIED" effects
 */
export function VaultEntrance() {
  const { signIn, signUp, isOnline } = useAuth()
  const { setStage, setUsername } = useProxy()

  const [mode, setMode] = useState('identify') // identify -> password -> processing -> result
  const [isNewUser, setIsNewUser] = useState(false)
  const [username, setUsernameLocal] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null) // 'granted' | 'denied'

  const inputRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 500)
    return () => clearTimeout(timer)
  }, [mode])

  const handleUsernameSubmit = (e) => {
    e.preventDefault()
    const trimmed = username.trim()
    if (!trimmed) return

    setMode('password')
    setError(null)
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (!password) return

    setMode('processing')
    setError(null)

    // Try sign in first
    const { error: signInError } = await signIn(username, password)

    if (signInError) {
      // If invalid credentials, try signup (new user)
      if (signInError.message.includes('Invalid login credentials')) {
        const { error: signUpError } = await signUp(username, password)

        if (signUpError) {
          setResult('denied')
          setError(signUpError.message)
          setTimeout(() => {
            setMode('identify')
            setResult(null)
            setUsernameLocal('')
            setPassword('')
          }, 2000)
          return
        }

        // New user - needs onboarding
        setIsNewUser(true)
      } else {
        setResult('denied')
        setError(signInError.message)
        setTimeout(() => {
          setMode('identify')
          setResult(null)
          setUsernameLocal('')
          setPassword('')
        }, 2000)
        return
      }
    }

    // Success
    setResult('granted')
    setUsername(username)

    setTimeout(() => {
      if (isNewUser) {
        // New user goes to onboarding (diagnostic)
        setStage(STAGES.DIAGNOSTIC)
      } else {
        // Existing user goes to dashboard
        setStage(STAGES.DASHBOARD)
      }
    }, 1500)
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

        {/* Identify step */}
        <AnimatePresence mode="wait">
          {mode === 'identify' && (
            <motion.form
              key="identify"
              onSubmit={handleUsernameSubmit}
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
                    value={username}
                    onChange={(e) => setUsernameLocal(e.target.value)}
                    className="w-full bg-transparent text-white font-mono text-lg outline-none hide-caret"
                    autoComplete="username"
                    autoCapitalize="off"
                  />
                  <span className="absolute top-0 left-0 pointer-events-none font-mono text-lg text-transparent">
                    {username}<CursorBlink />
                  </span>
                </div>
              </div>
              <div className="mt-4 h-px bg-white/20" />
              <p className="mt-6 text-white/20 font-mono text-xs tracking-wider">
                PRESS ENTER TO CONTINUE
              </p>
            </motion.form>
          )}

          {/* Password step */}
          {mode === 'password' && (
            <motion.form
              key="password"
              onSubmit={handlePasswordSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-white/50 font-mono text-sm mb-2">
                IDENTITY: {username}
              </p>
              <label className="block text-white/90 font-mono text-lg mb-6">
                Enter passphrase.
              </label>
              <div className="flex items-center">
                <span className="text-white/40 font-mono mr-3">{'>'}</span>
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent text-white font-mono text-lg outline-none hide-caret tracking-widest"
                    autoComplete="current-password"
                  />
                  <span className="absolute top-0 left-0 pointer-events-none font-mono text-lg text-transparent tracking-widest">
                    {'•'.repeat(password.length)}<CursorBlink />
                  </span>
                </div>
              </div>
              <div className="mt-4 h-px bg-white/20" />
              <div className="mt-6 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('identify')
                    setPassword('')
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
                VERIFYING CREDENTIALS
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
