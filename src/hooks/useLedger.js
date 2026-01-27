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

  // Add entry with priority
  const addEntry = useCallback(async (description, category = null, amount = null, priority = 'medium') => {
    const newEntry = {
      id: crypto.randomUUID(),
      description,
      category,
      amount,
      priority,
      status: 'pending',
      completed_at: null,
      created_at: new Date().toISOString(),
      user_id: profile?.id,
    }

    const updated = [newEntry, ...entries]
    setEntries(updated)

    if (!isSupabaseConfigured() || !profile) {
      saveToLocal(updated)
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
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding entry:', error)
      setEntries(entries)
      return null
    }

    setEntries(prev => prev.map(e => e.id === newEntry.id ? data : e))
    return data
  }, [profile, entries, saveToLocal])

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

  // Complete a task by fuzzy matching query against pending descriptions
  const completeTaskByQuery = useCallback(async (query) => {
    const q = query.toLowerCase()
    const match = entries.find(
      e => e.status === 'pending' && e.description.toLowerCase().includes(q)
    )
    if (match) {
      return completeEntry(match.id)
    }
    return false
  }, [entries, completeEntry])

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

  return {
    entries,
    visibleEntries,
    loading,
    addEntry,
    completeEntry,
    uncompleteEntry,
    completeTaskByQuery,
    resolveEntry,
    voidEntry,
    deleteEntry,
    refetch: fetchEntries,
    pendingCount: entries.filter(e => e.status === 'pending').length,
  }
}
