import { memo, useMemo } from 'react'
import PropTypes from 'prop-types'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Building2 } from 'lucide-react'

/**
 * EntityRevenueChart - Répartition des revenus par entité
 * Affiche un graphique en camembert des revenus par entité
 */

const COLORS = ['#0055FF', '#8B5CF6', '#10B981', '#F59E0B', '#FF6B4A', '#06B6D4']

const EntityRevenueChart = memo(function EntityRevenueChart({
  entities = [],
  title = "Répartition des revenus",
  subtitle,
  className = ''
}) {
  // Préparer les données pour le pie chart
  const chartData = useMemo(() => {
    return entities
      .filter(e => e.revenue > 0)
      .map((entity, index) => ({
        name: entity.name,
        value: entity.revenue,
        color: entity.color || COLORS[index % COLORS.length]
      }))
  }, [entities])

  // Total des revenus
  const totalRevenue = useMemo(() => {
    return entities.reduce((sum, e) => sum + (e.revenue || 0), 0)
  }, [entities])

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = ((data.value / totalRevenue) * 100).toFixed(1)
      return (
        <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg px-3 py-2 shadow-lg">
          <p className="text-xs font-medium text-[var(--text)]">{data.name}</p>
          <p className="text-sm font-bold text-[var(--text)]">
            {data.value.toLocaleString('fr-FR')} €
          </p>
          <p className="text-xs text-[var(--text-muted)]">{percentage}%</p>
        </div>
      )
    }
    return null
  }

  // Custom legend
  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap gap-3 justify-center mt-4">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-[var(--text-secondary)]">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }

  if (chartData.length === 0) {
    return null
  }

  return (
    <div className={`
      group relative overflow-hidden
      bg-[var(--surface)] border border-[var(--border)]
      rounded-2xl p-6
      transition-all duration-200
      hover:border-[#8B5CF6] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.12)]
      ${className}
    `}>
      {/* Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA]" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium font-display text-[var(--text-secondary)]">{title}</h3>
          {subtitle && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Total */}
        <div className="text-right">
          <p className="text-2xl font-bold font-display text-[var(--text)]">
            {totalRevenue.toLocaleString('fr-FR')} €
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            {entities.length} entité{entities.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  className="transition-opacity duration-200 hover:opacity-80"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Liste des entités */}
      <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-2">
        {chartData.map((entity, index) => {
          const percentage = ((entity.value / totalRevenue) * 100).toFixed(1)
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: entity.color }}
                />
                <span className="text-sm text-[var(--text-secondary)]">{entity.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[var(--text)]">
                  {entity.value.toLocaleString('fr-FR')} €
                </span>
                <span className="text-xs text-[var(--text-muted)] w-12 text-right">
                  {percentage}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})

EntityRevenueChart.propTypes = {
  entities: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    color: PropTypes.string,
    revenue: PropTypes.number
  })),
  title: PropTypes.string,
  subtitle: PropTypes.string,
  className: PropTypes.string
}

export default EntityRevenueChart
