import { Euro, TrendingUp, AlertTriangle, CheckCircle, User } from 'lucide-react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Alert from '../ui/Alert'
import { STAT_ICON_STYLES } from '../../constants/designSystem'

function FinancialSummary({ tenants = [], lease = null, housingAssistance = 0 }) {
  const formatCurrency = (amount) => {
    if (!amount) return '0 €'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  // Calculer les revenus par locataire
  const tenantsWithIncome = tenants.map(tenant => {
    const monthlyIncome = parseFloat(tenant.monthly_income) || 0
    const otherIncome = parseFloat(tenant.other_income) || 0
    const totalIncome = monthlyIncome + otherIncome

    return {
      ...tenant,
      monthlyIncome,
      otherIncome,
      totalIncome
    }
  })

  // Calculer le total des revenus du groupe
  const totalGroupIncome = tenantsWithIncome.reduce((sum, t) => sum + t.totalIncome, 0)

  // Calculer le loyer total (loyer + charges)
  const rentAmount = lease ? parseFloat(lease.rent_amount) || 0 : 0
  const chargesAmount = lease ? parseFloat(lease.charges_amount) || 0 : 0
  const totalRent = rentAmount + chargesAmount

  // Calculer le loyer net après déduction des aides
  const assistanceAmount = parseFloat(housingAssistance) || 0
  const netRent = totalRent - assistanceAmount

  // Calculer le taux d'effort (sur le loyer net)
  const effortRate = netRent > 0 && totalGroupIncome > 0
    ? (netRent / totalGroupIncome) * 100
    : 0

  // Déterminer le niveau de solvabilité
  const getSolvabilityLevel = () => {
    if (effortRate === 0) {
      return { level: 'unknown', label: 'Non calculable', color: 'default', variant: 'default' }
    }
    if (effortRate <= 33) {
      return { level: 'excellent', label: 'Excellente solvabilité', color: 'green', variant: 'success' }
    }
    if (effortRate <= 40) {
      return { level: 'good', label: 'Bonne solvabilité', color: 'blue', variant: 'info' }
    }
    if (effortRate <= 50) {
      return { level: 'acceptable', label: 'Solvabilité acceptable', color: 'orange', variant: 'warning' }
    }
    return { level: 'weak', label: 'Solvabilité faible', color: 'red', variant: 'danger' }
  }

  const solvability = getSolvabilityLevel()

  // Ratio recommandé (revenus / loyer net)
  const incomeToRentRatio = netRent > 0 ? totalGroupIncome / netRent : 0

  return (
    <Card title="Récapitulatif financier" padding>
      <div className="space-y-6">
        {/* Revenus par locataire */}
        {tenantsWithIncome.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Revenus mensuels par locataire</p>
            <div className="space-y-3">
              {tenantsWithIncome.map((tenant) => (
                <div key={tenant.id} className="flex items-center justify-between p-3 bg-[var(--surface-elevated)] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      tenant.is_main_tenant ? STAT_ICON_STYLES.blue.container : STAT_ICON_STYLES.purple.container
                    }`}>
                      <User className={`w-4 h-4 ${
                        tenant.is_main_tenant ? STAT_ICON_STYLES.blue.icon : STAT_ICON_STYLES.purple.icon
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {tenant.first_name} {tenant.last_name}
                      </p>
                      {tenant.otherIncome > 0 && (
                        <p className="text-xs text-gray-500">
                          {formatCurrency(tenant.monthlyIncome)} + {formatCurrency(tenant.otherIncome)}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    {formatCurrency(tenant.totalIncome)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total des revenus */}
        <div className="border-t border-[var(--border)] pt-4">
          <div className="flex items-center justify-between p-4 rounded-lg stat-icon-blue">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 property-icon-blue rounded-full flex items-center justify-center shadow-glow-blue">
                <Euro className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`text-sm ${STAT_ICON_STYLES.blue.icon}`}>Revenus totaux du groupe</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {tenants.length > 1 ? `${tenants.length} locataires` : '1 locataire'}
                </p>
              </div>
            </div>
            <p className="text-2xl font-bold font-display text-[var(--text)]">
              {formatCurrency(totalGroupIncome)}
            </p>
          </div>
        </div>

        {/* Bail et loyer */}
        {lease && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Loyer mensuel</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Loyer</span>
                <span className="font-medium text-gray-900">{formatCurrency(rentAmount)}</span>
              </div>
              {chargesAmount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Charges</span>
                  <span className="font-medium text-gray-900">{formatCurrency(chargesAmount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm border-t pt-2">
                <span className="font-medium text-gray-700">Total loyer</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(totalRent)}
                </span>
              </div>
              {assistanceAmount > 0 && (
                <>
                  <div className="flex items-center justify-between text-sm text-green-600">
                    <span>Aides au logement (CAF/APL)</span>
                    <span className="font-medium">- {formatCurrency(assistanceAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm border-t border-green-200 bg-green-50 px-3 py-2 rounded">
                    <span className="font-semibold text-green-700">Loyer net à payer</span>
                    <span className="text-lg font-bold text-green-700">
                      {formatCurrency(netRent)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Indicateurs de solvabilité */}
        {lease && totalRent > 0 && (
          <div className="border-t pt-4 space-y-4">
            <p className="text-sm font-medium text-gray-700">Indicateurs de solvabilité</p>

            {/* Taux d'effort */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Taux d'effort</span>
                <span className={`text-sm font-bold ${
                  effortRate <= 33 ? 'text-green-600' :
                  effortRate <= 40 ? 'text-blue-600' :
                  effortRate <= 50 ? 'text-orange-600' :
                  'text-red-600'
                }`}>
                  {effortRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${
                    effortRate <= 33 ? 'bg-green-500' :
                    effortRate <= 40 ? 'bg-blue-500' :
                    effortRate <= 50 ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(effortRate, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Recommandé : {'<'} 33% (max 40%)
              </p>
            </div>

            {/* Ratio revenus/loyer */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className={`w-5 h-5 ${
                  incomeToRentRatio >= 3 ? 'text-green-500' :
                  incomeToRentRatio >= 2.5 ? 'text-blue-500' :
                  'text-orange-500'
                }`} />
                <span className="text-sm text-gray-600">Ratio revenus/loyer</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  {incomeToRentRatio.toFixed(2)}x
                </p>
                <p className="text-xs text-gray-500">Minimum recommandé : 3x</p>
              </div>
            </div>

            {/* Badge de solvabilité */}
            <div className="flex items-center gap-3 p-4 rounded-lg" style={{
              backgroundColor: solvability.level === 'excellent' ? '#F0FDF4' :
                               solvability.level === 'good' ? '#EFF6FF' :
                               solvability.level === 'acceptable' ? '#FFFBEB' :
                               solvability.level === 'weak' ? '#FEF2F2' :
                               '#F9FAFB'
            }}>
              {solvability.level === 'excellent' && <CheckCircle className="w-6 h-6 text-green-600" />}
              {solvability.level === 'good' && <CheckCircle className="w-6 h-6 text-blue-600" />}
              {solvability.level === 'acceptable' && <AlertTriangle className="w-6 h-6 text-orange-600" />}
              {solvability.level === 'weak' && <AlertTriangle className="w-6 h-6 text-red-600" />}

              <div className="flex-1">
                <Badge variant={solvability.variant}>
                  {solvability.label}
                </Badge>
                <p className="text-xs text-gray-600 mt-1">
                  {solvability.level === 'excellent' && 'Les revenus sont largement suffisants'}
                  {solvability.level === 'good' && 'Les revenus sont suffisants'}
                  {solvability.level === 'acceptable' && 'Les revenus sont limites, garantie recommandée'}
                  {solvability.level === 'weak' && 'Les revenus sont insuffisants, garantie solide nécessaire'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Alertes */}
        {!lease && (
          <Alert variant="info">
            Aucun bail associé. Associez un bail pour calculer la solvabilité.
          </Alert>
        )}

        {totalGroupIncome === 0 && (
          <Alert variant="warning" title="Attention">
            Aucun revenu renseigné pour les locataires.
          </Alert>
        )}

        {lease && effortRate > 50 && (
          <Alert variant="danger" title="Risque élevé">
            Le taux d'effort dépasse 50%. Il est fortement recommandé d'exiger une garantie solide (Visale, organisme de cautionnement ou garant avec revenus 3x supérieurs au loyer).
          </Alert>
        )}
      </div>
    </Card>
  )
}

export default FinancialSummary
