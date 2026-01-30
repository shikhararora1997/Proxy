import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { THEMES } from '../../config/themes'
import { PERSONA_NAMES } from '../../config/personas'

// Check if mobile
const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768

const TUTORIAL_STEPS_DESKTOP = [
  {
    id: 'welcome',
    title: 'Welcome to PROXY',
    content: 'Your personal AI assistant is ready. Let me show you around.',
    highlight: null,
  },
  {
    id: 'chat',
    title: 'Chat Naturally',
    content: 'Just talk to me like you would a friend. Ask questions, share thoughts, or tell me about your day.',
    highlight: 'chat-input',
    example: '"Hey, how\'s it going?"',
  },
  {
    id: 'add-tasks',
    title: 'Add Tasks by Talking',
    content: 'Mention tasks naturally and I\'ll add them to your ledger with smart due dates.',
    highlight: 'chat-input',
    example: '"Remind me to call the dentist tomorrow"',
  },
  {
    id: 'multiple-tasks',
    title: 'Multiple Tasks at Once',
    content: 'You can mention several tasks in one message. I\'ll catch them all.',
    highlight: 'chat-input',
    example: '"I need to buy groceries, finish the report, and call mom"',
  },
  {
    id: 'complete-tasks',
    title: 'Complete Tasks',
    content: 'Tell me when you\'re done, or tap the checkbox in the ledger.',
    highlight: 'ledger',
    example: '"I finished calling the dentist"',
  },
  {
    id: 'ledger',
    title: 'Your Task Ledger',
    content: 'All your tasks live here, organized by priority. Overdue tasks automatically move to HIGH.',
    highlight: 'ledger',
  },
  {
    id: 'assess',
    title: 'Assess Ledger',
    content: 'Tap this button and I\'ll review your pending tasks, motivate you, and suggest how to tackle them.',
    highlight: 'assess-button',
  },
  {
    id: 'due-dates',
    title: 'Smart Due Dates',
    content: 'Say "in 2 hours" or "by Friday" and I\'ll set the right deadline. Tap any due date to edit it.',
    highlight: null,
  },
  {
    id: 'done',
    title: 'You\'re All Set!',
    content: 'That\'s everything. I\'m here whenever you need me. Let\'s get started.',
    highlight: null,
  },
]

const TUTORIAL_STEPS_MOBILE = [
  {
    id: 'welcome',
    title: 'Welcome to PROXY',
    content: 'Your personal AI assistant is ready. Let me show you around.',
    highlight: null,
  },
  {
    id: 'chat',
    title: 'Chat Naturally',
    content: 'Just talk to me like you would a friend. Ask questions, share thoughts, or tell me about your day.',
    highlight: null,
    example: '"Hey, how\'s it going?"',
  },
  {
    id: 'add-tasks',
    title: 'Add Tasks by Talking',
    content: 'Mention tasks naturally and I\'ll add them to your ledger with smart due dates.',
    highlight: null,
    example: '"Remind me to call the dentist tomorrow"',
  },
  {
    id: 'multiple-tasks',
    title: 'Multiple Tasks at Once',
    content: 'You can mention several tasks in one message. I\'ll catch them all.',
    highlight: null,
    example: '"I need to buy groceries, finish the report, and call mom"',
  },
  {
    id: 'complete-tasks',
    title: 'Complete Tasks',
    content: 'Tell me when you\'re done, or tap the checkbox in the ledger.',
    highlight: null,
    example: '"I finished calling the dentist"',
  },
  {
    id: 'ledger',
    title: 'Your Task Ledger',
    content: 'Tap the floating button (bottom-right) to open your ledger. Tasks are organized by priority.',
    highlight: 'ledger-toggle',
  },
  {
    id: 'assess',
    title: 'Assess Ledger',
    content: 'The "Assess Ledger" button above the chat input lets me review your tasks and motivate you.',
    highlight: null,
  },
  {
    id: 'due-dates',
    title: 'Smart Due Dates',
    content: 'Say "in 2 hours" or "by Friday" and I\'ll set the right deadline. Tap any due date to edit it.',
    highlight: null,
  },
  {
    id: 'done',
    title: 'You\'re All Set!',
    content: 'That\'s everything. I\'m here whenever you need me. Let\'s get started.',
    highlight: null,
  },
]

/**
 * Interactive tutorial overlay for first-time users
 */
