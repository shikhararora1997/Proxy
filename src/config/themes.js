/**
 * Persona Theme Configurations
 *
 * Each persona has a distinct visual identity for the dashboard/chat UI.
 */

export const THEMES = {
  p1: {
    // Alfred - Luxury Watch / Private Bank / Stoic
    id: 'p1',
    name: 'Alfred',
    background: '#0F172A',      // Deep navy
    surface: '#1E293B',         // Lighter navy
    accent: '#D4AF37',          // Gold
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
      muted: '#64748B',
    },
    chat: {
      userBubble: '#D4AF37',
      userText: '#0F172A',
      proxyBubble: '#1E293B',
      proxyText: '#F8FAFC',
      borderRadius: '4px',      // Minimal, clean
    },
    font: {
      chat: 'font-sans',
      display: 'font-serif',
    },
    effects: {
      grain: false,
      glow: false,
    },
  },

  p2: {
    // Piccolo - Brutalist / High-Performance / Aggressive
    id: 'p2',
    name: 'Piccolo',
    background: '#000000',      // Pure black
    surface: '#18181B',         // Dark charcoal
    accent: '#A855F7',          // Vivid purple
    text: {
      primary: '#FAFAFA',
      secondary: '#A1A1AA',
      muted: '#71717A',
    },
    chat: {
      userBubble: '#A855F7',
      userText: '#000000',
      proxyBubble: '#18181B',
      proxyText: '#22C55E',     // Terminal green for proxy
      borderRadius: '0px',      // Sharp, brutalist
    },
    font: {
      chat: 'font-mono',
      display: 'font-mono',
    },
    effects: {
      grain: false,
      glow: true,               // Subtle glow on accent
    },
  },

  p3: {
    // Gandalf - Natural / Ethereal / Wise
    id: 'p3',
    name: 'Gandalf',
    background: '#064E3B',      // Deep emerald
    surface: '#065F46',         // Lighter emerald
    accent: '#D1D5DB',          // Soft slate/silver
    text: {
      primary: '#F3F4F6',
      secondary: '#D1D5DB',
      muted: '#9CA3AF',
    },
    chat: {
      userBubble: '#D1D5DB',
      userText: '#064E3B',
      proxyBubble: '#065F46',
      proxyText: '#F3F4F6',
      borderRadius: '16px',     // Soft, rounded
    },
    font: {
      chat: 'font-serif',
      display: 'font-serif',
    },
    effects: {
      grain: true,              // Paper/parchment texture
      glow: false,
    },
  },

  p4: {
    // Deadpool - Cyberpunk / Neon / Chaotic
    id: 'p4',
    name: 'Deadpool',
    background: '#18181B',      // Charcoal
    surface: '#27272A',         // Lighter charcoal
    accent: '#EF4444',          // Bright red
    text: {
      primary: '#FAFAFA',
      secondary: '#D4D4D8',
      muted: '#A1A1AA',
    },
    chat: {
      userBubble: '#EF4444',
      userText: '#18181B',
      proxyBubble: '#27272A',
      proxyText: '#FAFAFA',
      borderRadius: '12px 4px 12px 4px', // Chaotic, uneven
    },
    font: {
      chat: 'font-mono',
      display: 'font-sans',
    },
    effects: {
      grain: false,
      glow: true,               // Neon glow
    },
  },
}

/**
 * Ghost responses for each persona (before LLM is connected)
 */
export const GHOST_RESPONSES = {
  p1: "I am currently calibrating the ledger vaults, sir. Full functionality will be online shortly.",
  p2: "Strategizing. The interface is ready, but the logic gates remain closed for now.",
  p3: "Patience. The wizardry required for your ledger is still being conjured.",
  p4: "Woah there, Turbo. The brain isn't plugged in yet. Come back when the dev finishes his coffee.",
}

/**
 * Welcome messages for first-time dashboard visit
 */
export const WELCOME_MESSAGES = {
  p1: "Welcome back, sir. Your ledger awaits. I trust you slept efficiently.",
  p2: "You're here. Good. Time to dominate. What's the play?",
  p3: "Ah, you've returned. The ledger glows softly, awaiting your intentions.",
  p4: "YOOO you're back! Quick, tell me something fun before I get bored.",
}
