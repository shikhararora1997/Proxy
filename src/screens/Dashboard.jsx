import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { useProxy, STAGES } from '../context/ProxyContext'
import { useAuth } from '../context/AuthContext'
import { THEMES, WELCOME_MESSAGES } from '../config/themes'
import { PERSONA_NAMES } from '../config/personas'
import { useMessages } from '../hooks/useMessages'
import { useLedger } from '../hooks/useLedger'
import { getAIResponse, isAIConfigured } from '../lib/ai'
import { ChatFeed } from '../components/chat/ChatFeed'
import { ChatInput } from '../components/chat/ChatInput'
import { ActiveLedger, LedgerToggle } from '../components/ledger/ActiveLedger'
import { LensFocusPage } from '../components/transitions/LensFocus'
import { Tutorial } from '../components/tutorial/Tutorial'
import { NotificationPrompt } from '../components/ui/NotificationPrompt'

const TUTORIAL_STORAGE_KEY = 'proxy_tutorial_complete'

/**
 * Dashboard Screen
 *
 * The main chat interface post-discovery.
 * Themed per persona with active ledger sidebar.
 */
export function Dashboard() {
  const { username, personaId, resetFlow, shouldTriggerReflection, setStage } = useProxy()
  const { logout, isOnline } = useAuth()
  const theme = THEMES[personaId]
  const personaName = PERSONA_NAMES[personaId]

  const {
    messages,
    loading: messagesLoading,
    addUserMessage,
    addProxyMessage,
    clearMessages,
    isEmpty,
  } = useMessages()

  const ledger = useLedger()
  const { entries: ledgerEntries, addEntry, completeTaskByQuery, updateTaskByQuery, completeAllTasks } = ledger

  const [isTyping, setIsTyping] = useState(false)
  const [ledgerOpen, setLedgerOpen] = useState(window.innerWidth >= 768)
  const [showTutorial, setShowTutorial] = useState(false)
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false)
  const welcomeSentRef = useRef(false)
  const tutorialCheckedRef = useRef(false)
  const aiEnabled = isAIConfigured()

  // Check if tutorial should be shown (first visit only)
  useEffect(() => {
    if (!tutorialCheckedRef.current && !messagesLoading) {
      tutorialCheckedRef.current = true
      const tutorialComplete = localStorage.getItem(TUTORIAL_STORAGE_KEY)
      if (!tutorialComplete && isEmpty) {
        // Delay tutorial to let welcome message appear first
        setTimeout(() => setShowTutorial(true), 2000)
      }
    }
  }, [messagesLoading, isEmpty])

  // Check if 3-day reflection should trigger
  const reflectionCheckedRef = useRef(false)
  useEffect(() => {
    if (!reflectionCheckedRef.current && !messagesLoading) {
      reflectionCheckedRef.current = true
      // Small delay to let dashboard render first
      setTimeout(() => {
        if (shouldTriggerReflection()) {
          setStage(STAGES.REFLECTION)
        }
      }, 1000)
    }
  }, [messagesLoading, shouldTriggerReflection, setStage])

  const handleTutorialComplete = () => {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true')
    setShowTutorial(false)
    // Show notification prompt after tutorial
    setTimeout(() => setShowNotificationPrompt(true), 500)
  }

  // Send welcome message on first visit
  useEffect(() => {
    // Only run once when we have a valid personaId and messages are loaded
    if (!messagesLoading && isEmpty && !welcomeSentRef.current && personaId && WELCOME_MESSAGES[personaId]) {
      welcomeSentRef.current = true
      setIsTyping(true)

      const welcomeMsg = WELCOME_MESSAGES[personaId]
      const timer = setTimeout(async () => {
        await addProxyMessage(welcomeMsg)
        setIsTyping(false)
      }, 1500)

      return () => {
        clearTimeout(timer)
        // If cleanup runs before timer fires, reset typing state
        setIsTyping(false)
      }
    }
  }, [messagesLoading, isEmpty, personaId, addProxyMessage])

  // Handle user message and AI response
  const handleSend = useCallback(async (text) => {
    await addUserMessage(text)
    setIsTyping(true)

    try {
      const response = await getAIResponse(
        personaId,
        text,
        messages,
        ledgerEntries
      )

      // Display the conversational reply
      await addProxyMessage(response.message)

      // Handle task actions (array of add/complete/update)
      if (response.task_actions && response.task_actions.length > 0) {
        // Check if this is a "complete all" scenario (multiple complete actions)
        const completeActions = response.task_actions.filter(a => a.type === 'complete')
        const pendingCount = ledgerEntries.filter(e => e.status === 'pending').length

        // If completing most/all tasks, use batch complete
        if (completeActions.length >= 3 && completeActions.length >= pendingCount * 0.7) {
          console.log('[Dashboard] Detected "complete all" - using batch complete')
          await completeAllTasks()
        } else {
          // Process actions individually
          for (const action of response.task_actions) {
            const { type, description, priority, match_query, due_at } = action
            if (type === 'add' && description) {
              await addEntry(description, null, null, priority || 'medium', due_at || null)
            } else if (type === 'complete' && match_query) {
              await completeTaskByQuery(match_query)
            } else if (type === 'update' && match_query) {
              // Build updates object from provided fields
              const updates = {}
              if (priority) updates.priority = priority
              if (due_at) updates.due_at = due_at
              if (description) updates.description = description
              await updateTaskByQuery(match_query, updates)
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to get AI response:', error)
      await addProxyMessage("I seem to be having trouble responding. Please try again.")
    } finally {
      setIsTyping(false)
    }
  }, [addUserMessage, addProxyMessage, personaId, messages, ledgerEntries, addEntry, completeTaskByQuery, updateTaskByQuery, completeAllTasks])

  // Handle assess ledger (no user input, sends special token)
  const handleAssess = useCallback(async () => {
    if (isTyping) return
    setIsTyping(true)

    try {
      const response = await getAIResponse(
        personaId,
        '[ASSESS_LEDGER]',
        messages,
        ledgerEntries
      )
      await addProxyMessage(response.message)
    } catch (error) {
      console.error('Failed to assess ledger:', error)
      await addProxyMessage("I seem to be having trouble assessing your ledger. Try again.")
    } finally {
      setIsTyping(false)
    }
  }, [isTyping, addProxyMessage, personaId, messages, ledgerEntries])

  // Handle logout
  const handleLogout = () => {
    if (isOnline) {
      logout()
    }
    resetFlow()
  }

  // Convert messages format for ChatFeed
  const formattedMessages = messages.map(m => ({
    id: m.id,
    sender: m.sender,
    text: m.content || m.text,
    timestamp: new Date(m.created_at || m.timestamp).getTime(),
  }))

  if (messagesLoading) {
    return (
      <div
        className="h-screen-safe w-full flex items-center justify-center"
        style={{ backgroundColor: theme.background }}
      >
        <motion.p
          className={`${theme.font.chat} text-sm`}
          style={{ color: theme.text.muted }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading...
        </motion.p>
      </div>
    )
  }

  return (
    <LensFocusPage>
      <div
        className="h-screen-safe w-full flex flex-col"
        style={{ backgroundColor: theme.background }}
      >
        {/* Header */}
        <header
          className="flex-none flex items-center justify-between px-4 py-3 border-b"
          style={{
            borderColor: `${theme.accent}20`,
            backgroundColor: theme.background,
            paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
          }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme.accent }}
              whileHover={{ scale: 1.05 }}
            >
              <span
                className={`${theme.font.display} text-sm font-medium`}
                style={{ color: theme.background }}
              >
                {personaName[0]}
              </span>
            </motion.div>

            <div>
              <h1
                className={`${theme.font.display} text-base font-medium`}
                style={{ color: theme.text.primary }}
              >
                {personaName}
              </h1>
              <p
                className={`${theme.font.chat} text-xs`}
                style={{ color: theme.text.muted }}
              >
                {aiEnabled ? '● AI Active' : isOnline ? 'Connected' : 'Offline Mode'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLedgerOpen(!ledgerOpen)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors"
              style={{
                backgroundColor: ledgerOpen ? `${theme.accent}20` : 'transparent',
                color: theme.text.secondary,
              }}
            >
              <LedgerIconSmall />
              Ledger
            </button>

            <DropdownMenu
              theme={theme}
              onClearChat={clearMessages}
              onLogout={handleLogout}
              username={username}
              isOnline={isOnline}
              taskCounts={{
                high: ledgerEntries.filter(e => e.priority === 'high' && e.status !== 'resolved').length,
                medium: ledgerEntries.filter(e => e.priority === 'medium' && e.status !== 'resolved').length,
                low: ledgerEntries.filter(e => e.priority === 'low' && e.status !== 'resolved').length,
              }}
            />
          </div>
        </header>

        {/* Chat area - takes remaining space */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0">
            <ChatFeed
              messages={formattedMessages}
              personaId={personaId}
              isTyping={isTyping}
            />
            <ChatInput
              personaId={personaId}
              onSend={handleSend}
              onAssess={handleAssess}
              disabled={isTyping}
            />
          </div>

          {/* Desktop sidebar */}
          <div className="hidden md:block">
            <ActiveLedger
              personaId={personaId}
              isOpen={ledgerOpen}
              onClose={() => setLedgerOpen(false)}
              ledger={ledger}
            />
          </div>
        </div>

        {/* Mobile drawer */}
        <div className="md:hidden">
          <ActiveLedger
            personaId={personaId}
            isOpen={ledgerOpen}
            onClose={() => setLedgerOpen(false)}
            ledger={ledger}
          />
        </div>

        {/* Mobile ledger toggle button */}
        <LedgerToggle
          personaId={personaId}
          onClick={() => setLedgerOpen(true)}
          isOpen={ledgerOpen}
        />
      </div>

      {/* Tutorial overlay for first-time users */}
      {showTutorial && (
        <Tutorial
          personaId={personaId}
          onComplete={handleTutorialComplete}
        />
      )}

      {/* Notification permission prompt (after tutorial) */}
      {showNotificationPrompt && (
        <NotificationPrompt
          theme={theme}
          onDismiss={() => setShowNotificationPrompt(false)}
        />
      )}
    </LensFocusPage>
  )
}

function DropdownMenu({ theme, onClearChat, onLogout, username, isOnline, taskCounts }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleTestNotification = async () => {
    if (!('Notification' in window)) {
      alert('Notifications not supported')
      return
    }

    if (Notification.permission !== 'granted') {
      alert('Please enable notifications first')
      return
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready

    // Build message based on actual task counts
    const { high, medium, low } = taskCounts
    const total = high + medium + low
    let body = total === 0
      ? 'No pending tasks. Nice work!'
      : high > 0
        ? `You have ${high} high priority and ${medium + low} other tasks pending`
        : `You have ${total} task${total > 1 ? 's' : ''} pending`

    // Show notification via service worker
    registration.showNotification('PROXY', {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      tag: 'proxy-test',
      renotify: true,
      vibrate: [100, 50, 100]
    })

    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded hover:bg-white/5 transition-colors"
        style={{ color: theme.text.secondary }}
      >
        <MenuIcon />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[55]"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            className="absolute right-0 top-full mt-2 w-48 rounded-lg shadow-xl z-[60] overflow-hidden"
            style={{ backgroundColor: theme.surface }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              className="px-4 py-3 border-b"
              style={{ borderColor: `${theme.accent}20` }}
            >
              <p
                className={`${theme.font.chat} text-xs`}
                style={{ color: theme.text.muted }}
              >
                Signed in as
              </p>
              <p
                className={`${theme.font.chat} text-sm font-medium truncate`}
                style={{ color: theme.text.primary }}
              >
                {username}
              </p>
              <p
                className={`${theme.font.chat} text-[10px] mt-1`}
                style={{ color: isOnline ? '#22C55E' : theme.text.muted }}
              >
                {isOnline ? '● Synced' : '○ Local only'}
              </p>
            </div>

            <button
              onClick={handleTestNotification}
              className={`w-full px-4 py-2.5 text-left ${theme.font.chat} text-sm hover:bg-white/5 transition-colors`}
              style={{ color: theme.text.secondary }}
            >
              Test notification
            </button>

            <button
              onClick={() => {
                onClearChat()
                setIsOpen(false)
              }}
              className={`w-full px-4 py-2.5 text-left ${theme.font.chat} text-sm hover:bg-white/5 transition-colors`}
              style={{ color: theme.text.secondary }}
            >
              Clear chat history
            </button>

            <button
              onClick={() => {
                onLogout()
                setIsOpen(false)
              }}
              className={`w-full px-4 py-2.5 text-left ${theme.font.chat} text-sm hover:bg-white/5 transition-colors`}
              style={{ color: theme.accent }}
            >
              {isOnline ? 'Sign out' : 'Restart diagnostic'}
            </button>
          </motion.div>
        </>
      )}
    </div>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  )
}

function LedgerIconSmall() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}
