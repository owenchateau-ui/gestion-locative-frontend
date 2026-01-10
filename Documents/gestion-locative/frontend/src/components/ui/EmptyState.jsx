import Button from './Button'

/**
 * Composant EmptyState pour afficher un état vide avec action
 * @param {string} icon - Composant icône Lucide (optionnel)
 * @param {string} title - Titre de l'état vide
 * @param {string} description - Description de l'état vide
 * @param {string} actionLabel - Label du bouton d'action (optionnel)
 * @param {function} onAction - Callback du bouton d'action (optionnel)
 * @param {string} variant - Variante visuelle: default, search, error
 */
function EmptyState({
  icon: Icon,
  title = 'Aucun élément',
  description = '',
  actionLabel,
  onAction,
  variant = 'default',
  className = ''
}) {
  const variantStyles = {
    default: {
      iconBg: 'bg-[var(--surface-elevated)]',
      iconColor: 'text-[var(--text-muted)]'
    },
    search: {
      iconBg: 'bg-[var(--color-electric-blue)]/10',
      iconColor: 'text-[var(--color-electric-blue)]'
    },
    error: {
      iconBg: 'bg-red-50 dark:bg-red-900/20',
      iconColor: 'text-red-500 dark:text-red-400'
    }
  }

  const styles = variantStyles[variant] || variantStyles.default

  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      {Icon && (
        <div className={`mx-auto w-16 h-16 ${styles.iconBg} rounded-full flex items-center justify-center mb-4`}>
          <Icon className={`w-8 h-8 ${styles.iconColor}`} />
        </div>
      )}

      <h3 className="text-lg font-semibold font-display text-[var(--text)] mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export default EmptyState
