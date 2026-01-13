import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEntity } from '../context/EntityContext'
import { supabase } from '../lib/supabase'
import DashboardLayout from '../components/layout/DashboardLayout'
import StatCard from '../components/ui/StatCard'
import Skeleton from '../components/ui/Skeleton'
import { RevenueChart, AlertsList, PropertiesList, OccupationRates, QuickStats, EntityRevenueChart } from '../components/dashboard'
import { getLeasesPendingIndexation, getIRLIndices } from '../services/irlService'
import { formatDateFR, getCurrentQuarter } from '../utils/irlUtils'
import { Building2, Users, Home, Wallet, AlertCircle, Plus, Download } from 'lucide-react'
import Button from '../components/ui/Button'

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
  const [recentPayments, setRecentPayments] = useState([])
  const [recentProperties, setRecentProperties] = useState([])
  const [revenueData, setRevenueData] = useState([])
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
            const { data: entityLots } = await supabase
              .from('lots')
              .select('status, properties_new!inner(entity_id)')
              .eq('properties_new.entity_id', entity.id)

            const entityLotsCount = entityLots?.length || 0
            const entityOccupiedLots = entityLots?.filter(l => l.status === 'occupied').length || 0

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
              id: entity.id,
              name: entity.name,
              color: entity.color,
              propertiesCount: entityPropertiesCount || 0,
              totalLots: entityLotsCount,
              occupiedLots: entityOccupiedLots,
              revenue: entityRevenue
            }
          })
        )
        setEntityBreakdown(breakdown)
      } else {
        setEntityBreakdown([])
      }

      // Récupérer les propriétés récentes avec leurs lots
      let propertiesListQuery = supabase
        .from('properties_new')
        .select(`
          id, name, city,
          entities!inner(id, user_id),
          lots(id, status)
        `)
        .eq('entities.user_id', userData.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (selectedEntity) {
        propertiesListQuery = propertiesListQuery.eq('entity_id', selectedEntity)
      }

      const { data: propertiesListData } = await propertiesListQuery
      const formattedProperties = (propertiesListData || []).map(p => ({
        id: p.id,
        name: p.name,
        city: p.city || 'Non renseignée',
        totalLots: p.lots?.length || 0,
        occupiedLots: p.lots?.filter(l => l.status === 'occupied').length || 0
      }))
      setRecentProperties(formattedProperties)

      // Récupérer les paiements récents
      let recentPaymentsQuery = supabase
        .from('payments')
        .select(`
          id, amount, due_date, status,
          lease:leases!inner(
            tenant:tenants(first_name, last_name),
            lot:lots!inner(
              name,
              properties_new!inner(name, entity_id, entities!inner(user_id))
            )
          )
        `)
        .eq('lease.lot.properties_new.entities.user_id', userData.id)
        .order('due_date', { ascending: false })
        .limit(5)

      if (selectedEntity) {
        recentPaymentsQuery = recentPaymentsQuery.eq('lease.lot.properties_new.entity_id', selectedEntity)
      }

      const { data: recentPaymentsData } = await recentPaymentsQuery
      const formattedPayments = (recentPaymentsData || []).map(p => ({
        id: p.id,
        amount: parseFloat(p.amount) || 0,
        dueDate: p.due_date,
        status: p.status === 'late' ? 'late' : p.status === 'paid' ? 'paid' : 'pending',
        tenantName: p.lease?.tenant ? `${p.lease.tenant.first_name} ${p.lease.tenant.last_name}` : 'Inconnu',
        propertyName: p.lease?.lot?.properties_new?.name || 'Inconnu'
      }))
      setRecentPayments(formattedPayments)

      // Générer données revenus (6 derniers mois - simulé pour l'instant)
      const months = ['Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc']
      const baseRevenue = monthlyRent || 1000
      const revenueChartData = months.map((month, i) => ({
        month,
        value: Math.round(baseRevenue * (0.85 + Math.random() * 0.3))
      }))
      // Le dernier mois est le revenu réel
      revenueChartData[revenueChartData.length - 1].value = monthlyRent
      setRevenueData(revenueChartData)

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

  // Formatter les alertes pour le composant AlertsList (doit être avant le return conditionnel)
  const formattedAlerts = useMemo(() => {
    const result = []

    // Alertes paiements en retard
    alerts.latePayments.forEach(payment => {
      result.push({
        id: `late-${payment.id}`,
        type: 'late_payment',
        title: `${payment.lease?.tenant?.first_name || ''} ${payment.lease?.tenant?.last_name || ''}`.trim() || 'Locataire',
        description: `${payment.lease?.lot?.properties_new?.name || ''} - ${payment.lease?.lot?.name || ''}`,
        badge: `${parseFloat(payment.amount).toFixed(0)} €`,
        href: '/payments'
      })
    })

    // Alertes baux expirants
    alerts.expiringLeases.forEach(lease => {
      result.push({
        id: `expiring-${lease.id}`,
        type: 'expiring_lease',
        title: `${lease.tenant?.first_name || ''} ${lease.tenant?.last_name || ''}`.trim() || 'Locataire',
        description: `Bail expire le ${new Date(lease.end_date).toLocaleDateString('fr-FR')}`,
        badge: new Date(lease.end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        href: '/leases'
      })
    })

    // Alertes indexations
    alerts.pendingIndexations.forEach(lease => {
      result.push({
        id: `indexation-${lease.id}`,
        type: 'pending_indexation',
        title: `${lease.lot?.properties_new?.name || ''} - ${lease.lot?.name || ''}`,
        description: `Révision prévue le ${formatDateFR(lease.anniversaryDate)}`,
        badge: `+${lease.indexationCalculation?.increasePercentage?.toFixed(1) || 0}%`,
        href: '/indexation'
      })
    })

    return result
  }, [alerts])

  // Stats pour QuickStats (doit être avant le return conditionnel)
  const quickStatsData = useMemo(() => ({
    totalRevenue: stats.monthlyRent,
    paidThisMonth: recentPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: recentPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    lateAmount: stats.latePayments
  }), [stats, recentPayments])

  if (loading) {
    return (
      <DashboardLayout
        title="Tableau de bord"
        subtitle="Chargement..."
        breadcrumb="Dashboard"
      >
        <div className="space-y-6">
          {/* Loading stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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

  // Actions du header
  const headerActions = (
    <>
      <Button variant="secondary" size="sm">
        <Download className="w-4 h-4 mr-2" />
        Exporter
      </Button>
      <Button variant="primary" size="sm" href="/properties/new">
        <Plus className="w-4 h-4 mr-2" />
        Ajouter un bien
      </Button>
    </>
  )

  return (
    <DashboardLayout
      title={dashboardTitle}
      subtitle="Bienvenue, voici vos statistiques du mois"
      breadcrumb="Dashboard"
      actions={headerActions}
    >
      <div className="space-y-8">
        {/* Statistiques principales - Grille 4 colonnes avec animations staggered */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 items-stretch">
          <div className="stagger-item">
            <StatCard
              title="Revenus du mois"
              value={`${stats.monthlyRent.toLocaleString('fr-FR')} €`}
              variant="blue"
              href="/payments"
              icon={<Wallet className="w-6 h-6" />}
              trend="up"
              trendValue="+8.2%"
            />
          </div>

          <div className="stagger-item">
            <StatCard
              title="Lots occupés"
              value={`${stats.occupiedLots}/${stats.lots}`}
              subtitle={`${occupancyRate}% d'occupation`}
              variant="emerald"
              href="/lots"
              icon={<Home className="w-6 h-6" />}
              trend="up"
              trendValue="+2"
            />
          </div>

          <div className="stagger-item">
            <StatCard
              title="Locataires actifs"
              value={stats.tenants}
              variant="purple"
              href="/tenants"
              icon={<Users className="w-6 h-6" />}
            />
          </div>

          <div className="stagger-item">
            <StatCard
              title="Impayés"
              value={`${stats.latePayments.toLocaleString('fr-FR')} €`}
              subtitle={stats.latePayments > 0 ? "Action requise" : "Tout est en ordre"}
              variant="coral"
              href="/payments"
              icon={<AlertCircle className="w-6 h-6" />}
              trend={stats.latePayments > 0 ? "down" : undefined}
              trendValue={stats.latePayments > 0 ? "-15%" : undefined}
            />
          </div>
        </div>

        {/* Graphique revenus + Alertes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart
            data={revenueData}
            title="Évolution des revenus"
            subtitle="6 derniers mois"
          />

          <AlertsList
            alerts={formattedAlerts}
            title="Alertes importantes"
            maxItems={4}
            viewAllHref="/notifications"
          />
        </div>

        {/* Liste propriétés + Stats rapides */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PropertiesList
            properties={recentProperties}
            title="Derniers biens"
            maxItems={4}
          />

          <QuickStats
            stats={quickStatsData}
            recentPayments={recentPayments}
            title="Aperçu financier"
            maxPayments={4}
          />
        </div>

        {/* Taux d'occupation et revenus par entité (visible uniquement si "Toutes les entités") */}
        {!selectedEntity && entityBreakdown.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OccupationRates
              entities={entityBreakdown}
              title="Taux d'occupation"
              subtitle="Par entité"
            />
            <EntityRevenueChart
              entities={entityBreakdown}
              title="Répartition des revenus"
              subtitle="Par entité"
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
