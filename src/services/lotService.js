import { supabase } from '../lib/supabase'

/**
 * Service pour la gestion des lots
 */

/**
 * Récupère tous les lots d'un utilisateur
 */
export const fetchLots = async (userId, entityId = null, propertyId = null) => {
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
    .from('lots')
    .select('*, properties_new!inner(id, name, entity_id, entities!inner(user_id))')
    .eq('properties_new.entities.user_id', userData[0].id)
    .order('name')

  if (entityId) {
    query = query.eq('properties_new.entity_id', entityId)
  }

  if (propertyId) {
    query = query.eq('property_id', propertyId)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Récupère un lot par son ID
 */
export const fetchLotById = async (lotId) => {
  const { data, error } = await supabase
    .from('lots')
    .select('*, properties_new(id, name, entity_id, entities(id, name))')
    .eq('id', lotId)
    .limit(1)

  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error('Lot non trouvé')
  }

  return data[0]
}

/**
 * Crée un nouveau lot
 */
export const createLot = async (lotData) => {
  const { data, error } = await supabase
    .from('lots')
    .insert([lotData])
    .select()
    .limit(1)

  if (error) throw error
  return data[0]
}

/**
 * Met à jour un lot
 */
export const updateLot = async (lotId, lotData) => {
  const { data, error } = await supabase
    .from('lots')
    .update(lotData)
    .eq('id', lotId)
    .select()
    .limit(1)

  if (error) throw error
  return data[0]
}

/**
 * Supprime un lot
 */
export const deleteLot = async (lotId) => {
  const { error } = await supabase
    .from('lots')
    .delete()
    .eq('id', lotId)

  if (error) throw error
}

/**
 * Récupère le bail actif d'un lot
 */
export const fetchActiveLease = async (lotId) => {
  const { data, error } = await supabase
    .from('leases')
    .select('*, tenant:tenants(id, first_name, last_name, email)')
    .eq('lot_id', lotId)
    .eq('status', 'active')
    .limit(1)

  if (error) throw error
  return data?.[0] || null
}

/**
 * Récupère l'historique des baux d'un lot
 */
export const fetchLeaseHistory = async (lotId) => {
  const { data, error } = await supabase
    .from('leases')
    .select('*, tenant:tenants(id, first_name, last_name)')
    .eq('lot_id', lotId)
    .order('start_date', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Récupère les statistiques d'un lot
 */
export const fetchLotStats = async (lotId) => {
  // Bail actif
  const activeLease = await fetchActiveLease(lotId)

  // Historique des paiements
  if (activeLease) {
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('amount, status', { count: 'exact' })
      .eq('lease_id', activeLease.id)

    if (paymentsError) throw paymentsError

    const totalPaid = payments
      ?.filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) || 0

    const unpaidCount = payments?.filter(p => p.status === 'pending' || p.status === 'late').length || 0

    return {
      hasActiveLease: true,
      currentRent: parseFloat(activeLease.rent_amount || 0),
      tenant: activeLease.tenant,
      totalPaid: Math.round(totalPaid * 100) / 100,
      unpaidCount
    }
  }

  return {
    hasActiveLease: false,
    currentRent: 0,
    tenant: null,
    totalPaid: 0,
    unpaidCount: 0
  }
}
