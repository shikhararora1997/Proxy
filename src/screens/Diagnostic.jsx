import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProxy, STAGES } from '../context/ProxyContext'
import { LensFocusPage } from '../components/transitions/LensFocus'
import { GlitchEffect } from '../components/effects/GlitchEffect'
import { QUESTIONS } from '../config/questions'
import { calculatePersona } from '../utils/scoring'

export function Diagnostic() {
  const { username, answers, addAnswer, setPersonaId, setStage } = useProxy()
  const [currentIndex, setCurrentIndex] = useState(answers.length)
  const [selectedOption, setSelectedOption] = useState(null)
  const [isGlitching, setIsGlitching] = useState(false)
  const [glitchPersona, setGlitchPersona] = useState(null)

  const currentQuestion = QUESTIONS[currentIndex]
  const isComplete = currentIndex >= QUESTIONS.length
  const progress = ((currentIndex) / QUESTIONS.length) * 100

  const handleSelect = useCallback((option) => {
    if (isGlitching || selectedOption) return

    setSelectedOption(option.id)
    // Extract the primary persona (highest weight) for glitch color
    const primaryPersona = Object.entries(option.weights)
      .sort((a, b) => b[1] - a[1])[0][0]
    setGlitchPersona(primaryPersona)
    setIsGlitching(true)
  }, [isGlitching, selectedOption])

  const handleGlitchComplete = useCallback(() => {
    const option = currentQuestion.options.find(o => o.id === selectedOption)
    if (!option) return

    // Record the answer
    const newAnswer = {
      questionId: currentQuestion.id,
      optionId: option.id,
      weights: option.weights,
    }
    addAnswer(newAnswer)

    // Check if this was the last question
    const newAnswers = [...answers, newAnswer]
    if (currentIndex >= QUESTIONS.length - 1) {
      // Calculate winning persona and proceed to revelation
      const winningPersona = calculatePersona(newAnswers)
      setPersonaId(winningPersona)

      // Small delay before transition
      setTimeout(() => {
        setStage(STAGES.REVELATION)
      }, 300)
    } else {
      // Move to next question
      setTimeout(() => {
        setSelectedOption(null)
        setIsGlitching(false)
        setGlitchPersona(null)
        setCurrentIndex(prev => prev + 1)
      }, 200)
    }
  }, [currentQuestion, selectedOption, currentIndex, answers, addAnswer, setPersonaId, setStage])

  if (isComplete) {
    return (
      <LensFocusPage>
        <div className="h-screen-safe w-full bg-black flex items-center justify-center">
          <motion.p
            className="text-white/60 font-mono text-sm tracking-wider"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ANALYZING...
          </motion.p>
        </div>
      </LensFocusPage>
    )
  }

  return (
    <LensFocusPage>
      <div className="h-screen-safe w-full bg-black flex flex-col">
        {/* Glitch overlay */}
        <GlitchEffect
          isActive={isGlitching}
          personaId={glitchPersona}
          onComplete={handleGlitchComplete}
        />

        {/* Progress bar */}
        <div className="w-full h-[2px] bg-white/10">
          <motion.div
            className="h-full bg-white/40"
            initial={{ width: `${progress}%` }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center px-6 md:px-12 py-8 max-w-3xl mx-auto w-full">
          {/* Header */}
          <motion.div
            className="mb-6 md:mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-white/30 font-mono text-xs tracking-widest">
              DIAGNOSTIC — {String(currentIndex + 1).padStart(2, '0')}/{String(QUESTIONS.length).padStart(2, '0')}
            </span>
          </motion.div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <h2 className="text-white/90 font-mono text-base md:text-lg leading-relaxed mb-8 md:mb-12">
                {currentQuestion.text}
              </h2>

              {/* Options */}
              <div className="space-y-3 md:space-y-4">
                {currentQuestion.options.map((option, index) => (
                  <OptionButton
                    key={option.id}
                    option={option}
                    index={index}
                    isSelected={selectedOption === option.id}
                    isDisabled={isGlitching || selectedOption !== null}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Footer hint */}
          <motion.p
            className="mt-8 md:mt-12 text-white/20 text-xs font-mono tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            SELECT AN ANSWER
          </motion.p>
        </div>
      </div>
    </LensFocusPage>
  )
}

function OptionButton({ option, index, isSelected, isDisabled, onSelect }) {
  const letters = ['A', 'B', 'C', 'D']

  return (
    <motion.button
      onClick={() => onSelect(option)}
      disabled={isDisabled}
      className={`
        w-full text-left p-4 md:p-5 rounded-sm
        border border-white/10
        transition-colors duration-200
        outline-none
        ${isSelected
          ? 'bg-white/10 border-white/30'
          : 'bg-transparent'
        }
        ${isDisabled && !isSelected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      style={{
        // Only apply hover styles on devices that support hover (not touch)
        WebkitTapHighlightColor: 'transparent',
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.08,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={!isDisabled && !isSelected ? { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)' } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
    >
      <div className="flex items-start gap-4">
        <span className="text-white/40 font-mono text-sm flex-shrink-0 mt-0.5">
          {letters[index]})
        </span>
        <span className="text-white/80 font-mono text-sm md:text-base leading-relaxed">
          {option.text}
        </span>
      </div>
    </motion.button>
  )
}
