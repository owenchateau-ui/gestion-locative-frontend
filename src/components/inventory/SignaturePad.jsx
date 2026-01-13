/**
 * Composant de signature électronique
 * Utilisé pour signer les états des lieux
 */

import { useRef, useState, useEffect } from 'react'
import { Eraser, Check, X } from 'lucide-react'
import Button from '../ui/Button'

function SignaturePad({
  value = null,
  onChange,
  label = 'Signature',
  readonly = false,
  height = 150
}) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  // Initialiser le canvas avec la signature existante
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')

    // Définir la taille réelle du canvas
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Style de trait
    ctx.strokeStyle = '#1e3a5f'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Charger la signature existante si présente
    if (value) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height)
        setHasSignature(true)
      }
      img.src = value
    }
  }, [value])

  const getCoordinates = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()

    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      }
    }

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const startDrawing = (e) => {
    if (readonly) return
    e.preventDefault()

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const { x, y } = getCoordinates(e)

    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
    setHasSignature(true)
  }

  const draw = (e) => {
    if (!isDrawing || readonly) return
    e.preventDefault()

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const { x, y } = getCoordinates(e)

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    ctx.clearRect(0, 0, rect.width, rect.height)

    setHasSignature(false)
    onChange(null)
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    if (!canvas || !hasSignature) return

    const dataUrl = canvas.toDataURL('image/png')
    onChange(dataUrl)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {!readonly && hasSignature && (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={clearSignature}
            >
              <Eraser className="w-4 h-4 mr-1" />
              Effacer
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={saveSignature}
            >
              <Check className="w-4 h-4 mr-1" />
              Valider
            </Button>
          </div>
        )}
      </div>

      {/* Canvas de signature */}
      <div
        className={`
          relative border-2 rounded-lg overflow-hidden
          ${readonly ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'}
          ${!readonly && !value ? 'border-dashed' : ''}
        `}
        style={{ height }}
      >
        {/* Signature validée */}
        {value && readonly ? (
          <img
            src={value}
            alt="Signature"
            className="w-full h-full object-contain"
          />
        ) : (
          <canvas
            ref={canvasRef}
            className={`
              w-full h-full touch-none
              ${readonly ? 'cursor-default' : 'cursor-crosshair'}
            `}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        )}

        {/* Placeholder */}
        {!readonly && !hasSignature && !value && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-gray-400 text-sm">
              Signez ici avec votre souris ou votre doigt
            </p>
          </div>
        )}

        {/* Indicateur "signé" */}
        {value && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
            <Check className="w-3 h-3" />
            Signé
          </div>
        )}
      </div>

      {/* Timestamp de signature */}
      {value && (
        <p className="text-xs text-gray-500 text-right">
          Signé le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
        </p>
      )}
    </div>
  )
}

/**
 * Composant pour afficher deux signatures côte à côte (bailleur et locataire)
 */
export function DualSignature({
  landlordSignature,
  tenantSignature,
  onLandlordSign,
  onTenantSign,
  landlordName = 'Bailleur',
  tenantName = 'Locataire',
  readonly = false
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <SignaturePad
          value={landlordSignature}
          onChange={onLandlordSign}
          label={`Signature de ${landlordName}`}
          readonly={readonly || !!landlordSignature}
        />
        {landlordSignature && (
          <p className="text-xs text-emerald-600 flex items-center gap-1">
            <Check className="w-3 h-3" />
            {landlordName} a signé
          </p>
        )}
      </div>

      <div className="space-y-2">
        <SignaturePad
          value={tenantSignature}
          onChange={onTenantSign}
          label={`Signature de ${tenantName}`}
          readonly={readonly || !!tenantSignature}
        />
        {tenantSignature && (
          <p className="text-xs text-emerald-600 flex items-center gap-1">
            <Check className="w-3 h-3" />
            {tenantName} a signé
          </p>
        )}
      </div>
    </div>
  )
}

export default SignaturePad
