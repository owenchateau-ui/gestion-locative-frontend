import { useState, useEffect } from 'react'
import { Upload, FileText, Eye, Trash2, Download, X } from 'lucide-react'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import Modal from '../ui/Modal'
import FileUpload from '../ui/FileUpload'
import { useToast } from '../../context/ToastContext'
import {
  getDocuments,
  uploadDocument,
  deleteDocument,
  getDocumentUrl,
  formatFileSize,
  DOCUMENT_CATEGORIES
} from '../../services/documentService'

/**
 * Composant réutilisable pour afficher et gérer les documents
 * Peut être filtré par entity, property, lot, lease, tenant ou candidate
 */
function DocumentList({
  entityId = null,
  propertyId = null,
  lotId = null,
  leaseId = null,
  tenantId = null,
  tenantGroupId = null,
  candidateId = null,
  title = 'Documents',
  showUpload = true,
  compact = false,
  limit = null
}) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [uploading, setUploading] = useState(false)
  const { success, error } = useToast()

  // État upload
  const [uploadData, setUploadData] = useState({
    category: 'other',
    title: '',
    description: '',
    tags: []
  })
  const [selectedFiles, setSelectedFiles] = useState([])

  useEffect(() => {
    fetchDocuments()
  }, [entityId, propertyId, lotId, leaseId, tenantId, tenantGroupId, candidateId])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const filters = {}
      if (entityId) filters.entityId = entityId
      if (propertyId) filters.propertyId = propertyId
      if (lotId) filters.lotId = lotId
      if (leaseId) filters.leaseId = leaseId
      if (tenantId) filters.tenantId = tenantId
      if (tenantGroupId) filters.tenantGroupId = tenantGroupId
      if (candidateId) filters.candidateId = candidateId

      const { data, error: fetchError } = await getDocuments(filters)

      if (fetchError) {
        throw fetchError
      }

      setDocuments(limit && data ? data.slice(0, limit) : (data || []))
    } catch (err) {
      console.error('Erreur chargement documents:', err)
      error('Erreur lors du chargement des documents')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (file) => {
    if (!file) {
      error('Aucun fichier sélectionné')
      return
    }

    try {
      setUploading(true)

      const payload = {
        file,
        entityId,
        propertyId,
        lotId,
        leaseId,
        tenantId,
        tenantGroupId,
        candidateId,
        category: uploadData.category,
        title: uploadData.title || file.name,
        description: uploadData.description,
        tags: uploadData.tags
      }

      const { error: uploadError } = await uploadDocument(payload)

      if (uploadError) {
        throw uploadError
      }

      success('Document uploadé avec succès')
      setIsUploadModalOpen(false)
      resetUploadForm()
      fetchDocuments()
    } catch (err) {
      console.error('Erreur upload:', err)
      error(err.message || 'Erreur lors de l\'upload du document')
      throw err // Re-throw pour que FileUpload affiche l'erreur
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (doc) => {
    if (!window.confirm(`Supprimer le document "${doc.file_name}" ?`)) return

    try {
      const { error: deleteError } = await deleteDocument(doc.id)

      if (deleteError) {
        throw deleteError
      }

      success('Document supprimé')
      fetchDocuments()
    } catch (err) {
      console.error('Erreur suppression:', err)
      error('Erreur lors de la suppression')
    }
  }

  const handlePreview = (doc) => {
    setSelectedDocument(doc)
    setIsPreviewModalOpen(true)
  }

  const handleDownload = (doc) => {
    const url = getDocumentUrl(doc.file_path)
    window.open(url, '_blank')
  }

  const resetUploadForm = () => {
    setUploadData({
      category: 'other',
      title: '',
      description: '',
      tags: []
    })
    setSelectedFiles([])
  }

  const addTag = (tag) => {
    if (tag && !uploadData.tags.includes(tag)) {
      setUploadData({ ...uploadData, tags: [...uploadData.tags, tag] })
    }
  }

  const removeTag = (tagToRemove) => {
    setUploadData({
      ...uploadData,
      tags: uploadData.tags.filter(t => t !== tagToRemove)
    })
  }

  const renderPreview = () => {
    if (!selectedDocument) return null

    const url = getDocumentUrl(selectedDocument.file_path)
    const isImage = selectedDocument.file_type?.startsWith('image/')
    const isPdf = selectedDocument.file_type === 'application/pdf'

    return (
      <div className="space-y-4">
        {/* Infos document */}
        <div className="bg-[var(--surface-elevated)] rounded-xl p-4 space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold font-display text-[var(--text)]">
                {selectedDocument.title || selectedDocument.file_name}
              </h4>
              {selectedDocument.description && (
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  {selectedDocument.description}
                </p>
              )}
            </div>
            <Badge variant="info">
              {DOCUMENT_CATEGORIES[selectedDocument.category]}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
            <span>{formatFileSize(selectedDocument.file_size)}</span>
            <span>•</span>
            <span>
              {new Date(selectedDocument.uploaded_at).toLocaleDateString('fr-FR')}
            </span>
          </div>

          {selectedDocument.tags && selectedDocument.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {selectedDocument.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-[var(--color-electric-blue)]/10 text-[var(--color-electric-blue)] text-xs rounded-lg font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Preview */}
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
              <p className="text-[var(--text-secondary)] mb-4">
                Aperçu non disponible pour ce type de fichier
              </p>
              <Button onClick={() => handleDownload(selectedDocument)}>
                <Download className="w-4 h-4 mr-2" />
                Télécharger
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold font-display text-[var(--text)]">{title}</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-[var(--surface-elevated)] rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold font-display text-[var(--text)]">{title}</h3>
          {showUpload && (
            <Button size="sm" onClick={() => setIsUploadModalOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          )}
        </div>

        {documents.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] italic">Aucun document</p>
        ) : (
          <div className="space-y-2">
            {documents.map(doc => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-[var(--surface-elevated)] rounded-xl hover:bg-[var(--surface-elevated)]/80 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text)] truncate">
                      {doc.title || doc.file_name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {DOCUMENT_CATEGORIES[doc.category]} • {formatFileSize(doc.file_size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handlePreview(doc)}
                    className="p-1 text-[var(--text-muted)] hover:text-[var(--color-electric-blue)] transition-colors"
                    title="Voir"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc)}
                    className="p-1 text-[var(--text-muted)] hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modales */}
        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          uploadData={uploadData}
          setUploadData={setUploadData}
          handleUpload={handleUpload}
          uploading={uploading}
          addTag={addTag}
          removeTag={removeTag}
        />

        <Modal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          title="Aperçu du document"
          size="xl"
        >
          {renderPreview()}
        </Modal>
      </div>
    )
  }

  // Mode normal (non compact)
  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold font-display text-[var(--text)]">{title}</h3>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {documents.length} document{documents.length > 1 ? 's' : ''}
          </p>
        </div>
        {showUpload && (
          <Button onClick={() => setIsUploadModalOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Uploader un document
          </Button>
        )}
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12 bg-[var(--surface-elevated)] rounded-xl">
          <FileText className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)] mb-4">Aucun document pour le moment</p>
          {showUpload && (
            <Button variant="secondary" onClick={() => setIsUploadModalOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Ajouter le premier document
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map(doc => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 border border-[var(--border)] rounded-xl hover:border-[var(--color-electric-blue)] hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <FileText className="w-8 h-8 text-[var(--text-muted)] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium font-display text-[var(--text)] truncate">
                    {doc.title || doc.file_name}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-sm text-[var(--text-muted)]">
                    <Badge variant="info" className="text-xs">
                      {DOCUMENT_CATEGORIES[doc.category]}
                    </Badge>
                    <span>{formatFileSize(doc.file_size)}</span>
                    <span>•</span>
                    <span>
                      {new Date(doc.uploaded_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {doc.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-[var(--surface-elevated)] text-[var(--text-secondary)] text-xs rounded-lg"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <button
                  onClick={() => handlePreview(doc)}
                  className="p-2 text-[var(--text-muted)] hover:text-[var(--color-electric-blue)] hover:bg-[var(--color-electric-blue)]/10 rounded-xl transition-colors"
                  title="Voir"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDownload(doc)}
                  className="p-2 text-[var(--text-muted)] hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-colors"
                  title="Télécharger"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(doc)}
                  className="p-2 text-[var(--text-muted)] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modales */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        uploadData={uploadData}
        setUploadData={setUploadData}
        handleUpload={handleUpload}
        uploading={uploading}
        addTag={addTag}
        removeTag={removeTag}
      />

      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title="Aperçu du document"
        size="xl"
      >
        {renderPreview()}
      </Modal>
    </div>
  )
}

// Composant Modal Upload séparé pour plus de clarté
function UploadModal({
  isOpen,
  onClose,
  uploadData,
  setUploadData,
  handleUpload,
  uploading,
  addTag,
  removeTag
}) {
  const [tagInput, setTagInput] = useState('')

  const handleAddTag = () => {
    if (tagInput.trim()) {
      addTag(tagInput.trim())
      setTagInput('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Uploader un document"
      size="lg"
    >
      <div className="space-y-6">
        {/* Catégorie */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Catégorie *
          </label>
          <select
            value={uploadData.category}
            onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)]"
          >
            {Object.entries(DOCUMENT_CATEGORIES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Titre */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Titre (optionnel)
          </label>
          <input
            type="text"
            value={uploadData.title}
            onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
            placeholder="Ex: Bail signé 2024"
            className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)]"
          />
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Si vide, le nom du fichier sera utilisé
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Description (optionnel)
          </label>
          <textarea
            value={uploadData.description}
            onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
            placeholder="Notes ou description du document..."
            rows={3}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)]"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Tags (optionnel)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ajouter un tag..."
              className="flex-1 px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)]"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddTag}
              disabled={!tagInput.trim()}
            >
              Ajouter
            </Button>
          </div>
          {uploadData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {uploadData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--color-electric-blue)]/10 text-[var(--color-electric-blue)] text-sm rounded-full font-medium"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-[var(--color-electric-blue)]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Upload */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Fichier *
          </label>
          <FileUpload
            multiple={false}
            onUpload={handleUpload}
            showPreview={true}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={uploading}
          >
            Annuler
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default DocumentList
