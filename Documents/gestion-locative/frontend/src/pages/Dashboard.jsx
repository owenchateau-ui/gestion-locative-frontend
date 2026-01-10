import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEntity } from '../context/EntityContext'
import { supabase } from '../lib/supabase'
import DashboardLayout from '../components/layout/DashboardLayout'
import StatCard from '../components/ui/StatCard'
import Alert from '../components/ui/Alert'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Skeleton from '../components/ui/Skeleton'
import { getLeasesPendingIndexation, getIRLIndices } from '../services/irlService'
import { formatDateFR, getCurrentQuarter } from '../utils/irlUtils'
import { Building2, Users, Home, Wallet, AlertCircle, Plus, FileText, CreditCard, TrendingUp } from 'lucide-react'

function Dashboard() {
  const { user } = useAuth()
  const { entities, selectedEntity, getSelectedEntityData } = useEntity()
  const [stats, setStats] = useState({
    properties: 0,
    lots: 0,
    occupiedLots: 0,
    tenants: 0,
    activeLeases: 0,
    monthlyRent: 0,
    latePayments: 0
  })
  const [entityBreakdown, setEntityBreakdown] = useState([])
  const [alerts, setAlerts] = useState({
    expiringLeases: [],
    latePayments: [],
    pendingIndexations: []
  })
  const [missingCurrentIRL, setMissingCurrentIRL] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user, selectedEntity])

  const fetchStats = async () => {
    try {
      setLoading(true)

      // Récupérer l'ID de l'utilisateur
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('supabase_uid', user.id)
        .single()

      if (userError) throw userError

      // Query pour les propriétés (avec filtre entité)
      let propertiesQuery = supabase
        .from('properties_new')
        .select('*, entities!inner(id, name, color, user_id)', { count: 'exact' })
        .eq('entities.user_id', userData.id)

      if (selectedEntity) {
        propertiesQuery = propertiesQuery.eq('entity_id', selectedEntity)
      }

      const { data: propertiesData, count: propertiesCount, error: propertiesError } = await propertiesQuery

      if (propertiesError) throw propertiesError

      // Query pour les lots (avec filtre entité)
      let lotsQuery = supabase
        .from('lots')
        .select('*, properties_new!inner(entity_id, entities!inner(user_id))', { count: 'exact' })
        .eq('properties_new.entities.user_id', userData.id)

      if (selectedEntity) {
        lotsQuery = lotsQuery.eq('properties_new.entity_id', selectedEntity)
      }

      const { data: lotsData, count: lotsCount, error: lotsError } = await lotsQuery

      if (lotsError) throw lotsError

      const occupiedLots = lotsData?.filter(lot => lot.status === 'occupied').length || 0

      // Compter les groupes de locataires (avec filtre entité)
      let groupsQuery = supabase
        .from('tenant_groups')
        .select('*, entities!inner(user_id)', { count: 'exact' })
        .eq('entities.user_id', userData.id)

      if (selectedEntity) {
        groupsQuery = groupsQuery.eq('entity_id', selectedEntity)
      }

      const { data: groupsData, error: groupsError } = await groupsQuery

      if (groupsError) throw groupsError

      const filteredTenants = groupsData || []

      // Compter les baux actifs (avec filtre entité)
      let leasesQuery = supabase
        .from('leases')
        .select('*, lot:lots!inner(properties_new!inner(entity_id, entities!inner(user_id)))', { count: 'exact' })
        .eq('lot.properties_new.entities.user_id', userData.id)
        .eq('status', 'active')

      if (selectedEntity) {
        leasesQuery = leasesQuery.eq('lot.properties_new.entity_id', selectedEntity)
      }

      const { count: leasesCount, error: leasesError } = await leasesQuery

      if (leasesError) throw leasesError

      // Calculer le loyer mensuel total (avec filtre entité)
      let activeLeasesQuery = supabase
        .from('leases')
        .select('rent_amount, charges_amount, lot:lots!inner(properties_new!inner(entity_id, entities!inner(user_id)))')
        .eq('lot.properties_new.entities.user_id', userData.id)
        .eq('status', 'active')

      if (selectedEntity) {
        activeLeasesQuery = activeLeasesQuery.eq('lot.properties_new.entity_id', selectedEntity)
      }

      const { data: activeLeases, error: activeLeasesError } = await activeLeasesQuery

      if (activeLeasesError) throw activeLeasesError

      const monthlyRent = activeLeases?.reduce((total, lease) => {
        const rent = parseFloat(lease.rent_amount) || 0
        const charges = parseFloat(lease.charges_amount) || 0
        return total + rent + charges
      }, 0) || 0

      // Calculer le total des paiements en retard (avec filtre entité)
      let latePaymentsQuery = supabase
        .from('payments')
        .select(`
          amount,
          lease:leases!inner(
            lot:lots!inner(
              properties_new!inner(entity_id, entities!inner(user_id))
            )
          )
        `)
        .eq('lease.lot.properties_new.entities.user_id', userData.id)
        .eq('status', 'late')

      if (selectedEntity) {
        latePaymentsQuery = latePaymentsQuery.eq('lease.lot.properties_new.entity_id', selectedEntity)
      }

      const { data: latePaymentsData, error: latePaymentsError } = await latePaymentsQuery

      if (latePaymentsError) throw latePaymentsError

      const latePaymentsTotal = latePaymentsData?.reduce((total, payment) => {
        return total + (parseFloat(payment.amount) || 0)
      }, 0) || 0

      // Récupérer les baux qui arrivent à échéance dans les 30 prochains jours
      const today = new Date()
      const in30Days = new Date()
      in30Days.setDate(today.getDate() + 30)

      let expiringLeasesQuery = supabase
        .from('leases')
        .select(`
          *,
          lot:lots!inner(
            id,
            name,
            properties_new!inner(id, name, entity_id, entities!inner(user_id))
          ),
          tenant:tenants!inner(id, first_name, last_name)
        `)
        .eq('lot.properties_new.entities.user_id', userData.id)
        .eq('status', 'active')
        .not('end_date', 'is', null)
        .gte('end_date', today.toISOString().split('T')[0])
        .lte('end_date', in30Days.toISOString().split('T')[0])

      if (selectedEntity) {
        expiringLeasesQuery = expiringLeasesQuery.eq('lot.properties_new.entity_id', selectedEntity)
      }

      const { data: expiringLeasesData, error: expiringLeasesError } = await expiringLeasesQuery

      if (expiringLeasesError) console.error('Error fetching expiring leases:', expiringLeasesError)

      // Récupérer les paiements en retard (avec filtre entité)
      let latePaymentsAlertsQuery = supabase
        .from('payments')
        .select(`
          *,
          lease:leases!inner(
            lot:lots!inner(
              id,
              name,
              properties_new!inner(id, name, entity_id, entities!inner(user_id))
            ),
            tenant:tenants!inner(id, first_name, last_name)
          )
        `)
        .eq('lease.lot.properties_new.entities.user_id', userData.id)
        .eq('status', 'pending')
        .lt('due_date', today.toISOString().split('T')[0])

      if (selectedEntity) {
        latePaymentsAlertsQuery = latePaymentsAlertsQuery.eq('lease.lot.properties_new.entity_id', selectedEntity)
      }

      const { data: latePaymentsAlerts, error: latePaymentsAlertsError } = await latePaymentsAlertsQuery

      if (latePaymentsAlertsError) console.error('Error fetching late payments alerts:', latePaymentsAlertsError)

      // Récupérer les baux à indexer dans les 30 prochains jours
      let pendingIndexations = []
      try {
        pendingIndexations = await getLeasesPendingIndexation(user.id, 30, selectedEntity)
      } catch (error) {
        console.error('Error fetching pending indexations:', error)
      }

      // Calculer la répartition par entité (uniquement si "Toutes les entités")
      if (!selectedEntity && entities.length > 0) {
        const breakdown = await Promise.all(
          entities.map(async (entity) => {
            // Compter les biens de l'entité
            const { count: entityPropertiesCount } = await supabase
              .from('properties_new')
              .select('*', { count: 'exact', head: true })
              .eq('entity_id', entity.id)

            // Compter les lots de l'entité
            const { count: entityLotsCount } = await supabase
              .from('lots')
              .select('*, properties_new!inner(entity_id)', { count: 'exact', head: true })
              .eq('properties_new.entity_id', entity.id)

            // Calculer les revenus de l'entité
            const { data: entityActiveLeases } = await supabase
              .from('leases')
              .select('rent_amount, charges_amount, lot:lots!inner(properties_new!inner(entity_id))')
              .eq('lot.properties_new.entity_id', entity.id)
              .eq('status', 'active')

            const entityRevenue = entityActiveLeases?.reduce((total, lease) => {
              return total + parseFloat(lease.rent_amount) + parseFloat(lease.charges_amount)
            }, 0) || 0

            return {
              entity,
              propertiesCount: entityPropertiesCount || 0,
              lotsCount: entityLotsCount || 0,
              revenue: entityRevenue
            }
          })
        )
        setEntityBreakdown(breakdown)
      } else {
        setEntityBreakdown([])
      }

      // Vérifier si l'IRL du trimestre actuel existe
      try {
        const irls = await getIRLIndices()
        const currentQ = getCurrentQuarter()
        const currentIRLExists = irls.some(
          irl => irl.quarter === currentQ.quarter && irl.year === currentQ.year
        )
        setMissingCurrentIRL(!currentIRLExists)
      } catch (error) {
        console.error('Error checking IRL:', error)
        setMissingCurrentIRL(false)
      }

      setStats({
        properties: propertiesCount || 0,
        lots: lotsCount || 0,
        occupiedLots: occupiedLots,
        tenants: filteredTenants.length,
        activeLeases: leasesCount || 0,
        monthlyRent: monthlyRent,
        latePayments: latePaymentsTotal
      })

      setAlerts({
        expiringLeases: expiringLeasesData || [],
        latePayments: latePaymentsAlerts || [],
        pendingIndexations: pendingIndexations || []
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Tableau de bord">
        <div className="space-y-6">
          {/* Loading stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} type="card" />
            ))}
          </div>
          {/* Loading cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton type="card" />
            <Skeleton type="card" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const selectedEntityData = getSelectedEntityData()
  const dashboardTitle = selectedEntityData
    ? `Tableau de bord - ${selectedEntityData.name}`
    : 'Tableau de bord'

  const occupancyRate = stats.lots > 0 ? Math.round((stats.occupiedLots / stats.lots) * 100) : 0

  return (
    <DashboardLayout title={dashboardTitle}>
      <div className="space-y-8">
        {/* Alertes */}
        {(alerts.expiringLeases.length > 0 || alerts.latePayments.length > 0 || alerts.pendingIndexations.length > 0) && (
          <div className="space-y-4">
            {/* Baux arrivant à échéance */}
            {alerts.expiringLeases.length > 0 && (
              <Alert variant="warning" title={`${alerts.expiringLeases.length} bail${alerts.expiringLeases.length > 1 ? 'x' : ''} arrive${alerts.expiringLeases.length > 1 ? 'nt' : ''} à échéance`}>
                <ul className="mt-2 space-y-1.5">
                  {alerts.expiringLeases.map(lease => (
                    <li key={lease.id}>
                      <Link to="/leases" className="text-[var(--text)] hover:text-[var(--color-electric-blue)] transition-colors font-medium">
                        {lease.lot.properties_new.name} - {lease.lot.name}
                        <span className="font-normal text-[var(--text-secondary)]"> · {lease.tenant.first_name} {lease.tenant.last_name}</span>
                        <Badge variant="warning" size="sm" className="ml-2">
                          {new Date(lease.end_date).toLocaleDateString('fr-FR')}
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Alert>
            )}

            {/* Paiements en retard */}
            {alerts.latePayments.length > 0 && (
              <Alert variant="error" title={`${alerts.latePayments.length} paiement${alerts.latePayments.length > 1 ? 's' : ''} en retard`}>
                <ul className="mt-2 space-y-1.5">
                  {alerts.latePayments.map(payment => (
                    <li key={payment.id}>
                      <Link to="/payments" className="text-[var(--text)] hover:text-[var(--color-electric-blue)] transition-colors font-medium">
                        {payment.lease.lot.properties_new.name} - {payment.lease.lot.name}
                        <span className="font-normal text-[var(--text-secondary)]"> · {payment.lease.tenant.first_name} {payment.lease.tenant.last_name}</span>
                        <Badge variant="danger" size="sm" className="ml-2">
                          {payment.amount.toFixed(2)} €
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Alert>
            )}

            {/* Indexations à venir */}
            {alerts.pendingIndexations.length > 0 && (
              <Alert variant="info" title={`${alerts.pendingIndexations.length} indexation${alerts.pendingIndexations.length > 1 ? 's' : ''} à prévoir`}>
                <ul className="mt-2 space-y-2">
                  {alerts.pendingIndexations.slice(0, 3).map(lease => (
                    <li key={lease.id} className="p-3 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
                      <Link to="/indexation" className="block hover:opacity-80 transition-opacity">
                        <div className="font-medium text-[var(--text)]">
                          {lease.lot.properties_new.name} - {lease.lot.name}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-[var(--text-secondary)]">
                            {formatDateFR(lease.anniversaryDate)}
                          </span>
                          <Badge variant="success" size="sm">
                            +{lease.indexationCalculation.increasePercentage.toFixed(2)}%
                          </Badge>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
                {alerts.pendingIndexations.length > 3 && (
                  <div className="mt-3">
                    <Link to="/indexation" className="text-sm font-medium text-[var(--color-electric-blue)] hover:underline">
                      Voir les {alerts.pendingIndexations.length - 3} autres indexations →
                    </Link>
                  </div>
                )}
              </Alert>
            )}
          </div>
        )}

        {/* Alerte IRL manquant */}
        {missingCurrentIRL && (() => {
          const currentQ = getCurrentQuarter()
          return (
            <Alert variant="info" title="Nouvel IRL disponible">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <p className="text-sm">
                  L'IRL du <strong>T{currentQ.quarter} {currentQ.year}</strong> n'est pas encore enregistré.
                </p>
                <Link
                  to="/indexation"
                  className="px-4 py-2 bg-[var(--color-electric-blue)] text-white text-sm font-medium font-display rounded-xl hover:brightness-110 transition-all"
                >
                  Mettre à jour
                </Link>
              </div>
            </Alert>
          )
        })()}

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
          <StatCard
            title="Propriétés"
            value={stats.properties}
            subtitle="Voir toutes →"
            variant="blue"
            href="/properties"
            icon={<Building2 className="w-6 h-6" />}
          />

          <StatCard
            title="Lots"
            value={stats.lots}
            subtitle={`${stats.occupiedLots} occupé${stats.occupiedLots > 1 ? 's' : ''}`}
            variant="purple"
            href="/lots"
            icon={<Home className="w-6 h-6" />}
          />

          <StatCard
            title="Locataires"
            value={stats.tenants}
            subtitle="Gérer →"
            variant="emerald"
            href="/tenants"
            icon={<Users className="w-6 h-6" />}
          />

          <StatCard
            title="Revenus mensuels"
            value={`${stats.monthlyRent.toLocaleString('fr-FR')} €`}
            subtitle="Voir paiements →"
            variant="lime"
            href="/payments"
            icon={<Wallet className="w-6 h-6" />}
          />

          <StatCard
            title="Impayés"
            value={`${stats.latePayments.toLocaleString('fr-FR')} €`}
            subtitle="Gérer →"
            variant="coral"
            href="/payments"
            icon={<AlertCircle className="w-6 h-6" />}
          />
        </div>

        {/* Répartition par entité (visible uniquement si "Toutes les entités") */}
        {!selectedEntity && entityBreakdown.length > 0 && (
          <Card
            title="Répartition par entité"
            subtitle="Vue d'ensemble de vos entités"
            variant="elevated"
          >
            <div className="space-y-3">
              {entityBreakdown.map((item) => (
                <Link
                  key={item.entity.id}
                  to={`/entities/${item.entity.id}`}
                  className="flex items-center justify-between p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)] hover:border-[var(--border-strong)] hover:-translate-y-0.5 hover:shadow-card transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${item.entity.color}20`, color: item.entity.color }}
                    >
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-display font-semibold text-[var(--text)]">{item.entity.name}</p>
                      <p className="text-sm text-[var(--text-muted)]">
                        {item.propertiesCount} bien{item.propertiesCount > 1 ? 's' : ''} · {item.lotsCount} lot{item.lotsCount > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-display font-bold text-[var(--color-electric-blue)]">
                      {item.revenue.toLocaleString('fr-FR')} €
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">/ mois</p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        )}

        {/* Sections supplémentaires */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vue d'ensemble */}
          <Card title="Vue d'ensemble" subtitle="Résumé de votre activité" variant="default">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
                <span className="text-sm text-[var(--text-secondary)]">Baux actifs</span>
                <span className="text-xl font-display font-bold text-[var(--text)]">{stats.activeLeases}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
                <span className="text-sm text-[var(--text-secondary)]">Taux d'occupation</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-[var(--border)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${occupancyRate}%` }}
                    />
                  </div>
                  <span className="text-xl font-display font-bold text-emerald-600 dark:text-emerald-400">
                    {occupancyRate}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-[var(--text-secondary)]">Revenus mensuels</span>
                <span className="text-xl font-display font-bold text-[var(--color-electric-blue)]">
                  {stats.monthlyRent.toLocaleString('fr-FR')} €
                </span>
              </div>
            </div>
          </Card>

          {/* Actions rapides */}
          <Card title="Actions rapides" subtitle="Raccourcis vers les fonctionnalités principales" variant="default">
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/properties/new"
                className="group flex flex-col items-center justify-center p-5 bg-[var(--color-electric-blue)]/5 hover:bg-[var(--color-electric-blue)]/10 border border-[var(--color-electric-blue)]/20 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-electric-blue)] to-[#0066FF] flex items-center justify-center mb-3 shadow-glow-blue group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-display font-semibold text-[var(--text)]">Ajouter un bien</span>
              </Link>

              <Link
                to="/tenants/new"
                className="group flex flex-col items-center justify-center p-5 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-display font-semibold text-[var(--text)]">Ajouter un locataire</span>
              </Link>

              <Link
                to="/leases/new"
                className="group flex flex-col items-center justify-center p-5 bg-[var(--color-purple)]/5 hover:bg-[var(--color-purple)]/10 border border-[var(--color-purple)]/20 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-purple)] to-[#A78BFA] flex items-center justify-center mb-3 shadow-glow-purple group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-display font-semibold text-[var(--text)]">Créer un bail</span>
              </Link>

              <Link
                to="/payments/new"
                className="group flex flex-col items-center justify-center p-5 bg-[var(--color-lime)]/5 hover:bg-[var(--color-lime)]/10 border border-[var(--color-lime)]/30 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--color-lime)] flex items-center justify-center mb-3 shadow-glow-lime group-hover:scale-110 transition-transform">
                  <CreditCard className="w-6 h-6 text-[#0A0A0F]" />
                </div>
                <span className="text-sm font-display font-semibold text-[var(--text)]">Enregistrer paiement</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
