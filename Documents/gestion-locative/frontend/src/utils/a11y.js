/**
 * Utilitaires pour l'accessibilité (A11Y)
 */

/**
 * Annonce un message aux lecteurs d'écran
 * Crée un élément live region pour les annonces ARIA
 *
 * @param {string} message - Le message à annoncer
 * @param {string} priority - 'polite' ou 'assertive'
 */
export function announceToScreenReader(message, priority = 'polite') {
  const liveRegion = document.getElementById('a11y-announcer') || createLiveRegion()
  liveRegion.setAttribute('aria-live', priority)
  liveRegion.textContent = message

  // Nettoyer après 1 seconde
  setTimeout(() => {
    liveRegion.textContent = ''
  }, 1000)
}

/**
 * Crée un live region pour les annonces ARIA
 */
function createLiveRegion() {
  const region = document.createElement('div')
  region.id = 'a11y-announcer'
  region.setAttribute('role', 'status')
  region.setAttribute('aria-live', 'polite')
  region.setAttribute('aria-atomic', 'true')
  region.className = 'sr-only' // Classe CSS pour cacher visuellement

  // Ajouter les styles pour lecteurs d'écran uniquement
  region.style.position = 'absolute'
  region.style.left = '-10000px'
  region.style.width = '1px'
  region.style.height = '1px'
  region.style.overflow = 'hidden'

  document.body.appendChild(region)
  return region
}

/**
 * Génère un ID unique pour aria-describedby
 */
export function generateAriaId(prefix = 'aria') {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Vérifie si l'élément est visible pour les technologies d'assistance
 */
export function isAccessible(element) {
  if (!element) return false

  const style = window.getComputedStyle(element)
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    element.getAttribute('aria-hidden') !== 'true'
  )
}

/**
 * Trouve le premier élément focusable dans un conteneur
 */
export function getFirstFocusableElement(container) {
  const focusableElements = container.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )
  return focusableElements[0]
}

/**
 * Restaure le focus sur l'élément précédent
 */
export function restoreFocus(previousElement) {
  if (previousElement && typeof previousElement.focus === 'function') {
    previousElement.focus()
  }
}

export default {
  announceToScreenReader,
  generateAriaId,
  isAccessible,
  getFirstFocusableElement,
  restoreFocus
}
