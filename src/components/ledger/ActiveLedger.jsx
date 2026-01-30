import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { THEMES } from '../../config/themes'
import { useLedger } from '../../hooks/useLedger'

const PRIORITY_CONFIG = {
  high: { label: 'HIGH', color: '#EF4444' },
  medium: { label: 'MEDIUM', color: '#F59E0B' },
  low: { label: 'LOW', color: '#22C55E' },
}

/**
 * Active Ledger - Task list sidebar/drawer with priority sublists
 *
 * Desktop: Right-hand sidebar
 * Mobile: Swipe-out drawer from right
 */
export function ActiveLedger({ personaId, isOpen, onClose, ledger }) {
  const theme = THEMES[personaId]
  // Use shared ledger from Dashboard (or fallback to own hook)
  const ownLedger = useLedger()
  const {
    visibleEntries,
    loading,
    addEntry,
    completeEntry,
    uncompleteEntry,
    updateDueDate,
    deleteEntry,
    pendingCount,
  } = ledger || ownLedger
  const [newItem, setNewItem] = useState('')
  const [newPriority, setNewPriority] = useState('medium')
  const [newDueDate, setNewDueDate] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  // Default due date: 3 hours from now
  const getDefaultDueDate = () => {
    const d = new Date()
    d.setHours(d.getHours() + 3)
    return d.toISOString()
  }

  const handleAddEntry = async (e) => {
    e.preventDefault()
    if (!newItem.trim()) return

    const dueAt = newDueDate ? new Date(newDueDate).toISOString() : getDefaultDueDate()
    await addEntry(newItem.trim(), null, null, newPriority, dueAt)
    setNewItem('')
    setNewPriority('medium')
    setNewDueDate('')
    setIsAdding(false)
  }

  // Check if task is overdue
  const isOverdue = (entry) => {
    if (!entry.due_at || entry.status === 'resolved') return false
    return new Date(entry.due_at) < new Date()
  }

  // Group by priority, with completed items sorted to bottom of each group
  // Overdue tasks always go to HIGH priority
  const sortGroup = (items) => {
    const pending = items.filter(e => e.status === 'pending')
    const completed = items.filter(e => e.status === 'resolved')
    // Sort pending: overdue first, then by due date
    pending.sort((a, b) => {
      const aOverdue = isOverdue(a)
      const bOverdue = isOverdue(b)
      if (aOverdue && !bOverdue) return -1
      if (!aOverdue && bOverdue) return 1
      return 0
    })
    return [...pending, ...completed]
  }

  // Overdue tasks go to HIGH regardless of original priority
  const overdueEntries = visibleEntries.filter(e => isOverdue(e))
  const nonOverdueEntries = visibleEntries.filter(e => !isOverdue(e))

  const highTasks = sortGroup([
    ...overdueEntries,
    ...nonOverdueEntries.filter(e => e.priority === 'high')
  ])
  const mediumTasks = sortGroup(nonOverdueEntries.filter(e => e.priority === 'medium' || !e.priority))
  const lowTasks = sortGroup(nonOverdueEntries.filter(e => e.priority === 'low'))

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
              TASKS
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
              <PrioritySection
                label="HIGH"
                color={PRIORITY_CONFIG.high.color}
                tasks={highTasks}
                theme={theme}
                onComplete={completeEntry}
                onUncomplete={uncompleteEntry}
                onUpdateDueDate={updateDueDate}
                onDelete={deleteEntry}
              />
              <PrioritySection
                label="MEDIUM"
                color={PRIORITY_CONFIG.medium.color}
                tasks={mediumTasks}
                theme={theme}
                onComplete={completeEntry}
                onUncomplete={uncompleteEntry}
                onUpdateDueDate={updateDueDate}
                onDelete={deleteEntry}
              />
              <PrioritySection
                label="LOW"
                color={PRIORITY_CONFIG.low.color}
                tasks={lowTasks}
                theme={theme}
                onComplete={completeEntry}
                onUncomplete={uncompleteEntry}
                onUpdateDueDate={updateDueDate}
                onDelete={deleteEntry}
              />

              {visibleEntries.length === 0 && (
                <p
                  className={`${theme.font.chat} text-xs italic text-center mt-8`}
                  style={{ color: theme.text.muted }}
                >
                  No tasks yet
                </p>
              )}
            </>
          )}
        </div>

        {/* Add new task */}
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
                  placeholder="Enter task..."
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

                {/* Priority selector */}
                <div className="flex gap-1">
                  {['high', 'medium', 'low'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewPriority(p)}
                      className={`
                        flex-1 py-1 rounded text-[10px] font-mono tracking-wider
                        transition-all
                      `}
                      style={{
                        backgroundColor: newPriority === p ? PRIORITY_CONFIG[p].color : `${theme.text.muted}15`,
                        color: newPriority === p ? '#fff' : theme.text.muted,
                      }}
                    >
                      {PRIORITY_CONFIG[p].label}
                    </button>
                  ))}
                </div>

                {/* Due date & time input */}
                <div className="flex items-center gap-2">
                  <span
                    className={`${theme.font.chat} text-[10px]`}
                    style={{ color: theme.text.muted }}
                  >
                    Due:
                  </span>
                  <input
                    type="datetime-local"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className={`
                      flex-1 p-1.5 rounded text-xs ${theme.font.chat}
                      outline-none
                    `}
                    style={{
                      backgroundColor: theme.background,
                      color: theme.text.primary,
                      border: `1px solid ${theme.accent}30`,
                    }}
                  />
                </div>

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
                      setNewPriority('medium')
                      setNewDueDate('')
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
                + ADD TASK
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </>
  )
}

