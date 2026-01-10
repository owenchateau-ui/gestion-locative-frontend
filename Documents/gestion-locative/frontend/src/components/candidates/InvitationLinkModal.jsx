import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Button from '../ui/Button'
import Alert from '../ui/Alert'
import Loading from '../ui/Loading'
import {
  getInvitationLink,
  generateNewLink,
  getCandidatesByLot
} from '../../services/candidateService'
import { Link as LinkIcon, Copy, RefreshCw, Users, X } from 'lucide-react'

function InvitationLinkModal({ lot, onClose, onSuccess }) {
  const [invitationLink, setInvitationLink] = useState(null)
  const [candidatesCount, setCandidatesCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadInvitationLink()
    loadCandidatesCount()
  }, [lot.id])

  const loadInvitationLink = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await getInvitationLink(lot.id)
      if (fetchError) throw fetchError
      setInvitationLink(data)
    } catch (err) {
      console.error('Error loading invitation link:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadCandidatesCount = async () => {
    try {
      const { data } = await getCandidatesByLot(lot.id)
      setCandidatesCount(data?.length || 0)
    } catch (err) {
      console.error('Error loading candidates count:', err)
    }
  }

  const handleGenerateNew = async () => {
    if (!confirm('Générer un nouveau lien désactivera l\'ancien. Continuer ?')) return

    setProcessing(true)
    setError(null)

    try {
      const { data, error: generateError } = await generateNewLink(lot.id)
      if (generateError) throw generateError

      setInvitationLink(data)
      setCopied(false)

      if (onSuccess) onSuccess()
    } catch (err) {
      console.error('Error generating new link:', err)
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleCopyLink = () => {
    if (!invitationLink) return

    const fullUrl = `${window.location.origin}/apply/${invitationLink.token}`
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 3000)
  }

  const getFullUrl = () => {
    if (!invitationLink) return ''
    return `${window.location.origin}/apply/${invitationLink.token}`
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <LinkIcon className="w-6 h-6 text-[var(--color-electric-blue)]" />
            <div>
              <h2 className="text-xl font-bold font-display text-[var(--text)]">Lien d'invitation</h2>
              <p className="text-sm text-[var(--text-secondary)]">
                {lot.name} - {lot.properties_new?.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <Alert variant="error" title="Erreur">
              {error}
            </Alert>
          )}

          {loading ? (
            <Loading message="Chargement du lien..." />
          ) : (
            <>
              {/* Statistiques */}
              <div className="bg-[var(--color-electric-blue)]/10 rounded-xl p-4 border border-[var(--color-electric-blue)]/30">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-[var(--color-electric-blue)]" />
                  <div>
                    <p className="text-sm text-[var(--color-electric-blue)] font-medium">
                      {candidatesCount} candidature{candidatesCount !== 1 ? 's' : ''} reçue
                      {candidatesCount !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-[var(--color-electric-blue)]/80">
                      {candidatesCount === 0
                        ? 'Partagez ce lien pour recevoir des candidatures'
                        : 'via ce lien d\'invitation'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lien d'invitation */}
              {invitationLink && (
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Lien d'invitation actif
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={getFullUrl()}
                      readOnly
                      className="flex-1 px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface-elevated)] text-[var(--text)] text-sm"
                    />
                    <Button
                      variant={copied ? 'success' : 'primary'}
                      onClick={handleCopyLink}
                      disabled={processing}
                    >
                      {copied ? (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copié !
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copier
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-2">
                    Créé le {new Date(invitationLink.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-[var(--surface-elevated)] rounded-xl p-4 border border-[var(--border)]">
                <h3 className="text-sm font-medium font-display text-[var(--text)] mb-2">
                  Comment utiliser ce lien ?
                </h3>
                <ul className="text-sm text-[var(--text-secondary)] space-y-1 list-disc list-inside">
                  <li>Partagez ce lien avec vos candidats potentiels</li>
                  <li>Ils pourront remplir le formulaire de candidature en ligne</li>
                  <li>Vous recevrez leurs informations et documents automatiquement</li>
                  <li>Vous pourrez ensuite accepter ou refuser chaque candidature</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleGenerateNew}
                  disabled={processing}
                  className="flex-1"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${processing ? 'animate-spin' : ''}`} />
                  Générer un nouveau lien
                </Button>
                <Button variant="secondary" onClick={onClose} className="flex-1">
                  Fermer
                </Button>
              </div>

              {/* Warning */}
              <Alert variant="warning">
                La génération d'un nouveau lien désactivera l'ancien. Les candidatures déjà
                reçues seront conservées.
              </Alert>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

InvitationLinkModal.propTypes = {
  lot: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    properties_new: PropTypes.shape({
      name: PropTypes.string
    })
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func
}

export default InvitationLinkModal
