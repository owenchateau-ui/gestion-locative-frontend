import { memo } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Building, Building2, Home, MapPin, ChevronRight, Plus } from 'lucide-react'
import { PROPERTY_ICON_STYLES, STAT_ICON_STYLES, BADGE_STYLES } from '../../constants/designSystem'

/**
 * PropertiesList - Liste des propriétés Bold Geometric
 * Affiche les dernières propriétés avec leur statut
 * Icônes propriétés utilisent TYPE 2 (gradient solide + icône blanche + glow)
 */

const PropertyItem = memo(function PropertyItem({ property }) {
  const occupancyRate = property.totalLots > 0
    ? Math.round((property.occupiedLots / property.totalLots) * 100)
    : 0

  // Utilise les couleurs du design system pour le badge d'occupation
  const getOccupancyClass = (rate) => {
    if (rate >= 80) return PROPERTY_ICON_STYLES.emerald.container
    if (rate >= 50) return PROPERTY_ICON_STYLES.amber.container
    return PROPERTY_ICON_STYLES.coral.container
  }

  return (
    <Link
      to={`/properties/${property.id}`}
      className="group flex items-center gap-4 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl transition-all duration-200 hover:border-[#0055FF] hover:-translate-y-0.5 hover:shadow-card"
    >
      {/* Image ou icône - TYPE 2: gradient solide + icône blanche + glow */}
      <div
        className={`relative w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center ${PROPERTY_ICON_STYLES.blue.container} ${PROPERTY_ICON_STYLES.blue.shadow}`}
      >
        {property.image ? (
          <img src={property.image} alt={property.name} className="w-full h-full object-cover" />
        ) : (
          <Building2 className="w-7 h-7 text-white" />
        )}
        {/* Badge occupation - TYPE 2 style */}
        <div
          className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-[var(--surface)] flex items-center justify-center text-[9px] font-bold text-white ${getOccupancyClass(occupancyRate)}`}
        >
          {occupancyRate}
        </div>
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <p className="font-medium font-display text-[var(--text)] truncate group-hover:text-[#0055FF] transition-colors">
          {property.name}
        </p>
        <div className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate">{property.city}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="text-right">
        <p className="text-sm font-bold font-display text-[var(--text)]">
          {property.occupiedLots}/{property.totalLots}
        </p>
        <p className="text-xs text-[var(--text-muted)]">lots</p>
      </div>

      {/* Flèche */}
      <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[#0055FF] group-hover:translate-x-1 transition-all" />
    </Link>
  )
})

const PropertiesList = memo(function PropertiesList({
  properties = [],
  title = "Derniers biens",
  maxItems = 5,
  showAddButton = true,
  className = ''
}) {
  const displayedProperties = properties.slice(0, maxItems)

  return (
    <div className={`
      group/card relative overflow-hidden
      bg-[var(--surface)] border border-[var(--border)]
      rounded-2xl p-6
      transition-all duration-200
      hover:border-[#8B5CF6] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.12)]
      ${className}
    `}>
      {/* Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA]" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium font-display text-[var(--text-secondary)]">{title}</h3>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#8B5CF6]/10 text-[#8B5CF6]">
            {properties.length}
          </span>
        </div>
        {showAddButton && (
          <Link
            to="/properties/new"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0055FF]/10 text-[#0055FF] hover:bg-[#0055FF]/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter
          </Link>
        )}
      </div>

      {/* Liste */}
      {displayedProperties.length > 0 ? (
        <div className="space-y-3">
          {displayedProperties.map((property) => (
            <PropertyItem key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          {/* Empty state icon - TYPE 1: gradient 15% opacity + icône colorée */}
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${STAT_ICON_STYLES.purple.container}`}
          >
            <Building className={`w-6 h-6 ${STAT_ICON_STYLES.purple.icon}`} />
          </div>
          <p className="text-sm font-medium text-[var(--text)]">Aucun bien</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Commencez par ajouter un bien</p>
          <Link
            to="/properties/new"
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-br from-[#0055FF] to-[#8B5CF6] text-white hover:shadow-glow-blue transition-shadow"
          >
            <Plus className="w-4 h-4" />
            Ajouter un bien
          </Link>
        </div>
      )}

      {/* Lien voir tous */}
      {properties.length > maxItems && (
        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <Link
            to="/properties"
            className="flex items-center justify-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[#0055FF] transition-colors"
          >
            <span>Voir tous les biens</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  )
})

PropertiesList.propTypes = {
  properties: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    city: PropTypes.string,
    image: PropTypes.string,
    totalLots: PropTypes.number,
    occupiedLots: PropTypes.number
  })),
  title: PropTypes.string,
  maxItems: PropTypes.number,
  showAddButton: PropTypes.bool,
  className: PropTypes.string
}

export default PropertiesList
