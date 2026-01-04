import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Alert from '../components/ui/Alert'
import Loading from '../components/ui/Loading'
import InvitationLinkModal from '../components/candidates/InvitationLinkModal'
import { getAllCandidates, updateCandidateStatus } from '../services/candidateService'
import { fetchLots } from '../services/lotService'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Users, Mail, Phone, Euro, TrendingUp, Calendar, Eye, Check, X, Link as LinkIcon } from 'lucide-react'

function Candidates() {
  useDocumentTitle('Candidatures')

  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [candidates, setCandidates] = useState([])
  const [lots, setLots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filtres
  const [selectedLot, setSelectedLot] = useState(searchParams.get('lot') || '')
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '')

  // Modal lien d'invitation
  const [showInvitationModal, setShowInvitationModal] = useState(false)
  const [selectedLotForInvitation, setSelectedLotForInvitation] = useState(null)

  useEffect(() => {
    loadData()
  }, [user, selectedLot, selectedStatus])

  const loadData = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      // Charger les lots (pour le filtre)
      const { data: lotsData, error: lotsError } = await fetchLots(user.id)
      if (lotsError) throw lotsError
      setLots(lotsData || [])

      // Charger les candidatures avec filtres
      const filters = {}
      if (selectedLot) filters.lotId = selectedLot
      if (selectedStatus) filters.status = selectedStatus

      const { data: candidatesData, error: candidatesError } = await getAllCandidates(filters)
      if (candidatesError) throw candidatesError

      setCandidates(candidatesData || [])
    } catch (err) {
      console.error('Error loading candidates:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLotFilterChange = (lotId) => {
    setSelectedLot(lotId)
    if (lotId) {
      searchParams.set('lot', lotId)
    } else {
      searchParams.delete('lot')
    }
    setSearchParams(searchParams)
  }

  const handleStatusFilterChange = (status) => {
    setSelectedStatus(status)
    if (status) {
      searchParams.set('status', status)
    } else {
      searchParams.delete('status')
    }
    setSearchParams(searchParams)
  }

  const handleAccept = async (candidateId) => {
    if (!confirm('Êtes-vous sûr de vouloir accepter cette candidature ?')) return

    try {
      const { error } = await updateCandidateStatus(candidateId, 'accepted')
      if (error) throw error

      await loadData()
      alert('Candidature acceptée avec succès')
    } catch (err) {
      console.error('Error accepting candidate:', err)
      alert('Erreur lors de l\'acceptation de la candidature')
    }
  }

  const handleReject = async (candidateId) => {
    const reason = prompt('Raison du refus (optionnel) :')
    if (reason === null) return // Annulé

    try {
      const { error } = await updateCandidateStatus(candidateId, 'rejected', reason)
      if (error) throw error

      await loadData()
      alert('Candidature refusée')
    } catch (err) {
      console.error('Error rejecting candidate:', err)
      alert('Erreur lors du refus de la candidature')
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'default',
      reviewing: 'info',
      accepted: 'success',
      rejected: 'danger'
    }

    const labels = {
      pending: 'En attente',
      reviewing: 'En cours',
      accepted: 'Acceptée',
      rejected: 'Refusée'
    }

    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>
  }

  const getScoreBadge = (score) => {
    let variant = 'danger'
    if (score >= 3) variant = 'success'
    else if (score >= 2) variant = 'warning'

    return <Badge variant={variant}>{score}/5</Badge>
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const formatCurrency = (amount) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const openInvitationModal = (lot) => {
    setSelectedLotForInvitation(lot)
    setShowInvitationModal(true)
  }

  if (loading) {
    return (
      <DashboardLayout title="Candidatures">
        <Loading fullScreen message="Chargement des candidatures..." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Candidatures">
      <div className="space-y-6">
        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card padding>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">{candidates.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          <Card padding>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">En attente</p>
                <p className="text-2xl font-bold text-orange-600">
                  {candidates.filter(c => c.status === 'pending').length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </Card>
          <Card padding>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Acceptées</p>
                <p className="text-2xl font-bold text-green-600">
                  {candidates.filter(c => c.status === 'accepted').length}
                </p>
              </div>
              <Check className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          <Card padding>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Refusées</p>
                <p className="text-2xl font-bold text-red-600">
                  {candidates.filter(c => c.status === 'rejected').length}
                </p>
              </div>
              <X className="w-8 h-8 text-red-500" />
            </div>
          </Card>
        </div>

        {error && (
          <Alert variant="error" title="Erreur">
            {error}
          </Alert>
        )}

        {/* Filtres */}
        <Card padding>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="lot-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filtrer par lot
              </label>
              <select
                id="lot-filter"
                value={selectedLot}
                onChange={(e) => handleLotFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les lots</option>
                {lots.map((lot) => (
                  <option key={lot.id} value={lot.id}>
                    {lot.name} - {lot.properties_new?.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filtrer par statut
              </label>
              <select
                id="status-filter"
                value={selectedStatus}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="reviewing">En cours</option>
                <option value="accepted">Acceptée</option>
                <option value="rejected">Refusée</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedLot('')
                  setSelectedStatus('')
                  setSearchParams({})
                }}
                className="w-full"
              >
                Réinitialiser les filtres
              </Button>
            </div>
          </div>
        </Card>

        {/* Liste des candidatures */}
        <Card title="Liste des candidatures">
          {candidates.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Aucune candidature trouvée</p>
              <p className="text-sm text-gray-400 mb-4">
                Générez un lien d'invitation pour un lot vacant et partagez-le avec vos candidats
              </p>
              <Button
                variant="primary"
                onClick={() => {
                  const vacantLot = lots.find(l => l.status === 'vacant')
                  if (vacantLot) {
                    openInvitationModal(vacantLot)
                  } else {
                    alert('Aucun lot vacant disponible')
                  }
                }}
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                Générer un lien d'invitation
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lot
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenus
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {candidates.map((candidate) => {
                    // Use total_monthly_income if available (includes all applicants)
                    const totalIncome = candidate.total_monthly_income ||
                                       (candidate.monthly_income + (candidate.other_income || 0))

                    return (
                      <tr key={candidate.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">
                                {candidate.first_name} {candidate.last_name}
                                {candidate.application_type === 'couple' && (
                                  <span className="text-gray-500 font-normal"> + 1 autre</span>
                                )}
                                {candidate.application_type === 'colocation' && (
                                  <span className="text-gray-500 font-normal"> + {(candidate.nb_applicants || 2) - 1} autres</span>
                                )}
                              </span>
                              {candidate.application_type === 'couple' && (
                                <Badge variant="default" className="bg-pink-100 text-pink-700 text-xs px-2 py-0.5">💑</Badge>
                              )}
                              {candidate.application_type === 'colocation' && (
                                <Badge variant="default" className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5">👥 {candidate.nb_applicants}</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <Mail className="w-3 h-3" />
                              {candidate.email}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Phone className="w-3 h-3" />
                              {candidate.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{candidate.lots_new?.name}</div>
                          <div className="text-xs text-gray-500">
                            {candidate.lots_new?.properties_new?.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-gray-900">
                            <Euro className="w-4 h-4" />
                            {formatCurrency(totalIncome)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {candidate.application_type && candidate.application_type !== 'individual'
                              ? `Total cumulé • Loyer: ${formatCurrency(candidate.lots_new?.rent_amount)}`
                              : `Loyer: ${formatCurrency(candidate.lots_new?.rent_amount)}`}
                          </div>
                        </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getScoreBadge(candidate.solvability_score)}
                          <TrendingUp className="w-4 h-4 text-gray-400" />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(candidate.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(candidate.created_at)}
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/candidates/${candidate.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {candidate.status === 'pending' && (
                              <>
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => handleAccept(candidate.id)}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleReject(candidate.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Modal lien d'invitation */}
        {showInvitationModal && selectedLotForInvitation && (
          <InvitationLinkModal
            lot={selectedLotForInvitation}
            onClose={() => {
              setShowInvitationModal(false)
              setSelectedLotForInvitation(null)
            }}
            onSuccess={loadData}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

export default Candidates
