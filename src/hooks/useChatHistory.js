import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'proxy_chat_history'

/**
 * Hook for managing chat history with localStorage persistence
 */
export function useChatHistory() {
  const [messages, setMessages] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setMessages(parsed)
        }
      }
    } catch (error) {
      console.warn('Failed to load chat history:', error)
    }
    setIsLoaded(true)
  }, [])

  // Persist to localStorage whenever messages change
  useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch (error) {
      console.warn('Failed to save chat history:', error)
    }
  }, [messages, isLoaded])

  const addMessage = useCallback((message) => {
    const newMessage = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      ...message,
    }
    setMessages(prev => [...prev, newMessage])
    return newMessage
  }, [])

  const addUserMessage = useCallback((text) => {
    return addMessage({ sender: 'user', text })
  }, [addMessage])

  const addProxyMessage = useCallback((text) => {
    return addMessage({ sender: 'proxy', text })
  }, [addMessage])

  const clearHistory = useCallback(() => {
    setMessages([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return {
    messages,
    isLoaded,
    addMessage,
    addUserMessage,
    addProxyMessage,
    clearHistory,
    isEmpty: messages.length === 0,
  }
}
