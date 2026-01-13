/**
 * Export centralisé des hooks personnalisés
 *
 * Usage:
 * import { useUserEntities, useDocumentTitle, useFocusTrap } from '../hooks'
 */

// Hooks de données
export { useUserEntities } from './useUserEntities'
export { useEntityFilter } from './useEntityFilter'
export { useSidebarBadges } from './useSidebarBadges'
export { useSupabaseUser } from './useSupabaseUser'

// Hooks d'UX
export { useDocumentTitle } from './useDocumentTitle'
export { useFocusTrap } from './useFocusTrap'
export { useKeyboardShortcut } from './useKeyboardShortcut'
