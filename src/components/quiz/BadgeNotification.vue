<script setup>
defineProps({
  badges: { type: Array, default: () => [] }
})
</script>

<template>
  <TransitionGroup name="badge" tag="div" class="badge-list">
    <div v-for="badge in badges" :key="badge.id" class="badge-notif">
      <span class="badge-notif__icon">{{ badge.icon }}</span>
      <div class="badge-notif__info">
        <span class="badge-notif__label">Nouveau badge !</span>
        <span class="badge-notif__name">{{ badge.name }}</span>
        <span class="badge-notif__desc">{{ badge.description }}</span>
      </div>
    </div>
  </TransitionGroup>
</template>

<style scoped>
.badge-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
}

.badge-notif {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  background: color-mix(in srgb, var(--color-orange) 8%, var(--bg-card));
  border: 1.5px solid color-mix(in srgb, var(--color-orange) 25%, transparent);
  animation: badge-shine 0.6s ease-out;
}

.badge-notif__icon {
  font-size: 32px;
  flex-shrink: 0;
}

.badge-notif__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: left;
}

.badge-notif__label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--color-orange);
  font-family: var(--font-sans);
}

.badge-notif__name {
  font-size: 16px;
  font-weight: 700;
  font-family: var(--font-serif);
  color: var(--text-primary);
}

.badge-notif__desc {
  font-size: 12px;
  color: var(--text-secondary);
  font-family: var(--font-sans);
}

/* Animations */
@keyframes badge-shine {
  0% { transform: translateY(20px) scale(0.9); opacity: 0; }
  60% { transform: translateY(-4px) scale(1.02); }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}

/* Transition Vue */
.badge-enter-active { transition: all 0.4s ease-out; }
.badge-leave-active { transition: all 0.2s ease-in; }
.badge-enter-from { opacity: 0; transform: translateX(-20px); }
.badge-leave-to { opacity: 0; transform: translateX(20px); }

@media (max-width: 576px) {
  .badge-notif {
    padding: 12px 14px;
    gap: 10px;
  }

  .badge-notif__icon {
    font-size: 26px;
  }

  .badge-notif__name {
    font-size: 14px;
  }
}
</style>
