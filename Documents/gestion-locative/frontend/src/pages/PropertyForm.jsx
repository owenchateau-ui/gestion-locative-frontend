import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function PropertyForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEditMode = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    postal_code: '',
    property_type: 'apartment',
    surface_area: '',
    nb_rooms: '',
    rent_amount: '',
    charges_amount: '',
    deposit_amount: '',
    description: '',
    status: 'vacant'
  })

  useEffect(() => {
    if (isEditMode) {
      fetchProperty()
    }
  }, [id])

  const fetchProperty = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      setFormData({
        name: data.name || '',
        address: data.address || '',
        city: data.city || '',
        postal_code: data.postal_code || '',
        property_type: data.property_type || 'apartment',
        surface_area: data.surface_area || '',
        nb_rooms: data.nb_rooms || '',
        rent_amount: data.rent_amount || '',
        charges_amount: data.charges_amount || '',
        deposit_amount: data.deposit_amount || '',
        description: data.description || '',
        status: data.status || 'vacant'
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
      const propertyData = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postal_code,
        property_type: formData.property_type,
        surface_area: formData.surface_area ? parseFloat(formData.surface_area) : null,
        nb_rooms: formData.nb_rooms ? parseInt(formData.nb_rooms) : null,
        rent_amount: parseFloat(formData.rent_amount),
        charges_amount: formData.charges_amount ? parseFloat(formData.charges_amount) : 0,
        deposit_amount: formData.deposit_amount ? parseFloat(formData.deposit_amount) : null,
        description: formData.description || null,
        status: formData.status
      }

      if (isEditMode) {
        // Mise à jour
        const { error } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', id)

        if (error) throw error
      } else {
        // Création
        propertyData.owner_id = userData.id

        const { error } = await supabase
          .from('properties')
          .insert([propertyData])

        if (error) throw error
      }

      // Rediriger vers la liste des biens
      navigate('/properties')
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

      {/* Formulaire */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {isEditMode ? 'Modifier le bien' : 'Ajouter un bien'}
            </h2>
            <Link
              to="/properties"
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
            {/* Nom du bien */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Nom du bien *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Appartement Paris 11ème"
                required
              />
            </div>

            {/* Adresse */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Adresse *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="15 rue de la Roquette"
                required
              />
            </div>

            {/* Ville et Code postal */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Ville *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Paris"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Code postal *
                </label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="75011"
                  required
                />
              </div>
            </div>

            {/* Type de bien */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Type de bien *
              </label>
              <select
                name="property_type"
                value={formData.property_type}
                onChange={handleChange}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="apartment">Appartement</option>
                <option value="house">Maison</option>
                <option value="studio">Studio</option>
                <option value="commercial">Commercial</option>
                <option value="parking">Parking</option>
                <option value="other">Autre</option>
              </select>
            </div>

            {/* Surface et nombre de pièces */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Surface (m²)
                </label>
                <input
                  type="number"
                  name="surface_area"
                  value={formData.surface_area}
                  onChange={handleChange}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="45.5"
                  step="0.01"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Nombre de pièces
                </label>
                <input
                  type="number"
                  name="nb_rooms"
                  value={formData.nb_rooms}
                  onChange={handleChange}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2"
                  min="0"
                />
              </div>
            </div>

            {/* Loyer, charges et dépôt */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Loyer (€) *
                </label>
                <input
                  type="number"
                  name="rent_amount"
                  value={formData.rent_amount}
                  onChange={handleChange}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="950.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Charges (€)
                </label>
                <input
                  type="number"
                  name="charges_amount"
                  value={formData.charges_amount}
                  onChange={handleChange}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="80.00"
                  step="0.01"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Dépôt de garantie (€)
                </label>
                <input
                  type="number"
                  name="deposit_amount"
                  value={formData.deposit_amount}
                  onChange={handleChange}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="950.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            {/* Statut */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Statut *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="vacant">Vacant</option>
                <option value="occupied">Occupé</option>
                <option value="unavailable">Indisponible</option>
              </select>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Description du bien, équipements, etc."
              />
            </div>

            {/* Boutons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-500 text-white p-3 rounded font-semibold hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Enregistrement...' : isEditMode ? 'Mettre à jour' : 'Créer le bien'}
              </button>
              <Link
                to="/properties"
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

export default PropertyForm
