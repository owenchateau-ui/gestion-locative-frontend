/**
 * Composant d'alertes pour les diagnostics expirés ou à expirer
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle, Clock, XCircle, ChevronRight,
  Building2, Calendar, RefreshCw
} from 'lucide-react'
import Alert from '../ui/Alert'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { getExpiringDiagnostics } from '../../services/diagnosticService'
import { DIAGNOSTIC_TYPES, ALERT_THRESHOLDS } from '../../constants/diagnosticConstants'
import { STAT_ICON_STYLES } from '../../constants/designSystem'

/**
 * Widget d'alertes diagnostics pour le dashboard
 */
function DiagnosticAlerts({
  entityId = null,
  maxItems = 5,
  showRefresh = true,
  onAlertClick = null
}) {
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadAlerts()
  }, [entityId])

  const loadAlerts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getExpiringDiagnostics(ALERT_THRESHOLDS.INFO)

      // Filtrer par entité si spécifié
      let filtered = data
      if (entityId) {
        filtered = data.filter(d => d.lot?.property?.entity?.id === entityId)
      }

      // Trier par urgence (expirés d'abord, puis par date)
      filtered.sort((a, b) => {
        const daysA = a.expirationStatus?.daysUntil ?? Infinity
        const daysB = b.expirationStatus?.daysUntil ?? Infinity
        return daysA - daysB
      })

      setAlerts(filtered.slice(0, maxItems))
    } catch (err) {
      console.error('Erreur chargement alertes:', err)
      setError('Impossible de charger les alertes')
    } finally {
      setLoading(false)
    }
  }

  // Compteurs par catégorie
  const counts = {
    expired: alerts.filter(a => a.expirationStatus?.daysUntil < 0).length,
    critical: alerts.filter(a => a.expirationStatus?.daysUntil >= 0 && a.expirationStatus?.daysUntil <= 30).length,
    warning: alerts.filter(a => a.expirationStatus?.daysUntil > 30).length
  }

  const handleClick = (diagnostic) => {
    if (onAlertClick) {
      onAlertClick(diagnostic)
    } else {
      navigate(`/diagnostics?lotId=${diagnostic.lot_id}`)
    }
  }

  // État vide
  if (!loading && alerts.length === 0) {
    return (
      <div className={`p-4 rounded-lg border border-[var(--border)] ${STAT_ICON_STYLES.emerald.container}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${STAT_ICON_STYLES.emerald.container}`}>
            <Clock className={`w-5 h-5 ${STAT_ICON_STYLES.emerald.icon}`} />
          </div>
          <div>
            <p className={`font-medium ${STAT_ICON_STYLES.emerald.icon}`}>Tous les diagnostics sont à jour</p>
            <p className="text-sm text-[var(--text-muted)]">Aucun diagnostic n'expire dans les 60 prochains jours</p>
          </div>
        </div>
      </div>
    )
  }

  // Chargement
  if (loading) {
    return (
      <div className="p-4 bg-[var(--surface-elevated)] rounded-lg animate-pulse">
        <div className="h-4 bg-[var(--border)] rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-[var(--border)] rounded w-1/2"></div>
      </div>
    )
  }

  // Erreur
  if (error) {
    return (
      <Alert variant="error" title="Erreur">
        {error}
        <Button variant="secondary" size="sm" className="mt-2" onClick={loadAlerts}>
          <RefreshCw className="w-4 h-4 mr-1" />
          Réessayer
        </Button>
      </Alert>
    )
  }

  return (
    <div className="space-y-3">
      {/* En-tête avec compteurs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-[var(--text)]">Diagnostics à renouveler</h3>
        </div>
        <div className="flex items-center gap-2">
          {counts.expired > 0 && (
            <Badge variant="danger">{counts.expired} expiré{counts.expired > 1 ? 's' : ''}</Badge>
          )}
          {counts.critical > 0 && (
            <Badge variant="warning">{counts.critical} urgent{counts.critical > 1 ? 's' : ''}</Badge>
          )}
          {showRefresh && (
            <button
              onClick={loadAlerts}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
              title="Actualiser"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Liste des alertes */}
      <div className="space-y-2">
        {alerts.map((diagnostic) => {
          const typeInfo = DIAGNOSTIC_TYPES[diagnostic.type] || { label: diagnostic.type }
          const status = diagnostic.expirationStatus || {}
          const isExpired = status.daysUntil < 0

          // Déterminer les styles selon le statut
          const getAlertStyles = () => {
            if (isExpired) {
              return { container: STAT_ICON_STYLES.coral.container, icon: STAT_ICON_STYLES.coral.icon }
            }
            if (status.daysUntil <= 30) {
              return { container: STAT_ICON_STYLES.amber.container, icon: STAT_ICON_STYLES.amber.icon }
            }
            return { container: STAT_ICON_STYLES.blue.container, icon: STAT_ICON_STYLES.blue.icon }
          }

          const alertStyles = getAlertStyles()

          return (
            <div
              key={diagnostic.id}
              onClick={() => handleClick(diagnostic)}
              className={`
                flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors border border-[var(--border)]
                ${alertStyles.container} hover:opacity-80
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${alertStyles.container}`}>
                  {isExpired ? (
                    <XCircle className={`w-4 h-4 ${alertStyles.icon}`} />
                  ) : (
                    <Clock className={`w-4 h-4 ${alertStyles.icon}`} />
                  )}
                </div>
                <div>
                  <p className="font-medium text-[var(--text)]">
                    {typeInfo.label}
                    <span className="ml-2 text-sm font-normal text-[var(--text-muted)]">
                      - {diagnostic.lot?.name}
                    </span>
                  </p>
                  <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <Building2 className="w-3 h-3" />
                    <span>{diagnostic.lot?.property?.name}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className={`text-sm font-medium ${alertStyles.icon}`}>
                    {isExpired
                      ? `Expiré depuis ${Math.abs(status.daysUntil)} jour${Math.abs(status.daysUntil) > 1 ? 's' : ''}`
                      : `Expire dans ${status.daysUntil} jour${status.daysUntil > 1 ? 's' : ''}`
                    }
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {new Date(diagnostic.expiration_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Lien voir tous */}
      {alerts.length >= maxItems && (
        <div className="text-center pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/diagnostics?filter=expiring')}
          >
            Voir tous les diagnostics
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}

/**
 * Version compacte pour la sidebar ou widgets
 */
export function DiagnosticAlertsBadge({ entityId = null }) {
  const navigate = useNavigate()
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCount()
  }, [entityId])

  const loadCount = async () => {
    try {
      const data = await getExpiringDiagnostics(ALERT_THRESHOLDS.INFO)
      let filtered = data
      if (entityId) {
        filtered = data.filter(d => d.lot?.property?.entity?.id === entityId)
      }
      setCount(filtered.length)
    } catch (err) {
      console.error('Erreur comptage alertes:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading || count === 0) return null

  return (
    <button
      onClick={() => navigate('/diagnostics?filter=expiring')}
      className="flex items-center gap-2 px-3 py-2 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
    >
      <AlertTriangle className="w-4 h-4 text-amber-600" />
      <span className="text-sm font-medium text-amber-800">
        {count} diagnostic{count > 1 ? 's' : ''} à renouveler
      </span>
    </button>
  )
}

export default DiagnosticAlerts
