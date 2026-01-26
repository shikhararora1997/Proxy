import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useProxy } from '../context/ProxyContext'
import { useAuth } from '../context/AuthContext'
import { THEMES, GHOST_RESPONSES, WELCOME_MESSAGES } from '../config/themes'
import { PERSONA_NAMES } from '../config/personas'
import { useMessages } from '../hooks/useMessages'
import { ChatFeed } from '../components/chat/ChatFeed'
import { ChatInput } from '../components/chat/ChatInput'
import { ActiveLedger, LedgerToggle } from '../components/ledger/ActiveLedger'
import { LensFocusPage } from '../components/transitions/LensFocus'

/**
 * Dashboard Screen
 *
 * The main chat interface post-discovery.
 * Themed per persona with active ledger sidebar.
 */
export function Dashboard() {
  const { username, personaId, resetFlow } = useProxy()
  const { signOut, isOnline } = useAuth()
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

  const [isTyping, setIsTyping] = useState(false)
  const [ledgerOpen, setLedgerOpen] = useState(false)
  const [welcomeSent, setWelcomeSent] = useState(false)

  // Send welcome message on first visit
  useEffect(() => {
    if (!messagesLoading && isEmpty && !welcomeSent) {
      setWelcomeSent(true)
      setIsTyping(true)
      const timer = setTimeout(() => {
        addProxyMessage(WELCOME_MESSAGES[personaId])
        setIsTyping(false)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [messagesLoading, isEmpty, welcomeSent, personaId, addProxyMessage])

  // Handle user message and ghost response
  const handleSend = useCallback(async (text) => {
    await addUserMessage(text)

    // Simulate typing delay then ghost response
    setIsTyping(true)
    setTimeout(async () => {
      await addProxyMessage(GHOST_RESPONSES[personaId])
      setIsTyping(false)
    }, 1500)
  }, [addUserMessage, addProxyMessage, personaId])

  // Handle logout
  const handleLogout = async () => {
    if (isOnline) {
      await signOut()
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
        className="h-screen-safe w-full flex"
        style={{ backgroundColor: theme.background }}
      >
        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: `${theme.accent}20` }}
          >
            <div className="flex items-center gap-3">
              {/* Persona avatar */}
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
                  {isOnline ? 'Connected' : 'Offline Mode'}
                </p>
              </div>
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-2">
              {/* Desktop ledger toggle */}
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

              {/* Menu */}
              <DropdownMenu
                theme={theme}
                onClearChat={clearMessages}
                onLogout={handleLogout}
                username={username}
                isOnline={isOnline}
              />
            </div>
          </header>

          {/* Chat feed */}
          <ChatFeed
            messages={formattedMessages}
            personaId={personaId}
            isTyping={isTyping}
          />

          {/* Chat input */}
          <ChatInput
            personaId={personaId}
            onSend={handleSend}
            disabled={isTyping}
          />
        </div>

        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <ActiveLedger
            personaId={personaId}
            isOpen={ledgerOpen}
            onClose={() => setLedgerOpen(false)}
          />
        </div>

        {/* Mobile drawer */}
        <div className="md:hidden">
          <ActiveLedger
            personaId={personaId}
            isOpen={ledgerOpen}
            onClose={() => setLedgerOpen(false)}
          />
        </div>

        {/* Mobile ledger toggle button */}
        <LedgerToggle
          personaId={personaId}
          onClick={() => setLedgerOpen(true)}
          isOpen={ledgerOpen}
        />
      </div>
    </LensFocusPage>
  )
}

function DropdownMenu({ theme, onClearChat, onLogout, username, isOnline }) {
  const [isOpen, setIsOpen] = useState(false)

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
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            className="absolute right-0 top-full mt-2 w-48 rounded-lg shadow-xl z-50 overflow-hidden"
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
