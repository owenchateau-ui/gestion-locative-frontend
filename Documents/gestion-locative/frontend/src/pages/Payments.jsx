import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import jsPDF from 'jspdf'

function Payments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('tous')
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    fetchPayments()
  }, [user, statusFilter])

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

      // Récupérer les paiements avec les informations du bail, bien et locataire
      let query = supabase
        .from('payments')
        .select(`
          *,
          lease:leases!inner(
            id,
            property:properties!inner(id, name, owner_id),
            tenant:tenants!inner(id, first_name, last_name)
          )
        `)
        .eq('lease.property.owner_id', userData.id)
        .order('due_date', { ascending: false })

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
          property:properties!inner(*),
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

      // Informations du bien
      doc.text('Bien loué :', 20, 75)
      doc.text(leaseData.property.name, 20, 81)
      doc.text(leaseData.property.address, 20, 87)
      doc.text(`${leaseData.property.postal_code} ${leaseData.property.city}`, 20, 93)

      // Période et montants
      const paymentDate = new Date(payment.payment_date)
      const month = paymentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

      doc.text(`Période : ${month}`, 20, 110)

      // Récupérer les montants du bail
      const rentAmount = parseFloat(leaseData.rent_amount) || 0
      const chargesAmount = parseFloat(leaseData.charges_amount) || 0

      doc.text('Détail des paiements :', 20, 125)
      doc.text(`Loyer : ${rentAmount.toFixed(2)} €`, 30, 135)
      doc.text(`Charges : ${chargesAmount.toFixed(2)} €`, 30, 141)
      doc.setFontSize(12)
      doc.text(`Total : ${payment.amount.toFixed(2)} €`, 30, 150)

      // Date de paiement
      doc.setFontSize(10)
      doc.text(`Payé le : ${paymentDate.toLocaleDateString('fr-FR')}`, 20, 165)
      if (payment.payment_method) {
        const methods = {
          bank_transfer: 'Virement',
          check: 'Chèque',
          cash: 'Espèces',
          direct_debit: 'Prélèvement',
          other: 'Autre'
        }
        doc.text(`Mode de paiement : ${methods[payment.payment_method] || payment.payment_method}`, 20, 171)
      }

      // Mentions légales
      doc.setFontSize(8)
      doc.text('Le bailleur reconnait avoir reçu du locataire la somme indiquée pour la période mentionnée.', 20, 190)
      doc.text('Cette quittance annule tous reçus ou quittances qui auraient pu être donnés précédemment.', 20, 195)

      // Signature
      doc.setFontSize(10)
      const today = new Date().toLocaleDateString('fr-FR')
      doc.text(`Fait le ${today}`, 120, 220)
      doc.text('Signature du bailleur', 120, 230)

      // Télécharger le PDF
      const filename = `quittance_${leaseData.tenant.last_name}_${paymentDate.getMonth() + 1}_${paymentDate.getFullYear()}.pdf`
      doc.save(filename)
    } catch (error) {
      alert('Erreur lors de la génération de la quittance : ' + error.message)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'paid': 'bg-green-100 text-green-800',
      'late': 'bg-red-100 text-red-800',
      'partial': 'bg-orange-100 text-orange-800'
    }
    const labels = {
      'pending': 'En attente',
      'paid': 'Payé',
      'late': 'En retard',
      'partial': 'Partiel'
    }
    return (
      <span className={`px-2 py-1 rounded text-sm ${badges[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR')
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
            <Link to="/leases" className="text-gray-600 hover:text-blue-600">
              Mes baux
            </Link>
            <Link to="/payments" className="text-blue-600 font-semibold">
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
            <h2 className="text-3xl font-bold">Paiements</h2>
            <p className="text-sm text-gray-600 mt-2">
              {payments.length} paiement{payments.length > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => navigate('/payments/new')}
            className="bg-blue-500 text-white px-6 py-3 rounded font-semibold hover:bg-blue-600"
          >
            + Enregistrer un paiement
          </button>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-gray-700 font-semibold">Filtrer par statut :</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="tous">Tous</option>
              <option value="pending">En attente</option>
              <option value="paid">Payés</option>
              <option value="late">En retard</option>
              <option value="partial">Partiels</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            {error}
          </div>
        )}

        {payments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">
              {statusFilter === 'tous'
                ? "Vous n'avez pas encore de paiement enregistré"
                : `Aucun paiement avec le statut "${statusFilter}"`
              }
            </p>
            <button
              onClick={() => navigate('/payments/new')}
              className="bg-blue-500 text-white px-6 py-3 rounded font-semibold hover:bg-blue-600"
            >
              Enregistrer votre premier paiement
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.lease.property.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {payment.lease.tenant.first_name} {payment.lease.tenant.last_name}
                      </div>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {payment.status === 'paid' && (
                        <button
                          onClick={() => generateReceipt(payment)}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Générer quittance
                        </button>
                      )}
                      <Link
                        to={`/payments/${payment.id}/edit`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Modifier
                      </Link>
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
        )}
      </div>
    </div>
  )
}

export default Payments
