import { supabase } from '../lib/supabase'

const DEBUG = import.meta.env.MODE === 'development'
const log = (...args) => DEBUG && console.log('[CandidateService]', ...args)
const error = (...args) => DEBUG && console.error('[CandidateService]', ...args)

/**
 * Récupère ou crée un lien d'invitation pour un lot
 */
export const getInvitationLink = async (lotId) => {
  try {
    log('Getting invitation link for lot:', lotId)

    // Chercher un lien actif existant
    const { data: existingLink, error: fetchError } = await supabase
      .from('candidate_invitation_links')
      .select('*')
      .eq('lot_id', lotId)
      .eq('is_active', true)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    if (existingLink) {
      log('Found existing link:', existingLink)
      return { data: existingLink, error: null }
    }

    // Créer un nouveau lien
    return await generateNewLink(lotId)
  } catch (err) {
    error('Error getting invitation link:', err)
    return { data: null, error: err }
  }
}

/**
 * Génère un nouveau lien d'invitation (désactive l'ancien)
 */
export const generateNewLink = async (lotId) => {
  try {
    log('Generating new link for lot:', lotId)

    // Désactiver les anciens liens
    const { error: deactivateError } = await supabase
      .from('candidate_invitation_links')
      .update({ is_active: false })
      .eq('lot_id', lotId)
      .eq('is_active', true)

    if (deactivateError) throw deactivateError

    // Créer le nouveau lien (le token UUID sera généré automatiquement par Supabase)
    const { data, error: createError } = await supabase
      .from('candidate_invitation_links')
      .insert({
        lot_id: lotId,
        is_active: true
      })
      .select()
      .single()

    if (createError) throw createError

    log('New link created:', data)
    return { data, error: null }
  } catch (err) {
    error('Error generating new link:', err)
    return { data: null, error: err }
  }
}

/**
 * Récupère les infos du lot depuis le token d'invitation
 */
export const getLotByInvitationToken = async (token) => {
  try {
    log('Getting lot by invitation token')

    const { data: linkData, error: linkError } = await supabase
      .from('candidate_invitation_links')
      .select(`
        *,
        lots_new (
          id,
          name,
          reference,
          lot_type,
          rent_amount,
          charges_amount,
          deposit_amount,
          surface_area,
          nb_rooms,
          properties_new (
            id,
            name,
            address,
            city,
            postal_code
          )
        )
      `)
      .eq('token', token)
      .eq('is_active', true)
      .single()

    if (linkError) throw linkError

    if (!linkData) {
      return { data: null, error: new Error('Lien invalide ou expiré') }
    }

    log('Lot found:', linkData.lots_new)
    return { data: linkData.lots_new, error: null }
  } catch (err) {
    error('Error getting lot by token:', err)
    return { data: null, error: err }
  }
}

/**
 * Liste des candidatures pour un lot
 */
export const getCandidatesByLot = async (lotId) => {
  try {
    log('Fetching candidates for lot:', lotId)

    const { data, error: fetchError } = await supabase
      .from('candidates')
      .select(`
        *,
        lots_new (
          id,
          name,
          reference,
          rent_amount,
          properties_new (
            name,
            address,
            city
          )
        )
      `)
      .eq('lot_id', lotId)
      .order('created_at', { ascending: false })

    if (fetchError) throw fetchError

    log('Found candidates:', data?.length)
    return { data: data || [], error: null }
  } catch (err) {
    error('Error fetching candidates:', err)
    return { data: [], error: err }
  }
}

/**
 * Liste de toutes les candidatures (avec filtre optionnel)
 */
export const getAllCandidates = async (filters = {}) => {
  try {
    log('Fetching all candidates with filters:', filters)

    let query = supabase
      .from('candidates')
      .select(`
        *,
        lots_new (
          id,
          name,
          reference,
          rent_amount,
          properties_new (
            name,
            address,
            city,
            entity_id
          )
        )
      `)
      .order('created_at', { ascending: false })

    // Filtre par lot
    if (filters.lotId) {
      query = query.eq('lot_id', filters.lotId)
    }

    // Filtre par statut
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    // Filtre par entité (via propriété)
    if (filters.entityId) {
      query = query.eq('lots_new.properties_new.entity_id', filters.entityId)
    }

    const { data, error: fetchError } = await query

    if (fetchError) throw fetchError

    log('Found candidates:', data?.length)
    return { data: data || [], error: null }
  } catch (err) {
    error('Error fetching all candidates:', err)
    return { data: [], error: err }
  }
}

/**
 * Détail d'une candidature
 */
