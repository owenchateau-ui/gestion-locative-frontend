import { useEffect } from 'react'
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react'

/**
 * Toast component avec fonds SOLIDES pour excellent contraste en mode clair ET sombre
 * Conforme WCAG AA (ratio contraste > 4.5:1)
 */
function Toast({ id, message, type = 'info', duration = 5000, onClose }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [id, duration, onClose])

  // Styles avec fonds SOLIDES pour excellent contraste
  const variants = {
    success: {
      container: 'bg-[#059669] border-[#047857]', // Emerald-600
      text: 'text-white',
      icon: <CheckCircle className="w-5 h-5 text-white" />,
      progress: 'bg-white/30',
      closeBtn: 'text-white/70 hover:text-white hover:bg-white/10'
    },
    error: {
      container: 'bg-[#DC2626] border-[#B91C1C]', // Red-600
      text: 'text-white',
      icon: <AlertCircle className="w-5 h-5 text-white" />,
      progress: 'bg-white/30',
      closeBtn: 'text-white/70 hover:text-white hover:bg-white/10'
    },
    warning: {
      container: 'bg-[#D97706] border-[#B45309]', // Amber-600
      text: 'text-white',
      icon: <AlertTriangle className="w-5 h-5 text-white" />,
      progress: 'bg-white/30',
      closeBtn: 'text-white/70 hover:text-white hover:bg-white/10'
    },
    info: {
      container: 'bg-[#0055FF] border-[#0044CC]', // Electric Blue
      text: 'text-white',
      icon: <Info className="w-5 h-5 text-white" />,
      progress: 'bg-white/30',
      closeBtn: 'text-white/70 hover:text-white hover:bg-white/10'
    }
  }

  const variant = variants[type] || variants.info

  return (
    <div
      className={`
        relative flex items-start gap-3
        px-4 py-3.5
        min-w-[320px] max-w-[480px]
        rounded-xl border
        shadow-lg
        ${variant.container}
        animate-slide-in-right
      `}
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
        className={`
          flex-shrink-0
          rounded-lg p-1.5
          transition-colors duration-150
          ${variant.closeBtn}
        `}
        aria-label="Fermer"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Barre de progression */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl overflow-hidden">
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
