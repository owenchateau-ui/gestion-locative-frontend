import { memo, useMemo } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

// Bold Geometric variants avec gradients et glow
const VARIANTS = {
  blue: {
    bg: 'bg-[var(--color-electric-blue)]/5 hover:bg-[var(--color-electric-blue)]/10',
    border: 'border border-[var(--color-electric-blue)]/20',
    icon: 'bg-gradient-to-br from-[var(--color-electric-blue)] to-[#0066FF] text-white shadow-glow-blue',
    value: 'text-[var(--color-electric-blue)]',
    title: 'text-[var(--text-secondary)]'
  },
  emerald: {
    bg: 'bg-emerald-500/5 hover:bg-emerald-500/10',
    border: 'border border-emerald-500/20',
    icon: 'bg-gradient-to-br from-emerald-500 to-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]',
    value: 'text-emerald-600 dark:text-emerald-400',
    title: 'text-[var(--text-secondary)]'
  },
  purple: {
    bg: 'bg-[var(--color-purple)]/5 hover:bg-[var(--color-purple)]/10',
    border: 'border border-[var(--color-purple)]/20',
    icon: 'bg-gradient-to-br from-[var(--color-purple)] to-[#A78BFA] text-white shadow-glow-purple',
    value: 'text-[var(--color-purple)]',
    title: 'text-[var(--text-secondary)]'
  },
  amber: {
    bg: 'bg-amber-500/5 hover:bg-amber-500/10',
    border: 'border border-amber-500/20',
    icon: 'bg-gradient-to-br from-amber-500 to-amber-400 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)]',
    value: 'text-amber-600 dark:text-amber-400',
    title: 'text-[var(--text-secondary)]'
  },
  coral: {
    bg: 'bg-[var(--color-vivid-coral)]/5 hover:bg-[var(--color-vivid-coral)]/10',
    border: 'border border-[var(--color-vivid-coral)]/20',
    icon: 'bg-gradient-to-br from-[var(--color-vivid-coral)] to-[#FF8066] text-white shadow-glow-coral',
    value: 'text-[var(--color-vivid-coral)]',
    title: 'text-[var(--text-secondary)]'
  },
  lime: {
    bg: 'bg-[var(--color-lime)]/5 hover:bg-[var(--color-lime)]/10',
    border: 'border border-[var(--color-lime)]/30',
    icon: 'bg-gradient-to-br from-[var(--color-lime)] to-[#D4F85A] text-[#0A0A0F] shadow-glow-lime',
    value: 'text-[#7A9A00] dark:text-[var(--color-lime)]',
    title: 'text-[var(--text-secondary)]'
  },
  // Legacy support
  red: {
    bg: 'bg-[var(--color-vivid-coral)]/5 hover:bg-[var(--color-vivid-coral)]/10',
    border: 'border border-[var(--color-vivid-coral)]/20',
    icon: 'bg-gradient-to-br from-[var(--color-vivid-coral)] to-[#FF8066] text-white shadow-glow-coral',
    value: 'text-[var(--color-vivid-coral)]',
    title: 'text-[var(--text-secondary)]'
  },
  indigo: {
    bg: 'bg-[var(--color-electric-blue)]/5 hover:bg-[var(--color-electric-blue)]/10',
    border: 'border border-[var(--color-electric-blue)]/20',
    icon: 'bg-gradient-to-br from-[var(--color-electric-blue)] to-[#0066FF] text-white shadow-glow-blue',
    value: 'text-[var(--color-electric-blue)]',
    title: 'text-[var(--text-secondary)]'
  }
}

const StatCard = memo(function StatCard({
  title,
  value,
  subtitle,
  icon,
  variant = 'blue',
  trend,
  trendValue,
  href,
  className = ''
}) {
  const colors = useMemo(() => VARIANTS[variant] || VARIANTS.blue, [variant])

  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium font-display ${colors.title}`}>
            {title}
          </p>
          <p className={`mt-2 text-3xl font-bold font-display tracking-tight ${colors.value}`}>
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-xl flex-shrink-0 ${colors.icon}`}>
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center gap-2">
          <span className={`
            inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
            ${trend === 'up'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-[var(--color-vivid-coral)]/10 text-[var(--color-vivid-coral)]'
            }
          `}>
            {trend === 'up' ? (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
            {trendValue}
          </span>
          <span className="text-xs text-[var(--text-muted)]">vs mois dernier</span>
        </div>
      )}
    </>
  )

  const baseClasses = `
    p-6 rounded-2xl
    transition-all duration-200
    ${colors.bg}
    ${colors.border}
    ${className}
  `

  if (href) {
    return (
      <Link
        to={href}
        className={`block ${baseClasses} hover:-translate-y-0.5 hover:shadow-card`}
      >
        {content}
      </Link>
    )
  }

  return (
    <div className={`${baseClasses} hover:-translate-y-0.5 hover:shadow-card cursor-default`}>
      {content}
    </div>
  )
})

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.node,
  variant: PropTypes.oneOf(['blue', 'emerald', 'purple', 'amber', 'coral', 'lime', 'red', 'indigo']),
  trend: PropTypes.oneOf(['up', 'down']),
  trendValue: PropTypes.string,
  href: PropTypes.string,
  className: PropTypes.string
}

export default StatCard
