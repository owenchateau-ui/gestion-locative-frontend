/**
 * Formulaire multi-étapes pour créer/modifier un état des lieux
 * Conforme au Décret n°2016-382 du 30 mars 2016
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'
import Skeleton from '../components/ui/Skeleton'
import { useToast } from '../context/ToastContext'
import {
  RoomSelector,
  RoomInspector,
  MeterReadings,
  KeysInventory,
  DualSignature
} from '../components/inventory'
import {
  getInventoryById,
  createInventory,
  updateInventory,
  addRoom,
  updateRoom,
  deleteRoom,
  addItem,
  updateItem,
  deleteItem,
  completeInventory,
  signInventory,
  getEntryInventoryForLease
} from '../services/inventoryService'
import { getAllLeases } from '../services/leaseService'
import { INVENTORY_TYPES, DEFAULT_KEYS } from '../constants/inventoryConstants'
import {
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Save,
  CheckCircle,
  FileSignature,
  Home,
  Gauge,
  Key,
  DoorOpen,
  MessageSquare,
  PenTool,
  AlertTriangle,
  Loader2
} from 'lucide-react'

// Étapes du formulaire
const STEPS = [
  { id: 'general', label: 'Informations', icon: Home },
  { id: 'meters', label: 'Compteurs', icon: Gauge },
  { id: 'keys', label: 'Clés', icon: Key },
  { id: 'rooms', label: 'Pièces', icon: DoorOpen },
  { id: 'observations', label: 'Observations', icon: MessageSquare },
  { id: 'signatures', label: 'Signatures', icon: PenTool }
]

function InventoryForm() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { success, error: showError } = useToast()

  const isEdit = Boolean(id)
  const preselectedLeaseId = searchParams.get('lease')
  const preselectedType = searchParams.get('type')

  // États principaux
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [leases, setLeases] = useState([])
  const [entryInventory, setEntryInventory] = useState(null)

  // Données du formulaire
  const [formData, setFormData] = useState({
    lease_id: preselectedLeaseId || '',
    type: preselectedType || 'entry',
    inventory_date: new Date().toISOString().split('T')[0],
    meter_water_cold: '',
    meter_water_hot: '',
    meter_electricity_hp: '',
    meter_electricity_hc: '',
    meter_gas: '',
    keys_details: DEFAULT_KEYS,
    general_observations: '',
    rooms: [],
    landlord_signature: null,
    tenant_signature: null
  })

  const [errors, setErrors] = useState({})

  // Charger les données initiales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // Charger les baux actifs
        const leasesData = await getAllLeases({ status: 'active' })
        setLeases(leasesData || [])

        // Si édition, charger l'inventaire existant
        if (isEdit) {
          const inventory = await getInventoryById(id)
          if (inventory) {
            setFormData({
              lease_id: inventory.lease_id,
              type: inventory.type,
              inventory_date: inventory.inventory_date,
              meter_water_cold: inventory.meter_water_cold || '',
              meter_water_hot: inventory.meter_water_hot || '',
              meter_electricity_hp: inventory.meter_electricity_hp || '',
              meter_electricity_hc: inventory.meter_electricity_hc || '',
              meter_gas: inventory.meter_gas || '',
              keys_details: inventory.keys_details || DEFAULT_KEYS,
              general_observations: inventory.general_observations || '',
              rooms: inventory.rooms || [],
              landlord_signature: inventory.landlord_signature,
              tenant_signature: inventory.tenant_signature
            })

            // Charger l'EDL d'entrée si c'est une sortie
            if (inventory.type === 'exit' && inventory.entry_inventory_id) {
              const entry = await getInventoryById(inventory.entry_inventory_id)
              setEntryInventory(entry)
            }
          }
        }
      } catch (err) {
        console.error('Erreur chargement données:', err)
        showError('Erreur lors du chargement des données')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, isEdit, showError])

  // Charger l'EDL d'entrée quand on change de bail (pour sortie)
  useEffect(() => {
    const loadEntryInventory = async () => {
      if (formData.type === 'exit' && formData.lease_id) {
        try {
          const entry = await getEntryInventoryForLease(formData.lease_id)
          setEntryInventory(entry)
        } catch (err) {
          console.error('Pas d\'EDL d\'entrée trouvé:', err)
          setEntryInventory(null)
        }
      } else {
        setEntryInventory(null)
      }
    }

    if (!isEdit) {
      loadEntryInventory()
    }
  }, [formData.type, formData.lease_id, isEdit])

  // Mise à jour des champs
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  // Gestion des pièces
  const handleAddRoom = (roomData) => {
    const newRoom = {
      id: `temp_${Date.now()}`,
      ...roomData,
      room_order: formData.rooms.length,
      items: [],
      photos: []
    }
    setFormData(prev => ({
      ...prev,
      rooms: [...prev.rooms, newRoom]
    }))
  }

  const handleUpdateRoom = (roomId, updates) => {
    setFormData(prev => ({
      ...prev,
      rooms: prev.rooms.map(room =>
        room.id === roomId ? { ...room, ...updates } : room
      )
    }))
  }

  const handleDeleteRoom = (roomId) => {
    setFormData(prev => ({
      ...prev,
      rooms: prev.rooms.filter(room => room.id !== roomId)
    }))
  }

  // Gestion des éléments dans une pièce
  const handleAddItem = (roomId, itemData) => {
    const newItem = {
      id: `temp_${Date.now()}`,
      ...itemData
    }
    setFormData(prev => ({
      ...prev,
      rooms: prev.rooms.map(room =>
        room.id === roomId
          ? { ...room, items: [...(room.items || []), newItem] }
          : room
      )
    }))
  }

  const handleUpdateItem = (roomId, itemId, updates) => {
    setFormData(prev => ({
      ...prev,
      rooms: prev.rooms.map(room =>
        room.id === roomId
          ? {
              ...room,
              items: room.items.map(item =>
                item.id === itemId ? { ...item, ...updates } : item
              )
            }
          : room
      )
    }))
  }

  const handleDeleteItem = (roomId, itemId) => {
    setFormData(prev => ({
      ...prev,
      rooms: prev.rooms.map(room =>
        room.id === roomId
          ? { ...room, items: room.items.filter(item => item.id !== itemId) }
          : room
      )
    }))
  }

  // Validation par étape
  const validateStep = (step) => {
    const newErrors = {}

    switch (step) {
      case 0: // Informations générales
        if (!formData.lease_id) {
          newErrors.lease_id = 'Veuillez sélectionner un bail'
        }
        if (!formData.inventory_date) {
          newErrors.inventory_date = 'La date est obligatoire'
        }
        break

      case 1: // Compteurs
        // Validation optionnelle - au moins un relevé recommandé
        break

      case 2: // Clés
        // Validation optionnelle
        break

      case 3: // Pièces
        if (formData.rooms.length === 0) {
          newErrors.rooms = 'Ajoutez au moins une pièce'
        }
        break

      case 5: // Signatures
        // Pour compléter, les signatures sont recommandées mais pas obligatoires
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Navigation entre étapes
  const goToStep = (step) => {
    if (step < currentStep || validateStep(currentStep)) {
      setCurrentStep(step)
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Sauvegarde brouillon
  // Retourne l'ID de l'inventaire sauvegardé (pour utilisation dans handleComplete)
  const saveDraft = async (skipNavigation = false) => {
    if (!validateStep(0)) {
      setCurrentStep(0)
      showError('Veuillez remplir les informations obligatoires')
      return null
    }

    try {
      setSaving(true)

      const inventoryData = {
        lease_id: formData.lease_id,
        type: formData.type,
        inventory_date: formData.inventory_date,
        status: 'draft',
        meter_water_cold: formData.meter_water_cold ? parseInt(formData.meter_water_cold) : null,
        meter_water_hot: formData.meter_water_hot ? parseInt(formData.meter_water_hot) : null,
        meter_electricity_hp: formData.meter_electricity_hp ? parseInt(formData.meter_electricity_hp) : null,
        meter_electricity_hc: formData.meter_electricity_hc ? parseInt(formData.meter_electricity_hc) : null,
        meter_gas: formData.meter_gas ? parseInt(formData.meter_gas) : null,
        keys_details: formData.keys_details,
        general_observations: formData.general_observations
      }

      // Ajouter entry_inventory_id si c'est une sortie
      if (formData.type === 'exit' && entryInventory) {
        inventoryData.entry_inventory_id = entryInventory.id
      }

      let inventoryId = id

      if (isEdit) {
        await updateInventory(id, inventoryData)
      } else {
        const created = await createInventory(inventoryData)
        inventoryId = created.id
      }

      // Sauvegarder les pièces et éléments
      for (const room of formData.rooms) {
        if (room.id.startsWith('temp_')) {
          const roomData = {
            inventory_id: inventoryId,
            room_type: room.room_type,
            room_name: room.room_name,
            room_order: room.room_order,
            observations: room.observations,
            photos: room.photos || []
          }
          const createdRoom = await addRoom(roomData)

          // Sauvegarder les éléments de cette pièce
          for (const item of (room.items || [])) {
            // Extraire uniquement les champs valides pour l'insertion
            const { id, ...itemDataWithoutId } = item
            await addItem({
              room_id: createdRoom.id,
              ...itemDataWithoutId
            })
          }
        } else {
          await updateRoom(room.id, {
            room_name: room.room_name,
            observations: room.observations,
            photos: room.photos
          })

          // Mettre à jour les éléments
          for (const item of (room.items || [])) {
            if (item.id.startsWith('temp_')) {
              // Extraire uniquement les champs valides pour l'insertion
              const { id, ...itemDataWithoutId } = item
              await addItem({
                room_id: room.id,
                ...itemDataWithoutId
              })
            } else {
              // Pour la mise à jour, exclure l'id du payload
              const { id, ...updateData } = item
              await updateItem(item.id, updateData)
            }
          }
        }
      }

      success('Brouillon sauvegardé')

      if (!isEdit && !skipNavigation) {
        navigate(`/inventories/${inventoryId}/edit`)
      }

      return inventoryId
    } catch (err) {
      console.error('Erreur sauvegarde:', err)
      showError(`Erreur lors de la sauvegarde : ${err.message}`)
      return null
    } finally {
      setSaving(false)
    }
  }

  // Finaliser l'état des lieux
  const handleComplete = async () => {
    // Valider toutes les étapes
    for (let i = 0; i < STEPS.length - 1; i++) {
      if (!validateStep(i)) {
        setCurrentStep(i)
        showError('Veuillez compléter toutes les informations requises')
        return
      }
    }

    try {
      setSaving(true)

      // D'abord sauvegarder (skip navigation car on va rediriger après completeInventory)
      const inventoryId = await saveDraft(true)

      if (!inventoryId) {
        showError('Erreur lors de la sauvegarde préalable')
        return
      }

      // Puis marquer comme terminé avec l'ID correct
      await completeInventory(inventoryId)

      success('État des lieux terminé')
      navigate(`/inventories/${inventoryId}`)
    } catch (err) {
      console.error('Erreur finalisation:', err)
      showError(`Erreur lors de la finalisation : ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Signer l'état des lieux
  const handleSign = async (type, signature) => {
    if (type === 'landlord') {
      handleChange('landlord_signature', signature)
    } else {
      handleChange('tenant_signature', signature)
    }
  }

  const handleFinalSign = async () => {
    // Vérification des signatures avec messages explicites
    const missingSignatures = []
    if (!formData.landlord_signature) {
      missingSignatures.push('du bailleur')
    }
    if (!formData.tenant_signature) {
      missingSignatures.push('du locataire')
    }

    if (missingSignatures.length > 0) {
      showError(`Signature(s) manquante(s) : ${missingSignatures.join(' et ')}. Veuillez faire signer les deux parties avant de valider.`)
      return
    }

    // Vérifier que l'inventaire a été sauvegardé
    if (!id && !isEdit) {
      showError('Veuillez d\'abord sauvegarder l\'état des lieux avant de le signer.')
      return
    }

    try {
      setSaving(true)

      const inventoryId = id

      // Signer pour le bailleur
      await signInventory(inventoryId, 'landlord', formData.landlord_signature)

      // Signer pour le locataire
      await signInventory(inventoryId, 'tenant', formData.tenant_signature)

      success('État des lieux signé avec succès ! Les deux parties ont signé le document.')
      navigate(`/inventories/${inventoryId}`)
    } catch (err) {
      console.error('Erreur signature:', err)
      showError(`Erreur lors de la signature : ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Obtenir le bail sélectionné
  const selectedLease = leases.find(l => l.id === formData.lease_id)

  // Rendu du contenu de l'étape courante
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Informations générales
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-display font-medium text-[var(--text)]">
              Informations générales
            </h3>

            {/* Type d'état des lieux */}
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Type d'état des lieux *
              </label>
              <div className="flex gap-4">
                {Object.entries(INVENTORY_TYPES).map(([key, info]) => (
                  <label
                    key={key}
                    className={`
                      flex items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all
                      ${formData.type === key
                        ? 'border-[var(--color-electric-blue)] bg-[var(--color-electric-blue)]/10'
                        : 'border-[var(--border)] hover:border-[var(--color-electric-blue)]/50'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={key}
                      checked={formData.type === key}
                      onChange={(e) => handleChange('type', e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-2xl">{info.icon}</span>
                    <div>
                      <p className="font-medium text-[var(--text)]">{info.label}</p>
                      <p className="text-sm text-[var(--text-muted)]">{info.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Sélection du bail */}
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Bail concerné *
              </label>
              <select
                value={formData.lease_id}
                onChange={(e) => handleChange('lease_id', e.target.value)}
                className={`
                  w-full px-3 py-2 border rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors
                  ${errors.lease_id ? 'border-red-500' : 'border-[var(--border)]'}
                `}
              >
                <option value="">Sélectionner un bail</option>
                {leases.map(lease => {
                  const lot = lease.lot
                  const property = lot?.property
                  const tenant = lease.tenant?.tenant_group?.name ||
                    `${lease.tenant?.first_name || ''} ${lease.tenant?.last_name || ''}`.trim()

                  return (
                    <option key={lease.id} value={lease.id}>
                      {property?.name} - {lot?.name} ({tenant})
                    </option>
                  )
                })}
              </select>
              {errors.lease_id && (
                <p className="mt-1 text-sm text-red-600">{errors.lease_id}</p>
              )}
            </div>

            {/* Affichage du bail sélectionné */}
            {selectedLease && (
              <Card padding={true}>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[var(--color-electric-blue)]/20 rounded-xl">
                    <Home className="w-6 h-6 text-[var(--color-electric-blue)]" />
                  </div>
                  <div>
                    <h4 className="font-display font-medium text-[var(--text)]">
                      {selectedLease.lot?.property?.name} - {selectedLease.lot?.name}
                    </h4>
                    <p className="text-sm text-[var(--text-muted)]">
                      {selectedLease.lot?.property?.address}, {selectedLease.lot?.property?.city}
                    </p>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                      Locataire : {selectedLease.tenant?.tenant_group?.name ||
                        `${selectedLease.tenant?.first_name} ${selectedLease.tenant?.last_name}`}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Alerte si sortie sans entrée */}
            {formData.type === 'exit' && formData.lease_id && !entryInventory && (
              <Alert variant="warning">
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                Aucun état des lieux d'entrée trouvé pour ce bail.
                La comparaison ne sera pas disponible.
              </Alert>
            )}

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Date de l'état des lieux *
              </label>
              <input
                type="date"
                value={formData.inventory_date}
                onChange={(e) => handleChange('inventory_date', e.target.value)}
                className={`
                  w-full px-3 py-2 border rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors
                  ${errors.inventory_date ? 'border-red-500' : 'border-[var(--border)]'}
                `}
              />
              {errors.inventory_date && (
                <p className="mt-1 text-sm text-red-600">{errors.inventory_date}</p>
              )}
            </div>
          </div>
        )

      case 1: // Compteurs
        return (
          <MeterReadings
            values={{
              water_cold: formData.meter_water_cold,
              water_hot: formData.meter_water_hot,
              electricity_hp: formData.meter_electricity_hp,
              electricity_hc: formData.meter_electricity_hc,
              gas: formData.meter_gas
            }}
            onChange={(meters) => {
              handleChange('meter_water_cold', meters.water_cold)
              handleChange('meter_water_hot', meters.water_hot)
              handleChange('meter_electricity_hp', meters.electricity_hp)
              handleChange('meter_electricity_hc', meters.electricity_hc)
              handleChange('meter_gas', meters.gas)
            }}
            entryValues={entryInventory ? {
              water_cold: entryInventory.meter_water_cold,
              water_hot: entryInventory.meter_water_hot,
              electricity_hp: entryInventory.meter_electricity_hp,
              electricity_hc: entryInventory.meter_electricity_hc,
              gas: entryInventory.meter_gas
            } : null}
            isExit={formData.type === 'exit'}
          />
        )

      case 2: // Clés
        return (
          <KeysInventory
            keys={formData.keys_details}
            onChange={(keys) => handleChange('keys_details', keys)}
            entryKeys={entryInventory?.keys_details}
            isExit={formData.type === 'exit'}
          />
        )

      case 3: // Pièces
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-display font-medium text-[var(--text)]">
                Inspection pièce par pièce
              </h3>
              <RoomSelector
                existingRooms={formData.rooms}
                onAddRoom={handleAddRoom}
              />
            </div>

            {errors.rooms && (
              <Alert variant="error">{errors.rooms}</Alert>
            )}

            {formData.rooms.length === 0 ? (
              <Card padding={true}>
                <div className="text-center py-8">
                  <DoorOpen className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                  <h4 className="font-display font-medium text-[var(--text)] mb-2">
                    Aucune pièce ajoutée
                  </h4>
                  <p className="text-[var(--text-muted)] mb-4">
                    Commencez par ajouter les pièces du logement à inspecter.
                  </p>
                  <RoomSelector
                    existingRooms={formData.rooms}
                    onAddRoom={handleAddRoom}
                  />
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {formData.rooms.map((room, index) => {
                  const entryRoom = entryInventory?.rooms?.find(r =>
                    r.room_type === room.room_type && r.room_name === room.room_name
                  )
                  return (
                    <RoomInspector
                      key={room.id}
                      room={room}
                      items={room.items || []}
                      onUpdateRoom={(updates) => handleUpdateRoom(room.id, updates)}
                      onAddItem={(item) => handleAddItem(room.id, item)}
                      onUpdateItem={(itemId, updates) => handleUpdateItem(room.id, itemId, updates)}
                      onRemoveItem={(itemId) => handleDeleteItem(room.id, itemId)}
                      entryItems={entryRoom?.items || []}
                      readonly={false}
                    />
                  )
                })}
              </div>
            )}
          </div>
        )

      case 4: // Observations
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-display font-medium text-[var(--text)]">
              Observations générales
            </h3>

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Observations et remarques
              </label>
              <textarea
                value={formData.general_observations}
                onChange={(e) => handleChange('general_observations', e.target.value)}
                rows={8}
                placeholder="Notez ici toutes les observations générales concernant le logement : état général, remarques particulières, accords entre les parties..."
                className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
              />
            </div>

            {entryInventory?.general_observations && (
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                  Observations de l'entrée (pour référence)
                </label>
                <div className="p-4 bg-[var(--surface-elevated)] rounded-xl text-sm text-[var(--text-secondary)]">
                  {entryInventory.general_observations}
                </div>
              </div>
            )}

            {/* Résumé de l'état des lieux */}
            <Card padding={true}>
              <h4 className="font-display font-medium text-[var(--text)] mb-4">Résumé</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-[var(--surface-elevated)] rounded-xl">
                  <p className="text-2xl font-display font-bold text-[var(--text)]">
                    {formData.rooms.length}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Pièces</p>
                </div>
                <div className="text-center p-3 bg-[var(--surface-elevated)] rounded-xl">
                  <p className="text-2xl font-display font-bold text-[var(--text)]">
                    {formData.rooms.reduce((sum, r) => sum + (r.items?.length || 0), 0)}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Éléments</p>
                </div>
                <div className="text-center p-3 bg-[var(--surface-elevated)] rounded-xl">
                  <p className="text-2xl font-display font-bold text-[var(--text)]">
                    {formData.keys_details.reduce((sum, k) => sum + k.quantity, 0)}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Clés</p>
                </div>
                <div className="text-center p-3 bg-[var(--surface-elevated)] rounded-xl">
                  <p className="text-2xl font-display font-bold text-[var(--text)]">
                    {[formData.meter_water_cold, formData.meter_water_hot,
                      formData.meter_electricity_hp, formData.meter_electricity_hc,
                      formData.meter_gas].filter(Boolean).length}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Compteurs</p>
                </div>
              </div>
            </Card>
          </div>
        )

      case 5: // Signatures
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-display font-medium text-[var(--text)]">
              Signatures des parties
            </h3>

            <Alert variant="info">
              Les deux parties doivent signer l'état des lieux pour qu'il soit valide.
              Une fois signé, le document ne pourra plus être modifié.
            </Alert>

            <DualSignature
              landlordSignature={formData.landlord_signature}
              tenantSignature={formData.tenant_signature}
              onLandlordSign={(sig) => handleSign('landlord', sig)}
              onTenantSign={(sig) => handleSign('tenant', sig)}
              landlordName={selectedLease?.lot?.property?.entity?.name || 'Bailleur'}
              tenantName={
                selectedLease?.tenant?.tenant_group?.name ||
                `${selectedLease?.tenant?.first_name || ''} ${selectedLease?.tenant?.last_name || ''}`.trim() ||
                'Locataire'
              }
            />

            {formData.landlord_signature && formData.tenant_signature && (
              <div className="flex justify-center">
                <Button
                  variant="success"
                  size="lg"
                  onClick={handleFinalSign}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <FileSignature className="w-5 h-5 mr-2" />
                  )}
                  Valider et signer définitivement
                </Button>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <DashboardLayout title={isEdit ? "Modifier l'état des lieux" : "Nouvel état des lieux"}>
        <div className="space-y-4">
          <Skeleton type="card" />
          <Skeleton type="card" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={isEdit ? "Modifier l'état des lieux" : "Nouvel état des lieux"}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* En-tête avec indicateur de progression */}
        <Card padding={true}>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-[var(--color-electric-blue)]" />
            <div>
              <h2 className="text-lg font-display font-semibold text-[var(--text)]">
                État des lieux {INVENTORY_TYPES[formData.type]?.label.toLowerCase()}
              </h2>
              {selectedLease && (
                <p className="text-sm text-[var(--text-muted)]">
                  {selectedLease.lot?.property?.name} - {selectedLease.lot?.name}
                </p>
              )}
            </div>
          </div>

          {/* Indicateur d'étapes */}
          <div className="mt-6">
            <div className="flex justify-between">
              {STEPS.map((step, index) => {
                const Icon = step.icon
                const isActive = index === currentStep
                const isCompleted = index < currentStep

                return (
                  <button
                    key={step.id}
                    onClick={() => goToStep(index)}
                    className={`
                      flex flex-col items-center gap-1 p-2 rounded-xl transition-all
                      ${isActive ? 'text-[var(--color-electric-blue)]' : isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--text-muted)]'}
                      hover:bg-[var(--surface-elevated)]
                    `}
                  >
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${isActive ? 'bg-[var(--color-electric-blue)]/20' : isCompleted ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-[var(--surface-elevated)]'}
                    `}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className="text-xs font-medium hidden sm:block">
                      {step.label}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Barre de progression */}
            <div className="mt-4 h-2 bg-[var(--surface-elevated)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--color-electric-blue)] transition-all duration-300"
                style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Contenu de l'étape */}
        <Card padding={true}>
          {renderStepContent()}
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="secondary"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Précédent
          </Button>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={saveDraft}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Sauvegarder brouillon
            </Button>

            {currentStep === STEPS.length - 1 ? (
              <Button
                variant="primary"
                onClick={handleComplete}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Terminer
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={nextStep}
              >
                Suivant
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Info légale */}
        <Alert variant="info">
          <strong>Conformité légale :</strong> Cet état des lieux est établi conformément
          au Décret n°2016-382 du 30 mars 2016 fixant les modalités d'établissement
          de l'état des lieux.
        </Alert>
      </div>
    </DashboardLayout>
  )
}

export default InventoryForm
