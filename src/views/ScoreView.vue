<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '@/stores/quiz.js'
import { useAchievementsStore } from '@/stores/achievements.js'
import { useConfetti } from '@/composables/useConfetti.js'
import BadgeNotification from '@/components/quiz/BadgeNotification.vue'
import ShareResult from '@/components/quiz/ShareResult.vue'

const router = useRouter()
const quizStore = useQuizStore()
const achievements = useAchievementsStore()
const { fire: fireConfetti } = useConfetti()

const loading = ref(true)
const resultDetails = ref([])

// Charge les résultats depuis l'API
onMounted(async () => {
  if (!quizStore.selectedCategory || !quizStore.sessionId) {
    router.replace('/categories')
    return
  }

  try {
    const result = await quizStore.loadResult()
    if (result?.details) {
      resultDetails.value = result.details
    }
  } catch {
    /* Utilise les données locales en fallback */
  } finally {
    loading.value = false
  }

  // Confetti si bon score
  if (quizStore.scorePercent >= 60) {
    fireConfetti(3000)
  }
})

/** Relance le quiz avec la même catégorie */
async function handleReplay() {
  try {
    await quizStore.startQuiz(quizStore.selectedCategory)
    router.push('/quiz')
  } catch {
    router.push('/categories')
  }
}

/** Libellé du statut pour le récapitulatif */
function getStatusLabel(detail) {
  if (detail.timeExpired) return 'Temps écoulé'
  if (detail.skipped) return 'Passée'
  return null
}
</script>

<template>
  <div v-if="quizStore.selectedCategory" class="score container">
    <!-- Badges débloqués -->
    <BadgeNotification :badges="achievements.newlyUnlocked" />

    <!-- En-tête du résultat -->
    <p class="score__category">{{ quizStore.selectedCategory.name }} — Résultat</p>
    <h1 class="score__percent">{{ quizStore.scorePercent }}%</h1>
    <p class="score__message" :class="{ 'score__message--success': quizStore.scorePercent >= 60 }">
      {{ quizStore.resultMessage }}
    </p>
    <p class="score__detail">
      {{ quizStore.score }} bonne{{ quizStore.score > 1 ? 's' : '' }}
      réponse{{ quizStore.score > 1 ? 's' : '' }}
      sur {{ quizStore.totalQuestions }}
    </p>

    <!-- Statistiques de la session -->
    <div class="score__stats">
      <div class="score__stat">
        <span class="score__stat-value">🔥 {{ achievements.bestStreak }}</span>
        <span class="score__stat-label">Meilleur streak</span>
      </div>
      <div class="score__stat">
        <span class="score__stat-value">🏅 {{ achievements.unlockedCount }}/{{ achievements.totalBadges }}</span>
        <span class="score__stat-label">Badges</span>
      </div>
      <div class="score__stat">
        <span class="score__stat-value">📊 {{ achievements.totalQuizzes }}</span>
        <span class="score__stat-label">Quiz joués</span>
      </div>
    </div>

    <!-- Carte de résultat partageable -->
    <ShareResult
      :category-name="quizStore.selectedCategory.name"
      :category-color="quizStore.selectedCategory.color"
      :score-percent="quizStore.scorePercent"
      :result-message="quizStore.resultMessage"
      :score="quizStore.score"
      :total-questions="quizStore.totalQuestions"
      :best-streak="achievements.bestStreak"
      :badges-count="achievements.unlockedCount"
      :total-badges="achievements.totalBadges"
    />

    <!-- Récapitulatif des réponses -->
    <div class="score__recap">
      <p class="score__recap-title">Récapitulatif</p>

      <!-- Résultats API (détaillés) -->
      <template v-if="resultDetails.length">
        <div
          v-for="detail in resultDetails"
          :key="detail.questionNumber"
          class="score__answer"
        >
          <span class="score__answer-icon" :class="detail.isCorrect ? 'score__answer-icon--correct' : 'score__answer-icon--wrong'">
            {{ detail.isCorrect ? '✓' : '✗' }}
          </span>
          <div class="score__answer-content">
            <p class="score__answer-question">{{ detail.question }}</p>
            <p v-if="getStatusLabel(detail)" class="score__answer-status">
              {{ getStatusLabel(detail) }}
            </p>
            <p v-if="!detail.isCorrect && detail.providedAnswer" class="score__answer-picked">
              Votre réponse : {{ detail.providedAnswer }}
            </p>
            <p class="score__answer-correct">
              Bonne réponse : {{ detail.correctAnswer }}
            </p>
          </div>
        </div>
      </template>

      <!-- Fallback : données locales -->
      <template v-else>
        <div
          v-for="(answer, i) in quizStore.answers"
          :key="i"
          class="score__answer"
        >
          <span class="score__answer-icon" :class="answer.isCorrect ? 'score__answer-icon--correct' : 'score__answer-icon--wrong'">
            {{ answer.isCorrect ? '✓' : '✗' }}
          </span>
          <div class="score__answer-content">
            <p class="score__answer-question">{{ answer.question }}</p>
            <p v-if="answer.timeExpired" class="score__answer-status">Temps écoulé</p>
            <p v-if="!answer.isCorrect && answer.providedAnswer" class="score__answer-picked">
              Votre réponse : {{ answer.providedAnswer }}
            </p>
            <p class="score__answer-correct">
              Bonne réponse : {{ answer.correctAnswer }}
            </p>
          </div>
        </div>
      </template>
    </div>

    <!-- Actions -->
    <div class="score__actions">
      <button class="score__btn score__btn--primary" @click="handleReplay">Rejouer</button>
      <button class="score__btn score__btn--secondary" @click="router.push('/categories')">Autre catégorie</button>
    </div>
  </div>
