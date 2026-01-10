import { memo, useMemo } from 'react'
import PropTypes from 'prop-types'

/**
 * Sparkline - Mini-graphique SVG léger
 *
 * Affiche une tendance visuelle des données sur une période
 * Sans dépendance externe (Chart.js, etc.)
 */

// Note: Les couleurs SVG ne supportent pas les classes Tailwind dark:
// Ces couleurs fonctionnent bien en mode clair et sombre grâce à leur contraste
const COLORS = {
  blue: { line: '#3b82f6', fill: '#3b82f620' },
  emerald: { line: '#10b981', fill: '#10b98120' },
  purple: { line: '#a855f7', fill: '#a855f720' },
  amber: { line: '#f59e0b', fill: '#f59e0b20' },
  red: { line: '#ef4444', fill: '#ef444420' },
  indigo: { line: '#6366f1', fill: '#6366f120' }
}

const Sparkline = memo(function Sparkline({
  data = [],
  width = 100,
  height = 32,
  variant = 'blue',
  showArea = true,
  strokeWidth = 2,
  className = ''
}) {
  // Calcul des points du graphique
  const { points, areaPath, linePath, minValue, maxValue, trend } = useMemo(() => {
    if (!data || data.length === 0) {
      return { points: [], areaPath: '', linePath: '', minValue: 0, maxValue: 0, trend: 'neutral' }
    }

    const values = data.map(d => (typeof d === 'number' ? d : d.value || 0))
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1

    // Padding vertical pour éviter que la ligne touche les bords
    const padding = height * 0.1
    const chartHeight = height - (padding * 2)

    // Calculer les coordonnées de chaque point
    const calculatedPoints = values.map((value, index) => {
      const x = (index / (values.length - 1)) * width
      const y = padding + chartHeight - ((value - min) / range) * chartHeight
      return { x, y, value }
    })

    // Créer le chemin de la ligne
    const linePathData = calculatedPoints
      .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
      .join(' ')

    // Créer le chemin de l'aire (pour le remplissage)
    const areaPathData = `
      M ${calculatedPoints[0].x.toFixed(2)} ${height}
      L ${calculatedPoints[0].x.toFixed(2)} ${calculatedPoints[0].y.toFixed(2)}
      ${calculatedPoints.slice(1).map(p => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')}
      L ${calculatedPoints[calculatedPoints.length - 1].x.toFixed(2)} ${height}
      Z
    `

    // Déterminer la tendance
    const firstValue = values[0]
    const lastValue = values[values.length - 1]
    const trendDirection = lastValue > firstValue ? 'up' : lastValue < firstValue ? 'down' : 'neutral'

    return {
      points: calculatedPoints,
      linePath: linePathData,
      areaPath: areaPathData,
      minValue: min,
      maxValue: max,
      trend: trendDirection
    }
  }, [data, width, height])

  if (!data || data.length < 2) {
    // Pas assez de données pour afficher un graphique
    return (
      <div
        className={`flex items-center justify-center text-xs text-[var(--text-muted)] ${className}`}
        style={{ width, height }}
      >
        --
      </div>
    )
  }

  const colors = COLORS[variant] || COLORS.blue

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
    >
      {/* Aire sous la courbe */}
      {showArea && (
        <path
          d={areaPath}
          fill={colors.fill}
          opacity={0.5}
        />
      )}

      {/* Ligne principale */}
      <path
        d={linePath}
        fill="none"
        stroke={colors.line}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Point final (dernier point) */}
      {points.length > 0 && (
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r={3}
          fill={colors.line}
        />
      )}
    </svg>
  )
})

Sparkline.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.shape({
        value: PropTypes.number,
        label: PropTypes.string
      })
    ])
  ),
  width: PropTypes.number,
  height: PropTypes.number,
  variant: PropTypes.oneOf(['blue', 'emerald', 'purple', 'amber', 'red', 'indigo']),
  showArea: PropTypes.bool,
  strokeWidth: PropTypes.number,
  className: PropTypes.string
}

export default Sparkline
