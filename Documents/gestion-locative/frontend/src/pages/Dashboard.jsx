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
    latePayments: []
  })
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

      // Compter les locataires (avec filtre entité via baux)
      let tenantsQuery = supabase
        .from('tenants')
        .select('*, leases!inner(lot:lots!inner(properties_new!inner(entity_id, entities!inner(user_id))))')
        .eq('landlord_id', userData.id)

      const { data: tenantsData, error: tenantsError } = await tenantsQuery

      if (tenantsError) throw tenantsError

      let filteredTenants = tenantsData || []
      if (selectedEntity && tenantsData) {
        // Filtrer les locataires qui ont au moins un bail dans l'entité sélectionnée
        filteredTenants = tenantsData.filter(tenant =>
          tenant.leases?.some(lease => lease.lot?.properties_new?.entity_id === selectedEntity)
        )
      }

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
        latePayments: latePaymentsAlerts || []
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
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-500">Chargement...</div>
        </div>
      </DashboardLayout>
    )
  }

  const selectedEntityData = getSelectedEntityData()
  const dashboardTitle = selectedEntityData
    ? `Tableau de bord - ${selectedEntityData.name}`
    : 'Tableau de bord'

  return (
    <DashboardLayout title={dashboardTitle}>
      <div className="space-y-6">
        {/* Alertes */}
        {(alerts.expiringLeases.length > 0 || alerts.latePayments.length > 0) && (
          <div className="space-y-4">
            {/* Baux arrivant à échéance */}
            {alerts.expiringLeases.length > 0 && (
              <Alert variant="warning" title={`${alerts.expiringLeases.length} bail${alerts.expiringLeases.length > 1 ? 'x' : ''} arrive${alerts.expiringLeases.length > 1 ? 'nt' : ''} à échéance dans les 30 prochains jours`}>
                <ul className="mt-2 space-y-1">
                  {alerts.expiringLeases.map(lease => (
                    <li key={lease.id}>
                      <Link to="/leases" className="hover:underline font-medium">
                        {lease.lot.properties_new.name} - {lease.lot.name} - {lease.tenant.first_name} {lease.tenant.last_name}
                        {' '}(échéance : {new Date(lease.end_date).toLocaleDateString('fr-FR')})
                      </Link>
                    </li>
                  ))}
                </ul>
              </Alert>
            )}

            {/* Paiements en retard */}
            {alerts.latePayments.length > 0 && (
              <Alert variant="error" title={`${alerts.latePayments.length} paiement${alerts.latePayments.length > 1 ? 's' : ''} en retard`}>
                <ul className="mt-2 space-y-1">
                  {alerts.latePayments.map(payment => (
                    <li key={payment.id}>
                      <Link to="/payments" className="hover:underline font-medium">
                        {payment.lease.lot.properties_new.name} - {payment.lease.lot.name} - {payment.lease.tenant.first_name} {payment.lease.tenant.last_name}
                        {' '}({payment.amount.toFixed(2)} € - dû le {new Date(payment.due_date).toLocaleDateString('fr-FR')})
                      </Link>
                    </li>
                  ))}
                </ul>
              </Alert>
            )}
          </div>
        )}

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Biens"
            value={stats.properties}
            subtitle="Voir tous les biens →"
            variant="blue"
            href="/properties"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />

          <StatCard
            title="Lots"
            value={stats.lots}
            subtitle={`${stats.occupiedLots} occupé${stats.occupiedLots > 1 ? 's' : ''}`}
            variant="purple"
            href="/lots"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            }
          />

          <StatCard
            title="Locataires"
            value={stats.tenants}
            subtitle="Gérer les locataires →"
            variant="emerald"
            href="/tenants"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          />

          <StatCard
            title="Loyers ce mois"
            value={`${stats.monthlyRent.toFixed(2)} €`}
            subtitle="Voir les paiements →"
            variant="indigo"
            href="/payments"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />

          <StatCard
            title="Impayés"
            value={`${stats.latePayments.toFixed(2)} €`}
            subtitle="Gérer les impayés →"
            variant="red"
            href="/payments"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Répartition par entité (visible uniquement si "Toutes les entités") */}
        {!selectedEntity && entityBreakdown.length > 0 && (
          <Card title="Répartition par entité" subtitle="Vue d'ensemble de vos entités">
            <div className="space-y-3">
              {entityBreakdown.map((item) => (
                <div
                  key={item.entity.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.entity.color }}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{item.entity.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.propertiesCount} bien{item.propertiesCount > 1 ? 's' : ''} · {item.lotsCount} lot{item.lotsCount > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-blue-600">{item.revenue.toFixed(2)} €</p>
                    <p className="text-xs text-gray-500">Revenus mensuels</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Sections supplémentaires */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vue d'ensemble */}
          <Card title="Vue d'ensemble" subtitle="Résumé de votre activité">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm text-gray-600">Baux actifs</span>
                <span className="text-lg font-semibold text-gray-900">{stats.activeLeases}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm text-gray-600">Taux d'occupation</span>
                <span className="text-lg font-semibold text-emerald-600">
                  {stats.lots > 0 ? Math.round((stats.occupiedLots / stats.lots) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-gray-600">Revenus mensuels</span>
                <span className="text-lg font-semibold text-blue-600">{stats.monthlyRent.toFixed(2)} €</span>
              </div>
            </div>
          </Card>

          {/* Actions rapides */}
          <Card title="Actions rapides" subtitle="Raccourcis vers les fonctionnalités principales">
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/properties/new"
                className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm font-medium text-blue-900">Ajouter un bien</span>
              </Link>

              <Link
                to="/tenants/new"
                className="flex flex-col items-center justify-center p-4 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
              >
                <svg className="w-8 h-8 text-emerald-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span className="text-sm font-medium text-emerald-900">Ajouter un locataire</span>
              </Link>

              <Link
                to="/leases/new"
                className="flex flex-col items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <svg className="w-8 h-8 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium text-purple-900">Créer un bail</span>
              </Link>

              <Link
                to="/payments/new"
                className="flex flex-col items-center justify-center p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                <svg className="w-8 h-8 text-indigo-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-indigo-900">Enregistrer un paiement</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
