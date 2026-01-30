import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePushNotifications } from '../../hooks/usePushNotifications'

const PROMPT_STORAGE_KEY = 'proxy_notification_prompted'

/**
 * Prompt to enable push notifications
 * Shows once after tutorial completes
 */
export function NotificationPrompt({ theme, onDismiss }) {
  const { isSupported, isSubscribed, permission, subscribe, isLoading } = usePushNotifications()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Don't show if not supported, already subscribed, or already prompted
    const alreadyPrompted = localStorage.getItem(PROMPT_STORAGE_KEY)
    if (!isSupported || isSubscribed || permission === 'denied' || alreadyPrompted) {
      return
    }

    // Show prompt after a short delay
    const timer = setTimeout(() => setIsVisible(true), 1000)
    return () => clearTimeout(timer)
  }, [isSupported, isSubscribed, permission])

  const handleEnable = async () => {
    localStorage.setItem(PROMPT_STORAGE_KEY, 'true')
    const success = await subscribe()
    if (success) {
      setIsVisible(false)
      onDismiss?.()
    }
  }

  const handleDismiss = () => {
    localStorage.setItem(PROMPT_STORAGE_KEY, 'true')
    setIsVisible(false)
    onDismiss?.()
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[90] flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleDismiss}
        />

        {/* Card */}
        <motion.div
          className="relative z-10 w-full max-w-sm rounded-lg overflow-hidden"
          style={{ backgroundColor: theme?.surface || '#1a1a1a' }}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Icon */}
          <div className="pt-6 pb-2 flex justify-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${theme?.accent || '#ffffff'}20` }}
            >
              <BellIcon color={theme?.accent || '#ffffff'} />
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-4 text-center">
            <h3
              className={`${theme?.font?.display || 'font-mono'} text-lg font-medium mb-2`}
              style={{ color: theme?.text?.primary || '#ffffff' }}
            >
              Stay on Track
            </h3>
            <p
              className={`${theme?.font?.chat || 'font-mono'} text-sm leading-relaxed`}
              style={{ color: theme?.text?.secondary || '#888888' }}
            >
              Get gentle reminders about your pending tasks every few hours.
              We'll only notify you about tasks you've created.
            </p>
          </div>

          {/* Actions */}
          <div
            className="flex border-t"
            style={{ borderColor: `${theme?.accent || '#ffffff'}20` }}
          >
            <button
              onClick={handleDismiss}
              className={`flex-1 py-3.5 ${theme?.font?.chat || 'font-mono'} text-sm transition-colors`}
              style={{ color: theme?.text?.muted || '#666666' }}
            >
              Not Now
            </button>
            <div
              className="w-px"
              style={{ backgroundColor: `${theme?.accent || '#ffffff'}20` }}
            />
            <button
              onClick={handleEnable}
              disabled={isLoading}
              className={`flex-1 py-3.5 ${theme?.font?.chat || 'font-mono'} text-sm font-medium transition-opacity`}
              style={{
                color: theme?.accent || '#ffffff',
                opacity: isLoading ? 0.5 : 1
              }}
            >
              {isLoading ? 'Enabling...' : 'Enable'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function BellIcon({ color }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}
