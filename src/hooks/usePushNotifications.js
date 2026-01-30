import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

// VAPID public key from environment
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

/**
 * Convert base64 VAPID key to Uint8Array for subscription
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/**
 * Hook to manage push notification subscription
 */
export function usePushNotifications() {
  const { profile } = useAuth()
  const [permission, setPermission] = useState('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Check if push notifications are supported
  useEffect(() => {
    const supported = (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window &&
      VAPID_PUBLIC_KEY
    )
    setIsSupported(supported)

    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  // Check existing subscription on mount
  useEffect(() => {
    async function checkSubscription() {
      if (!isSupported) return

      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        setIsSubscribed(!!subscription)
      } catch (err) {
        console.error('[Push] Error checking subscription:', err)
      }
    }

    checkSubscription()
  }, [isSupported])

  /**
   * Subscribe to push notifications
   */
  const subscribe = useCallback(async () => {
    if (!isSupported || !profile) {
      setError('Push notifications not supported or not logged in')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      // Request permission
      const permissionResult = await Notification.requestPermission()
      setPermission(permissionResult)

      if (permissionResult !== 'granted') {
        setError('Notification permission denied')
        return false
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })

      // Extract subscription data
      const subscriptionJson = subscription.toJSON()
      const subscriptionData = {
        user_id: profile.id,
        endpoint: subscriptionJson.endpoint,
        keys_p256dh: subscriptionJson.keys.p256dh,
        keys_auth: subscriptionJson.keys.auth,
        is_active: true,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone // e.g., "America/New_York"
      }

      // Save to Supabase
      if (isSupabaseConfigured()) {
        const { error: dbError } = await supabase
          .from('push_subscriptions')
          .upsert(subscriptionData, {
            onConflict: 'user_id,endpoint',
            ignoreDuplicates: false
          })

        if (dbError) {
          console.error('[Push] Error saving subscription:', dbError)
          // Don't fail - subscription still works, just won't persist
        }
      }

      setIsSubscribed(true)
      console.log('[Push] Subscription successful')
      return true

    } catch (err) {
      console.error('[Push] Subscription error:', err)
      setError(err.message || 'Failed to subscribe')
      return false

    } finally {
      setIsLoading(false)
    }
  }, [isSupported, profile])

  /**
   * Unsubscribe from push notifications
   */
  const unsubscribe = useCallback(async () => {
    if (!isSupported) return false

    setIsLoading(true)
    setError(null)

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()

        // Remove from Supabase
        if (isSupabaseConfigured() && profile) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', profile.id)
            .eq('endpoint', subscription.endpoint)
        }
      }

      setIsSubscribed(false)
      console.log('[Push] Unsubscribed successfully')
      return true

    } catch (err) {
      console.error('[Push] Unsubscribe error:', err)
      setError(err.message || 'Failed to unsubscribe')
      return false

    } finally {
      setIsLoading(false)
    }
  }, [isSupported, profile])

  return {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    error,
    subscribe,
    unsubscribe
  }
}
