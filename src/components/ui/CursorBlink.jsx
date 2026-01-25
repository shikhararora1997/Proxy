import { motion } from 'framer-motion'

export function CursorBlink({ className = '' }) {
  return (
    <motion.span
      className={`inline-block w-[2px] h-[1.1em] bg-white ml-[2px] align-middle ${className}`}
      animate={{ opacity: [1, 0, 1] }}
      transition={{
        duration: 1.2,
        repeat: Infinity,
        ease: 'easeInOut',
        times: [0, 0.5, 1],
      }}
    />
  )
}
