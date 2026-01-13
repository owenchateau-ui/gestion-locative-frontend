import { memo } from 'react'
import PropTypes from 'prop-types'

// Bold Geometric variants avec couleurs vibrantes
const VARIANTS = {
  default: `
    bg-[var(--surface-elevated)]
    text-[var(--text-secondary)]
    border border-[var(--border)]
  `,
  success: `
    bg-emerald-500/10
    text-emerald-600
    dark:text-emerald-400
    border border-emerald-500/20
  `,
  warning: `
    bg-amber-500/10
    text-amber-600
    dark:text-amber-400
    border border-amber-500/20
  `,
  danger: `
    bg-[var(--color-vivid-coral)]/10
    text-[var(--color-vivid-coral)]
    border border-[var(--color-vivid-coral)]/20
  `,
  info: `
    bg-[var(--color-electric-blue)]/10
    text-[var(--color-electric-blue)]
    border border-[var(--color-electric-blue)]/20
  `,
  purple: `
    bg-[var(--color-purple)]/10
    text-[var(--color-purple)]
    border border-[var(--color-purple)]/20
  `,
  lime: `
    bg-[var(--color-lime)]/10
    text-[#7A9A00]
    dark:text-[var(--color-lime)]
    border border-[var(--color-lime)]/30
  `
}

// Variants avec couleurs pleines
const SOLID_VARIANTS = {
  default: `
    bg-[var(--text-muted)]
    text-white
  `,
  success: `
    bg-emerald-500
    text-white
  `,
  warning: `
    bg-amber-500
    text-white
  `,
  danger: `
    bg-[var(--color-vivid-coral)]
    text-white
  `,
  info: `
    bg-[var(--color-electric-blue)]
    text-white
  `,
  purple: `
    bg-[var(--color-purple)]
    text-white
  `,
  lime: `
    bg-[var(--color-lime)]
    text-[#0A0A0F]
  `
}

const DOT_COLORS = {
  default: 'bg-[var(--text-muted)]',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-[var(--color-vivid-coral)]',
  info: 'bg-[var(--color-electric-blue)]',
  purple: 'bg-[var(--color-purple)]',
  lime: 'bg-[var(--color-lime)]'
}

const SIZES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm'
}

const Badge = memo(function Badge({
  children,
  variant = 'default',
  className = '',
  size = 'md',
  solid = false,
  dot = false,
  removable = false,
  onRemove
}) {
  const variantStyles = solid ? SOLID_VARIANTS[variant] : VARIANTS[variant]

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        rounded-full
        font-medium font-display
        transition-colors
        ${variantStyles}
        ${SIZES[size]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${DOT_COLORS[variant]} ${solid ? 'bg-white/80' : ''}`} />
      )}
      {children}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 -mr-1 p-0.5 rounded-full hover:bg-black/10 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  )
})

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'success', 'warning', 'danger', 'info', 'purple', 'lime']),
  className: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  solid: PropTypes.bool,
  dot: PropTypes.bool,
  removable: PropTypes.bool,
  onRemove: PropTypes.func
}

export default Badge
