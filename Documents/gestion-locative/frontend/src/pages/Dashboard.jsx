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

      setStats({
        properties: propertiesCount || 0,
        tenants: tenantsCount || 0,
        activeLeases: leasesCount || 0,
        monthlyRent: monthlyRent,
        latePayments: latePaymentsTotal
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
            <span className="text-gray-600">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Deconnexion
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
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
