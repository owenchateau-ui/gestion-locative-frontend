function Skeleton({ type = 'text', count = 1, className = '' }) {
  const skeletons = Array.from({ length: count }, (_, index) => index)

  const baseClass = 'animate-pulse bg-gray-200 rounded'

  const types = {
    text: 'h-4 w-full',
    title: 'h-8 w-3/4',
    avatar: 'h-12 w-12 rounded-full',
    card: 'h-48 w-full',
    button: 'h-10 w-24',
    image: 'h-64 w-full',
    table-row: 'h-16 w-full'
  }

  const typeClass = types[type] || types.text

  if (type === 'card') {
    return (
      <div className="space-y-4">
        {skeletons.map((index) => (
          <div key={index} className={`${baseClass} ${typeClass} ${className}`}>
            <div className="p-6 space-y-4">
              <div className={`${baseClass} h-6 w-1/2`} />
              <div className={`${baseClass} h-4 w-full`} />
              <div className={`${baseClass} h-4 w-5/6`} />
              <div className={`${baseClass} h-4 w-4/6`} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'table-row') {
    return (
      <div className="space-y-2">
        {skeletons.map((index) => (
          <div key={index} className={`${baseClass} ${typeClass} ${className}`} />
        ))}
      </div>
    )
  }

  if (type === 'text') {
    return (
      <div className="space-y-3">
        {skeletons.map((index) => (
          <div key={index} className={`${baseClass} ${typeClass} ${className}`} />
        ))}
      </div>
    )
  }

  return (
    <div className={`${baseClass} ${typeClass} ${className}`} />
  )
}

export default Skeleton
