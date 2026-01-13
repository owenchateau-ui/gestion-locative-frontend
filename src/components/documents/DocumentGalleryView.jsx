import { useState } from 'react'
import {
  FileText,
  Image as ImageIcon,
  File,
  Eye,
  Download,
  Trash2,
  Edit2
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

/**
 * Vue Galerie : Cartes de documents avec miniatures
 * Pour Solution 2 - Tab "Galerie"
 */
function DocumentGalleryView({ documents, onRefresh }) {
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const { success, error: showError } = useToast()

  const handleDelete = async (doc, e) => {
    e.stopPropagation()
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

  const handleDownload = async (doc, e) => {
    e.stopPropagation()
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
      return <ImageIcon className="w-12 h-12 text-[var(--color-electric-blue)]" />
    } else if (fileType === 'application/pdf') {
      return <FileText className="w-12 h-12 text-red-500 dark:text-red-400" />
    } else {
      return <File className="w-12 h-12 text-[var(--text-muted)]" />
    }
  }

  const getThumbnail = (doc) => {
    if (doc.file_type?.startsWith('image/')) {
      return (
        <img
          src={getDocumentUrl(doc.file_path)}
          alt={doc.file_name}
          className="w-full h-48 object-cover"
        />
      )
    } else {
      return (
        <div className="w-full h-48 bg-[var(--surface-elevated)] flex items-center justify-center">
          {getFileIcon(doc.file_type)}
        </div>
      )
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
                  className="px-2 py-1 bg-[var(--color-electric-blue)]/10 text-[var(--color-electric-blue)] text-xs rounded-lg font-medium"
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

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--text-muted)]">
        <ImageIcon className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
        <p>Aucun document à afficher</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {documents.map(doc => (
          <div
            key={doc.id}
            onClick={() => handlePreview(doc)}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden hover:shadow-lg hover:border-[var(--color-electric-blue)] transition-all cursor-pointer group"
          >
            {/* Miniature */}
            <div className="relative">
              {getThumbnail(doc)}
              <div className="absolute top-2 right-2">
                <Badge variant="info" className="text-xs">
                  {DOCUMENT_CATEGORIES[doc.category]}
                </Badge>
              </div>
            </div>

            {/* Infos */}
            <div className="p-4">
              <h4 className="font-medium font-display text-[var(--text)] truncate mb-1">
                {doc.title || doc.file_name}
              </h4>
              <p className="text-xs text-[var(--text-muted)] mb-3">
                {formatFileSize(doc.file_size)} •{' '}
                {new Date(doc.uploaded_at).toLocaleDateString('fr-FR')}
              </p>

              {/* Tags */}
              {doc.tags && doc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {doc.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 bg-[var(--surface-elevated)] text-[var(--text-secondary)] text-xs rounded-lg"
                    >
                      {tag}
                    </span>
                  ))}
                  {doc.tags.length > 2 && (
                    <span className="px-2 py-0.5 text-[var(--text-muted)] text-xs">
                      +{doc.tags.length - 2}
                    </span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePreview(doc)
                  }}
                  className="flex-1 px-3 py-1.5 text-xs bg-[var(--color-electric-blue)]/10 text-[var(--color-electric-blue)] hover:bg-[var(--color-electric-blue)]/20 rounded-xl transition-colors font-medium"
                >
                  <Eye className="w-3 h-3 inline mr-1" />
                  Voir
                </button>
                <button
                  onClick={(e) => handleDownload(doc, e)}
                  className="px-2 py-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-xl transition-colors"
                  title="Télécharger"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => handleDelete(doc, e)}
                  className="px-2 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-500/20 rounded-xl transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

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

export default DocumentGalleryView
