import { ALL_PERSONA_IDS } from '../config/personas'

/**
 * Calculate the winning persona from weighted answers
 *
 * Each answer has a `weights` object: { personaId: points }
 * Points are summed across all answers.
 * Ties are broken randomly.
 *
 * @param {Array<{questionId: string, weights: Object}>} answers
 * @returns {string} The winning persona ID (p1-p10)
 */
export function calculatePersona(answers) {
  // Initialize scores for all personas
  const scores = {}
  for (const id of ALL_PERSONA_IDS) {
    scores[id] = 0
  }

  // Tally weighted points from each answer
  for (const answer of answers) {
    if (answer.weights) {
      for (const [personaId, points] of Object.entries(answer.weights)) {
        scores[personaId] = (scores[personaId] || 0) + points
      }
    }
  }

  // Find highest score
  const maxScore = Math.max(...Object.values(scores))

  // Get all personas with the highest score
  const winners = Object.entries(scores)
    .filter(([, score]) => score === maxScore)
    .map(([personaId]) => personaId)

  // If tie, pick randomly
  if (winners.length > 1) {
    return winners[Math.floor(Math.random() * winners.length)]
  }

  return winners[0]
}
