/**
 * Composable pour générer une carte de résultat en image PNG via Canvas
 * Design éditorial avec couleurs du drapeau ivoirien
 */
export function useShareCard() {
  const CARD_WIDTH = 600
  const CARD_HEIGHT = 400

  /**
   * Dessine un rectangle arrondi sur le canvas
   */
  function drawRoundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  /**
   * Génère la carte de résultat sous forme de canvas
   * @param {Object} params - Données du résultat
   * @param {string} params.categoryName - Nom de la catégorie
   * @param {string} params.categoryColor - Couleur de la catégorie
   * @param {number} params.scorePercent - Score en pourcentage
   * @param {string} params.resultMessage - Message de résultat
   * @param {number} params.score - Nombre de bonnes réponses
   * @param {number} params.totalQuestions - Nombre total de questions
   * @param {number} params.bestStreak - Meilleur streak
   * @param {number} params.badgesCount - Nombre de badges débloqués
   * @param {number} params.totalBadges - Nombre total de badges
   */
  function generateCard(params) {
    const canvas = document.createElement('canvas')
    canvas.width = CARD_WIDTH
    canvas.height = CARD_HEIGHT
    const ctx = canvas.getContext('2d')

    const {
      categoryName,
      categoryColor,
      scorePercent,
      resultMessage,
      score,
      totalQuestions,
      bestStreak,
      badgesCount,
      totalBadges
    } = params

    // --- Fond principal avec dégradé sombre ---
    const bgGrad = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT)
    bgGrad.addColorStop(0, '#0A0A0A')
    bgGrad.addColorStop(1, '#1A1A1C')
    ctx.fillStyle = bgGrad
    drawRoundedRect(ctx, 0, 0, CARD_WIDTH, CARD_HEIGHT, 16)
    ctx.fill()

    // --- Bande colorée en haut (couleur catégorie) ---
    ctx.fillStyle = categoryColor
    ctx.fillRect(0, 0, CARD_WIDTH, 5)

    // --- Motif décoratif : cercle coloré en arrière-plan ---
    ctx.save()
    ctx.globalAlpha = 0.06
    ctx.fillStyle = categoryColor
    ctx.beginPath()
    ctx.arc(CARD_WIDTH - 80, 100, 180, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    // --- Logo / Titre de l'app ---
    ctx.fillStyle = '#F0EDE6'
    ctx.font = 'bold 14px "DM Sans", sans-serif'
    ctx.letterSpacing = '3px'
    ctx.fillText('SAVOIRCI', 40, 44)

    // --- Catégorie ---
    ctx.fillStyle = categoryColor
    ctx.font = 'bold 11px "DM Sans", sans-serif'
    ctx.fillText(categoryName.toUpperCase(), 40, 80)

    // --- Score principal ---
    ctx.fillStyle = '#F0EDE6'
    ctx.font = 'bold 96px "Playfair Display", Georgia, serif'
    ctx.fillText(`${scorePercent}%`, 40, 180)

    // --- Message de résultat ---
    const messageColor = scorePercent >= 60 ? '#009E49' : '#FF8C00'
    ctx.fillStyle = messageColor
    ctx.font = 'italic 600 22px "Playfair Display", Georgia, serif'
    ctx.fillText(resultMessage, 40, 215)

    // --- Détail du score ---
    ctx.fillStyle = '#777777'
    ctx.font = '14px "DM Sans", sans-serif'
    ctx.fillText(`${score} bonne${score > 1 ? 's' : ''} réponse${score > 1 ? 's' : ''} sur ${totalQuestions}`, 40, 245)

    // --- Séparateur ---
    ctx.strokeStyle = '#2A2A2C'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(40, 270)
    ctx.lineTo(CARD_WIDTH - 40, 270)
    ctx.stroke()

    // --- Statistiques en bas ---
    const statsY = 305
    const stats = [
      { icon: '\u{1F525}', value: String(bestStreak), label: 'Streak' },
      { icon: '\u{1F3C5}', value: `${badgesCount}/${totalBadges}`, label: 'Badges' }
    ]

    stats.forEach((stat, i) => {
      const x = 40 + i * 140

      ctx.font = '16px sans-serif'
      ctx.fillText(stat.icon, x, statsY)

      ctx.fillStyle = '#F0EDE6'
      ctx.font = 'bold 18px "Playfair Display", Georgia, serif'
      ctx.fillText(stat.value, x + 26, statsY)

      ctx.fillStyle = '#777777'
      ctx.font = '10px "DM Sans", sans-serif'
      ctx.fillText(stat.label.toUpperCase(), x + 26, statsY + 18)
    })

    // --- Bande tricolore ivoirienne en bas ---
    const flagY = CARD_HEIGHT - 4
    const thirdWidth = CARD_WIDTH / 3
    ctx.fillStyle = '#FF8C00'
    ctx.fillRect(0, flagY, thirdWidth, 4)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(thirdWidth, flagY, thirdWidth, 4)
    ctx.fillStyle = '#009E49'
    ctx.fillRect(thirdWidth * 2, flagY, thirdWidth + 1, 4)

    // --- Invitation ---
    ctx.fillStyle = '#555555'
    ctx.font = '11px "DM Sans", sans-serif'
    ctx.fillText('Fais mieux si tu peux !  \u{1F60F}', 40, 360)

    return canvas
  }

  /**
   * Génère et retourne le blob PNG de la carte
   */
  function generateBlob(params) {
    return new Promise((resolve) => {
      const canvas = generateCard(params)
      canvas.toBlob((blob) => resolve(blob), 'image/png')
    })
  }

  /**
   * Génère et retourne l'URL data de la carte
   */
  function generateDataUrl(params) {
    const canvas = generateCard(params)
    return canvas.toDataURL('image/png')
  }

  return { generateCard, generateBlob, generateDataUrl }
}
