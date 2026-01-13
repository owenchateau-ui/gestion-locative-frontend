import { User, Mail, Phone, Briefcase, Euro, Calendar, Star } from 'lucide-react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { PROFESSIONAL_STATUS, CONTRACT_TYPES, RELATIONSHIPS } from '../../constants/tenantConstants'
import { STAT_ICON_STYLES } from '../../constants/designSystem'

function TenantCard({ tenant, onEdit, onDelete, showActions = true }) {
  const formatCurrency = (amount) => {
    if (!amount) return '0 €'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const professionalStatus = tenant.professional_status
    ? PROFESSIONAL_STATUS[tenant.professional_status]
    : null
  const contractType = tenant.contract_type ? CONTRACT_TYPES[tenant.contract_type] : null
  const relationship = tenant.relationship ? RELATIONSHIPS[tenant.relationship] : null

  const totalIncome = (parseFloat(tenant.monthly_income) || 0) + (parseFloat(tenant.other_income) || 0)

  return (
    <Card padding>
      <div className="space-y-4">
        {/* En-tête avec nom et badge */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
              tenant.is_main_tenant ? STAT_ICON_STYLES.blue.container : STAT_ICON_STYLES.purple.container
            }`}>
              <User className={`w-6 h-6 ${tenant.is_main_tenant ? STAT_ICON_STYLES.blue.icon : STAT_ICON_STYLES.purple.icon}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {tenant.first_name} {tenant.last_name}
                </h3>
                {tenant.is_main_tenant && (
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                )}
              </div>
              {relationship && (
                <Badge variant="default" className="text-xs">
                  {relationship.label}
                </Badge>
              )}
            </div>
          </div>

          {showActions && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit?.(tenant)}>
                Modifier
              </Button>
              <Button variant="danger" size="sm" onClick={() => onDelete?.(tenant)}>
                Supprimer
              </Button>
            </div>
          )}
        </div>

        {/* Coordonnées */}
        <div className="space-y-2 border-t pt-4">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{tenant.email}</span>
          </div>
          {tenant.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{tenant.phone}</span>
            </div>
          )}
          {tenant.birth_date && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                Né(e) le {formatDate(tenant.birth_date)}
              </span>
            </div>
          )}
        </div>

        {/* Situation professionnelle */}
        {professionalStatus && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Situation professionnelle</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{professionalStatus.label}</span>
              </div>
              {tenant.employer_name && (
                <p className="text-sm text-gray-600 ml-6">
                  {tenant.employer_name}
                  {tenant.job_title && ` - ${tenant.job_title}`}
                </p>
              )}
              {contractType && (
                <p className="text-sm text-gray-600 ml-6">{contractType.label}</p>
              )}
              {tenant.employment_start_date && (
                <p className="text-sm text-gray-500 ml-6">
                  Depuis le {formatDate(tenant.employment_start_date)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Revenus */}
        {totalIncome > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Revenus mensuels</p>
            <div className="space-y-1">
              {tenant.monthly_income > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Salaire</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(tenant.monthly_income)}
                  </span>
                </div>
              )}
              {tenant.other_income > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Autres revenus</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(tenant.other_income)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm border-t pt-2">
                <span className="font-medium text-gray-700">Total</span>
                <span className="font-bold text-gray-900 flex items-center gap-1">
                  <Euro className="w-4 h-4" />
                  {formatCurrency(totalIncome)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export default TenantCard
