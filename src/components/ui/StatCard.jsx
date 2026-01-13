import { memo, useMemo } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { MoreVertical } from 'lucide-react'
import { STAT_ICON_STYLES, TREND_STYLES } from '../../constants/designSystem'

// Bold Geometric variants - TYPE 1: Fond gradient 15% opacity + icône colorée
const VARIANTS = STAT_ICON_STYLES

// TREND_STYLES importé depuis designSystem.js

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

  // Determine trend type for styling
  const trendType = trend === 'up' ? 'up' : trend === 'down' ? 'down' : 'neutral'

  const content = (
    <div className="flex flex-col h-full">
      {/* Accent bar - visible on hover */}
      <div className={`
        absolute top-0 left-0 right-0 h-[3px]
        opacity-0 group-hover:opacity-100
        transition-opacity duration-200
        bg-gradient-to-r ${colors.accentGradient}
      `} />

      {/* Header : Icône + Menu - HAUTEUR FIXE 48px */}
      <div className="flex items-start justify-between h-[48px] flex-shrink-0">
        {icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.container} ${colors.icon}`}>
            {icon}
          </div>
        )}
        {/* Menu 3 points - toujours visible mais plus visible au hover */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onMenuClick?.()
          }}
          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-elevated)] transition-all duration-200 opacity-40 group-hover:opacity-100"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Content : Label + Value - FLEX GROW pour occupation centrale */}
      <div className="flex-1 flex flex-col justify-center mt-3">
        <p className="text-sm font-medium font-display text-[var(--text-secondary)] mb-1">
          {title}
        </p>
        <p className="text-3xl font-bold font-display tracking-tight text-[var(--text)]">
          {value}
        </p>
        {subtitle && (
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {/* Footer : Trend - HAUTEUR FIXE 32px (toujours présent) */}
      <div className="h-[32px] flex items-center flex-shrink-0 mt-3">
        {trend && trendValue ? (
          <div className="flex items-center gap-2">
            <span className={`
              inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold
              ${TREND_STYLES[trendType]?.container} ${TREND_STYLES[trendType]?.text}
            `}>
              {trend === 'up' ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : trend === 'down' ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14" />
                </svg>
              )}
              {trendValue}
            </span>
            <span className="text-xs text-[var(--text-muted)]">vs mois précédent</span>
          </div>
        ) : (
          /* Espace réservé invisible pour uniformité des hauteurs */
          <div className="h-full" aria-hidden="true" />
        )}
      </div>
    </div>
  )

  const baseClasses = `
    group relative overflow-hidden
    p-6 rounded-2xl
    min-h-[180px] h-auto
    bg-[var(--surface)]
    border border-[var(--border)]
    shadow-sm
    transition-all duration-200
    cursor-pointer
    hover:-translate-y-1 hover:shadow-lg
    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-electric-blue)]
    ${colors.hoverBorder}
    ${className}
  `

  if (href) {
    return (
      <Link
        to={href}
        className={`block ${baseClasses}`}
        aria-label={`${title}: ${value}${subtitle ? `, ${subtitle}` : ''}`}
      >
        {content}
      </Link>
    )
  }

  return (
    <div
      className={baseClasses}
      role="article"
      aria-label={`${title}: ${value}${subtitle ? `, ${subtitle}` : ''}`}
    >
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
