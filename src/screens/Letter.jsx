import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useProxy } from '../context/ProxyContext'
import { PERSONAS, PERSONA_NAMES } from '../config/personas'
import { LETTERS } from '../config/letters'
import { LensFocusPage } from '../components/transitions/LensFocus'

/**
 * Letter Screen (S4)
 *
 * The personal letter from the user's Proxy.
 * Features staggered text reveal like a typewriter/printing effect.
 */
export function Letter() {
  const { username, personaId, resetFlow, acceptProxy, rerollPersona } = useProxy()
  const [showButton, setShowButton] = useState(false)

  const persona = PERSONAS[personaId]
  const letter = LETTERS[personaId]
  const primaryColor = persona?.colors.primary || '#0F172A'
  const accentColor = persona?.colors.accent || '#D4AF37'

  // Determine if background is light (for Jessica Pearson p8)
  const isLightBg = primaryColor === '#FFFFFF' || primaryColor === '#ffffff'
  const textColor = isLightBg ? '#1a1a1a' : '#ffffff'
  const mutedTextColor = isLightBg ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)'

  // Replace placeholder with actual username
  const greeting = letter?.greeting.replace('[USERNAME]', username) || `Hi ${username},`

  useEffect(() => {
    // Show button after letter animation completes
    const timer = setTimeout(() => {
      setShowButton(true)
    }, 4000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <LensFocusPage>
      <div
        className="min-h-screen w-full py-12 px-6 md:px-12 lg:px-20"
        style={{ backgroundColor: primaryColor, paddingTop: 'max(3rem, env(safe-area-inset-top, 3rem))' }}
      >
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.p
              className="font-mono text-[10px] tracking-[0.4em] uppercase"
              style={{ color: mutedTextColor }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              A Letter From Your Proxy
            </motion.p>
          </motion.div>

          {/* Letter container */}
          <motion.div
            className="relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            {/* Decorative border */}
            <motion.div
              className="absolute -left-4 top-0 bottom-0 w-px"
              style={{ backgroundColor: accentColor }}
              initial={{ scaleY: 0, originY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 1.2, delay: 1, ease: [0.4, 0, 0.2, 1] }}
            />

            {/* Greeting */}
            <motion.p
              className="font-serif text-xl md:text-2xl mb-8"
              style={{ color: accentColor }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              {greeting}
            </motion.p>

            {/* Body paragraphs with staggered reveal */}
            <div className="space-y-6">
              {letter?.body.map((paragraph, index) => (
                <motion.p
                  key={index}
                  className="font-mono text-sm md:text-base leading-relaxed"
                  style={{ color: isLightBg ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)' }}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.7,
                    delay: 1.6 + index * 0.5,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                >
                  {paragraph}
                </motion.p>
              ))}
            </div>

            {/* Signature */}
            <motion.div
              className="mt-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 3.2 }}
            >
              <p className="font-mono text-sm italic mb-2" style={{ color: mutedTextColor }}>
                {letter?.signature}
              </p>
              <motion.p
                className="font-serif text-2xl md:text-3xl font-medium"
                style={{ color: accentColor }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 3.5 }}
              >
                {letter?.name}
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Accept button */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: showButton ? 1 : 0,
              y: showButton ? 0 : 20,
            }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <motion.button
              onClick={acceptProxy}
              className="w-full p-4 md:p-5 rounded-sm font-mono text-sm tracking-wider transition-all duration-300"
              style={{
                backgroundColor: accentColor,
                color: primaryColor,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              ACCEPT MY PROXY
            </motion.button>

            {/* Reroll persona */}
            <motion.button
              onClick={rerollPersona}
              className="w-full mt-4 p-3 font-mono text-xs tracking-wider transition-colors"
              style={{
                color: `${accentColor}60`,
              }}
              whileHover={{ color: accentColor }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              NOT FOR ME — SHOW ANOTHER
            </motion.button>
          </motion.div>

          {/* Bottom decoration */}
          <motion.div
            className="mt-16 flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: showButton ? 0.3 : 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="w-8 h-px" style={{ backgroundColor: isLightBg ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)' }} />
            <span className="font-mono text-[10px] tracking-widest" style={{ color: isLightBg ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)' }}>PROXY</span>
            <div className="w-8 h-px" style={{ backgroundColor: isLightBg ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)' }} />
          </motion.div>
        </div>
      </div>
    </LensFocusPage>
  )
}
