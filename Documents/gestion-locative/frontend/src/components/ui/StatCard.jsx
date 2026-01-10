import { memo, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { MoreVertical } from 'lucide-react'

// Bold Geometric variants - Style carte blanche avec icône colorée
const VARIANTS = {
  blue: {
    icon: 'bg-gradient-to-br from-[#0055FF] to-[#0066FF] text-white shadow-[0_0_20px_rgba(0,85,255,0.3)]',
    trendPositive: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    trendNegative: 'bg-[#FF6B4A]/10 text-[#FF6B4A]'
  },
  emerald: {
    icon: 'bg-gradient-to-br from-emerald-500 to-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]',
    trendPositive: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    trendNegative: 'bg-[#FF6B4A]/10 text-[#FF6B4A]'
  },
  purple: {
    icon: 'bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]',
    trendPositive: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    trendNegative: 'bg-[#FF6B4A]/10 text-[#FF6B4A]'
  },
  amber: {
    icon: 'bg-gradient-to-br from-amber-500 to-amber-400 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)]',
    trendPositive: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    trendNegative: 'bg-[#FF6B4A]/10 text-[#FF6B4A]'
  },
  coral: {
    icon: 'bg-gradient-to-br from-[#FF6B4A] to-[#FF8066] text-white shadow-[0_0_20px_rgba(255,107,74,0.3)]',
    trendPositive: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    trendNegative: 'bg-[#FF6B4A]/10 text-[#FF6B4A]'
  },
  lime: {
    icon: 'bg-gradient-to-br from-[#C6F135] to-[#D4F85A] text-[#0A0A0F] shadow-[0_0_20px_rgba(198,241,53,0.3)]',
    trendPositive: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    trendNegative: 'bg-[#FF6B4A]/10 text-[#FF6B4A]'
  },
  // Legacy support
  red: {
    icon: 'bg-gradient-to-br from-[#FF6B4A] to-[#FF8066] text-white shadow-[0_0_20px_rgba(255,107,74,0.3)]',
    trendPositive: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    trendNegative: 'bg-[#FF6B4A]/10 text-[#FF6B4A]'
  },
  indigo: {
    icon: 'bg-gradient-to-br from-[#0055FF] to-[#0066FF] text-white shadow-[0_0_20px_rgba(0,85,255,0.3)]',
    trendPositive: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    trendNegative: 'bg-[#FF6B4A]/10 text-[#FF6B4A]'
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
  showMenu = false,
  onMenuClick,
  className = ''
}) {
  const colors = useMemo(() => VARIANTS[variant] || VARIANTS.blue, [variant])

  const content = (
    <>
      {/* Header : Icône à gauche, Menu 3 points à droite */}
      <div className="flex items-start justify-between mb-4">
        {icon && (
          <div className={`p-3 rounded-xl ${colors.icon}`}>
            {icon}
          </div>
        )}
        {showMenu && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onMenuClick?.()
            }}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-elevated)] transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Label au-dessus de la valeur */}
      <div className="space-y-1">
        <p className="text-sm font-medium font-display text-[var(--text-secondary)]">
          {title}
        </p>
        <p className="text-3xl font-bold font-display tracking-tight text-[var(--text)]">
          {value}
        </p>
        {subtitle && (
          <p className="text-sm text-[var(--text-muted)]">
            {subtitle}
          </p>
        )}
      </div>

      {/* Trend badge en bas */}
      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <span className={`
            inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold
            ${trend === 'up' ? colors.trendPositive : colors.trendNegative}
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
          <span className="text-xs text-[var(--text-muted)]">vs mois précédent</span>
        </div>
      )}
    </>
  )

  const baseClasses = `
    p-6 rounded-2xl
    bg-[var(--surface)]
    border border-[var(--border)]
    shadow-card
    transition-all duration-200
    ${className}
  `

  if (href) {
    return (
      <Link
        to={href}
        className={`block ${baseClasses} hover:-translate-y-1 hover:shadow-card-hover`}
      >
        {content}
      </Link>
    )
  }

  return (
    <div className={`${baseClasses} hover:-translate-y-0.5 hover:shadow-card-hover`}>
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
  showMenu: PropTypes.bool,
  onMenuClick: PropTypes.func,
  className: PropTypes.string
}

export default StatCard
