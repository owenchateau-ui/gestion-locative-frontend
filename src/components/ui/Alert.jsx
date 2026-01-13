import { memo } from 'react'
import PropTypes from 'prop-types'

// Bold Geometric variants
const VARIANTS = {
  info: {
    container: 'bg-[var(--color-electric-blue)]/5 border-[var(--color-electric-blue)]/30',
    iconBg: 'bg-[var(--color-electric-blue)]/10',
    icon: 'text-[var(--color-electric-blue)]',
    title: 'text-[var(--text)]',
    text: 'text-[var(--text-secondary)]'
  },
  success: {
    container: 'bg-emerald-500/5 border-emerald-500/30',
    iconBg: 'bg-emerald-500/10',
    icon: 'text-emerald-600 dark:text-emerald-400',
    title: 'text-[var(--text)]',
    text: 'text-[var(--text-secondary)]'
  },
  warning: {
    container: 'bg-amber-500/5 border-amber-500/30',
    iconBg: 'bg-amber-500/10',
    icon: 'text-amber-600 dark:text-amber-400',
    title: 'text-[var(--text)]',
    text: 'text-[var(--text-secondary)]'
  },
  error: {
    container: 'bg-[var(--color-vivid-coral)]/5 border-[var(--color-vivid-coral)]/30',
    iconBg: 'bg-[var(--color-vivid-coral)]/10',
    icon: 'text-[var(--color-vivid-coral)]',
    title: 'text-[var(--text)]',
    text: 'text-[var(--text-secondary)]'
  }
}

const ICONS = {
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  success: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

const Alert = memo(function Alert({
  children,
  variant = 'info',
  title,
  onClose,
  className = '',
  actions
}) {
  const styles = VARIANTS[variant]

  return (
    <div
      className={`
        border rounded-xl p-4
        ${styles.container}
        ${className}
      `}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 p-2 rounded-lg ${styles.iconBg}`}>
          <span className={styles.icon}>
            {ICONS[variant]}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={`text-sm font-semibold font-display ${styles.title}`}>
              {title}
            </h3>
          )}
          <div className={`${title ? 'mt-1' : ''} text-sm ${styles.text}`}>
            {children}
          </div>
          {actions && (
            <div className="mt-3 flex gap-2">
              {actions}
            </div>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`
              flex-shrink-0 p-1 rounded-lg
              transition-colors
              hover:bg-[var(--surface-hover)]
              ${styles.icon}
            `}
            aria-label="Fermer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
})

Alert.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  title: PropTypes.string,
  onClose: PropTypes.func,
  className: PropTypes.string,
  actions: PropTypes.node
}

export default Alert
