/**
 * Persona Definitions
 *
 * Names are intentionally hidden here - users only see IDs (p1, p2, p3, p4)
 * until the final reveal in Phase 1.
 *
 * The actual names map to:
 * - p1: Alfred (The Custodian)
 * - p2: Piccolo (The Tactician)
 * - p3: Gandalf (The Sage)
 * - p4: Deadpool (The Disruptor)
 */

export const PERSONAS = {
  p1: {
    id: 'p1',
    colors: {
      primary: '#0F172A',  // Navy
      accent: '#D4AF37',   // Gold
    },
    vibe: 'Luxury Watch / Private Bank / Stoic',
  },
  p2: {
    id: 'p2',
    colors: {
      primary: '#2E1065',  // Deep Purple
      accent: '#000000',   // Black
    },
    vibe: 'Brutalist / High-Performance / Aggressive',
  },
  p3: {
    id: 'p3',
    colors: {
      primary: '#064E3B',  // Emerald
      accent: '#64748B',   // Slate
    },
    vibe: 'Natural / Ethereal / Wise',
  },
  p4: {
    id: 'p4',
    colors: {
      primary: '#991B1B',  // Crimson
      accent: '#18181B',   // Charcoal
    },
    vibe: 'Cyberpunk / Neon / Chaotic',
  },
}

// Hidden until revelation
export const PERSONA_NAMES = {
  p1: 'Alfred',
  p2: 'Piccolo',
  p3: 'Gandalf',
  p4: 'Deadpool',
}

// Tie-breaker priority (higher index = lower priority)
export const PERSONA_PRIORITY = ['p1', 'p2', 'p3', 'p4']
