/**
 * Widget d'affichage du DPE (Diagnostic de Performance Énergétique)
 * Affichage conforme à la réglementation française
 */

import { ENERGY_CLASSES, GES_CLASSES } from '../../constants/diagnosticConstants'

/**
 * Échelle DPE complète (A à G)
 */
function DPEScale({ currentClass, value, type = 'energy' }) {
  const classes = type === 'energy' ? ENERGY_CLASSES : GES_CLASSES
  const unit = type === 'energy' ? 'kWh/m2/an' : 'kg CO2/m2/an'

  return (
    <div className="space-y-1">
      {Object.entries(classes).map(([letter, info]) => {
        const isActive = letter === currentClass
        const width = {
          A: '30%', B: '40%', C: '50%', D: '60%', E: '70%', F: '80%', G: '90%'
        }[letter]

        return (
          <div key={letter} className="flex items-center gap-2">
            <div
              className={`
                relative h-6 rounded-r-full flex items-center justify-between px-2
                transition-all duration-300
                ${isActive ? 'ring-2 ring-offset-1 ring-gray-800 shadow-md' : ''}
              `}
              style={{
                width,
                backgroundColor: info.color,
                minWidth: '60px'
              }}
            >
              <span className="text-white font-bold text-sm">{letter}</span>
              {info.maxKwhM2 && (
                <span className="text-white text-xs">
                  ≤ {info.maxKwhM2}
                </span>
              )}
            </div>
            {isActive && value && (
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold">{value}</span>
                <span className="text-xs text-[var(--text-muted)]">{unit}</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/**
 * Badge DPE compact
 */
export function DPEBadge({ rating, value, size = 'md' }) {
  if (!rating) return null

  const info = ENERGY_CLASSES[rating] || {}
  const sizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizes[size]} rounded flex items-center justify-center text-white font-bold shadow-sm`}
        style={{ backgroundColor: info.color }}
        title={`DPE: ${rating}${value ? ` (${value} kWh/m2/an)` : ''}`}
      >
        {rating}
      </div>
      {value && size !== 'sm' && (
        <span className="text-xs text-[var(--text-muted)]">{value} kWh/m2/an</span>
      )}
    </div>
  )
}

/**
 * Badge GES compact
 */
export function GESBadge({ rating, value, size = 'md' }) {
  if (!rating) return null

  const info = GES_CLASSES[rating] || {}
  const sizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizes[size]} rounded flex items-center justify-center text-white font-bold shadow-sm`}
        style={{ backgroundColor: info.color }}
        title={`GES: ${rating}${value ? ` (${value} kg CO2/m2/an)` : ''}`}
      >
        {rating}
      </div>
      {value && size !== 'sm' && (
        <span className="text-xs text-[var(--text-muted)]">{value} kg CO2/m2/an</span>
      )}
    </div>
  )
}

/**
 * Widget DPE complet avec les deux échelles
 */
function DPEWidget({
  dpeRating,
  dpeValue,
  gesRating,
  gesValue,
  showLabels = true,
  compact = false
}) {
  if (!dpeRating && !gesRating) {
    return (
      <div className="text-[var(--text-muted)] text-sm italic">
        Aucun DPE disponible
      </div>
    )
  }

  // Version compacte : juste les badges
  if (compact) {
    return (
      <div className="flex items-center gap-3">
        {dpeRating && (
          <div className="flex items-center gap-1">
            {showLabels && <span className="text-xs text-[var(--text-muted)]">DPE:</span>}
            <DPEBadge rating={dpeRating} value={dpeValue} size="md" />
          </div>
        )}
        {gesRating && (
          <div className="flex items-center gap-1">
            {showLabels && <span className="text-xs text-[var(--text-muted)]">GES:</span>}
            <GESBadge rating={gesRating} value={gesValue} size="md" />
          </div>
        )}
      </div>
    )
  }

  // Version complète avec échelles
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Échelle DPE */}
      {dpeRating && (
        <div>
          <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
            Consommation énergétique
          </h4>
          <DPEScale currentClass={dpeRating} value={dpeValue} type="energy" />
          <p className="text-xs text-[var(--text-muted)] mt-2">
            {ENERGY_CLASSES[dpeRating]?.description}
          </p>
        </div>
      )}

      {/* Échelle GES */}
      {gesRating && (
        <div>
          <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
            Émissions de gaz à effet de serre
          </h4>
          <DPEScale currentClass={gesRating} value={gesValue} type="ges" />
          <p className="text-xs text-[var(--text-muted)] mt-2">
            {GES_CLASSES[gesRating]?.description}
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Sélecteur de classe énergétique pour les formulaires
 */
export function EnergyClassSelector({ value, onChange, type = 'energy', label }) {
  const classes = type === 'energy' ? ENERGY_CLASSES : GES_CLASSES

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          {label}
        </label>
      )}
      <div className="flex gap-1">
        {Object.entries(classes).map(([letter, info]) => (
          <button
            key={letter}
            type="button"
            onClick={() => onChange(letter)}
            className={`
              w-9 h-9 rounded font-bold text-white transition-all
              ${value === letter ? 'ring-2 ring-offset-2 ring-gray-800 scale-110' : 'opacity-70 hover:opacity-100'}
            `}
            style={{ backgroundColor: info.color }}
            title={`${letter} - ${info.description}`}
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  )
}

export default DPEWidget
