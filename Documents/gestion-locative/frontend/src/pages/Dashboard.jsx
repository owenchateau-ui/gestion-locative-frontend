import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

function Dashboard() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
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

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    try {
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
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-blue-600">Gestion Locative</h1>
            <Link to="/dashboard" className="text-blue-600 font-semibold">
              Tableau de bord
            </Link>
            <Link to="/properties" className="text-gray-600 hover:text-blue-600">
              Mes biens
            </Link>
            <Link to="/tenants" className="text-gray-600 hover:text-blue-600">
              Mes locataires
            </Link>
            <Link to="/leases" className="text-gray-600 hover:text-blue-600">
              Mes baux
            </Link>
            <Link to="/payments" className="text-gray-600 hover:text-blue-600">
              Paiements
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/profile" className="text-gray-600 hover:text-blue-600">
              Mon profil
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Alertes */}
        {(alerts.expiringLeases.length > 0 || alerts.latePayments.length > 0) && (
          <div className="mb-6 space-y-4">
            {/* Baux arrivant à échéance */}
            {alerts.expiringLeases.length > 0 && (
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-orange-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-orange-800 font-semibold mb-2">
                      {alerts.expiringLeases.length} bail{alerts.expiringLeases.length > 1 ? 'x' : ''} arrive{alerts.expiringLeases.length > 1 ? 'nt' : ''} à échéance dans les 30 prochains jours
                    </h3>
                    <ul className="space-y-1">
                      {alerts.expiringLeases.map(lease => (
                        <li key={lease.id} className="text-sm text-orange-700">
                          <Link to="/leases" className="hover:underline">
                            {lease.property.name} - {lease.tenant.first_name} {lease.tenant.last_name}
                            (échéance : {new Date(lease.end_date).toLocaleDateString('fr-FR')})
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Paiements en retard */}
            {alerts.latePayments.length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-red-800 font-semibold mb-2">
                      {alerts.latePayments.length} paiement{alerts.latePayments.length > 1 ? 's' : ''} en retard
                    </h3>
                    <ul className="space-y-1">
                      {alerts.latePayments.map(payment => (
                        <li key={payment.id} className="text-sm text-red-700">
                          <Link to="/payments" className="hover:underline">
                            {payment.lease.property.name} - {payment.lease.tenant.first_name} {payment.lease.tenant.last_name}
                            ({payment.amount.toFixed(2)} € - dû le {new Date(payment.due_date).toLocaleDateString('fr-FR')})
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold mb-4">Tableau de bord</h2>
          <p className="text-gray-600">Bienvenue sur votre espace de gestion locative.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-8">
            <Link
              to="/properties"
              className="bg-blue-50 p-6 rounded-lg hover:bg-blue-100 transition cursor-pointer"
            >
              <h3 className="text-xl font-semibold text-blue-800 mb-2">Proprietes</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.properties}</p>
              <p className="text-sm text-blue-600 mt-2">Gérer mes biens →</p>
            </Link>
            <Link
              to="/tenants"
              className="bg-green-50 p-6 rounded-lg hover:bg-green-100 transition cursor-pointer"
            >
              <h3 className="text-xl font-semibold text-green-800 mb-2">Locataires</h3>
              <p className="text-3xl font-bold text-green-600">{stats.tenants}</p>
              <p className="text-sm text-green-600 mt-2">Gérer mes locataires →</p>
            </Link>
            <Link
              to="/leases"
              className="bg-purple-50 p-6 rounded-lg hover:bg-purple-100 transition cursor-pointer"
            >
              <h3 className="text-xl font-semibold text-purple-800 mb-2">Baux actifs</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.activeLeases}</p>
              <p className="text-sm text-purple-600 mt-2">Gérer mes baux →</p>
            </Link>
            <Link
              to="/payments"
              className="bg-indigo-50 p-6 rounded-lg hover:bg-indigo-100 transition cursor-pointer"
            >
              <h3 className="text-xl font-semibold text-indigo-800 mb-2">Loyers ce mois</h3>
              <p className="text-3xl font-bold text-indigo-600">{stats.monthlyRent.toFixed(2)} €</p>
              <p className="text-sm text-indigo-600 mt-2">Voir les paiements →</p>
            </Link>
            <Link
              to="/payments"
              className="bg-red-50 p-6 rounded-lg hover:bg-red-100 transition cursor-pointer"
            >
              <h3 className="text-xl font-semibold text-red-800 mb-2">Impayés</h3>
              <p className="text-3xl font-bold text-red-600">{stats.latePayments.toFixed(2)} €</p>
              <p className="text-sm text-red-600 mt-2">Gérer les impayés →</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
