import { useEffect } from 'react'

/**
 * Hook pour mettre à jour le titre du document (tab browser)
 * Améliore l'accessibilité et l'UX
 *
 * @param {string} title - Le titre de la page
 * @param {string} suffix - Suffixe optionnel (par défaut: "Gestion Locative")
 *
 * @example
 * useDocumentTitle('Dashboard')
 * // Résultat: "Dashboard | Gestion Locative"
 */
export function useDocumentTitle(title, suffix = 'Gestion Locative') {
  useEffect(() => {
    const previousTitle = document.title

    if (title) {
      document.title = `${title} | ${suffix}`
    } else {
      document.title = suffix
    }

    // Cleanup: restaurer le titre précédent lors du démontage
    return () => {
      document.title = previousTitle
    }
  }, [title, suffix])
}

export default useDocumentTitle
