import { supabase } from '../lib/supabase'

/**
 * Service pour la gestion des propriétés
 */

/**
 * Récupère toutes les propriétés d'un utilisateur
 */
export const fetchProperties = async (userId, entityId = null) => {
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('supabase_uid', userId)
    .limit(1)

  if (userError) throw userError
  if (!userData || userData.length === 0) {
    throw new Error('Utilisateur non trouvé')
  }

  let query = supabase
    .from('properties_new')
    .select('*, entities!inner(id, name, user_id)')
    .eq('entities.user_id', userData[0].id)
    .order('name')

  if (entityId) {
    query = query.eq('entity_id', entityId)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Récupère une propriété par son ID
 */
export const fetchPropertyById = async (propertyId) => {
  const { data, error } = await supabase
    .from('properties_new')
    .select('*, entities(id, name)')
    .eq('id', propertyId)
    .limit(1)

  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error('Propriété non trouvée')
  }

  return data[0]
}

/**
 * Crée une nouvelle propriété
 */
export const createProperty = async (propertyData) => {
  const { data, error } = await supabase
    .from('properties_new')
    .insert([propertyData])
    .select()
    .limit(1)

  if (error) throw error
  return data[0]
}

/**
 * Met à jour une propriété
 */
export const updateProperty = async (propertyId, propertyData) => {
  const { data, error } = await supabase
    .from('properties_new')
    .update(propertyData)
    .eq('id', propertyId)
    .select()
    .limit(1)

  if (error) throw error
  return data[0]
}

/**
 * Supprime une propriété
 */
export const deleteProperty = async (propertyId) => {
  const { error } = await supabase
    .from('properties_new')
    .delete()
    .eq('id', propertyId)

  if (error) throw error
}

/**
 * Récupère les lots d'une propriété
 */
export const fetchPropertyLots = async (propertyId) => {
  const { data, error } = await supabase
    .from('lots')
    .select('*')
    .eq('property_id', propertyId)
    .order('name')

  if (error) throw error
  return data || []
}

/**
 * Récupère les statistiques d'une propriété
 */
export const fetchPropertyStats = async (propertyId) => {
  // Nombre total de lots
  const { data: lots, error: lotsError } = await supabase
    .from('lots')
    .select('id, status', { count: 'exact' })
    .eq('property_id', propertyId)

  if (lotsError) throw lotsError

  // Lots occupés
  const occupiedLots = lots?.filter(lot => lot.status === 'occupied') || []

  // Revenus mensuels
  const { data: leases, error: leasesError } = await supabase
    .from('leases')
    .select('rent_amount, lot:lots!inner(property_id)')
    .eq('lot.property_id', propertyId)
    .eq('status', 'active')

  if (leasesError) throw leasesError

  const monthlyRevenue = leases?.reduce((sum, lease) => sum + parseFloat(lease.rent_amount || 0), 0) || 0

  const totalLots = lots?.length || 0
  const occupancyRate = totalLots > 0 ? (occupiedLots.length / totalLots) * 100 : 0

  return {
    totalLots,
    occupiedLots: occupiedLots.length,
    vacantLots: totalLots - occupiedLots.length,
    monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
    occupancyRate: Math.round(occupancyRate * 10) / 10
  }
}
