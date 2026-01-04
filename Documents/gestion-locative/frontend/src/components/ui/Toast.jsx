import { useEffect } from 'react'
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react'

function Toast({ id, message, type = 'info', duration = 5000, onClose }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [id, duration, onClose])

  const variants = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      progress: 'bg-green-500'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: <AlertCircle className="w-5 h-5 text-red-600" />,
      progress: 'bg-red-500'
    },
    warning: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-800',
      icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
      progress: 'bg-orange-500'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: <Info className="w-5 h-5 text-blue-600" />,
      progress: 'bg-blue-500'
    }
  }

  const variant = variants[type] || variants.info

  return (
    <div
      className={`relative flex items-start gap-3 p-4 rounded-lg border shadow-lg ${variant.bg} ${variant.border} animate-slide-in-right`}
      role="alert"
    >
      {/* Icône */}
      <div className="flex-shrink-0 mt-0.5">
        {variant.icon}
      </div>

      {/* Message */}
      <div className={`flex-1 text-sm font-medium ${variant.text}`}>
        {message}
      </div>

      {/* Bouton fermer */}
      <button
        onClick={() => onClose(id)}
        className={`flex-shrink-0 rounded-lg p-1 hover:bg-white/50 transition-colors ${variant.text}`}
        aria-label="Fermer"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Barre de progression */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 rounded-b-lg overflow-hidden">
          <div
            className={`h-full ${variant.progress} animate-progress`}
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      )}
    </div>
  )
}

export default Toast
