<script setup>
defineProps({
  streak: { type: Number, required: true }
})
</script>

<template>
  <Transition name="streak">
    <div v-if="streak >= 2" class="quiz-streak">
      <span class="quiz-streak__fire">🔥</span>
      <span class="quiz-streak__count">{{ streak }}</span>
      <span class="quiz-streak__label">streak</span>
    </div>
  </Transition>
</template>

<style scoped>
.quiz-streak {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: color-mix(in srgb, var(--color-orange) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-orange) 30%, transparent);
  border-radius: 20px;
  animation: streak-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.quiz-streak__fire {
  font-size: 16px;
  animation: flame 0.6s ease-in-out infinite alternate;
}

.quiz-streak__count {
  font-size: 18px;
  font-weight: 800;
  font-family: var(--font-serif);
  color: var(--color-orange);
}

.quiz-streak__label {
  font-size: 11px;
  font-weight: 700;
  font-family: var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--color-orange);
  opacity: 0.8;
}

/* Animations */
@keyframes streak-pop {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes flame {
  0% { transform: scale(1) rotate(-5deg); }
  100% { transform: scale(1.15) rotate(5deg); }
}

/* Transition Vue */
.streak-enter-active { transition: all 0.3s ease-out; }
.streak-leave-active { transition: all 0.2s ease-in; }
.streak-enter-from { opacity: 0; transform: translateY(-10px) scale(0.8); }
.streak-leave-to { opacity: 0; transform: translateY(10px) scale(0.8); }
</style>
