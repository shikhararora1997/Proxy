import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { THEMES } from '../../config/themes'
import { useLedger } from '../../hooks/useLedger'

/**
 * Active Ledger - Interactive sidebar/drawer
 *
 * Desktop: Right-hand sidebar
 * Mobile: Swipe-out drawer from right
 */
export function ActiveLedger({ personaId, isOpen, onClose }) {
  const theme = THEMES[personaId]
  const { entries, loading, addEntry, resolveEntry, deleteEntry, pendingCount } = useLedger()
  const [newItem, setNewItem] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAddEntry = async (e) => {
    e.preventDefault()
    if (!newItem.trim()) return

    await addEntry(newItem.trim())
    setNewItem('')
    setIsAdding(false)
  }

  const pendingEntries = entries.filter(e => e.status === 'pending')
  const resolvedEntries = entries.filter(e => e.status === 'resolved')

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
          <div className="flex items-center gap-2">
            <h2
              className={`${theme.font.display} text-sm tracking-wider`}
              style={{ color: theme.text.secondary }}
            >
              ACTIVE LEDGER
            </h2>
            {pendingCount > 0 && (
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-mono"
                style={{ backgroundColor: theme.accent, color: theme.background }}
              >
                {pendingCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded hover:bg-white/10 transition-colors"
            style={{ color: theme.text.muted }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <motion.p
                className={`${theme.font.chat} text-xs`}
                style={{ color: theme.text.muted }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                Loading...
              </motion.p>
            </div>
          ) : (
            <>
              {/* Pending entries */}
              <div className="space-y-2 mb-6">
                <p
                  className={`${theme.font.chat} text-[10px] tracking-wider mb-3`}
                  style={{ color: theme.text.muted }}
                >
                  PENDING
                </p>
                {pendingEntries.length === 0 ? (
                  <p
                    className={`${theme.font.chat} text-xs italic`}
                    style={{ color: theme.text.muted }}
                  >
                    No pending items
                  </p>
                ) : (
                  pendingEntries.map((entry, index) => (
                    <LedgerItem
                      key={entry.id}
                      entry={entry}
                      theme={theme}
                      index={index}
                      onResolve={() => resolveEntry(entry.id)}
                      onDelete={() => deleteEntry(entry.id)}
                    />
                  ))
                )}
              </div>

              {/* Resolved entries */}
              {resolvedEntries.length > 0 && (
                <div className="space-y-2">
                  <p
                    className={`${theme.font.chat} text-[10px] tracking-wider mb-3`}
                    style={{ color: theme.text.muted }}
                  >
                    RESOLVED
                  </p>
                  {resolvedEntries.slice(0, 5).map((entry, index) => (
                    <LedgerItem
                      key={entry.id}
                      entry={entry}
                      theme={theme}
                      index={index}
                      onDelete={() => deleteEntry(entry.id)}
                      isResolved
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Add new entry */}
        <div
          className="p-4 border-t"
          style={{ borderColor: `${theme.accent}20` }}
        >
          <AnimatePresence mode="wait">
            {isAdding ? (
              <motion.form
                key="form"
                onSubmit={handleAddEntry}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <input
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="Enter item..."
                  className={`
                    w-full p-2 rounded text-sm ${theme.font.chat}
                    outline-none
                  `}
                  style={{
                    backgroundColor: theme.background,
                    color: theme.text.primary,
                    border: `1px solid ${theme.accent}30`,
                  }}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className={`
                      flex-1 p-2 rounded text-xs ${theme.font.chat}
                      transition-colors
                    `}
                    style={{
                      backgroundColor: theme.accent,
                      color: theme.background,
                    }}
                  >
                    ADD
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdding(false)
                      setNewItem('')
                    }}
                    className={`
                      px-3 p-2 rounded text-xs ${theme.font.chat}
                      transition-colors
                    `}
                    style={{
                      backgroundColor: `${theme.text.muted}20`,
                      color: theme.text.muted,
                    }}
                  >
                    CANCEL
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.button
                key="button"
                onClick={() => setIsAdding(true)}
                className={`
                  w-full p-2 rounded text-xs ${theme.font.chat}
                  transition-colors hover:opacity-80
                `}
                style={{
                  backgroundColor: `${theme.accent}20`,
                  color: theme.accent,
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                + ADD ITEM
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </>
  )
}

function LedgerItem({ entry, theme, index, onResolve, onDelete, isResolved }) {
  const [showActions, setShowActions] = useState(false)

  return (
    <motion.div
      className="group relative p-3 rounded border"
      style={{
        backgroundColor: `${theme.background}80`,
        borderColor: `${theme.accent}10`,
        opacity: isResolved ? 0.6 : 1,
      }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: isResolved ? 0.6 : 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => setShowActions(!showActions)}
    >
      <p
        className={`${theme.font.chat} text-sm pr-8 ${isResolved ? 'line-through' : ''}`}
        style={{ color: theme.text.primary }}
      >
        {entry.description}
      </p>

      {/* Actions */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            className="flex gap-2 mt-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {!isResolved && onResolve && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onResolve()
                }}
                className={`
                  px-2 py-1 rounded text-[10px] ${theme.font.chat}
                  transition-colors
                `}
                style={{
                  backgroundColor: '#22C55E20',
                  color: '#22C55E',
                }}
              >
                RESOLVE
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className={`
                px-2 py-1 rounded text-[10px] ${theme.font.chat}
                transition-colors
              `}
              style={{
                backgroundColor: '#EF444420',
                color: '#EF4444',
              }}
            >
              DELETE
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status indicator */}
      <div
        className="absolute top-3 right-3 w-2 h-2 rounded-full"
        style={{
          backgroundColor: isResolved ? '#22C55E' : theme.accent,
        }}
      />
    </motion.div>
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
