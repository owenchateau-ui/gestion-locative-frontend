import { supabase } from '../lib/supabase'

/**
 * Service pour la gestion des baux
 */

/**
 * Récupère tous les baux d'un utilisateur
 */
export const fetchLeases = async (userId, entityId = null, status = null) => {
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
    .from('leases')
    .select(`
      *,
      lot:lots!inner(
        id,
        name,
        properties_new!inner(id, name, entity_id, entities!inner(user_id))
      ),
      tenant:tenants(id, first_name, last_name, email)
    `)
    .eq('lot.properties_new.entities.user_id', userData[0].id)
    .order('start_date', { ascending: false })

  if (entityId) {
    query = query.eq('lot.properties_new.entity_id', entityId)
  }

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Récupère un bail par son ID
 */
export const fetchLeaseById = async (leaseId) => {
  const { data, error } = await supabase
    .from('leases')
    .select(`
      *,
      lot:lots(id, name, properties_new(id, name, entities(id, name))),
      tenant:tenants(id, first_name, last_name, email, phone)
    `)
    .eq('id', leaseId)
    .limit(1)

  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error('Bail non trouvé')
  }

  return data[0]
}

/**
 * Crée un nouveau bail
 */
export const createLease = async (leaseData) => {
  const { data, error } = await supabase
    .from('leases')
    .insert([leaseData])
    .select()
    .limit(1)

  if (error) throw error
  return data[0]
}

/**
 * Met à jour un bail
 */
export const updateLease = async (leaseId, leaseData) => {
  const { data, error } = await supabase
    .from('leases')
    .update(leaseData)
    .eq('id', leaseId)
    .select()
    .limit(1)

  if (error) throw error
  return data[0]
}

/**
 * Supprime un bail
 */
export const deleteLease = async (leaseId) => {
  const { error } = await supabase
    .from('leases')
    .delete()
    .eq('id', leaseId)

  if (error) throw error
}

/**
 * Récupère les paiements d'un bail
 */
export const fetchLeasePayments = async (leaseId) => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('lease_id', leaseId)
    .order('payment_date', { ascending: false })

  if (error) throw error
  return data || []
}
