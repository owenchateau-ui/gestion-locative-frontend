import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function LeaseForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEditMode = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [properties, setProperties] = useState([])
  const [tenants, setTenants] = useState([])
  const [formData, setFormData] = useState({
    property_id: '',
    tenant_id: '',
    start_date: '',
    end_date: '',
    rent_amount: '',
    charges_amount: '',
    deposit_amount: '',
    payment_day: '1',
    lease_type: 'empty',
    status: 'draft',
    special_clauses: ''
  })

  useEffect(() => {
    fetchPropertiesAndTenants()
    if (isEditMode) {
      fetchLease()
    }
  }, [id, user])

  const fetchPropertiesAndTenants = async () => {
    if (!user) return

    try {
      // Récupérer l'ID de l'utilisateur
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('supabase_uid', user.id)
        .single()

      if (userError) throw userError

      // Récupérer les biens du bailleur
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', userData.id)
        .order('name')

      if (propertiesError) throw propertiesError
      setProperties(propertiesData || [])

      // Récupérer les locataires du bailleur
      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenants')
        .select('*')
        .eq('landlord_id', userData.id)
        .order('last_name')

      if (tenantsError) throw tenantsError
      setTenants(tenantsData || [])
    } catch (error) {
      setError(error.message)
    }
  }

  const fetchLease = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('leases')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      setFormData({
        property_id: data.property_id || '',
        tenant_id: data.tenant_id || '',
        start_date: data.start_date || '',
        end_date: data.end_date || '',
        rent_amount: data.rent_amount || '',
        charges_amount: data.charges_amount || '',
        deposit_amount: data.deposit_amount || '',
        payment_day: data.payment_day || '1',
        lease_type: data.lease_type || 'empty',
        status: data.status || 'draft',
        special_clauses: data.special_clauses || ''
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
      // Préparer les données pour l'insertion/mise à jour
      const leaseData = {
        property_id: formData.property_id,
        tenant_id: formData.tenant_id,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        rent_amount: parseFloat(formData.rent_amount),
        charges_amount: formData.charges_amount ? parseFloat(formData.charges_amount) : 0,
        deposit_amount: formData.deposit_amount ? parseFloat(formData.deposit_amount) : null,
        payment_day: parseInt(formData.payment_day),
        lease_type: formData.lease_type,
        status: formData.status,
        special_clauses: formData.special_clauses || null
      }

      if (isEditMode) {
        // Mise à jour
        const { error } = await supabase
          .from('leases')
          .update(leaseData)
          .eq('id', id)

        if (error) throw error
      } else {
        // Création
        const { error } = await supabase
          .from('leases')
          .insert([leaseData])

        if (error) throw error
      }

      // Si le bail est créé avec statut "actif", mettre à jour le bien en "occupied"
      if (formData.status === 'active') {
        const { error: propertyError } = await supabase
          .from('properties')
          .update({ status: 'occupied' })
          .eq('id', formData.property_id)

        if (propertyError) console.error('Error updating property status:', propertyError)
      }

      // Rediriger vers la liste des baux
      navigate('/leases')
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
              {isEditMode ? 'Modifier le bail' : 'Créer un bail'}
            </h2>
            <Link
              to="/leases"
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
            {/* Sélection du bien */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Bien immobilier *
              </label>
              <select
                name="property_id"
                value={formData.property_id}
                onChange={handleChange}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionnez un bien</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name} - {property.city}
                  </option>
                ))}
              </select>
            </div>

            {/* Sélection du locataire */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Locataire *
              </label>
              <select
                name="tenant_id"
                value={formData.tenant_id}
                onChange={handleChange}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionnez un locataire</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.first_name} {tenant.last_name} - {tenant.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Date de début *
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Date de fin (optionnel)
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Laissez vide pour reconduction tacite</p>
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

            {/* Jour de paiement, type et statut */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Jour de paiement *
                </label>
                <input
                  type="number"
                  name="payment_day"
                  value={formData.payment_day}
                  onChange={handleChange}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="28"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Entre 1 et 28</p>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Type de bail *
                </label>
                <select
                  name="lease_type"
                  value={formData.lease_type}
                  onChange={handleChange}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="empty">Vide</option>
                  <option value="furnished">Meublé</option>
                </select>
              </div>
              <div>
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
                  <option value="draft">Brouillon</option>
                  <option value="active">Actif</option>
                  <option value="terminated">Résilié</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>
            </div>

            {/* Clauses particulières */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Clauses particulières
              </label>
              <textarea
                name="special_clauses"
                value={formData.special_clauses}
                onChange={handleChange}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="6"
                placeholder="Le locataire s'engage à..."
              />
            </div>

            {/* Boutons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-500 text-white p-3 rounded font-semibold hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Enregistrement...' : isEditMode ? 'Mettre à jour' : 'Créer le bail'}
              </button>
              <Link
                to="/leases"
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

export default LeaseForm