export function Tutorial({ personaId, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0)
  const theme = THEMES[personaId]
  const personaName = PERSONA_NAMES[personaId]

  // Use mobile or desktop steps based on screen width
  const TUTORIAL_STEPS = isMobile() ? TUTORIAL_STEPS_MOBILE : TUTORIAL_STEPS_DESKTOP

  const step = TUTORIAL_STEPS[currentStep]
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1
  const isFirstStep = currentStep === 0

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={handleSkip}
      />

      {/* Highlight overlay for specific elements */}
      <AnimatePresence mode="wait">
        {step.highlight && (
          <HighlightOverlay highlight={step.highlight} theme={theme} />
        )}
      </AnimatePresence>

      {/* Tutorial card */}
      <motion.div
        className="relative z-10 w-[90%] max-w-md mx-4 rounded-lg overflow-hidden"
        style={{ backgroundColor: theme.surface }}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Progress bar */}
        <div className="h-1 bg-black/20">
          <motion.div
            className="h-full"
            style={{ backgroundColor: theme.accent }}
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step indicator */}
          <p
            className={`${theme.font.chat} text-[10px] tracking-wider mb-2`}
            style={{ color: theme.text.muted }}
          >
            {currentStep + 1} / {TUTORIAL_STEPS.length}
          </p>

          {/* Title */}
          <AnimatePresence mode="wait">
            <motion.h2
              key={step.id + '-title'}
              className={`${theme.font.display} text-xl font-medium mb-3`}
              style={{ color: theme.text.primary }}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {step.title}
            </motion.h2>
          </AnimatePresence>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.p
              key={step.id + '-content'}
              className={`${theme.font.chat} text-sm leading-relaxed mb-4`}
              style={{ color: theme.text.secondary }}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, delay: 0.05 }}
            >
              {step.content}
            </motion.p>
          </AnimatePresence>

          {/* Example */}
          <AnimatePresence mode="wait">
            {step.example && (
              <motion.div
                key={step.id + '-example'}
                className="p-3 rounded-md mb-4"
                style={{ backgroundColor: `${theme.accent}15` }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <p
                  className={`${theme.font.chat} text-xs`}
                  style={{ color: theme.text.muted }}
                >
                  Try saying:
                </p>
                <p
                  className={`${theme.font.chat} text-sm italic mt-1`}
                  style={{ color: theme.accent }}
                >
                  {step.example}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Persona attribution */}
          {isFirstStep && (
            <p
              className={`${theme.font.chat} text-xs mb-4`}
              style={{ color: theme.text.muted }}
            >
              — {personaName}
            </p>
          )}
        </div>

        {/* Actions */}
        <div
          className="flex items-center justify-between p-4 border-t"
          style={{ borderColor: `${theme.accent}20` }}
        >
          <button
            onClick={handleSkip}
            className={`${theme.font.chat} text-xs px-3 py-1.5 rounded transition-colors`}
            style={{ color: theme.text.muted }}
          >
            Skip tour
          </button>

          <div className="flex gap-2">
            {!isFirstStep && (
              <button
                onClick={handlePrev}
                className={`${theme.font.chat} text-xs px-4 py-2 rounded transition-colors`}
                style={{
                  backgroundColor: `${theme.text.muted}20`,
                  color: theme.text.secondary,
                }}
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className={`${theme.font.chat} text-xs px-4 py-2 rounded transition-colors`}
              style={{
                backgroundColor: theme.accent,
                color: theme.background,
              }}
            >
              {isLastStep ? "Let's Go!" : 'Next'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/**
 * Highlight specific UI elements during tutorial
 */
function HighlightOverlay({ highlight, theme }) {
  // Get positions based on screen size
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  const positions = {
    'chat-input': {
      bottom: '16px',
      left: '16px',
      right: isMobile ? '16px' : '336px',
      height: '56px',
      borderRadius: '8px',
    },
    'ledger': {
      top: '60px',
      right: '0',
      width: isMobile ? '288px' : '320px',
      height: 'calc(100% - 60px)',
    },
    'ledger-toggle': {
      bottom: '96px',
      right: '16px',
      width: '48px',
      height: '48px',
      borderRadius: '50%',
    },
    'assess-button': {
      bottom: '88px',
      left: '16px',
      right: isMobile ? '16px' : '336px',
      height: '36px',
      borderRadius: '6px',
    },
  }

  const pos = positions[highlight]
  if (!pos) return null

  return (
    <motion.div
      className="fixed pointer-events-none"
      style={{
        ...pos,
        boxShadow: `0 0 0 4px ${theme.accent}, 0 0 20px ${theme.accent}50`,
        border: `2px solid ${theme.accent}`,
        zIndex: 50,
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    />
  )
}
