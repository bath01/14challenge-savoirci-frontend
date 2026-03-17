<script setup>
defineProps({
  /** Mode plein écran (overlay) ou inline */
  fullscreen: { type: Boolean, default: false },
  /** Texte affiché sous le logo */
  text: { type: String, default: '' }
})
</script>

<template>
  <div class="loader" :class="{ 'loader--fullscreen': fullscreen }">
    <div class="loader__content">
      <!-- Logo animé -->
      <div class="loader__brand">
        <span class="loader__logo-text">Savoir</span>
        <span class="loader__logo-accent">CI</span>
      </div>

      <!-- Barre de progression animée (tricolore) -->
      <div class="loader__bar">
        <div class="loader__bar-track">
          <div class="loader__bar-fill"></div>
        </div>
      </div>

      <!-- Texte optionnel -->
      <p v-if="text" class="loader__text">{{ text }}</p>
    </div>
  </div>
</template>

<style scoped>
/* --- Mode inline (par défaut) --- */
.loader {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 64px 0;
}

/* --- Mode plein écran --- */
.loader--fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: var(--bg-primary);
  padding: 0;
}

.loader__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

/* --- Logo --- */
.loader__brand {
  display: flex;
  align-items: baseline;
  animation: loader-fade-in 0.5s ease-out;
}

.loader__logo-text {
  font-size: 32px;
  font-weight: 800;
  font-family: var(--font-serif);
  color: var(--text-primary);
  letter-spacing: -1px;
}

.loader__logo-accent {
  font-size: 32px;
  font-weight: 800;
  font-family: var(--font-serif);
  color: var(--color-orange);
  letter-spacing: -1px;
}

/* --- Barre tricolore animée --- */
.loader__bar {
  width: 120px;
}

.loader__bar-track {
  width: 100%;
  height: 3px;
  background: var(--border-color);
  overflow: hidden;
  position: relative;
}

.loader__bar-fill {
  position: absolute;
  top: 0;
  left: -40%;
  width: 40%;
  height: 100%;
  background: linear-gradient(90deg, var(--color-orange), var(--color-green));
  animation: loader-slide 1.2s ease-in-out infinite;
}

/* --- Texte --- */
.loader__text {
  font-size: 11px;
  font-weight: 600;
  font-family: var(--font-sans);
  color: var(--text-secondary);
  letter-spacing: 2px;
  text-transform: uppercase;
}

/* --- Animations --- */
@keyframes loader-slide {
  0% { left: -40%; }
  50% { left: 100%; }
  100% { left: 100%; }
}

@keyframes loader-fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* --- Responsive --- */
@media (max-width: 576px) {
  .loader__logo-text,
  .loader__logo-accent {
    font-size: 26px;
  }

  .loader__bar {
    width: 100px;
  }
}
</style>
