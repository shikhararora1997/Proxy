/**
 * Diagnostic Questions (The Decagon Protocol)
 *
 * 8 questions with weighted scoring:
 * - Primary: +3 points
 * - Secondary: +2 points
 * - Tertiary: +1 point
 *
 * Each answer distributes points to 3 different personas.
 * Total scores tallied across all 10 IDs (p1-p10).
 * Highest aggregate score wins. Ties broken randomly.
 */

export const QUESTIONS = [
  {
    id: 'q1',
    text: 'To achieve a goal that saves thousands, you must ruin one innocent life. Do you pull the trigger?',
    options: [
      {
        id: 'q1a',
        text: 'Without hesitation. The math of the universe requires it.',
        weights: { p6: 3, p2: 2, p8: 1 },
      },
      {
        id: 'q1b',
        text: 'Never. If we lose our soul, we have already lost the war.',
        weights: { p3: 3, p1: 2, p5: 1 },
      },
      {
        id: 'q1c',
        text: "I find a third option. I don't play by rigged rules.",
        weights: { p9: 3, p4: 2, p7: 1 },
      },
      {
        id: 'q1d',
        text: 'I let fate decide. I am but a passenger in the flow.',
        weights: { p10: 3, p5: 2, p1: 1 },
      },
    ],
  },
  {
    id: 'q2',
    text: 'You are offered absolute power over your rivals. How do you wield it?',
    options: [
      {
        id: 'q2a',
        text: 'I dismantle their influence and rebuild it to my design.',
        weights: { p8: 3, p2: 2, p6: 1 },
      },
      {
        id: 'q2b',
        text: 'I keep it as a deterrent, but I never use it unless forced.',
        weights: { p3: 3, p1: 2, p10: 1 },
      },
      {
        id: 'q2c',
        text: "I use it to automate the world's problems away.",
        weights: { p9: 3, p2: 2, p4: 1 },
      },
      {
        id: 'q2d',
        text: 'I burn the system down. Power is a boring shackle.',
        weights: { p7: 3, p9: 2, p4: 1 },
      },
    ],
  },
  {
    id: 'q3',
    text: 'How much of your true self do you reveal to those you work with?',
    options: [
      {
        id: 'q3a',
        text: 'Everything is a mask. My true self is a classified asset.',
        weights: { p4: 3, p3: 2, p7: 1 },
      },
      {
        id: 'q3b',
        text: 'I am professional and transparent, but never intimate.',
        weights: { p1: 3, p8: 2, p2: 1 },
      },
      {
        id: 'q3c',
        text: 'I am an open book to those I trust; a riddle to everyone else.',
        weights: { p5: 3, p10: 2, p7: 1 },
      },
      {
        id: 'q3d',
        text: 'I am exactly who I appear to be: the smartest person here.',
        weights: { p9: 3, p2: 2, p8: 1 },
      },
    ],
  },
  {
    id: 'q4',
    text: "When you look at the 'Big Picture,' what do you see?",
    options: [
      {
        id: 'q4a',
        text: 'Entropy. Everything falls apart unless I hold it together.',
        weights: { p6: 3, p3: 2, p8: 1 },
      },
      {
        id: 'q4b',
        text: 'A puzzle that has a logical, perfect solution.',
        weights: { p2: 3, p9: 2, p4: 1 },
      },
      {
        id: 'q4c',
        text: 'A cycle of growth and decay that we must simply respect.',
        weights: { p10: 3, p5: 2, p1: 1 },
      },
      {
        id: 'q4d',
        text: 'A playground of infinite, chaotic opportunity.',
        weights: { p7: 3, p9: 2, p5: 1 },
      },
    ],
  },
  {
    id: 'q5',
    text: 'A loyal but incompetent friend is hurting your business. Your move?',
    options: [
      {
        id: 'q5a',
        text: 'Cut them loose immediately. The mission comes first.',
        weights: { p6: 3, p8: 2, p2: 1 },
      },
      {
        id: 'q5b',
        text: 'Find a background role for them where they can do no harm.',
        weights: { p1: 3, p4: 2, p3: 1 },
      },
      {
        id: 'q5c',
        text: 'Mentor them. Everyone has a hidden spark.',
        weights: { p5: 3, p10: 2, p9: 1 },
      },
      {
        id: 'q5d',
        text: 'Keep them. Loyalty is a rarer currency than competence.',
        weights: { p3: 3, p1: 2, p8: 1 },
      },
    ],
  },
  {
    id: 'q6',
    text: 'What is the true purpose of a massive fortune?',
    options: [
      {
        id: 'q6a',
        text: 'To build a legacy that outlives my own name.',
        weights: { p8: 3, p1: 2, p6: 1 },
      },
      {
        id: 'q6b',
        text: 'To fund the tools and tech needed to solve the future.',
        weights: { p9: 3, p2: 2, p4: 1 },
      },
      {
        id: 'q6c',
        text: 'To buy the freedom to exist outside the system.',
        weights: { p3: 3, p4: 2, p7: 1 },
      },
      {
        id: 'q6d',
        text: 'It is a burden; true wealth is found in detachment.',
        weights: { p10: 3, p5: 2, p1: 1 },
      },
    ],
  },
  {
    id: 'q7',
    text: 'Someone close to you has sold your secrets. How do you respond?',
    options: [
      {
        id: 'q7a',
        text: 'Systematic, quiet destruction of their entire reputation.',
        weights: { p4: 3, p8: 2, p2: 1 },
      },
      {
        id: 'q7b',
        text: 'I anticipated it. The secrets they sold were actually traps.',
        weights: { p2: 3, p3: 2, p7: 1 },
      },
      {
        id: 'q7c',
        text: "I confront them directly. I need to understand the 'why.'",
        weights: { p5: 3, p1: 2, p10: 1 },
      },
      {
        id: 'q7d',
        text: 'I simply remove them from my universe. They no longer exist.',
        weights: { p6: 3, p3: 2, p8: 1 },
      },
    ],
  },
  {
    id: 'q8',
    text: 'Which trait do you value most in yourself?',
    options: [
      {
        id: 'q8a',
        text: 'Unshakeable Discipline.',
        weights: { p6: 3, p3: 2, p1: 1 },
      },
      {
        id: 'q8b',
        text: 'Raw Intelligence.',
        weights: { p2: 3, p9: 2, p4: 1 },
      },
      {
        id: 'q8c',
        text: 'Strategic Influence.',
        weights: { p8: 3, p4: 2, p7: 1 },
      },
      {
        id: 'q8d',
        text: 'Inner Peace.',
        weights: { p10: 3, p5: 2, p1: 1 },
      },
    ],
  },
]
