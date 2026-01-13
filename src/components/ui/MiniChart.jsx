import { memo, useMemo } from 'react'
import PropTypes from 'prop-types'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

/**
 * MiniChart - Graphique miniature professionnel pour les StatCards
 *
 * Affiche un mini graphique en barres avec :
 * - Labels des 6 derniers mois
 * - Valeurs formatées
 * - Tendance (hausse/baisse)
 * - Support du mode sombre
 */

const MONTHS_SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

const VARIANTS = {
  blue: {
    bar: 'bg-[var(--color-electric-blue)]',
    barHover: 'hover:bg-[var(--color-electric-blue)]/80',
    text: 'text-[var(--color-electric-blue)]',
    trend: {
      up: 'text-emerald-600 dark:text-emerald-400',
      down: 'text-red-600 dark:text-red-400',
      neutral: 'text-[var(--text-muted)]'
    }
  },
  emerald: {
    bar: 'bg-emerald-500 dark:bg-emerald-400',
    barHover: 'hover:bg-emerald-600 dark:hover:bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    trend: {
      up: 'text-emerald-600 dark:text-emerald-400',
      down: 'text-red-600 dark:text-red-400',
      neutral: 'text-[var(--text-muted)]'
    }
  },
  indigo: {
    bar: 'bg-[var(--color-purple)]',
    barHover: 'hover:bg-[var(--color-purple)]/80',
    text: 'text-[var(--color-purple)]',
    trend: {
      up: 'text-emerald-600 dark:text-emerald-400',
      down: 'text-red-600 dark:text-red-400',
      neutral: 'text-[var(--text-muted)]'
    }
  },
  red: {
    bar: 'bg-red-500 dark:bg-red-400',
    barHover: 'hover:bg-red-600 dark:hover:bg-red-500',
    text: 'text-red-600 dark:text-red-400',
    trend: {
      up: 'text-red-600 dark:text-red-400', // Pour les impayés, hausse = mauvais
      down: 'text-emerald-600 dark:text-emerald-400',
      neutral: 'text-[var(--text-muted)]'
    }
  },
  purple: {
    bar: 'bg-[var(--color-purple)]',
    barHover: 'hover:bg-[var(--color-purple)]/80',
    text: 'text-[var(--color-purple)]',
    trend: {
      up: 'text-emerald-600 dark:text-emerald-400',
      down: 'text-red-600 dark:text-red-400',
      neutral: 'text-[var(--text-muted)]'
    }
  },
  amber: {
    bar: 'bg-amber-500 dark:bg-amber-400',
    barHover: 'hover:bg-amber-600 dark:hover:bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
    trend: {
      up: 'text-emerald-600 dark:text-emerald-400',
      down: 'text-red-600 dark:text-red-400',
      neutral: 'text-[var(--text-muted)]'
    }
  }
}

const MiniChart = memo(function MiniChart({
  data = [],
  variant = 'blue',
  height = 48,
  showLabels = true,
  showTrend = true,
  formatValue = (v) => `${v.toLocaleString('fr-FR')} €`,
  invertTrend = false, // Pour les impayés où une baisse est positive
  className = ''
}) {
  const { bars, trend, trendPercent, labels } = useMemo(() => {
    if (!data || data.length === 0) {
      return { bars: [], trend: 'neutral', trendPercent: 0, labels: [] }
    }

    // Obtenir les labels des mois
    const monthLabels = []
    for (let i = data.length - 1; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      monthLabels.push(MONTHS_SHORT[date.getMonth()])
    }

    const values = data.map(d => (typeof d === 'number' ? d : d.value || 0))
    const max = Math.max(...values, 1) // Minimum 1 pour éviter division par 0

    // Calculer les barres avec hauteur relative
    const calculatedBars = values.map((value, index) => ({
      value,
      height: (value / max) * 100,
      label: monthLabels[index]
    }))

    // Calculer la tendance
    const firstValue = values[0] || 0
    const lastValue = values[values.length - 1] || 0
    let trendDirection = 'neutral'
    let percent = 0

    if (firstValue > 0) {
      percent = ((lastValue - firstValue) / firstValue) * 100
      if (percent > 5) trendDirection = 'up'
      else if (percent < -5) trendDirection = 'down'
    }

    return {
      bars: calculatedBars,
      trend: trendDirection,
      trendPercent: percent,
      labels: monthLabels
    }
  }, [data])

  const colors = VARIANTS[variant] || VARIANTS.blue

  // Si pas de données
  if (bars.length === 0) {
    return (
      <div
        className={`flex items-center justify-center text-xs text-[var(--text-muted)] ${className}`}
        style={{ height }}
      >
        Pas de données
      </div>
    )
  }

  // Déterminer la couleur de la tendance
  const trendColor = invertTrend
    ? colors.trend[trend === 'up' ? 'down' : trend === 'down' ? 'up' : 'neutral']
    : colors.trend[trend]

  return (
    <div className={className}>
      {/* Graphique en barres */}
      <div className="flex items-end gap-1" style={{ height }}>
        {bars.map((bar, index) => (
          <div
            key={index}
            className="flex-1 flex flex-col items-center group"
          >
            {/* Tooltip au survol */}
            <div className="relative">
              <div
                className={`w-full min-w-[8px] rounded-t transition-all duration-200 ${colors.bar} ${colors.barHover} cursor-default`}
                style={{ height: `${Math.max(bar.height, 4)}%`, minHeight: '4px' }}
                title={`${bar.label}: ${formatValue(bar.value)}`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Labels des mois */}
      {showLabels && (
        <div className="flex justify-between mt-1">
          {labels.map((label, index) => (
            <span
              key={index}
              className="text-[9px] text-[var(--text-muted)] flex-1 text-center"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Indicateur de tendance */}
      {showTrend && trend !== 'neutral' && (
        <div className={`flex items-center justify-end gap-1 mt-1 text-xs font-medium ${trendColor}`}>
          {trend === 'up' ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{Math.abs(trendPercent).toFixed(0)}%</span>
        </div>
      )}
    </div>
  )
})

MiniChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.shape({
        value: PropTypes.number,
        label: PropTypes.string
      })
    ])
  ),
  variant: PropTypes.oneOf(['blue', 'emerald', 'indigo', 'red', 'purple', 'amber']),
  height: PropTypes.number,
  showLabels: PropTypes.bool,
  showTrend: PropTypes.bool,
  formatValue: PropTypes.func,
  invertTrend: PropTypes.bool,
  className: PropTypes.string
}

export default MiniChart
