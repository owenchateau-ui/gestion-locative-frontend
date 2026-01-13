import { User, Shield, Building, Landmark, FileCheck, HelpCircle, Edit, Trash2, ExternalLink } from 'lucide-react'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { GUARANTEE_TYPES } from '../../constants/tenantConstants'
import { calculateGuaranteeLevel } from '../../services/guaranteeService'
import { STAT_ICON_STYLES } from '../../constants/designSystem'

function GuaranteeCard({ guarantee, onEdit, onDelete, totalRent = 0 }) {
  const formatCurrency = (amount) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const typeInfo = GUARANTEE_TYPES[guarantee.guarantee_type]

  const getIcon = (iconName) => {
    const icons = {
      User: User,
      Shield: Shield,
      Building: Building,
      Landmark: Landmark,
      FileCheck: FileCheck,
      HelpCircle: HelpCircle
    }
    const Icon = icons[iconName] || HelpCircle
    return Icon
  }

  const Icon = typeInfo ? getIcon(typeInfo.icon) : HelpCircle

  // Calculer le niveau de garantie
  const level = calculateGuaranteeLevel([guarantee], totalRent)
  const levelColors = {
    excellent: 'success',
    very_good: 'success',
    good: 'info',
    standard: 'warning',
    weak: 'danger',
    none: 'danger'
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            guarantee.guarantee_type === 'physical_person' ? STAT_ICON_STYLES.blue.container :
            guarantee.guarantee_type === 'visale' ? STAT_ICON_STYLES.emerald.container :
            guarantee.guarantee_type === 'gli' ? STAT_ICON_STYLES.purple.container :
            'badge-bg-neutral'
          }`}>
            <Icon className={`w-5 h-5 ${
              guarantee.guarantee_type === 'physical_person' ? STAT_ICON_STYLES.blue.icon :
              guarantee.guarantee_type === 'visale' ? STAT_ICON_STYLES.emerald.icon :
              guarantee.guarantee_type === 'gli' ? STAT_ICON_STYLES.purple.icon :
              'text-[#64748B]'
            }`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-gray-900">{typeInfo?.label || guarantee.guarantee_type}</p>
              <Badge variant={levelColors[level.level] || 'default'} className="text-xs">
                {level.label}
              </Badge>
            </div>
            {typeInfo?.cost && (
              <p className="text-xs text-gray-500">{typeInfo.cost}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(guarantee)}
              className="text-gray-400 hover:text-blue-600 transition"
              title="Modifier"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(guarantee)}
              className="text-gray-400 hover:text-red-600 transition"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Détails selon le type */}
      <div className="space-y-2">
        {/* Garant physique */}
        {guarantee.guarantee_type === 'physical_person' && (
          <>
            <div className="flex items-start justify-between text-sm">
              <span className="text-gray-600">Nom du garant</span>
              <span className="font-medium text-gray-900 text-right">
                {guarantee.guarantor_first_name} {guarantee.guarantor_last_name}
              </span>
            </div>
            {guarantee.guarantor_relationship && (
              <div className="flex items-start justify-between text-sm">
                <span className="text-gray-600">Lien</span>
                <span className="text-gray-900">{guarantee.guarantor_relationship}</span>
              </div>
            )}
            {guarantee.guarantor_email && (
              <div className="flex items-start justify-between text-sm">
                <span className="text-gray-600">Email</span>
                <span className="text-gray-900">{guarantee.guarantor_email}</span>
              </div>
            )}
            {guarantee.guarantor_phone && (
              <div className="flex items-start justify-between text-sm">
                <span className="text-gray-600">Téléphone</span>
                <span className="text-gray-900">{guarantee.guarantor_phone}</span>
              </div>
            )}
            {guarantee.guarantor_monthly_income > 0 && (
              <div className="flex items-start justify-between text-sm border-t pt-2">
                <span className="text-gray-600">Revenus mensuels</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(guarantee.guarantor_monthly_income)}
                </span>
              </div>
            )}
          </>
        )}

        {/* Visale */}
        {guarantee.guarantee_type === 'visale' && (
          <>
            {guarantee.certificate_number && (
              <div className="flex items-start justify-between text-sm">
                <span className="text-gray-600">Numéro de visa</span>
                <span className="font-mono text-gray-900 text-xs">{guarantee.certificate_number}</span>
              </div>
            )}
            {guarantee.valid_from && guarantee.valid_until && (
              <div className="flex items-start justify-between text-sm">
                <span className="text-gray-600">Validité</span>
                <span className="text-gray-900">
                  {formatDate(guarantee.valid_from)} - {formatDate(guarantee.valid_until)}
                </span>
              </div>
            )}
            {typeInfo?.website && (
              <a
                href={typeInfo.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-2"
              >
                <ExternalLink className="w-3 h-3" />
                Voir le site Visale
              </a>
            )}
          </>
        )}

        {/* Organismes (GarantMe, Cautioneo, etc.) */}
        {['garantme', 'cautioneo', 'smartgarant', 'unkle', 'other'].includes(guarantee.guarantee_type) && (
          <>
            {guarantee.organism_name && (
              <div className="flex items-start justify-between text-sm">
                <span className="text-gray-600">Organisme</span>
                <span className="font-medium text-gray-900">{guarantee.organism_name}</span>
              </div>
            )}
            {guarantee.certificate_number && (
              <div className="flex items-start justify-between text-sm">
                <span className="text-gray-600">N° certificat</span>
                <span className="font-mono text-gray-900 text-xs">{guarantee.certificate_number}</span>
              </div>
            )}
            {guarantee.coverage_amount > 0 && (
              <div className="flex items-start justify-between text-sm">
                <span className="text-gray-600">Montant couvert</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(guarantee.coverage_amount)}
                </span>
              </div>
            )}
            {guarantee.annual_cost > 0 && (
              <div className="flex items-start justify-between text-sm">
                <span className="text-gray-600">Coût annuel</span>
                <span className="text-gray-900">{formatCurrency(guarantee.annual_cost)}</span>
              </div>
            )}
            {typeInfo?.website && (
              <a
                href={typeInfo.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-2"
              >
                <ExternalLink className="w-3 h-3" />
                Visiter le site
              </a>
            )}
          </>
        )}

        {/* GLI */}
        {guarantee.guarantee_type === 'gli' && (
          <div className="text-sm text-gray-600">
            Garantie Loyers Impayés souscrite par le propriétaire
          </div>
        )}

        {/* Caution bancaire */}
        {guarantee.guarantee_type === 'bank_guarantee' && (
          <>
            {guarantee.organism_name && (
              <div className="flex items-start justify-between text-sm">
                <span className="text-gray-600">Banque</span>
                <span className="font-medium text-gray-900">{guarantee.organism_name}</span>
              </div>
            )}
            {guarantee.coverage_amount > 0 && (
              <div className="flex items-start justify-between text-sm">
                <span className="text-gray-600">Montant bloqué</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(guarantee.coverage_amount)}
                </span>
              </div>
            )}
          </>
        )}

        {/* Notes */}
        {guarantee.notes && (
          <div className="border-t pt-2 mt-2">
            <p className="text-xs text-gray-500 mb-1">Notes</p>
            <p className="text-sm text-gray-700">{guarantee.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default GuaranteeCard
