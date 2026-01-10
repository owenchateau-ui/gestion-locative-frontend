import { memo } from 'react'
import { Eye, Edit2, Trash2, MoreHorizontal, FileText, Download } from 'lucide-react'
import Dropdown from './Dropdown'

/**
 * ActionButtons - Groupe de boutons d'actions standardise pour les tableaux
 *
 * @param {function} onView - Callback pour l'action "Voir"
 * @param {function} onEdit - Callback pour l'action "Modifier"
 * @param {function} onDelete - Callback pour l'action "Supprimer"
 * @param {function} onDownload - Callback optionnel pour l'action "Telecharger"
 * @param {function} onGeneratePdf - Callback optionnel pour generer un PDF
 * @param {string} viewLabel - Label personnalise pour "Voir" (defaut: "Voir")
 * @param {string} editLabel - Label personnalise pour "Modifier" (defaut: "Modifier")
 * @param {string} deleteLabel - Label personnalise pour "Supprimer" (defaut: "Supprimer")
 * @param {boolean} showView - Afficher le bouton Voir (defaut: true)
 * @param {boolean} showEdit - Afficher le bouton Modifier (defaut: true)
 * @param {boolean} showDelete - Afficher le bouton Supprimer (defaut: true)
 * @param {string} size - Taille des boutons: "sm" | "md" (defaut: "sm")
 * @param {string} layout - Layout: "inline" | "dropdown" (defaut: "inline")
 */
const ActionButtons = memo(function ActionButtons({
  onView,
  onEdit,
  onDelete,
  onDownload,
  onGeneratePdf,
  viewLabel = 'Voir',
  editLabel = 'Modifier',
  deleteLabel = 'Supprimer',
  downloadLabel = 'Telecharger',
  pdfLabel = 'PDF',
  showView = true,
  showEdit = true,
  showDelete = true,
  size = 'sm',
  layout = 'inline',
  loading = false
}) {
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5'
  }

  const baseButtonClass = `
    inline-flex items-center justify-center rounded-xl
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-1
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  const buttonVariants = {
    view: 'text-[var(--color-purple)] hover:bg-[var(--color-purple)]/10 focus:ring-[var(--color-purple)]',
    edit: 'text-[var(--color-electric-blue)] hover:bg-[var(--color-electric-blue)]/10 focus:ring-[var(--color-electric-blue)]',
    delete: 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:ring-red-500',
    download: 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 focus:ring-emerald-500',
    pdf: 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 focus:ring-amber-500'
  }

  // Layout dropdown pour ecrans mobiles ou si demande
  if (layout === 'dropdown') {
    const items = []

    if (showView && onView) {
      items.push({
        label: viewLabel,
        icon: <Eye className={iconSizes[size]} />,
        onClick: onView
      })
    }

    if (showEdit && onEdit) {
      items.push({
        label: editLabel,
        icon: <Edit2 className={iconSizes[size]} />,
        onClick: onEdit
      })
    }

    if (onDownload) {
      items.push({
        label: downloadLabel,
        icon: <Download className={iconSizes[size]} />,
        onClick: onDownload
      })
    }

    if (onGeneratePdf) {
      items.push({
        label: pdfLabel,
        icon: <FileText className={iconSizes[size]} />,
        onClick: onGeneratePdf
      })
    }

    if (showDelete && onDelete) {
      items.push({ divider: true })
      items.push({
        label: deleteLabel,
        icon: <Trash2 className={iconSizes[size]} />,
        onClick: onDelete,
        danger: true
      })
    }

    return (
      <Dropdown
        trigger={
          <button
            className={`${baseButtonClass} ${sizeClasses[size]} text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)]`}
            aria-label="Actions"
          >
            <MoreHorizontal className={iconSizes[size]} />
          </button>
        }
        items={items}
        align="right"
      />
    )
  }

  // Layout inline (defaut)
  return (
    <div className="flex items-center gap-1">
      {showView && onView && (
        <button
          onClick={onView}
          className={`${baseButtonClass} ${sizeClasses[size]} ${buttonVariants.view}`}
          aria-label={viewLabel}
          title={viewLabel}
        >
          <Eye className={iconSizes[size]} />
          <span className="sr-only">{viewLabel}</span>
        </button>
      )}

      {showEdit && onEdit && (
        <button
          onClick={onEdit}
          className={`${baseButtonClass} ${sizeClasses[size]} ${buttonVariants.edit}`}
          aria-label={editLabel}
          title={editLabel}
        >
          <Edit2 className={iconSizes[size]} />
          <span className="sr-only">{editLabel}</span>
        </button>
      )}

      {onDownload && (
        <button
          onClick={onDownload}
          className={`${baseButtonClass} ${sizeClasses[size]} ${buttonVariants.download}`}
          aria-label={downloadLabel}
          title={downloadLabel}
        >
          <Download className={iconSizes[size]} />
          <span className="sr-only">{downloadLabel}</span>
        </button>
      )}

      {onGeneratePdf && (
        <button
          onClick={onGeneratePdf}
          disabled={loading}
          className={`${baseButtonClass} ${sizeClasses[size]} ${buttonVariants.pdf}`}
          aria-label={pdfLabel}
          title={pdfLabel}
        >
          <FileText className={iconSizes[size]} />
          <span className="sr-only">{pdfLabel}</span>
        </button>
      )}

      {showDelete && onDelete && (
        <button
          onClick={onDelete}
          className={`${baseButtonClass} ${sizeClasses[size]} ${buttonVariants.delete}`}
          aria-label={deleteLabel}
          title={deleteLabel}
        >
          <Trash2 className={iconSizes[size]} />
          <span className="sr-only">{deleteLabel}</span>
        </button>
      )}
    </div>
  )
})

export default ActionButtons
