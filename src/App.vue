<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppNav from '@/components/layout/AppNav.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import AppLoader from '@/components/ui/AppLoader.vue'

const router = useRouter()
const routeLoading = ref(false)

/** Affiche le loader pendant les transitions de route */
router.beforeEach(() => {
  routeLoading.value = true
})

router.afterEach(() => {
  routeLoading.value = false
})
</script>

<template>
  <div class="app">
    <!-- Loader global plein écran -->
    <Transition name="loader">
      <AppLoader v-if="routeLoading" fullscreen />
    </Transition>

    <AppNav />
    <main class="app__main">
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app__main {
  flex: 1;
  padding-top: 56px;
}

/* Transition du loader */
.loader-enter-active {
  transition: opacity 0.2s ease;
}

.loader-leave-active {
  transition: opacity 0.35s ease;
}

.loader-enter-from,
.loader-leave-to {
  opacity: 0;
}
</style>
