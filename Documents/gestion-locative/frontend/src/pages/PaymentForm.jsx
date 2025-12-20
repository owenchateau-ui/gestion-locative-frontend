import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function PaymentForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEditMode = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [leases, setLeases] = useState([])
  const [formData, setFormData] = useState({
    lease_id: '',
    amount: '',
    due_date: '',
    payment_date: '',
    payment_method: 'bank_transfer',
    status: 'pending',
    notes: ''
  })

  useEffect(() => {
    fetchLeases()
    if (isEditMode) {
      fetchPayment()
    }
  }, [id, user])

  const fetchLeases = async () => {
    if (!user) return

    try {
      // Récupérer l'ID de l'utilisateur
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('supabase_uid', user.id)
        .single()

      if (userError) throw userError

      // Récupérer les baux actifs avec les infos du bien et locataire
      const { data, error } = await supabase
        .from('leases')
        .select(`
          *,
          property:properties!inner(id, name, owner_id),
          tenant:tenants!inner(id, first_name, last_name)
        `)
        .eq('property.owner_id', userData.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error

      setLeases(data || [])
    } catch (error) {
      console.error('Error fetching leases:', error)
    }
  }

  const fetchPayment = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      setFormData({
        lease_id: data.lease_id || '',
        amount: data.amount || '',
        due_date: data.due_date || '',
        payment_date: data.payment_date || '',
        payment_method: data.payment_method || 'bank_transfer',
        status: data.status || 'pending',
        notes: data.notes || ''
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

  const handleLeaseChange = (e) => {
    const leaseId = e.target.value

    // Pré-remplir le montant avec le bail sélectionné
    if (leaseId) {
      const selectedLease = leases.find(l => l.id === leaseId)
      if (selectedLease) {
        const rentAmount = parseFloat(selectedLease.rent_amount) || 0
        const chargesAmount = parseFloat(selectedLease.charges_amount) || 0
        const totalAmount = rentAmount + chargesAmount

        setFormData(prev => ({
          ...prev,
          lease_id: leaseId,
          amount: totalAmount
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        lease_id: '',
        amount: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Préparer les données pour l'insertion/mise à jour
      const paymentData = {
        lease_id: formData.lease_id,
        amount: parseFloat(formData.amount),
        due_date: formData.due_date,
        payment_date: formData.payment_date || null,
        payment_method: formData.payment_method || null,
        status: formData.status,
        notes: formData.notes || null
      }

      if (isEditMode) {
        // Mise à jour
        const { error } = await supabase
          .from('payments')
          .update(paymentData)
          .eq('id', id)

        if (error) throw error
      } else {
        // Création
        const { error } = await supabase
          .from('payments')
          .insert([paymentData])

        if (error) throw error
      }

      // Rediriger vers la liste des paiements
      navigate('/payments')
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
              {isEditMode ? 'Modifier le paiement' : 'Enregistrer un paiement'}
            </h2>
            <Link
              to="/payments"
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
            {/* Sélection du bail */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Bail *
              </label>
              <select
                name="lease_id"
                value={formData.lease_id}
                onChange={handleLeaseChange}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isEditMode}
              >
                <option value="">Sélectionnez un bail actif</option>
                {leases.map((lease) => (
                  <option key={lease.id} value={lease.id}>
                    {lease.property.name} - {lease.tenant.first_name} {lease.tenant.last_name}
                  </option>
                ))}
              </select>
              {isEditMode && (
                <p className="text-sm text-gray-500 mt-1">
                  Le bail ne peut pas être modifié après la création du paiement
                </p>
              )}
            </div>

            {/* Montant */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Montant total (€) *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1030.00"
                step="0.01"
                min="0"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Montant pré-rempli avec loyer + charges du bail sélectionné
              </p>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Date d'échéance *
                </label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Date de paiement
                </label>
                <input
                  type="date"
                  name="payment_date"
                  value={formData.payment_date}
                  onChange={handleChange}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Mode de paiement */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Mode de paiement
              </label>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Non spécifié</option>
                <option value="bank_transfer">Virement</option>
                <option value="check">Chèque</option>
                <option value="cash">Espèces</option>
                <option value="direct_debit">Prélèvement</option>
                <option value="other">Autre</option>
              </select>
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
                <option value="pending">En attente</option>
                <option value="paid">Payé</option>
                <option value="late">En retard</option>
                <option value="partial">Partiel</option>
              </select>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Notes optionnelles sur ce paiement..."
              />
            </div>

            {/* Boutons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-500 text-white p-3 rounded font-semibold hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Enregistrement...' : isEditMode ? 'Mettre à jour' : 'Enregistrer le paiement'}
              </button>
              <Link
                to="/payments"
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

export default PaymentForm
