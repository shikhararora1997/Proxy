import { PERSONA_PRIORITY } from '../config/personas'

/**
 * Calculate the winning persona from answers
 *
 * @param {Array<{questionId: string, personaId: string}>} answers
 * @returns {string} The winning persona ID (p1, p2, p3, or p4)
 */
export function calculatePersona(answers) {
  // Tally points per persona
  const scores = answers.reduce((acc, answer) => {
    const persona = answer.personaId
    acc[persona] = (acc[persona] || 0) + 1
    return acc
  }, {})

  // Find highest score
  const maxScore = Math.max(...Object.values(scores))

  // Get all personas with the highest score
  const winners = Object.entries(scores)
    .filter(([, score]) => score === maxScore)
    .map(([personaId]) => personaId)

  // If tie, use priority order (p1 > p2 > p3 > p4)
  if (winners.length > 1) {
    for (const personaId of PERSONA_PRIORITY) {
      if (winners.includes(personaId)) {
        return personaId
      }
    }
  }

  return winners[0]
}
