import { motion } from 'framer-motion'
import { THEMES } from '../../config/themes'

/**
 * Chat bubble component styled per persona theme
 */
export function ChatBubble({ message, personaId, isLatest = false }) {
  const theme = THEMES[personaId]
  const isUser = message.sender === 'user'

  const bubbleStyle = {
    backgroundColor: isUser ? theme.chat.userBubble : theme.chat.proxyBubble,
    color: isUser ? theme.chat.userText : theme.chat.proxyText,
    borderRadius: theme.chat.borderRadius,
  }

  // Add glow effect for personas that have it
  if (theme.effects.glow && !isUser) {
    bubbleStyle.boxShadow = `0 0 20px ${theme.accent}20`
  }

  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
      initial={isLatest ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <div
        className={`
          max-w-[80%] md:max-w-[70%] px-4 py-3
          ${theme.font.chat}
          ${isUser ? 'ml-auto' : 'mr-auto'}
        `}
        style={bubbleStyle}
      >
        <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
          {message.text}
        </p>
        <p
          className="text-[10px] mt-2 opacity-50"
          style={{ color: isUser ? theme.chat.userText : theme.chat.proxyText }}
        >
          {formatTime(message.timestamp)}
        </p>
      </div>
    </motion.div>
  )
}

/**
 * Typing indicator bubble
 */
export function TypingIndicator({ personaId }) {
  const theme = THEMES[personaId]

  return (
    <motion.div
      className="flex justify-start mb-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`px-4 py-3 ${theme.font.chat}`}
        style={{
          backgroundColor: theme.chat.proxyBubble,
          borderRadius: theme.chat.borderRadius,
          boxShadow: theme.effects.glow ? `0 0 20px ${theme.accent}20` : undefined,
        }}
      >
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: theme.chat.proxyText }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
