import { memo } from 'react'
import PropTypes from 'prop-types'

const VARIANTS = {
  default: `
    bg-[var(--surface)]
    border border-[var(--border)]
    shadow-card
  `,
  elevated: `
    bg-[var(--surface-elevated)]
    border border-[var(--border)]
    shadow-card-hover
  `,
  glass: `
    bg-[var(--surface)]/80
    backdrop-blur-xl
    border border-[var(--border)]
    shadow-card
  `,
  gradient: `
    bg-gradient-to-br from-[var(--surface)] to-[var(--surface-elevated)]
    border border-[var(--border)]
    shadow-card
  `,
  accent: `
    bg-[var(--surface)]
    border-l-4 border-l-[var(--color-electric-blue)] border border-[var(--border)]
    shadow-card
  `
}

const Card = memo(function Card({
  children,
  title,
  subtitle,
  footer,
  className = '',
  padding = true,
  variant = 'default',
  headerAction,
  hover = true
}) {
  const paddingClass = padding ? 'px-6 py-5' : ''
  const footerPaddingClass = padding ? 'px-6 py-4' : ''
  const hoverClass = hover ? 'transition-all duration-200 hover:shadow-card-hover hover:border-[var(--border-strong)] hover:-translate-y-0.5' : ''

  return (
    <div className={`rounded-2xl overflow-hidden ${VARIANTS[variant]} ${hoverClass} ${className}`}>
      {title && (
        <div className={`border-b border-[var(--border)] ${paddingClass}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-display font-semibold text-[var(--text)]">{title}</h3>
              {subtitle && <p className="mt-1 text-sm text-[var(--text-secondary)]">{subtitle}</p>}
            </div>
            {headerAction && (
              <div className="ml-4 flex-shrink-0">
                {headerAction}
              </div>
            )}
          </div>
        </div>
      )}

      <div className={paddingClass}>
        {children}
      </div>

      {footer && (
        <div className={`border-t border-[var(--border)] bg-[var(--surface-elevated)] ${footerPaddingClass}`}>
          {footer}
        </div>
      )}
    </div>
  )
})

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  footer: PropTypes.node,
  className: PropTypes.string,
  padding: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'elevated', 'glass', 'gradient', 'accent']),
  headerAction: PropTypes.node,
  hover: PropTypes.bool
}

export default Card
