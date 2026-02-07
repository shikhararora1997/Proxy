import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { THEMES } from '../../config/themes'
import { PERSONA_NAMES } from '../../config/personas'

/**
 * Story Chapter Display with page-flip animation
 * Shows "Previously on..." summary, then flips to reveal the new chapter
 */
export function StoryChapter({
  personaId,
  chapterNumber,
  chapterTitle,
  content,
  previousSummary,
  onComplete,
  isLoading = false,
}) {
  const theme = THEMES[personaId]
  const personaName = PERSONA_NAMES[personaId]
  const [phase, setPhase] = useState('summary') // summary -> flipping -> reading
  const [currentPage, setCurrentPage] = useState(0)
  const contentRef = useRef(null)

  // Split content into pages (~300 words each for readability)
  const pages = splitIntoPages(content, 300)
  const totalPages = pages.length

  // Auto-advance from summary after delay (if no previous summary, skip)
  useEffect(() => {
    if (phase === 'summary' && !previousSummary) {
      setPhase('flipping')
    }
  }, [phase, previousSummary])

  const handleStartReading = () => {
    setPhase('flipping')
    setTimeout(() => setPhase('reading'), 800)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const handleFinish = () => {
    onComplete()
  }

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.background }}
      >
        <div className="text-center px-6">
          <motion.div
            className="mb-6"
            animate={{ rotateY: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <BookIcon color={theme.accent} />
          </motion.div>
          <motion.p
            className={`${theme.font.chat} text-sm`}
            style={{ color: theme.text.secondary }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {personaName} is writing your story...
          </motion.p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: theme.background }}
    >
      {/* Header */}
      <header
        className="flex-none p-4 border-b"
        style={{
          borderColor: `${theme.accent}20`,
          paddingTop: 'max(1rem, env(safe-area-inset-top))',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className={`${theme.font.chat} text-xs tracking-wider`}
              style={{ color: theme.text.muted }}
            >
              THE {personaName.toUpperCase()} CHRONICLES
            </p>
            <h1
              className={`${theme.font.display} text-lg font-medium`}
              style={{ color: theme.text.primary }}
            >
              Chapter {chapterNumber}
            </h1>
          </div>
          {phase === 'reading' && (
            <p
              className={`${theme.font.chat} text-xs`}
              style={{ color: theme.text.muted }}
            >
              {currentPage + 1} / {totalPages}
            </p>
          )}
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {/* Summary Phase - "Previously on..." */}
          {phase === 'summary' && previousSummary && (
            <motion.div
              key="summary"
              className="absolute inset-0 flex flex-col p-6 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, rotateY: -90 }}
              transition={{ duration: 0.4 }}
            >
              <div className="max-w-2xl mx-auto w-full">
                <motion.div
                  className="mb-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <p
                    className={`${theme.font.display} text-xs tracking-[0.3em] mb-2`}
                    style={{ color: theme.accent }}
                  >
                    PREVIOUSLY ON
                  </p>
                  <h2
                    className={`${theme.font.display} text-2xl font-bold`}
                    style={{ color: theme.text.primary }}
                  >
                    The {personaName} Chronicles
                  </h2>
                </motion.div>

                <motion.div
                  className="p-6 rounded-lg mb-8"
                  style={{
                    backgroundColor: theme.surface,
                    borderLeft: `3px solid ${theme.accent}`,
                  }}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <p
                    className={`${theme.font.chat} text-sm leading-relaxed italic`}
                    style={{ color: theme.text.secondary }}
                  >
                    {previousSummary}
                  </p>
                </motion.div>

                <motion.button
                  onClick={handleStartReading}
                  className={`w-full py-4 rounded-lg ${theme.font.display} font-medium tracking-wider`}
                  style={{
                    backgroundColor: theme.accent,
                    color: theme.background,
                  }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  CONTINUE THE STORY →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Flipping Animation */}
          {phase === 'flipping' && (
            <motion.div
              key="flipping"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-64 h-80 rounded-lg shadow-2xl flex items-center justify-center"
                style={{
                  backgroundColor: theme.surface,
                  border: `2px solid ${theme.accent}`,
                }}
                initial={{ rotateY: 0 }}
                animate={{ rotateY: 180 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                onAnimationComplete={() => setPhase('reading')}
              >
                <BookIcon color={theme.accent} size={64} />
              </motion.div>
            </motion.div>
          )}

          {/* Reading Phase - Chapter Content */}
          {phase === 'reading' && (
            <motion.div
              key="reading"
              className="absolute inset-0 flex flex-col"
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Chapter Title */}
              <div className="px-6 pt-4 pb-2">
                <h2
                  className={`${theme.font.display} text-xl font-bold text-center`}
                  style={{ color: theme.accent }}
                >
                  "{chapterTitle}"
                </h2>
              </div>

              {/* Page Content */}
              <div
                ref={contentRef}
                className="flex-1 overflow-y-auto px-6 pb-4"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPage}
                    className="max-w-2xl mx-auto"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p
                      className={`${theme.font.chat} text-base leading-relaxed whitespace-pre-wrap`}
                      style={{ color: theme.text.primary }}
                    >
                      {pages[currentPage]}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Page Navigation */}
              <div
                className="flex-none p-4 border-t flex items-center justify-between"
                style={{ borderColor: `${theme.accent}20` }}
              >
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className={`px-4 py-2 rounded ${theme.font.chat} text-sm disabled:opacity-30`}
                  style={{ color: theme.text.secondary }}
                >
                  ← Previous
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full transition-colors"
                      style={{
                        backgroundColor: i === currentPage ? theme.accent : `${theme.text.muted}30`,
                      }}
                    />
                  ))}
                </div>

                {currentPage < totalPages - 1 ? (
                  <button
                    onClick={handleNextPage}
                    className={`px-4 py-2 rounded ${theme.font.chat} text-sm`}
                    style={{
                      backgroundColor: theme.accent,
                      color: theme.background,
                    }}
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={handleFinish}
                    className={`px-4 py-2 rounded ${theme.font.chat} text-sm`}
                    style={{
                      backgroundColor: theme.accent,
                      color: theme.background,
                    }}
                  >
                    Finish ✓
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/**
 * Split content into pages by word count
 */
function splitIntoPages(content, wordsPerPage = 300) {
  if (!content) return ['']

  const words = content.split(/\s+/)
  const pages = []
  let currentPage = []

  for (const word of words) {
    currentPage.push(word)
    if (currentPage.length >= wordsPerPage) {
      // Try to break at sentence end
      const pageText = currentPage.join(' ')
      const lastSentenceEnd = Math.max(
        pageText.lastIndexOf('. '),
        pageText.lastIndexOf('! '),
        pageText.lastIndexOf('? ')
      )

      if (lastSentenceEnd > pageText.length * 0.7) {
        pages.push(pageText.substring(0, lastSentenceEnd + 1))
        const remaining = pageText.substring(lastSentenceEnd + 2).trim()
        currentPage = remaining ? remaining.split(/\s+/) : []
      } else {
        pages.push(pageText)
        currentPage = []
      }
    }
  }

  if (currentPage.length > 0) {
    pages.push(currentPage.join(' '))
  }

  return pages.length > 0 ? pages : ['']
}

function BookIcon({ color, size = 48 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M8 7h8" />
      <path d="M8 11h6" />
    </svg>
  )
}
