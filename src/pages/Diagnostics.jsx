/**
 * Page de gestion des diagnostics immobiliers
 * Liste, filtres, statistiques et actions
 */

import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Plus, Search, Filter, RefreshCw, Download, AlertTriangle,
  Building2, Home, FileText, BarChart3, Clock, CheckCircle
} from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import StatCard from '../components/ui/StatCard'
import Alert from '../components/ui/Alert'
import Skeleton from '../components/ui/Skeleton'
import Tabs from '../components/ui/Tabs'
import { DiagnosticCard, DiagnosticAlerts, DPEWidget } from '../components/diagnostics'
import { useEntity } from '../context/EntityContext'
import { useToast } from '../context/ToastContext'
import {
  getAllDiagnostics,
  getExpiringDiagnostics,
  getDiagnosticsStats,
  deleteDiagnostic
} from '../services/diagnosticService'
import { DIAGNOSTIC_TYPES, ENERGY_CLASSES } from '../constants/diagnosticConstants'

function Diagnostics() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { selectedEntity } = useEntity()
  const { success, error: showError } = useToast()

  // États
  const [diagnostics, setDiagnostics] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filtres
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState(searchParams.get('type') || 'all')
  const [filterStatus, setFilterStatus] = useState(searchParams.get('filter') || 'all')
  const [filterProperty, setFilterProperty] = useState('')

  // Chargement initial
  useEffect(() => {
    loadData()
  }, [selectedEntity])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [diagData, statsData] = await Promise.all([
        getAllDiagnostics({ entityId: selectedEntity }),
        getDiagnosticsStats(selectedEntity)
      ])

      setDiagnostics(diagData)
      setStats(statsData)
    } catch (err) {
      console.error('Erreur chargement:', err)
      setError('Impossible de charger les diagnostics')
    } finally {
      setLoading(false)
    }
  }

  // Filtrage des diagnostics
  const filteredDiagnostics = useMemo(() => {
    return diagnostics.filter(d => {
      // Recherche textuelle
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        const typeLabel = DIAGNOSTIC_TYPES[d.type]?.label?.toLowerCase() || ''
        const lotName = d.lot?.name?.toLowerCase() || ''
        const propertyName = d.lot?.property?.name?.toLowerCase() || ''
        if (!typeLabel.includes(search) && !lotName.includes(search) && !propertyName.includes(search)) {
          return false
        }
      }

      // Filtre par type
      if (filterType !== 'all' && d.type !== filterType) {
        return false
      }

      // Filtre par statut
      if (filterStatus === 'expired' && d.expirationStatus?.daysUntil >= 0) {
        return false
      }
      if (filterStatus === 'expiring' && (d.expirationStatus?.daysUntil < 0 || d.expirationStatus?.daysUntil > 60)) {
        return false
      }
      if (filterStatus === 'valid' && d.expirationStatus?.color !== 'success' && d.expirationStatus?.color !== 'info') {
        return false
      }

      // Filtre par propriété
      if (filterProperty && d.lot?.property?.id !== filterProperty) {
        return false
      }

      return true
    })
  }, [diagnostics, searchTerm, filterType, filterStatus, filterProperty])

  // Liste des propriétés pour le filtre
  const properties = useMemo(() => {
    const propMap = new Map()
    diagnostics.forEach(d => {
      if (d.lot?.property) {
        propMap.set(d.lot.property.id, d.lot.property)
      }
    })
    return Array.from(propMap.values())
  }, [diagnostics])

  // Handlers
  const handleDelete = async (id) => {
    try {
      await deleteDiagnostic(id)
      setDiagnostics(prev => prev.filter(d => d.id !== id))
      success('Diagnostic supprimé')
    } catch (err) {
      showError('Erreur lors de la suppression')
    }
  }

  const handleEdit = (diagnostic) => {
    navigate(`/diagnostics/${diagnostic.id}/edit`)
  }

  const handleView = (diagnostic) => {
    navigate(`/diagnostics/${diagnostic.id}`)
  }

  // Rendu des statistiques
  const renderStats = () => {
    if (!stats) return null

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total diagnostics"
          value={stats.total}
          icon={<FileText className="w-6 h-6" />}
          variant="blue"
        />
        <StatCard
          title="Valides"
          value={stats.byStatus.valid + stats.byStatus.perpetual}
          icon={<CheckCircle className="w-6 h-6" />}
          variant="emerald"
        />
        <StatCard
          title="À renouveler"
          value={stats.byStatus.expiringSoon}
          icon={<Clock className="w-6 h-6" />}
          variant="indigo"
        />
        <StatCard
          title="Expirés"
          value={stats.byStatus.expired}
          icon={<AlertTriangle className="w-6 h-6" />}
          variant="red"
        />
      </div>
    )
  }

  // Rendu des filtres
  const renderFilters = () => (
    <Card className="mb-6">
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
            />
          </div>

          {/* Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
          >
            <option value="all">Tous les types</option>
            {Object.entries(DIAGNOSTIC_TYPES).map(([key, info]) => (
              <option key={key} value={key}>{info.label}</option>
            ))}
          </select>

          {/* Statut */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
          >
            <option value="all">Tous les statuts</option>
            <option value="valid">Valides</option>
            <option value="expiring">À renouveler (60j)</option>
            <option value="expired">Expirés</option>
          </select>

          {/* Propriété */}
          <select
            value={filterProperty}
            onChange={(e) => setFilterProperty(e.target.value)}
            className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
          >
            <option value="">Toutes les propriétés</option>
            {properties.map(prop => (
              <option key={prop.id} value={prop.id}>{prop.name}</option>
            ))}
          </select>
        </div>
      </div>
    </Card>
  )

  // Contenu principal
  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} type="card" />
          ))}
        </div>
      )
    }

    if (error) {
      return (
        <Alert variant="error" title="Erreur">
          {error}
          <Button variant="secondary" size="sm" className="mt-2" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Réessayer
          </Button>
        </Alert>
      )
    }

    if (filteredDiagnostics.length === 0) {
      return (
        <Card>
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
            <h3 className="text-lg font-display font-semibold text-[var(--text)] mb-2">
              {diagnostics.length === 0 ? 'Aucun diagnostic' : 'Aucun résultat'}
            </h3>
            <p className="text-[var(--text-secondary)] mb-4">
              {diagnostics.length === 0
                ? 'Commencez par ajouter vos premiers diagnostics immobiliers'
                : 'Modifiez vos filtres pour voir plus de résultats'
              }
            </p>
            {diagnostics.length === 0 && (
              <Button onClick={() => navigate('/diagnostics/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un diagnostic
              </Button>
            )}
          </div>
        </Card>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDiagnostics.map(diagnostic => (
          <DiagnosticCard
            key={diagnostic.id}
            diagnostic={diagnostic}
            showLot={true}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        ))}
      </div>
    )
  }

  // Onglets pour la vue
  const tabsContent = [
    {
      id: 'list',
      label: 'Liste',
      icon: <FileText className="w-4 h-4" />,
      badge: filteredDiagnostics.length.toString(),
      content: renderContent()
    },
    {
      id: 'alerts',
      label: 'Alertes',
      icon: <AlertTriangle className="w-4 h-4" />,
      badge: stats?.byStatus?.expired + stats?.byStatus?.expiringSoon > 0
        ? (stats.byStatus.expired + stats.byStatus.expiringSoon).toString()
        : null,
      content: (
        <Card>
          <div className="p-4">
            <DiagnosticAlerts entityId={selectedEntity} maxItems={20} />
          </div>
        </Card>
      )
    },
    {
      id: 'stats',
      label: 'Statistiques',
      icon: <BarChart3 className="w-4 h-4" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Répartition par type */}
          <Card title="Par type de diagnostic">
            <div className="p-4 space-y-3">
              {stats && Object.entries(stats.byType).map(([type, count]) => {
                const typeInfo = DIAGNOSTIC_TYPES[type] || { label: type }
                return (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-[var(--text)]">{typeInfo.label}</span>
                    <Badge variant="default">{count}</Badge>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Répartition DPE */}
          <Card title="Répartition classes énergétiques (DPE)">
            <div className="p-4">
              {stats && Object.keys(stats.byEnergyClass).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(ENERGY_CLASSES).map(([letter, info]) => {
                    const count = stats.byEnergyClass[letter] || 0
                    const percentage = stats.byType.dpe > 0 ? (count / stats.byType.dpe) * 100 : 0
                    return (
                      <div key={letter} className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: info.color }}
                        >
                          {letter}
                        </div>
                        <div className="flex-1">
                          <div className="h-4 bg-[var(--surface-elevated)] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: info.color
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-[var(--text-secondary)] w-8 text-right">{count}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-[var(--text-muted)] text-center py-4">Aucun DPE enregistré</p>
              )}
            </div>
          </Card>
        </div>
      )
    }
  ]

  return (
    <DashboardLayout title="Diagnostics immobiliers">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-[var(--text-secondary)]">
              Gérez les diagnostics obligatoires de vos biens (DPE, amiante, plomb...)
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={loadData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
            <Button onClick={() => navigate('/diagnostics/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau diagnostic
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        {renderStats()}

        {/* Filtres */}
        {renderFilters()}

        {/* Contenu avec onglets */}
        <Tabs tabs={tabsContent} defaultTab="list" />
      </div>
    </DashboardLayout>
  )
}

export default Diagnostics
