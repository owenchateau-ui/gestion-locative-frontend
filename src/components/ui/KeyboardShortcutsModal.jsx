import { useEffect } from 'react'
import { X, Command, ArrowUp } from 'lucide-react'

/**
 * KeyboardShortcutsModal - Modal affichant tous les raccourcis clavier disponibles
 *
 * Affiche les raccourcis organisés par catégorie :
 * - Navigation globale (G+lettre)
 * - Actions rapides (N+lettre)
 * - Interface (mode sombre, palette)
 */

const SHORTCUT_CATEGORIES = [
  {
    title: 'Navigation globale',
    description: 'Appuyez sur G puis une lettre',
    shortcuts: [
      { keys: ['G', 'D'], label: 'Tableau de bord' },
      { keys: ['G', 'E'], label: 'Entités' },
      { keys: ['G', 'P'], label: 'Propriétés' },
      { keys: ['G', 'L'], label: 'Lots' },
      { keys: ['G', 'T'], label: 'Locataires' },
      { keys: ['G', 'B'], label: 'Baux' },
      { keys: ['G', 'F'], label: 'Paiements (Finances)' },
      { keys: ['G', 'I'], label: 'Indexation IRL' },
      { keys: ['G', 'C'], label: 'Candidatures' },
    ]
  },
  {
    title: 'Actions rapides',
    description: 'Appuyez sur N puis une lettre',
    shortcuts: [
      { keys: ['N', 'E'], label: 'Nouvelle entité' },
      { keys: ['N', 'P'], label: 'Nouvelle propriété' },
      { keys: ['N', 'L'], label: 'Nouveau lot' },
      { keys: ['N', 'T'], label: 'Nouveau locataire' },
      { keys: ['N', 'B'], label: 'Nouveau bail' },
      { keys: ['N', 'F'], label: 'Nouveau paiement' },
    ]
  },
  {
    title: 'Interface',
    description: 'Raccourcis de l\'interface',
    shortcuts: [
      { keys: ['⌘/Ctrl', 'K'], label: 'Ouvrir la palette de commandes' },
      { keys: ['Shift', 'D'], label: 'Basculer mode sombre/clair' },
      { keys: ['?'], label: 'Afficher cette aide' },
      { keys: ['Escape'], label: 'Fermer modal/palette' },
    ]
  },
  {
    title: 'Formulaires',
    description: 'Dans les formulaires',
    shortcuts: [
      { keys: ['Tab'], label: 'Champ suivant' },
      { keys: ['Shift', 'Tab'], label: 'Champ précédent' },
      { keys: ['Enter'], label: 'Soumettre (si bouton focus)' },
    ]
  }
]

function KeyboardShortcutsModal({ isOpen, onClose }) {
  // Fermer avec Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Empêcher le scroll du body quand modal ouverte
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[var(--surface)] rounded-2xl shadow-2xl border border-[var(--border)] w-full max-w-2xl max-h-[85vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--color-electric-blue)]/10 rounded-xl">
              <Command className="w-5 h-5 text-[var(--color-electric-blue)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold font-display text-[var(--text)]">
                Raccourcis clavier
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                Naviguez plus rapidement avec le clavier
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-elevated)] rounded-xl transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
          <div className="grid gap-6 md:grid-cols-2">
            {SHORTCUT_CATEGORIES.map((category, idx) => (
              <div
                key={idx}
                className="bg-[var(--surface-elevated)] rounded-xl p-4"
              >
                <h3 className="font-semibold font-display text-[var(--text)] mb-1">
                  {category.title}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mb-3">
                  {category.description}
                </p>

                <div className="space-y-2">
                  {category.shortcuts.map((shortcut, shortcutIdx) => (
                    <div
                      key={shortcutIdx}
                      className="flex items-center justify-between py-1.5"
                    >
                      <span className="text-sm text-[var(--text-secondary)]">
                        {shortcut.label}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIdx) => (
                          <span key={keyIdx} className="flex items-center">
                            {keyIdx > 0 && (
                              <span className="text-[var(--text-muted)] mx-0.5 text-xs">
                                +
                              </span>
                            )}
                            <kbd className="px-2 py-1 text-xs font-medium text-[var(--text-secondary)] bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-sm min-w-[24px] text-center">
                              {key}
                            </kbd>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Tip */}
          <div className="mt-6 p-4 bg-[var(--color-electric-blue)]/10 border border-[var(--color-electric-blue)]/30 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-[var(--color-electric-blue)]/20 rounded-lg">
                <ArrowUp className="w-4 h-4 text-[var(--color-electric-blue)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-electric-blue)]">
                  Astuce Pro
                </p>
                <p className="text-sm text-[var(--color-electric-blue)]/80 mt-1">
                  Utilisez <kbd className="px-1.5 py-0.5 bg-[var(--color-electric-blue)]/20 rounded-lg text-xs mx-1">⌘/Ctrl + K</kbd>
                  pour accéder à la palette de commandes et rechercher rapidement n'importe quelle action.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[var(--surface-elevated)] border-t border-[var(--border)]">
          <p className="text-xs text-center text-[var(--text-muted)]">
            Appuyez sur <kbd className="px-1.5 py-0.5 bg-[var(--border)] rounded-lg text-xs mx-1">Escape</kbd> pour fermer
          </p>
        </div>
      </div>
    </div>
  )
}

export default KeyboardShortcutsModal
