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

/**
 * Récupère tous les baux actifs avec leurs lots et locataires
 * Utilisé notamment pour les états des lieux
 *
 * Chemin des relations:
 * - leases.lot_id → lots.id
 * - lots.property_id → properties_new.id
 * - properties_new.entity_id → entities.id
 * - leases.tenant_id → tenants.id
 * - tenants.group_id → tenant_groups.id (attention: colonne = group_id, pas tenant_group_id)
 */
export const getAllLeases = async () => {
  const { data, error } = await supabase
    .from('leases')
    .select(`
      *,
      lot:lots(
        id,
        name,
        reference,
        property:properties_new(
          id,
          name,
          address,
          city,
          postal_code,
          entity:entities(id, name)
        )
      ),
      tenant:tenants(
        id,
        first_name,
        last_name,
        email,
        phone,
        group_id,
        tenant_group:tenant_groups!group_id(
          id,
          name,
          group_type
        )
      )
    `)
    .eq('status', 'active')
    .order('start_date', { ascending: false })

  if (error) throw error

  // Formater les données pour compatibilité avec InventoryForm
  // Le formulaire attend lease.tenant.tenant_group.name
  if (data && data.length > 0) {
    for (const lease of data) {
      // Si le locataire a un groupe, enrichir avec les autres membres du groupe
      if (lease.tenant?.tenant_group?.id) {
        const groupId = lease.tenant.tenant_group.id

        // Récupérer tous les membres du groupe
        const { data: groupMembers } = await supabase
          .from('tenants')
          .select('id, first_name, last_name, email, phone')
          .eq('group_id', groupId)

        // Ajouter les membres au groupe
        lease.tenant.tenant_group.tenants = groupMembers || []
      }
    }
  }

  return data || []
}
