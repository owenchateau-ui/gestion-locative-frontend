import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

function Breadcrumb({ items }) {
  if (!items || items.length === 0) return null

  return (
    <nav className="flex items-center space-x-2 text-sm mb-6" aria-label="Breadcrumb">
      {/* Home icon */}
      <Link
        to="/dashboard"
        className="text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Accueil"
      >
        <Home className="w-4 h-4" />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={index} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4 text-gray-400" />

            {isLast ? (
              <span className="font-medium text-gray-900">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href}
                className="text-gray-500 hover:text-gray-700 transition-colors"
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