export const getCandidateById = async (id) => {
  try {
    log('Fetching candidate:', id)

    const { data, error: fetchError } = await supabase
      .from('candidates')
      .select(`
        *,
        lots_new (
          id,
          name,
          reference,
          lot_type,
          rent_amount,
          charges_amount,
          deposit_amount,
          surface_area,
          nb_rooms,
          properties_new (
            id,
            name,
            address,
            city,
            postal_code,
            entity_id
          )
        )
      `)
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    log('Candidate found:', data)
    return { data, error: null }
  } catch (err) {
    error('Error fetching candidate:', err)
    return { data: null, error: err }
  }
}

/**
 * Récupère une candidature par son token (pour le candidat)
 */
export const getCandidateByToken = async (token) => {
  try {
    log('Fetching candidate by token')

    const { data, error: fetchError } = await supabase
      .from('candidates')
      .select(`
        *,
        lots_new (
          id,
          name,
          reference,
          rent_amount,
          properties_new (
            name,
            address,
            city
          )
        )
      `)
      .eq('access_token', token)
      .single()

    if (fetchError) throw fetchError

    log('Candidate found by token')
    return { data, error: null }
  } catch (err) {
    error('Error fetching candidate by token:', err)
    return { data: null, error: err }
  }
}

/**
 * Recherche une candidature par email
 */
export const getCandidateByEmail = async (email) => {
  try {
    log('Searching candidate by email')

    const { data, error: fetchError } = await supabase
      .from('candidates')
      .select(`
        *,
        lots_new (
          id,
          name,
          reference,
          rent_amount,
          properties_new (
            name,
            address,
            city
          )
        )
      `)
      .eq('email', email.toLowerCase())
      .order('created_at', { ascending: false })

    if (fetchError) throw fetchError

    log('Found candidates by email:', data?.length)
    return { data: data || [], error: null }
  } catch (err) {
    error('Error searching candidate by email:', err)
    return { data: [], error: err }
  }
}

/**
 * Crée une nouvelle candidature
 */
export const createCandidate = async (candidateData) => {
  try {
    log('Creating new candidate:', candidateData)

    // Générer un token d'accès unique
    const accessToken = `cand-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`

    // Calculer le score de solvabilité
    const totalIncome = (candidateData.monthly_income || 0) + (candidateData.other_income || 0)
    const guarantorIncome = candidateData.guarantor_monthly_income || 0

    // Récupérer le loyer du lot
    const { data: lotData, error: lotError } = await supabase
      .from('lots_new')
      .select('rent_amount')
      .eq('id', candidateData.lot_id)
      .single()

    if (lotError) throw lotError

    const rentAmount = lotData.rent_amount
    const incomeRatio = totalIncome / rentAmount

    // Calcul du score (sur 5)
    let solvencyScore = 0
    if (incomeRatio >= 3) solvencyScore = 5
    else if (incomeRatio >= 2.5) solvencyScore = 4
    else if (incomeRatio >= 2) solvencyScore = 3
    else if (incomeRatio >= 1.5) solvencyScore = 2
    else solvencyScore = 1

    // Bonus si garant avec revenus suffisants
    if (guarantorIncome >= rentAmount * 3 && solvencyScore < 5) {
      solvencyScore += 1
    }

    const { data, error: createError } = await supabase
      .from('candidates')
      .insert({
        ...candidateData,
        access_token: accessToken,
        solvency_score: solvencyScore,
        income_ratio: incomeRatio,
        status: 'pending'
      })
      .select()
      .single()

    if (createError) throw createError

    log('Candidate created:', data)
    return { data, error: null }
  } catch (err) {
    error('Error creating candidate:', err)
    return { data: null, error: err }
  }
}

/**
 * Met à jour le statut d'une candidature
 */
