import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useEntity } from '../context/EntityContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import jsPDF from 'jspdf'

function Payments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('tous')
  const navigate = useNavigate()
  const { user } = useAuth()
  const { selectedEntity } = useEntity()

  useEffect(() => {
    fetchPayments()
  }, [user, statusFilter, selectedEntity])

  const fetchPayments = async () => {
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

      // Récupérer les paiements avec les informations du bail, lot, bien et locataire
      let query = supabase
        .from('payments')
        .select(`
          *,
          lease:leases!inner(
            id,
            lot:lots!inner(
              id,
              name,
              properties_new!inner(id, name, entity_id, entities!inner(user_id))
            ),
            tenant:tenants!inner(
              id,
              first_name,
              last_name,
              group_id,
              is_main_tenant,
              tenant_groups(id, name, group_type)
            )
          )
        `)
        .eq('lease.lot.properties_new.entities.user_id', userData.id)
        .order('due_date', { ascending: false })

      // Appliquer le filtre d'entité
      if (selectedEntity) {
        query = query.eq('lease.lot.properties_new.entity_id', selectedEntity)
      }

      // Appliquer le filtre de statut
      if (statusFilter !== 'tous') {
        query = query.eq('status', statusFilter)
      }

      const { data, error: paymentsError } = await query

      if (paymentsError) throw paymentsError

      setPayments(data || [])
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Rafraîchir la liste
      fetchPayments()
    } catch (error) {
      alert('Erreur lors de la suppression : ' + error.message)
    }
  }

  const generateReceipt = async (payment) => {
    try {
      // Récupérer les informations complètes du bail, du bailleur et du bien
      const { data: leaseData, error: leaseError } = await supabase
        .from('leases')
        .select(`
          *,
          lot:lots!inner(
            *,
            properties_new!inner(*)
          ),
          tenant:tenants!inner(*)
        `)
        .eq('id', payment.lease_id)
        .single()

      if (leaseError) throw leaseError

      // Récupérer les informations du bailleur
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('supabase_uid', user.id)
        .single()

      if (userError) throw userError

      // Créer le PDF
      const doc = new jsPDF()

      // Titre
      doc.setFontSize(18)
      doc.text('QUITTANCE DE LOYER', 105, 20, { align: 'center' })

      // Informations du bailleur
      doc.setFontSize(10)
      doc.text('Bailleur :', 20, 40)
      doc.text(`${userData.first_name} ${userData.last_name}`, 20, 46)
      if (userData.address) {
        doc.text(userData.address, 20, 52)
      }
      if (userData.phone) {
        doc.text(`Tel: ${userData.phone}`, 20, 58)
      }

      // Informations du locataire
      doc.text('Locataire :', 120, 40)
      doc.text(`${leaseData.tenant.first_name} ${leaseData.tenant.last_name}`, 120, 46)
      doc.text(leaseData.tenant.email, 120, 52)
      if (leaseData.tenant.phone) {
        doc.text(`Tel: ${leaseData.tenant.phone}`, 120, 58)
      }

      // Informations du bien et du lot
      doc.text('Bien loué :', 20, 75)
      doc.text(leaseData.lot.properties_new.name, 20, 81)
      doc.text(`Lot : ${leaseData.lot.name}`, 20, 87)
      doc.text(leaseData.lot.properties_new.address, 20, 93)
      doc.text(`${leaseData.lot.properties_new.postal_code} ${leaseData.lot.properties_new.city}`, 20, 99)

      // Période et montants
      const paymentDate = new Date(payment.payment_date)
      const month = paymentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

      doc.text(`Période : ${month}`, 20, 115)

      // Récupérer les montants du bail
      const rentAmount = parseFloat(leaseData.rent_amount) || 0
      const chargesAmount = parseFloat(leaseData.charges_amount) || 0

      doc.text('Détail des paiements :', 20, 130)
      doc.text(`Loyer : ${rentAmount.toFixed(2)} €`, 30, 140)
      doc.text(`Charges : ${chargesAmount.toFixed(2)} €`, 30, 146)
      doc.setFontSize(12)
      doc.text(`Total : ${payment.amount.toFixed(2)} €`, 30, 155)

      // Date de paiement
      doc.setFontSize(10)
      doc.text(`Payé le : ${paymentDate.toLocaleDateString('fr-FR')}`, 20, 170)
      if (payment.payment_method) {
        const methods = {
          bank_transfer: 'Virement',
          check: 'Chèque',
          cash: 'Espèces',
          direct_debit: 'Prélèvement',
          other: 'Autre'
        }
        doc.text(`Mode de paiement : ${methods[payment.payment_method] || payment.payment_method}`, 20, 176)
      }

      // Mentions légales
      doc.setFontSize(8)
      doc.text('Le bailleur reconnait avoir reçu du locataire la somme indiquée pour la période mentionnée.', 20, 195)
      doc.text('Cette quittance annule tous reçus ou quittances qui auraient pu être donnés précédemment.', 20, 200)

      // Signature
      doc.setFontSize(10)
      const today = new Date().toLocaleDateString('fr-FR')
      doc.text(`Fait le ${today}`, 120, 225)
      doc.text('Signature du bailleur', 120, 235)

      // Télécharger le PDF
      const filename = `quittance_${leaseData.tenant.last_name}_${paymentDate.getMonth() + 1}_${paymentDate.getFullYear()}.pdf`
      doc.save(filename)
    } catch (error) {
      alert('Erreur lors de la génération de la quittance : ' + error.message)
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      paid: 'success',
      late: 'danger',
      partial: 'info'
    }
    const labels = {
      pending: 'En attente',
      paid: 'Payé',
      late: 'En retard',
      partial: 'Partiel'
    }
    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR')
  }

  if (loading) {
    return (
      <DashboardLayout title="Paiements">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-500">Chargement...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Paiements">
      <div className="space-y-6">
        {/* Header avec actions */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Paiements</h2>
            <p className="text-sm text-gray-600 mt-1">
              {payments.length} paiement{payments.length > 1 ? 's' : ''}
            </p>
          </div>
          <Button onClick={() => navigate('/payments/new')} size="lg">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Enregistrer un paiement
          </Button>
        </div>

        {/* Filtres */}
        <Card>
          <div className="flex items-center gap-4">
            <label className="text-gray-700 font-semibold">Filtrer par statut :</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="tous">Tous</option>
              <option value="pending">En attente</option>
              <option value="paid">Payés</option>
              <option value="late">En retard</option>
              <option value="partial">Partiels</option>
            </select>
          </div>
        </Card>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {payments.length === 0 ? (
          <Card className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {statusFilter === 'tous' ? 'Aucun paiement' : `Aucun paiement avec le statut "${statusFilter}"`}
            </h3>
            <p className="text-gray-600 mb-6">
              {statusFilter === 'tous'
                ? "Commencez par enregistrer votre premier paiement"
                : "Changez le filtre pour voir d'autres paiements"
              }
            </p>
            {statusFilter === 'tous' && (
              <Button onClick={() => navigate('/payments/new')}>
                Enregistrer votre premier paiement
              </Button>
            )}
          </Card>
        ) : (
          <Card padding={false}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bien / Lot
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Locataire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date échéance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date paiement
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
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.lease.lot.properties_new.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.lease.lot.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {payment.lease.tenant.tenant_groups?.name ||
                            `${payment.lease.tenant.first_name} ${payment.lease.tenant.last_name}`}
                        </div>
                        {payment.lease.tenant.tenant_groups && (
                          <div className="text-xs text-gray-500">
                            {payment.lease.tenant.tenant_groups.group_type === 'couple' && '👫 Couple'}
                            {payment.lease.tenant.tenant_groups.group_type === 'colocation' && '👥 Colocation'}
                            {payment.lease.tenant.tenant_groups.group_type === 'individual' && '👤 Individuel'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {payment.amount.toFixed(2)} €
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(payment.due_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(payment.payment_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        {payment.status === 'paid' && (
                          <button
                            onClick={() => generateReceipt(payment)}
                            className="text-emerald-600 hover:text-emerald-900"
                          >
                            Quittance
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/payments/${payment.id}/edit`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(payment.id)}
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
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Payments
