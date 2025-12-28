import PropTypes from 'prop-types'

/**
 * Loading - Composant de chargement réutilisable
 *
 * Variants:
 * - spinner: Spinner animé (défaut)
 * - skeleton: Skeleton loader
 * - dots: Points animés
 *
 * Sizes:
 * - sm: Petit
 * - md: Moyen (défaut)
 * - lg: Grand
 *
 * Usage:
 * <Loading />
 * <Loading variant="dots" message="Chargement des données..." />
 * <Loading variant="skeleton" count={3} />
 * <Loading size="lg" center />
 */

function Loading({
  variant = 'spinner',
  size = 'md',
  message = 'Chargement...',
  center = false,
  fullScreen = false,
  count = 1
}) {
  // Tailles
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  // Spinner animé
  const SpinnerLoader = () => (
    <div className={`flex flex-col items-center gap-3 ${center ? 'justify-center min-h-64' : ''}`}>
      <div className="relative">
        <div className={`${sizes[size]} border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin`} />
      </div>
      {message && (
        <p className={`${textSizes[size]} text-gray-600 animate-pulse`}>
          {message}
        </p>
      )}
    </div>
  )

  // Points animés
  const DotsLoader = () => (
    <div className={`flex flex-col items-center gap-3 ${center ? 'justify-center min-h-64' : ''}`}>
      <div className="flex gap-2">
        <div className={`${sizes[size]} bg-blue-600 rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
        <div className={`${sizes[size]} bg-blue-600 rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
        <div className={`${sizes[size]} bg-blue-600 rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
      </div>
      {message && (
        <p className={`${textSizes[size]} text-gray-600`}>
          {message}
        </p>
      )}
    </div>
  )

  // Skeleton loader
  const SkeletonLoader = () => (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
      ))}
    </div>
  )

  // Pulse loader (cartes)
  const PulseLoader = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-10 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )

  // Rendu selon le variant
  let content
  switch (variant) {
    case 'dots':
      content = <DotsLoader />
      break
    case 'skeleton':
      content = <SkeletonLoader />
      break
    case 'pulse':
      content = <PulseLoader />
      break
    case 'spinner':
    default:
      content = <SpinnerLoader />
  }

  // Wrapper fullScreen si nécessaire
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
        {content}
      </div>
    )
  }

  return content
}

Loading.propTypes = {
  variant: PropTypes.oneOf(['spinner', 'dots', 'skeleton', 'pulse']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  message: PropTypes.string,
  center: PropTypes.bool,
  fullScreen: PropTypes.bool,
  count: PropTypes.number
}

export default Loading
