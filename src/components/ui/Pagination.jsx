import { memo, useMemo } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

/**
 * Pagination - Composant de pagination pour les listes
 *
 * @param {number} currentPage - Page actuelle (1-indexed)
 * @param {number} totalPages - Nombre total de pages
 * @param {number} totalItems - Nombre total d'elements (optionnel)
 * @param {number} itemsPerPage - Elements par page (optionnel)
 * @param {function} onPageChange - Callback quand la page change
 * @param {number} siblingCount - Nombre de pages affichees de chaque cote (defaut: 1)
 * @param {boolean} showFirstLast - Afficher boutons premiere/derniere page (defaut: true)
 * @param {boolean} showItemCount - Afficher le compteur d'elements (defaut: true)
 * @param {string} size - Taille: "sm" | "md" | "lg" (defaut: "md")
 */
const Pagination = memo(function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  showItemCount = true,
  size = 'md'
}) {
  // Ne pas afficher si une seule page
  if (totalPages <= 1) return null

  const sizeClasses = {
    sm: {
      button: 'h-7 min-w-7 text-xs',
      icon: 'w-3.5 h-3.5',
      text: 'text-xs'
    },
    md: {
      button: 'h-9 min-w-9 text-sm',
      icon: 'w-4 h-4',
      text: 'text-sm'
    },
    lg: {
      button: 'h-11 min-w-11 text-base',
      icon: 'w-5 h-5',
      text: 'text-base'
    }
  }

  const currentSize = sizeClasses[size]

  // Generer la liste des pages a afficher
  const pages = useMemo(() => {
    const range = (start, end) => {
      const length = end - start + 1
      return Array.from({ length }, (_, i) => start + i)
    }

    const totalPageNumbers = siblingCount * 2 + 5 // siblingCount + firstPage + lastPage + currentPage + 2*DOTS

    // Cas 1: Nombre de pages inferieur au total
    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages)
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

    const shouldShowLeftDots = leftSiblingIndex > 2
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1

    // Cas 2: Pas de dots a gauche
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount
      const leftRange = range(1, leftItemCount)
      return [...leftRange, 'dots', totalPages]
    }

    // Cas 3: Pas de dots a droite
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount
      const rightRange = range(totalPages - rightItemCount + 1, totalPages)
      return [1, 'dots', ...rightRange]
    }

    // Cas 4: Dots des deux cotes
    const middleRange = range(leftSiblingIndex, rightSiblingIndex)
    return [1, 'dots', ...middleRange, 'dots', totalPages]
  }, [currentPage, totalPages, siblingCount])

  const baseButtonClass = `
    inline-flex items-center justify-center rounded-xl px-2
    font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:ring-offset-1
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  const normalButtonClass = `
    ${baseButtonClass}
    text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text)]
  `

  const activeButtonClass = `
    ${baseButtonClass}
    bg-[var(--color-electric-blue)] text-white hover:bg-[var(--color-electric-blue)]/90
  `

  const navButtonClass = `
    ${baseButtonClass}
    text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-secondary)]
    disabled:hover:bg-transparent
  `

  // Calcul du range d'elements affiches
  const startItem = totalItems ? (currentPage - 1) * itemsPerPage + 1 : null
  const endItem = totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : null

  return (
    <nav
      className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3"
      aria-label="Pagination"
    >
      {/* Compteur d'elements */}
      {showItemCount && totalItems && (
        <p className={`${currentSize.text} text-[var(--text-secondary)]`}>
          Affichage de <span className="font-medium">{startItem}</span> a{' '}
          <span className="font-medium">{endItem}</span> sur{' '}
          <span className="font-medium">{totalItems}</span> resultats
        </p>
      )}

      {/* Boutons de pagination */}
      <div className="flex items-center gap-1">
        {/* Premiere page */}
        {showFirstLast && (
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className={`${navButtonClass} ${currentSize.button}`}
            aria-label="Premiere page"
            title="Premiere page"
          >
            <ChevronsLeft className={currentSize.icon} />
          </button>
        )}

        {/* Page precedente */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${navButtonClass} ${currentSize.button}`}
          aria-label="Page precedente"
          title="Page precedente"
        >
          <ChevronLeft className={currentSize.icon} />
        </button>

        {/* Numeros de page */}
        <div className="flex items-center gap-1">
          {pages.map((page, index) => {
            if (page === 'dots') {
              return (
                <span
                  key={`dots-${index}`}
                  className={`${currentSize.button} inline-flex items-center justify-center text-[var(--text-muted)]`}
                >
                  ...
                </span>
              )
            }

            const isActive = page === currentPage

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`
                  ${isActive ? activeButtonClass : normalButtonClass}
                  ${currentSize.button}
                `}
                aria-label={`Page ${page}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {page}
              </button>
            )
          })}
        </div>

        {/* Page suivante */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${navButtonClass} ${currentSize.button}`}
          aria-label="Page suivante"
          title="Page suivante"
        >
          <ChevronRight className={currentSize.icon} />
        </button>

        {/* Derniere page */}
        {showFirstLast && (
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={`${navButtonClass} ${currentSize.button}`}
            aria-label="Derniere page"
            title="Derniere page"
          >
            <ChevronsRight className={currentSize.icon} />
          </button>
        )}
      </div>
    </nav>
  )
})

export default Pagination
