import { useEffect, useRef } from 'react'

/**
 * Hook pour piéger le focus dans un élément (utile pour les modales)
 * Améliore l'accessibilité en gardant le focus dans la modale
 *
 * @param {boolean} isActive - Si le piège de focus est actif
 * @returns {React.RefObject} - Référence à l'élément conteneur
 *
 * @example
 * const modalRef = useFocusTrap(isModalOpen)
 * return <div ref={modalRef}>...</div>
 */
export function useFocusTrap(isActive = true) {
  const ref = useRef(null)

  useEffect(() => {
    if (!isActive || !ref.current) return

    const element = ref.current
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // Focus le premier élément au montage
    firstElement?.focus()

    function handleTabKey(e) {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          lastElement?.focus()
          e.preventDefault()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          firstElement?.focus()
          e.preventDefault()
        }
      }
    }

    element.addEventListener('keydown', handleTabKey)

    return () => {
      element.removeEventListener('keydown', handleTabKey)
    }
  }, [isActive])

  return ref
}

export default useFocusTrap
