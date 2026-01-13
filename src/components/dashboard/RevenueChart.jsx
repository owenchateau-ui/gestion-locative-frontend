import { memo, useMemo } from 'react'
import PropTypes from 'prop-types'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'

/**
 * RevenueChart - Graphique des revenus avec recharts
 * Affiche une visualisation des revenus mensuels en area chart
 */
const RevenueChart = memo(function RevenueChart({
  data = [],
  title = "Revenus mensuels",
  subtitle,
  className = ''
}) {
  // Calculer la tendance
  const trend = useMemo(() => {
    if (data.length < 2) return null
    const current = data[data.length - 1]?.value || 0
    const previous = data[data.length - 2]?.value || 0
    if (previous === 0) return null
    const percentage = ((current - previous) / previous * 100).toFixed(1)
    return {
      direction: current >= previous ? 'up' : 'down',
      value: Math.abs(percentage)
    }
  }, [data])

  // Total du mois courant
  const currentTotal = data[data.length - 1]?.value || 0

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg px-3 py-2 shadow-lg">
          <p className="text-xs text-[var(--text-muted)]">{label}</p>
          <p className="text-sm font-bold text-[var(--text)]">
            {payload[0].value.toLocaleString('fr-FR')} €
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className={`
      group relative overflow-hidden
      bg-[var(--surface)] border border-[var(--border)]
      rounded-2xl p-6
      transition-all duration-200
      hover:border-[#0055FF] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.12)]
      ${className}
    `}>
      {/* Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-r from-[#0055FF] to-[#8B5CF6]" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium font-display text-[var(--text-secondary)]">{title}</h3>
          {subtitle && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Total actuel avec tendance */}
        <div className="text-right">
          <p className="text-2xl font-bold font-display text-[var(--text)]">
            {currentTotal.toLocaleString('fr-FR')} €
          </p>
          {trend && (
            <div className={`
              inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-bold
              ${trend.direction === 'up'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-[#FF6B4A]/10 text-[#FF6B4A]'
              }
            `}>
              {trend.direction === 'up'
                ? <TrendingUp className="w-3 h-3" />
                : <TrendingDown className="w-3 h-3" />
              }
              {trend.value}%
            </div>
          )}
        </div>
      </div>

      {/* Chart avec recharts */}
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0055FF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0055FF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              width={35}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#0055FF"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              dot={{ fill: '#0055FF', strokeWidth: 0, r: 3 }}
              activeDot={{ fill: '#0055FF', strokeWidth: 2, stroke: '#fff', r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
})

RevenueChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    month: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired
  })),
  title: PropTypes.string,
  subtitle: PropTypes.string,
  className: PropTypes.string
}

export default RevenueChart
