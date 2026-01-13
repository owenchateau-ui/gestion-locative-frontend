/**
 * Composant de notation d'un élément (1-5 étoiles)
 * Utilisé dans les états des lieux pour évaluer l'état des éléments
 */

import { useState } from 'react'
import { Star } from 'lucide-react'
import { RATING_SCALE } from '../../constants/inventoryConstants'

function ElementRating({
  value = 3,
  onChange,
  readonly = false,
  showLabel = true,
  showDescription = false,
  size = 'md'
}) {
  const [hoverValue, setHoverValue] = useState(null)

  const displayValue = hoverValue ?? value

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const gapClasses = {
    sm: 'gap-0.5',
    md: 'gap-1',
    lg: 'gap-1.5'
  }

  const handleClick = (rating) => {
    if (!readonly && onChange) {
      onChange(rating)
    }
  }

  const ratingInfo = RATING_SCALE[value]

  return (
    <div className="inline-flex flex-col">
      <div className={`flex items-center ${gapClasses[size]}`}>
        {[1, 2, 3, 4, 5].map((rating) => {
          const isFilled = rating <= displayValue
          const ratingData = RATING_SCALE[rating]

          return (
            <button
              key={rating}
              type="button"
              disabled={readonly}
              onClick={() => handleClick(rating)}
              onMouseEnter={() => !readonly && setHoverValue(rating)}
              onMouseLeave={() => !readonly && setHoverValue(null)}
              className={`
                ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
                transition-transform duration-150
                focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:ring-offset-1 rounded
              `}
              title={`${ratingData.label}: ${ratingData.description}`}
            >
              <Star
                className={`
                  ${sizeClasses[size]}
                  ${isFilled
                    ? `fill-current ${
                        rating <= 2 ? 'text-red-500 dark:text-red-400' :
                        rating === 3 ? 'text-yellow-500 dark:text-yellow-400' :
                        'text-emerald-500 dark:text-emerald-400'
                      }`
                    : 'text-[var(--border)]'
                  }
                  transition-colors duration-150
                `}
              />
            </button>
          )
        })}

        {showLabel && ratingInfo && (
          <span className={`ml-2 font-medium ${ratingInfo.textClass}`}>
            {ratingInfo.label}
          </span>
        )}
      </div>

      {showDescription && ratingInfo && (
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {ratingInfo.description}
        </p>
      )}
    </div>
  )
}

/**
 * Version compacte pour les tableaux
 */
export function RatingBadge({ rating, size = 'sm' }) {
  const ratingInfo = RATING_SCALE[rating] || RATING_SCALE[3]

  return (
    <span className={`
      inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
      ${ratingInfo.badgeClass}
    `}>
      <Star className={`w-3 h-3 fill-current`} />
      {ratingInfo.shortLabel}
    </span>
  )
}

/**
 * Version pour la comparaison entrée/sortie
 */
export function RatingComparison({ entryRating, exitRating }) {
  const diff = (entryRating || 3) - (exitRating || 3)
  const entryInfo = RATING_SCALE[entryRating] || RATING_SCALE[3]
  const exitInfo = RATING_SCALE[exitRating] || RATING_SCALE[3]

  return (
    <div className="flex items-center gap-2">
      <RatingBadge rating={entryRating} />
      <span className="text-[var(--text-muted)]">→</span>
      <RatingBadge rating={exitRating} />
      {diff !== 0 && (
        <span className={`
          text-xs font-medium ml-1
          ${diff > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}
        `}>
          {diff > 0 ? `−${diff}` : `+${Math.abs(diff)}`}
        </span>
      )}
    </div>
  )
}

export default ElementRating
