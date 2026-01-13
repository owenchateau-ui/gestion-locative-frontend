import { useEffect, useRef } from 'react'
import { AlertTriangle, Trash2, X } from 'lucide-react'
import Button from './Button'
import { STAT_ICON_STYLES } from '../../constants/designSystem'

/**
 * ConfirmModal - Modale de confirmation pour remplacer confirm() natif
 *
 * @param {boolean} isOpen - Controle l'affichage de la modale
 * @param {function} onClose - Callback de fermeture
 * @param {function} onConfirm - Callback de confirmation
 * @param {string} title - Titre de la modale
 * @param {string} message - Message de confirmation
 * @param {string} confirmLabel - Texte du bouton de confirmation (defaut: "Confirmer")
 * @param {string} cancelLabel - Texte du bouton d'annulation (defaut: "Annuler")
 * @param {string} variant - Variant visuel: "danger" | "warning" | "info" (defaut: "danger")
 * @param {boolean} loading - Etat de chargement du bouton confirmer
 */
function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmation',
  message = 'Etes-vous sur de vouloir continuer ?',
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'danger',
  loading = false
}) {
  const modalRef = useRef(null)
  const confirmButtonRef = useRef(null)

  // Focus le bouton confirmer a l'ouverture
  useEffect(() => {
    if (isOpen && confirmButtonRef.current) {
      confirmButtonRef.current.focus()
    }
  }, [isOpen])

  // Gestion de la touche Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Empecher le scroll du body quand la modale est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  // Bold Geometric TYPE 1 - gradient 15% opacity + colored icon
  const variantStyles = {
    danger: {
      icon: <Trash2 className={`w-6 h-6 ${STAT_ICON_STYLES.coral.icon}`} />,
      iconBg: STAT_ICON_STYLES.coral.container,
      buttonVariant: 'danger'
    },
    warning: {
      icon: <AlertTriangle className={`w-6 h-6 ${STAT_ICON_STYLES.amber.icon}`} />,
      iconBg: STAT_ICON_STYLES.amber.container,
      buttonVariant: 'warning'
    },
    info: {
      icon: <AlertTriangle className={`w-6 h-6 ${STAT_ICON_STYLES.blue.icon}`} />,
      iconBg: STAT_ICON_STYLES.blue.container,
      buttonVariant: 'primary'
    }
  }

  const currentVariant = variantStyles[variant] || variantStyles.danger

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-description"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-[var(--surface)] rounded-2xl shadow-2xl border border-[var(--border)] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-4 p-6 pb-4">
          {/* Icone */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-full ${currentVariant.iconBg} flex items-center justify-center`}>
            {currentVariant.icon}
          </div>

          {/* Contenu */}
          <div className="flex-1 min-w-0">
            <h3
              id="confirm-modal-title"
              className="text-lg font-semibold font-display text-[var(--text)]"
            >
              {title}
            </h3>
            <p
              id="confirm-modal-description"
              className="mt-2 text-sm text-[var(--text-secondary)]"
            >
              {message}
            </p>
          </div>

          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 text-[var(--text-muted)] hover:text-[var(--text)] rounded-xl hover:bg-[var(--surface-elevated)] transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Footer avec boutons */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-[var(--surface-elevated)] rounded-b-2xl">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            ref={confirmButtonRef}
            variant={currentVariant.buttonVariant}
            onClick={handleConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
