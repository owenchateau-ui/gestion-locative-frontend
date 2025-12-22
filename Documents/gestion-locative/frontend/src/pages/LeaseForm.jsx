import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

function LeaseForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEditMode = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lots, setLots] = useState([])
  const [tenants, setTenants] = useState([])
  const [formData, setFormData] = useState({
    lot_id: '',
    tenant_id: '',
    start_date: '',
    end_date: '',
    rent_amount: '',
    charges_amount: '',
    deposit_amount: '',
    payment_day: '1',
    lease_type: 'empty',
    status: 'draft',
    special_clauses: '',
    caf_direct_payment: false,
    caf_amount: '',
    caf_payment_day: '5'
  })

  useEffect(() => {
    fetchLotsAndTenants()
    if (isEditMode) {
      fetchLease()
    }
  }, [id, user])

  const fetchLotsAndTenants = async () => {
    if (!user) return

    try {
      // Récupérer l'ID de l'utilisateur
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('supabase_uid', user.id)
        .single()

      if (userError) throw userError

      // Récupérer les lots disponibles du bailleur
      const { data: lotsData, error: lotsError } = await supabase
        .from('lots')
        .select(`
          *,
          properties_new!inner(id, name, entities!inner(user_id))
        `)
        .eq('properties_new.entities.user_id', userData.id)
        .order('name')

      if (lotsError) throw lotsError
      setLots(lotsData || [])

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
        lot_id: data.lot_id || '',
        tenant_id: data.tenant_id || '',
        start_date: data.start_date || '',
        end_date: data.end_date || '',
        rent_amount: data.rent_amount || '',
        charges_amount: data.charges_amount || '',
        deposit_amount: data.deposit_amount || '',
        payment_day: data.payment_day || '1',
        lease_type: data.lease_type || 'empty',
        status: data.status || 'draft',
        special_clauses: data.special_clauses || '',
        caf_direct_payment: data.caf_direct_payment || false,
        caf_amount: data.caf_amount || '',
        caf_payment_day: data.caf_payment_day || '5'
      })
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Préparer les données pour l'insertion/mise à jour
      const leaseData = {
        lot_id: formData.lot_id,
        tenant_id: formData.tenant_id,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        rent_amount: parseFloat(formData.rent_amount),
        charges_amount: formData.charges_amount ? parseFloat(formData.charges_amount) : 0,
        deposit_amount: formData.deposit_amount ? parseFloat(formData.deposit_amount) : null,
        payment_day: parseInt(formData.payment_day),
        lease_type: formData.lease_type,
        status: formData.status,
        special_clauses: formData.special_clauses || null,
        caf_direct_payment: formData.caf_direct_payment,
        caf_amount: formData.caf_amount ? parseFloat(formData.caf_amount) : 0,
        caf_payment_day: formData.caf_direct_payment ? parseInt(formData.caf_payment_day) : 5
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

      // Si le bail est créé avec statut "actif", mettre à jour le lot en "occupied"
      if (formData.status === 'active') {
        const { error: lotError } = await supabase
          .from('lots')
          .update({ status: 'occupied' })
          .eq('id', formData.lot_id)

        if (lotError) console.error('Error updating lot status:', lotError)
      }

      // Rediriger vers la liste des baux
      navigate('/leases')
    } catch (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title={isEditMode ? 'Modifier le bail' : 'Créer un bail'}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Modifier le bail' : 'Créer un bail'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Renseignez les informations du bail
          </p>
        </div>

        <Card>
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sélection du lot */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lot à louer *
              </label>
              <select
                name="lot_id"
                value={formData.lot_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Sélectionnez un lot</option>
                {lots.map((lot) => (
                  <option key={lot.id} value={lot.id}>
                    {lot.properties_new.name} - {lot.name}
                    {lot.status === 'occupied' ? ' (Occupé)' : ''}
                    {lot.status === 'unavailable' ? ' (Indisponible)' : ''}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Format : Propriété - Lot
              </p>
            </div>

            {/* Sélection du locataire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Locataire *
              </label>
              <select
                name="tenant_id"
                value={formData.tenant_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début *
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de fin (optionnel)
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Laissez vide pour reconduction tacite</p>
              </div>
            </div>

            {/* Loyer, charges et dépôt */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loyer (€) *
                </label>
                <input
                  type="number"
                  name="rent_amount"
                  value={formData.rent_amount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="950.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Charges (€)
                </label>
                <input
                  type="number"
                  name="charges_amount"
                  value={formData.charges_amount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="80.00"
                  step="0.01"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dépôt de garantie (€)
                </label>
                <input
                  type="number"
                  name="deposit_amount"
                  value={formData.deposit_amount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="950.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            {/* Jour de paiement, type et statut */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jour de paiement *
                </label>
                <input
                  type="number"
                  name="payment_day"
                  value={formData.payment_day}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="28"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Entre 1 et 28</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de bail *
                </label>
                <select
                  name="lease_type"
                  value={formData.lease_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="empty">Vide</option>
                  <option value="furnished">Meublé</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="draft">Brouillon</option>
                  <option value="active">Actif</option>
                  <option value="terminated">Résilié</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>
            </div>

            {/* Section APL/CAF */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">APL / CAF</h3>

              {/* Versement direct CAF */}
              <div className="mb-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="caf_direct_payment"
                    checked={formData.caf_direct_payment}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Les APL sont versées directement au bailleur
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-7">
                  Cochez cette case si vous recevez les APL directement de la CAF
                </p>
              </div>

              {/* Montant et jour de versement CAF (conditionnels) */}
              {formData.caf_direct_payment && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-7">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Montant mensuel APL (€)
                    </label>
                    <input
                      type="number"
                      name="caf_amount"
                      value={formData.caf_amount}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="200.00"
                      step="0.01"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Montant versé par la CAF chaque mois
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jour de versement CAF
                    </label>
                    <input
                      type="number"
                      name="caf_payment_day"
                      value={formData.caf_payment_day}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      max="28"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Généralement le 5 du mois
                    </p>
                  </div>
                </div>
              )}

              {/* Calcul du reste à charge */}
              {formData.caf_direct_payment && formData.caf_amount && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg ml-7">
                  <div className="text-sm text-gray-700">
                    <div className="flex justify-between mb-1">
                      <span>Loyer + charges :</span>
                      <span className="font-medium">
                        {(parseFloat(formData.rent_amount || 0) + parseFloat(formData.charges_amount || 0)).toFixed(2)} €
                      </span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>APL versées :</span>
                      <span className="font-medium text-green-600">
                        - {parseFloat(formData.caf_amount || 0).toFixed(2)} €
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-blue-200 font-semibold">
                      <span>Reste à charge locataire :</span>
                      <span className="text-blue-700">
                        {(
                          parseFloat(formData.rent_amount || 0) +
                          parseFloat(formData.charges_amount || 0) -
                          parseFloat(formData.caf_amount || 0)
                        ).toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Clauses particulières */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clauses particulières
              </label>
              <textarea
                name="special_clauses"
                value={formData.special_clauses}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="6"
                placeholder="Le locataire s'engage à..."
              />
            </div>

            {/* Boutons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Enregistrement...' : isEditMode ? 'Mettre à jour' : 'Créer le bail'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/leases')}
                className="flex-1"
              >
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default LeaseForm
