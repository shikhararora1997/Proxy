import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useProxy, STAGES } from '../context/ProxyContext'
import { CursorBlink } from '../components/ui/CursorBlink'
import { LensFocus } from '../components/transitions/LensFocus'

export function StealthEntry() {
  const { setUsername, setStage } = useProxy()
  const [value, setValue] = useState('')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const inputRef = useRef(null)

  // Auto-focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 800) // Delay to let entrance animation complete
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || isTransitioning) return

    setIsTransitioning(true)
  }

  const handleTransitionComplete = () => {
    setUsername(value.trim())
    setStage(STAGES.DIAGNOSTIC)
  }

  // Click anywhere to focus input
  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  return (
    <LensFocus
      isActive={isTransitioning}
      onComplete={handleTransitionComplete}
    >
      <motion.div
        className="h-screen-safe w-full bg-black flex items-center justify-center cursor-text"
        onClick={handleContainerClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="w-full max-w-lg px-6 md:px-8">
          {/* Prompt */}
          <motion.div
            className="mb-8 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <h1 className="text-white/90 text-lg md:text-xl font-mono font-light tracking-wide">
              Identify yourself.
            </h1>
          </motion.div>

          {/* Input Area */}
          <motion.form
            onSubmit={handleSubmit}
            className="relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.6,
              delay: 0.8,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <div className="flex items-center">
              {/* Terminal-style prefix */}
              <span className="text-white/40 font-mono text-base md:text-lg mr-3 select-none">
                {'> '}
              </span>

              {/* Input field */}
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full text-white font-mono text-base md:text-lg tracking-wide hide-caret bg-transparent"
                  placeholder=""
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  disabled={isTransitioning}
                />

                {/* Custom blinking cursor */}
                <span
                  className="absolute top-0 left-0 pointer-events-none font-mono text-base md:text-lg tracking-wide text-transparent"
                  aria-hidden="true"
                >
                  {value}
                  <CursorBlink />
                </span>
              </div>
            </div>

            {/* Subtle underline */}
            <motion.div
              className="mt-4 h-px bg-gradient-to-r from-white/20 via-white/10 to-transparent"
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: 1,
                delay: 1,
                ease: [0.4, 0, 0.2, 1],
              }}
            />

            {/* Hidden submit button for accessibility */}
            <button type="submit" className="sr-only">
              Submit
            </button>
          </motion.form>

          {/* Hint text */}
          <motion.p
            className="mt-8 text-white/20 text-xs font-mono tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.6,
              delay: 1.5,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            PRESS ENTER TO CONTINUE
          </motion.p>
        </div>
      </motion.div>
    </LensFocus>
  )
}
