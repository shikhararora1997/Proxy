import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const LOCAL_STORAGE_KEY = 'proxy_ledger_entries'

/**
 * Hook for managing ledger entries with Supabase
 * Falls back to localStorage if Supabase is not configured
 */
export function useLedger() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch entries
  const fetchEntries = useCallback(async () => {
    if (!isSupabaseConfigured() || !user) {
      // Fallback to localStorage
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
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching ledger:', error)
    } else {
      setEntries(data || [])
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  // Save to localStorage (fallback)
  const saveToLocal = useCallback((data) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
  }, [])

  // Add entry
  const addEntry = useCallback(async (description, category = null, amount = null) => {
    const newEntry = {
      id: crypto.randomUUID(),
      description,
      category,
      amount,
      status: 'pending',
      created_at: new Date().toISOString(),
      user_id: user?.id,
    }

    // Optimistic update
    const updated = [newEntry, ...entries]
    setEntries(updated)

    if (!isSupabaseConfigured() || !user) {
      saveToLocal(updated)
      return newEntry
    }

    const { data, error } = await supabase
      .from('ledger_entries')
      .insert({
        user_id: user.id,
        description,
        category,
        amount,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding entry:', error)
      setEntries(entries) // Revert
      return null
    }

    setEntries(prev => prev.map(e => e.id === newEntry.id ? data : e))
    return data
  }, [user, entries, saveToLocal])

  // Update entry status
  const updateStatus = useCallback(async (id, status) => {
    // Optimistic update
    const updated = entries.map(e => e.id === id ? { ...e, status } : e)
    setEntries(updated)

    if (!isSupabaseConfigured() || !user) {
      saveToLocal(updated)
      return true
    }

    const { error } = await supabase
      .from('ledger_entries')
      .update({ status })
      .eq('id', id)

    if (error) {
      console.error('Error updating entry:', error)
      setEntries(entries) // Revert
      return false
    }

    return true
  }, [user, entries, saveToLocal])

  // Resolve entry
  const resolveEntry = useCallback((id) => {
    return updateStatus(id, 'resolved')
  }, [updateStatus])

  // Void entry
  const voidEntry = useCallback((id) => {
    return updateStatus(id, 'void')
  }, [updateStatus])

  // Delete entry
  const deleteEntry = useCallback(async (id) => {
    // Optimistic update
    const updated = entries.filter(e => e.id !== id)
    setEntries(updated)

    if (!isSupabaseConfigured() || !user) {
      saveToLocal(updated)
      return true
    }

    const { error } = await supabase
      .from('ledger_entries')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting entry:', error)
      setEntries(entries) // Revert
      return false
    }

    return true
  }, [user, entries, saveToLocal])

  return {
    entries,
    loading,
    addEntry,
    resolveEntry,
    voidEntry,
    deleteEntry,
    refetch: fetchEntries,
    pendingCount: entries.filter(e => e.status === 'pending').length,
  }
}
