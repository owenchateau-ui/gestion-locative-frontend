import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Alert from '../components/ui/Alert'
import Loading from '../components/ui/Loading'
import {
  getCandidateById,
  updateCandidateStatus,
  getDocumentUrl,
  convertToTenant
} from '../services/candidateService'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  Euro,
  TrendingUp,
  FileText,
  Download,
  Check,
  X,
  UserPlus,
  AlertCircle,
  Building
} from 'lucide-react'

function CandidateDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { success, error: showError, warning } = useToast()

  const [candidate, setCandidate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)

  // Modal de refus
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  useDocumentTitle(
    candidate ? `${candidate.first_name} ${candidate.last_name}` : 'Candidature'
  )

  useEffect(() => {
    loadCandidate()
  }, [id])

  const loadCandidate = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await getCandidateById(id)
      if (fetchError) throw fetchError

      console.log('🔍 DEBUG CandidateDetail: Candidate data received:', data)
      console.log('🔍 DEBUG CandidateDetail: Documents in data:', data?.documents)
      console.log('🔍 DEBUG CandidateDetail: Number of documents:', data?.documents?.length || 0)

      setCandidate(data)  // data contient maintenant les documents
    } catch (err) {
      console.error('Error loading candidate:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!confirm('Êtes-vous sûr de vouloir accepter cette candidature ?')) return

    setProcessing(true)
    try {
      const { error } = await updateCandidateStatus(id, 'accepted')
      if (error) throw error

      await loadCandidate()
      success('Candidature acceptée avec succès')
    } catch (err) {
      console.error('Error accepting candidate:', err)
      showError('Erreur lors de l\'acceptation de la candidature')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      warning('Veuillez indiquer une raison de refus')
      return
    }

    setProcessing(true)
    try {
      const { error } = await updateCandidateStatus(id, 'rejected', rejectionReason)
      if (error) throw error

      setShowRejectModal(false)
      await loadCandidate()
      success('Candidature refusée')
    } catch (err) {
      console.error('Error rejecting candidate:', err)
      showError('Erreur lors du refus de la candidature')
    } finally {
      setProcessing(false)
    }
  }

  const handleConvertToTenant = async () => {
    if (!confirm(
      'Voulez-vous créer un locataire et un bail à partir de cette candidature ?\n\n' +
      'Un locataire sera créé avec les informations du candidat et un bail en brouillon sera généré.'
    )) return

    setProcessing(true)
    try {
      const { data, error } = await convertToTenant(id)
      if (error) throw error

      success('Locataire et bail créés avec succès')
      navigate(`/leases/${data.lease.id}`)
    } catch (err) {
      console.error('Error converting to tenant:', err)
      showError(err.message || 'Erreur lors de la conversion')
    } finally {
      setProcessing(false)
    }
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

  const getEmploymentStatusLabel = (status) => {
    const labels = {
      cdi: 'CDI',
      cdd: 'CDD',
      interim: 'Intérim',
      freelance: 'Indépendant',
      student: 'Étudiant',
      retired: 'Retraité',
      unemployed: 'Sans emploi',
      other: 'Autre'
    }
    return labels[status] || status
  }

  const getDocumentTypeLabel = (type) => {
    const labels = {
      identity: 'Pièce d\'identité',
      payslip_1: 'Bulletin de salaire 1',
      payslip_2: 'Bulletin de salaire 2',
      payslip_3: 'Bulletin de salaire 3',
      tax_notice: 'Avis d\'imposition',
      proof_of_address: 'Justificatif de domicile',
      employment_contract: 'Contrat de travail',
      guarantor_identity: 'Pièce d\'identité garant',
      guarantor_payslip: 'Bulletin de salaire garant',
      guarantor_tax_notice: 'Avis d\'imposition garant',
      other: 'Autre'
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <DashboardLayout title="Candidature">
        <Loading fullScreen message="Chargement de la candidature..." />
      </DashboardLayout>
    )
  }

  if (error || !candidate) {
    return (
      <DashboardLayout title="Candidature">
        <Alert variant="error" title="Erreur">
          {error || 'Candidature introuvable'}
        </Alert>
      </DashboardLayout>
    )
  }

  // Use total_monthly_income from database (includes all applicants) if available
  const totalIncome = candidate.total_monthly_income ||
                      ((candidate.monthly_income || 0) + (candidate.other_income || 0))
  const rentAmount = candidate.lots?.rent_amount || 0
  const incomeRatio = rentAmount > 0 ? (totalIncome / rentAmount).toFixed(2) : 0

  // Type badges
  const getApplicationTypeBadge = () => {
    const type = candidate.application_type || 'individual'
    if (type === 'individual') return null // Don't show badge for individual
    if (type === 'couple') {
      return <Badge variant="default" className="bg-pink-100 text-pink-800">💑 Couple</Badge>
    }
    if (type === 'colocation') {
      const nb = candidate.nb_applicants || 2
      return <Badge variant="default" className="bg-purple-100 text-purple-800">👥 Colocation ({nb} pers.)</Badge>
    }
    return null
  }

  return (
    <DashboardLayout title={`${candidate.first_name} ${candidate.last_name}`}>
      <div className="space-y-6">
        {/* En-tête */}
        <Card padding>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-display font-bold text-[var(--text)]">
                  {candidate.first_name} {candidate.last_name}
                  {candidate.application_type === 'couple' && ' + 1 autre'}
                  {candidate.application_type === 'colocation' && ` + ${(candidate.nb_applicants || 2) - 1} autres`}
                </h2>
                {getStatusBadge(candidate.status)}
                {getApplicationTypeBadge()}
              </div>
              <div className="flex flex-col gap-1 text-sm text-[var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {candidate.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {candidate.phone}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Candidature du {formatDate(candidate.created_at)}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {candidate.status === 'pending' && (
                <>
                  <Button variant="success" onClick={handleAccept} disabled={processing}>
                    <Check className="w-4 h-4 mr-2" />
                    Accepter
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setShowRejectModal(true)}
                    disabled={processing}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Refuser
                  </Button>
                </>
              )}
              {candidate.status === 'accepted' && !candidate.converted_to_tenant && (
                <Button variant="primary" onClick={handleConvertToTenant} disabled={processing}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Créer locataire et bail
                </Button>
              )}
              {candidate.converted_to_tenant && (
                <Alert variant="success">
                  Candidat converti en locataire le {formatDate(candidate.converted_at)}
                </Alert>
              )}
            </div>
          </div>
        </Card>

        {/* Refus */}
        {candidate.status === 'rejected' && candidate.rejection_reason && (
          <Alert variant="error" title="Raison du refus">
            {candidate.rejection_reason}
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations du lot */}
          <Card title="Informations du lot" padding>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 text-[var(--text-muted)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Lot</p>
                  <p className="text-base font-medium text-[var(--text)]">
                    {candidate.lots?.name}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[var(--text-muted)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Adresse</p>
                  <p className="text-base text-[var(--text)]">
                    {candidate.lots?.properties_new?.address}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {candidate.lots?.properties_new?.postal_code}{' '}
                    {candidate.lots?.properties_new?.city}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Euro className="w-5 h-5 text-[var(--text-muted)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Loyer</p>
                  <p className="text-base font-medium text-[var(--text)]">
                    {formatCurrency(candidate.lots?.rent_amount)}
                  </p>
                  {candidate.lots?.charges_amount > 0 && (
                    <p className="text-sm text-[var(--text-secondary)]">
                      + {formatCurrency(candidate.lots?.charges_amount)} de charges
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Score de solvabilité */}
          <Card title="Score de solvabilité" padding>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Score</span>
                <Badge
                  variant={
                    candidate.solvability_score >= 3
                      ? 'success'
                      : candidate.solvability_score >= 2
                      ? 'warning'
                      : 'danger'
                  }
                >
                  {candidate.solvability_score}/5
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Revenus totaux</span>
                <span className="text-base font-medium text-[var(--text)]">
                  {formatCurrency(totalIncome)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Loyer demandé</span>
                <span className="text-base font-medium text-[var(--text)]">
                  {formatCurrency(rentAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                <span className="text-sm font-medium text-[var(--text)]">Ratio revenus/loyer</span>
                <div className="flex items-center gap-2">
                  <TrendingUp
                    className={`w-5 h-5 ${
                      incomeRatio >= 3
                        ? 'text-emerald-500 dark:text-emerald-400'
                        : incomeRatio >= 2
                        ? 'text-orange-500 dark:text-orange-400'
                        : 'text-red-500 dark:text-red-400'
                    }`}
                  />
                  <span className="text-lg font-display font-bold text-[var(--text)]">{incomeRatio}x</span>
                </div>
              </div>
              {incomeRatio < 3 && (
                <Alert variant="warning">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Le ratio est inférieur à 3x (recommandé)
                </Alert>
              )}
            </div>
          </Card>
        </div>

        {/* Informations personnelles - Candidat 1 */}
        <Card
          title={candidate.application_type && candidate.application_type !== 'individual'
            ? 'Informations personnelles - Candidat 1'
            : 'Informations personnelles'}
          padding
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-[var(--text-muted)] mt-0.5" />
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Nom complet</p>
                <p className="text-base text-[var(--text)]">
                  {candidate.first_name} {candidate.last_name}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[var(--text-muted)] mt-0.5" />
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Date de naissance</p>
                <p className="text-base text-[var(--text)]">{formatDate(candidate.birth_date)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 md:col-span-2">
              <MapPin className="w-5 h-5 text-[var(--text-muted)] mt-0.5" />
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Adresse actuelle</p>
                <p className="text-base text-[var(--text)]">{candidate.current_address}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Candidat 2 */}
        {(candidate.application_type === 'couple' || candidate.application_type === 'colocation') && (
          <Card
            title={`Informations personnelles - ${candidate.application_type === 'couple' ? 'Conjoint(e)' : 'Candidat 2'}`}
            padding
            className="bg-pink-50 dark:bg-pink-900/20"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {candidate.applicant2_first_name && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-pink-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Nom complet</p>
                    <p className="text-base text-[var(--text)]">
                      {candidate.applicant2_first_name} {candidate.applicant2_last_name}
                    </p>
                  </div>
                </div>
              )}
              {candidate.applicant2_email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-pink-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Email</p>
                    <p className="text-base text-[var(--text)]">{candidate.applicant2_email}</p>
                  </div>
                </div>
              )}
              {candidate.applicant2_phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-pink-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Téléphone</p>
                    <p className="text-base text-[var(--text)]">{candidate.applicant2_phone}</p>
                  </div>
                </div>
              )}
              {candidate.applicant2_birth_date && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-pink-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Date de naissance</p>
                    <p className="text-base text-[var(--text)]">{formatDate(candidate.applicant2_birth_date)}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Candidat 3 */}
        {candidate.application_type === 'colocation' && candidate.nb_applicants >= 3 && (
          <Card
            title="Informations personnelles - Candidat 3"
            padding
            className="bg-[var(--color-purple)]/5 dark:bg-[var(--color-purple)]/10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {candidate.applicant3_first_name && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-[var(--color-purple)] mt-0.5" />
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Nom complet</p>
                    <p className="text-base text-[var(--text)]">
                      {candidate.applicant3_first_name} {candidate.applicant3_last_name}
                    </p>
                  </div>
                </div>
              )}
              {candidate.applicant3_email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[var(--color-purple)] mt-0.5" />
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Email</p>
                    <p className="text-base text-[var(--text)]">{candidate.applicant3_email}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Candidat 4 */}
        {candidate.application_type === 'colocation' && candidate.nb_applicants >= 4 && (
          <Card
            title="Informations personnelles - Candidat 4"
            padding
            className="bg-[var(--color-purple)]/5 dark:bg-[var(--color-purple)]/10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {candidate.applicant4_first_name && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-[var(--color-purple)] mt-0.5" />
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Nom complet</p>
                    <p className="text-base text-[var(--text)]">
                      {candidate.applicant4_first_name} {candidate.applicant4_last_name}
                    </p>
                  </div>
                </div>
              )}
              {candidate.applicant4_email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[var(--color-purple)] mt-0.5" />
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Email</p>
                    <p className="text-base text-[var(--text)]">{candidate.applicant4_email}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Situation professionnelle */}
        <Card title="Situation professionnelle" padding>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Briefcase className="w-5 h-5 text-[var(--text-muted)] mt-0.5" />
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Statut</p>
                <p className="text-base text-[var(--text)]">
                  {getEmploymentStatusLabel(candidate.professional_status)}
                </p>
              </div>
            </div>
            {candidate.employer_name && (
              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 text-[var(--text-muted)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Employeur</p>
                  <p className="text-base text-[var(--text)]">{candidate.employer_name}</p>
                </div>
              </div>
            )}
            {candidate.job_title && (
              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-[var(--text-muted)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Poste</p>
                  <p className="text-base text-[var(--text)]">{candidate.job_title}</p>
                </div>
              </div>
            )}
            {candidate.contract_type && (
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-[var(--text-muted)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Type de contrat</p>
                  <p className="text-base text-[var(--text)]">{candidate.contract_type}</p>
                </div>
              </div>
            )}
            {candidate.employment_start_date && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-[var(--text-muted)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Ancienneté</p>
                  <p className="text-base text-[var(--text)]">
                    Depuis le {formatDate(candidate.employment_start_date)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Revenus */}
        <Card
          title={candidate.application_type && candidate.application_type !== 'individual'
            ? 'Revenus cumulés'
            : 'Revenus'}
          padding
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Euro className="w-5 h-5 text-[var(--text-muted)] mt-0.5" />
              <div>
                <p className="text-sm text-[var(--text-secondary)]">
                  {candidate.application_type && candidate.application_type !== 'individual'
                    ? 'Candidat 1 - Salaire mensuel'
                    : 'Salaire mensuel'}
                </p>
                <p className="text-base font-medium text-[var(--text)]">
                  {formatCurrency(candidate.monthly_income)}
                </p>
              </div>
            </div>
            {candidate.other_income > 0 && (
              <div className="flex items-start gap-3">
                <Euro className="w-5 h-5 text-[var(--text-muted)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Candidat 1 - Autres revenus</p>
                  <p className="text-base font-medium text-[var(--text)]">
                    {formatCurrency(candidate.other_income)}
                  </p>
                </div>
              </div>
            )}

            {/* Candidat 2 */}
            {(candidate.application_type === 'couple' || candidate.application_type === 'colocation') && (
              <>
                {candidate.applicant2_monthly_income > 0 && (
                  <div className="flex items-start gap-3">
                    <Euro className="w-5 h-5 text-pink-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-[var(--text-secondary)]">Candidat 2 - Salaire mensuel</p>
                      <p className="text-base font-medium text-[var(--text)]">
                        {formatCurrency(candidate.applicant2_monthly_income)}
                      </p>
                    </div>
                  </div>
                )}
                {candidate.applicant2_other_income > 0 && (
                  <div className="flex items-start gap-3">
                    <Euro className="w-5 h-5 text-pink-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-[var(--text-secondary)]">Candidat 2 - Autres revenus</p>
                      <p className="text-base font-medium text-[var(--text)]">
                        {formatCurrency(candidate.applicant2_other_income)}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Candidat 3 */}
            {candidate.application_type === 'colocation' && candidate.nb_applicants >= 3 && (
              <>
                {candidate.applicant3_monthly_income > 0 && (
                  <div className="flex items-start gap-3">
                    <Euro className="w-5 h-5 text-[var(--color-purple)] mt-0.5" />
                    <div>
                      <p className="text-sm text-[var(--text-secondary)]">Candidat 3 - Salaire mensuel</p>
                      <p className="text-base font-medium text-[var(--text)]">
                        {formatCurrency(candidate.applicant3_monthly_income)}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Candidat 4 */}
            {candidate.application_type === 'colocation' && candidate.nb_applicants >= 4 && (
              <>
                {candidate.applicant4_monthly_income > 0 && (
                  <div className="flex items-start gap-3">
                    <Euro className="w-5 h-5 text-[var(--color-purple)] mt-0.5" />
                    <div>
                      <p className="text-sm text-[var(--text-secondary)]">Candidat 4 - Salaire mensuel</p>
                      <p className="text-base font-medium text-[var(--text)]">
                        {formatCurrency(candidate.applicant4_monthly_income)}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Total cumulé */}
            <div className={`flex items-start gap-3 md:col-span-3 p-4 rounded-xl ${
              candidate.application_type === 'couple' ? 'bg-pink-50 dark:bg-pink-900/20' :
              candidate.application_type === 'colocation' ? 'bg-[var(--color-purple)]/5 dark:bg-[var(--color-purple)]/10' :
              'bg-[var(--color-electric-blue)]/5 dark:bg-[var(--color-electric-blue)]/10'
            }`}>
              <TrendingUp className={`w-6 h-6 mt-0.5 ${
                candidate.application_type === 'couple' ? 'text-pink-600 dark:text-pink-400' :
                candidate.application_type === 'colocation' ? 'text-[var(--color-purple)]' :
                'text-[var(--color-electric-blue)]'
              }`} />
              <div>
                <p className="text-sm font-medium text-[var(--text)]">
                  {candidate.application_type && candidate.application_type !== 'individual'
                    ? 'Total cumulé (tous candidats)'
                    : 'Total revenus'}
                </p>
                <p className={`text-2xl font-display font-bold ${
                  candidate.application_type === 'couple' ? 'text-pink-600 dark:text-pink-400' :
                  candidate.application_type === 'colocation' ? 'text-[var(--color-purple)]' :
                  'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {formatCurrency(totalIncome)}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Ratio avec le loyer: <span className="font-semibold">{incomeRatio}x</span>
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Garant 1 */}
        {candidate.has_guarantor && (
          <Card
            title={candidate.has_guarantor2 ? "Informations du garant 1" : "Informations du garant"}
            padding
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-[var(--text-muted)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Nom complet</p>
                  <p className="text-base text-[var(--text)]">
                    {candidate.guarantor_first_name} {candidate.guarantor_last_name}
                  </p>
                </div>
              </div>
              {candidate.guarantor_relationship && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-[var(--text-muted)] mt-0.5" />
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Lien avec le candidat</p>
                    <p className="text-base text-[var(--text)]">{candidate.guarantor_relationship}</p>
                  </div>
                </div>
              )}
              {candidate.guarantor_email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[var(--text-muted)] mt-0.5" />
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Email</p>
                    <p className="text-base text-[var(--text)]">{candidate.guarantor_email}</p>
                  </div>
                </div>
              )}
              {candidate.guarantor_phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[var(--text-muted)] mt-0.5" />
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Téléphone</p>
                    <p className="text-base text-[var(--text)]">{candidate.guarantor_phone}</p>
                  </div>
                </div>
              )}
              {candidate.guarantor_monthly_income > 0 && (
                <div className="flex items-start gap-3">
                  <Euro className="w-5 h-5 text-[var(--text-muted)] mt-0.5" />
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Revenus mensuels</p>
                    <p className="text-base font-medium text-[var(--text)]">
                      {formatCurrency(candidate.guarantor_monthly_income)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Garant 2 */}
        {candidate.has_guarantor2 && (
          <Card title="Informations du garant 2" padding className="bg-teal-50 dark:bg-teal-900/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {candidate.guarantor2_first_name && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-teal-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Nom complet</p>
                    <p className="text-base text-[var(--text)]">
                      {candidate.guarantor2_first_name} {candidate.guarantor2_last_name}
                    </p>
                  </div>
                </div>
              )}
              {candidate.guarantor2_relationship && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-teal-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Lien avec le candidat</p>
                    <p className="text-base text-[var(--text)]">{candidate.guarantor2_relationship}</p>
                  </div>
                </div>
              )}
              {candidate.guarantor2_email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-teal-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Email</p>
                    <p className="text-base text-[var(--text)]">{candidate.guarantor2_email}</p>
                  </div>
                </div>
              )}
              {candidate.guarantor2_phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-teal-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Téléphone</p>
                    <p className="text-base text-[var(--text)]">{candidate.guarantor2_phone}</p>
                  </div>
                </div>
              )}
              {candidate.guarantor2_monthly_income > 0 && (
                <div className="flex items-start gap-3">
                  <Euro className="w-5 h-5 text-teal-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Revenus mensuels</p>
                    <p className="text-base font-medium text-[var(--text)]">
                      {formatCurrency(candidate.guarantor2_monthly_income)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Documents */}
        <Card title="Documents" padding>
          {(() => {
            console.log('🔍 DEBUG Documents render: candidate:', candidate)
            console.log('🔍 DEBUG Documents render: candidate.documents:', candidate?.documents)
            console.log('🔍 DEBUG Documents render: length:', candidate?.documents?.length)
            return null
          })()}
          {!candidate?.documents || candidate.documents.length === 0 ? (
            <p className="text-[var(--text-secondary)] text-center py-4">Aucun document uploadé</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {candidate.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="border border-[var(--border)] rounded-xl p-4 hover:border-[var(--color-electric-blue)] transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <FileText className="w-8 h-8 text-[var(--color-electric-blue)]" />
                    <a
                      href={getDocumentUrl(doc.file_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-electric-blue)] hover:text-[var(--color-electric-blue-dark)] transition-colors"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                  <p className="text-sm font-medium text-[var(--text)] mb-1">
                    {getDocumentTypeLabel(doc.document_type)}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] truncate">{doc.file_name}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {formatDate(doc.uploaded_at)} • {(doc.file_size / 1024 / 1024).toFixed(2)} Mo
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Modal de refus */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[var(--surface)] rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <h3 className="text-lg font-display font-bold text-[var(--text)] mb-4">Refuser la candidature</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                Veuillez indiquer la raison du refus (cette information sera visible par le
                candidat).
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-vivid-coral)]"
                placeholder="Raison du refus..."
              />
              <div className="flex gap-3 mt-4">
                <Button
                  variant="danger"
                  onClick={handleReject}
                  disabled={processing || !rejectionReason.trim()}
                  className="flex-1"
                >
                  Confirmer le refus
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowRejectModal(false)
                    setRejectionReason('')
                  }}
                  disabled={processing}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default CandidateDetail
