import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Store des accomplissements
 * Gère les streaks, badges et statistiques — persistés en localStorage
 */

const STORAGE_KEY = 'savoirci_achievements'

/** Définition de tous les badges disponibles */
const BADGE_DEFINITIONS = [
  {
    id: 'first_quiz',
    name: 'Premier Pas',
    description: 'Terminer son premier quiz',
    icon: '🎯',
    check: (stats) => stats.totalQuizzes >= 1
  },
  {
    id: 'perfect_round',
    name: 'Sans Faute',
    description: '100% de bonnes réponses sur un quiz',
    icon: '💎',
    check: (_stats, context) => context.scorePercent === 100
  },
  {
    id: 'speed_demon',
    name: 'Éclair',
    description: 'Répondre à 5 questions en moins de 5 secondes chacune',
    icon: '⚡',
    check: (stats) => stats.fastAnswers >= 5
  },
  {
    id: 'streak_5',
    name: 'En Feu',
    description: '5 bonnes réponses consécutives',
    icon: '🔥',
    check: (stats) => stats.bestStreak >= 5
  },
  {
    id: 'streak_10',
    name: 'Inarrêtable',
    description: '10 bonnes réponses consécutives',
    icon: '🏆',
    check: (stats) => stats.bestStreak >= 10
  },
  {
    id: 'all_categories',
    name: 'Polyglotte',
    description: 'Compléter un quiz dans chaque catégorie',
    icon: '🌍',
    check: (stats) => stats.categoriesPlayed.length >= 4
  },
  {
    id: 'ten_quizzes',
    name: 'Habitué',
    description: 'Terminer 10 quiz',
    icon: '📚',
    check: (stats) => stats.totalQuizzes >= 10
  },
  {
    id: 'comeback',
    name: 'Comeback',
    description: 'Faire mieux que son score précédent dans la même catégorie',
    icon: '💪',
    check: (_stats, context) => context.isComeback
  }
]

export const useAchievementsStore = defineStore('achievements', () => {
  // --- État ---
  const currentStreak = ref(0)
  const bestStreak = ref(0)
  const totalQuizzes = ref(0)
  const fastAnswers = ref(0)
  const unlockedBadges = ref([])
  const categoriesPlayed = ref([])
  const categoryBestScores = ref({})
  const newlyUnlocked = ref([])

  // --- Computed ---
  const allBadges = computed(() =>
    BADGE_DEFINITIONS.map((badge) => ({
      ...badge,
      unlocked: unlockedBadges.value.includes(badge.id)
    }))
  )

  const unlockedCount = computed(() => unlockedBadges.value.length)
  const totalBadges = computed(() => BADGE_DEFINITIONS.length)

  // --- Méthodes ---

  /** Charge les données depuis localStorage */
  function loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return

      const data = JSON.parse(saved)
      bestStreak.value = data.bestStreak || 0
      totalQuizzes.value = data.totalQuizzes || 0
      fastAnswers.value = data.fastAnswers || 0
      unlockedBadges.value = data.unlockedBadges || []
      categoriesPlayed.value = data.categoriesPlayed || []
      categoryBestScores.value = data.categoryBestScores || {}
    } catch {
      /* Données corrompues, on repart à zéro */
    }
  }

  /** Sauvegarde les données en localStorage */
  function saveToStorage() {
    const data = {
      bestStreak: bestStreak.value,
      totalQuizzes: totalQuizzes.value,
      fastAnswers: fastAnswers.value,
      unlockedBadges: unlockedBadges.value,
      categoriesPlayed: categoriesPlayed.value,
      categoryBestScores: categoryBestScores.value
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  /** Enregistre une bonne réponse dans le streak */
  function recordCorrectAnswer() {
    currentStreak.value++
    if (currentStreak.value > bestStreak.value) {
      bestStreak.value = currentStreak.value
    }
  }

  /** Enregistre une mauvaise réponse (casse le streak) */
  function recordWrongAnswer() {
    currentStreak.value = 0
  }

  /** Enregistre une réponse rapide (< 5 secondes) */
  function recordFastAnswer() {
    fastAnswers.value++
  }

  /** Finalise un quiz et vérifie les badges */
  function completeQuiz(categoryId, scorePercent) {
    totalQuizzes.value++

    // Vérifie si c'est un comeback
    const previousBest = categoryBestScores.value[categoryId] || 0
    const isComeback = previousBest > 0 && scorePercent > previousBest

    // Met à jour le meilleur score de la catégorie
    if (scorePercent > previousBest) {
      categoryBestScores.value[categoryId] = scorePercent
    }

    // Ajoute la catégorie si c'est la première fois
    if (!categoriesPlayed.value.includes(categoryId)) {
      categoriesPlayed.value.push(categoryId)
    }

    // Vérifie tous les badges
    const stats = {
      totalQuizzes: totalQuizzes.value,
      bestStreak: bestStreak.value,
      fastAnswers: fastAnswers.value,
      categoriesPlayed: categoriesPlayed.value
    }

    const context = { scorePercent, isComeback }

    newlyUnlocked.value = []
    for (const badge of BADGE_DEFINITIONS) {
      if (unlockedBadges.value.includes(badge.id)) continue
      if (badge.check(stats, context)) {
        unlockedBadges.value.push(badge.id)
        newlyUnlocked.value.push(badge)
      }
    }

    saveToStorage()
    return newlyUnlocked.value
  }

  /** Réinitialise le streak courant (début de quiz) */
  function resetCurrentStreak() {
    currentStreak.value = 0
  }

  // Charge les données au démarrage
  loadFromStorage()

  return {
    currentStreak,
    bestStreak,
    totalQuizzes,
    fastAnswers,
    unlockedBadges,
    categoriesPlayed,
    categoryBestScores,
    newlyUnlocked,
    allBadges,
    unlockedCount,
    totalBadges,
    recordCorrectAnswer,
    recordWrongAnswer,
    recordFastAnswer,
    completeQuiz,
    resetCurrentStreak,
    loadFromStorage
  }
})
