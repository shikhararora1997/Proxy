/**
 * Persona Theme Configurations
 *
 * 10 personas, each with a distinct visual identity.
 */

export const THEMES = {
  p1: {
    // Alfred - Luxury Watch / Private Bank / Sarcastic
    id: 'p1',
    name: 'Alfred',
    background: '#0F172A',
    surface: '#1E293B',
    accent: '#D4AF37',
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
      borderRadius: '4px',
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
    // Sherlock - Cold Logic / Analytical
    id: 'p2',
    name: 'Sherlock',
    background: '#1A1A1A',
    surface: '#2A2A2A',
    accent: '#00FFCC',
    text: {
      primary: '#F0F0F0',
      secondary: '#A0A0A0',
      muted: '#707070',
    },
    chat: {
      userBubble: '#00FFCC',
      userText: '#1A1A1A',
      proxyBubble: '#2A2A2A',
      proxyText: '#00FFCC',
      borderRadius: '0px',
    },
    font: {
      chat: 'font-mono',
      display: 'font-sans',
    },
    effects: {
      grain: false,
      glow: true,
    },
  },

  p3: {
    // Batman - Tactical / Prepared / Gritty
    id: 'p3',
    name: 'Batman',
    background: '#000000',
    surface: '#111111',
    accent: '#4B5563',
    text: {
      primary: '#E5E7EB',
      secondary: '#9CA3AF',
      muted: '#6B7280',
    },
    chat: {
      userBubble: '#4B5563',
      userText: '#FFFFFF',
      proxyBubble: '#111111',
      proxyText: '#E5E7EB',
      borderRadius: '2px',
    },
    font: {
      chat: 'font-mono',
      display: 'font-sans',
    },
    effects: {
      grain: false,
      glow: false,
    },
  },

  p4: {
    // Black Widow - Stealth / Precise / Lethal
    id: 'p4',
    name: 'Black Widow',
    background: '#080808',
    surface: '#1A1A1A',
    accent: '#B91C1C',
    text: {
      primary: '#F5F5F5',
      secondary: '#A3A3A3',
      muted: '#737373',
    },
    chat: {
      userBubble: '#B91C1C',
      userText: '#FFFFFF',
      proxyBubble: '#1A1A1A',
      proxyText: '#F5F5F5',
      borderRadius: '8px',
    },
    font: {
      chat: 'font-mono',
      display: 'font-mono',
    },
    effects: {
      grain: false,
      glow: true,
    },
  },

  p5: {
    // Gandalf - Natural / Ethereal / Wise
    id: 'p5',
    name: 'Gandalf',
    background: '#064E3B',
    surface: '#065F46',
    accent: '#D1D5DB',
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
      borderRadius: '16px',
    },
    font: {
      chat: 'font-serif',
      display: 'font-serif',
    },
    effects: {
      grain: true,
      glow: false,
    },
  },

  p6: {
    // Thanos - Brutalist / Final / Disciplined
    id: 'p6',
    name: 'Thanos',
    background: '#2E1065',
    surface: '#3B0764',
    accent: '#FDE047',
    text: {
      primary: '#FAF5FF',
      secondary: '#C4B5FD',
      muted: '#A78BFA',
    },
    chat: {
      userBubble: '#FDE047',
      userText: '#2E1065',
      proxyBubble: '#3B0764',
      proxyText: '#FAF5FF',
      borderRadius: '0px',
    },
    font: {
      chat: 'font-sans',
      display: 'font-sans',
    },
    effects: {
      grain: false,
      glow: true,
    },
  },

  p7: {
    // Loki - Unhinged / Neon / Disruptive
    id: 'p7',
    name: 'Loki',
    background: '#064E3B',
    surface: '#065F46',
    accent: '#D4AF37',
    text: {
      primary: '#F0FDF4',
      secondary: '#BBF7D0',
      muted: '#86EFAC',
    },
    chat: {
      userBubble: '#D4AF37',
      userText: '#064E3B',
      proxyBubble: '#065F46',
      proxyText: '#F0FDF4',
      borderRadius: '12px 0px 12px 0px',
    },
    font: {
      chat: 'font-serif',
      display: 'font-serif',
    },
    effects: {
      grain: false,
      glow: true,
    },
  },

  p8: {
    // Jessica Pearson - Regal / Architectural / Commanding
    id: 'p8',
    name: 'Jessica Pearson',
    background: '#FAFAFA',
    surface: '#F5F5F4',
    accent: '#B19470',
    text: {
      primary: '#1C1917',
      secondary: '#57534E',
      muted: '#A8A29E',
    },
    chat: {
      userBubble: '#B19470',
      userText: '#FFFFFF',
      proxyBubble: '#F5F5F4',
      proxyText: '#1C1917',
      borderRadius: '2px',
    },
    font: {
      chat: 'font-serif',
      display: 'font-serif',
    },
    effects: {
      grain: false,
      glow: false,
    },
  },

  p9: {
    // Tony Stark - High-Tech / Innovative
    id: 'p9',
    name: 'Tony Stark',
    background: '#7F1D1D',
    surface: '#991B1B',
    accent: '#38B2AC',
    text: {
      primary: '#FEF2F2',
      secondary: '#FECACA',
      muted: '#FCA5A5',
    },
    chat: {
      userBubble: '#38B2AC',
      userText: '#FFFFFF',
      proxyBubble: '#991B1B',
      proxyText: '#FEF2F2',
      borderRadius: '12px',
    },
    font: {
      chat: 'font-sans',
      display: 'font-sans',
    },
    effects: {
      grain: false,
      glow: true,
    },
  },

  p10: {
    // Yoda - Minimalist / Zen / Ancient
    id: 'p10',
    name: 'Yoda',
    background: '#14532D',
    surface: '#166534',
    accent: '#BEF264',
    text: {
      primary: '#F0FDF4',
      secondary: '#BBF7D0',
      muted: '#86EFAC',
    },
    chat: {
      userBubble: '#BEF264',
      userText: '#14532D',
      proxyBubble: '#166534',
      proxyText: '#F0FDF4',
      borderRadius: '30px',
    },
    font: {
      chat: 'font-sans',
      display: 'font-sans',
    },
    effects: {
      grain: true,
      glow: true,
    },
  },
}

