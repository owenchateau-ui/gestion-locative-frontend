import { supabase } from '../lib/supabase'

/**
 * Service pour la gestion des locataires
 */

/**
 * Récupère tous les locataires d'un utilisateur
 */
export const fetchTenants = async (userId, entityId = null) => {
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
    .from('tenants')
    .select('*, entity:entities!inner(id, name, user_id)')
    .eq('entity.user_id', userData[0].id)
    .order('last_name')

  if (entityId) {
    query = query.eq('entity_id', entityId)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Récupère un locataire par son ID
 */
export const fetchTenantById = async (tenantId) => {
  const { data, error } = await supabase
    .from('tenants')
    .select('*, entity:entities(id, name)')
    .eq('id', tenantId)
    .limit(1)

  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error('Locataire non trouvé')
  }

  return data[0]
}

/**
 * Crée un nouveau locataire
 */
export const createTenant = async (tenantData) => {
  const { data, error } = await supabase
    .from('tenants')
    .insert([tenantData])
    .select()
    .limit(1)

  if (error) throw error
  return data[0]
}

/**
 * Met à jour un locataire
 */
export const updateTenant = async (tenantId, tenantData) => {
  const { data, error } = await supabase
    .from('tenants')
    .update(tenantData)
    .eq('id', tenantId)
    .select()
    .limit(1)

  if (error) throw error
  return data[0]
}

/**
 * Supprime un locataire
 */
export const deleteTenant = async (tenantId) => {
  const { error } = await supabase
    .from('tenants')
    .delete()
    .eq('id', tenantId)

  if (error) throw error
}

/**
 * Récupère les baux d'un locataire
 */
export const fetchTenantLeases = async (tenantId) => {
  const { data, error } = await supabase
    .from('leases')
    .select(`
      *,
      lot:lots(id, name, properties_new(id, name))
    `)
    .eq('tenant_id', tenantId)
    .order('start_date', { ascending: false })

  if (error) throw error
  return data || []
}
