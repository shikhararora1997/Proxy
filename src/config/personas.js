/**
 * Persona Definitions
 *
 * 10 personas (p1-p10), revealed after the diagnostic.
 */

export const PERSONAS = {
  p1: {
    id: 'p1',
    colors: {
      primary: '#0F172A',   // Deep Navy
      accent: '#D4AF37',    // Gold
    },
    vibe: 'Luxury Watch / Private Bank / Extremely Sarcastic',
  },
  p2: {
    id: 'p2',
    colors: {
      primary: '#1A1A1A',   // Charcoal/Ink
      accent: '#00FFCC',    // Analytical Cyan
    },
    vibe: 'Cold Logic / High-Forensic / Analytical',
  },
  p3: {
    id: 'p3',
    colors: {
      primary: '#000000',   // Pure Black
      accent: '#4B5563',    // Slate / Armor Grey
    },
    vibe: 'Tactical / Prepared / Gritty',
  },
  p4: {
    id: 'p4',
    colors: {
      primary: '#080808',   // Pitch Black
      accent: '#B91C1C',    // Blood Red
    },
    vibe: 'Stealth / Precise / Lethal',
  },
  p5: {
    id: 'p5',
    colors: {
      primary: '#064E3B',   // Deep Emerald
      accent: '#D1D5DB',    // Soft Slate/Silver
    },
    vibe: 'Natural / Ethereal / Wise',
  },
  p6: {
    id: 'p6',
    colors: {
      primary: '#2E1065',   // Deep Purple
      accent: '#FDE047',    // Titan Gold
    },
    vibe: 'Brutalist / Final / Disciplined',
  },
  p7: {
    id: 'p7',
    colors: {
      primary: '#064E3B',   // Asgardian Green
      accent: '#D4AF37',    // Gold
    },
    vibe: 'Unhinged / Neon / Disruptive',
  },
  p8: {
    id: 'p8',
    colors: {
      primary: '#FFFFFF',   // Pearl White / Marble
      accent: '#B19470',    // Bronze / Champagne
    },
    vibe: 'Regal / Architectural / Commanding',
  },
  p9: {
    id: 'p9',
    colors: {
      primary: '#7F1D1D',   // Stark Red
      accent: '#38B2AC',    // Arc Reactor Blue
    },
    vibe: 'High-Tech / High-Performance / Innovative',
  },
  p10: {
    id: 'p10',
    colors: {
      primary: '#14532D',   // Forest Green
      accent: '#BEF264',    // Lightsaber Green
    },
    vibe: 'Minimalist / Zen / Ancient',
  },
}

/**
 * 5D Personality Vector Coordinates
 *
 * Axes (0-100):
 * [0] Logic (100) ↔ Intuition (0)
 * [1] Discipline (100) ↔ Chaos (0)
 * [2] Visibility (100) ↔ Stealth (0)
 * [3] Authority (100) ↔ Service (0)
 * [4] Innovation (100) ↔ Tradition (0)
 */
export const PERSONA_VECTORS = {
  p1: [70, 95, 15, 20, 30],   // Alfred - disciplined servant, stealthy
  p2: [100, 85, 60, 75, 70],  // Sherlock - pure logic, analytical
  p3: [80, 95, 20, 85, 60],   // Batman - tactical, authoritative, shadowy
  p4: [85, 80, 10, 50, 50],   // Black Widow - precise, stealthy
  p5: [40, 60, 50, 55, 40],   // Gandalf - intuitive, balanced, traditional
  p6: [85, 100, 80, 100, 30], // Thanos - disciplined authority, traditional
  p7: [35, 10, 70, 65, 95],   // Loki - chaotic, innovative, visible
  p8: [75, 85, 90, 95, 50],   // Jessica Pearson - visible authority
  p9: [80, 40, 100, 60, 100], // Tony Stark - visible, innovative, less disciplined
  p10: [50, 70, 20, 45, 20],  // Yoda - balanced, stealthy, traditional
}

// Axis labels for UI
export const VECTOR_AXES = [
  { id: 'logic', label: 'Logic vs Intuition', short: 'Analytical', left: 'Intuition', right: 'Logic' },
  { id: 'discipline', label: 'Discipline vs Chaos', short: 'Order', left: 'Chaos', right: 'Discipline' },
  { id: 'visibility', label: 'Visibility vs Stealth', short: 'Presence', left: 'Stealth', right: 'Visible' },
  { id: 'authority', label: 'Authority vs Service', short: 'Power', left: 'Service', right: 'Authority' },
  { id: 'innovation', label: 'Innovation vs Tradition', short: 'Method', left: 'Tradition', right: 'Innovation' },
]

// Hidden until revelation
export const PERSONA_NAMES = {
  p1: 'Alfred',
  p2: 'Sherlock',
  p3: 'Batman',
  p4: 'Black Widow',
  p5: 'Gandalf',
  p6: 'Thanos',
  p7: 'Loki',
  p8: 'Jessica Pearson',
  p9: 'Tony Stark',
  p10: 'Yoda',
}

// All persona IDs
export const ALL_PERSONA_IDS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10']
