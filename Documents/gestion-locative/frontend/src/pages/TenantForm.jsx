import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function TenantForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEditMode = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    place_of_birth: ''
  })

  useEffect(() => {
    if (isEditMode) {
      fetchTenant()
    }
  }, [id])

  const fetchTenant = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        date_of_birth: data.date_of_birth || '',
        place_of_birth: data.place_of_birth || ''
      })
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Récupérer l'ID de l'utilisateur depuis la table users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('supabase_uid', user.id)
        .single()

      if (userError) throw userError

      // Préparer les données pour l'insertion/mise à jour
      const tenantData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone || null,
        date_of_birth: formData.date_of_birth || null,
        place_of_birth: formData.place_of_birth || null
      }

      if (isEditMode) {
        // Mise à jour
        const { error } = await supabase
          .from('tenants')
          .update(tenantData)
          .eq('id', id)

        if (error) throw error
      } else {
        // Création
        tenantData.landlord_id = userData.id

        const { error } = await supabase
          .from('tenants')
          .insert([tenantData])

        if (error) throw error
      }

      // Rediriger vers la liste des locataires
      navigate('/tenants')
    } catch (error) {
      setError(error.message)
      setLoading(false)
    }
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

      {/* Formulaire */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {isEditMode ? 'Modifier le locataire' : 'Ajouter un locataire'}
            </h2>
            <Link
              to="/tenants"
              className="text-gray-600 hover:text-gray-900"
            >
              ← Retour
            </Link>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Prénom et Nom */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Marie"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Martin"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="marie.martin@email.com"
                required
              />
            </div>

            {/* Téléphone */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="06 12 34 56 78"
              />
            </div>

            {/* Date et lieu de naissance */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Date de naissance
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Lieu de naissance
                </label>
                <input
                  type="text"
                  name="place_of_birth"
                  value={formData.place_of_birth}
                  onChange={handleChange}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Paris"
                />
              </div>
            </div>

            {/* Boutons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-500 text-white p-3 rounded font-semibold hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Enregistrement...' : isEditMode ? 'Mettre à jour' : 'Créer le locataire'}
              </button>
              <Link
                to="/tenants"
                className="flex-1 bg-gray-200 text-gray-700 p-3 rounded font-semibold hover:bg-gray-300 text-center"
              >
                Annuler
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default TenantForm
