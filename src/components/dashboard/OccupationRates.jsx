import { memo } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Building2, TrendingUp, TrendingDown } from 'lucide-react'

/**
 * OccupationRates - Taux d'occupation par entité Bold Geometric
 * Affiche les taux d'occupation avec barres de progression
 */

const OccupationItem = memo(function OccupationItem({ entity, index }) {
  const rate = entity.totalLots > 0
    ? Math.round((entity.occupiedLots / entity.totalLots) * 100)
    : 0

  const getBarColor = (rate) => {
    if (rate >= 80) return 'from-emerald-500 to-emerald-400'
    if (rate >= 50) return 'from-amber-500 to-amber-400'
    return 'from-[#FF6B4A] to-[#FF8066]'
  }

  const getBadgeStyle = (rate) => {
    if (rate >= 80) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
    if (rate >= 50) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
    return 'bg-[#FF6B4A]/10 text-[#FF6B4A]'
  }

  return (
    <Link
      to={`/entities/${entity.id}`}
      className="group block p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl transition-all duration-200 hover:border-[var(--border-strong)] hover:-translate-y-0.5 hover:shadow-card"
      style={{
        animationDelay: `${index * 50}ms`
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${entity.color}20`, color: entity.color }}
          >
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <p className="font-medium font-display text-sm text-[var(--text)] group-hover:text-[#0055FF] transition-colors">
              {entity.name}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {entity.occupiedLots}/{entity.totalLots} lots
            </p>
          </div>
        </div>

        {/* Badge taux */}
        <div className="flex items-center gap-2">
          <span className={`
            inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold
            ${getBadgeStyle(rate)}
          `}>
            {rate >= 80 ? <TrendingUp className="w-3 h-3" /> : rate < 50 ? <TrendingDown className="w-3 h-3" /> : null}
            {rate}%
          </span>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="w-full h-2 bg-[var(--border)] rounded-full overflow-hidden">
        <div
          className={`
            h-full rounded-full
            bg-gradient-to-r ${getBarColor(rate)}
            transition-all duration-500 ease-out
            group-hover:shadow-[0_0_10px_rgba(0,0,0,0.2)]
          `}
          style={{ width: `${rate}%` }}
        />
      </div>

      {/* Revenus */}
      {entity.revenue !== undefined && (
        <div className="mt-3 pt-3 border-t border-[var(--border)]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)]">Revenus mensuels</span>
            <span className="text-sm font-bold font-display" style={{ color: entity.color }}>
              {entity.revenue.toLocaleString('fr-FR')} €
            </span>
          </div>
        </div>
      )}
    </Link>
  )
})

const OccupationRates = memo(function OccupationRates({
  entities = [],
  title = "Taux d'occupation",
  subtitle = "Par entité",
  className = ''
}) {
  // Calculer le taux global
  const totalOccupied = entities.reduce((sum, e) => sum + (e.occupiedLots || 0), 0)
  const totalLots = entities.reduce((sum, e) => sum + (e.totalLots || 0), 0)
  const globalRate = totalLots > 0 ? Math.round((totalOccupied / totalLots) * 100) : 0

  if (entities.length === 0) {
    return null
  }

  return (
    <div className={`
      group/card relative overflow-hidden
      bg-[var(--surface)] border border-[var(--border)]
      rounded-2xl p-6
      transition-all duration-200
      hover:border-emerald-500 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.12)]
      ${className}
    `}>
      {/* Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 bg-gradient-to-r from-emerald-500 to-emerald-400" />

      {/* Header avec taux global */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-sm font-medium font-display text-[var(--text-secondary)]">{title}</h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>
        </div>

        {/* Taux global */}
        <div className="text-right">
          <p className="text-3xl font-bold font-display text-emerald-600 dark:text-emerald-400">
            {globalRate}%
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            {totalOccupied}/{totalLots} lots
          </p>
        </div>
      </div>

      {/* Barre globale */}
      <div className="mb-6">
        <div className="w-full h-3 bg-[var(--border)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
            style={{ width: `${globalRate}%` }}
          />
        </div>
      </div>

      {/* Liste des entités */}
      <div className="space-y-3">
        {entities.map((entity, index) => (
          <OccupationItem key={entity.id} entity={entity} index={index} />
        ))}
      </div>
    </div>
  )
})

OccupationRates.propTypes = {
  entities: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    color: PropTypes.string,
    totalLots: PropTypes.number,
    occupiedLots: PropTypes.number,
    revenue: PropTypes.number
  })),
  title: PropTypes.string,
  subtitle: PropTypes.string,
  className: PropTypes.string
}

export default OccupationRates
