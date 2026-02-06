/**
 * Match Reveal Screen
 *
 * Sexy visualization showing how close user is to each persona
 * Displays after lock-in, before Letter reveal
 */

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js'
import { Radar } from 'react-chartjs-2'
import { PERSONAS, PERSONA_NAMES, PERSONA_VECTORS, VECTOR_AXES } from '../../config/personas'
import { calculateAllMatches } from '../../lib/vectorMatch'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler)

export function MatchReveal({ userVector, onContinue }) {
  const [phase, setPhase] = useState(0) // 0: intro, 1: bars, 2: radar, 3: ready
  const [revealedBars, setRevealedBars] = useState(0)

  const allMatches = useMemo(() => calculateAllMatches(userVector), [userVector])
  const winner = allMatches[0]
  const winnerColor = PERSONAS[winner.personaId]?.colors?.accent || '#00FFCC'
  const winnerName = PERSONA_NAMES[winner.personaId]

  // Phase progression
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),      // Start bars
      setTimeout(() => setPhase(2), 2500),     // Show radar
      setTimeout(() => setPhase(3), 4000),     // Ready to continue
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  // Reveal bars one by one (from bottom to top = worst to best)
  useEffect(() => {
    if (phase >= 1 && revealedBars < 10) {
      const timer = setTimeout(() => {
        setRevealedBars(prev => prev + 1)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [phase, revealedBars])

  // Reversed for animation (reveal worst first, winner last)
  const reversedMatches = [...allMatches].reverse()

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-lg font-mono text-white/80 tracking-[0.3em] mb-2">
          ANALYSIS COMPLETE
        </h1>
        <motion.div
          className="h-px w-32 mx-auto"
          style={{ backgroundColor: winnerColor }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />
      </motion.div>

      {/* Main content - horizontal layout on desktop */}
      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 w-full max-w-5xl">

        {/* Left: Ranking Bars */}
        <motion.div
          className="w-full lg:w-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 1 ? 1 : 0 }}
        >
          <p className="text-[10px] font-mono text-white/40 tracking-wider mb-4 text-center lg:text-left">
            PROXIMITY RANKING
          </p>

          <div className="space-y-2">
            {allMatches.map((match, index) => {
              const isRevealed = revealedBars >= (10 - index)
              const isWinner = index === 0
              const color = PERSONAS[match.personaId]?.colors?.accent || '#666'
              const name = PERSONA_NAMES[match.personaId]

              return (
                <motion.div
                  key={match.personaId}
                  className="relative"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: isRevealed ? 1 : 0,
                    x: isRevealed ? 0 : -20,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Bar background */}
                  <div className="h-8 bg-white/5 rounded-sm overflow-hidden relative">
                    {/* Fill bar */}
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-sm"
                      style={{ backgroundColor: isWinner ? color : `${color}60` }}
                      initial={{ width: 0 }}
                      animate={{ width: isRevealed ? `${match.matchPercent}%` : 0 }}
                      transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                    />

                    {/* Label */}
                    <div className="absolute inset-0 flex items-center justify-between px-3">
                      <span
                        className={`font-mono text-xs tracking-wider ${
                          isWinner ? 'text-white font-bold' : 'text-white/70'
                        }`}
                      >
                        {isWinner && '★ '}{name}
                      </span>
                      <span
                        className={`font-mono text-xs ${
                          isWinner ? 'text-white font-bold' : 'text-white/50'
                        }`}
                      >
                        {match.matchPercent}%
                      </span>
                    </div>
                  </div>

                  {/* Winner glow effect */}
                  {isWinner && isRevealed && (
                    <motion.div
                      className="absolute inset-0 rounded-sm pointer-events-none"
                      style={{
                        boxShadow: `0 0 20px ${color}40, inset 0 0 20px ${color}20`,
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0.5] }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  )}
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Right: Comparison Radar */}
        <motion.div
          className="w-full lg:w-1/2 flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: phase >= 2 ? 1 : 0,
            scale: phase >= 2 ? 1 : 0.8,
          }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[10px] font-mono text-white/40 tracking-wider mb-4">
            VECTOR COMPARISON
          </p>

          <div className="w-64 h-64 lg:w-80 lg:h-80">
            <ComparisonRadar
              userVector={userVector}
              personaId={winner.personaId}
              personaColor={winnerColor}
            />
          </div>

          <motion.div
            className="mt-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 2 ? 1 : 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-white/50 text-xs font-mono">
              <span className="text-cyan-400">━</span> You
              <span className="mx-3">vs</span>
              <span style={{ color: winnerColor }}>━</span> {winnerName}
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Winner announcement */}
      <motion.div
        className="mt-10 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 20 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-white/40 text-xs font-mono tracking-wider mb-2">
          YOUR ASSIGNED PROXY
        </p>
        <motion.h2
          className="text-3xl lg:text-4xl font-mono tracking-wider"
          style={{ color: winnerColor }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {winnerName.toUpperCase()}
        </motion.h2>
      </motion.div>

      {/* Continue button */}
      <motion.button
        onClick={onContinue}
        className="
          mt-10 px-10 py-4 rounded font-mono text-sm tracking-widest
          border transition-all duration-300
          hover:scale-105 active:scale-95
        "
        style={{
          backgroundColor: `${winnerColor}20`,
          borderColor: winnerColor,
          color: winnerColor,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 3 ? 1 : 0 }}
        whileHover={{ backgroundColor: `${winnerColor}40` }}
      >
        MEET YOUR PROXY
      </motion.button>
    </div>
  )
}

/**
 * Comparison Radar Chart - User vs Persona
 */
function ComparisonRadar({ userVector, personaId, personaColor }) {
  const personaVector = PERSONA_VECTORS[personaId]

  const data = {
    labels: VECTOR_AXES.map(axis => axis.short),
    datasets: [
      {
        label: 'You',
        data: userVector,
        backgroundColor: 'rgba(0, 255, 204, 0.2)',
        borderColor: '#00FFCC',
        borderWidth: 2,
        pointBackgroundColor: '#00FFCC',
        pointBorderColor: '#fff',
        pointRadius: 3,
      },
      {
        label: 'Persona',
        data: personaVector,
        backgroundColor: `${personaColor}30`,
        borderColor: personaColor,
        borderWidth: 2,
        pointBackgroundColor: personaColor,
        pointBorderColor: '#fff',
        pointRadius: 3,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        beginAtZero: true,
        min: 0,
        max: 100,
        ticks: { display: false },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
        pointLabels: {
          color: 'rgba(255, 255, 255, 0.6)',
          font: { family: "'SF Mono', monospace", size: 10 },
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
  }

  return <Radar data={data} options={options} />
}