function PrioritySection({ label, color, tasks, theme, onComplete, onUncomplete, onUpdateDueDate, onDelete }) {
  if (tasks.length === 0) return null

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        <p
          className={`${theme.font.chat} text-[10px] tracking-wider`}
          style={{ color: theme.text.muted }}
        >
          {label}
        </p>
        <span
          className={`${theme.font.chat} text-[10px]`}
          style={{ color: theme.text.muted }}
        >
          ({tasks.filter(t => t.status === 'pending').length})
        </span>
      </div>

      <div className="space-y-1.5">
        {tasks.map((entry, index) => (
          <TaskItem
            key={entry.id}
            entry={entry}
            theme={theme}
            onUpdateDueDate={onUpdateDueDate}
            index={index}
            onComplete={() => onComplete(entry.id)}
            onUncomplete={() => onUncomplete(entry.id)}
            onDelete={() => onDelete(entry.id)}
          />
        ))}
      </div>
    </div>
  )
}

function TaskItem({ entry, theme, index, onComplete, onUncomplete, onUpdateDueDate, onDelete }) {
  const isCompleted = entry.status === 'resolved'
  const [showActions, setShowActions] = useState(false)
  const [editingDue, setEditingDue] = useState(false)

  // Format due date for display
  const formatDueDate = (dueAt) => {
    if (!dueAt) return null
    const due = new Date(dueAt)
    const now = new Date()
    const diffMs = due - now
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffMs < 0) return { text: 'Overdue', color: '#EF4444', isOverdue: true }
    if (diffHours <= 1) return { text: '1h', color: '#EF4444' }
    if (diffHours <= 12) return { text: `${diffHours}h`, color: '#F59E0B' }
    if (diffDays === 0) return { text: 'Today', color: '#F59E0B' }
    if (diffDays === 1) return { text: 'Tomorrow', color: '#F59E0B' }
    if (diffDays <= 7) return { text: `${diffDays}d`, color: theme.text.muted }
    return { text: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), color: theme.text.muted }
  }

  const dueInfo = formatDueDate(entry.due_at)

  // Format for date input
  const formatForInput = (dueAt) => {
    if (!dueAt) return ''
    return new Date(dueAt).toISOString().split('T')[0]
  }

  const handleDueDateChange = (e) => {
    const newDate = e.target.value
    if (newDate) {
      const d = new Date(newDate)
      d.setHours(18, 0, 0, 0) // Default to 6pm
      onUpdateDueDate(entry.id, d.toISOString())
    }
    setEditingDue(false)
  }

  return (
    <motion.div
      className="group relative flex flex-col gap-1 p-2.5 rounded border"
      style={{
        backgroundColor: `${theme.background}80`,
        borderColor: `${theme.accent}10`,
        opacity: isCompleted ? 0.5 : 1,
      }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: isCompleted ? 0.5 : 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={() => setShowActions(!showActions)}
    >
      <div className="flex items-start gap-2.5">
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            isCompleted ? onUncomplete() : onComplete()
          }}
          className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-sm border flex items-center justify-center transition-colors"
          style={{
            borderColor: isCompleted ? '#22C55E' : `${theme.text.muted}50`,
            backgroundColor: isCompleted ? '#22C55E' : 'transparent',
            cursor: 'pointer',
          }}
        >
          {isCompleted && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>

        {/* Description + Due date */}
        <div className="flex-1 min-w-0">
          <p
            className={`${theme.font.chat} text-sm ${isCompleted ? 'line-through' : ''}`}
            style={{ color: isCompleted ? theme.text.muted : theme.text.primary }}
          >
            {entry.description}
          </p>

          {/* Due date display/edit */}
          {!isCompleted && (
            <div className="flex items-center gap-1.5 mt-1">
              {editingDue ? (
                <input
                  type="date"
                  defaultValue={formatForInput(entry.due_at)}
                  onChange={handleDueDateChange}
                  onBlur={() => setEditingDue(false)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                  className="text-[10px] font-mono px-1 py-0.5 rounded border outline-none"
                  style={{
                    backgroundColor: theme.background,
                    borderColor: `${theme.accent}30`,
                    color: theme.text.primary,
                  }}
                />
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingDue(true)
                  }}
                  className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded hover:opacity-80 transition-opacity"
                  style={{
                    backgroundColor: dueInfo ? `${dueInfo.color}15` : `${theme.text.muted}15`,
                    color: dueInfo?.color || theme.text.muted,
                  }}
                >
                  <ClockIcon />
                  {dueInfo?.text || 'Set due'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Delete button (shown on click) */}
        <AnimatePresence>
          {showActions && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors"
              style={{
                backgroundColor: '#EF444420',
                color: '#EF4444',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              DEL
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function ClockIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
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
      className="md:hidden fixed right-4 bottom-48 z-30 p-3 rounded-full shadow-lg"
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
