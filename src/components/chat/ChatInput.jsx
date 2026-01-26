import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { THEMES } from '../../config/themes'

/**
 * Chat input component styled per persona theme
 */
export function ChatInput({ personaId, onSend, disabled = false }) {
  const theme = THEMES[personaId]
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus()
    }
  }, [disabled])

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return

    onSend(trimmed)
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t" style={{ borderColor: `${theme.accent}20` }}>
      <div
        className="flex items-center gap-3 p-2 rounded-lg"
        style={{ backgroundColor: theme.surface }}
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={getPlaceholder(personaId)}
          disabled={disabled}
          className={`
            flex-1 bg-transparent outline-none text-sm md:text-base px-2
            ${theme.font.chat}
            placeholder:opacity-40
          `}
          style={{ color: theme.text.primary }}
        />
        <motion.button
          type="submit"
          disabled={disabled || !value.trim()}
          className={`
            p-2 rounded-md transition-colors
            ${theme.font.chat}
            disabled:opacity-30 disabled:cursor-not-allowed
          `}
          style={{
            backgroundColor: value.trim() ? theme.accent : 'transparent',
            color: value.trim() ? theme.background : theme.text.muted,
          }}
          whileHover={value.trim() ? { scale: 1.05 } : {}}
          whileTap={value.trim() ? { scale: 0.95 } : {}}
        >
          <SendIcon />
        </motion.button>
      </div>
    </form>
  )
}

function SendIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

function getPlaceholder(personaId) {
  switch (personaId) {
    case 'p1': return 'Type your request, sir...'
    case 'p2': return 'What\'s the move?'
    case 'p3': return 'Speak your truth...'
    case 'p4': return 'Say something fun!'
    default: return 'Type a message...'
  }
}
