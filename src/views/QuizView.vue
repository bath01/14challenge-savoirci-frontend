<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '@/stores/quiz.js'
import { useAchievementsStore } from '@/stores/achievements.js'
import { useTimer } from '@/composables/useTimer.js'
import { useConfetti } from '@/composables/useConfetti.js'
import QuizProgress from '@/components/quiz/QuizProgress.vue'
import QuizTimer from '@/components/quiz/QuizTimer.vue'
import QuizOption from '@/components/quiz/QuizOption.vue'
import QuizStreak from '@/components/quiz/QuizStreak.vue'
import AppLoader from '@/components/ui/AppLoader.vue'

const TIMER_DURATION = 15

const router = useRouter()
const quizStore = useQuizStore()
const achievements = useAchievementsStore()
const { fire: fireConfetti } = useConfetti()

const submitting = ref(false)

/** Gère l'expiration du timer en soumettant une réponse "temps écoulé" */
async function handleTimerExpired() {
  if (submitting.value) return
  submitting.value = true

  try {
    await quizStore.submitTimeExpired()
    achievements.recordWrongAnswer()
  } catch {
    /* Erreur gérée dans le store */
  } finally {
    submitting.value = false
  }
}

const { timeLeft, isActive, start, stop, restart } = useTimer(TIMER_DURATION, handleTimerExpired)

// Redirige vers les catégories si aucune session n'est active
onMounted(() => {
  if (!quizStore.sessionId || !quizStore.currentQuestion) {
    router.replace('/categories')
    return
  }
  achievements.resetCurrentStreak()
  start()
})

/** Soumet la réponse à l'API, met à jour le streak et déclenche les effets */
async function handleAnswer(answerIndex) {
  if (submitting.value) return
  submitting.value = true

  stop()
  const answer = quizStore.currentOptions[answerIndex]
  if (!answer) return

  try {
    const result = await quizStore.submitAnswer(answer.id)

    if (result.isCorrect) {
      achievements.recordCorrectAnswer()
      fireConfetti()

      // Réponse rapide si < 5 secondes
      if (result.timeElapsed < 5) {
        achievements.recordFastAnswer()
      }
    } else {
      achievements.recordWrongAnswer()
    }
  } catch {
    /* Erreur gérée dans le store */
  } finally {
    submitting.value = false
  }
}

/** Passe à la question suivante ou affiche le score */
async function handleNext() {
  if (quizStore.isLastQuestion) {
    achievements.completeQuiz(
      quizStore.selectedCategory.id,
      quizStore.scorePercent
    )
    router.push('/score')
    return
  }

  try {
    const result = await quizStore.nextQuestion()
    if (result?.completed) {
      achievements.completeQuiz(
        quizStore.selectedCategory.id,
        quizStore.scorePercent
      )
      router.push('/score')
    } else {
      restart()
    }
  } catch {
    /* Erreur gérée dans le store */
  }
}
</script>

<template>
  <div v-if="quizStore.currentQuestion" class="quiz container">
    <div class="quiz__header">
      <QuizProgress
        :category-name="quizStore.selectedCategory.name"
        :category-color="quizStore.selectedCategory.color"
        :current-index="quizStore.currentIndex"
        :total-questions="quizStore.totalQuestions"
        :progress-percent="quizStore.progressPercent"
      />
      <div class="quiz__header-row">
        <QuizStreak :streak="achievements.currentStreak" />
        <QuizTimer
          :time-left="timeLeft"
          :duration="TIMER_DURATION"
          :is-warning="timeLeft <= 5"
          :is-active="isActive && !quizStore.answered"
        />
      </div>
    </div>

    <!-- Question -->
    <h2 class="quiz__question">{{ quizStore.currentQuestion.text }}</h2>

    <!-- Options de réponse -->
    <div class="quiz__options">
      <QuizOption
        v-for="(opt, i) in quizStore.currentOptions"
        :key="opt.id"
        :label="opt.text"
        :index="i"
        :answered="quizStore.answered"
        :is-correct="i === quizStore.correctOptionIndex"
        :is-picked="i === quizStore.selectedOptionIndex"
        :category-color="quizStore.selectedCategory.color"
        @select="handleAnswer"
      />
    </div>

    <!-- Erreur API -->
    <p v-if="quizStore.error" class="quiz__error">{{ quizStore.error }}</p>

    <!-- Bouton suivant -->
    <div v-if="quizStore.answered" class="quiz__actions">
      <button
        class="quiz__next-btn"
        :style="{ background: quizStore.selectedCategory.color }"
        :disabled="quizStore.loading"
        @click="handleNext"
      >
        <span v-if="quizStore.loading" class="quiz__btn-loader"></span>
        {{ quizStore.isLastQuestion ? 'Voir le score' : 'Suivante →' }}
      </button>
    </div>
  </div>

  <!-- Chargement initial -->
  <div v-else class="quiz container">
    <AppLoader text="Chargement de la question" />
  </div>
</template>

<style scoped>
.quiz {
  max-width: 700px;
  padding-top: 48px;
  padding-bottom: 48px;
}

.quiz__header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.quiz__question {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.35;
  font-family: var(--font-serif);
  color: var(--text-primary);
  margin-bottom: 36px;
  letter-spacing: -0.5px;
}

.quiz__options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 40px;
}

.quiz__error {
  font-size: 13px;
  color: var(--color-red);
  font-family: var(--font-sans);
  margin-bottom: 16px;
  text-align: center;
}

.quiz__loading {
  font-size: 15px;
  font-family: var(--font-sans);
  color: var(--text-secondary);
  text-align: center;
  padding: 40px 0;
}

.quiz__actions {
  display: flex;
  justify-content: flex-end;
}

.quiz__next-btn {
  padding: 14px 36px;
  border: none;
  cursor: pointer;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  font-family: var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 2px;
  transition: transform var(--transition-fast);
}

.quiz__next-btn:active {
  transform: scale(0.97);
}

.quiz__next-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.quiz__btn-loader {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: loader-rotate 0.6s linear infinite;
  vertical-align: middle;
  margin-right: 6px;
}

@keyframes loader-rotate {
  to { transform: rotate(360deg); }
}

/* ---- Responsive mobile ---- */
@media (max-width: 576px) {
  .quiz {
    padding-top: 28px;
    padding-bottom: 28px;
  }

  .quiz__question {
    font-size: 22px;
    margin-bottom: 24px;
  }

  .quiz__options {
    gap: 10px;
    margin-bottom: 28px;
  }

  .quiz__actions {
    justify-content: stretch;
  }

  .quiz__next-btn {
    width: 100%;
    text-align: center;
    padding: 14px 20px;
  }
}
</style>