export const updateCandidateStatus = async (id, status, rejectionReason = null) => {
  try {
    log('Updating candidate status:', id, status)

    const updateData = {
      status,
      reviewed_at: new Date().toISOString()
    }

    if (status === 'rejected' && rejectionReason) {
      updateData.rejection_reason = rejectionReason
    }

    const { data, error: updateError } = await supabase
      .from('candidates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    log('Candidate status updated:', data)
    return { data, error: null }
  } catch (err) {
    error('Error updating candidate status:', err)
    return { data: null, error: err }
  }
}

/**
 * Upload un document pour une candidature
 */
export const uploadDocument = async (candidateId, file, documentType) => {
  try {
    log('Uploading document:', candidateId, documentType)

    // Créer un nom de fichier unique
    const fileExt = file.name.split('.').pop()
    const fileName = `${candidateId}/${documentType}-${Date.now()}.${fileExt}`

    // Upload vers Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('candidate-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    // Enregistrer dans la table documents
    const { data: docData, error: docError } = await supabase
      .from('candidate_documents')
      .insert({
        candidate_id: candidateId,
        document_type: documentType,
        file_name: file.name,
        file_path: uploadData.path,
        file_size: file.size
      })
      .select()
      .single()

    if (docError) throw docError

    log('Document uploaded:', docData)
    return { data: docData, error: null }
  } catch (err) {
    error('Error uploading document:', err)
    return { data: null, error: err }
  }
}

/**
 * Liste des documents d'une candidature
 */
export const getDocuments = async (candidateId) => {
  try {
    log('Fetching documents for candidate:', candidateId)

    const { data, error: fetchError } = await supabase
      .from('candidate_documents')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('uploaded_at', { ascending: false })

    if (fetchError) throw fetchError

    log('Found documents:', data?.length)
    return { data: data || [], error: null }
  } catch (err) {
    error('Error fetching documents:', err)
    return { data: [], error: err }
  }
}

/**
 * Récupère l'URL publique d'un document
 */
export const getDocumentUrl = (filePath) => {
  const { data } = supabase.storage
    .from('candidate-documents')
    .getPublicUrl(filePath)

  return data.publicUrl
}

/**
 * Supprime un document
 */
export const deleteDocument = async (documentId, filePath) => {
  try {
    log('Deleting document:', documentId)

    // Supprimer du storage
    const { error: storageError } = await supabase.storage
      .from('candidate-documents')
      .remove([filePath])

    if (storageError) throw storageError

    // Supprimer de la table
    const { error: dbError } = await supabase
      .from('candidate_documents')
      .delete()
      .eq('id', documentId)

    if (dbError) throw dbError

    log('Document deleted')
    return { error: null }
  } catch (err) {
    error('Error deleting document:', err)
    return { error: err }
  }
}

/**
 * Convertit un candidat accepté en locataire + bail
 */
export const convertToTenant = async (candidateId) => {
  try {
    log('Converting candidate to tenant:', candidateId)

    // Récupérer les données du candidat
    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .select(`
        *,
        lots_new (
          id,
          rent_amount,
          charges_amount,
          deposit_amount,
          properties_new (
            entity_id
          )
        )
      `)
      .eq('id', candidateId)
      .single()

    if (candidateError) throw candidateError

    if (candidate.status !== 'accepted') {
      throw new Error('Seuls les candidats acceptés peuvent être convertis')
    }

    // Créer le locataire
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        entity_id: candidate.lots_new.properties_new.entity_id,
        first_name: candidate.first_name,
        last_name: candidate.last_name,
        email: candidate.email,
        phone: candidate.phone,
        birth_date: candidate.birth_date,
        current_address: candidate.current_address
      })
      .select()
      .single()

    if (tenantError) throw tenantError

    log('Tenant created:', tenant)

    // Créer le bail
    const { data: lease, error: leaseError } = await supabase
      .from('leases')
      .insert({
        lot_id: candidate.lot_id,
        tenant_id: tenant.id,
        rent_amount: candidate.lots_new.rent_amount,
        charges_amount: candidate.lots_new.charges_amount,
        deposit_amount: candidate.lots_new.deposit_amount,
        status: 'draft' // Le bail est en brouillon, à compléter
      })
      .select()
      .single()

    if (leaseError) throw leaseError

    log('Lease created:', lease)

    // Mettre à jour le candidat pour marquer qu'il a été converti
    const { error: updateError } = await supabase
      .from('candidates')
      .update({
        converted_to_tenant: true,
        converted_at: new Date().toISOString()
      })
      .eq('id', candidateId)

    if (updateError) throw updateError

    return {
      data: { tenant, lease },
      error: null
    }
  } catch (err) {
    error('Error converting candidate to tenant:', err)
    return { data: null, error: err }
  }
}

/**
 * Compte le nombre de candidatures en attente pour un lot
 */
export const countPendingCandidates = async (lotId) => {
  try {
    const { count, error: countError } = await supabase
      .from('candidates')
      .select('*', { count: 'exact', head: true })
      .eq('lot_id', lotId)
      .in('status', ['pending', 'reviewing'])

    if (countError) throw countError

    return { count: count || 0, error: null }
  } catch (err) {
    error('Error counting pending candidates:', err)
    return { count: 0, error: err }
  }
}

export default {
  getInvitationLink,
  generateNewLink,
  getLotByInvitationToken,
  getCandidatesByLot,
  getAllCandidates,
  getCandidateById,
  getCandidateByToken,
  getCandidateByEmail,
  createCandidate,
  updateCandidateStatus,
  uploadDocument,
  getDocuments,
  getDocumentUrl,
  deleteDocument,
  convertToTenant,
  countPendingCandidates
}
