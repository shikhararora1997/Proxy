import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

/**
 * Hook for managing messages with Supabase
 * Falls back to localStorage if Supabase is not configured
 */
export function useMessages() {
  const { user, isOnline } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch messages from Supabase
  const fetchMessages = useCallback(async () => {
    if (!isSupabaseConfigured() || !user) {
      // Fallback to localStorage
      const stored = localStorage.getItem('proxy_chat_history')
      if (stored) {
        try {
          setMessages(JSON.parse(stored))
        } catch (e) {
          setMessages([])
        }
      }
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
    } else {
      setMessages(data || [])
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Add a message
  const addMessage = useCallback(async (sender, content) => {
    const newMessage = {
      id: crypto.randomUUID(),
      sender,
      content,
      created_at: new Date().toISOString(),
      user_id: user?.id,
    }

    // Optimistic update
    setMessages(prev => [...prev, newMessage])

    if (!isSupabaseConfigured() || !user) {
      // Save to localStorage
      const updated = [...messages, newMessage]
      localStorage.setItem('proxy_chat_history', JSON.stringify(updated))
      return newMessage
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        user_id: user.id,
        sender,
        content,
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding message:', error)
      // Revert optimistic update
      setMessages(prev => prev.filter(m => m.id !== newMessage.id))
      return null
    }

    // Update with real data
    setMessages(prev => prev.map(m => m.id === newMessage.id ? data : m))
    return data
  }, [user, messages])

  const addUserMessage = useCallback((content) => {
    return addMessage('user', content)
  }, [addMessage])

  const addProxyMessage = useCallback((content) => {
    return addMessage('proxy', content)
  }, [addMessage])

  const clearMessages = useCallback(async () => {
    if (!isSupabaseConfigured() || !user) {
      localStorage.removeItem('proxy_chat_history')
      setMessages([])
      return
    }

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      console.error('Error clearing messages:', error)
    } else {
      setMessages([])
    }
  }, [user])

  return {
    messages,
    loading,
    addUserMessage,
    addProxyMessage,
    clearMessages,
    isEmpty: messages.length === 0,
    refetch: fetchMessages,
  }
}
