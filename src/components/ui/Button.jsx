import { memo } from 'react'
import PropTypes from 'prop-types'

// Styles de base Bold Geometric
const BASE_STYLES = `
  inline-flex items-center justify-center
  font-display font-semibold
  rounded-xl
  transition-all duration-200 ease-out
  focus:outline-none focus:ring-2 focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
  active:scale-[0.98]
`

// Variants avec gradients et glow effects
const VARIANTS = {
  primary: `
    bg-gradient-to-r from-[var(--color-electric-blue)] to-[#0066FF]
    text-white
    hover:shadow-glow-blue hover:brightness-110
    focus:ring-[var(--color-electric-blue)]
  `,
  secondary: `
    bg-[var(--surface-elevated)]
    text-[var(--text)]
    border border-[var(--border)]
    hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)]
    focus:ring-[var(--text-muted)]
  `,
  danger: `
    bg-gradient-to-r from-[var(--color-vivid-coral)] to-[#FF8066]
    text-white
    hover:shadow-glow-coral hover:brightness-110
    focus:ring-[var(--color-vivid-coral)]
  `,
  success: `
    bg-gradient-to-r from-emerald-500 to-emerald-400
    text-white
    hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:brightness-110
    focus:ring-emerald-500
  `,
  outline: `
    border-2 border-[var(--color-electric-blue)]
    text-[var(--color-electric-blue)]
    bg-transparent
    hover:bg-[var(--color-electric-blue)] hover:text-white hover:shadow-glow-blue
    focus:ring-[var(--color-electric-blue)]
  `,
  ghost: `
    text-[var(--text-secondary)]
    bg-transparent
    hover:bg-[var(--surface-hover)] hover:text-[var(--text)]
    focus:ring-[var(--text-muted)]
  `,
  lime: `
    bg-[var(--color-lime)]
    text-[#0A0A0F]
    hover:shadow-glow-lime hover:brightness-110
    focus:ring-[var(--color-lime)]
  `,
  purple: `
    bg-gradient-to-r from-[var(--color-purple)] to-[#A78BFA]
    text-white
    hover:shadow-glow-purple hover:brightness-110
    focus:ring-[var(--color-purple)]
  `
}

const SIZES = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-7 py-3.5 text-base gap-2.5'
}

// Spinner SVG animé
const Spinner = memo(function Spinner({ size = 'md' }) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
})

const Button = memo(function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  icon,
  iconPosition = 'left',
  ...props
}) {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`${BASE_STYLES} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && <Spinner size={size} />}
      {!loading && icon && iconPosition === 'left' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
    </button>
  )
})

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success', 'outline', 'ghost', 'lime', 'purple']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right'])
}

export default Button
