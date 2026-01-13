import { useState, useEffect } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'
import Tabs from '../components/ui/Tabs'
import Loading from '../components/ui/Loading'
import Modal from '../components/ui/Modal'
import FileUpload from '../components/ui/FileUpload'
import { useAuth } from '../context/AuthContext'
import { useEntity } from '../context/EntityContext'
import { useToast } from '../context/ToastContext'
import DocumentTreeView from '../components/documents/DocumentTreeView'
import DocumentListView from '../components/documents/DocumentListView'
import DocumentGalleryView from '../components/documents/DocumentGalleryView'
import CandidateDocumentsView from '../components/documents/CandidateDocumentsView'
import {
  Upload,
  Search,
  FolderTree,
  List,
  Grid,
  File,
  Tag,
  HardDrive,
  X,
  Settings,
  UserPlus
} from 'lucide-react'
import {
  getDocuments,
  uploadDocument,
  getDocumentStats,
  DOCUMENT_CATEGORIES,
  formatFileSize
} from '../services/documentService'
import { STAT_ICON_STYLES } from '../constants/designSystem'

function Documents() {
  // État pour choisir la solution à tester
  const [viewMode, setViewMode] = useState('solution1') // 'solution1' ou 'solution2'

  const [documents, setDocuments] = useState([])
  const [filteredDocuments, setFilteredDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  // Filtres et recherche
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])
  const [allTags, setAllTags] = useState([])

  // Modals
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  // Upload
  const [uploadConfig, setUploadConfig] = useState({
    category: 'other',
    title: '',
    description: '',
    tags: [],
    newTag: ''
  })

  const { user } = useAuth()
  const { selectedEntity, entities } = useEntity()
  const { success, error: showError } = useToast()

  useEffect(() => {
    fetchDocuments()
    fetchStats()
  }, [user, selectedEntity])

  useEffect(() => {
    applyFilters()
  }, [documents, searchQuery, selectedCategory, selectedTags])

  // ===== CHARGEMENT DES DONNÉES =====

  const fetchDocuments = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await getDocuments({
        entityId: selectedEntity
      })

      if (error) throw error

      setDocuments(data || [])

      // Extraire tous les tags uniques
      const uniqueTags = new Set()
      data?.forEach(doc => {
        doc.tags?.forEach(tag => uniqueTags.add(tag))
      })
      setAllTags(Array.from(uniqueTags))
    } catch (err) {
      console.error('Erreur chargement documents:', err)
      showError(`Erreur lors du chargement des documents : ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const { data } = await getDocumentStats(selectedEntity)
      setStats(data)
    } catch (err) {
      console.error('Erreur stats:', err)
    }
  }

  // ===== FILTRES =====

  const applyFilters = () => {
    let filtered = [...documents]

    // Filtre par recherche (nom, titre, description)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(doc =>
        doc.file_name?.toLowerCase().includes(query) ||
        doc.title?.toLowerCase().includes(query) ||
        doc.description?.toLowerCase().includes(query)
      )
    }

    // Filtre par catégorie
    if (selectedCategory) {
      filtered = filtered.filter(doc => doc.category === selectedCategory)
    }

    // Filtre par tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(doc =>
        selectedTags.some(tag => doc.tags?.includes(tag))
      )
    }

    setFilteredDocuments(filtered)
  }

  // ===== UPLOAD =====

  const handleUpload = async (file) => {
    if (!file) {
      showError('Aucun fichier sélectionné')
      return
    }

    if (!selectedEntity && !entities[0]?.id) {
      showError('Veuillez sélectionner une entité')
      return
    }

    const entityId = selectedEntity || entities[0]?.id

    try {
      const { data, error } = await uploadDocument({
        file,
        entityId,
        category: uploadConfig.category,
        title: uploadConfig.title || file.name,
        description: uploadConfig.description,
        tags: uploadConfig.tags
      })

      if (error) throw error

      success('Document uploadé avec succès')
      fetchDocuments()
      fetchStats()
      setUploadModalOpen(false)
      resetUploadConfig()
    } catch (err) {
      console.error('Erreur upload:', err)
      showError(`Erreur lors de l'upload : ${err.message}`)
      throw err
    }
  }

  const resetUploadConfig = () => {
    setUploadConfig({
      category: 'other',
      title: '',
      description: '',
      tags: [],
      newTag: ''
    })
  }

  const handleAddTag = () => {
    if (uploadConfig.newTag && !uploadConfig.tags.includes(uploadConfig.newTag)) {
      setUploadConfig(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag],
        newTag: ''
      }))
    }
  }

  const handleRemoveTag = (tag) => {
    setUploadConfig(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  // ===== RENDER =====

  if (loading) {
    return (
      <DashboardLayout title="Documents">
        <Loading message="Chargement des documents..." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Bibliothèque de documents - Test comparatif">
      <div className="space-y-6">
        {/* Sélecteur de solution */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-semibold text-[var(--text)]">
                  Choisissez la solution à tester
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Comparez les deux approches de navigation dans les documents
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => setUploadModalOpen(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Uploader
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Solution 1 */}
              <button
                onClick={() => setViewMode('solution1')}
                className={`p-6 border-2 rounded-xl text-left transition-all ${
                  viewMode === 'solution1'
                    ? 'border-[var(--color-electric-blue)] bg-[var(--color-electric-blue)]/10 shadow-md'
                    : 'border-[var(--border)] hover:border-[var(--color-electric-blue)]/50 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${
                    viewMode === 'solution1' ? 'bg-[var(--color-electric-blue)]/20' : 'bg-[var(--surface-elevated)]'
                  }`}>
                    <FolderTree className={`w-6 h-6 ${
                      viewMode === 'solution1' ? 'text-[var(--color-electric-blue)]' : 'text-[var(--text-secondary)]'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-display font-semibold text-[var(--text)] mb-1">
                      Solution 1 : Navigation hiérarchique
                    </h4>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Arborescence cliquable inspirée de Google Drive et Dropbox.
                      Navigation par dossiers : Entités → Propriétés → Lots → Documents
                    </p>
                    {viewMode === 'solution1' && (
                      <div className="mt-3 flex items-center gap-2 text-sm font-medium text-[var(--color-electric-blue)]">
                        <Settings className="w-4 h-4" />
                        Actuellement sélectionné
                      </div>
                    )}
                  </div>
                </div>
              </button>

              {/* Solution 2 */}
              <button
                onClick={() => setViewMode('solution2')}
                className={`p-6 border-2 rounded-xl text-left transition-all ${
                  viewMode === 'solution2'
                    ? `border-[#10B981] ${STAT_ICON_STYLES.emerald.container} shadow-md`
                    : 'border-[var(--border)] hover:border-[#10B981]/50 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${
                    viewMode === 'solution2' ? STAT_ICON_STYLES.emerald.container : 'bg-[var(--surface-elevated)]'
                  }`}>
                    <Grid className={`w-6 h-6 ${
                      viewMode === 'solution2' ? STAT_ICON_STYLES.emerald.icon : 'text-[var(--text-secondary)]'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-display font-semibold text-[var(--text)] mb-1">
                      Solution 2 : Vue multi-mode
                    </h4>
                    <p className="text-sm text-[var(--text-secondary)]">
                      3 modes de visualisation au choix : Arborescence, Liste détaillée et Galerie.
                      Filtres avancés et recherche puissante.
                    </p>
                    {viewMode === 'solution2' && (
                      <div className={`mt-3 flex items-center gap-2 text-sm font-medium ${STAT_ICON_STYLES.emerald.icon}`}>
                        <Settings className="w-4 h-4" />
                        Actuellement sélectionné
                      </div>
                    )}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </Card>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[var(--color-electric-blue)]/10 rounded-xl">
                  <File className="w-6 h-6 text-[var(--color-electric-blue)]" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-[var(--text)]">{stats.total}</p>
                  <p className="text-sm text-[var(--text-secondary)]">Documents</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[var(--color-purple)]/10 rounded-xl">
                  <HardDrive className="w-6 h-6 text-[var(--color-purple)]" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-[var(--text)]">{formatFileSize(stats.totalSize)}</p>
                  <p className="text-sm text-[var(--text-secondary)]">Stockage utilisé</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${STAT_ICON_STYLES.emerald.container}`}>
                  <Tag className={`w-6 h-6 ${STAT_ICON_STYLES.emerald.icon}`} />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-[var(--text)]">{allTags.length}</p>
                  <p className="text-sm text-[var(--text-secondary)]">Tags</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Solution 1 : TreeView hiérarchique */}
        {viewMode === 'solution1' && (
          <Card>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-display font-semibold text-[var(--text)] mb-1">
                  Navigation hiérarchique
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Cliquez sur les dossiers pour explorer vos documents de manière hiérarchique
                </p>
              </div>
              <DocumentTreeView entityId={selectedEntity} />
            </div>
          </Card>
        )}

        {/* Solution 2 : Vue multi-mode avec tabs */}
        {viewMode === 'solution2' && (
          <Card>
            {/* Filtres et recherche pour Solution 2 */}
            <div className="space-y-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    placeholder="Rechercher un document..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Filtres par catégorie */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                    !selectedCategory
                      ? 'bg-[var(--color-electric-blue)] text-white'
                      : 'bg-[var(--surface-elevated)] text-[var(--text)] hover:bg-[var(--border)]'
                  }`}
                >
                  Tous
                </button>
                {Object.entries(DOCUMENT_CATEGORIES).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                      selectedCategory === key
                        ? 'bg-[var(--color-electric-blue)] text-white'
                        : 'bg-[var(--surface-elevated)] text-[var(--text)] hover:bg-[var(--border)]'
                    }`}
                  >
                    {label}
                    {stats?.byCategory[key] && (
                      <span className="ml-1.5 opacity-75">({stats.byCategory[key]})</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tags */}
              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border)]">
                  <span className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    Tags :
                  </span>
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        if (selectedTags.includes(tag)) {
                          setSelectedTags(selectedTags.filter(t => t !== tag))
                        } else {
                          setSelectedTags([...selectedTags, tag])
                        }
                      }}
                      className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-[var(--color-electric-blue)] text-white'
                          : 'bg-[var(--surface-elevated)] text-[var(--text)] hover:bg-[var(--border)]'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tabs avec 3 vues */}
            <Tabs
              defaultTab="arborescence"
              tabs={[
                {
                  id: 'arborescence',
                  label: 'Arborescence',
                  icon: <FolderTree className="w-4 h-4" />,
                  content: (
                    <div className="pt-6">
                      <DocumentTreeView entityId={selectedEntity} />
                    </div>
                  )
                },
                {
                  id: 'liste',
                  label: 'Liste',
                  icon: <List className="w-4 h-4" />,
                  badge: filteredDocuments.length.toString(),
                  content: (
                    <div className="pt-6">
                      {filteredDocuments.length === 0 ? (
                        <Alert variant="info">
                          {documents.length === 0
                            ? 'Aucun document. Cliquez sur "Uploader" pour ajouter votre premier document.'
                            : 'Aucun document ne correspond aux filtres sélectionnés.'}
                        </Alert>
                      ) : (
                        <DocumentListView
                          documents={filteredDocuments}
                          onRefresh={fetchDocuments}
                        />
                      )}
                    </div>
                  )
                },
                {
                  id: 'galerie',
                  label: 'Galerie',
                  icon: <Grid className="w-4 h-4" />,
                  badge: filteredDocuments.length.toString(),
                  content: (
                    <div className="pt-6">
                      {filteredDocuments.length === 0 ? (
                        <Alert variant="info">
                          {documents.length === 0
                            ? 'Aucun document. Cliquez sur "Uploader" pour ajouter votre premier document.'
                            : 'Aucun document ne correspond aux filtres sélectionnés.'}
                        </Alert>
                      ) : (
                        <DocumentGalleryView
                          documents={filteredDocuments}
                          onRefresh={fetchDocuments}
                        />
                      )}
                    </div>
                  )
                },
                {
                  id: 'candidatures',
                  label: 'Candidatures',
                  icon: <UserPlus className="w-4 h-4" />,
                  content: (
                    <div className="pt-6">
                      <CandidateDocumentsView entityId={selectedEntity} />
                    </div>
                  )
                }
              ]}
            />
          </Card>
        )}
      </div>

      {/* Modal Upload */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false)
          resetUploadConfig()
        }}
        title="Uploader un document"
        size="lg"
      >
        <div className="space-y-4">
          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1">
              Catégorie
            </label>
            <select
              value={uploadConfig.category}
              onChange={(e) => setUploadConfig(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
            >
              {Object.entries(DOCUMENT_CATEGORIES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1">
              Titre (optionnel)
            </label>
            <input
              type="text"
              value={uploadConfig.title}
              onChange={(e) => setUploadConfig(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Laisser vide pour utiliser le nom du fichier"
              className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1">
              Description (optionnel)
            </label>
            <textarea
              value={uploadConfig.description}
              onChange={(e) => setUploadConfig(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="Ajouter une description..."
              className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={uploadConfig.newTag}
                onChange={(e) => setUploadConfig(prev => ({ ...prev, newTag: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Ajouter un tag..."
                className="flex-1 px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
              />
              <Button variant="secondary" onClick={handleAddTag}>
                Ajouter
              </Button>
            </div>
            {uploadConfig.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {uploadConfig.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-[var(--color-electric-blue)]/10 text-[var(--color-electric-blue)] text-sm rounded-lg flex items-center gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-[var(--color-electric-blue)]/80 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Upload */}
          <FileUpload
            multiple={false}
            onUpload={handleUpload}
            showPreview={true}
          />
        </div>
      </Modal>
    </DashboardLayout>
  )
}

export default Documents