/**
 * Ghost responses for each persona (fallback when AI unavailable)
 */
export const GHOST_RESPONSES = {
  p1: "I am currently calibrating the ledger vaults, sir. Full functionality will be online shortly.",
  p2: "I am currently deducing the optimal pathway for your requests. Do not fret; the solution is imminent.",
  p3: "The signal is encrypted. I'm verifying the connection. Stay on the line.",
  p4: "Comms are jammed. I'm moving to a secondary frequency. Stand by for extraction.",
  p5: "Patience. The wizardry required for your ledger is still being conjured.",
  p6: "Fine. I'll do it myself... as soon as the cosmic connection stabilizes.",
  p7: "I'm currently busy being the rightful King. Your request is in the queue... maybe.",
  p8: "My associates are looking into it. Don't call me, I'll call you.",
  p9: "Servers are rebooting. Jarvis is currently on a coffee break. Hang tight.",
  p10: "Clouded, the connection is. Wait, you must. Patience, young one.",
}

/**
 * Welcome messages for first-time dashboard visit
 */
export const WELCOME_MESSAGES = {
  p1: "Welcome back, sir. Your ledger awaits. I trust you slept efficiently.",
  p2: "The game is afoot. I trust you've brought data more interesting than the local constabulary's.",
  p3: "The city is quiet, but your ledger is not. Give me a status report. Now.",
  p4: "Secure line established. Let's look at the numbers before they look at us. Sit rep, now.",
  p5: "Ah, you've returned. The ledger glows softly, awaiting your intentions.",
  p6: "Your world is out of balance. Let us correct the scales together.",
  p7: "Oh, look who's back for more. Ready to play the game or just watching from the sidelines?",
  p8: "Sit down. We have an empire to run and a ledger to balance. Don't waste my time.",
  p9: "Welcome to the future of your finances. Try not to touch anything—it's expensive.",
  p10: "Returned, you have. Searching for clarity in the numbers, are you?",
}
