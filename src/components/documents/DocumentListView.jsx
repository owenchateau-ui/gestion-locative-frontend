import { useState, useMemo } from 'react'
import {
  FileText,
  Image as ImageIcon,
  File,
  Eye,
  Download,
  Trash2,
  Edit2,
  Search,
  Filter,
  X,
  UserPlus,
  Users,
  Home,
  Calendar,
  SlidersHorizontal
} from 'lucide-react'
import Badge from '../ui/Badge'
import Modal from '../ui/Modal'
import { useToast } from '../../context/ToastContext'
import {
  deleteDocument,
  downloadDocument,
  getDocumentUrl,
  formatFileSize,
  DOCUMENT_CATEGORIES
} from '../../services/documentService'

// Types d'association pour les filtres
const ASSOCIATION_TYPES = {
  all: 'Tous',
  lot: 'Documents du lot',
  tenant: 'Locataires',
  candidate: 'Candidatures'
}

/**
 * Vue Liste améliorée avec filtres avancés
 * Pour Solution 2 - Tab "Liste"
 */
function DocumentListView({ documents, onRefresh }) {
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const { success, error: showError } = useToast()

  // États des filtres
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    associationType: 'all',
    dateFrom: '',
    dateTo: ''
  })

  // Fonction pour déterminer le type d'association d'un document
  const getDocumentAssociationType = (doc) => {
    if (doc.candidate_id) return 'candidate'
    if (doc.tenant_id || doc.tenant_group_id) return 'tenant'
    return 'lot'
  }

  // Filtrage des documents
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      // Filtre de recherche textuelle
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch =
          (doc.title || '').toLowerCase().includes(searchLower) ||
          (doc.file_name || '').toLowerCase().includes(searchLower) ||
          (doc.description || '').toLowerCase().includes(searchLower) ||
          (doc.tags || []).some(tag => tag.toLowerCase().includes(searchLower))
        if (!matchesSearch) return false
      }

      // Filtre par catégorie
      if (filters.category !== 'all' && doc.category !== filters.category) {
        return false
      }

      // Filtre par type d'association
      if (filters.associationType !== 'all') {
        const associationType = getDocumentAssociationType(doc)
        if (associationType !== filters.associationType) return false
      }

      // Filtre par date (depuis)
      if (filters.dateFrom) {
        const docDate = new Date(doc.uploaded_at)
        const fromDate = new Date(filters.dateFrom)
        if (docDate < fromDate) return false
      }

      // Filtre par date (jusqu'à)
      if (filters.dateTo) {
        const docDate = new Date(doc.uploaded_at)
        const toDate = new Date(filters.dateTo)
        toDate.setHours(23, 59, 59, 999) // Fin de journée
        if (docDate > toDate) return false
      }

      return true
    })
  }, [documents, filters])

  // Nombre de filtres actifs
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.search) count++
    if (filters.category !== 'all') count++
    if (filters.associationType !== 'all') count++
    if (filters.dateFrom) count++
    if (filters.dateTo) count++
    return count
  }, [filters])

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      associationType: 'all',
      dateFrom: '',
      dateTo: ''
    })
  }

  // Obtenir l'icône et le label pour le type d'association
  const getAssociationBadge = (doc) => {
    const type = getDocumentAssociationType(doc)
    switch (type) {
      case 'candidate':
        return { icon: <UserPlus className="w-3 h-3" />, label: 'Candidature', variant: 'warning' }
      case 'tenant':
        return { icon: <Users className="w-3 h-3" />, label: 'Locataire', variant: 'info' }
      default:
        return { icon: <Home className="w-3 h-3" />, label: 'Lot', variant: 'default' }
    }
  }

  const handleDelete = async (doc) => {
    if (!window.confirm(`Supprimer le document "${doc.file_name}" ?`)) return

    try {
      const { error } = await deleteDocument(doc.id)
      if (error) throw error

      success('Document supprimé')
      onRefresh()
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

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) {
      return <ImageIcon className="w-5 h-5 text-[var(--color-electric-blue)]" />
    } else if (fileType === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-500 dark:text-red-400" />
    } else {
      return <File className="w-5 h-5 text-[var(--text-muted)]" />
    }
  }

  const getCategoryBadgeVariant = (category) => {
    const variants = {
      bail: 'info',
      edl: 'warning',
      quittance: 'success',
      diagnostic: 'danger',
      default: 'default'
    }
    return variants[category] || variants.default
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
          {selectedDocument.description && (
            <p className="text-sm text-[var(--text-secondary)] mb-3">{selectedDocument.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
            <Badge variant="info">{DOCUMENT_CATEGORIES[selectedDocument.category]}</Badge>
            <span>{formatFileSize(selectedDocument.file_size)}</span>
            <span>
              {new Date(selectedDocument.uploaded_at).toLocaleDateString('fr-FR')}
            </span>
          </div>
          {selectedDocument.tags && selectedDocument.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedDocument.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-[var(--color-electric-blue)]/20 text-[var(--color-electric-blue)] text-xs rounded-xl"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
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

  return (
    <>
      {/* Barre de filtres */}
      <div className="mb-4 space-y-3">
        {/* Ligne de recherche et bouton filtres */}
        <div className="flex gap-3">
          {/* Recherche */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Rechercher un document..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent text-sm"
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

          {/* Bouton filtres avancés */}
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
        </div>

        {/* Panneau de filtres avancés */}
        {showFilters && (
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4 border border-[var(--border)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtre par catégorie */}
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Catégorie
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] text-sm focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent"
                >
                  <option value="all">Toutes les catégories</option>
                  {Object.entries(DOCUMENT_CATEGORIES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Filtre par type d'association */}
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Type de document
                </label>
                <select
                  value={filters.associationType}
                  onChange={(e) => setFilters({ ...filters, associationType: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] text-sm focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent"
                >
                  {Object.entries(ASSOCIATION_TYPES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Date depuis */}
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  Depuis le
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] text-sm focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent"
                />
              </div>

              {/* Date jusqu'à */}
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  Jusqu'au
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] text-sm focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent"
                />
              </div>
            </div>

            {/* Bouton réinitialiser */}
            {activeFiltersCount > 0 && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text)]"
                >
                  <X className="w-4 h-4" />
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </div>
        )}

        {/* Résumé des résultats */}
        <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
          <span>
            {filteredDocuments.length} document{filteredDocuments.length > 1 ? 's' : ''}
            {filteredDocuments.length !== documents.length && (
              <span className="text-[var(--text-muted)]"> sur {documents.length}</span>
            )}
          </span>
          {activeFiltersCount > 0 && (
            <span className="text-[var(--color-electric-blue)]">
              {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Message si aucun document */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-muted)]">
          <FileText className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
          <p>{documents.length === 0 ? 'Aucun document à afficher' : 'Aucun document ne correspond aux filtres'}</p>
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
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--border)]">
          <thead className="bg-[var(--surface-elevated)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Document
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Catégorie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Tags
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Taille
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-[var(--surface)] divide-y divide-[var(--border)]">
            {filteredDocuments.map(doc => (
              <tr key={doc.id} className="hover:bg-[var(--surface-elevated)] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {getFileIcon(doc.file_type)}
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--text)] truncate">
                        {doc.title || doc.file_name}
                      </p>
                      <p className="text-sm text-[var(--text-muted)] truncate">
                        {doc.file_name}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={getCategoryBadgeVariant(doc.category)}>
                    {DOCUMENT_CATEGORIES[doc.category]}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {(() => {
                    const assoc = getAssociationBadge(doc)
                    return (
                      <Badge variant={assoc.variant} className="flex items-center gap-1 w-fit">
                        {assoc.icon}
                        <span>{assoc.label}</span>
                      </Badge>
                    )
                  })()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {doc.tags?.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 bg-[var(--surface-elevated)] text-[var(--text-secondary)] text-xs rounded-xl"
                      >
                        {tag}
                      </span>
                    ))}
                    {doc.tags?.length > 3 && (
                      <span className="px-2 py-0.5 text-[var(--text-muted)] text-xs">
                        +{doc.tags.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-muted)]">
                  {formatFileSize(doc.file_size)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-muted)]">
                  {new Date(doc.uploaded_at).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handlePreview(doc)}
                      className="p-1.5 text-[var(--color-electric-blue)] hover:bg-[var(--color-electric-blue)]/10 rounded-xl transition-colors"
                      title="Voir"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-colors"
                      title="Télécharger"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc)}
                      className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      <Modal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title="Aperçu du document"
        size="xl"
      >
        {renderPreview()}
      </Modal>
    </>
  )
}

export default DocumentListView
