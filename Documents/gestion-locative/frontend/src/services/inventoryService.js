/**
 * Service de gestion des États des lieux
 * Conforme au Décret n°2016-382 du 30 mars 2016
 */

import { supabase } from '../lib/supabase'
import { calculateVetusteRate, calculateTenantShare, VETUSTE_GRID } from '../constants/inventoryConstants'

// =====================================================
// INVENTORIES (États des lieux)
// =====================================================

/**
 * Récupère tous les états des lieux de l'utilisateur
 * @param {object} filters - Filtres optionnels { type, status, leaseId }
 * @returns {Promise<Array>} Liste des états des lieux
 */
export const getAllInventories = async (filters = {}) => {
  try {
    let query = supabase
      .from('inventories')
      .select(`
        *,
        lease:leases(
          id,
          start_date,
          end_date,
          lot:lots(
            id,
            name,
            property:properties_new(
              id,
              name,
              address,
              entity:entities(
                id,
                name
              )
            )
          ),
          tenant:tenants(
            id,
            first_name,
            last_name,
            tenant_group_id
          )
        ),
        entry_inventory:inventories!entry_inventory_id(
          id,
          inventory_date,
          status
        ),
        rooms:inventory_rooms(count)
      `)
      .order('inventory_date', { ascending: false })

    if (filters.type) {
      query = query.eq('type', filters.type)
    }

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.leaseId) {
      query = query.eq('lease_id', filters.leaseId)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erreur getAllInventories:', error)
    throw error
  }
}

/**
 * Récupère un état des lieux par son ID avec toutes les données
 * @param {string} id - ID de l'état des lieux
 * @returns {Promise<object>} État des lieux complet
 */
