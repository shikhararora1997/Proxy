import { motion, AnimatePresence } from 'framer-motion'
import { PERSONAS } from '../../config/personas'

/**
 * RGB Glitch Effect
 *
 * Creates a 0.5s glitch effect with:
 * - Random X/Y offsets
 * - Color channel splitting (RGB shift)
 * - Flash in the persona's color
 */
export function GlitchEffect({ isActive, personaId, onComplete }) {
  const persona = PERSONAS[personaId]
  const color = persona?.colors.primary || '#ffffff'

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={onComplete}
        >
          {/* Base color flash */}
          <motion.div
            className="absolute inset-0"
            style={{ backgroundColor: color }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.3, 0, 0.15, 0],
            }}
            transition={{
              duration: 0.5,
              times: [0, 0.1, 0.3, 0.4, 1],
              ease: 'easeOut',
            }}
          />

          {/* Scan lines */}
          <motion.div
            className="absolute inset-0 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="w-full h-full"
              style={{
                background: `repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  rgba(0, 0, 0, 0.3) 2px,
                  rgba(0, 0, 0, 0.3) 4px
                )`,
              }}
            />
          </motion.div>

          {/* RGB shift layers */}
          <GlitchLayer color="#ff0000" offsetX={-3} offsetY={1} />
          <GlitchLayer color="#00ff00" offsetX={2} offsetY={-1} />
          <GlitchLayer color="#0000ff" offsetX={1} offsetY={2} />

          {/* Horizontal glitch bars */}
          <GlitchBars color={color} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function GlitchLayer({ color, offsetX, offsetY }) {
  return (
    <motion.div
      className="absolute inset-0"
      style={{
        backgroundColor: color,
        mixBlendMode: 'screen',
      }}
      initial={{
        opacity: 0,
        x: 0,
        y: 0,
      }}
      animate={{
        opacity: [0, 0.1, 0, 0.05, 0],
        x: [0, offsetX * 2, offsetX, offsetX * 3, 0],
        y: [0, offsetY, offsetY * 2, offsetY, 0],
      }}
      transition={{
        duration: 0.5,
        times: [0, 0.15, 0.3, 0.45, 1],
        ease: 'easeInOut',
      }}
    />
  )
}

function GlitchBars({ color }) {
  // Generate random horizontal bars
  const bars = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    top: `${15 + i * 18}%`,
    height: `${2 + Math.random() * 3}%`,
    delay: i * 0.05,
  }))

  return (
    <>
      {bars.map((bar) => (
        <motion.div
          key={bar.id}
          className="absolute left-0 right-0"
          style={{
            top: bar.top,
            height: bar.height,
            backgroundColor: color,
            mixBlendMode: 'overlay',
          }}
          initial={{
            opacity: 0,
            scaleX: 0,
            x: '-50%',
          }}
          animate={{
            opacity: [0, 0.6, 0],
            scaleX: [0, 1.5, 0],
            x: ['-50%', '0%', '50%'],
          }}
          transition={{
            duration: 0.3,
            delay: bar.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </>
  )
}
