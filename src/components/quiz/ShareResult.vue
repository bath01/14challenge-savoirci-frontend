<script setup>
import { ref, onMounted } from 'vue'
import { useShareCard } from '@/composables/useShareCard.js'

const props = defineProps({
  categoryName: { type: String, required: true },
  categoryColor: { type: String, required: true },
  scorePercent: { type: Number, required: true },
  resultMessage: { type: String, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  bestStreak: { type: Number, default: 0 },
  badgesCount: { type: Number, default: 0 },
  totalBadges: { type: Number, default: 0 }
})

const { generateCard, generateBlob } = useShareCard()

const previewRef = ref(null)
const shareStatus = ref('')
const isGenerating = ref(false)

/** Texte de partage */
const shareText = `J'ai obtenu ${props.scorePercent}% en ${props.categoryName} sur SavoirCI ! Fais mieux si tu peux !`

/** Génère la prévisualisation canvas */
onMounted(() => {
  const canvas = generateCard(props)
  if (previewRef.value) {
    previewRef.value.appendChild(canvas)
  }
})

/** Télécharge l'image en PNG */
async function downloadCard() {
  isGenerating.value = true
  try {
    const blob = await generateBlob(props)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `savoirci-${props.categoryName.toLowerCase().replace(/\s+/g, '-')}-${props.scorePercent}pct.png`
    link.click()
    URL.revokeObjectURL(url)
    showStatus('Image téléchargée !')
  } finally {
    isGenerating.value = false
  }
}

/** Partage natif (mobile) ou fallback copie */
async function shareNative() {
  const blob = await generateBlob(props)
  const file = new File([blob], 'savoirci-resultat.png', { type: 'image/png' })

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        text: shareText,
        files: [file]
      })
      showStatus('Partagé !')
    } catch {
      /* L'utilisateur a annulé */
    }
  } else {
    await copyTextToClipboard()
  }
}

/** Partage avec image via Web Share API (WhatsApp, X, etc.) */
async function shareWithImage(fallbackUrl) {
  const blob = await generateBlob(props)
  const file = new File([blob], 'savoirci-resultat.png', { type: 'image/png' })

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ text: shareText, files: [file] })
      showStatus('Partagé !')
      return
    } catch {
      /* L'utilisateur a annulé ou erreur — fallback */
    }
  }

  // Fallback : ouvre le lien classique (sans image)
  if (fallbackUrl) {
    window.open(fallbackUrl, '_blank')
  }
}

/** Partage sur WhatsApp (image via Web Share, sinon lien texte) */
function shareWhatsApp() {
  const fallback = `https://wa.me/?text=${encodeURIComponent(shareText)}`
  shareWithImage(fallback)
}

/** Partage sur X (image via Web Share, sinon lien texte) */
function shareTwitter() {
  const fallback = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
  shareWithImage(fallback)
}

/** Copie le texte dans le presse-papier */
async function copyTextToClipboard() {
  try {
    await navigator.clipboard.writeText(shareText)
    showStatus('Copié !')
  } catch {
    showStatus('Impossible de copier')
  }
}

/** Affiche un message de statut temporaire */
function showStatus(message) {
  shareStatus.value = message
  setTimeout(() => { shareStatus.value = '' }, 2500)
}
</script>

<template>
  <div class="share">
    <p class="share__title">Partager mon résultat</p>

    <!-- Prévisualisation de la carte -->
    <div ref="previewRef" class="share__preview"></div>

    <!-- Boutons de partage -->
    <div class="share__buttons">
      <!-- Partage natif (visible si supporté) -->
      <button class="share__btn share__btn--native" @click="shareNative" aria-label="Partager">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
          <polyline points="16 6 12 2 8 6"/>
          <line x1="12" y1="2" x2="12" y2="15"/>
        </svg>
        Partager
      </button>

      <!-- WhatsApp -->
      <button class="share__btn share__btn--whatsapp" @click="shareWhatsApp" aria-label="Partager sur WhatsApp">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        WhatsApp
      </button>

      <!-- Twitter/X -->
      <button class="share__btn share__btn--twitter" @click="shareTwitter" aria-label="Partager sur X">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        X
      </button>

      <!-- Télécharger -->
      <button class="share__btn share__btn--download" @click="downloadCard" :disabled="isGenerating" aria-label="Télécharger l'image">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Image
      </button>
    </div>

    <!-- Message de statut -->
    <Transition name="status">
      <p v-if="shareStatus" class="share__status">{{ shareStatus }}</p>
    </Transition>
  </div>
</template>

<style scoped>
.share {
  margin-bottom: 32px;
}

.share__title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 700;
  font-family: var(--font-sans);
  color: var(--text-secondary);
  margin-bottom: 16px;
}

/* Prévisualisation */
.share__preview {
  margin-bottom: 16px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  line-height: 0;
}

.share__preview :deep(canvas) {
  width: 100%;
  height: auto;
  display: block;
}

/* Boutons */
.share__buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.share__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  font-size: 12px;
  font-weight: 700;
  font-family: var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 1px;
  border: 1.5px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.share__btn:hover {
  transform: translateY(-1px);
}

.share__btn:active {
  transform: scale(0.97);
}

.share__btn--native {
  background: var(--color-orange);
  color: #fff;
  border-color: var(--color-orange);
}

.share__btn--whatsapp:hover {
  border-color: #25D366;
  color: #25D366;
}

.share__btn--twitter:hover {
  border-color: var(--text-primary);
}

.share__btn--download:hover {
  border-color: var(--color-blue);
  color: var(--color-blue);
}

.share__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Statut */
.share__status {
  margin-top: 10px;
  font-size: 12px;
  font-weight: 600;
  font-family: var(--font-sans);
  color: var(--color-green);
  text-align: center;
}

.status-enter-active { transition: all 0.3s ease-out; }
.status-leave-active { transition: all 0.2s ease-in; }
.status-enter-from { opacity: 0; transform: translateY(5px); }
.status-leave-to { opacity: 0; }

/* ---- Responsive mobile ---- */
@media (max-width: 576px) {
  .share__buttons {
    gap: 6px;
  }

  .share__btn {
    padding: 8px 12px;
    font-size: 11px;
  }
}
</style>
