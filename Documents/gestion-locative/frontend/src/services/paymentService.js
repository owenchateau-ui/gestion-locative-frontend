import { supabase } from '../lib/supabase'

/**
 * Service pour la gestion des paiements
 */

/**
 * Récupère tous les paiements d'un utilisateur
 */
export const fetchPayments = async (userId, entityId = null, status = null) => {
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
    .from('payments')
    .select(`
      *,
      lease:leases!inner(
        id,
        rent_amount,
        lot:lots!inner(
          id,
          name,
          properties_new!inner(id, name, entity_id, entities!inner(user_id))
        ),
        tenant:tenants(id, first_name, last_name)
      )
    `)
    .eq('lease.lot.properties_new.entities.user_id', userData[0].id)
    .order('payment_date', { ascending: false })

  if (entityId) {
    query = query.eq('lease.lot.properties_new.entity_id', entityId)
  }

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Récupère un paiement par son ID
 */
export const fetchPaymentById = async (paymentId) => {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      lease:leases(
        id,
        rent_amount,
        lot:lots(id, name, properties_new(id, name)),
        tenant:tenants(id, first_name, last_name, email)
      )
    `)
    .eq('id', paymentId)
    .limit(1)

  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error('Paiement non trouvé')
  }

  return data[0]
}

/**
 * Crée un nouveau paiement
 */
export const createPayment = async (paymentData) => {
  const { data, error } = await supabase
    .from('payments')
    .insert([paymentData])
    .select()
    .limit(1)

  if (error) throw error
  return data[0]
}

/**
 * Met à jour un paiement
 */
export const updatePayment = async (paymentId, paymentData) => {
  const { data, error } = await supabase
    .from('payments')
    .update(paymentData)
    .eq('id', paymentId)
    .select()
    .limit(1)

  if (error) throw error
  return data[0]
}

/**
 * Supprime un paiement
 */
export const deletePayment = async (paymentId) => {
  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', paymentId)

  if (error) throw error
}

/**
 * Récupère les statistiques de paiements
 */
export const fetchPaymentStats = async (userId, entityId = null) => {
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
    .from('payments')
    .select(`
      amount,
      status,
      lease:leases!inner(
        lot:lots!inner(
          properties_new!inner(entity_id, entities!inner(user_id))
        )
      )
    `)
    .eq('lease.lot.properties_new.entities.user_id', userData[0].id)

  if (entityId) {
    query = query.eq('lease.lot.properties_new.entity_id', entityId)
  }

  const { data, error } = await query

  if (error) throw error

  const totalPaid = data
    ?.filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) || 0

  const totalPending = data
    ?.filter(p => p.status === 'pending' || p.status === 'late')
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) || 0

  const lateCount = data?.filter(p => p.status === 'late').length || 0

  return {
    totalPaid: Math.round(totalPaid * 100) / 100,
    totalPending: Math.round(totalPending * 100) / 100,
    lateCount
  }
}
