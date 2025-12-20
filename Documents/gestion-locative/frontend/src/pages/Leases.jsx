import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function Leases() {
  const [leases, setLeases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    fetchLeases()
  }, [user])

  const fetchLeases = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // Récupérer l'ID de l'utilisateur depuis la table users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('supabase_uid', user.id)
        .single()

      if (userError) throw userError

      // Récupérer les baux avec les relations property et tenant
      const { data, error: leasesError } = await supabase
        .from('leases')
        .select(`
          *,
          property:properties!inner(id, name, owner_id),
          tenant:tenants!inner(id, first_name, last_name, landlord_id)
        `)
        .eq('property.owner_id', userData.id)
        .order('created_at', { ascending: false })

      if (leasesError) throw leasesError

      setLeases(data || [])
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce bail ?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('leases')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Rafraîchir la liste
      fetchLeases()
    } catch (error) {
      alert('Erreur lors de la suppression : ' + error.message)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Reconduction tacite'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR')
  }

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      terminated: 'bg-red-100 text-red-800',
      archived: 'bg-yellow-100 text-yellow-800'
    }
    const labels = {
      draft: 'Brouillon',
      active: 'Actif',
      terminated: 'Résilié',
      archived: 'Archivé'
    }
    return (
      <span className={`px-2 py-1 rounded text-sm ${badges[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const getLeaseTypeLabel = (type) => {
    return type === 'empty' ? 'Vide' : 'Meublé'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-blue-600">Gestion Locative</h1>
            <Link to="/dashboard" className="text-gray-600 hover:text-blue-600">
              Tableau de bord
            </Link>
            <Link to="/properties" className="text-gray-600 hover:text-blue-600">
              Mes biens
            </Link>
            <Link to="/tenants" className="text-gray-600 hover:text-blue-600">
              Mes locataires
            </Link>
            <Link to="/leases" className="text-blue-600 font-semibold">
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
              onClick={async () => {
                await supabase.auth.signOut()
                navigate('/login')
              }}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      {/* Contenu */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold">Mes baux</h2>
            <p className="text-sm text-gray-600 mt-2">
              {leases.length} bail{leases.length > 1 ? 'x' : ''}
            </p>
          </div>
          <button
            onClick={() => navigate('/leases/new')}
            className="bg-blue-500 text-white px-6 py-3 rounded font-semibold hover:bg-blue-600"
          >
            + Créer un bail
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            {error}
          </div>
        )}

        {leases.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">
              Vous n'avez pas encore de bail
            </p>
            <button
              onClick={() => navigate('/leases/new')}
              className="bg-blue-500 text-white px-6 py-3 rounded font-semibold hover:bg-blue-600"
            >
              Créer votre premier bail
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bien
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Locataire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Période
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loyer total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leases.map((lease) => (
                  <tr key={lease.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {lease.property.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {lease.tenant.first_name} {lease.tenant.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        Du {formatDate(lease.start_date)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Au {formatDate(lease.end_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {(parseFloat(lease.rent_amount) + parseFloat(lease.charges_amount)).toFixed(2)} €
                      </div>
                      <div className="text-xs text-gray-500">
                        Loyer: {parseFloat(lease.rent_amount).toFixed(2)} € + Charges: {parseFloat(lease.charges_amount).toFixed(2)} €
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getLeaseTypeLabel(lease.lease_type)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(lease.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/leases/${lease.id}/edit`}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Modifier
                      </Link>
                      <button
                        onClick={() => handleDelete(lease.id)}
                        className="text-red-600 hover:text-red-900 mr-3"
                      >
                        Supprimer
                      </button>
                      <button
                        className="text-green-600 hover:text-green-900"
                        onClick={() => alert('Génération PDF à venir')}
                      >
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Leases
