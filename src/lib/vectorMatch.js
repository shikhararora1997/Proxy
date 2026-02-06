/**
 * Vector-based persona matching using Euclidean distance
 */

import { PERSONA_VECTORS, ALL_PERSONA_IDS } from '../config/personas'

/**
 * Calculate Euclidean distance between two vectors
 * d(p,q) = sqrt(sum((qi - pi)^2))
 */
export function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have same dimensions')
  }

  let sumSquares = 0
  for (let i = 0; i < vectorA.length; i++) {
    sumSquares += Math.pow(vectorB[i] - vectorA[i], 2)
  }

  return Math.sqrt(sumSquares)
}

/**
 * Calculate match scores for all personas against user vector
 * Returns sorted array of { personaId, distance, matchPercent }
 */
export function calculateAllMatches(userVector) {
  // Max possible distance in 5D space with 0-100 range
  // sqrt(5 * 100^2) = sqrt(50000) ≈ 223.6
  const maxDistance = Math.sqrt(5 * Math.pow(100, 2))

  const matches = ALL_PERSONA_IDS.map(personaId => {
    const personaVector = PERSONA_VECTORS[personaId]
    const distance = euclideanDistance(userVector, personaVector)
    // Convert distance to percentage (closer = higher %)
    const matchPercent = Math.round((1 - distance / maxDistance) * 100)

    return {
      personaId,
      distance,
      matchPercent,
    }
  })

  // Sort by distance (closest first)
  return matches.sort((a, b) => a.distance - b.distance)
}

/**
 * Get the best matching persona
 */
export function getBestMatch(userVector) {
  const matches = calculateAllMatches(userVector)
  return matches[0]
}

/**
 * Get top N matches
 */
export function getTopMatches(userVector, n = 3) {
  const matches = calculateAllMatches(userVector)
  return matches.slice(0, n)
}
