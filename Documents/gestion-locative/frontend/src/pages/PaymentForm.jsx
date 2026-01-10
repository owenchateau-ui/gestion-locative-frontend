import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

function PaymentForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEditMode = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [leases, setLeases] = useState([])
  const [selectedLease, setSelectedLease] = useState(null)
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

      // Récupérer les baux actifs avec les infos du lot, bien et locataire
      const { data, error } = await supabase
        .from('leases')
        .select(`
          *,
          lot:lots!inner(
            id,
            name,
            properties_new!inner(id, name, entities!inner(user_id))
          ),
          tenant:tenants!inner(id, first_name, last_name)
        `)
        .eq('lot.properties_new.entities.user_id', userData.id)
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
      const lease = leases.find(l => l.id === leaseId)
      if (lease) {
        setSelectedLease(lease)

        const rentAmount = parseFloat(lease.rent_amount) || 0
        const chargesAmount = parseFloat(lease.charges_amount) || 0
        const cafAmount = parseFloat(lease.caf_amount) || 0
        const cafDirectPayment = lease.caf_direct_payment || false

        // Si APL en versement direct, soustraire le montant CAF du total
        const totalRent = rentAmount + chargesAmount
        const tenantAmount = cafDirectPayment ? totalRent - cafAmount : totalRent

        setFormData(prev => ({
          ...prev,
          lease_id: leaseId,
          amount: tenantAmount,
          // Si APL en versement direct, suggérer le mode de paiement approprié
          payment_method: cafDirectPayment ? prev.payment_method : 'bank_transfer'
        }))
      }
    } else {
      setSelectedLease(null)
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
    <DashboardLayout title={isEditMode ? 'Modifier le paiement' : 'Enregistrer un paiement'}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-display font-bold text-[var(--text)]">
            {isEditMode ? 'Modifier le paiement' : 'Enregistrer un paiement'}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Renseignez les informations du paiement
          </p>
        </div>

        <Card>
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sélection du bail */}
            <div>
              <label htmlFor="payment-lease_id" className="block text-sm font-medium text-[var(--text)] mb-2">
                Bail *
              </label>
              <select
                id="payment-lease_id"
                name="lease_id"
                value={formData.lease_id}
                onChange={handleLeaseChange}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                required
                disabled={isEditMode}
              >
                <option value="">Sélectionnez un bail actif</option>
                {leases.map((lease) => (
                  <option key={lease.id} value={lease.id}>
                    {lease.lot.properties_new.name} - {lease.lot.name} - {lease.tenant.first_name} {lease.tenant.last_name}
                  </option>
                ))}
              </select>
              {isEditMode && (
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  Le bail ne peut pas être modifié après la création du paiement
                </p>
              )}
            </div>

            {/* Montant */}
            <div>
              <label htmlFor="payment-amount" className="block text-sm font-medium text-[var(--text)] mb-2">
                Montant total (€) *
              </label>
              <input
                id="payment-amount"
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                placeholder="1030.00"
                step="0.01"
                min="0"
                required
              />

              {/* Afficher le détail si CAF */}
              {selectedLease && selectedLease.caf_direct_payment && (
                <div className="mt-2 p-3 bg-[var(--color-electric-blue)]/10 dark:bg-[var(--color-electric-blue)]/20 rounded-xl border border-[var(--color-electric-blue)]/30">
                  <p className="text-xs font-display font-semibold text-[var(--color-electric-blue)] mb-2">
                    Bail avec APL en versement direct
                  </p>
                  <div className="text-xs text-[var(--text)] space-y-1">
                    <div className="flex justify-between">
                      <span>Loyer :</span>
                      <span className="font-medium">{parseFloat(selectedLease.rent_amount || 0).toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Charges :</span>
                      <span className="font-medium">{parseFloat(selectedLease.charges_amount || 0).toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-[var(--color-electric-blue)]/30">
                      <span>Total loyer :</span>
                      <span className="font-medium">
                        {(parseFloat(selectedLease.rent_amount || 0) + parseFloat(selectedLease.charges_amount || 0)).toFixed(2)} €
                      </span>
                    </div>
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>APL CAF :</span>
                      <span className="font-medium">- {parseFloat(selectedLease.caf_amount || 0).toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-[var(--color-electric-blue)]/30 font-semibold text-[var(--color-electric-blue)]">
                      <span>Reste à charge locataire :</span>
                      <span>
                        {(
                          parseFloat(selectedLease.rent_amount || 0) +
                          parseFloat(selectedLease.charges_amount || 0) -
                          parseFloat(selectedLease.caf_amount || 0)
                        ).toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {!selectedLease?.caf_direct_payment && (
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Montant pré-rempli avec loyer + charges du bail sélectionné
                </p>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="payment-due_date" className="block text-sm font-medium text-[var(--text)] mb-2">
                  Date d'échéance *
                </label>
                <input
                  id="payment-due_date"
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                  required
                />
              </div>
              <div>
                <label htmlFor="payment-payment_date" className="block text-sm font-medium text-[var(--text)] mb-2">
                  Date de paiement
                </label>
                <input
                  id="payment-payment_date"
                  type="date"
                  name="payment_date"
                  value={formData.payment_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* Mode de paiement */}
            <div>
              <label htmlFor="payment-payment_method" className="block text-sm font-medium text-[var(--text)] mb-2">
                Mode de paiement
              </label>
              <select
                id="payment-payment_method"
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
              >
                <option value="">Non spécifié</option>
                <option value="bank_transfer">Virement</option>
                <option value="check">Chèque</option>
                <option value="cash">Espèces</option>
                <option value="direct_debit">Prélèvement</option>
                <option value="caf">CAF (versement direct)</option>
                <option value="other">Autre</option>
              </select>
              {formData.payment_method === 'caf' && (
                <p className="text-xs text-[var(--color-electric-blue)] mt-1">
                  Versement des APL directement par la CAF
                </p>
              )}
            </div>

            {/* Statut */}
            <div>
              <label htmlFor="payment-status" className="block text-sm font-medium text-[var(--text)] mb-2">
                Statut *
              </label>
              <select
                id="payment-status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                required
              >
                <option value="pending">En attente</option>
                <option value="paid">Payé</option>
                <option value="late">En retard</option>
                <option value="partial">Partiel</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="payment-notes" className="block text-sm font-medium text-[var(--text)] mb-2">
                Notes
              </label>
              <textarea
                id="payment-notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                rows="3"
                placeholder="Notes optionnelles sur ce paiement..."
              />
            </div>

            {/* Boutons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                loading={loading}
                className="flex-1"
              >
                {isEditMode ? 'Mettre à jour' : 'Enregistrer le paiement'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/payments')}
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

export default PaymentForm
