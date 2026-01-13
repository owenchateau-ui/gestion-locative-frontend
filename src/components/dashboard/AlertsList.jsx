import { memo } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { AlertCircle, Clock, TrendingUp, ChevronRight, Calendar, CreditCard, FileText } from 'lucide-react'
import { PROPERTY_ICON_STYLES, BADGE_STYLES } from '../../constants/designSystem'

/**
 * AlertsList - Liste des alertes Bold Geometric
 * Affiche les alertes importantes avec icônes et actions
 * Les icônes utilisent TYPE 2 (gradient solide + glow) pour attirer l'attention
 */

const ALERT_TYPES = {
  expiring_lease: {
    icon: Calendar,
    color: 'amber',
    bgColor: 'bg-[#F59E0B]/[0.12]',
    textColor: 'text-[#F59E0B]',
    borderColor: 'border-[#F59E0B]/30',
    iconBg: PROPERTY_ICON_STYLES.amber.container,
    iconShadow: PROPERTY_ICON_STYLES.amber.shadow
  },
  late_payment: {
    icon: CreditCard,
    color: 'coral',
    bgColor: 'bg-[#FF6B4A]/[0.12]',
    textColor: 'text-[#FF6B4A]',
    borderColor: 'border-[#FF6B4A]/30',
    iconBg: PROPERTY_ICON_STYLES.coral.container,
    iconShadow: PROPERTY_ICON_STYLES.coral.shadow
  },
  pending_indexation: {
    icon: TrendingUp,
    color: 'blue',
    bgColor: 'bg-[#0055FF]/[0.12]',
    textColor: 'text-[#0055FF]',
    borderColor: 'border-[#0055FF]/30',
    iconBg: PROPERTY_ICON_STYLES.blue.container,
    iconShadow: PROPERTY_ICON_STYLES.blue.shadow
  },
  missing_document: {
    icon: FileText,
    color: 'purple',
    bgColor: 'bg-[#8B5CF6]/[0.12]',
    textColor: 'text-[#8B5CF6]',
    borderColor: 'border-[#8B5CF6]/30',
    iconBg: PROPERTY_ICON_STYLES.purple.container,
    iconShadow: PROPERTY_ICON_STYLES.purple.shadow
  }
}

const AlertItem = memo(function AlertItem({ alert, onClick }) {
  const config = ALERT_TYPES[alert.type] || ALERT_TYPES.late_payment
  const Icon = config.icon

  const content = (
    <div
      className={`
        group flex items-center gap-4 p-4
        bg-[var(--surface)] border ${config.borderColor}
        rounded-xl
        transition-all duration-200
        hover:bg-[var(--surface-hover)] hover:-translate-x-1
        cursor-pointer
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-electric-blue)]
      `}
      role="listitem"
    >
      {/* Icône - TYPE 2: gradient solide + icône blanche + glow */}
      <div className={`
        w-10 h-10 rounded-xl flex items-center justify-center text-white
        ${config.iconBg} ${config.iconShadow}
        group-hover:scale-110 transition-transform duration-200
      `}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <p className="font-medium font-display text-[var(--text)] truncate">
          {alert.title}
        </p>
        <p className="text-sm text-[var(--text-muted)] truncate">
          {alert.description}
        </p>
      </div>

      {/* Badge et flèche */}
      <div className="flex items-center gap-3">
        {alert.badge && (
          <span className={`
            px-2.5 py-1 rounded-full text-xs font-bold
            ${config.bgColor} ${config.textColor}
          `}>
            {alert.badge}
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors" />
      </div>
    </div>
  )

  if (alert.href) {
    return <Link to={alert.href}>{content}</Link>
  }

  return <button onClick={onClick} className="w-full text-left">{content}</button>
})

const AlertsList = memo(function AlertsList({
  alerts = [],
  title = "Alertes importantes",
  maxItems = 5,
  showViewAll = true,
  viewAllHref = "/notifications",
  className = ''
}) {
  const displayedAlerts = alerts.slice(0, maxItems)
  const remainingCount = alerts.length - maxItems

  if (alerts.length === 0) {
    return (
      <div className={`
        bg-[var(--surface)] border border-[var(--border)]
        rounded-2xl p-6
        ${className}
      `}>
        <h3 className="text-sm font-medium font-display text-[var(--text-secondary)] mb-4">{title}</h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6 text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-[var(--text)]">Tout est en ordre</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Aucune alerte pour le moment</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`
      group/card relative overflow-hidden
      bg-[var(--surface)] border border-[var(--border)]
      rounded-2xl p-6
      transition-all duration-200
      hover:border-[#FF6B4A] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.12)]
      ${className}
    `}>
      {/* Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 bg-gradient-to-r from-[#FF6B4A] to-[#FF8066]" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium font-display text-[var(--text-secondary)]">{title}</h3>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#FF6B4A] text-white">
            {alerts.length}
          </span>
        </div>
        {showViewAll && alerts.length > maxItems && (
          <Link
            to={viewAllHref}
            className="text-xs font-medium text-[var(--color-electric-blue)] hover:underline"
          >
            Voir tout
          </Link>
        )}
      </div>

      {/* Liste des alertes */}
      <div className="space-y-3" role="list" aria-label="Liste des alertes">
        {displayedAlerts.map((alert, index) => (
          <AlertItem key={alert.id || index} alert={alert} />
        ))}
      </div>

      {/* Lien voir plus */}
      {remainingCount > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <Link
            to={viewAllHref}
            className="flex items-center justify-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--color-electric-blue)] transition-colors"
          >
            <span>+{remainingCount} autre{remainingCount > 1 ? 's' : ''} alerte{remainingCount > 1 ? 's' : ''}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  )
})

AlertsList.propTypes = {
  alerts: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.oneOf(['expiring_lease', 'late_payment', 'pending_indexation', 'missing_document']),
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    badge: PropTypes.string,
    href: PropTypes.string
  })),
  title: PropTypes.string,
  maxItems: PropTypes.number,
  showViewAll: PropTypes.bool,
  viewAllHref: PropTypes.string,
  className: PropTypes.string
}

export default AlertsList
