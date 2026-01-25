/**
 * Diagnostic Questions
 *
 * Each answer maps to a persona ID (p1-p4).
 * Scoring: Count occurrences per persona, highest wins.
 * Tie-breaker: p1 > p2 > p3 > p4
 */

export const QUESTIONS = [
  {
    id: 'q1',
    text: 'A crisis has occurred. The server is down, and clients are screaming. Your first move?',
    options: [
      {
        id: 'q1a',
        text: 'Assess the damage. Secure the remaining assets. Draft a report.',
        persona: 'p1',
      },
      {
        id: 'q1b',
        text: 'Find the person responsible. Fix it. Ensure it never happens again.',
        persona: 'p2',
      },
      {
        id: 'q1c',
        text: 'Breathe. Problems are just opportunities in disguise. We will rebuild.',
        persona: 'p3',
      },
      {
        id: 'q1d',
        text: 'Tweet about it. Blame the intern. Press all the buttons.',
        persona: 'p4',
      },
    ],
  },
  {
    id: 'q2',
    text: 'Pick a workspace aesthetic.',
    options: [
      {
        id: 'q2a',
        text: 'Clean desk. Single monitor. Silence.',
        persona: 'p1',
      },
      {
        id: 'q2b',
        text: 'Standing desk. Six screens. Stock tickers.',
        persona: 'p2',
      },
      {
        id: 'q2c',
        text: 'A cabin in the woods. Natural light. Smell of pine.',
        persona: 'p3',
      },
      {
        id: 'q2d',
        text: 'Basement. RGB lighting. Pizza boxes.',
        persona: 'p4',
      },
    ],
  },
  {
    id: 'q3',
    text: 'How do you handle incompetence?',
    options: [
      {
        id: 'q3a',
        text: 'Correct it silently. Note it for the performance review.',
        persona: 'p1',
      },
      {
        id: 'q3b',
        text: 'Call it out immediately. Survival of the fittest.',
        persona: 'p2',
      },
      {
        id: 'q3c',
        text: 'Guide them. Everyone is on their own path.',
        persona: 'p3',
      },
      {
        id: 'q3d',
        text: 'Mock them relentlessly until they quit or get cool.',
        persona: 'p4',
      },
    ],
  },
  {
    id: 'q4',
    text: 'Choose a preferred communication style.',
    options: [
      {
        id: 'q4a',
        text: 'Brief. Written. Precise.',
        persona: 'p1',
      },
      {
        id: 'q4b',
        text: 'Loud. Direct. In person.',
        persona: 'p2',
      },
      {
        id: 'q4c',
        text: 'Storytelling. Metaphors. Long-form.',
        persona: 'p3',
      },
      {
        id: 'q4d',
        text: 'Memes. GIFs. Sarcasm.',
        persona: 'p4',
      },
    ],
  },
  {
    id: 'q5',
    text: 'What is your ultimate goal?',
    options: [
      {
        id: 'q5a',
        text: 'Order. Perfection. Legacy.',
        persona: 'p1',
      },
      {
        id: 'q5b',
        text: 'Dominance. Speed. Victory.',
        persona: 'p2',
      },
      {
        id: 'q5c',
        text: 'Harmony. Enlightenment. Wisdom.',
        persona: 'p3',
      },
      {
        id: 'q5d',
        text: 'Chaos. Lulz. Tacos.',
        persona: 'p4',
      },
    ],
  },
]
