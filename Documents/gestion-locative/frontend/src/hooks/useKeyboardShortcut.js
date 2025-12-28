import { useEffect } from 'react'

/**
 * Hook pour gérer les raccourcis clavier
 * Améliore l'accessibilité et l'UX
 *
 * @param {string} key - La touche (ex: 'Escape', 'Enter')
 * @param {Function} callback - Fonction à exécuter
 * @param {Object} options - Options (ctrl, alt, shift, enabled)
 *
 * @example
 * useKeyboardShortcut('Escape', () => closeModal())
 * useKeyboardShortcut('s', () => save(), { ctrl: true })
 */
export function useKeyboardShortcut(
  key,
  callback,
  options = {}
) {
  const {
    ctrl = false,
    alt = false,
    shift = false,
    enabled = true
  } = options

  useEffect(() => {
    if (!enabled) return

    function handleKeyDown(event) {
      const keyMatch = event.key.toLowerCase() === key.toLowerCase()
      const ctrlMatch = ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey
      const altMatch = alt ? event.altKey : !event.altKey
      const shiftMatch = shift ? event.shiftKey : !event.shiftKey

      if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
        event.preventDefault()
        callback(event)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [key, callback, ctrl, alt, shift, enabled])
}

export default useKeyboardShortcut
