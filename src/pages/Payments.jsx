import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useEntity } from '../context/EntityContext'
import { useToast } from '../context/ToastContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import Alert from '../components/ui/Alert'
import ExportButton from '../components/ui/ExportButton'
import jsPDF from 'jspdf'
import { CreditCard } from 'lucide-react'

function Payments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('tous')
  const navigate = useNavigate()
  const { user } = useAuth()
  const { selectedEntity } = useEntity()
  const { success, error: showError } = useToast()

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
              tenant_groups!group_id(id, name, group_type)
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
    } catch (err) {
      showError(`Erreur lors de la suppression : ${err.message}`)
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
      success('Quittance générée avec succès')
    } catch (err) {
      showError(`Erreur lors de la génération de la quittance : ${err.message}`)
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
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="animate-skeleton bg-[var(--border)] rounded-lg h-8 w-36" />
              <div className="animate-skeleton bg-[var(--border)] rounded-lg h-4 w-24" />
            </div>
            <div className="animate-skeleton bg-[var(--border)] rounded-xl h-10 w-48" />
          </div>
          {/* Filter skeleton */}
          <Card>
            <div className="flex items-center gap-4">
              <div className="animate-skeleton bg-[var(--border)] rounded-lg h-5 w-32" />
              <div className="animate-skeleton bg-[var(--border)] rounded-xl h-10 w-36" />
            </div>
          </Card>
          {/* Table skeleton */}
          <Card padding={false}>
            <Skeleton type="table-row" count={5} />
          </Card>
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
            <h2 className="text-2xl font-display font-bold text-[var(--text)]">Paiements</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {payments.length} paiement{payments.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-3">
            <ExportButton
              data={payments.map(p => ({
                ...p,
                tenant_name: p.lease.tenant.tenant_groups?.name || `${p.lease.tenant.first_name} ${p.lease.tenant.last_name}`
              }))}
              type="payments"
              filename="paiements"
            />
            <Button onClick={() => navigate('/payments/new')} size="lg">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Enregistrer un paiement
            </Button>
          </div>
        </div>

        {/* Filtres */}
        <Card>
          <div className="flex items-center gap-4">
            <label className="text-[var(--text)] font-display font-semibold">Filtrer par statut :</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-all"
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
          <Alert variant="error" title="Erreur">
            {error}
          </Alert>
        )}

        {payments.length === 0 ? (
          <Card padding>
            <EmptyState
              icon={CreditCard}
              title={statusFilter === 'tous' ? 'Aucun paiement' : `Aucun paiement "${statusFilter}"`}
              description={statusFilter === 'tous'
                ? "Commencez par enregistrer votre premier paiement"
                : "Changez le filtre pour voir d'autres paiements"
              }
              variant={statusFilter !== 'tous' ? 'search' : 'default'}
              actionLabel={statusFilter === 'tous' ? "Enregistrer votre premier paiement" : undefined}
              onAction={statusFilter === 'tous' ? () => navigate('/payments/new') : undefined}
            />
          </Card>
        ) : (
          <Card padding={false}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--border)]">
                <thead className="bg-[var(--surface-elevated)]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Bien / Lot
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Locataire
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Date échéance
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Date paiement
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--surface)] divide-y divide-[var(--border)]">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[var(--text)]">
                          {payment.lease.lot.properties_new.name}
                        </div>
                        <div className="text-sm text-[var(--text-muted)]">
                          {payment.lease.lot.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--text)]">
                          {payment.lease.tenant.tenant_groups?.name ||
                            `${payment.lease.tenant.first_name} ${payment.lease.tenant.last_name}`}
                        </div>
                        {payment.lease.tenant.tenant_groups && (
                          <div className="text-xs text-[var(--text-muted)]">
                            {payment.lease.tenant.tenant_groups.group_type === 'couple' && '👫 Couple'}
                            {payment.lease.tenant.tenant_groups.group_type === 'colocation' && '👥 Colocation'}
                            {payment.lease.tenant.tenant_groups.group_type === 'individual' && '👤 Individuel'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-display font-semibold text-[var(--text)]">
                          {payment.amount.toFixed(2)} €
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--text)]">
                          {formatDate(payment.due_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--text)]">
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
                            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                          >
                            Quittance
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/payments/${payment.id}/edit`)}
                          className="text-[var(--color-electric-blue)] hover:text-[var(--color-electric-blue-dark)] transition-colors"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(payment.id)}
                          className="text-[var(--color-vivid-coral)] hover:text-[var(--color-coral-dark)] transition-colors"
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
