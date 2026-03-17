import { ref } from 'vue'

/**
 * Composable pour déclencher un effet confetti via canvas
 * Léger, sans dépendance externe, nettoyage automatique
 */
export function useConfetti() {
  const isActive = ref(false)

  /** Génère une couleur aléatoire parmi la palette */
  function randomColor() {
    const colors = ['#FF8C00', '#009E49', '#3B82F6', '#8B5CF6', '#FFD700', '#E53E3E']
    return colors[Math.floor(Math.random() * colors.length)]
  }

  /** Lance l'animation confetti */
  function fire(duration = 2000) {
    if (isActive.value) return
    isActive.value = true

    const canvas = document.createElement('canvas')
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999'
    document.body.appendChild(canvas)

    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = []
    const particleCount = 80

    // Crée les particules
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.5,
        y: canvas.height * 0.4,
        vx: (Math.random() - 0.5) * 12,
        vy: -(Math.random() * 10 + 5),
        color: randomColor(),
        size: Math.random() * 6 + 3,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      })
    }

    const startTime = Date.now()

    /** Boucle d'animation */
    function animate() {
      const elapsed = Date.now() - startTime
      if (elapsed > duration) {
        canvas.remove()
        isActive.value = false
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of particles) {
        p.x += p.vx
        p.vy += 0.3 // Gravité
        p.y += p.vy
        p.rotation += p.rotationSpeed
        p.opacity = Math.max(0, 1 - elapsed / duration)

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.globalAlpha = p.opacity
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
        ctx.restore()
      }

      requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }

  return { fire, isActive }
}
