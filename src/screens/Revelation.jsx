import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProxy, STAGES } from '../context/ProxyContext'
import { PERSONAS, PERSONA_NAMES } from '../config/personas'
import { ShatterEffect } from '../components/effects/ShatterEffect'

/**
 * Revelation Screen (S3)
 *
 * Flow:
 * 1. "Processing" state with pulsing dots
 * 2. Screen shatters to reveal persona color
 * 3. Persona ID revealed dramatically
 * 4. Transition to Letter
 */
export function Revelation() {
  const { personaId, setStage } = useProxy()
  const [phase, setPhase] = useState('processing') // processing -> shatter -> reveal -> exit

  const persona = PERSONAS[personaId]
  const personaName = PERSONA_NAMES[personaId]
  const primaryColor = persona?.colors.primary || '#0F172A'
  const accentColor = persona?.colors.accent || '#D4AF37'

  useEffect(() => {
    // Phase 1: Processing
    const shatterTimer = setTimeout(() => {
      setPhase('shatter')
    }, 2000)

    // Phase 2: Shatter completes, show reveal
    const revealTimer = setTimeout(() => {
      setPhase('reveal')
    }, 2800)

    // Phase 3: Exit to letter
    const exitTimer = setTimeout(() => {
      setPhase('exit')
    }, 5000)

    const transitionTimer = setTimeout(() => {
      setStage(STAGES.LETTER)
    }, 5500)

    return () => {
      clearTimeout(shatterTimer)
      clearTimeout(revealTimer)
      clearTimeout(exitTimer)
      clearTimeout(transitionTimer)
    }
  }, [setStage])

  return (
    <div className="h-screen-safe w-full overflow-hidden">
      {/* Shatter effect overlay */}
      <ShatterEffect
        isActive={phase === 'shatter'}
        color={primaryColor}
      />

      {/* Processing state */}
      <AnimatePresence>
        {phase === 'processing' && (
          <motion.div
            className="absolute inset-0 bg-black flex items-center justify-center"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              <motion.p
                className="text-white/60 font-mono text-xs tracking-[0.3em] mb-8"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                PROCESSING RESULTS
              </motion.p>

              {/* Pulsing circles */}
              <div className="flex justify-center gap-3">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-white/50"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>

              {/* Scanning line effect */}
              <motion.div
                className="mt-12 w-48 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto"
                animate={{ x: [-100, 100] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reveal state - shows after shatter */}
      <AnimatePresence>
        {(phase === 'reveal' || phase === 'exit') && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: primaryColor }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="text-center px-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: phase === 'exit' ? 0 : 1,
                scale: phase === 'exit' ? 1.1 : 1,
                y: phase === 'exit' ? -20 : 0,
              }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* Profile identified label */}
              <motion.p
                className="text-white/50 font-mono text-xs tracking-[0.3em] mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                PROFILE IDENTIFIED
              </motion.p>

              {/* Persona name reveal */}
              <motion.h1
                className="font-serif text-4xl md:text-6xl lg:text-7xl font-medium tracking-wide"
                style={{ color: accentColor }}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: 0.4,
                  duration: 0.8,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                {personaName}
              </motion.h1>

              {/* Decorative line */}
              <motion.div
                className="mt-8 h-px w-24 mx-auto"
                style={{ backgroundColor: accentColor }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              />

              {/* Archetype subtitle */}
              <motion.p
                className="mt-6 text-white/40 font-mono text-xs tracking-widest"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                {personaId === 'p1' && 'THE CUSTODIAN'}
                {personaId === 'p2' && 'THE TACTICIAN'}
                {personaId === 'p3' && 'THE SAGE'}
                {personaId === 'p4' && 'THE DISRUPTOR'}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
