/**
 * Composant de capture et gestion de photos
 * Utilisé dans les états des lieux pour documenter l'état des éléments
 */

import { useState, useRef } from 'react'
import { Camera, Upload, X, ZoomIn, Download, Loader2 } from 'lucide-react'
import Button from '../ui/Button'
import Modal from '../ui/Modal'

function PhotoCapture({
  photos = [],
  onPhotosChange,
  readonly = false,
  maxPhotos = 10,
  size = 'md',
  placeholder = 'Ajouter des photos'
}) {
  const [uploading, setUploading] = useState(false)
  const [previewPhoto, setPreviewPhoto] = useState(null)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  }

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const remainingSlots = maxPhotos - photos.length
    const filesToProcess = files.slice(0, remainingSlots)

    setUploading(true)

    try {
      const newPhotos = await Promise.all(
        filesToProcess.map(async (file) => {
          // Valider le type de fichier
          if (!file.type.startsWith('image/')) {
            console.warn('Fichier ignoré (non image):', file.name)
            return null
          }

          // Valider la taille (max 10 Mo)
          if (file.size > 10 * 1024 * 1024) {
            console.warn('Fichier trop volumineux:', file.name)
            return null
          }

          // Convertir en base64 pour preview locale
          // En production, on utiliserait uploadInventoryPhoto du service
          const base64 = await fileToBase64(file)

          return {
            url: base64,
            caption: '',
            taken_at: new Date().toISOString(),
            filename: file.name
          }
        })
      )

      const validPhotos = newPhotos.filter(p => p !== null)
      onPhotosChange([...photos, ...validPhotos])
    } catch (error) {
      console.error('Erreur upload photos:', error)
    } finally {
      setUploading(false)
      // Reset les inputs
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (cameraInputRef.current) cameraInputRef.current.value = ''
    }
  }

  const handleRemovePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    onPhotosChange(newPhotos)
  }

  const handleUpdateCaption = (index, caption) => {
    const newPhotos = [...photos]
    newPhotos[index] = { ...newPhotos[index], caption }
    onPhotosChange(newPhotos)
  }

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const canAddMore = photos.length < maxPhotos

  return (
    <div className="space-y-3">
      {/* Grille de photos */}
      <div className="flex flex-wrap gap-2">
        {photos.map((photo, index) => (
          <div
            key={index}
            className={`
              relative ${sizeClasses[size]} rounded-lg overflow-hidden
              border-2 border-gray-200 bg-gray-100 group
            `}
          >
            <img
              src={photo.url}
              alt={photo.caption || `Photo ${index + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Overlay avec actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
              <button
                type="button"
                onClick={() => setPreviewPhoto(photo)}
                className="p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors"
                title="Agrandir"
              >
                <ZoomIn className="w-4 h-4 text-gray-700" />
              </button>

              {!readonly && (
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  className="p-1.5 bg-red-500/90 rounded-full hover:bg-red-600 transition-colors"
                  title="Supprimer"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              )}
            </div>

            {/* Légende */}
            {photo.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5">
                <p className="text-white text-xs truncate">{photo.caption}</p>
              </div>
            )}
          </div>
        ))}

        {/* Bouton d'ajout */}
        {!readonly && canAddMore && (
          <div
            className={`
              ${sizeClasses[size]} rounded-lg border-2 border-dashed border-gray-300
              flex flex-col items-center justify-center gap-1
              hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer
              ${uploading ? 'opacity-50 cursor-wait' : ''}
            `}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            ) : (
              <>
                <Camera className="w-5 h-5 text-gray-400" />
                <span className="text-xs text-gray-500">Photo</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Message si aucune photo */}
      {photos.length === 0 && readonly && (
        <p className="text-sm text-gray-500 italic">Aucune photo</p>
      )}

      {/* Boutons d'ajout */}
      {!readonly && canAddMore && (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="w-4 h-4 mr-1" />
            Depuis fichiers
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => cameraInputRef.current?.click()}
            disabled={uploading}
          >
            <Camera className="w-4 h-4 mr-1" />
            Prendre une photo
          </Button>

          <span className="text-xs text-gray-500 self-center ml-auto">
            {photos.length}/{maxPhotos}
          </span>
        </div>
      )}

      {/* Inputs cachés */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Modal de preview */}
      <Modal
        isOpen={!!previewPhoto}
        onClose={() => setPreviewPhoto(null)}
        title="Photo"
        size="xl"
      >
        {previewPhoto && (
          <div className="space-y-4">
            <img
              src={previewPhoto.url}
              alt={previewPhoto.caption || 'Photo'}
              className="w-full max-h-[70vh] object-contain rounded-lg"
            />

            {/* Légende éditable */}
            {!readonly && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Légende
                </label>
                <input
                  type="text"
                  value={previewPhoto.caption || ''}
                  onChange={(e) => {
                    const index = photos.findIndex(p => p.url === previewPhoto.url)
                    if (index !== -1) {
                      handleUpdateCaption(index, e.target.value)
                      setPreviewPhoto({ ...previewPhoto, caption: e.target.value })
                    }
                  }}
                  placeholder="Ajouter une description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Informations */}
            <div className="text-sm text-gray-500">
              {previewPhoto.taken_at && (
                <p>Prise le : {new Date(previewPhoto.taken_at).toLocaleString('fr-FR')}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = previewPhoto.url
                  link.download = previewPhoto.filename || 'photo.jpg'
                  link.click()
                }}
              >
                <Download className="w-4 h-4 mr-1" />
                Télécharger
              </Button>

              <Button
                variant="secondary"
                onClick={() => setPreviewPhoto(null)}
              >
                Fermer
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default PhotoCapture
