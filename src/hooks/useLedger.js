import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const LOCAL_STORAGE_KEY = 'proxy_ledger_entries'
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000

/**
 * Hook for managing task ledger entries with Supabase
 * Falls back to localStorage if Supabase is not configured
 */
export function useLedger() {
  const { profile } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch entries
  const fetchEntries = useCallback(async () => {
    if (!isSupabaseConfigured() || !profile) {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (stored) {
        try {
          setEntries(JSON.parse(stored))
        } catch (e) {
          setEntries([])
        }
      }
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('ledger_entries')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching ledger:', error)
    } else {
      setEntries(data || [])
    }
    setLoading(false)
  }, [profile])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  // Save to localStorage (fallback)
  const saveToLocal = useCallback((data) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
  }, [])

  // Filter out completed tasks older than 24h
  const visibleEntries = useMemo(() => {
    return entries.filter(e => {
      if (e.status !== 'resolved' || !e.completed_at) return true
      return (Date.now() - new Date(e.completed_at).getTime()) < TWENTY_FOUR_HOURS
    })
  }, [entries])

  // Add entry with priority and due date
  const addEntry = useCallback(async (description, category = null, amount = null, priority = 'medium', dueAt = null) => {
    console.log('[useLedger] addEntry called:', { description, priority, dueAt })
    const newEntry = {
      id: crypto.randomUUID(),
      description,
      category,
      amount,
      priority,
      due_at: dueAt,
      status: 'pending',
      completed_at: null,
      created_at: new Date().toISOString(),
      user_id: profile?.id,
    }

    // Use functional update to avoid stale closure issues with multiple rapid calls
    setEntries(prev => [newEntry, ...prev])

    if (!isSupabaseConfigured() || !profile) {
      // For localStorage, we need to get latest state
      setEntries(prev => {
        saveToLocal(prev)
        return prev
      })
      return newEntry
    }

    const { data, error } = await supabase
      .from('ledger_entries')
      .insert({
        user_id: profile.id,
        description,
        category,
        amount,
        priority,
        due_at: dueAt,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('[useLedger] Error adding entry:', error)
      // If due_at column doesn't exist, try without it
      if (error.message?.includes('due_at')) {
        console.log('[useLedger] Retrying without due_at column')
        const { data: retryData, error: retryError } = await supabase
          .from('ledger_entries')
          .insert({
            user_id: profile.id,
            description,
            category,
            amount,
            priority,
            status: 'pending',
          })
          .select()
          .single()
        if (!retryError) {
          setEntries(prev => prev.map(e => e.id === newEntry.id ? retryData : e))
          return retryData
        }
      }
      // Remove the optimistically added entry on error
      setEntries(prev => prev.filter(e => e.id !== newEntry.id))
      return null
    }

    setEntries(prev => prev.map(e => e.id === newEntry.id ? data : e))
    return data
  }, [profile, saveToLocal])

  // Complete a task (set resolved + completed_at timestamp)
  const completeEntry = useCallback(async (id) => {
    const now = new Date().toISOString()
    const updated = entries.map(e =>
      e.id === id ? { ...e, status: 'resolved', completed_at: now } : e
    )
    setEntries(updated)

    if (!isSupabaseConfigured() || !profile) {
      saveToLocal(updated)
      return true
    }

    const { error } = await supabase
      .from('ledger_entries')
      .update({ status: 'resolved', completed_at: now })
      .eq('id', id)

    if (error) {
      console.error('Error completing entry:', error)
      setEntries(entries)
      return false
    }

    return true
  }, [profile, entries, saveToLocal])

  // Uncomplete a task (revert to pending)
  const uncompleteEntry = useCallback(async (id) => {
    const updated = entries.map(e =>
      e.id === id ? { ...e, status: 'pending', completed_at: null } : e
    )
    setEntries(updated)

    if (!isSupabaseConfigured() || !profile) {
      saveToLocal(updated)
      return true
    }

    const { error } = await supabase
      .from('ledger_entries')
      .update({ status: 'pending', completed_at: null })
      .eq('id', id)

    if (error) {
      console.error('Error uncompleting entry:', error)
      setEntries(entries)
      return false
    }

    return true
  }, [profile, entries, saveToLocal])

  // Update due date for a task
  const updateDueDate = useCallback(async (id, dueAt) => {
    const updated = entries.map(e =>
      e.id === id ? { ...e, due_at: dueAt } : e
    )
    setEntries(updated)

    if (!isSupabaseConfigured() || !profile) {
      saveToLocal(updated)
      return true
    }

    const { error } = await supabase
      .from('ledger_entries')
      .update({ due_at: dueAt })
      .eq('id', id)

    if (error) {
      console.error('Error updating due date:', error)
      setEntries(entries)
      return false
    }

    return true
  }, [profile, entries, saveToLocal])

  // Complete a task by fuzzy matching query against pending descriptions
  const completeTaskByQuery = useCallback(async (query) => {
    const q = query.toLowerCase().trim()
    const pending = entries.filter(e => e.status === 'pending')

    // Score each task based on match quality
    const scoredTasks = pending.map(e => {
      const desc = e.description.toLowerCase()
      let score = 0

      // Exact match = highest score
      if (desc === q) score = 100

      // Full query contained in description
      else if (desc.includes(q)) score = 80

      // Description contained in query
      else if (q.includes(desc)) score = 70

      // Word-based matching
      else {
        const queryWords = q.split(/\s+/).filter(w => w.length > 1)
        const matchedWords = queryWords.filter(w => desc.includes(w))
        score = (matchedWords.length / queryWords.length) * 60
      }

      return { entry: e, score }
    })

    // Get best match with minimum score threshold
    const bestMatch = scoredTasks
      .filter(t => t.score >= 30)
      .sort((a, b) => b.score - a.score)[0]

    if (bestMatch) {
      console.log('[useLedger] Completing task:', { query, matched: bestMatch.entry.description, score: bestMatch.score })
      return completeEntry(bestMatch.entry.id)
    }

    console.log('[useLedger] No match found for query:', query)
    return false
  }, [entries, completeEntry])

  // Update an existing task (priority, description, due date)
  const updateTaskByQuery = useCallback(async (query, updates) => {
    const q = query.toLowerCase().trim()
    const pending = entries.filter(e => e.status === 'pending')

    // Score each task based on match quality
    const scoredTasks = pending.map(e => {
      const desc = e.description.toLowerCase()
      let score = 0

      // Exact match = highest score
      if (desc === q) score = 100

      // Full query contained in description
      else if (desc.includes(q)) score = 80

      // Description contained in query (e.g., query "call mom task" matches "call mom")
      else if (q.includes(desc)) score = 70

      // Word-based matching
      else {
        const queryWords = q.split(/\s+/).filter(w => w.length > 1)
        const matchedWords = queryWords.filter(w => desc.includes(w))
        score = (matchedWords.length / queryWords.length) * 60
      }

      return { entry: e, score }
    })

    // Get best match with minimum score threshold
    const bestMatch = scoredTasks
      .filter(t => t.score >= 30)
      .sort((a, b) => b.score - a.score)[0]

    if (!bestMatch) {
      console.log('[useLedger] No match found for update query:', query)
      return false
    }

    const match = bestMatch.entry
    console.log('[useLedger] Best match for update:', { query, matched: match.description, score: bestMatch.score })

    console.log('[useLedger] Updating task:', { query, matched: match.description, updates })

    const updatedEntry = { ...match, ...updates }
    const updatedEntries = entries.map(e => e.id === match.id ? updatedEntry : e)
    setEntries(updatedEntries)

    if (!isSupabaseConfigured() || !profile) {
      saveToLocal(updatedEntries)
      return true
    }

    const { error } = await supabase
      .from('ledger_entries')
      .update(updates)
      .eq('id', match.id)

    if (error) {
      console.error('[useLedger] Error updating task:', error)
      setEntries(entries)
      return false
    }

    return true
  }, [profile, entries, saveToLocal])

  // Update entry status (legacy)
  const updateStatus = useCallback(async (id, status) => {
    const updated = entries.map(e => e.id === id ? { ...e, status } : e)
    setEntries(updated)

    if (!isSupabaseConfigured() || !profile) {
      saveToLocal(updated)
      return true
    }

    const { error } = await supabase
      .from('ledger_entries')
      .update({ status })
      .eq('id', id)

    if (error) {
      console.error('Error updating entry:', error)
      setEntries(entries)
      return false
    }

    return true
  }, [profile, entries, saveToLocal])

  const resolveEntry = useCallback((id) => {
    return updateStatus(id, 'resolved')
  }, [updateStatus])

  const voidEntry = useCallback((id) => {
    return updateStatus(id, 'void')
  }, [updateStatus])

  // Delete entry
  const deleteEntry = useCallback(async (id) => {
    const updated = entries.filter(e => e.id !== id)
    setEntries(updated)

    if (!isSupabaseConfigured() || !profile) {
      saveToLocal(updated)
      return true
    }

    const { error } = await supabase
      .from('ledger_entries')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting entry:', error)
      setEntries(entries)
      return false
    }

    return true
  }, [profile, entries, saveToLocal])

  // Purge all completed tasks (used after 3-day reflection)
  const purgeCompleted = useCallback(async () => {
    const completedIds = entries.filter(e => e.status === 'resolved').map(e => e.id)
    if (completedIds.length === 0) return true

    const updated = entries.filter(e => e.status !== 'resolved')
    setEntries(updated)

    if (!isSupabaseConfigured() || !profile) {
      saveToLocal(updated)
      return true
    }

    // Delete all completed entries from Supabase
    const { error } = await supabase
      .from('ledger_entries')
      .delete()
      .eq('user_id', profile.id)
      .eq('status', 'resolved')

    if (error) {
      console.error('[useLedger] Error purging completed:', error)
      setEntries(entries) // Rollback
      return false
    }

    console.log(`[useLedger] Purged ${completedIds.length} completed tasks`)
    return true
  }, [profile, entries, saveToLocal])

  return {
    entries,
    visibleEntries,
    loading,
    addEntry,
    completeEntry,
    uncompleteEntry,
    updateDueDate,
    completeTaskByQuery,
    updateTaskByQuery,
    resolveEntry,
    voidEntry,
    deleteEntry,
    purgeCompleted,
    refetch: fetchEntries,
    pendingCount: entries.filter(e => e.status === 'pending').length,
  }
}
