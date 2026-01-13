import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Plus, Search, Eye, Edit, Trash2, User, Heart, Home, Filter } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useEntity } from '../context/EntityContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import Tabs from '../components/ui/Tabs'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Alert from '../components/ui/Alert'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import ExportButton from '../components/ui/ExportButton'
import { useToast } from '../context/ToastContext'
import { getAllTenantGroups, deleteTenantGroup } from '../services/tenantGroupService'

function Tenants() {
  const [tenantGroups, setTenantGroups] = useState([])
  const [filteredGroups, setFilteredGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [groupTypeFilter, setGroupTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const navigate = useNavigate()
  const { user } = useAuth()
  const { selectedEntity } = useEntity()
  const { success, error: showError } = useToast()

  useEffect(() => {
    fetchTenantGroups()
  }, [user, selectedEntity])

  useEffect(() => {
    filterGroups()
  }, [tenantGroups, searchQuery, groupTypeFilter, statusFilter])

  const fetchTenantGroups = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const data = await getAllTenantGroups(selectedEntity?.id)
      setTenantGroups(data)
    } catch (err) {
      console.error('Erreur lors du chargement des locataires:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filterGroups = () => {
    let filtered = [...tenantGroups]

    // Filtre par type de groupe
    if (groupTypeFilter !== 'all') {
      filtered = filtered.filter(group => group.group_type === groupTypeFilter)
    }

    // Filtre par statut (avec bail / sans bail)
    if (statusFilter === 'with_lease') {
      filtered = filtered.filter(group => group.lease?.status === 'active')
    } else if (statusFilter === 'without_lease') {
      filtered = filtered.filter(group => !group.lease || group.lease.status !== 'active')
    }

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((group) => {
        const groupName = group.name?.toLowerCase() || ''
        const tenantNames = group.tenants?.map(t =>
          `${t.first_name} ${t.last_name}`.toLowerCase()
        ).join(' ') || ''
        const emails = group.tenants?.map(t => t.email?.toLowerCase()).join(' ') || ''

        return groupName.includes(query) ||
               tenantNames.includes(query) ||
               emails.includes(query)
      })
    }

    setFilteredGroups(filtered)
  }

  const handleDelete = async (groupId, groupName) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le groupe "${groupName}" et tous ses locataires ?`)) {
      return
    }

    try {
      await deleteTenantGroup(groupId)
      success('Groupe de locataires supprimé avec succès')
      await fetchTenantGroups()
    } catch (err) {
      console.error('Erreur lors de la suppression:', err)
      showError('Erreur lors de la suppression : ' + err.message)
    }
  }

  const getGroupIcon = (groupType) => {
    switch (groupType) {
      case 'couple':
        return <Heart className="w-5 h-5 text-pink-500" />
      case 'colocation':
        return <Users className="w-5 h-5 text-purple-500" />
      case 'individual':
      default:
        return <User className="w-5 h-5 text-blue-500" />
    }
  }

  const getGroupTypeLabel = (groupType) => {
    switch (groupType) {
      case 'couple':
        return 'Couple'
      case 'colocation':
        return 'Colocation'
      case 'individual':
      default:
        return 'Individuel'
    }
  }

  const formatCurrency = (amount) => {
    if (!amount) return '0 €'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  // Extraire tous les locataires individuels
  const allTenants = tenantGroups.flatMap(group =>
    group.tenants?.map(tenant => ({
      ...tenant,
      groupName: group.name,
      groupType: group.group_type,
      groupId: group.id,
      lease: group.lease
    })) || []
  )

  if (loading) {
    return (
      <DashboardLayout title="Locataires">
        <div className="space-y-6">
          {/* Skeleton pour les filtres */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="animate-pulse bg-[var(--border)] rounded-xl h-10 w-64" />
            <div className="animate-pulse bg-[var(--border)] rounded-xl h-10 w-32" />
          </div>
          {/* Skeleton pour les cartes */}
          <Skeleton type="list-card" count={6} />
        </div>
      </DashboardLayout>
    )
  }

  // Fonction pour rendre la liste des groupes
  const renderGroupsList = () => (
    <div>
      {/* Barre de recherche et filtres */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Rechercher un groupe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-3">
            <ExportButton
              data={tenantGroups.map(g => ({
                ...g,
                name: g.name,
                group_type: g.group_type,
                email: g.tenants?.[0]?.email || '',
                phone: g.tenants?.[0]?.phone || '',
                entity_name: g.entity?.name || '',
                lease_status: g.lease ? true : false,
                total_income: g.tenants?.reduce((sum, t) => sum + (parseFloat(t.monthly_income) || 0), 0) || 0
              }))}
              type="tenants"
              filename="locataires"
            />
            <Button variant="primary" onClick={() => navigate('/tenants/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau groupe
            </Button>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-3">
          <select
            value={groupTypeFilter}
            onChange={(e) => setGroupTypeFilter(e.target.value)}
            className="px-3 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-all"
          >
            <option value="all">Tous les types</option>
            <option value="individual">Individuel</option>
            <option value="couple">Couple</option>
            <option value="colocation">Colocation</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-all"
          >
            <option value="all">Tous les statuts</option>
            <option value="with_lease">Avec bail</option>
            <option value="without_lease">Sans bail</option>
          </select>

          {(searchQuery || groupTypeFilter !== 'all' || statusFilter !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('')
                setGroupTypeFilter('all')
                setStatusFilter('all')
              }}
            >
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      {/* Liste des groupes */}
      {filteredGroups.length === 0 ? (
        <Card padding>
          <EmptyState
            icon={Users}
            title={searchQuery ? 'Aucun résultat' : 'Aucun locataire'}
            description={
              searchQuery
                ? 'Aucun locataire ne correspond à votre recherche'
                : 'Commencez par ajouter votre premier locataire'
            }
            variant={searchQuery ? 'search' : 'default'}
            actionLabel={!searchQuery ? 'Ajouter un locataire' : undefined}
            onAction={!searchQuery ? () => navigate('/tenants/new') : undefined}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredGroups.map((group, index) => {
            const mainTenant = group.tenants?.find(t => t.is_main_tenant) || group.tenants?.[0]
            const totalIncome = group.tenants?.reduce((sum, t) =>
              sum + (parseFloat(t.monthly_income) || 0) + (parseFloat(t.other_income) || 0),
              0
            ) || 0

            const lease = group.lease
            const totalRent = lease
              ? (parseFloat(lease.rent_amount) || 0) + (parseFloat(lease.charges_amount) || 0)
              : 0

            // Calcul du loyer net après déduction des aides
            const housingAssistance = parseFloat(group.housing_assistance) || 0
            const netRent = totalRent - housingAssistance

            const effortRate = netRent > 0 && totalIncome > 0
              ? (netRent / totalIncome) * 100
              : 0

            // Animation delay basé sur l'index (max 5 éléments avec animation)
            const animationDelay = index < 5 ? `animate-delay-${(index + 1) * 100}` : ''

            return (
              <div
                key={group.id}
                className={`hover-lift animate-card-enter ${animationDelay}`}
              >
                <Card padding>
                  <div className="space-y-4">
                  {/* En-tête */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-[var(--color-electric-blue)]/10 flex items-center justify-center flex-shrink-0">
                        {getGroupIcon(group.group_type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display font-semibold text-[var(--text)] mb-1">
                          {group.name || `Groupe ${group.id.substring(0, 8)}`}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="default" className="text-xs">
                            {getGroupTypeLabel(group.group_type)}
                          </Badge>
                          {group.group_type === 'couple' && group.couple_status && (
                            <Badge variant="info" className="text-xs">
                              {group.couple_status === 'married' && 'Mariés'}
                              {group.couple_status === 'pacs' && 'Pacsés'}
                              {group.couple_status === 'concubinage' && 'Concubinage'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Locataires */}
                  <div className="border-t border-[var(--border)] pt-3">
                    <p className="text-xs text-[var(--text-muted)] mb-2">
                      {group.tenants?.length === 1 ? '1 locataire' : `${group.tenants?.length} locataires`}
                    </p>
                    <div className="space-y-2">
                      {group.tenants?.slice(0, 2).map((tenant) => (
                        <div key={tenant.id} className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-[var(--text-muted)]" />
                          <span className="text-[var(--text)] font-medium">
                            {tenant.first_name} {tenant.last_name}
                          </span>
                          {tenant.is_main_tenant && (
                            <span className="text-xs text-[var(--color-electric-blue)]">(Principal)</span>
                          )}
                        </div>
                      ))}
                      {group.tenants?.length > 2 && (
                        <p className="text-xs text-[var(--text-muted)] ml-6">
                          +{group.tenants.length - 2} autre{group.tenants.length - 2 > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bail */}
                  {lease && (
                    <div className="border-t border-[var(--border)] pt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Home className="w-4 h-4 text-[var(--text-muted)]" />
                        <span className="text-sm font-medium text-[var(--text-secondary)]">
                          {lease.lot?.name}
                        </span>
                        <Badge variant={lease.status === 'active' ? 'success' : 'default'} className="text-xs">
                          {lease.status === 'active' ? 'Actif' : lease.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--text-secondary)]">Loyer mensuel</span>
                        <span className="font-medium text-[var(--text)]">
                          {formatCurrency(totalRent)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Revenus et solvabilité */}
                  {totalIncome > 0 && (
                    <div className="border-t border-[var(--border)] pt-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-[var(--text-secondary)]">Revenus totaux</span>
                        <span className="font-medium text-[var(--text)]">
                          {formatCurrency(totalIncome)}
                        </span>
                      </div>
                      {effortRate > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[var(--text-secondary)]">Taux d'effort</span>
                          <span className={`font-medium ${
                            effortRate <= 33 ? 'text-emerald-600 dark:text-emerald-400' :
                            effortRate <= 40 ? 'text-[var(--color-electric-blue)]' :
                            effortRate <= 50 ? 'text-amber-600 dark:text-amber-400' :
                            'text-[var(--color-vivid-coral)]'
                          }`}>
                            {effortRate.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="border-t border-[var(--border)] pt-3 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/tenants/${group.id}`)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Voir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/tenants/${group.id}/edit`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(group.id, group.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                </Card>
              </div>
            )
          })}
        </div>
      )}

      {/* Statistiques */}
      {tenantGroups.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card padding>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--color-electric-blue)]/10 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-[var(--color-electric-blue)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Total groupes</p>
                <p className="text-2xl font-display font-bold text-[var(--text)]">{tenantGroups.length}</p>
              </div>
            </div>
          </Card>

          <Card padding>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--color-purple)]/10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-[var(--color-purple)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Total locataires</p>
                <p className="text-2xl font-display font-bold text-[var(--text)]">
                  {tenantGroups.reduce((sum, g) => sum + (g.tenants?.length || 0), 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card padding>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <Home className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Baux actifs</p>
                <p className="text-2xl font-display font-bold text-[var(--text)]">
                  {tenantGroups.filter(g => g.lease?.status === 'active').length}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
  </div>
)

// Fonction pour rendre la liste de tous les locataires individuels
const renderAllTenantsList = () => {
  const filteredTenants = allTenants.filter(tenant => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const fullName = `${tenant.first_name} ${tenant.last_name}`.toLowerCase()
      const email = tenant.email?.toLowerCase() || ''
      const groupName = tenant.groupName?.toLowerCase() || ''

      return fullName.includes(query) || email.includes(query) || groupName.includes(query)
    }
    return true
  })

  return (
    <div>
      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Rechercher un locataire..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Liste des locataires */}
      {filteredTenants.length === 0 ? (
        <Card padding>
          <EmptyState
            icon={User}
            title={searchQuery ? 'Aucun résultat' : 'Aucun locataire'}
            description={
              searchQuery
                ? 'Aucun locataire ne correspond à votre recherche'
                : 'Aucun locataire trouvé'
            }
            variant={searchQuery ? 'search' : 'default'}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTenants.map((tenant, index) => {
            const income = (parseFloat(tenant.monthly_income) || 0) + (parseFloat(tenant.other_income) || 0)
            const animationDelay = index < 5 ? `animate-delay-${(index + 1) * 100}` : ''

            return (
              <div key={tenant.id} className={`hover-lift animate-card-enter ${animationDelay}`}>
                <Card padding>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-[var(--color-electric-blue)] text-white flex items-center justify-center flex-shrink-0 font-display font-semibold text-lg">
                      {tenant.first_name?.[0]}{tenant.last_name?.[0]}
                    </div>

                    {/* Informations */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-display font-semibold text-lg text-[var(--text)]">
                          {tenant.first_name} {tenant.last_name}
                        </h3>
                        {tenant.is_main_tenant && (
                          <Badge variant="info">Locataire principal</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                        {/* Groupe */}
                        <div className="flex items-center gap-2">
                          {getGroupIcon(tenant.groupType)}
                          <div>
                            <span className="text-[var(--text-muted)]">Groupe : </span>
                            <span className="text-[var(--text)]">{tenant.groupName}</span>
                          </div>
                        </div>

                        {/* Email */}
                        {tenant.email && (
                          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                            <span className="text-[var(--text-muted)]">Email : </span>
                            <a href={`mailto:${tenant.email}`} className="text-[var(--color-electric-blue)] hover:underline">
                              {tenant.email}
                            </a>
                          </div>
                        )}

                        {/* Revenus */}
                        {income > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-[var(--text-muted)]">Revenus : </span>
                            <span className="font-medium text-[var(--text)]">
                              {formatCurrency(income)}
                            </span>
                          </div>
                        )}

                        {/* Bail */}
                        {tenant.lease && (
                          <div className="flex items-center gap-2">
                            <Home className="w-4 h-4 text-[var(--text-muted)]" />
                            <span className="text-[var(--text)]">{tenant.lease.lot?.name}</span>
                            <Badge variant={tenant.lease.status === 'active' ? 'success' : 'default'} className="text-xs">
                              {tenant.lease.status === 'active' ? 'Actif' : tenant.lease.status}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/tenants/${tenant.groupId}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                </Card>
              </div>
            )
          })}
        </div>
      )}

      {/* Statistiques */}
      {allTenants.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card padding>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--color-purple)]/10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-[var(--color-purple)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Total locataires</p>
                <p className="text-2xl font-display font-bold text-[var(--text)]">{allTenants.length}</p>
              </div>
            </div>
          </Card>

          <Card padding>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--color-electric-blue)]/10 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-[var(--color-electric-blue)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Locataires principaux</p>
                <p className="text-2xl font-display font-bold text-[var(--text)]">
                  {allTenants.filter(t => t.is_main_tenant).length}
                </p>
              </div>
            </div>
          </Card>

          <Card padding>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <Home className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Avec bail actif</p>
                <p className="text-2xl font-display font-bold text-[var(--text)]">
                  {allTenants.filter(t => t.lease?.status === 'active').length}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

  const tabs = [
    {
      id: 'groups',
      label: 'Groupes',
      badge: tenantGroups.length,
      content: renderGroupsList()
    },
    {
      id: 'all',
      label: 'Tous les locataires',
      badge: allTenants.length,
      content: renderAllTenantsList()
    }
  ]

  return (
    <DashboardLayout title="Locataires" breadcrumb="Locataires">
      {error && <Alert variant="error" className="mb-6">{error}</Alert>}

      <Tabs tabs={tabs} defaultTab="groups" />
    </DashboardLayout>
  )
}

export default Tenants
