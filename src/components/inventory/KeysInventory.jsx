/**
 * Composant pour l'inventaire des clés et accès
 * Conforme aux mentions obligatoires du Décret 2016-382
 */

import { useState } from 'react'
import { Plus, X, Key } from 'lucide-react'
import Button from '../ui/Button'
import { KEY_TYPES } from '../../constants/inventoryConstants'

function KeysInventory({
  keys = [],
  onChange,
  entryKeys = null, // Pour comparaison lors d'un EDL de sortie
  readonly = false
}) {
  const [showAdd, setShowAdd] = useState(false)
  const [newKey, setNewKey] = useState({
    type: '',
    quantity: 1,
    notes: ''
  })

  const handleAddKey = () => {
    if (!newKey.type) return

    const keyType = KEY_TYPES.find(k => k.id === newKey.type)
    onChange([
      ...keys,
      {
        type: newKey.type,
        label: keyType?.label || newKey.type,
        icon: keyType?.icon || '🔑',
        quantity: newKey.quantity,
        notes: newKey.notes
      }
    ])

    setNewKey({ type: '', quantity: 1, notes: '' })
    setShowAdd(false)
  }

  const handleRemoveKey = (index) => {
    onChange(keys.filter((_, i) => i !== index))
  }

  const handleUpdateQuantity = (index, quantity) => {
    const newKeys = [...keys]
    newKeys[index] = { ...newKeys[index], quantity: parseInt(quantity, 10) || 0 }
    onChange(newKeys)
  }

  const handleUpdateNotes = (index, notes) => {
    const newKeys = [...keys]
    newKeys[index] = { ...newKeys[index], notes }
    onChange(newKeys)
  }

  // Trouver la clé d'entrée correspondante
  const findEntryKey = (key) => {
    return entryKeys?.find(e => e.type === key.type)
  }

  // Calculer les différences
  const getDifference = (currentKey, entryKey) => {
    if (!entryKey) return null
    return (currentKey.quantity || 0) - (entryKey.quantity || 0)
  }

  return (
    <div className="space-y-4">
      {/* Liste des clés */}
      <div className="space-y-2">
        {keys.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Key className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Aucune clé inventoriée</p>
            {!readonly && (
              <Button
                variant="primary"
                size="sm"
                className="mt-2"
                onClick={() => setShowAdd(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter des clés
              </Button>
            )}
          </div>
        ) : (
          keys.map((key, index) => {
            const entryKey = findEntryKey(key)
            const diff = getDifference(key, entryKey)

            return (
              <div
                key={index}
                className={`
                  flex items-center gap-3 p-3 bg-white border rounded-lg
                  ${diff !== null && diff !== 0 ? 'border-amber-300' : 'border-gray-200'}
                `}
              >
                <span className="text-2xl">{key.icon || '🔑'}</span>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{key.label || key.type}</p>
                  {key.notes && (
                    <p className="text-xs text-gray-500 truncate">{key.notes}</p>
                  )}
                </div>

                {/* Comparaison entrée */}
                {entryKey && (
                  <div className="text-sm text-gray-500 text-right">
                    <span className="text-xs">Entrée: {entryKey.quantity}</span>
                  </div>
                )}

                {/* Quantité */}
                <div className="flex items-center gap-2">
                  {readonly ? (
                    <span className="text-lg font-semibold text-gray-900 w-10 text-center">
                      {key.quantity}
                    </span>
                  ) : (
                    <input
                      type="number"
                      min="0"
                      value={key.quantity}
                      onChange={(e) => handleUpdateQuantity(index, e.target.value)}
                      className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    />
                  )}
                </div>

                {/* Indicateur de différence */}
                {diff !== null && diff !== 0 && (
                  <span className={`
                    text-sm font-medium px-2 py-0.5 rounded
                    ${diff < 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}
                  `}>
                    {diff > 0 ? `+${diff}` : diff}
                  </span>
                )}

                {/* Bouton supprimer */}
                {!readonly && (
                  <button
                    type="button"
                    onClick={() => handleRemoveKey(index)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Supprimer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Formulaire d'ajout */}
      {!readonly && keys.length > 0 && !showAdd && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowAdd(true)}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une clé
        </Button>
      )}

      {showAdd && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <h4 className="font-medium text-gray-900">Ajouter une clé</h4>

          {/* Type de clé */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de clé *
            </label>
            <div className="flex flex-wrap gap-2">
              {KEY_TYPES.map(keyType => (
                <button
                  key={keyType.id}
                  type="button"
                  onClick={() => setNewKey({ ...newKey, type: keyType.id })}
                  className={`
                    inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors
                    ${newKey.type === keyType.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <span>{keyType.icon}</span>
                  {keyType.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quantité */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantité *
              </label>
              <input
                type="number"
                min="1"
                value={newKey.quantity}
                onChange={(e) => setNewKey({ ...newKey, quantity: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <input
                type="text"
                value={newKey.notes}
                onChange={(e) => setNewKey({ ...newKey, notes: e.target.value })}
                placeholder="Ex: Clé principale, double..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setShowAdd(false)
                setNewKey({ type: '', quantity: 1, notes: '' })
              }}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddKey}
              disabled={!newKey.type}
            >
              <Plus className="w-4 h-4 mr-1" />
              Ajouter
            </Button>
          </div>
        </div>
      )}

      {/* Note explicative */}
      <p className="text-xs text-gray-500 italic">
        Le détail et la destination des clés ou de tout autre moyen d'accès sont obligatoires
        selon le Décret n°2016-382 du 30 mars 2016.
      </p>
    </div>
  )
}

export default KeysInventory
