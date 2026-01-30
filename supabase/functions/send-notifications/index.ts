// Supabase Edge Function: Send Push Notifications

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// VAPID keys from secrets
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || ''
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || ''
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:hello@proxy.app'

// Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PushSubscription {
  id: string
  user_id: string
  endpoint: string
  keys_p256dh: string
  keys_auth: string
  timezone: string | null
}

/**
 * Persona-specific notification messages
 * Each persona has templates for different task count scenarios
 */
const PERSONA_MESSAGES: Record<string, {
  name: string
  withHigh: (high: number, other: number) => string
  highOnly: (count: number) => string
  regular: (count: number) => string
}> = {
  p1: { // Alfred
    name: 'Alfred',
    withHigh: (h, o) => `Sir, ${h} urgent matter${h > 1 ? 's' : ''} and ${o} other task${o > 1 ? 's' : ''} await your attention.`,
    highOnly: (c) => `Sir, ${c} urgent matter${c > 1 ? 's require' : ' requires'} your immediate attention.`,
    regular: (c) => `Sir, you have ${c} pending matter${c > 1 ? 's' : ''} to attend to.`,
  },
  p2: { // Sherlock
    name: 'Sherlock',
    withHigh: (h, o) => `${h} critical case${h > 1 ? 's' : ''}, ${o} minor. The data demands action.`,
    highOnly: (c) => `${c} high-priority case${c > 1 ? 's' : ''} require${c === 1 ? 's' : ''} immediate deduction.`,
    regular: (c) => `${c} case${c > 1 ? 's' : ''} remain unsolved. Curious.`,
  },
  p3: { // Batman
    name: 'Batman',
    withHigh: (h, o) => `${h} critical, ${o} secondary. No excuses. Move.`,
    highOnly: (c) => `${c} high-priority target${c > 1 ? 's' : ''}. Execute now.`,
    regular: (c) => `${c} task${c > 1 ? 's' : ''} pending. Gotham doesn't wait.`,
  },
  p4: { // Black Widow
    name: 'Black Widow',
    withHigh: (h, o) => `${h} hot target${h > 1 ? 's' : ''}, ${o} on the radar. Time to move.`,
    highOnly: (c) => `${c} priority target${c > 1 ? 's' : ''} flagged. Don't delay.`,
    regular: (c) => `${c} item${c > 1 ? 's' : ''} on your ledger. Clear them.`,
  },
  p5: { // Gandalf
    name: 'Gandalf',
    withHigh: (h, o) => `${h} urgent quest${h > 1 ? 's' : ''} and ${o} journey${o > 1 ? 's' : ''} await, dear friend.`,
    highOnly: (c) => `${c} pressing matter${c > 1 ? 's call' : ' calls'} to you. Do not be late.`,
    regular: (c) => `${c} task${c > 1 ? 's' : ''} on your path. Even small deeds matter.`,
  },
  p6: { // Thanos
    name: 'Thanos',
    withHigh: (h, o) => `${h} critical, ${o} remaining. Balance must be restored.`,
    highOnly: (c) => `${c} inevitable task${c > 1 ? 's' : ''}. The universe demands completion.`,
    regular: (c) => `${c} task${c > 1 ? 's' : ''} unbalanced. Restore order.`,
  },
  p7: { // Loki
    name: 'Loki',
    withHigh: (h, o) => `${h} glorious purpose${h > 1 ? 's' : ''}, ${o} minor mischief. Shall we?`,
    highOnly: (c) => `${c} task${c > 1 ? 's' : ''} of glorious purpose await${c === 1 ? 's' : ''}.`,
    regular: (c) => `${c} mortal task${c > 1 ? 's' : ''}. Boring, but necessary.`,
  },
  p8: { // Jessica Pearson
    name: 'Jessica',
    withHigh: (h, o) => `${h} priority matter${h > 1 ? 's' : ''}, ${o} others. Handle it.`,
    highOnly: (c) => `${c} top-priority item${c > 1 ? 's' : ''}. Make it happen.`,
    regular: (c) => `${c} item${c > 1 ? 's' : ''} need${c === 1 ? 's' : ''} your attention. Now.`,
  },
  p9: { // Tony Stark
    name: 'Tony',
    withHigh: (h, o) => `${h} code red${h > 1 ? 's' : ''}, ${o} in the queue. Suit up.`,
    highOnly: (c) => `${c} priority alert${c > 1 ? 's' : ''}. Even I can't ignore ${c > 1 ? 'these' : 'this'}.`,
    regular: (c) => `${c} task${c > 1 ? 's' : ''} pending. Let's optimize.`,
  },
  p10: { // Yoda
    name: 'Yoda',
    withHigh: (h, o) => `${h} urgent task${h > 1 ? 's' : ''} and ${o} other${o > 1 ? 's' : ''}, you have. Begin, you must.`,
    highOnly: (c) => `${c} pressing matter${c > 1 ? 's' : ''}, there ${c > 1 ? 'are' : 'is'}. Delay, you must not.`,
    regular: (c) => `${c} task${c > 1 ? 's' : ''}, you have. Complete them, you will.`,
  },
}

