import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Alert from '../components/ui/Alert'
import Loading from '../components/ui/Loading'
import {
  getCandidateByToken,
  getCandidateByEmail,
  getDocuments,
  getDocumentUrl,
  uploadDocument
} from '../services/candidateService'
import {
  Search,
  Mail,
  Key,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Download,
  Upload,
  Building,
  Euro,
  Calendar
} from 'lucide-react'

function CandidateStatus() {
  const [searchParams] = useSearchParams()
  const tokenFromUrl = searchParams.get('token')
  const { success, error: showError } = useToast()

  const [searchType, setSearchType] = useState(tokenFromUrl ? 'token' : 'email')
  const [searchValue, setSearchValue] = useState(tokenFromUrl || '')
  const [candidate, setCandidate] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      setError('Veuillez entrer un email ou un numéro de suivi')
      return
    }

    setLoading(true)
    setError(null)
    setCandidate(null)
    setCandidates([])
    setDocuments([])

    try {
      if (searchType === 'token') {
        const { data, error: fetchError } = await getCandidateByToken(searchValue.trim())
        if (fetchError) throw fetchError
        if (!data) throw new Error('Aucune candidature trouvée avec ce numéro de suivi')
        setCandidate(data)

        // Charger les documents
        const { data: docsData } = await getDocuments(data.id)
        setDocuments(docsData || [])
      } else {
        const { data, error: fetchError } = await getCandidateByEmail(searchValue.trim())
        if (fetchError) throw fetchError
        if (!data || data.length === 0) {
          throw new Error('Aucune candidature trouvée avec cet email')
        }
        setCandidates(data)
        // Si une seule candidature, la sélectionner automatiquement
        if (data.length === 1) {
          setCandidate(data[0])
          const { data: docsData } = await getDocuments(data[0].id)
          setDocuments(docsData || [])
        }
      }
    } catch (err) {
      console.error('Error searching candidate:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectCandidate = async (selectedCandidate) => {
    setCandidate(selectedCandidate)
    const { data: docsData } = await getDocuments(selectedCandidate.id)
    setDocuments(docsData || [])
  }

  const handleUploadDocument = async (e, docType) => {
    const file = e.target.files[0]
    if (!file || !candidate) return

    setUploading(true)
    try {
      const { error: uploadError } = await uploadDocument(candidate.id, file, docType)
      if (uploadError) throw uploadError

      // Recharger les documents
      const { data: docsData } = await getDocuments(candidate.id)
      setDocuments(docsData || [])

      success('Document ajouté avec succès')
    } catch (err) {
      console.error('Error uploading document:', err)
      showError('Erreur lors de l\'ajout du document')
    } finally {
      setUploading(false)
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
      reviewing: 'En cours d\'examen',
      accepted: 'Acceptée',
      rejected: 'Refusée'
    }

    const icons = {
      pending: Clock,
      reviewing: Search,
      accepted: CheckCircle,
      rejected: XCircle
    }

    const Icon = icons[status] || Clock

    return (
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5" />
        <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>
      </div>
    )
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

  return (
    <div className="min-h-screen bg-[var(--background)] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-[var(--text)] mb-2">Suivi de candidature</h1>
          <p className="text-[var(--text-secondary)]">
            Consultez l'état de votre candidature et vos documents
          </p>
        </div>

        {/* Formulaire de recherche */}
        {!candidate && candidates.length === 0 && (
          <Card padding>
            <div className="space-y-6">
              <div className="flex gap-4">
                <button
                  onClick={() => setSearchType('email')}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 transition-colors ${
                    searchType === 'email'
                      ? 'border-[var(--color-electric-blue)] bg-[var(--color-electric-blue)]/10 text-[var(--color-electric-blue)]'
                      : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
                  }`}
                >
                  <Mail className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Par email</span>
                </button>
                <button
                  onClick={() => setSearchType('token')}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 transition-colors ${
                    searchType === 'token'
                      ? 'border-[var(--color-electric-blue)] bg-[var(--color-electric-blue)]/10 text-[var(--color-electric-blue)]'
                      : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
                  }`}
                >
                  <Key className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Par numéro de suivi</span>
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  {searchType === 'email' ? 'Votre email' : 'Numéro de suivi'}
                </label>
                <input
                  type={searchType === 'email' ? 'email' : 'text'}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={
                    searchType === 'email'
                      ? 'votre@email.com'
                      : 'cand-xxxxxxxxxxxxx'
                  }
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                />
              </div>

              {error && (
                <Alert variant="error" title="Erreur">
                  {error}
                </Alert>
              )}

              <Button
                variant="primary"
                onClick={handleSearch}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loading variant="spinner" size="sm" />
                    <span className="ml-2">Recherche...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Rechercher ma candidature
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Liste des candidatures (si plusieurs pour le même email) */}
        {candidates.length > 1 && !candidate && (
          <Card title="Vos candidatures" padding>
            <div className="space-y-3">
              {candidates.map((c) => (
                <div
                  key={c.id}
                  className="border border-[var(--border)] rounded-xl p-4 hover:border-[var(--color-electric-blue)]/50 cursor-pointer transition-colors"
                  onClick={() => handleSelectCandidate(c)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[var(--text)]">
                        {c.lots?.name} - {c.lots?.properties_new?.name}
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">
                        Candidature du {formatDate(c.created_at)}
                      </p>
                    </div>
                    {getStatusBadge(c.status)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Détails de la candidature */}
        {candidate && (
          <div className="space-y-6">
            {/* En-tête */}
            <Card padding>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-bold text-[var(--text)]">Votre candidature</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCandidate(null)
                    setCandidates([])
                    setDocuments([])
                    setSearchValue('')
                  }}
                >
                  Nouvelle recherche
                </Button>
              </div>

              <div className="bg-[var(--surface-elevated)] rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Statut</p>
                    <div className="mt-1">{getStatusBadge(candidate.status)}</div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[var(--text-muted)]">Numéro de suivi</p>
                    <p className="text-sm font-mono font-medium text-[var(--text)] mt-1">
                      {candidate.access_token}
                    </p>
                  </div>
                </div>
              </div>

              {candidate.status === 'accepted' && (
                <Alert variant="success" title="Félicitations !">
                  Votre candidature a été acceptée. Le propriétaire va vous contacter
                  prochainement pour finaliser le bail.
                </Alert>
              )}

              {candidate.status === 'rejected' && (
                <Alert variant="error" title="Candidature refusée">
                  {candidate.rejection_reason || 'Votre candidature n\'a pas été retenue.'}
                </Alert>
              )}

              {candidate.status === 'pending' && (
                <Alert variant="info">
                  Votre candidature est en attente d'examen. Le propriétaire vous contactera
                  prochainement.
                </Alert>
              )}

              {candidate.status === 'reviewing' && (
                <Alert variant="info">
                  Votre candidature est en cours d'examen par le propriétaire.
                </Alert>
              )}
            </Card>

            {/* Informations du lot */}
            <Card title="Lot concerné" padding>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-[var(--text-muted)] mt-0.5" />
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Lot</p>
                    <p className="text-base font-medium text-[var(--text)]">
                      {candidate.lots?.name || 'Non renseigné'}
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">
                      {candidate.lots?.properties_new?.name || 'Propriété non renseignée'}
                    </p>
                    {candidate.lots?.properties_new?.address && (
                      <p className="text-sm text-[var(--text-muted)] mt-1">
                        {candidate.lots.properties_new.address}, {candidate.lots.properties_new.city}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Euro className="w-5 h-5 text-[var(--text-muted)] mt-0.5" />
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Loyer</p>
                    <p className="text-base font-medium text-[var(--text)]">
                      {formatCurrency(candidate.lots?.rent_amount)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[var(--text-muted)] mt-0.5" />
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Date de candidature</p>
                    <p className="text-base text-[var(--text)]">{formatDate(candidate.created_at)}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Documents */}
            <Card title="Vos documents" padding>
              {documents.length === 0 ? (
                <p className="text-[var(--text-muted)] text-center py-4">Aucun document uploadé</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="border border-[var(--border)] rounded-xl p-4 hover:border-[var(--color-electric-blue)]/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <FileText className="w-8 h-8 text-[var(--color-electric-blue)]" />
                        <a
                          href={getDocumentUrl(doc.file_path)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--color-electric-blue)] hover:text-[var(--color-electric-blue)]/80 transition-colors"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                      </div>
                      <p className="text-sm font-medium text-[var(--text)] mb-1">
                        {getDocumentTypeLabel(doc.document_type)}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] truncate">{doc.file_name}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        {formatDate(doc.uploaded_at)} •{' '}
                        {(doc.file_size / 1024 / 1024).toFixed(2)} Mo
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {candidate.status !== 'rejected' && (
                <div className="border-t border-[var(--border)] pt-6">
                  <h3 className="text-sm font-medium text-[var(--text)] mb-4">
                    Ajouter un document
                  </h3>
                  <div className="flex gap-3">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleUploadDocument(e, 'other')}
                      disabled={uploading}
                      className="flex-1 px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                    />
                    {uploading && <Loading variant="spinner" size="sm" />}
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-2">
                    Formats acceptés : PDF, JPEG, PNG (max 10 Mo)
                  </p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default CandidateStatus
