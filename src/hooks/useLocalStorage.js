import { useState, useEffect } from 'react'

const PREFIX = 'proxy_'

export function useLocalStorage(key, initialValue) {
  const prefixedKey = PREFIX + key

  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue

    try {
      const item = window.localStorage.getItem(prefixedKey)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${prefixedKey}":`, error)
      return initialValue
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      if (storedValue === undefined) {
        window.localStorage.removeItem(prefixedKey)
      } else {
        window.localStorage.setItem(prefixedKey, JSON.stringify(storedValue))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${prefixedKey}":`, error)
    }
  }, [prefixedKey, storedValue])

  return [storedValue, setStoredValue]
}

// Utility to clear all PROXY data
export function clearProxyStorage() {
  if (typeof window === 'undefined') return

  Object.keys(window.localStorage)
    .filter(key => key.startsWith(PREFIX))
    .forEach(key => window.localStorage.removeItem(key))
}
