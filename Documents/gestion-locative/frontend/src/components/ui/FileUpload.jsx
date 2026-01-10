import { useState, useRef } from 'react'
import { Upload, X, File, FileText, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react'
import { validateFile, formatFileSize, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../../services/documentService'
import Button from './Button'

/**
 * Composant d'upload de fichiers avec drag & drop
 *
 * @param {Object} props
 * @param {boolean} props.multiple - Autoriser l'upload multiple
 * @param {Function} props.onUpload - Callback appelé avec les fichiers sélectionnés
 * @param {string[]} props.accept - Types MIME acceptés (optionnel, utilise ALLOWED_FILE_TYPES par défaut)
 * @param {number} props.maxSize - Taille max en octets (optionnel, utilise MAX_FILE_SIZE par défaut)
 * @param {boolean} props.showPreview - Afficher la preview des fichiers
 * @param {string} props.className - Classes CSS additionnelles
 */
function FileUpload({
  multiple = true,
  onUpload,
  accept = Object.keys(ALLOWED_FILE_TYPES).join(','),
  maxSize = MAX_FILE_SIZE,
  showPreview = true,
  className = ''
}) {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState({}) // { fileName: progress }
  const fileInputRef = useRef(null)

  // ===== GESTION DU DRAG & DROP =====

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  // ===== SÉLECTION DE FICHIERS =====

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files)
    handleFiles(files)
  }

  const handleFiles = (files) => {
    const validFiles = []
    const errors = []

    files.forEach(file => {
      const validation = validateFile(file)
      if (validation.valid) {
        validFiles.push({
          file,
          id: `${file.name}-${Date.now()}`,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
          status: 'ready', // ready, uploading, success, error
          error: null
        })
      } else {
        errors.push({ fileName: file.name, errors: validation.errors })
      }
    })

    if (multiple) {
      setSelectedFiles(prev => [...prev, ...validFiles])
    } else {
      setSelectedFiles(validFiles.slice(0, 1))
    }

    // Afficher les erreurs de validation
    if (errors.length > 0) {
      errors.forEach(err => {
        console.error(`Erreur validation ${err.fileName}:`, err.errors)
      })
    }
  }

  // ===== SUPPRESSION DE FICHIER =====

  const removeFile = (fileId) => {
    setSelectedFiles(prev => {
      const file = prev.find(f => f.id === fileId)
      if (file?.preview) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter(f => f.id !== fileId)
    })
  }

  // ===== UPLOAD =====

  const handleUpload = async () => {
    if (!onUpload) return

    setSelectedFiles(prev => prev.map(f => ({ ...f, status: 'uploading' })))

    for (const fileData of selectedFiles) {
      try {
        await onUpload(fileData.file, {
          onProgress: (progress) => {
            setUploadingFiles(prev => ({ ...prev, [fileData.file.name]: progress }))
          }
        })

        setSelectedFiles(prev =>
          prev.map(f => f.id === fileData.id ? { ...f, status: 'success' } : f)
        )
      } catch (error) {
        setSelectedFiles(prev =>
          prev.map(f => f.id === fileData.id ? { ...f, status: 'error', error: error.message } : f)
        )
      }
    }

    // Nettoyer après 2 secondes
    setTimeout(() => {
      setSelectedFiles(prev => prev.filter(f => f.status !== 'success'))
      setUploadingFiles({})
    }, 2000)
  }

  // ===== OBTENIR L'ICÔNE DU FICHIER =====

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-8 h-8 text-[var(--color-electric-blue)]" />
    } else if (file.type === 'application/pdf') {
      return <FileText className="w-8 h-8 text-red-500 dark:text-red-400" />
    } else {
      return <File className="w-8 h-8 text-[var(--text-muted)]" />
    }
  }

  // ===== RENDER =====

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Zone de drop */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragOver
            ? 'border-[var(--color-electric-blue)] bg-[var(--color-electric-blue)]/10'
            : 'border-[var(--border)] hover:border-[var(--text-muted)] hover:bg-[var(--surface-elevated)]'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
        />

        <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragOver ? 'text-[var(--color-electric-blue)]' : 'text-[var(--text-muted)]'}`} />

        <p className="text-lg font-medium font-display text-[var(--text-secondary)] mb-1">
          {isDragOver ? 'Déposez vos fichiers ici' : 'Glissez-déposez vos fichiers'}
        </p>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          ou cliquez pour sélectionner
        </p>

        <p className="text-xs text-[var(--text-muted)]">
          Formats acceptés : PDF, JPEG, PNG, DOCX, XLSX
          <br />
          Taille maximale : {formatFileSize(maxSize)}
        </p>
      </div>

      {/* Preview des fichiers sélectionnés */}
      {showPreview && selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium font-display text-[var(--text)]">
              Fichiers sélectionnés ({selectedFiles.length})
            </h4>
            {selectedFiles.some(f => f.status === 'ready') && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleUpload}
                disabled={selectedFiles.every(f => f.status !== 'ready')}
              >
                Uploader {selectedFiles.filter(f => f.status === 'ready').length} fichier(s)
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {selectedFiles.map(fileData => (
              <div
                key={fileData.id}
                className="flex items-center gap-4 p-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border)]"
              >
                {/* Preview image ou icône */}
                <div className="flex-shrink-0">
                  {fileData.preview ? (
                    <img
                      src={fileData.preview}
                      alt={fileData.file.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    getFileIcon(fileData.file)
                  )}
                </div>

                {/* Infos fichier */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text)] truncate">
                    {fileData.file.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {formatFileSize(fileData.file.size)}
                  </p>

                  {/* Statut */}
                  {fileData.status === 'uploading' && (
                    <div className="mt-2">
                      <div className="w-full bg-[var(--border)] rounded-full h-1.5">
                        <div
                          className="bg-[var(--color-electric-blue)] h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${uploadingFiles[fileData.file.name] || 0}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {fileData.status === 'error' && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                      Erreur : {fileData.error}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex-shrink-0">
                  {fileData.status === 'ready' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile(fileData.id)
                      }}
                      className="text-[var(--text-muted)] hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                  {fileData.status === 'success' && (
                    <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                  )}
                  {fileData.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUpload
