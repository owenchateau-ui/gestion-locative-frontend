import { supabase } from '../lib/supabase'
import { getGuaranteesByCandidate, calculateGuaranteeLevel } from './guaranteeService'

// Créer un groupe de candidature
export const createCandidateGroup = async (groupData) => {
  const { data, error } = await supabase
    .from('candidate_groups')
    .insert({
      lot_id: groupData.lot_id,
      application_type: groupData.application_type || 'individual',
      couple_status: groupData.couple_status || null,
      status: 'pending'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Récupérer un groupe avec ses candidats, garanties et documents
export const getCandidateGroupById = async (id) => {
  // Récupérer le groupe
  const { data: group, error } = await supabase
    .from('candidate_groups')
    .select(`
      *,
      lots (
        id, name, rent_amount, charges_amount, surface_area,
        properties_new (id, name, address, city, postal_code)
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error

  // Récupérer les candidats du groupe
  const { data: candidates, error: candidatesError } = await supabase
    .from('candidates')
    .select('*')
    .eq('group_id', id)
    .order('applicant_order', { ascending: true })

  if (candidatesError) throw candidatesError

  // Pour chaque candidat, récupérer ses garanties et documents
  const candidatesWithDetails = await Promise.all(
    (candidates || []).map(async (candidate) => {
      const { data: guarantees } = await supabase
        .from('guarantees')
        .select('*')
        .eq('candidate_id', candidate.id)

      const { data: documents } = await supabase
        .from('candidate_documents')
        .select('*')
        .eq('candidate_id', candidate.id)

      return {
        ...candidate,
        guarantees: guarantees || [],
        documents: documents || []
      }
    })
  )

  return {
    ...group,
    candidates: candidatesWithDetails
  }
}

// Récupérer un groupe par son token d'accès
export const getCandidateGroupByToken = async (token) => {
  const { data: group, error } = await supabase
    .from('candidate_groups')
    .select(`
      *,
      lots (
        id, name, rent_amount, charges_amount, surface_area,
        properties_new (id, name, address, city, postal_code)
      )
    `)
    .eq('access_token', token)
    .single()

  if (error) throw error
  if (!group) throw new Error('Candidature non trouvée')

  // Récupérer les candidats
  const { data: candidates } = await supabase
    .from('candidates')
    .select('*')
    .eq('group_id', group.id)
    .order('applicant_order', { ascending: true })

  return { ...group, candidates: candidates || [] }
}

// Récupérer tous les groupes de candidatures pour un lot
export const getCandidateGroupsByLot = async (lotId) => {
  const { data, error } = await supabase
    .from('candidate_groups')
    .select(`
      *,
      candidates (id, first_name, last_name, email, monthly_income, other_income, is_main_applicant)
    `)
    .eq('lot_id', lotId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Récupérer tous les groupes pour le bailleur (via ses lots)
export const getAllCandidateGroups = async (filters = {}) => {
  let query = supabase
    .from('candidate_groups')
    .select(`
      *,
      lots (
        id, name, rent_amount, charges_amount,
        properties_new (id, name, city, entities (id, user_id))
      ),
      candidates (id, first_name, last_name, email, monthly_income, other_income, is_main_applicant)
    `)
    .order('created_at', { ascending: false })

  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  if (filters.lot_id) {
    query = query.eq('lot_id', filters.lot_id)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

// Mettre à jour le statut d'un groupe
export const updateCandidateGroupStatus = async (id, status, rejectionReason = null) => {
  const updateData = {
    status,
    rejection_reason: rejectionReason
  }

  if (status === 'reviewing') {
    updateData.reviewed_at = new Date().toISOString()
  } else if (status === 'converted') {
    updateData.converted_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('candidate_groups')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Calculer et mettre à jour les revenus/solvabilité du groupe
export const updateGroupFinancials = async (groupId) => {
  // Récupérer les candidats du groupe
  const { data: candidates } = await supabase
    .from('candidates')
    .select('monthly_income, other_income')
    .eq('group_id', groupId)

  // Récupérer le loyer du lot
  const { data: group } = await supabase
    .from('candidate_groups')
    .select('lot_id, lots (rent_amount, charges_amount)')
    .eq('id', groupId)
    .single()

  if (!candidates || !group) return

  // Calculer les revenus totaux
  const combinedIncome = candidates.reduce((sum, c) =>
    sum + (parseFloat(c.monthly_income) || 0) + (parseFloat(c.other_income) || 0), 0
  )

  // Calculer le score de solvabilité
  const totalRent = (parseFloat(group.lots?.rent_amount) || 0) + (parseFloat(group.lots?.charges_amount) || 0)
  const score = totalRent > 0 ? combinedIncome / totalRent : 0

  // Mettre à jour le groupe
  const { data, error } = await supabase
    .from('candidate_groups')
    .update({
      combined_monthly_income: combinedIncome,
      combined_solvability_score: Math.round(score * 100) / 100
    })
    .eq('id', groupId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Supprimer un groupe de candidature
export const deleteCandidateGroup = async (id) => {
  const { error } = await supabase
    .from('candidate_groups')
    .delete()
    .eq('id', id)

  if (error) throw error
}
