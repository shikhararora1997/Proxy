import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProxy } from '../context/ProxyContext'
import { useAuth } from '../context/AuthContext'
import { useLedger } from '../hooks/useLedger'
import { useStory } from '../hooks/useStory'
import { THEMES } from '../config/themes'
import { PERSONA_NAMES } from '../config/personas'
import { getReflectionAnalysis, generateStoryChapter } from '../lib/ai'
import { StoryChapter } from '../components/story/StoryChapter'

/**
 * 3-Day Reflection Assessment Screen
 *
 * Triggered when: local_time > 17:00 AND days_since_last_review >= 3
 * Shows deep persona-voiced analysis of user's task patterns
 * Purges completed tasks on exit
 */
export function ReflectionAssessment() {
  const { personaId, completeReflection } = useProxy()
  const { profile } = useAuth()
  const { entries, purgeCompleted } = useLedger()
  const { chapterNumber, previousSummary, saveChapter, isFirstChapter } = useStory()
  const theme = THEMES[personaId]
  const personaName = PERSONA_NAMES[personaId]

  const [phase, setPhase] = useState('intro') // intro -> analyzing -> report -> story_loading -> story -> exit
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState(null)
  const [storyData, setStoryData] = useState(null)
  const [storyError, setStoryError] = useState(false)

  // Gather stats for the last 3 days
  const getThreeDayStats = useCallback(() => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)

    const recentEntries = entries.filter(e => {
      const created = new Date(e.created_at)
      return created >= threeDaysAgo
    })

    const completed = recentEntries.filter(e => e.status === 'resolved')
    const pending = recentEntries.filter(e => e.status === 'pending')
    const allPending = entries.filter(e => e.status === 'pending')

    // Group by priority
    const completedByPriority = {
      high: completed.filter(e => e.priority === 'high').length,
      medium: completed.filter(e => e.priority === 'medium' || !e.priority).length,
      low: completed.filter(e => e.priority === 'low').length,
    }

    const pendingByPriority = {
      high: allPending.filter(e => e.priority === 'high').length,
      medium: allPending.filter(e => e.priority === 'medium' || !e.priority).length,
      low: allPending.filter(e => e.priority === 'low').length,
    }

    // Calculate average completion time for completed tasks
    const completionTimes = completed
      .filter(e => e.completed_at && e.created_at)
      .map(e => new Date(e.completed_at) - new Date(e.created_at))

    const avgCompletionTime = completionTimes.length > 0
      ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
      : null

    return {
      totalCreated: recentEntries.length,
      totalCompleted: completed.length,
      totalPending: allPending.length,
      completedByPriority,
      pendingByPriority,
      avgCompletionTimeHours: avgCompletionTime ? Math.round(avgCompletionTime / (1000 * 60 * 60)) : null,
      completedTasks: completed.map(e => e.description),
      pendingTasks: allPending.map(e => ({ description: e.description, priority: e.priority, created: e.created_at })),
      completionRate: recentEntries.length > 0 ? Math.round((completed.length / recentEntries.length) * 100) : 0,
    }
  }, [entries])

  // Start analysis after intro
  useEffect(() => {
    if (phase === 'intro') {
      const timer = setTimeout(() => setPhase('analyzing'), 3000)
      return () => clearTimeout(timer)
    }
  }, [phase])

  // Fetch AI analysis
  useEffect(() => {
    if (phase === 'analyzing' && !analysis) {
      const stats = getThreeDayStats()

      getReflectionAnalysis(personaId, stats, profile?.display_name || profile?.username)
        .then(result => {
          setAnalysis(result)
          setPhase('report')
        })
        .catch(err => {
          console.error('Reflection analysis failed:', err)
          setError('Analysis failed. Please try again.')
          setPhase('report')
        })
    }
  }, [phase, analysis, personaId, profile, getThreeDayStats])

  // Handle transition to story phase
  const handleContinueToStory = async () => {
    setPhase('story_loading')

    try {
      // Generate the next chapter
      const chapter = await generateStoryChapter(personaId, chapterNumber, previousSummary)

      if (chapter) {
        // Save chapter to database
        await saveChapter(chapter.content, chapter.summary)
        setStoryData(chapter)
        setPhase('story')
      } else {
        // Story generation failed, skip to exit
        setStoryError(true)
        handleFinalExit()
      }
    } catch (err) {
      console.error('Story generation failed:', err)
      setStoryError(true)
      handleFinalExit()
    }
  }

  // Handle story completion
  const handleStoryComplete = () => {
    handleFinalExit()
  }

  // Final exit - purge completed tasks and return to dashboard
  const handleFinalExit = async () => {
    setPhase('exit')

    // Purge all completed tasks
    await purgeCompleted()

    // Mark reflection complete and return to dashboard
    setTimeout(() => {
      completeReflection()
    }, 1500)
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ backgroundColor: theme.background }}
    >
      <AnimatePresence mode="wait">
        {/* Intro Phase - Dramatic Entry */}
        {phase === 'intro' && (
          <motion.div
            key="intro"
            className="flex-1 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center px-6">
              {/* Shatter/decrypt animation */}
              <motion.div
                className="mb-8"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15, delay: 0.3 }}
              >
                <div
                  className="w-24 h-24 mx-auto rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${theme.accent}20`, border: `2px solid ${theme.accent}` }}
                >
                  <motion.span
                    className={`${theme.font.display} text-4xl font-bold`}
                    style={{ color: theme.accent }}
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    3
                  </motion.span>
                </div>
              </motion.div>

              <motion.h1
                className={`${theme.font.display} text-2xl md:text-3xl font-bold mb-4`}
                style={{ color: theme.text.primary }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                THREE-DAY REFLECTION
              </motion.h1>

              <motion.p
                className={`${theme.font.chat} text-sm`}
                style={{ color: theme.text.muted }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {personaName} is analyzing your performance...
              </motion.p>

              {/* Scanning line effect */}
              <motion.div
                className="mt-8 h-1 w-48 mx-auto rounded-full overflow-hidden"
                style={{ backgroundColor: `${theme.accent}20` }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: theme.accent }}
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Analyzing Phase */}
        {phase === 'analyzing' && (
          <motion.div
            key="analyzing"
            className="flex-1 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center px-6">
              <motion.div
                className="mb-6"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={theme.accent}
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" opacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
              </motion.div>

              <motion.p
                className={`${theme.font.chat} text-sm`}
                style={{ color: theme.text.secondary }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Decrypting behavioral patterns...
              </motion.p>
            </div>
          </motion.div>
        )}

        {/* Report Phase */}
        {phase === 'report' && (
          <motion.div
            key="report"
            className="flex-1 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
          >
            {/* Header */}
            <div
              className="flex-none p-4 border-b"
              style={{ borderColor: `${theme.accent}20` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme.accent }}
                >
                  <span
                    className={`${theme.font.display} text-sm font-bold`}
                    style={{ color: theme.background }}
                  >
                    {personaName[0]}
                  </span>
                </div>
                <div>
                  <h1
                    className={`${theme.font.display} text-lg font-medium`}
                    style={{ color: theme.text.primary }}
                  >
                    {personaName}'s Assessment
                  </h1>
                  <p
                    className={`${theme.font.chat} text-xs`}
                    style={{ color: theme.text.muted }}
                  >
                    3-Day Performance Review
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {error ? (
                <div
                  className={`${theme.font.chat} text-center py-8`}
                  style={{ color: theme.text.muted }}
                >
                  {error}
                </div>
              ) : analysis ? (
                <motion.div
                  className="max-w-2xl mx-auto space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Stats Summary */}
                  <div
                    className="grid grid-cols-3 gap-3 p-4 rounded-lg"
                    style={{ backgroundColor: theme.surface }}
                  >
                    <StatBox
                      label="Completed"
                      value={analysis.stats?.totalCompleted || 0}
                      theme={theme}
                      color="#22C55E"
                    />
                    <StatBox
                      label="Pending"
                      value={analysis.stats?.totalPending || 0}
                      theme={theme}
                      color="#EAB308"
                    />
                    <StatBox
                      label="Rate"
                      value={`${analysis.stats?.completionRate || 0}%`}
                      theme={theme}
                      color={theme.accent}
                    />
                  </div>

                  {/* Main Analysis */}
                  <div
                    className={`${theme.font.chat} leading-relaxed whitespace-pre-wrap`}
                    style={{ color: theme.text.primary }}
                  >
                    {analysis.message}
                  </div>
                </motion.div>
              ) : null}
            </div>

            {/* Footer with continue button */}
            <div
              className="flex-none p-4 border-t"
              style={{ borderColor: `${theme.accent}20` }}
            >
              <motion.button
                onClick={handleContinueToStory}
                className={`w-full py-3 rounded-lg ${theme.font.display} text-sm font-medium tracking-wider`}
                style={{
                  backgroundColor: theme.accent,
                  color: theme.background,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isFirstChapter ? 'BEGIN YOUR STORY →' : 'CONTINUE YOUR STORY →'}
              </motion.button>
              <p
                className={`${theme.font.chat} text-xs text-center mt-2`}
                style={{ color: theme.text.muted }}
              >
                {isFirstChapter
                  ? `${personaName} has a tale to tell you...`
                  : `Chapter ${chapterNumber} awaits...`
                }
              </p>
            </div>
          </motion.div>
        )}

        {/* Story Loading Phase */}
        {phase === 'story_loading' && (
          <StoryChapter
            personaId={personaId}
            chapterNumber={chapterNumber}
            isLoading={true}
          />
        )}

        {/* Story Phase */}
        {phase === 'story' && storyData && (
          <StoryChapter
            personaId={personaId}
            chapterNumber={chapterNumber}
            chapterTitle={storyData.chapter_title}
            content={storyData.content}
            previousSummary={!isFirstChapter ? previousSummary : null}
            onComplete={handleStoryComplete}
            isLoading={false}
          />
        )}

        {/* Exit Phase */}
        {phase === 'exit' && (
          <motion.div
            key="exit"
            className="flex-1 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: 0, opacity: 0 }}
                transition={{ duration: 1 }}
              >
                <CheckIcon color={theme.accent} />
              </motion.div>
              <motion.p
                className={`${theme.font.chat} text-sm mt-4`}
                style={{ color: theme.text.secondary }}
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ delay: 0.5 }}
              >
                Ledger cleared. Fresh slate.
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatBox({ label, value, theme, color }) {
  return (
    <div className="text-center">
      <p
        className={`${theme.font.display} text-2xl font-bold`}
        style={{ color }}
      >
        {value}
      </p>
      <p
        className={`${theme.font.chat} text-xs`}
        style={{ color: theme.text.muted }}
      >
        {label}
      </p>
    </div>
  )
}

function CheckIcon({ color }) {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}
