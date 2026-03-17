<script setup>
import { computed } from 'vue'

const props = defineProps({
  timeLeft: { type: Number, required: true },
  duration: { type: Number, default: 15 },
  isWarning: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
})

/** Rayon et dimensions du cercle SVG */
const SIZE = 80
const STROKE = 5
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** Calcule le dashoffset pour l'arc de progression */
const strokeDashoffset = computed(() => {
  const progress = props.timeLeft / props.duration
  return CIRCUMFERENCE * (1 - progress)
})

/** Couleur dynamique selon le temps restant */
const strokeColor = computed(() => {
  if (props.timeLeft <= 3) return 'var(--color-red)'
  if (props.timeLeft <= 5) return 'var(--color-orange)'
  return 'var(--color-green)'
})
</script>

<template>
  <div class="quiz-timer" :class="{ 'quiz-timer--pulse': isWarning && isActive }">
    <svg
      class="quiz-timer__svg"
      :width="SIZE"
      :height="SIZE"
      :viewBox="`0 0 ${SIZE} ${SIZE}`"
    >
      <!-- Cercle de fond -->
      <circle
        class="quiz-timer__track"
        :cx="SIZE / 2"
        :cy="SIZE / 2"
        :r="RADIUS"
        fill="none"
        :stroke-width="STROKE"
      />
      <!-- Cercle de progression -->
      <circle
        class="quiz-timer__progress"
        :cx="SIZE / 2"
        :cy="SIZE / 2"
        :r="RADIUS"
        fill="none"
        :stroke="strokeColor"
        :stroke-width="STROKE"
        stroke-linecap="round"
        :stroke-dasharray="CIRCUMFERENCE"
        :stroke-dashoffset="strokeDashoffset"
      />
    </svg>
    <!-- Valeur au centre -->
    <span
      class="quiz-timer__value"
      :class="{ 'quiz-timer__value--warning': isWarning }"
    >
      {{ timeLeft }}
    </span>
  </div>
</template>

<style scoped>
.quiz-timer {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
  position: relative;
}

.quiz-timer__svg {
  transform: rotate(-90deg);
}

.quiz-timer__track {
  stroke: var(--border-color);
}

.quiz-timer__progress {
  transition: stroke-dashoffset 1s linear, stroke 0.5s ease;
}

.quiz-timer__value {
  position: absolute;
  top: 50%;
  right: 0;
  /* Centre le texte sur le SVG (largeur 80px) */
  width: 80px;
  transform: translateY(-50%);
  text-align: center;
  font-size: 22px;
  font-weight: 800;
  font-family: var(--font-serif);
  color: var(--text-primary);
  transition: color var(--transition-normal);
}

.quiz-timer__value--warning {
  color: var(--color-red);
}

.quiz-timer--pulse {
  animation: timer-pulse 1s infinite;
}

@keyframes timer-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

@media (max-width: 576px) {
  .quiz-timer__value {
    font-size: 18px;
  }
}
</style>