// Default fallback for users without persona
const DEFAULT_MESSAGES = {
  name: 'PROXY',
  withHigh: (h: number, o: number) => `You have ${h} high priority and ${o} other tasks pending`,
  highOnly: (c: number) => `You have ${c} high priority task${c > 1 ? 's' : ''} pending`,
  regular: (c: number) => `You have ${c} task${c > 1 ? 's' : ''} pending`,
}

/**
 * Check if current time is within quiet hours (12am - 7am) for a timezone
 */
function isQuietHours(timezone: string | null): boolean {
  try {
    const tz = timezone || 'UTC'
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      hour12: false
    })
    const hour = parseInt(formatter.format(now), 10)
    return hour >= 0 && hour < 7
  } catch {
    return false
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Debug: Check if keys are loaded
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return new Response(
      JSON.stringify({
        error: 'VAPID keys not configured',
        hasPublic: !!VAPID_PUBLIC_KEY,
        hasPrivate: !!VAPID_PRIVATE_KEY,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Dynamic import of web-push
    const webpush = await import('npm:web-push@3.6.7')

    // Configure web-push
    webpush.default.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get all active subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('is_active', true)

    if (subError) {
      throw subError
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: 'No active subscriptions' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let sent = 0
    let failed = 0
    let skipped = 0
    const errors: string[] = []

    // Process each subscription
    for (const sub of subscriptions as PushSubscription[]) {
      // Skip if user is in quiet hours (12am - 7am local time)
      if (isQuietHours(sub.timezone)) {
        skipped++
        continue
      }

      // Get user's profile (for persona) and pending tasks in parallel
      const [profileResult, tasksResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('persona_id')
          .eq('id', sub.user_id)
          .maybeSingle(),
        supabase
          .from('ledger_entries')
          .select('priority')
          .eq('user_id', sub.user_id)
          .neq('status', 'resolved')
      ])

      if (tasksResult.error) {
        errors.push(`Task fetch error: ${tasksResult.error.message}`)
        failed++
        continue
      }

      // Count by priority
      const counts = { high: 0, medium: 0, low: 0 }
      for (const task of tasksResult.data || []) {
        const priority = task.priority || 'medium'
        if (priority in counts) {
          counts[priority as keyof typeof counts]++
        }
      }

      const total = counts.high + counts.medium + counts.low

      // Skip if no pending tasks
      if (total === 0) {
        skipped++
        continue
      }

      // Get persona-specific messages or use default
      const personaId = profileResult.data?.persona_id
      const persona = (personaId && PERSONA_MESSAGES[personaId]) || DEFAULT_MESSAGES

      // Build notification message based on task counts
      let body = ''
      if (counts.high > 0 && (counts.medium + counts.low) > 0) {
        body = persona.withHigh(counts.high, counts.medium + counts.low)
      } else if (counts.high > 0) {
        body = persona.highOnly(counts.high)
      } else {
        body = persona.regular(total)
      }

      const payload = JSON.stringify({
        title: persona.name.toUpperCase(),
        body,
        icon: '/icons/icon-192.png',
        badge: '/icons/badge-72.png',
        tag: 'proxy-reminder',
        data: { url: '/' },
      })

      // Build subscription object for web-push
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

        // Update last_used_at
        await supabase
          .from('push_subscriptions')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', sub.id)

      } catch (pushError: any) {
        errors.push(`Push error: ${pushError.message}`)

        // Handle expired subscriptions
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
        message: 'Notifications processed',
        sent,
        failed,
        skipped,
        total: subscriptions.length,
        errors: errors.length > 0 ? errors : undefined,
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
