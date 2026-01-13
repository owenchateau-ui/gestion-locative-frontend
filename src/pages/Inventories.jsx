/**
 * Page de liste des états des lieux
 */

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Alert from '../components/ui/Alert'
import Skeleton from '../components/ui/Skeleton'
import { useToast } from '../context/ToastContext'
import { getAllInventories, deleteInventory, getInventoryStats, getInventoryById } from '../services/inventoryService'
import { downloadEtatDesLieuxPDF } from '../components/documents/EtatDesLieuxPDF'
import { INVENTORY_TYPES, INVENTORY_STATUS } from '../constants/inventoryConstants'
import { STAT_ICON_STYLES } from '../constants/designSystem'
import {
  Plus,
  ClipboardList,
  Calendar,
  Home,
  Users,
  Eye,
  Trash2,
  FileText,
  Download,
  Filter,
  ArrowRight,
  CheckCircle,
  Clock,
  Edit
} from 'lucide-react'

function Inventories() {
  const [inventories, setInventories] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    type: '',
    status: ''
  })

  const navigate = useNavigate()
  const { success, error: showError } = useToast()

  useEffect(() => {
    loadInventories()
    loadStats()
  }, [filters])

  const loadInventories = async () => {
    try {
      setLoading(true)
      const data = await getAllInventories(filters)
      setInventories(data)
    } catch (err) {
      console.error('Erreur chargement états des lieux:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await getInventoryStats()
      setStats(data)
    } catch (err) {
      console.error('Erreur chargement stats:', err)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet état des lieux ?')) return

    try {
      await deleteInventory(id)
      success('État des lieux supprimé')
      loadInventories()
      loadStats()
    } catch (err) {
      showError(`Erreur lors de la suppression : ${err.message}`)
    }
  }

  const handleDownloadPdf = async (inventory) => {
    try {
      // Charger l'inventaire complet avec toutes les relations
      const fullInventory = await getInventoryById(inventory.id)

      // Charger l'inventaire d'entrée si c'est une sortie
      let entryInventory = null
      if (fullInventory.type === 'exit' && fullInventory.entry_inventory_id) {
        entryInventory = await getInventoryById(fullInventory.entry_inventory_id)
      }

      downloadEtatDesLieuxPDF(fullInventory, {
        entryInventory,
        showComparison: fullInventory.type === 'exit' && !!entryInventory,
        includePhotos: true
      })
      success('PDF téléchargé avec succès')
    } catch (err) {
      console.error('Erreur génération PDF:', err)
      showError('Erreur lors de la génération du PDF')
    }
  }

  const getStatusBadge = (status) => {
    const statusInfo = INVENTORY_STATUS[status]
    const variants = {
      draft: 'warning',
      completed: 'info',
      signed: 'success'
    }
    return (
      <Badge variant={variants[status] || 'default'}>
        {statusInfo?.icon} {statusInfo?.label || status}
      </Badge>
    )
  }

  const getTypeBadge = (type) => {
    const typeInfo = INVENTORY_TYPES[type]
    const variants = {
      entry: 'success',
      exit: 'warning'
    }
    return (
      <Badge variant={variants[type] || 'default'}>
        {typeInfo?.icon} {typeInfo?.label || type}
      </Badge>
    )
  }

  // Grouper par bail
  const groupedInventories = inventories.reduce((acc, inv) => {
    const leaseId = inv.lease?.id
    if (!acc[leaseId]) {
      acc[leaseId] = {
        lease: inv.lease,
        inventories: []
      }
    }
    acc[leaseId].inventories.push(inv)
    return acc
  }, {})

  return (
    <DashboardLayout title="États des lieux">
      <div className="space-y-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card padding={true}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--color-electric-blue)]/10 rounded-xl">
                  <ClipboardList className="w-5 h-5 text-[var(--color-electric-blue)]" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-[var(--text)]">{stats.total}</p>
                  <p className="text-sm text-[var(--text-muted)]">Total</p>
                </div>
              </div>
            </Card>

            <Card padding={true}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${STAT_ICON_STYLES.emerald.container}`}>
                  <ArrowRight className={`w-5 h-5 ${STAT_ICON_STYLES.emerald.icon}`} />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-[var(--text)]">{stats.entry}</p>
                  <p className="text-sm text-[var(--text-muted)]">Entrées</p>
                </div>
              </div>
            </Card>

            <Card padding={true}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${STAT_ICON_STYLES.coral.container}`}>
                  <ArrowRight className={`w-5 h-5 rotate-180 ${STAT_ICON_STYLES.coral.icon}`} />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-[var(--text)]">{stats.exit}</p>
                  <p className="text-sm text-[var(--text-muted)]">Sorties</p>
                </div>
              </div>
            </Card>

            <Card padding={true}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${STAT_ICON_STYLES.amber.container}`}>
                  <Clock className={`w-5 h-5 ${STAT_ICON_STYLES.amber.icon}`} />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-[var(--text)]">{stats.draft}</p>
                  <p className="text-sm text-[var(--text-muted)]">Brouillons</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Actions et filtres */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none text-sm transition-colors"
            >
              <option value="">Tous les types</option>
              <option value="entry">Entrée</option>
              <option value="exit">Sortie</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none text-sm transition-colors"
            >
              <option value="">Tous les statuts</option>
              <option value="draft">Brouillon</option>
              <option value="completed">Terminé</option>
              <option value="signed">Signé</option>
            </select>
          </div>

          <Button
            variant="primary"
            onClick={() => navigate('/inventories/new')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvel état des lieux
          </Button>
        </div>

        {/* Erreur */}
        {error && (
          <Alert variant="error" title="Erreur">
            {error}
          </Alert>
        )}

        {/* Chargement */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton type="card" count={3} />
          </div>
        ) : inventories.length === 0 ? (
          /* État vide */
          <Card padding={true}>
            <div className="text-center py-12">
              <ClipboardList className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
              <h3 className="text-lg font-display font-semibold text-[var(--text)] mb-2">
                Aucun état des lieux
              </h3>
              <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
                Les états des lieux permettent de documenter l'état du logement
                à l'entrée et à la sortie du locataire.
              </p>
              <Button
                variant="primary"
                onClick={() => navigate('/inventories/new')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer le premier état des lieux
              </Button>
            </div>
          </Card>
        ) : (
          /* Liste des états des lieux */
          <div className="space-y-4">
            {inventories.map(inventory => {
              const lease = inventory.lease
              const lot = lease?.lot
              const property = lot?.property
              const tenant = lease?.tenant
              const tenantName = `${tenant?.first_name || ''} ${tenant?.last_name || ''}`.trim()

              return (
                <Card key={inventory.id} padding={false}>
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Infos principales */}
                      <div className="flex items-start gap-4">
                        <div className={`
                          p-3 rounded-xl
                          ${inventory.type === 'entry' ? STAT_ICON_STYLES.emerald.container : STAT_ICON_STYLES.coral.container}
                        `}>
                          <ClipboardList className={`
                            w-6 h-6
                            ${inventory.type === 'entry' ? STAT_ICON_STYLES.emerald.icon : STAT_ICON_STYLES.coral.icon}
                          `} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-display font-semibold text-[var(--text)]">
                              État des lieux {INVENTORY_TYPES[inventory.type]?.label.toLowerCase()}
                            </h3>
                            {getTypeBadge(inventory.type)}
                            {getStatusBadge(inventory.status)}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--text-muted)]">
                            {property && lot && (
                              <span className="flex items-center gap-1">
                                <Home className="w-4 h-4" />
                                {property.name} - {lot.name}
                              </span>
                            )}
                            {tenantName && (
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {tenantName}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(inventory.inventory_date).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                          </div>

                          {/* Lien vers EDL d'entrée pour les sorties */}
                          {inventory.type === 'exit' && inventory.entry_inventory && (
                            <p className="text-xs text-[var(--color-electric-blue)] mt-1">
                              Lié à l'entrée du {new Date(inventory.entry_inventory.inventory_date).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 sm:flex-shrink-0">
                        {inventory.status === 'draft' ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate(`/inventories/${inventory.id}/edit`)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Continuer
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate(`/inventories/${inventory.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Voir
                          </Button>
                        )}

                        {inventory.status === 'signed' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleDownloadPdf(inventory)}
                            title="Télécharger PDF"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}

                        {inventory.status === 'draft' && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(inventory.id)}
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Indicateur de progression */}
                    {inventory.status !== 'signed' && (
                      <div className="mt-4 pt-4 border-t border-[var(--border)]">
                        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
                          <span>Progression</span>
                          <span>
                            {inventory.rooms?.[0]?.count || 0} pièce(s) inspectée(s)
                          </span>
                        </div>
                        <div className="h-2 bg-[var(--surface-elevated)] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              inventory.status === 'completed' ? 'bg-[var(--color-electric-blue)]' : 'bg-amber-500 dark:bg-amber-400'
                            }`}
                            style={{
                              width: inventory.status === 'completed' ? '80%' :
                                     inventory.status === 'draft' ? '30%' : '100%'
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Info légale */}
        <Alert variant="info">
          <strong>Rappel légal :</strong> L'état des lieux est obligatoire depuis la loi ALUR (2014).
          Il doit être établi contradictoirement et signé par les deux parties lors de la remise des clés.
          <br />
          <a
            href="https://www.legifrance.gouv.fr/loda/id/JORFTEXT000032320564/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-electric-blue)] hover:underline transition-colors"
          >
            Voir le Décret n°2016-382 →
          </a>
        </Alert>
      </div>
    </DashboardLayout>
  )
}

export default Inventories