</template>

<style scoped>
.score {
  max-width: 700px;
  padding-top: 60px;
  padding-bottom: 60px;
  text-align: center;
}

.score__category {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-weight: 700;
  font-family: var(--font-sans);
  margin-bottom: 20px;
  color: var(--color-orange);
}

.score__percent {
  font-size: 96px;
  font-weight: 800;
  font-family: var(--font-serif);
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: -4px;
}

.score__message {
  font-size: 24px;
  font-weight: 600;
  font-family: var(--font-serif);
  color: var(--color-orange);
  margin-bottom: 8px;
  font-style: italic;
}

.score__message--success {
  color: var(--color-green);
}

.score__detail {
  font-size: 15px;
  color: var(--text-secondary);
  font-family: var(--font-sans);
  margin-bottom: 28px;
}

/* Statistiques de session */
.score__stats {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 40px;
  padding: 20px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
}

.score__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.score__stat-value {
  font-size: 18px;
  font-weight: 700;
  font-family: var(--font-serif);
  color: var(--text-primary);
}

.score__stat-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--text-secondary);
  font-family: var(--font-sans);
}

/* Récapitulatif */
.score__recap {
  text-align: left;
  margin-bottom: 40px;
}

.score__recap-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 700;
  font-family: var(--font-sans);
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.score__answer {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.score__answer-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
  margin-top: 2px;
}

.score__answer-icon--correct {
  background: var(--color-green);
}

.score__answer-icon--wrong {
  background: var(--color-red);
}

.score__answer-question {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  font-family: var(--font-sans);
}

.score__answer-status {
  font-size: 11px;
  color: var(--color-orange);
  font-weight: 600;
  font-family: var(--font-sans);
  margin-bottom: 2px;
}

.score__answer-picked {
  font-size: 12px;
  color: var(--color-red);
  margin-bottom: 2px;
  font-family: var(--font-sans);
}

.score__answer-correct {
  font-size: 12px;
  color: var(--color-green);
  font-family: var(--font-sans);
}

/* Actions */
.score__actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.score__btn {
  padding: 14px 32px;
  font-size: 13px;
  font-weight: 700;
  font-family: var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 2px;
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.score__btn:active {
  transform: scale(0.97);
}

.score__btn--primary {
  background: var(--color-orange);
  color: #fff;
  border: none;
}

.score__btn--secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1.5px solid var(--border-color);
}

/* ---- Responsive mobile ---- */
@media (max-width: 576px) {
  .score {
    padding-top: 36px;
    padding-bottom: 36px;
  }

  .score__percent {
    font-size: 64px;
    letter-spacing: -2px;
  }

  .score__message {
    font-size: 20px;
  }

  .score__stats {
    gap: 16px;
    padding: 16px 12px;
  }

  .score__stat-value {
    font-size: 15px;
  }

  .score__answer {
    padding: 12px 0;
  }

  .score__actions {
    flex-direction: column;
  }

  .score__btn {
    width: 100%;
    text-align: center;
  }
}
</style>
