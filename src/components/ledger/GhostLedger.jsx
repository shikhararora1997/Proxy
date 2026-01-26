import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { THEMES } from '../../config/themes'

/**
 * Ghost Ledger - Static placeholder sidebar/drawer
 *
 * Desktop: Right-hand sidebar
 * Mobile: Swipe-out drawer from right
 */
export function GhostLedger({ personaId, isOpen, onClose }) {
  const theme = THEMES[personaId]

  const placeholderTasks = [
    { id: 1, text: 'Review Q3 Strategy', status: 'pending' },
    { id: 2, text: 'Schedule team sync', status: 'pending' },
    { id: 3, text: 'Draft investor update', status: 'pending' },
  ]

  return (
    <>
      {/* Mobile drawer backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Ledger panel */}
      <motion.aside
        className={`
          fixed md:relative right-0 top-0 h-full z-50
          w-72 md:w-80
          flex flex-col
          border-l
          md:translate-x-0
        `}
        style={{
          backgroundColor: theme.surface,
          borderColor: `${theme.accent}20`,
        }}
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        {/* Header */}
        <div
          className="p-4 border-b flex items-center justify-between"
          style={{ borderColor: `${theme.accent}20` }}
        >
          <h2
            className={`${theme.font.display} text-sm tracking-wider`}
            style={{ color: theme.text.secondary }}
          >
            ACTIVE LEDGER
          </h2>
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded hover:bg-white/10 transition-colors"
            style={{ color: theme.text.muted }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Task list */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {placeholderTasks.map((task, index) => (
              <motion.div
                key={task.id}
                className="p-3 rounded border"
                style={{
                  backgroundColor: `${theme.background}80`,
                  borderColor: `${theme.accent}10`,
                }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <p
                  className={`${theme.font.chat} text-sm`}
                  style={{ color: theme.text.primary }}
                >
                  {task.text}
                </p>
                <span
                  className="text-[10px] uppercase tracking-wider mt-2 inline-block"
                  style={{ color: theme.accent }}
                >
                  [{task.status}]
                </span>
              </motion.div>
            ))}
          </div>

          {/* Ghost notice */}
          <motion.div
            className="mt-6 p-3 rounded border border-dashed text-center"
            style={{ borderColor: `${theme.text.muted}30` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p
              className={`${theme.font.chat} text-xs`}
              style={{ color: theme.text.muted }}
            >
              Ghost Mode Active
            </p>
            <p
              className={`${theme.font.chat} text-[10px] mt-1`}
              style={{ color: theme.text.muted }}
            >
              Ledger sync pending backend connection
            </p>
          </motion.div>
        </div>

        {/* Footer */}
        <div
          className="p-4 border-t"
          style={{ borderColor: `${theme.accent}20` }}
        >
          <button
            className={`
              w-full p-2 rounded text-xs ${theme.font.chat}
              transition-colors hover:opacity-80
            `}
            style={{
              backgroundColor: `${theme.accent}20`,
              color: theme.accent,
            }}
          >
            + ADD ITEM
          </button>
        </div>
      </motion.aside>
    </>
  )
}

/**
 * Toggle button for mobile drawer
 */
export function LedgerToggle({ personaId, onClick, isOpen }) {
  const theme = THEMES[personaId]

  return (
    <motion.button
      onClick={onClick}
      className="md:hidden fixed right-4 bottom-24 z-30 p-3 rounded-full shadow-lg"
      style={{
        backgroundColor: theme.accent,
        color: theme.background,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <LedgerIcon />
    </motion.button>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function LedgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}
