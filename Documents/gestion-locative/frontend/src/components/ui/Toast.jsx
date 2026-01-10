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
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
      border: 'border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-800 dark:text-emerald-300',
      icon: <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      progress: 'bg-emerald-500'
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/30',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-300',
      icon: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />,
      progress: 'bg-red-500'
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-900/30',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-800 dark:text-amber-300',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      progress: 'bg-amber-500'
    },
    info: {
      bg: 'bg-[var(--color-electric-blue)]/10',
      border: 'border-[var(--color-electric-blue)]/30',
      text: 'text-[var(--color-electric-blue)]',
      icon: <Info className="w-5 h-5 text-[var(--color-electric-blue)]" />,
      progress: 'bg-[var(--color-electric-blue)]'
    }
  }

  const variant = variants[type] || variants.info

  return (
    <div
      className={`relative flex items-start gap-3 p-4 rounded-xl border shadow-lg ${variant.bg} ${variant.border} animate-slide-in-right`}
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
        className={`flex-shrink-0 rounded-xl p-1 hover:bg-[var(--surface)]/50 transition-colors ${variant.text}`}
        aria-label="Fermer"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Barre de progression */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--surface)]/30 rounded-b-xl overflow-hidden">
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
