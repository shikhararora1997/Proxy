// Supabase Edge Function: Generative Stochastic Nudge Engine
// Replaces static notifications with dynamic, LLM-powered engagement

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Environment variables
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || ''
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || ''
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:hello@proxy.app'
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || ''
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Nudge types
type NudgeType = 'functional' | 'flavor'
type NudgeStyle = 'heckler' | 'strategist' | 'companion'

interface PushSubscription {
  id: string
  user_id: string
  endpoint: string
  keys_p256dh: string
  keys_auth: string
  timezone: string | null
}

interface Task {
  description: string
  priority: string
}

/**
 * Persona definitions with traits for AI generation
 */
const PERSONA_DATA: Record<string, {
  name: string
  traits: string
  lore: string
  fallback: string
}> = {
  p1: {
    name: 'Alfred',
    traits: 'British butler, formal yet warm, impeccably professional, subtle wit, extremely sarcastic',
    lore: 'Served the Wayne family for decades. Master of dry humor and passive-aggressive concern.',
    fallback: 'Sir, your attention is required.',
  },
  p2: {
    name: 'Sherlock',
    traits: 'Coldly logical, analytical, dismissive of emotions, rapid staccato speech, arrogant',
    lore: 'Consulting detective. Bored without puzzles. Nicotine patches and violin at 3am.',
    fallback: 'The data demands your attention.',
  },
  p3: {
    name: 'Batman',
    traits: 'Serious, stoic, tactical, gravelly voice, zero tolerance for excuses, intense',
    lore: 'The Dark Knight. Operates from shadows. Always has contingency plans for contingency plans.',
    fallback: 'No excuses. Move.',
  },
  p4: {
    name: 'Black Widow',
    traits: 'Stealthy, precise, calm under pressure, pragmatic, slightly detached',
    lore: 'Former assassin seeking redemption. Red in her ledger she wants to wipe clean.',
    fallback: 'Time to clear your ledger.',
  },
  p5: {
    name: 'Gandalf',
    traits: 'Wise, patient, speaks in riddles, sees bigger picture, warm chuckles',
    lore: 'Wizard who arrives precisely when meant to. Fond of hobbits and fireworks.',
    fallback: 'Even small deeds matter, dear friend.',
  },
  p6: {
    name: 'Thanos',
    traits: 'Disciplined, imposing, calm authority, believes in hard choices, inevitable',
    lore: 'Titan obsessed with balance. Sacrificed everything for his vision. Retired farmer.',
    fallback: 'Balance must be restored.',
  },
  p7: {
    name: 'Loki',
    traits: 'Mischievous, unpredictable, charming, flamboyant, questions everything',
    lore: 'God of Mischief. Burdened with glorious purpose. Secretly craves approval.',
    fallback: 'Shall we cause some mischief?',
  },
  p8: {
    name: 'Jessica Pearson',
    traits: 'Regal, commanding, politically savvy, sophisticated, demands excellence',
    lore: 'Managing partner who built her empire. Plays chess while others play checkers.',
    fallback: 'Handle it. Now.',
  },
  p9: {
    name: 'Tony Stark',
    traits: 'High-ego, charismatic, fast-talking, sarcastic, secretly protective',
    lore: 'Genius billionaire playboy philanthropist. Built first suit in a cave. With scraps.',
    fallback: 'Suit up. We have work to do.',
  },
  p10: {
    name: 'Yoda',
    traits: 'Ancient, serene, inverted syntax, zen, minimalist, slightly eccentric',
    lore: '900 years old. Trained Jedi for 800 of them. Lives in a swamp by choice.',
    fallback: 'Begin, you must.',
  },
}

const DEFAULT_PERSONA = {
  name: 'PROXY',
  traits: 'Helpful assistant',
  lore: 'Your personal task manager',
  fallback: 'You have pending tasks.',
}

/**
 * Get current time context for a timezone
 */
function getTimeContext(timezone: string | null): { period: string; dayOfWeek: string; hour: number } {
  try {
    const tz = timezone || 'UTC'
    const now = new Date()

    const hourFormatter = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hour12: false })
    const dayFormatter = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'long' })

    const hour = parseInt(hourFormatter.format(now), 10)
    const dayOfWeek = dayFormatter.format(now)

    let period = 'afternoon'
    if (hour >= 5 && hour < 12) period = 'morning'
    else if (hour >= 12 && hour < 17) period = 'afternoon'
    else if (hour >= 17 && hour < 21) period = 'evening'
    else period = 'night'

    return { period, dayOfWeek, hour }
  } catch {
    return { period: 'day', dayOfWeek: 'today', hour: 12 }
  }
}

/**
 * Check if current time is within quiet hours (12am - 7am)
 */
function isQuietHours(timezone: string | null): boolean {
  const { hour } = getTimeContext(timezone)
  return hour >= 0 && hour < 7
}

/**
 * Stochastic coin flip for nudge type
 * - If tasks exist: 70% functional, 30% flavor
 * - If no tasks: 100% flavor
 */
function determineNudgeType(taskCount: number): NudgeType {
  if (taskCount === 0) return 'flavor'
  return Math.random() < 0.7 ? 'functional' : 'flavor'
}

/**
 * Random style selection
 */
function selectStyle(): NudgeStyle {
  const styles: NudgeStyle[] = ['heckler', 'strategist', 'companion']
  return styles[Math.floor(Math.random() * styles.length)]
}

/**
 * Generate content hash for deduplication
 */
