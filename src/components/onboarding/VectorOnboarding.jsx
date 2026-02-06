/**
 * Vector-based Onboarding Component
 *
 * 5 personality sliders + radar chart + hidden match indicators
 */

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RadarChart } from './RadarChart'
import { MatchReveal } from './MatchReveal'
import { VECTOR_AXES, PERSONAS } from '../../config/personas'
import { getTopMatches } from '../../lib/vectorMatch'

// Default starting position (center of all axes)
const DEFAULT_VECTOR = [50, 50, 50, 50, 50]

// Phases: calibration → convergence → reveal
const PHASES = {
  CALIBRATION: 'calibration',
  CONVERGENCE: 'convergence',
  REVEAL: 'reveal',
}

export function VectorOnboarding({ onComplete }) {
  const [userVector, setUserVector] = useState(DEFAULT_VECTOR)
  const [phase, setPhase] = useState(PHASES.CALIBRATION)

  // Calculate top 3 matches in real-time
  const topMatches = useMemo(() => {
    return getTopMatches(userVector, 3)
  }, [userVector])

  // Update a single axis value
  const updateAxis = useCallback((index, value) => {
    setUserVector(prev => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }, [])

  // Handle lock-in
  const handleLockIn = async () => {
    setPhase(PHASES.CONVERGENCE)
    // After convergence animation, show reveal
    setTimeout(() => {
      setPhase(PHASES.REVEAL)
    }, 1500)
  }

  // Handle continue from reveal to Letter
  const handleContinue = () => {
    onComplete(topMatches[0].personaId)
  }

  // Get persona color (for secret display)
  const getPersonaColor = (personaId) => {
    return PERSONAS[personaId]?.colors?.accent || '#666'
  }

  // Show reveal screen
  if (phase === PHASES.REVEAL) {
    return (
      <MatchReveal
        userVector={userVector}
        onContinue={handleContinue}
      />
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 overflow-hidden">
      <AnimatePresence mode="wait">
        {phase === PHASES.CALIBRATION ? (
          <motion.div
            key="onboarding"
            className="w-full max-w-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {/* Header */}
            <motion.div
              className="text-center mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-xl font-mono text-white/90 tracking-wider mb-2">
                CALIBRATE YOUR PROFILE
              </h1>
              <p className="text-xs font-mono text-white/50">
                Adjust the sliders to define your operational style
              </p>
            </motion.div>

            {/* Radar Chart */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <RadarChart
                userVector={userVector}
                accentColor="#00FFCC"
                size={260}
              />
            </motion.div>

            {/* Sliders */}
            <motion.div
              className="space-y-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {VECTOR_AXES.map((axis, index) => (
                <AxisSlider
                  key={axis.id}
                  axis={axis}
                  value={userVector[index]}
                  onChange={(v) => updateAxis(index, v)}
                  delay={index * 0.05}
                />
              ))}
            </motion.div>

            {/* Match Indicators (colors only, no names) */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-[10px] font-mono text-white/40 text-center mb-3 tracking-wider">
                SIGNAL DETECTED
              </p>
              <div className="flex justify-center gap-3">
                {topMatches.map((match, i) => (
                  <MatchIndicator
                    key={match.personaId}
                    color={getPersonaColor(match.personaId)}
                    percent={match.matchPercent}
                    rank={i + 1}
                  />
                ))}
              </div>
            </motion.div>

            {/* Lock In Button */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <button
                onClick={handleLockIn}
                className="
                  px-8 py-3 rounded font-mono text-sm tracking-widest
                  bg-white/10 text-white border border-white/20
                  hover:bg-white/20 hover:border-white/40
                  transition-all duration-300
                  active:scale-95
                "
              >
                LOCK IN PROFILE
              </button>
            </motion.div>
          </motion.div>
        ) : phase === PHASES.CONVERGENCE ? (
          <ConvergenceAnimation
            key="convergence"
            winningColor={getPersonaColor(topMatches[0].personaId)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}

/**
 * Individual Axis Slider
 */
function AxisSlider({ axis, value, onChange, delay = 0 }) {
  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
    >
      {/* Labels */}
      <div className="flex justify-between mb-1.5">
        <span className="text-[10px] font-mono text-white/50">{axis.left}</span>
        <span className="text-[10px] font-mono text-white/70 tracking-wider">
          {axis.short.toUpperCase()}
        </span>
        <span className="text-[10px] font-mono text-white/50">{axis.right}</span>
      </div>

      {/* Slider Track */}
      <div className="relative h-8 flex items-center">
        <div className="absolute w-full h-1 bg-white/10 rounded-full" />

        {/* Fill */}
        <motion.div
          className="absolute h-1 bg-gradient-to-r from-cyan-500/50 to-cyan-400 rounded-full"
          style={{ width: `${value}%` }}
          layout
        />

        {/* Input */}
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="
            absolute w-full h-8 opacity-0 cursor-pointer z-10
          "
        />

        {/* Thumb */}
        <motion.div
          className="
            absolute w-4 h-4 rounded-full
            bg-cyan-400 border-2 border-white
            shadow-lg shadow-cyan-500/50
            pointer-events-none
          "
          style={{ left: `calc(${value}% - 8px)` }}
          layout
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>

      {/* Value indicator */}
      <div className="flex justify-center mt-1">
        <span className="text-[10px] font-mono text-cyan-400/80">
          {value}
        </span>
      </div>
    </motion.div>
  )
}

/**
 * Match Indicator (colored bar, no name revealed)
 */
function MatchIndicator({ color, percent, rank }) {
  const width = rank === 1 ? 'w-24' : rank === 2 ? 'w-20' : 'w-16'
  const opacity = rank === 1 ? 1 : rank === 2 ? 0.7 : 0.5

  return (
    <motion.div
      className={`${width} flex flex-col items-center`}
      style={{ opacity }}
      layout
    >
      {/* Bar */}
      <div
        className="w-full h-2 rounded-full mb-1"
        style={{ backgroundColor: color }}
      />
      {/* Percentage */}
      <span
        className="text-[10px] font-mono"
        style={{ color }}
      >
        {percent}%
      </span>
    </motion.div>
  )
}

/**
 * Convergence Animation (shatter/glitch effect)
 */
function ConvergenceAnimation({ winningColor }) {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Glitch lines */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-px w-full"
          style={{
            top: `${(i / 20) * 100}%`,
            backgroundColor: winningColor,
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{
            scaleX: [0, 1, 0],
            opacity: [0, 0.8, 0],
            x: [0, Math.random() * 100 - 50, 0],
          }}
          transition={{
            duration: 0.8,
            delay: i * 0.03,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Central flash */}
      <motion.div
        className="w-32 h-32 rounded-full"
        style={{ backgroundColor: winningColor }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 2, 20],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 1.2,
          delay: 0.3,
          ease: 'easeIn',
        }}
      />

      {/* LOCK text */}
      <motion.div
        className="absolute text-4xl font-mono tracking-[0.5em] text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.5, times: [0, 0.2, 0.7, 1] }}
      >
        LOCKED
      </motion.div>
    </motion.div>
  )
}
