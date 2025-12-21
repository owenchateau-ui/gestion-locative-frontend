function Card({ children, title, subtitle, footer, className = '', padding = true }) {
  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {title && (
        <div className={`border-b border-gray-200 ${padding ? 'px-6 py-4' : ''}`}>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}

      <div className={padding ? 'px-6 py-4' : ''}>
        {children}
      </div>

      {footer && (
        <div className={`border-t border-gray-200 bg-gray-50 rounded-b-lg ${padding ? 'px-6 py-3' : ''}`}>
          {footer}
        </div>
      )}
    </div>
  )
}

export default Card
