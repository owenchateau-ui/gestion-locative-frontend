import { memo } from 'react'
import PropTypes from 'prop-types'

const Card = memo(function Card({ children, title, subtitle, footer, className = '', padding = true }) {
  const paddingClass = padding ? 'px-6 py-4' : ''
  const footerPaddingClass = padding ? 'px-6 py-3' : ''

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {title && (
        <div className={`border-b border-gray-200 ${paddingClass}`}>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}

      <div className={paddingClass}>
        {children}
      </div>

      {footer && (
        <div className={`border-t border-gray-200 bg-gray-50 rounded-b-lg ${footerPaddingClass}`}>
          {footer}
        </div>
      )}
    </div>
  )
})

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  footer: PropTypes.node,
  className: PropTypes.string,
  padding: PropTypes.bool
}

export default Card
