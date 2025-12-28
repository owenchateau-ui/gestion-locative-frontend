import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

function StatCard({
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
  const variants = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    amber: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
    red: 'bg-red-50 text-red-600 hover:bg-red-100',
    indigo: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
  }

  const iconVariants = {
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600',
    indigo: 'bg-indigo-100 text-indigo-600'
  }

  const content = (
    <>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${variant === 'blue' ? 'text-blue-800' : variant === 'emerald' ? 'text-emerald-800' : variant === 'purple' ? 'text-purple-800' : variant === 'amber' ? 'text-amber-800' : variant === 'red' ? 'text-red-800' : 'text-indigo-800'}`}>
            {title}
          </p>
          <p className={`mt-2 text-3xl font-bold ${variant === 'blue' ? 'text-blue-600' : variant === 'emerald' ? 'text-emerald-600' : variant === 'purple' ? 'text-purple-600' : variant === 'amber' ? 'text-amber-600' : variant === 'red' ? 'text-red-600' : 'text-indigo-600'}`}>
            {value}
          </p>
          {subtitle && (
            <p className={`mt-1 text-sm ${variant === 'blue' ? 'text-blue-600' : variant === 'emerald' ? 'text-emerald-600' : variant === 'purple' ? 'text-purple-600' : variant === 'amber' ? 'text-amber-600' : variant === 'red' ? 'text-red-600' : 'text-indigo-600'}`}>
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${iconVariants[variant]}`}>
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 flex items-center text-sm">
          {trend === 'up' ? (
            <svg className="w-4 h-4 text-emerald-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-red-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          )}
          <span className={trend === 'up' ? 'text-emerald-600' : 'text-red-600'}>
            {trendValue}
          </span>
        </div>
      )}
    </>
  )

  if (href) {
    return (
      <Link to={href} className={`block p-6 rounded-lg transition-colors ${variants[variant]} ${className}`}>
        {content}
      </Link>
    )
  }

  return (
    <div className={`p-6 rounded-lg ${variants[variant]} ${className}`}>
      {content}
    </div>
  )
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.node,
  variant: PropTypes.oneOf(['blue', 'emerald', 'purple', 'amber', 'red', 'indigo']),
  trend: PropTypes.oneOf(['up', 'down']),
  trendValue: PropTypes.string,
  href: PropTypes.string,
  className: PropTypes.string
}

export default StatCard