export const getInventoryById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('inventories')
      .select(`
        *,
        lease:leases(
          id,
          start_date,
          end_date,
          rent_amount,
          charges_amount,
          deposit_amount,
          lot:lots(
            id,
            name,
            surface_area,
            nb_rooms,
            furnished,
            property:properties_new(
              id,
              name,
              address,
              city,
              postal_code,
              entity:entities(
                id,
                name,
                address,
                city,
                postal_code,
                email,
                phone
              )
            )
          ),
          tenant:tenants(
            id,
            first_name,
            last_name,
            email,
            phone,
            tenant_group_id
          )
        ),
        entry_inventory:inventories!entry_inventory_id(
          id,
          inventory_date,
          status,
          meter_water_cold,
          meter_water_hot,
          meter_electricity_hp,
          meter_electricity_hc,
          meter_gas,
          keys_details
        ),
        rooms:inventory_rooms(
          id,
          room_type,
          room_name,
          room_order,
          observations,
          photos,
          items:inventory_items(
            id,
            category,
            element_type,
            element_name,
            material,
            brand,
            color,
            rating,
            condition_notes,
            is_degradation,
            repair_needed,
            estimated_repair_cost,
            photos,
            entry_rating,
            entry_notes,
            installation_date,
            vetuste_rate
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    // Trier les rooms par ordre
    if (data?.rooms) {
      data.rooms.sort((a, b) => a.room_order - b.room_order)
    }

    return data
  } catch (error) {
    console.error('Erreur getInventoryById:', error)
    throw error
  }
}

/**
 * Crée un nouvel état des lieux
 * @param {object} inventoryData - Données de l'état des lieux
 * @returns {Promise<object>} État des lieux créé
 */
export const createInventory = async (inventoryData) => {
  try {
    // Récupérer l'ID utilisateur pour created_by
    const { data: { user } } = await supabase.auth.getUser()
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('supabase_uid', user.id)
      .single()

    const { data, error } = await supabase
      .from('inventories')
      .insert({
        ...inventoryData,
        created_by: userData?.id
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erreur createInventory:', error)
    throw error
  }
}

/**
 * Met à jour un état des lieux
 * @param {string} id - ID de l'état des lieux
 * @param {object} inventoryData - Données à mettre à jour
 * @returns {Promise<object>} État des lieux mis à jour
 */
export const updateInventory = async (id, inventoryData) => {
  try {
    const { data, error } = await supabase
      .from('inventories')
      .update(inventoryData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erreur updateInventory:', error)
    throw error
  }
}

/**
 * Supprime un état des lieux
 * @param {string} id - ID de l'état des lieux
 */
export const deleteInventory = async (id) => {
  try {
    const { error } = await supabase
      .from('inventories')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Erreur deleteInventory:', error)
    throw error
  }
}

/**
 * Marque un état des lieux comme complété
 * @param {string} id - ID de l'état des lieux
 */
export const completeInventory = async (id) => {
  try {
    const { data, error } = await supabase
      .from('inventories')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erreur completeInventory:', error)
    throw error
  }
}

/**
 * Enregistre la signature d'une partie
 * @param {string} id - ID de l'état des lieux
 * @param {string} party - 'landlord' ou 'tenant'
 * @param {string} signature - Signature en Base64
 */
export const signInventory = async (id, party, signature) => {
  try {
    const updates = {}

    if (party === 'landlord') {
      updates.landlord_signature = signature
      updates.landlord_signed_at = new Date().toISOString()
    } else if (party === 'tenant') {
      updates.tenant_signature = signature
      updates.tenant_signed_at = new Date().toISOString()
    }

    // Vérifier si les deux ont signé pour passer en "signed"
    const { data: current } = await supabase
      .from('inventories')
      .select('landlord_signature, tenant_signature')
      .eq('id', id)
      .single()

    const willBeSigned = (
      (party === 'landlord' && current.tenant_signature) ||
      (party === 'tenant' && current.landlord_signature)
    )

    if (willBeSigned) {
      updates.status = 'signed'
    }

    const { data, error } = await supabase
      .from('inventories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erreur signInventory:', error)
    throw error
  }
}

// =====================================================
// INVENTORY ROOMS (Pièces)
// =====================================================

/**
 * Ajoute une pièce à un état des lieux
 * @param {object} roomData - Données de la pièce
 * @returns {Promise<object>} Pièce créée
 */
export const addRoom = async (roomData) => {
  try {
    // Calculer l'ordre automatiquement
    const { data: existingRooms } = await supabase
      .from('inventory_rooms')
      .select('room_order')
      .eq('inventory_id', roomData.inventory_id)
      .order('room_order', { ascending: false })
      .limit(1)

    const nextOrder = existingRooms?.length > 0 ? existingRooms[0].room_order + 1 : 0

    const { data, error } = await supabase
      .from('inventory_rooms')
      .insert({
        ...roomData,
        room_order: roomData.room_order ?? nextOrder
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erreur addRoom:', error)
    throw error
  }
}

/**
 * Met à jour une pièce
 * @param {string} id - ID de la pièce
 * @param {object} roomData - Données à mettre à jour
 * @returns {Promise<object>} Pièce mise à jour
 */
export const updateRoom = async (id, roomData) => {
  try {
    const { data, error } = await supabase
      .from('inventory_rooms')
      .update(roomData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erreur updateRoom:', error)
    throw error
  }
}

/**
 * Supprime une pièce
 * @param {string} id - ID de la pièce
 */
export const deleteRoom = async (id) => {
  try {
    const { error } = await supabase
      .from('inventory_rooms')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Erreur deleteRoom:', error)
    throw error
  }
}

/**
 * Réordonne les pièces
 * @param {string} inventoryId - ID de l'état des lieux
 * @param {Array} roomOrders - Array de {id, room_order}
 */
export const reorderRooms = async (inventoryId, roomOrders) => {
  try {
    const updates = roomOrders.map(({ id, room_order }) =>
      supabase
        .from('inventory_rooms')
        .update({ room_order })
        .eq('id', id)
    )

    await Promise.all(updates)
  } catch (error) {
    console.error('Erreur reorderRooms:', error)
    throw error
  }
}

// =====================================================
// INVENTORY ITEMS (Éléments)
// =====================================================

/**
 * Ajoute un élément à une pièce
 * @param {object} itemData - Données de l'élément
 * @returns {Promise<object>} Élément créé
 */
export const addItem = async (itemData) => {
  try {
    // Extraire uniquement les champs valides pour la table inventory_items
    // Exclure les IDs temporaires et champs non DB
    const {
      id, // Exclure - sera généré par la DB
      ...cleanItemData
    } = itemData

    // Calculer la vétusté si date d'installation fournie
    let vetusteRate = null
    if (cleanItemData.installation_date && cleanItemData.element_type) {
      const installDate = new Date(cleanItemData.installation_date)
      const yearsOfUse = (new Date() - installDate) / (1000 * 60 * 60 * 24 * 365.25)
      vetusteRate = calculateVetusteRate(cleanItemData.element_type, yearsOfUse)
    }

    const { data, error } = await supabase
      .from('inventory_items')
      .insert({
        ...cleanItemData,
        vetuste_rate: vetusteRate
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erreur addItem:', error)
    throw error
  }
}

/**
 * Met à jour un élément
 * @param {string} id - ID de l'élément
 * @param {object} itemData - Données à mettre à jour
 * @returns {Promise<object>} Élément mis à jour
 */
export const updateItem = async (id, itemData) => {
  try {
    // Recalculer la vétusté si nécessaire
    let vetusteRate = itemData.vetuste_rate
    if (itemData.installation_date && itemData.element_type) {
      const installDate = new Date(itemData.installation_date)
      const yearsOfUse = (new Date() - installDate) / (1000 * 60 * 60 * 24 * 365.25)
      vetusteRate = calculateVetusteRate(itemData.element_type, yearsOfUse)
    }

    const { data, error } = await supabase
      .from('inventory_items')
      .update({
        ...itemData,
        vetuste_rate: vetusteRate
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erreur updateItem:', error)
    throw error
  }
}

/**
 * Supprime un élément
 * @param {string} id - ID de l'élément
 */
export const deleteItem = async (id) => {
  try {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Erreur deleteItem:', error)
    throw error
  }
}

/**
 * Ajoute plusieurs éléments en batch
 * @param {Array} items - Liste des éléments à ajouter
 * @returns {Promise<Array>} Éléments créés
 */
export const addItemsBatch = async (items) => {
  try {
    // Calculer la vétusté pour chaque élément et nettoyer les IDs temporaires
    const itemsWithVetuste = items.map(item => {
      // Exclure l'ID temporaire
      const { id, ...cleanItem } = item

      let vetusteRate = null
      if (cleanItem.installation_date && cleanItem.element_type) {
        const installDate = new Date(cleanItem.installation_date)
        const yearsOfUse = (new Date() - installDate) / (1000 * 60 * 60 * 24 * 365.25)
        vetusteRate = calculateVetusteRate(cleanItem.element_type, yearsOfUse)
      }
      return { ...cleanItem, vetuste_rate: vetusteRate }
    })

    const { data, error } = await supabase
      .from('inventory_items')
      .insert(itemsWithVetuste)
      .select()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erreur addItemsBatch:', error)
    throw error
  }
}

// =====================================================
// COMPARAISON ENTRÉE / SORTIE
// =====================================================

/**
 * Récupère l'état des lieux d'entrée pour un bail
 * @param {string} leaseId - ID du bail
 * @returns {Promise<object|null>} État des lieux d'entrée ou null
 */
export const getEntryInventoryForLease = async (leaseId) => {
  try {
    const { data, error } = await supabase
      .from('inventories')
      .select(`
        *,
        rooms:inventory_rooms(
          id,
          room_type,
          room_name,
          items:inventory_items(
            id,
            category,
            element_type,
            element_name,
            rating,
            condition_notes,
            photos
          )
        )
      `)
      .eq('lease_id', leaseId)
      .eq('type', 'entry')
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  } catch (error) {
    console.error('Erreur getEntryInventoryForLease:', error)
    throw error
  }
}

/**
 * Compare deux états des lieux et calcule les différences
 * @param {string} entryInventoryId - ID de l'EDL d'entrée
 * @param {string} exitInventoryId - ID de l'EDL de sortie
 * @returns {Promise<object>} Résultat de la comparaison
 */
export const compareInventories = async (entryInventoryId, exitInventoryId) => {
  try {
    const [entry, exit] = await Promise.all([
      getInventoryById(entryInventoryId),
      getInventoryById(exitInventoryId)
    ])

    if (!entry || !exit) {
      throw new Error('États des lieux introuvables')
    }

    const differences = []
    let totalDeductions = 0

    // Parcourir les pièces de sortie
    for (const exitRoom of exit.rooms || []) {
      const entryRoom = entry.rooms?.find(r =>
        r.room_type === exitRoom.room_type &&
        r.room_name === exitRoom.room_name
      )

      if (!entryRoom) continue

      // Comparer les éléments
      for (const exitItem of exitRoom.items || []) {
        const entryItem = entryRoom.items?.find(i =>
          i.element_type === exitItem.element_type &&
          i.element_name === exitItem.element_name
        )

        if (!entryItem) continue

        const ratingDiff = (entryItem.rating || 3) - (exitItem.rating || 3)

        if (ratingDiff > 0 || exitItem.is_degradation) {
          // Calculer la part locataire
          let tenantShare = 0
          let vetusteRate = exitItem.vetuste_rate || 0

          if (exitItem.estimated_repair_cost && exitItem.element_type) {
            const result = calculateTenantShare(
              exitItem.estimated_repair_cost,
              exitItem.element_type,
              vetusteRate > 0 ? vetusteRate / (100 / VETUSTE_GRID[exitItem.element_type]?.lifespan || 10) : 0
            )
            tenantShare = result.tenantShare
            vetusteRate = result.vetusteRate
          }

          differences.push({
            room: exitRoom.room_name || exitRoom.room_type,
            element: exitItem.element_name,
            elementType: exitItem.element_type,
            entryRating: entryItem.rating,
            exitRating: exitItem.rating,
            ratingDiff,
            isDegradation: exitItem.is_degradation,
            repairCost: exitItem.estimated_repair_cost || 0,
            vetusteRate,
            tenantShare,
            entryNotes: entryItem.condition_notes,
            exitNotes: exitItem.condition_notes,
            entryPhotos: entryItem.photos,
            exitPhotos: exitItem.photos
          })

          totalDeductions += tenantShare
        }
      }
    }

    return {
      entry,
      exit,
      differences,
      totalDeductions: Math.round(totalDeductions * 100) / 100,
      depositAmount: exit.lease?.deposit_amount || 0,
      amountToReturn: Math.max(0, (exit.lease?.deposit_amount || 0) - totalDeductions)
    }
  } catch (error) {
    console.error('Erreur compareInventories:', error)
    throw error
  }
}

/**
 * Calcule et sauvegarde les retenues sur dépôt de garantie
 * @param {string} exitInventoryId - ID de l'EDL de sortie
 * @param {Array} deductions - Liste des retenues
 */
export const saveDepositDeductions = async (exitInventoryId, deductions) => {
  try {
    const total = deductions.reduce((sum, d) => sum + d.amount, 0)

    const { data, error } = await supabase
      .from('inventories')
      .update({
        deposit_deductions: {
          total: Math.round(total * 100) / 100,
          details: deductions,
          calculated_at: new Date().toISOString()
        }
      })
      .eq('id', exitInventoryId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erreur saveDepositDeductions:', error)
    throw error
  }
}

// =====================================================
// PHOTOS
// =====================================================

/**
 * Upload une photo pour un élément ou une pièce
 * @param {File} file - Fichier image
 * @param {string} inventoryId - ID de l'état des lieux
 * @param {string} type - 'room' ou 'item'
 * @param {string} targetId - ID de la room ou de l'item
 * @returns {Promise<string>} URL de la photo
 */
export const uploadInventoryPhoto = async (file, inventoryId, type, targetId) => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${inventoryId}/${type}/${targetId}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('inventory-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('inventory-photos')
      .getPublicUrl(fileName)

    return publicUrl
  } catch (error) {
    console.error('Erreur uploadInventoryPhoto:', error)
    throw error
  }
}

/**
 * Supprime une photo
 * @param {string} photoUrl - URL de la photo
 */
export const deleteInventoryPhoto = async (photoUrl) => {
  try {
    // Extraire le chemin du fichier de l'URL
    const path = photoUrl.split('/inventory-photos/')[1]

    if (path) {
      const { error } = await supabase.storage
        .from('inventory-photos')
        .remove([path])

      if (error) throw error
    }
  } catch (error) {
    console.error('Erreur deleteInventoryPhoto:', error)
    throw error
  }
}

// =====================================================
// STATISTIQUES
// =====================================================

/**
 * Récupère les statistiques des états des lieux
 * @returns {Promise<object>} Statistiques
 */
export const getInventoryStats = async () => {
  try {
    const { data, error } = await supabase
      .from('inventories')
      .select('id, type, status')

    if (error) throw error

    const stats = {
      total: data?.length || 0,
      entry: data?.filter(i => i.type === 'entry').length || 0,
      exit: data?.filter(i => i.type === 'exit').length || 0,
      draft: data?.filter(i => i.status === 'draft').length || 0,
      completed: data?.filter(i => i.status === 'completed').length || 0,
      signed: data?.filter(i => i.status === 'signed').length || 0
    }

    return stats
  } catch (error) {
    console.error('Erreur getInventoryStats:', error)
    throw error
  }
}

// =====================================================
// EXPORTS
// =====================================================

export default {
  // Inventories
  getAllInventories,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
  completeInventory,
  signInventory,

  // Rooms
  addRoom,
  updateRoom,
  deleteRoom,
  reorderRooms,

  // Items
  addItem,
  updateItem,
  deleteItem,
  addItemsBatch,

  // Comparison
  getEntryInventoryForLease,
  compareInventories,
  saveDepositDeductions,

  // Photos
  uploadInventoryPhoto,
  deleteInventoryPhoto,

  // Stats
  getInventoryStats
}
