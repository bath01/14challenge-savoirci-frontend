/**
 * Service API pour communiquer avec le backend SavoirCI
 * Toutes les requêtes passent par ce module
 */

const API_BASE_URL = 'https://api.savoirci.chalenge14.com/api'

/**
 * Effectue une requête HTTP vers l'API backend
 * @param {string} endpoint - Chemin relatif de l'endpoint
 * @param {Object} options - Options fetch supplémentaires
 * @returns {Promise<any>} Données JSON de la réponse
 */
async function fetchApi(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  })

  if (!response.ok) {
    const error = new Error(`Erreur API : ${response.status}`)
    error.status = response.status
    throw error
  }

  return response.json()
}

/** Récupère les statistiques globales (catégories + totaux) */
export function fetchStats() {
  return fetchApi('/stats')
}

/** Récupère la liste des catégories */
export function fetchCategories() {
  return fetchApi('/stats/categories')
}

/** Démarre une session de quiz pour une catégorie */
export function startQuizSession(categoryId) {
  return fetchApi(`/quiz/start/${categoryId}`, { method: 'POST' })
}

/** Soumet une réponse à la question en cours */
export function submitQuizAnswer(sessionId, answerId) {
  return fetchApi('/quiz/answer', {
    method: 'POST',
    body: JSON.stringify({ sessionId, answerId })
  })
}

/** Récupère la question suivante */
export function fetchNextQuestion(sessionId) {
  return fetchApi(`/quiz/next?sessionId=${sessionId}`)
}

/** Récupère les résultats complets du quiz */
export function fetchQuizResult(sessionId) {
  return fetchApi(`/quiz/result?sessionId=${sessionId}`)
}
