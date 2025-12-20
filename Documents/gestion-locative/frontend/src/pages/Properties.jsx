import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function Properties() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userPlan, setUserPlan] = useState('free')
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    fetchProperties()
    fetchUserPlan()
  }, [user])

  const fetchUserPlan = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('users')
        .select('plan')
        .eq('supabase_uid', user.id)
        .single()

      if (error) throw error
      setUserPlan(data?.plan || 'free')
    } catch (error) {
      console.error('Error fetching user plan:', error)
    }
  }

  const fetchProperties = async () => {
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

      // Récupérer les biens de l'utilisateur
      const { data, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', userData.id)
        .order('created_at', { ascending: false })

      if (propertiesError) throw propertiesError

      setProperties(data || [])
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce bien ?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Rafraîchir la liste
      fetchProperties()
    } catch (error) {
      alert('Erreur lors de la suppression : ' + error.message)
    }
  }

  const handleAddProperty = () => {
    // Vérifier la limite pour les comptes gratuits
    if (userPlan === 'free' && properties.length >= 2) {
      alert('Limite atteinte : les comptes gratuits sont limités à 2 biens. Passez au plan Premium pour ajouter plus de biens.')
      return
    }
    navigate('/properties/new')
  }

  const getStatusBadge = (status) => {
    const badges = {
      vacant: 'bg-green-100 text-green-800',
      occupied: 'bg-blue-100 text-blue-800',
      unavailable: 'bg-gray-100 text-gray-800'
    }
    const labels = {
      vacant: 'Vacant',
      occupied: 'Occupé',
      unavailable: 'Indisponible'
    }
    return (
      <span className={`px-2 py-1 rounded text-sm ${badges[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const getPropertyTypeLabel = (type) => {
    const labels = {
      apartment: 'Appartement',
      house: 'Maison',
      studio: 'Studio',
      commercial: 'Commercial',
      parking: 'Parking',
      other: 'Autre'
    }
    return labels[type] || type
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
            <Link to="/properties" className="text-blue-600 font-semibold">
              Mes biens
            </Link>
            <Link to="/tenants" className="text-gray-600 hover:text-blue-600">
              Mes locataires
            </Link>
            <Link to="/leases" className="text-gray-600 hover:text-blue-600">
              Mes baux
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user?.email}</span>
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
            <h2 className="text-3xl font-bold">Mes biens immobiliers</h2>
            {userPlan === 'free' && (
              <p className="text-sm text-gray-600 mt-2">
                Compte gratuit : {properties.length}/2 biens utilisés
              </p>
            )}
          </div>
          <button
            onClick={handleAddProperty}
            className="bg-blue-500 text-white px-6 py-3 rounded font-semibold hover:bg-blue-600"
          >
            + Ajouter un bien
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            {error}
          </div>
        )}

        {properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">
              Vous n'avez pas encore de bien immobilier
            </p>
            <button
              onClick={handleAddProperty}
              className="bg-blue-500 text-white px-6 py-3 rounded font-semibold hover:bg-blue-600"
            >
              Ajouter votre premier bien
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adresse
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loyer
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
                {properties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {property.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{property.address}</div>
                      <div className="text-sm text-gray-500">
                        {property.postal_code} {property.city}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getPropertyTypeLabel(property.property_type)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {property.rent_amount.toFixed(2)} €
                      </div>
                      {property.charges_amount > 0 && (
                        <div className="text-xs text-gray-500">
                          + {property.charges_amount.toFixed(2)} € charges
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(property.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/properties/${property.id}/edit`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Modifier
                      </Link>
                      <button
                        onClick={() => handleDelete(property.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Supprimer
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

export default Properties
