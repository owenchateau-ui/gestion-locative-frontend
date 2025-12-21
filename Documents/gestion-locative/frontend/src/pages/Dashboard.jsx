import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import DashboardLayout from '../components/layout/DashboardLayout'
import StatCard from '../components/ui/StatCard'
import Alert from '../components/ui/Alert'
import Card from '../components/ui/Card'

function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    properties: 0,
    tenants: 0,
    activeLeases: 0,
    monthlyRent: 0,
    latePayments: 0
  })
  const [alerts, setAlerts] = useState({
    expiringLeases: [],
    latePayments: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user])

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

      // Compter les propriétés
      const { count: propertiesCount, error: propertiesError } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', userData.id)

      if (propertiesError) throw propertiesError

      // Compter les locataires
      const { count: tenantsCount, error: tenantsError } = await supabase
        .from('tenants')
        .select('*', { count: 'exact', head: true })
        .eq('landlord_id', userData.id)

      if (tenantsError) throw tenantsError

      // Compter les baux actifs
      const { count: leasesCount, error: leasesError } = await supabase
        .from('leases')
        .select('*, property:properties!inner(owner_id)', { count: 'exact', head: true })
        .eq('property.owner_id', userData.id)
        .eq('status', 'active')

      if (leasesError) throw leasesError

      // Calculer le loyer mensuel total (somme des loyers + charges des baux actifs)
      const { data: activeLeases, error: activeLeasesError } = await supabase
        .from('leases')
        .select('rent_amount, charges_amount, property:properties!inner(owner_id)')
        .eq('property.owner_id', userData.id)
        .eq('status', 'active')

      if (activeLeasesError) throw activeLeasesError

      const monthlyRent = activeLeases?.reduce((total, lease) => {
        const rent = parseFloat(lease.rent_amount) || 0
        const charges = parseFloat(lease.charges_amount) || 0
        return total + rent + charges
      }, 0) || 0

      // Calculer le total des paiements en retard
      const { data: latePaymentsData, error: latePaymentsError } = await supabase
        .from('payments')
        .select(`
          amount,
          lease:leases!inner(
            property:properties!inner(owner_id)
          )
        `)
        .eq('lease.property.owner_id', userData.id)
        .eq('status', 'late')

      if (latePaymentsError) throw latePaymentsError

      const latePaymentsTotal = latePaymentsData?.reduce((total, payment) => {
        return total + (parseFloat(payment.amount) || 0)
      }, 0) || 0

      // Récupérer les baux qui arrivent à échéance dans les 30 prochains jours
      const today = new Date()
      const in30Days = new Date()
      in30Days.setDate(today.getDate() + 30)

      const { data: expiringLeasesData, error: expiringLeasesError } = await supabase
        .from('leases')
        .select(`
          *,
          property:properties!inner(id, name, owner_id),
          tenant:tenants!inner(id, first_name, last_name)
        `)
        .eq('property.owner_id', userData.id)
        .eq('status', 'active')
        .not('end_date', 'is', null)
        .gte('end_date', today.toISOString().split('T')[0])
        .lte('end_date', in30Days.toISOString().split('T')[0])

      if (expiringLeasesError) console.error('Error fetching expiring leases:', expiringLeasesError)

      // Récupérer les paiements en retard (date échéance dépassée et statut pending)
      const { data: latePaymentsAlerts, error: latePaymentsAlertsError } = await supabase
        .from('payments')
        .select(`
          *,
          lease:leases!inner(
            property:properties!inner(id, name, owner_id),
            tenant:tenants!inner(id, first_name, last_name)
          )
        `)
        .eq('lease.property.owner_id', userData.id)
        .eq('status', 'pending')
        .lt('due_date', today.toISOString().split('T')[0])

      if (latePaymentsAlertsError) console.error('Error fetching late payments alerts:', latePaymentsAlertsError)

      setStats({
        properties: propertiesCount || 0,
        tenants: tenantsCount || 0,
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

  return (
    <DashboardLayout title="Tableau de bord">
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
                        {lease.property.name} - {lease.tenant.first_name} {lease.tenant.last_name}
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
                        {payment.lease.property.name} - {payment.lease.tenant.first_name} {payment.lease.tenant.last_name}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  {stats.properties > 0 ? Math.round((stats.activeLeases / stats.properties) * 100) : 0}%
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
