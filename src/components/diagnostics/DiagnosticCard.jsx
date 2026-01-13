/**
 * Composant carte d'affichage d'un diagnostic immobilier
 */

import { useState } from 'react'
import {
  Zap, Cloud, AlertTriangle, Shield, Flame, Plug,
  AlertCircle, Bug, Maximize, Droplet, Volume2,
  Calendar, Building2, FileText, Trash2, Edit, Eye,
  Download, Clock, CheckCircle, XCircle
} from 'lucide-react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import { DIAGNOSTIC_TYPES, ENERGY_CLASSES, GES_CLASSES } from '../../constants/diagnosticConstants'
import { STAT_ICON_STYLES } from '../../constants/designSystem'

// Mapping des icônes
const ICONS = {
  Zap, Cloud, AlertTriangle, Shield, Flame, Plug,
  AlertCircle, Bug, Maximize, Droplet, Volume2
}

/**
 * Carte d'affichage d'un diagnostic
 */
function DiagnosticCard({
  diagnostic,
  onEdit,
  onDelete,
  onView,
  showLot = false,
  compact = false
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const typeInfo = DIAGNOSTIC_TYPES[diagnostic.type] || {
    label: diagnostic.type,
    icon: 'FileText'
  }
  const Icon = ICONS[typeInfo.icon] || FileText
  const status = diagnostic.expirationStatus || { label: 'Inconnu', color: 'default' }

  // Formatage des dates
  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // Gestion de la suppression
  const handleDelete = async () => {
    if (!onDelete) return
    try {
      setDeleting(true)
      await onDelete(diagnostic.id)
      setShowDeleteModal(false)
    } catch (err) {
      console.error('Erreur suppression:', err)
    } finally {
      setDeleting(false)
    }
  }

  // Badge de statut
  const getStatusBadge = () => {
    const badgeVariants = {
      success: 'success',
      warning: 'warning',
      danger: 'danger',
      info: 'info',
      default: 'default'
    }

    return (
      <Badge variant={badgeVariants[status.color] || 'default'}>
        {status.label}
        {status.daysUntil !== undefined && status.daysUntil >= 0 && (
          <span className="ml-1 text-xs">({status.daysUntil}j)</span>
        )}
      </Badge>
    )
  }

  // Affichage DPE compact
  const renderDPEBadge = () => {
    if (diagnostic.type !== 'dpe' || !diagnostic.dpe_rating) return null

    const dpeInfo = ENERGY_CLASSES[diagnostic.dpe_rating] || {}
    const gesInfo = diagnostic.ges_rating ? GES_CLASSES[diagnostic.ges_rating] : null

    return (
      <div className="flex items-center gap-2 mt-2">
        <div
          className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: dpeInfo.color }}
          title={`DPE: ${diagnostic.dpe_rating} (${diagnostic.dpe_value} kWh/m2/an)`}
        >
          {diagnostic.dpe_rating}
        </div>
        {gesInfo && (
          <div
            className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: gesInfo.color }}
            title={`GES: ${diagnostic.ges_rating} (${diagnostic.ges_value} kg CO2/m2/an)`}
          >
            {diagnostic.ges_rating}
          </div>
        )}
        <span className="text-xs text-[var(--text-muted)]">
          {diagnostic.dpe_value} kWh/m2/an
        </span>
      </div>
    )
  }

  // Helper pour obtenir les styles d'icône selon le statut
  const getStatusIconStyles = () => {
    if (status.color === 'danger') {
      return { container: STAT_ICON_STYLES.coral.container, icon: STAT_ICON_STYLES.coral.icon }
    }
    if (status.color === 'warning') {
      return { container: STAT_ICON_STYLES.amber.container, icon: STAT_ICON_STYLES.amber.icon }
    }
    return { container: STAT_ICON_STYLES.blue.container, icon: STAT_ICON_STYLES.blue.icon }
  }

  const statusStyles = getStatusIconStyles()

  // Version compacte
  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-[var(--surface-elevated)] rounded-lg hover:bg-[var(--surface-hover)] transition-colors">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${statusStyles.container}`}>
            <Icon className={`w-4 h-4 ${statusStyles.icon}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text)]">{typeInfo.label}</p>
            <p className="text-xs text-[var(--text-muted)]">
              {diagnostic.expiration_date ? `Expire: ${formatDate(diagnostic.expiration_date)}` : 'Validité illimitée'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          {onView && (
            <button
              onClick={() => onView(diagnostic)}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--color-electric-blue)]"
              title="Voir détails"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  // Version complète
  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <div className="p-4">
          {/* En-tête */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${statusStyles.container}`}>
                <Icon className={`w-5 h-5 ${statusStyles.icon}`} />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text)]">{typeInfo.label}</h3>
                <p className="text-sm text-[var(--text-muted)]">{typeInfo.fullLabel}</p>
              </div>
            </div>
            {getStatusBadge()}
          </div>

          {/* Lot associé */}
          {showLot && diagnostic.lot && (
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-3">
              <Building2 className="w-4 h-4" />
              <span>{diagnostic.lot.name}</span>
              {diagnostic.lot.property && (
                <span className="text-[var(--text-muted)]">- {diagnostic.lot.property.name}</span>
              )}
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
              <div>
                <span className="text-[var(--text-muted)]">Réalisé: </span>
                <span className="font-medium">{formatDate(diagnostic.performed_date)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-[var(--text-muted)]" />
              <div>
                <span className="text-[var(--text-muted)]">Expire: </span>
                <span className={`font-medium ${status.color === 'danger' ? 'text-red-600' : status.color === 'warning' ? 'text-amber-600' : ''}`}>
                  {diagnostic.expiration_date ? formatDate(diagnostic.expiration_date) : 'Illimité'}
                </span>
              </div>
            </div>
          </div>

          {/* DPE spécifique */}
          {renderDPEBadge()}

          {/* Résultat (amiante, plomb, etc.) */}
          {diagnostic.is_positive !== null && diagnostic.type !== 'dpe' && (
            <div className={`flex items-center gap-2 mt-3 p-2 rounded ${diagnostic.is_positive ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {diagnostic.is_positive ? (
                <>
                  <XCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Présence détectée</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Absence confirmée</span>
                </>
              )}
            </div>
          )}

          {/* Diagnostiqueur */}
          {diagnostic.diagnostician_name && (
            <div className="mt-3 text-sm text-[var(--text-muted)]">
              <span>Par: {diagnostic.diagnostician_name}</span>
              {diagnostic.diagnostician_company && (
                <span> ({diagnostic.diagnostician_company})</span>
              )}
            </div>
          )}

          {/* Document associé */}
          {diagnostic.document && (
            <div className="mt-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--text-muted)]" />
              <a
                href="#"
                className="text-sm text-blue-600 hover:underline truncate"
                onClick={(e) => {
                  e.preventDefault()
                  // TODO: Ouvrir le document
                }}
              >
                {diagnostic.document.file_name}
              </a>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t">
            {onView && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onView(diagnostic)}
              >
                <Eye className="w-4 h-4 mr-1" />
                Détails
              </Button>
            )}
            {onEdit && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onEdit(diagnostic)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Modifier
              </Button>
            )}
            {onDelete && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Supprimer
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Modal de confirmation suppression */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmer la suppression"
        size="sm"
      >
        <p className="text-[var(--text-secondary)] mb-4">
          Êtes-vous sûr de vouloir supprimer ce diagnostic <strong>{typeInfo.label}</strong> ?
          Cette action est irréversible.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={deleting}
          >
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Suppression...' : 'Supprimer'}
          </Button>
        </div>
      </Modal>
    </>
  )
}

export default DiagnosticCard
