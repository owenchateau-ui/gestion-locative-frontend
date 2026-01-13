/**
 * Composant d'inspection d'une pièce
 * Permet d'ajouter et évaluer les éléments d'une pièce
 */

import { useState } from 'react'
import { Plus, Trash2, Camera, ChevronDown, ChevronUp, AlertTriangle, Wrench } from 'lucide-react'
import Button from '../ui/Button'
import Card from '../ui/Card'
import Modal from '../ui/Modal'
import ElementRating from './ElementRating'
import PhotoCapture from './PhotoCapture'
import {
  ROOM_TYPES,
  ELEMENT_CATEGORIES,
  getDefaultElements,
  VETUSTE_GRID
} from '../../constants/inventoryConstants'

function RoomInspector({
  room,
  items = [],
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onUpdateRoom,
  readonly = false,
  entryItems = [] // Pour la comparaison lors d'un EDL de sortie
}) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [expandedItems, setExpandedItems] = useState({})
  const [newItem, setNewItem] = useState({
    category: '',
    element_type: '',
    element_name: '',
    material: '',
    color: '',
    rating: 3,
    condition_notes: '',
    installation_date: '',
    photos: []
  })

  const roomType = ROOM_TYPES[room?.room_type]
  const defaultCategories = getDefaultElements(room?.room_type)

  const toggleExpand = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  const handleAddItem = () => {
    if (!newItem.category || !newItem.element_name) return

    onAddItem({
      ...newItem,
      room_id: room.id
    })

    setShowAddModal(false)
    setNewItem({
      category: '',
      element_type: '',
      element_name: '',
      material: '',
      color: '',
      rating: 3,
      condition_notes: '',
      installation_date: '',
      photos: []
    })
    setSelectedCategory('')
  }

  const handleSelectPreset = (category, element) => {
    setNewItem({
      ...newItem,
      category,
      element_type: element.id,
      element_name: element.label
    })
  }

  // Trouver l'élément d'entrée correspondant pour comparaison
  const findEntryItem = (exitItem) => {
    return entryItems.find(e =>
      e.element_type === exitItem.element_type &&
      e.element_name === exitItem.element_name
    )
  }

  return (
    <div className="space-y-4">
      {/* En-tête de la pièce */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{roomType?.icon || '📦'}</span>
          <div>
            <h3 className="text-lg font-semibold font-display text-[var(--text)]">
              {room?.room_name || roomType?.label}
            </h3>
            <p className="text-sm text-[var(--text-muted)]">
              {items.length} élément{items.length > 1 ? 's' : ''} inspecté{items.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Photos d'ensemble de la pièce */}
      <Card title="Photos d'ensemble" padding={true}>
        <PhotoCapture
          photos={room?.photos || []}
          onPhotosChange={(photos) => onUpdateRoom({ ...room, photos })}
          readonly={readonly}
          maxPhotos={5}
          placeholder="Ajouter des photos d'ensemble de la pièce"
        />
      </Card>

      {/* Observations de la pièce */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
          Observations générales de la pièce
        </label>
        <textarea
          value={room?.observations || ''}
          onChange={(e) => onUpdateRoom({ ...room, observations: e.target.value })}
          disabled={readonly}
          placeholder="Notes générales sur l'état de la pièce..."
          className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent disabled:bg-[var(--surface-elevated)]"
          rows={2}
        />
      </div>

      {/* Liste des éléments */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-[var(--text)]">Éléments inspectés</h4>
          {!readonly && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Ajouter
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 bg-[var(--surface-elevated)] rounded-xl border-2 border-dashed border-[var(--border)]">
            <p className="text-[var(--text-muted)]">Aucun élément inspecté</p>
            {!readonly && (
              <Button
                variant="primary"
                size="sm"
                className="mt-2"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter le premier élément
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const isExpanded = expandedItems[item.id]
              const category = ELEMENT_CATEGORIES[item.category]
              const entryItem = findEntryItem(item)
              const ratingDiff = entryItem ? (entryItem.rating || 3) - (item.rating || 3) : 0

              return (
                <div
                  key={item.id}
                  className={`
                    bg-[var(--surface)] border rounded-xl overflow-hidden
                    ${item.is_degradation ? 'border-red-300 dark:border-red-500/50' : 'border-[var(--border)]'}
                  `}
                >
                  {/* En-tête de l'élément */}
                  <div
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-[var(--surface-elevated)]"
                    onClick={() => toggleExpand(item.id)}
                  >
                    <span className="text-lg">{category?.icon || '📦'}</span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[var(--text)] truncate">
                          {item.element_name}
                        </span>
                        {item.is_degradation && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs">
                            <AlertTriangle className="w-3 h-3" />
                            Dégradation
                          </span>
                        )}
                        {item.repair_needed && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-xs">
                            <Wrench className="w-3 h-3" />
                            Réparation
                          </span>
                        )}
                      </div>
                      {item.material && (
                        <p className="text-xs text-[var(--text-muted)]">{item.material}</p>
                      )}
                    </div>

                    <ElementRating
                      value={item.rating}
                      readonly={true}
                      showLabel={false}
                      size="sm"
                    />

                    {ratingDiff !== 0 && (
                      <span className={`
                        text-sm font-medium px-2 py-0.5 rounded
                        ${ratingDiff > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}
                      `}>
                        {ratingDiff > 0 ? `−${ratingDiff}` : `+${Math.abs(ratingDiff)}`}
                      </span>
                    )}

                    {isExpanded
                      ? <ChevronUp className="w-5 h-5 text-gray-400" />
                      : <ChevronDown className="w-5 h-5 text-gray-400" />
                    }
                  </div>

                  {/* Détails de l'élément (expandable) */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-4">
                      {/* Notation */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          État de l'élément
                        </label>
                        <ElementRating
                          value={item.rating}
                          onChange={(rating) => !readonly && onUpdateItem(item.id, { rating })}
                          readonly={readonly}
                          showLabel={true}
                          showDescription={true}
                        />
                      </div>

                      {/* Comparaison avec entrée */}
                      {entryItem && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-800 mb-1">
                            État à l'entrée
                          </p>
                          <ElementRating
                            value={entryItem.rating}
                            readonly={true}
                            showLabel={true}
                            size="sm"
                          />
                          {entryItem.condition_notes && (
                            <p className="text-xs text-blue-700 mt-1">
                              {entryItem.condition_notes}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Caractéristiques */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Matériau / Type
                          </label>
                          <input
                            type="text"
                            value={item.material || ''}
                            onChange={(e) => !readonly && onUpdateItem(item.id, { material: e.target.value })}
                            disabled={readonly}
                            placeholder="Ex: Chêne, PVC..."
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Couleur
                          </label>
                          <input
                            type="text"
                            value={item.color || ''}
                            onChange={(e) => !readonly && onUpdateItem(item.id, { color: e.target.value })}
                            disabled={readonly}
                            placeholder="Ex: Blanc, Gris..."
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                          />
                        </div>
                      </div>

                      {/* Observations */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Observations détaillées
                        </label>
                        <textarea
                          value={item.condition_notes || ''}
                          onChange={(e) => !readonly && onUpdateItem(item.id, { condition_notes: e.target.value })}
                          disabled={readonly}
                          placeholder="Décrire l'état précis, les défauts éventuels..."
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                          rows={2}
                        />
                      </div>

                      {/* Dégradation et réparation */}
                      <div className="flex flex-wrap gap-4">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.is_degradation || false}
                            onChange={(e) => !readonly && onUpdateItem(item.id, { is_degradation: e.target.checked })}
                            disabled={readonly}
                            className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700">Dégradation (hors usure normale)</span>
                        </label>

                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.repair_needed || false}
                            onChange={(e) => !readonly && onUpdateItem(item.id, { repair_needed: e.target.checked })}
                            disabled={readonly}
                            className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                          />
                          <span className="text-sm text-gray-700">Réparation nécessaire</span>
                        </label>
                      </div>

                      {/* Coût de réparation estimé */}
                      {item.repair_needed && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Coût réparation estimé (€)
                            </label>
                            <input
                              type="number"
                              value={item.estimated_repair_cost || ''}
                              onChange={(e) => !readonly && onUpdateItem(item.id, { estimated_repair_cost: parseFloat(e.target.value) || null })}
                              disabled={readonly}
                              placeholder="0"
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Date d'installation
                            </label>
                            <input
                              type="date"
                              value={item.installation_date || ''}
                              onChange={(e) => !readonly && onUpdateItem(item.id, { installation_date: e.target.value })}
                              disabled={readonly}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                          </div>
                        </div>
                      )}

                      {/* Vétusté */}
                      {item.vetuste_rate > 0 && (
                        <div className="p-3 bg-amber-50 rounded-lg">
                          <p className="text-sm text-amber-800">
                            <strong>Vétusté :</strong> {item.vetuste_rate.toFixed(1)}%
                            {item.estimated_repair_cost && (
                              <span className="ml-2">
                                → Part locataire : {((1 - item.vetuste_rate / 100) * item.estimated_repair_cost).toFixed(2)} €
                              </span>
                            )}
                          </p>
                        </div>
                      )}

                      {/* Photos de l'élément */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">
                          Photos de l'élément
                        </label>
                        <PhotoCapture
                          photos={item.photos || []}
                          onPhotosChange={(photos) => !readonly && onUpdateItem(item.id, { photos })}
                          readonly={readonly}
                          maxPhotos={5}
                          size="sm"
                        />
                      </div>

                      {/* Bouton supprimer */}
                      {!readonly && (
                        <div className="flex justify-end pt-2 border-t">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onRemoveItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal d'ajout d'élément */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setSelectedCategory('')
          setNewItem({
            category: '',
            element_type: '',
            element_name: '',
            material: '',
            color: '',
            rating: 3,
            condition_notes: '',
            installation_date: '',
            photos: []
          })
        }}
        title="Ajouter un élément"
        size="lg"
      >
        <div className="space-y-4">
          {/* Sélection de la catégorie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {Object.entries(ELEMENT_CATEGORIES).map(([key, category]) => {
                const isDefault = defaultCategories.includes(key)
                const isSelected = selectedCategory === key

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedCategory(key)}
                    className={`
                      flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all
                      ${isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : isDefault
                          ? 'border-blue-200 hover:border-blue-300'
                          : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <span className="text-xl">{category.icon}</span>
                    <span className={`text-xs text-center ${isSelected ? 'text-blue-700 font-medium' : 'text-gray-600'}`}>
                      {category.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Éléments prédéfinis */}
          {selectedCategory && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Éléments prédéfinis
              </label>
              <div className="flex flex-wrap gap-2">
                {ELEMENT_CATEGORIES[selectedCategory].elements.map(element => (
                  <button
                    key={element.id}
                    type="button"
                    onClick={() => handleSelectPreset(selectedCategory, element)}
                    className={`
                      px-3 py-1.5 rounded-full text-sm transition-colors
                      ${newItem.element_type === element.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {element.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Nom personnalisé */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'élément *
            </label>
            <input
              type="text"
              value={newItem.element_name}
              onChange={(e) => setNewItem({ ...newItem, element_name: e.target.value })}
              placeholder="Ex: Parquet chêne massif, Peinture blanche mate..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Caractéristiques */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Matériau / Type
              </label>
              <input
                type="text"
                value={newItem.material}
                onChange={(e) => setNewItem({ ...newItem, material: e.target.value })}
                placeholder="Ex: Chêne, PVC..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Couleur
              </label>
              <input
                type="text"
                value={newItem.color}
                onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
                placeholder="Ex: Blanc, Gris anthracite..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Notation initiale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              État actuel
            </label>
            <ElementRating
              value={newItem.rating}
              onChange={(rating) => setNewItem({ ...newItem, rating })}
              showLabel={true}
              showDescription={true}
            />
          </div>

          {/* Observations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observations
            </label>
            <textarea
              value={newItem.condition_notes}
              onChange={(e) => setNewItem({ ...newItem, condition_notes: e.target.value })}
              placeholder="Décrire l'état précis..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddModal(false)
                setSelectedCategory('')
              }}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleAddItem}
              disabled={!newItem.category || !newItem.element_name}
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

export default RoomInspector
