import { useState, useEffect, useMemo } from 'react'
import {
  UserPlus,
  FileText,
  Eye,
  Download,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Archive,
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  Building2,
  Home,
  SlidersHorizontal
} from 'lucide-react'
import Badge from '../ui/Badge'
import Modal from '../ui/Modal'
import Card from '../ui/Card'
import { useToast } from '../../context/ToastContext'
import { supabase } from '../../lib/supabase'
import {
  deleteDocument,
  downloadDocument,
  getDocumentUrl,
  formatFileSize,
  DOCUMENT_CATEGORIES
} from '../../services/documentService'

// Statuts des candidatures
const CANDIDATE_STATUSES = {
  submitted: { label: 'En attente', variant: 'info', icon: Clock },
  reviewing: { label: 'En cours', variant: 'warning', icon: AlertCircle },
  accepted: { label: 'Accepté', variant: 'success', icon: CheckCircle },
  rejected: { label: 'Refusé', variant: 'danger', icon: XCircle },
  archived: { label: 'Archivé', variant: 'default', icon: Archive }
}

/**
 * Vue dédiée aux documents des candidatures
 * Affiche les candidats groupés par lot avec leurs documents
 */
function CandidateDocumentsView({ entityId = null }) {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedCandidates, setExpandedCandidates] = useState(new Set())
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const { success, error: showError } = useToast()

  // États des filtres
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    lotId: 'all'
  })

  useEffect(() => {
    fetchCandidatesWithDocuments()
  }, [entityId])

  const fetchCandidatesWithDocuments = async () => {
    try {
      setLoading(true)

      // Récupérer tous les candidats avec leurs informations
      let query = supabase
        .from('candidates')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone,
          status,
          created_at,
          lot_id,
          lots!inner(
            id,
            name,
            property_id,
            properties_new!inner(
              id,
              name,
              entity_id,
              entities!inner(id, name)
            )
          )
        `)
        .order('created_at', { ascending: false })

      // Filtrer par entité si spécifié
      if (entityId) {
        query = query.eq('lots.properties_new.entity_id', entityId)
      }

      const { data: candidatesData, error: candidatesError } = await query

      if (candidatesError) throw candidatesError

      // Pour chaque candidat, récupérer ses documents
      const candidatesWithDocuments = await Promise.all(
        (candidatesData || []).map(async (candidate) => {
          const { data: documents } = await supabase
            .from('documents')
            .select('*')
            .eq('candidate_id', candidate.id)
            .order('uploaded_at', { ascending: false })

          return {
            ...candidate,
            documents: documents || [],
            documentCount: (documents || []).length
          }
        })
      )

      setCandidates(candidatesWithDocuments)
    } catch (err) {
      console.error('Erreur chargement candidats:', err)
      showError('Erreur lors du chargement des candidatures')
    } finally {
      setLoading(false)
    }
  }

  // Liste des lots uniques pour le filtre
  const uniqueLots = useMemo(() => {
    const lots = new Map()
    candidates.forEach(c => {
      if (c.lots && !lots.has(c.lots.id)) {
        lots.set(c.lots.id, {
          id: c.lots.id,
          name: c.lots.name,
          propertyName: c.lots.properties_new?.name
        })
      }
    })
    return Array.from(lots.values())
  }, [candidates])

  // Filtrage des candidats
  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      // Filtre de recherche textuelle
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const fullName = `${candidate.first_name} ${candidate.last_name}`.toLowerCase()
        const email = (candidate.email || '').toLowerCase()
        const lotName = (candidate.lots?.name || '').toLowerCase()

        if (!fullName.includes(searchLower) &&
            !email.includes(searchLower) &&
            !lotName.includes(searchLower)) {
          return false
        }
      }

      // Filtre par statut
      if (filters.status !== 'all' && candidate.status !== filters.status) {
        return false
      }

      // Filtre par lot
      if (filters.lotId !== 'all' && candidate.lot_id !== filters.lotId) {
        return false
      }

      return true
    })
  }, [candidates, filters])

  // Nombre de filtres actifs
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.search) count++
    if (filters.status !== 'all') count++
    if (filters.lotId !== 'all') count++
    return count
  }, [filters])

  // Statistiques
  const stats = useMemo(() => {
    return {
      total: candidates.length,
      submitted: candidates.filter(c => c.status === 'submitted').length,
      reviewing: candidates.filter(c => c.status === 'reviewing').length,
      accepted: candidates.filter(c => c.status === 'accepted').length,
      rejected: candidates.filter(c => c.status === 'rejected').length,
      totalDocuments: candidates.reduce((sum, c) => sum + c.documentCount, 0)
    }
  }, [candidates])

  const resetFilters = () => {
    setFilters({ search: '', status: 'all', lotId: 'all' })
  }

  const toggleCandidate = (candidateId) => {
    const newExpanded = new Set(expandedCandidates)
    if (newExpanded.has(candidateId)) {
      newExpanded.delete(candidateId)
    } else {
      newExpanded.add(candidateId)
    }
    setExpandedCandidates(newExpanded)
  }

  const expandAll = () => {
    setExpandedCandidates(new Set(filteredCandidates.map(c => c.id)))
  }

  const collapseAll = () => {
    setExpandedCandidates(new Set())
  }

  const handleDelete = async (doc) => {
    if (!window.confirm(`Supprimer le document "${doc.file_name}" ?`)) return

    try {
      const { error } = await deleteDocument(doc.id)
      if (error) throw error

      success('Document supprimé')
      fetchCandidatesWithDocuments()
    } catch (err) {
      showError('Erreur lors de la suppression')
    }
  }

  const handlePreview = (doc) => {
    setSelectedDocument(doc)
    setPreviewModalOpen(true)
  }

  const handleDownload = async (doc) => {
    try {
      const { error } = await downloadDocument(doc.file_path, doc.file_name)
      if (error) throw error
      success('Téléchargement démarré')
    } catch (err) {
      showError('Erreur lors du téléchargement')
    }
  }

  const renderPreview = () => {
    if (!selectedDocument) return null

    const url = getDocumentUrl(selectedDocument.file_path)
    const isImage = selectedDocument.file_type?.startsWith('image/')
    const isPdf = selectedDocument.file_type === 'application/pdf'

    return (
      <div className="space-y-4">
        <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
          <h4 className="font-semibold font-display text-[var(--text)] mb-2">
            {selectedDocument.title || selectedDocument.file_name}
          </h4>
          <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
            <Badge variant="info">{DOCUMENT_CATEGORIES[selectedDocument.category]}</Badge>
            <span>{formatFileSize(selectedDocument.file_size)}</span>
            <span>
              {new Date(selectedDocument.uploaded_at).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>

        <div className="bg-[var(--surface-elevated)] rounded-xl p-4 flex items-center justify-center min-h-[400px]">
          {isImage && (
            <img
              src={url}
              alt={selectedDocument.file_name}
              className="max-w-full max-h-[600px] object-contain rounded-xl"
            />
          )}
          {isPdf && (
            <iframe
              src={url}
              className="w-full h-[600px] rounded-xl"
              title={selectedDocument.file_name}
            />
          )}
          {!isImage && !isPdf && (
            <div className="text-center">
              <FileText className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
              <p className="text-[var(--text-secondary)]">Aperçu non disponible</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-20 bg-[var(--surface-elevated)] rounded-xl"></div>
        <div className="h-32 bg-[var(--surface-elevated)] rounded-xl"></div>
        <div className="h-32 bg-[var(--surface-elevated)] rounded-xl"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border)]">
          <div className="text-2xl font-bold font-display text-[var(--text)]">{stats.total}</div>
          <div className="text-sm text-[var(--text-muted)]">Candidatures</div>
        </div>
        <div className="bg-[var(--color-electric-blue)]/10 rounded-xl p-4 border border-[var(--color-electric-blue)]/30">
          <div className="text-2xl font-bold font-display text-[var(--color-electric-blue)]">{stats.submitted}</div>
          <div className="text-sm text-[var(--color-electric-blue)]">En attente</div>
        </div>
        <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30">
          <div className="text-2xl font-bold font-display text-amber-600 dark:text-amber-400">{stats.reviewing}</div>
          <div className="text-sm text-amber-600 dark:text-amber-400">En cours</div>
        </div>
        <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30">
          <div className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400">{stats.accepted}</div>
          <div className="text-sm text-emerald-600 dark:text-emerald-400">Acceptés</div>
        </div>
        <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
          <div className="text-2xl font-bold font-display text-red-600 dark:text-red-400">{stats.rejected}</div>
          <div className="text-sm text-red-600 dark:text-red-400">Refusés</div>
        </div>
        <div className="bg-[var(--color-purple)]/10 rounded-xl p-4 border border-[var(--color-purple)]/30">
          <div className="text-2xl font-bold font-display text-[var(--color-purple)]">{stats.totalDocuments}</div>
          <div className="text-sm text-[var(--color-purple)]">Documents</div>
        </div>
      </div>

      {/* Barre de filtres */}
      <div className="space-y-3">
        <div className="flex gap-3">
          {/* Recherche */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Rechercher un candidat, email, lot..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent text-sm"
            />
            {filters.search && (
              <button
                onClick={() => setFilters({ ...filters, search: '' })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Bouton filtres */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition-colors ${
              showFilters || activeFiltersCount > 0
                ? 'border-[var(--color-electric-blue)] text-[var(--color-electric-blue)] bg-[var(--color-electric-blue)]/10'
                : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filtres</span>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 bg-[var(--color-electric-blue)] text-white text-xs rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Boutons déplier/replier */}
          <div className="flex gap-1">
            <button
              onClick={expandAll}
              className="px-3 py-2 border border-[var(--border)] rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] text-sm"
              title="Tout déplier"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-2 border border-[var(--border)] rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] text-sm"
              title="Tout replier"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Panneau de filtres */}
        {showFilters && (
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4 border border-[var(--border)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Filtre par statut */}
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Statut
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] text-sm focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent"
                >
                  <option value="all">Tous les statuts</option>
                  {Object.entries(CANDIDATE_STATUSES).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Filtre par lot */}
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Lot
                </label>
                <select
                  value={filters.lotId}
                  onChange={(e) => setFilters({ ...filters, lotId: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] text-sm focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent"
                >
                  <option value="all">Tous les lots</option>
                  {uniqueLots.map(lot => (
                    <option key={lot.id} value={lot.id}>
                      {lot.name} ({lot.propertyName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text)]"
                >
                  <X className="w-4 h-4" />
                  Réinitialiser
                </button>
              </div>
            )}
          </div>
        )}

        {/* Résumé */}
        <div className="text-sm text-[var(--text-secondary)]">
          {filteredCandidates.length} candidature{filteredCandidates.length > 1 ? 's' : ''}
          {filteredCandidates.length !== candidates.length && (
            <span className="text-[var(--text-muted)]"> sur {candidates.length}</span>
          )}
        </div>
      </div>

      {/* Liste des candidats */}
      {filteredCandidates.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-muted)] bg-[var(--surface-elevated)] rounded-xl">
          <UserPlus className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
          <p>{candidates.length === 0 ? 'Aucune candidature' : 'Aucune candidature ne correspond aux filtres'}</p>
          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="mt-2 text-[var(--color-electric-blue)] hover:underline text-sm"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCandidates.map(candidate => {
            const isExpanded = expandedCandidates.has(candidate.id)
            const statusConfig = CANDIDATE_STATUSES[candidate.status] || CANDIDATE_STATUSES.submitted
            const StatusIcon = statusConfig.icon

            return (
              <div
                key={candidate.id}
                className="bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden"
              >
                {/* En-tête du candidat */}
                <button
                  onClick={() => toggleCandidate(candidate.id)}
                  className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[var(--surface-elevated)] transition-colors text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" />
                  )}

                  <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserPlus className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium font-display text-[var(--text)]">
                        {candidate.first_name} {candidate.last_name}
                      </span>
                      <Badge variant={statusConfig.variant} className="flex items-center gap-1">
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[var(--text-muted)] mt-1">
                      {candidate.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {candidate.email}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(candidate.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-1">
                        <Home className="w-3 h-3" />
                        {candidate.lots?.name}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {candidate.lots?.properties_new?.name}
                      </div>
                    </div>
                    <Badge variant="default">
                      {candidate.documentCount} doc{candidate.documentCount > 1 ? 's' : ''}
                    </Badge>
                  </div>
                </button>

                {/* Documents du candidat */}
                {isExpanded && (
                  <div className="border-t border-[var(--border)] bg-[var(--surface-elevated)] p-4">
                    {candidate.documents.length === 0 ? (
                      <p className="text-sm text-[var(--text-muted)] italic text-center py-4">
                        Aucun document téléchargé
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {candidate.documents.map(doc => (
                          <div
                            key={doc.id}
                            className="bg-[var(--surface)] rounded-xl p-3 border border-[var(--border)] flex items-start gap-3 group hover:shadow-sm transition-shadow"
                          >
                            <div className="w-10 h-10 bg-[var(--color-electric-blue)]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-[var(--color-electric-blue)]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-[var(--text)] truncate">
                                {doc.title || doc.file_name}
                              </p>
                              <p className="text-xs text-[var(--text-muted)]">
                                {DOCUMENT_CATEGORIES[doc.category]} • {formatFileSize(doc.file_size)}
                              </p>
                              <p className="text-xs text-[var(--text-muted)]">
                                {new Date(doc.uploaded_at).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handlePreview(doc)}
                                className="p-1.5 text-[var(--color-electric-blue)] hover:bg-[var(--color-electric-blue)]/10 rounded-xl"
                                title="Voir"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDownload(doc)}
                                className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-xl"
                                title="Télécharger"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(doc)}
                                className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-xl"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de prévisualisation */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title="Aperçu du document"
        size="xl"
      >
        {renderPreview()}
      </Modal>
    </div>
  )
}

export default CandidateDocumentsView
