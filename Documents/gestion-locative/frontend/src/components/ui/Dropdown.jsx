import { useState, useRef, useEffect } from 'react'
import { MoreVertical } from 'lucide-react'

function Dropdown({ trigger, items, align = 'right' }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
    }

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleItemClick = (item) => {
    if (item.onClick) {
      item.onClick()
    }
    setIsOpen(false)
  }

  const alignClass = align === 'left' ? 'left-0' : 'right-0'

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger || (
          <button className="p-2 rounded-xl hover:bg-[var(--surface-elevated)] transition-colors">
            <MoreVertical className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        )}
      </div>

      {/* Menu */}
      {isOpen && (
        <div
          className={`absolute ${alignClass} mt-2 w-56 bg-[var(--surface)] rounded-xl shadow-lg border border-[var(--border)] py-1 z-50 animate-scale-in origin-top-${align}`}
        >
          {items.map((item, index) => {
            if (item.divider) {
              return <div key={index} className="h-px bg-[var(--border)] my-1" />
            }

            return (
              <button
                key={index}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={`
                  w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors
                  ${item.danger
                    ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                    : 'text-[var(--text)] hover:bg-[var(--surface-elevated)]'
                  }
                  ${item.disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                  }
                `}
              >
                {item.icon && (
                  <span className="flex-shrink-0">
                    {item.icon}
                  </span>
                )}
                <span className="flex-1">{item.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Dropdown
