import { supabase } from '../lib/supabase'

/**
 * Service pour la gestion des entités juridiques
 */

/**
 * Récupère toutes les entités d'un utilisateur
 */
export const fetchEntities = async (userId) => {
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('supabase_uid', userId)
    .limit(1)

  if (userError) throw userError
  if (!userData || userData.length === 0) {
    throw new Error('Utilisateur non trouvé')
  }

  const { data, error } = await supabase
    .from('entities')
    .select('*')
    .eq('user_id', userData[0].id)
    .order('name')

  if (error) throw error
  return data || []
}

/**
 * Récupère une entité par son ID
 */
export const fetchEntityById = async (entityId) => {
  const { data, error } = await supabase
    .from('entities')
    .select('*')
    .eq('id', entityId)
    .limit(1)

  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error('Entité non trouvée')
  }

  return data[0]
}

/**
 * Crée une nouvelle entité
 */
export const createEntity = async (userId, entityData) => {
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('supabase_uid', userId)
    .limit(1)

  if (userError) throw userError
  if (!userData || userData.length === 0) {
    throw new Error('Utilisateur non trouvé')
  }

  const { data, error } = await supabase
    .from('entities')
    .insert([{
      ...entityData,
      user_id: userData[0].id
    }])
    .select()
    .limit(1)

  if (error) throw error
  return data[0]
}

/**
 * Met à jour une entité
 */
export const updateEntity = async (entityId, entityData) => {
  const { data, error } = await supabase
    .from('entities')
    .update(entityData)
    .eq('id', entityId)
    .select()
    .limit(1)

  if (error) throw error
  return data[0]
}

/**
 * Supprime une entité
 */
export const deleteEntity = async (entityId) => {
  const { error } = await supabase
    .from('entities')
    .delete()
    .eq('id', entityId)

  if (error) throw error
}

/**
 * Récupère les statistiques d'une entité
 */
export const fetchEntityStats = async (entityId) => {
  // Nombre de propriétés
  const { data: properties, error: propError } = await supabase
    .from('properties_new')
    .select('id', { count: 'exact' })
    .eq('entity_id', entityId)

  if (propError) throw propError

  // Nombre de lots
  const { data: lots, error: lotsError } = await supabase
    .from('lots')
    .select('id, properties_new!inner(entity_id)', { count: 'exact' })
    .eq('properties_new.entity_id', entityId)

  if (lotsError) throw lotsError

  // Lots occupés
  const { data: occupiedLots, error: occupiedError } = await supabase
    .from('lots')
    .select('id, properties_new!inner(entity_id)', { count: 'exact' })
    .eq('properties_new.entity_id', entityId)
    .eq('status', 'occupied')

  if (occupiedError) throw occupiedError

  // Revenus mensuels (somme des loyers des baux actifs)
  const { data: leases, error: leasesError } = await supabase
    .from('leases')
    .select('rent_amount, lot:lots!inner(properties_new!inner(entity_id))')
    .eq('lot.properties_new.entity_id', entityId)
    .eq('status', 'active')

  if (leasesError) throw leasesError

  const monthlyRevenue = leases?.reduce((sum, lease) => sum + parseFloat(lease.rent_amount || 0), 0) || 0

  // Taux d'occupation
  const totalLots = lots?.length || 0
  const occupiedCount = occupiedLots?.length || 0
  const occupancyRate = totalLots > 0 ? (occupiedCount / totalLots) * 100 : 0

  return {
    propertiesCount: properties?.length || 0,
    lotsCount: totalLots,
    occupiedLotsCount: occupiedCount,
    monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
    occupancyRate: Math.round(occupancyRate * 10) / 10
  }
}
