/**
 * Composant de sélection/ajout de pièces pour un état des lieux
 */

import { useState } from 'react'
import { Plus, X, GripVertical, Check } from 'lucide-react'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import { ROOM_TYPES } from '../../constants/inventoryConstants'

function RoomSelector({
  rooms = [],
  onAddRoom,
  onRemoveRoom,
  onSelectRoom,
  selectedRoomId,
  readonly = false
}) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedType, setSelectedType] = useState('')
  const [customName, setCustomName] = useState('')

  const handleAddRoom = () => {
    if (!selectedType) return

    const roomType = ROOM_TYPES[selectedType]
    const existingCount = rooms.filter(r => r.room_type === selectedType).length

    // Nom automatique si pas de nom personnalisé
    const defaultName = existingCount > 0
      ? `${roomType.label} ${existingCount + 1}`
      : roomType.label

    onAddRoom({
      room_type: selectedType,
      room_name: customName || defaultName
    })

    setShowAddModal(false)
    setSelectedType('')
    setCustomName('')
  }

  // Grouper les types de pièces par catégorie
  const roomCategories = {
    principal: ['entrance', 'living_room', 'dining_room', 'kitchen'],
    chambres: ['bedroom', 'office'],
    eau: ['bathroom', 'toilet', 'laundry'],
    exterieur: ['balcony', 'terrace', 'garden'],
    annexes: ['garage', 'cellar', 'parking', 'storage', 'other']
  }

  const categoryLabels = {
    principal: 'Pièces principales',
    chambres: 'Chambres',
    eau: 'Pièces d\'eau',
    exterieur: 'Extérieur',
    annexes: 'Annexes'
  }

  return (
    <div className="space-y-2">
      {/* Liste des pièces */}
      <div className="space-y-1">
        {rooms.map((room, index) => {
          const roomType = ROOM_TYPES[room.room_type]
          const isSelected = room.id === selectedRoomId

          return (
            <div
              key={room.id || index}
              className={`
                flex items-center gap-2 p-3 rounded-xl cursor-pointer
                transition-colors duration-150
                ${isSelected
                  ? 'bg-[var(--color-electric-blue)]/10 border-2 border-[var(--color-electric-blue)]'
                  : 'bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-elevated)]'
                }
              `}
              onClick={() => onSelectRoom(room.id)}
            >
              {!readonly && (
                <GripVertical className="w-4 h-4 text-[var(--text-muted)] cursor-grab" />
              )}

              <span className="text-xl">{roomType?.icon || '📦'}</span>

              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${isSelected ? 'text-[var(--color-electric-blue)]' : 'text-[var(--text)]'}`}>
                  {room.room_name || roomType?.label}
                </p>
                {room.items?.length > 0 && (
                  <p className="text-xs text-[var(--text-muted)]">
                    {room.items.length} élément{room.items.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {isSelected && (
                <Check className="w-5 h-5 text-[var(--color-electric-blue)]" />
              )}

              {!readonly && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveRoom(room.id)
                  }}
                  className="p-1 text-[var(--text-muted)] hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  title="Supprimer cette pièce"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Bouton d'ajout */}
      {!readonly && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowAddModal(true)}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une pièce
        </Button>
      )}

      {/* Modal d'ajout */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setSelectedType('')
          setCustomName('')
        }}
        title="Ajouter une pièce"
        size="lg"
      >
        <div className="space-y-4">
          {/* Sélection du type de pièce */}
          <div className="space-y-4">
            {Object.entries(roomCategories).map(([categoryKey, types]) => (
              <div key={categoryKey}>
                <h4 className="text-sm font-medium text-[var(--text-muted)] mb-2">
                  {categoryLabels[categoryKey]}
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {types.map(type => {
                    const roomType = ROOM_TYPES[type]
                    const isSelected = selectedType === type

                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedType(type)}
                        className={`
                          flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all
                          ${isSelected
                            ? 'border-[var(--color-electric-blue)] bg-[var(--color-electric-blue)]/10'
                            : 'border-[var(--border)] hover:border-[var(--color-electric-blue)]/50 hover:bg-[var(--surface-elevated)]'
                          }
                        `}
                      >
                        <span className="text-2xl">{roomType.icon}</span>
                        <span className={`text-xs text-center ${isSelected ? 'text-[var(--color-electric-blue)] font-medium' : 'text-[var(--text-secondary)]'}`}>
                          {roomType.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Nom personnalisé */}
          {selectedType && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Nom personnalisé (optionnel)
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={`Ex: ${ROOM_TYPES[selectedType].label} 1, Chambre parentale...`}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent"
              />
            </div>
          )}

          {/* Boutons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddModal(false)
                setSelectedType('')
                setCustomName('')
              }}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleAddRoom}
              disabled={!selectedType}
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default RoomSelector