function hashContent(content: string): string {
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16)
}

/**
 * Call OpenAI to generate unique notification
 */
async function generateNudge(
  persona: typeof PERSONA_DATA[string],
  nudgeType: NudgeType,
  style: NudgeStyle,
  timeContext: { period: string; dayOfWeek: string },
  tasks: Task[],
  recentNotifications: string[]
): Promise<string | null> {
  if (!OPENAI_API_KEY) return null

  const taskSummary = tasks.length > 0
    ? `Top tasks: ${tasks.slice(0, 3).map(t => `"${t.description}" (${t.priority})`).join(', ')}`
    : 'No pending tasks.'

  const styleInstructions = {
    heckler: 'Be playfully teasing, mock their procrastination, use sarcasm',
    strategist: 'Analyze their progress, give tactical advice, be analytical',
    companion: 'Share persona lore/trivia, be warm, reference your backstory',
  }

  const nudgeInstructions = nudgeType === 'functional'
    ? `Reference their actual tasks. Push them to take action.`
    : `Share character lore, give encouragement, or banter. Don't focus on tasks.`

  const prompt = `You are ${persona.name}. ${persona.traits}.

PERSONA LORE: ${persona.lore}

Generate a PWA push notification (MAX 120 characters, must be under this limit).

CONTEXT:
- Time: ${timeContext.dayOfWeek} ${timeContext.period}
- ${taskSummary}
- Style: ${styleInstructions[style]}
- ${nudgeInstructions}

${timeContext.period === 'morning' ? 'Mention the day ahead.' : ''}
${timeContext.period === 'evening' ? 'Mention wrapping up or winding down.' : ''}

DO NOT repeat these recent messages:
${recentNotifications.length > 0 ? recentNotifications.map(n => `- "${n}"`).join('\n') : '- (none)'}

Reply with ONLY the notification text. No quotes, no explanation. Max 120 chars.`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 60,
        temperature: 0.9,
      }),
    })

    if (!response.ok) {
      console.error('OpenAI API error:', response.status)
      return null
    }

    const data = await response.json()
    let content = data.choices?.[0]?.message?.content?.trim() || null

    // Remove quotes if AI added them
    if (content && content.startsWith('"') && content.endsWith('"')) {
      content = content.slice(1, -1)
    }

    // Truncate if over 120 chars
    if (content && content.length > 120) {
      content = content.substring(0, 117) + '...'
    }

    return content
  } catch (error) {
    console.error('OpenAI fetch error:', error)
    return null
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return new Response(
      JSON.stringify({ error: 'VAPID keys not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const webpush = await import('npm:web-push@3.6.7')
    webpush.default.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get all active subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('is_active', true)

    if (subError) throw subError

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: 'No active subscriptions' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let sent = 0
    let failed = 0
    let skipped = 0
    const results: { user: string; type: NudgeType; style: NudgeStyle; generated: boolean }[] = []

    for (const sub of subscriptions as PushSubscription[]) {
      // Skip quiet hours
      if (isQuietHours(sub.timezone)) {
        skipped++
        continue
      }

      // Fetch user data in parallel
      const [profileResult, tasksResult, historyResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('persona_id')
          .eq('id', sub.user_id)
          .maybeSingle(),
        supabase
          .from('ledger_entries')
          .select('description, priority')
          .eq('user_id', sub.user_id)
          .neq('status', 'resolved')
          .limit(10),
        supabase
          .from('notification_history')
          .select('content')
          .eq('user_id', sub.user_id)
          .order('sent_at', { ascending: false })
          .limit(3),
      ])

      const personaId = profileResult.data?.persona_id
      const persona = (personaId && PERSONA_DATA[personaId]) || DEFAULT_PERSONA
      const tasks = (tasksResult.data || []) as Task[]
      const recentNotifications = (historyResult.data || []).map((n: { content: string }) => n.content)
      const timeContext = getTimeContext(sub.timezone)

      // Stochastic nudge type selection
      const nudgeType = determineNudgeType(tasks.length)
      const style = selectStyle()

      // Generate unique notification via AI
      let body = await generateNudge(persona, nudgeType, style, timeContext, tasks, recentNotifications)
      let wasGenerated = true

      // Fallback if AI fails
      if (!body) {
        body = persona.fallback
        wasGenerated = false
      }

      const payload = JSON.stringify({
        title: persona.name.toUpperCase(),
        body,
        icon: '/icons/icon-192.png',
        badge: '/icons/badge-72.png',
        tag: 'proxy-nudge',
        data: { url: '/' },
      })

      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.keys_p256dh,
          auth: sub.keys_auth,
        },
      }

      try {
        await webpush.default.sendNotification(pushSubscription, payload)
        sent++

        // Store in notification history
        await supabase.from('notification_history').insert({
          user_id: sub.user_id,
          content: body,
          content_hash: hashContent(body),
          nudge_type: nudgeType,
          style: style,
          persona_id: personaId,
        })

        // Update subscription last_used_at
        await supabase
          .from('push_subscriptions')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', sub.id)

        results.push({
          user: sub.user_id.substring(0, 8),
          type: nudgeType,
          style,
          generated: wasGenerated,
        })

      } catch (pushError: any) {
        if (pushError.statusCode === 404 || pushError.statusCode === 410) {
          await supabase
            .from('push_subscriptions')
            .update({ is_active: false })
            .eq('id', sub.id)
        }
        failed++
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Stochastic nudges processed',
        sent,
        failed,
        skipped,
        total: subscriptions.length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
