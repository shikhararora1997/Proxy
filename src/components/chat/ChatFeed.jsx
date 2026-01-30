import { useRef, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ChatBubble, TypingIndicator } from './ChatBubble'
import { THEMES } from '../../config/themes'

/**
 * Chat message feed with auto-scroll
 */
export function ChatFeed({ messages, personaId, isTyping = false }) {
  const theme = THEMES[personaId]
  const feedRef = useRef(null)
  const bottomRef = useRef(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <div
      ref={feedRef}
      className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0"
      style={{
        // Add paper grain texture for Gandalf
        backgroundImage: theme.effects.grain
          ? `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`
          : undefined,
      }}
    >
      {messages.length === 0 && !isTyping && (
        <EmptyState personaId={personaId} />
      )}

      {messages.map((message, index) => (
        <ChatBubble
          key={message.id}
          message={message}
          personaId={personaId}
          isLatest={index === messages.length - 1}
        />
      ))}

      <AnimatePresence>
        {isTyping && <TypingIndicator personaId={personaId} />}
      </AnimatePresence>

      <div ref={bottomRef} />
    </div>
  )
}

function EmptyState({ personaId }) {
  const theme = THEMES[personaId]

  const hints = {
    p1: 'Your ledger awaits. Begin when ready.',
    p2: 'The clock is ticking. Make your move.',
    p3: 'A blank page holds infinite possibilities.',
    p4: 'This silence is boring. Say something!',
  }

  return (
    <div className="flex items-center justify-center h-full">
      <p
        className={`text-sm ${theme.font.chat} text-center px-8`}
        style={{ color: theme.text.muted }}
      >
        {hints[personaId]}
      </p>
    </div>
  )
}
