/**
 * Composant Skeleton pour les états de chargement
 * Types disponibles: text, title, avatar, card, button, image, table-row, stat-card, list-card
 */
function Skeleton({ type = 'text', count = 1, className = '' }) {
  const skeletons = Array.from({ length: count }, (_, index) => index)

  const baseClass = 'animate-pulse bg-[var(--surface-elevated)] rounded-xl'

  const types = {
    text: 'h-4 w-full',
    title: 'h-8 w-3/4',
    avatar: 'h-12 w-12 rounded-full',
    card: 'h-48 w-full',
    button: 'h-10 w-24',
    image: 'h-64 w-full',
    'table-row': 'h-16 w-full',
    'stat-card': 'h-24 w-full',
    'list-card': 'h-40 w-full'
  }

  const typeClass = types[type] || types.text

  // Card skeleton avec structure interne
  if (type === 'card') {
    return (
      <div className={`space-y-4 ${className}`}>
        {skeletons.map((index) => (
          <div key={index} className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] p-6 space-y-4">
            <div className={`${baseClass} h-6 w-1/2`} />
            <div className={`${baseClass} h-4 w-full`} />
            <div className={`${baseClass} h-4 w-5/6`} />
            <div className={`${baseClass} h-4 w-4/6`} />
          </div>
        ))}
      </div>
    )
  }

  // Stat card skeleton (pour les StatCards du dashboard)
  if (type === 'stat-card') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {skeletons.map((index) => (
          <div key={index} className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className={`${baseClass} h-4 w-1/2`} />
                <div className={`${baseClass} h-8 w-3/4`} />
              </div>
              <div className={`${baseClass} h-12 w-12 rounded-xl`} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // List card skeleton (pour les cartes de liste comme Tenants)
  if (type === 'list-card') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 ${className}`}>
        {skeletons.map((index) => (
          <div key={index} className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className={`${baseClass} h-12 w-12 rounded-full`} />
              <div className="flex-1 space-y-2">
                <div className={`${baseClass} h-5 w-2/3`} />
                <div className={`${baseClass} h-4 w-1/3`} />
              </div>
            </div>
            <div className="space-y-2 pt-3 border-t border-[var(--border)]">
              <div className={`${baseClass} h-4 w-full`} />
              <div className={`${baseClass} h-4 w-4/5`} />
            </div>
            <div className="flex gap-2 pt-3 border-t border-[var(--border)]">
              <div className={`${baseClass} h-8 flex-1`} />
              <div className={`${baseClass} h-8 w-8`} />
              <div className={`${baseClass} h-8 w-8`} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Table row skeleton
  if (type === 'table-row') {
    return (
      <div className={`space-y-2 ${className}`}>
        {skeletons.map((index) => (
          <div key={index} className="flex items-center gap-4 p-4 bg-[var(--surface)] border-b border-[var(--border)]">
            <div className={`${baseClass} h-4 w-1/6`} />
            <div className={`${baseClass} h-4 w-1/4`} />
            <div className={`${baseClass} h-4 w-1/5`} />
            <div className={`${baseClass} h-4 w-1/6`} />
            <div className={`${baseClass} h-4 w-1/8`} />
          </div>
        ))}
      </div>
    )
  }

  // Text skeleton avec lignes multiples
  if (type === 'text') {
    return (
      <div className={`space-y-3 ${className}`}>
        {skeletons.map((index) => (
          <div key={index} className={`${baseClass} ${typeClass}`} />
        ))}
      </div>
    )
  }

  // Default skeleton
  return (
    <div className={`${baseClass} ${typeClass} ${className}`} />
  )
}

export default Skeleton
