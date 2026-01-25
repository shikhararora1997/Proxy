import { motion } from 'framer-motion'
import { useMemo } from 'react'

/**
 * Shatter Effect
 *
 * Creates a glass-shattering transition:
 * - Screen splits into triangular shards
 * - Shards explode outward with rotation
 * - Reveals the persona color beneath
 */
export function ShatterEffect({ isActive, color, onComplete }) {
  const shards = useMemo(() => generateShards(8, 6), [])

  if (!isActive) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden"
      initial={{ opacity: 1 }}
      onAnimationComplete={onComplete}
    >
      {/* Base color revealed behind shards */}
      <motion.div
        className="absolute inset-0"
        style={{ backgroundColor: color }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      />

      {/* Shattering shards */}
      {shards.map((shard, i) => (
        <Shard key={i} shard={shard} index={i} total={shards.length} />
      ))}

      {/* Impact flash */}
      <motion.div
        className="absolute inset-0 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.8, 0] }}
        transition={{ duration: 0.3, times: [0, 0.1, 1] }}
      />

      {/* Crack lines */}
      <CrackLines />
    </motion.div>
  )
}

function Shard({ shard, index, total }) {
  const delay = index * 0.015
  const duration = 0.8 + Math.random() * 0.4

  // Random explosion direction
  const angle = Math.atan2(
    shard.centerY - 50,
    shard.centerX - 50
  )
  const distance = 150 + Math.random() * 100
  const exitX = Math.cos(angle) * distance
  const exitY = Math.sin(angle) * distance
  const rotation = (Math.random() - 0.5) * 180

  return (
    <motion.div
      className="absolute bg-black"
      style={{
        left: `${shard.x}%`,
        top: `${shard.y}%`,
        width: `${shard.width}%`,
        height: `${shard.height}%`,
        clipPath: shard.clipPath,
        transformOrigin: 'center center',
      }}
      initial={{
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1,
        opacity: 1,
      }}
      animate={{
        x: exitX,
        y: exitY,
        rotate: rotation,
        scale: 0.5,
        opacity: 0,
      }}
      transition={{
        duration,
        delay,
        ease: [0.4, 0, 0.2, 1],
      }}
    />
  )
}

function CrackLines() {
  const lines = useMemo(() => {
    const result = []
    const centerX = 50
    const centerY = 50

    // Generate radial crack lines from center
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      const length = 60 + Math.random() * 40
      result.push({
        x1: centerX,
        y1: centerY,
        x2: centerX + Math.cos(angle) * length,
        y2: centerY + Math.sin(angle) * length,
        delay: i * 0.02,
      })
    }

    // Add some connecting cracks
    for (let i = 0; i < 8; i++) {
      const startAngle = Math.random() * Math.PI * 2
      const startDist = 20 + Math.random() * 30
      const endAngle = startAngle + (Math.random() - 0.5) * 1
      const endDist = startDist + 10 + Math.random() * 20
      result.push({
        x1: centerX + Math.cos(startAngle) * startDist,
        y1: centerY + Math.sin(startAngle) * startDist,
        x2: centerX + Math.cos(endAngle) * endDist,
        y2: centerY + Math.sin(endAngle) * endDist,
        delay: 0.1 + i * 0.02,
      })
    }

    return result
  }, [])

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      {lines.map((line, i) => (
        <motion.line
          key={i}
          x1={`${line.x1}%`}
          y1={`${line.y1}%`}
          x2={`${line.x1}%`}
          y2={`${line.y1}%`}
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{
            x2: `${line.x1}%`,
            y2: `${line.y1}%`,
            opacity: 0,
          }}
          animate={{
            x2: `${line.x2}%`,
            y2: `${line.y2}%`,
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 0.3,
            delay: line.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </svg>
  )
}

/**
 * Generate a grid of triangular shards
 */
function generateShards(cols, rows) {
  const shards = []
  const cellWidth = 100 / cols
  const cellHeight = 100 / rows

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cellWidth
      const y = row * cellHeight

      // Add some randomness to vertices
      const jitter = () => (Math.random() - 0.5) * cellWidth * 0.3

      // Create two triangles per cell
      // Triangle 1: top-left to bottom-right diagonal
      shards.push({
        x,
        y,
        width: cellWidth,
        height: cellHeight,
        centerX: x + cellWidth * 0.33,
        centerY: y + cellHeight * 0.33,
        clipPath: `polygon(
          ${jitter()}% ${jitter()}%,
          ${100 + jitter()}% ${jitter()}%,
          ${jitter()}% ${100 + jitter()}%
        )`,
      })

      // Triangle 2: bottom-right portion
      shards.push({
        x,
        y,
        width: cellWidth,
        height: cellHeight,
        centerX: x + cellWidth * 0.66,
        centerY: y + cellHeight * 0.66,
        clipPath: `polygon(
          ${100 + jitter()}% ${jitter()}%,
          ${100 + jitter()}% ${100 + jitter()}%,
          ${jitter()}% ${100 + jitter()}%
        )`,
      })
    }
  }

  return shards
}
