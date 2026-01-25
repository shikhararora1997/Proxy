import { motion, AnimatePresence } from 'framer-motion'

/**
 * Camera Lens Focus Transition
 *
 * Creates a cinematic "focus pull" effect:
 * 1. Content blurs and scales slightly
 * 2. Iris/aperture closes from edges
 * 3. Complete blackout
 * 4. New content emerges
 */
export function LensFocus({
  isActive,
  onComplete,
  children,
  duration = 0.8,
}) {
  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          className="fixed inset-0 z-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={onComplete}
        >
          {/* Radial iris closing effect */}
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{
              clipPath: 'circle(150% at 50% 50%)',
            }}
            animate={{
              clipPath: 'circle(0% at 50% 50%)',
            }}
            transition={{
              duration,
              ease: [0.76, 0, 0.24, 1], // Custom easeInOutQuart
            }}
          />

          {/* Subtle blur overlay for "out of focus" feel */}
          <motion.div
            className="absolute inset-0"
            style={{
              backdropFilter: 'blur(0px)',
            }}
            animate={{
              backdropFilter: ['blur(0px)', 'blur(8px)', 'blur(0px)'],
            }}
            transition={{
              duration: duration * 0.6,
              times: [0, 0.5, 1],
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      )}

      {/* Content with subtle scale/blur when transitioning */}
      <motion.div
        key={isActive ? 'transitioning' : 'static'}
        animate={{
          scale: isActive ? 1.02 : 1,
          filter: isActive ? 'blur(4px)' : 'blur(0px)',
        }}
        transition={{
          duration: duration * 0.4,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * Simpler lens focus that just wraps content and triggers on mount/unmount
 */
export function LensFocusPage({ children }) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 1.05,
        filter: 'blur(10px)',
      }}
      animate={{
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
      }}
      exit={{
        opacity: 0,
        scale: 0.98,
        filter: 'blur(10px)',
      }}
      transition={{
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  )
}
