function Alert({ children, variant = 'info', title, onClose, className = '' }) {
  const variants = {
    info: {
      container: 'bg-blue-50 border-blue-500',
      icon: 'text-blue-500',
      title: 'text-blue-800',
      text: 'text-blue-700'
    },
    success: {
      container: 'bg-emerald-50 border-emerald-500',
      icon: 'text-emerald-500',
      title: 'text-emerald-800',
      text: 'text-emerald-700'
    },
    warning: {
      container: 'bg-amber-50 border-amber-500',
      icon: 'text-amber-500',
      title: 'text-amber-800',
      text: 'text-amber-700'
    },
    error: {
      container: 'bg-red-50 border-red-500',
      icon: 'text-red-500',
      title: 'text-red-800',
      text: 'text-red-700'
    }
  }

  const icons = {
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }

  return (
    <div className={`border-l-4 p-4 rounded ${variants[variant].container} ${className}`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${variants[variant].icon}`}>
          {icons[variant]}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-semibold ${variants[variant].title}`}>
              {title}
            </h3>
          )}
          <div className={`${title ? 'mt-1' : ''} text-sm ${variants[variant].text}`}>
            {children}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`ml-3 flex-shrink-0 ${variants[variant].icon} hover:opacity-75`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

export default Alert
