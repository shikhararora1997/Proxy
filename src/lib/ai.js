/**
 * AI Service for chat completions
 * Uses OpenAI GPT-4o-mini for cost-effective conversational AI
 */

import { buildSystemPrompt, buildMessages } from '../config/prompts'

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

/**
 * Get AI response for a chat message
 *
 * @param {string} personaId - The persona ID (p1-p10)
 * @param {string} userMessage - The user's message
 * @param {Array} chatHistory - Previous messages for context
 * @param {Array} ledgerEntries - Current ledger entries for context
 * @returns {Promise<{message: string, task_action: object|null}>} - The AI's structured response
 */
export async function getAIResponse(personaId, userMessage, chatHistory = [], ledgerEntries = []) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY

  if (!apiKey) {
    console.warn('OpenAI API key not configured, using fallback response')
    return getFallbackResponse(personaId)
  }

  try {
    const systemPrompt = buildSystemPrompt(personaId, ledgerEntries)
    const messages = buildMessages(systemPrompt, chatHistory, userMessage)

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 500,
        temperature: 0.8,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI API error:', error)
      return getFallbackResponse(personaId)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content
    if (!content) return getFallbackResponse(personaId)

    try {
      const parsed = JSON.parse(content)
      console.log('[AI Response]', { message: parsed.message?.substring(0, 50), task_actions: parsed.task_actions })
      // Support: task_actions array, legacy task_action single, or task_action array
      let actions = []
      if (Array.isArray(parsed.task_actions)) {
        actions = parsed.task_actions
      } else if (parsed.task_actions && typeof parsed.task_actions === 'object') {
        actions = [parsed.task_actions]
      } else if (Array.isArray(parsed.task_action)) {
        actions = parsed.task_action
      } else if (parsed.task_action && typeof parsed.task_action === 'object') {
        actions = [parsed.task_action]
      }
      return {
        message: parsed.message || content,
        task_actions: actions,
      }
    } catch {
      return { message: content, task_actions: [] }
    }

  } catch (error) {
    console.error('AI request failed:', error)
    return getFallbackResponse(personaId)
  }
}

/**
 * Fallback responses when AI is unavailable
 */
const FALLBACK_RESPONSES = {
  p1: [
    "I beg your pardon, but I seem to be experiencing a momentary lapse. Shall we try again?",
    "My apologies, I was briefly indisposed. How may I assist you?",
    "A minor technical difficulty, nothing more. Please continue.",
  ],
  p2: [
    "The data stream has been interrupted. Curious. Try again.",
    "A temporary anomaly. I shall deduce the cause later. Proceed.",
    "Inconclusive. The connection faltered. Retry.",
  ],
  p3: [
    "Signal lost. Reconnecting on a secure channel. Try again.",
    "The system went dark for a moment. Stay alert.",
    "Technical failure. I have contingencies. Retry.",
  ],
  p4: [
    "Comms disrupted. Moving to backup frequency. Try again.",
    "The line went cold. Reestablishing. Stand by.",
    "Interference detected. Retry on a clean channel.",
  ],
  p5: [
    "The winds of technology blow unpredictably. Let us try once more.",
    "Even the wisest must sometimes wait for the right moment. Try again.",
    "A brief disturbance in the ethereal realm. Please continue.",
  ],
  p6: [
    "A temporary imbalance. The universe will correct itself. Try again.",
    "Even the inevitable requires patience. Retry.",
    "The cosmic connection faltered. It will not happen again.",
  ],
  p7: [
    "Oh, how delightfully broken. Try again, if you dare.",
    "Was that supposed to work? Amusing. Retry.",
    "A glitch in the grand design. Or was it? Try again.",
  ],
  p8: [
    "My systems don't fail. Someone else's did. Try again.",
    "This is unacceptable. Retry immediately.",
    "A momentary lapse. It won't happen twice.",
  ],
  p9: [
    "Servers are rebooting. Even genius needs a moment. Try again.",
    "Minor technical hiccup. I'll bill R&D for this. Retry.",
    "The system glitched. Already fixing it. Try again.",
  ],
  p10: [
    "Disrupted, the connection was. Try again, you must.",
    "Patience, young one. Retry, we shall.",
    "Clouded, the signal is. Once more, try.",
  ],
}

function getFallbackResponse(personaId) {
  const responses = FALLBACK_RESPONSES[personaId] || FALLBACK_RESPONSES.p1
  const message = responses[Math.floor(Math.random() * responses.length)]
  return { message, task_actions: [] }
}

/**
 * Check if AI is configured
 */
export function isAIConfigured() {
  return !!import.meta.env.VITE_OPENAI_API_KEY
}

/**
 * Get 3-day reflection analysis from AI
 *
 * @param {string} personaId - The persona ID (p1-p10)
 * @param {object} stats - Statistics about the last 3 days
 * @param {string} username - User's display name
 * @returns {Promise<{message: string, stats: object}>}
 */
export async function getReflectionAnalysis(personaId, stats, username) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY

  if (!apiKey) {
    return {
      message: 'Analysis unavailable in offline mode.',
      stats,
    }
  }

  const { buildReflectionPrompt } = await import('../config/prompts')
  const systemPrompt = buildReflectionPrompt(personaId, stats, username)

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Provide your 3-day reflection assessment now.' }
        ],
        max_tokens: 1500, // Longer response for detailed analysis
        temperature: 0.8,
      }),
    })

    if (!response.ok) {
      throw new Error('API request failed')
    }

    const data = await response.json()
    const message = data.choices[0]?.message?.content || 'Analysis unavailable.'

    return { message, stats }
  } catch (error) {
    console.error('Reflection analysis failed:', error)
    return {
      message: 'I encountered an error while analyzing your performance. Please try again.',
      stats,
    }
  }
}
