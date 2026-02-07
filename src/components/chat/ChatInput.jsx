import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { THEMES } from '../../config/themes'

/**
 * Chat input component styled per persona theme
 */
export function ChatInput({ personaId, onSend, onAssess, disabled = false }) {
  const theme = THEMES[personaId]
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  // Auto-resize textarea based on content
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px' // Max 120px (~4 lines)
    }
  }, [])

  useEffect(() => {
    if (!disabled) {
      textareaRef.current?.focus()
    }
  }, [disabled])

  // Scroll chat into view when input is focused (mobile keyboard)
  const handleFocus = () => {
    // Small delay to let keyboard open
    setTimeout(() => {
      textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 300)
  }

  useEffect(() => {
    adjustHeight()
  }, [value, adjustHeight])

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return

    onSend(trimmed)
    setValue('')
    // Reset height after clearing
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex-shrink-0 p-4 border-t"
      style={{
        borderColor: `${theme.accent}20`,
        paddingBottom: `max(1rem, env(safe-area-inset-bottom))`,
      }}
    >
      {/* Assess Ledger button */}
      {onAssess && (
        <motion.button
          type="button"
          onClick={onAssess}
          disabled={disabled}
          className={`
            w-full mb-2 py-2 rounded-md text-xs tracking-wider ${theme.font.chat}
            transition-colors disabled:opacity-30 disabled:cursor-not-allowed
          `}
          style={{
            backgroundColor: `${theme.accent}15`,
            color: theme.accent,
            border: `1px solid ${theme.accent}25`,
          }}
          whileHover={!disabled ? { backgroundColor: `${theme.accent}25` } : {}}
          whileTap={!disabled ? { scale: 0.98 } : {}}
        >
          ASSESS LEDGER
        </motion.button>
      )}

      <div
        className="flex items-end gap-3 p-2 rounded-lg"
        style={{ backgroundColor: theme.surface }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={getPlaceholder(personaId)}
          disabled={disabled}
          autoComplete="on"
          autoCorrect="on"
          spellCheck="true"
          autoCapitalize="sentences"
          rows={1}
          className={`
            flex-1 bg-transparent outline-none px-2 resize-none
            ${theme.font.chat}
            placeholder:opacity-40
          `}
          style={{
            color: theme.text.primary,
            fontSize: '16px', // Prevents iOS zoom on focus
            lineHeight: '1.4',
            minHeight: '24px',
            maxHeight: '120px',
          }}
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
    case 'p2': return 'State the facts...'
    case 'p3': return 'Report, soldier...'
    case 'p4': return 'Secure channel open...'
    case 'p5': return 'Speak your truth...'
    case 'p6': return 'State your purpose...'
    case 'p7': return 'Amuse me...'
    case 'p8': return 'Make it quick...'
    case 'p9': return 'Talk to me, Jarvis...'
    case 'p10': return 'Speak, you may...'
    default: return 'Type a message...'
  }
}
