import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

function Breadcrumb({ items }) {
  if (!items || items.length === 0) return null

  return (
    <nav className="flex items-center space-x-2 text-sm mb-6" aria-label="Breadcrumb">
      {/* Home icon */}
      <Link
        to="/dashboard"
        className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        aria-label="Accueil"
      >
        <Home className="w-4 h-4" />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={index} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />

            {isLast ? (
              <span className="font-medium font-display text-[var(--text)]">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href}
                className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              >
                {item.label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}

export default Breadcrumb
