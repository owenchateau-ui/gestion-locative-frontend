import { supabase } from '../lib/supabase'

const DEBUG = import.meta.env.MODE === 'development'
const log = (...args) => DEBUG && console.log('[CandidateService]', ...args)
const error = (...args) => DEBUG && console.error('[CandidateService]', ...args)

/**
 * Fonction utilitaire pour nettoyer les données avant insertion
 * Convertit les chaînes vides en null pour les champs optionnels
 * VERSION 2 : Support couples et colocations
 */
const cleanData = (data) => {
  const cleaned = { ...data }

  // Convertir les chaînes vides en null pour les dates
  const dateFields = [
    'birth_date', 'employment_start_date',
    'applicant2_birth_date', 'applicant2_employment_start_date'
  ]
  dateFields.forEach(field => {
    if (cleaned[field] === '' || cleaned[field] === undefined) {
      cleaned[field] = null
    }
  })

  // Convertir les revenus en nombres
  const incomeFields = [
    'monthly_income', 'other_income',
    'applicant2_monthly_income', 'applicant2_other_income',
    'applicant3_monthly_income', 'applicant4_monthly_income',
    'guarantor_monthly_income', 'guarantor2_monthly_income'
  ]

  incomeFields.forEach(field => {
    if (cleaned[field] === '' || cleaned[field] === undefined || cleaned[field] === null) {
      // other_income et similar → 0, les autres → null
      if (field.includes('other_income')) {
        cleaned[field] = 0
      } else if (field.includes('guarantor')) {
        cleaned[field] = null
      } else if (field.includes('applicant')) {
        cleaned[field] = 0
      } else if (field === 'monthly_income') {
        // monthly_income du candidat 1 doit rester défini
        cleaned[field] = Number(cleaned[field]) || 0
      }
    } else {
      cleaned[field] = Number(cleaned[field])
    }
  })

  // Convertir les chaînes vides en null pour les champs optionnels
  const optionalFields = [
    // Candidat 1
    'phone', 'birth_place', 'nationality',
    'employer_name', 'job_title', 'contract_type',
    'guarantor_first_name', 'guarantor_last_name',
    'guarantor_email', 'guarantor_phone', 'guarantor_relationship', 'guarantor_professional_status',

    // Candidat 2
    'applicant2_first_name', 'applicant2_last_name', 'applicant2_email', 'applicant2_phone',
    'applicant2_birth_place', 'applicant2_nationality',
    'applicant2_professional_status', 'applicant2_employer_name', 'applicant2_job_title', 'applicant2_contract_type',

    // Candidat 3
    'applicant3_first_name', 'applicant3_last_name', 'applicant3_email', 'applicant3_phone',

    // Candidat 4
    'applicant4_first_name', 'applicant4_last_name', 'applicant4_email', 'applicant4_phone',

    // Garant 2
    'guarantor2_first_name', 'guarantor2_last_name', 'guarantor2_email', 'guarantor2_phone', 'guarantor2_relationship'
  ]

  optionalFields.forEach(field => {
    if (cleaned[field] === '') {
      cleaned[field] = null
    }
  })

  // Assurer que application_type et nb_applicants ont des valeurs par défaut
  if (!cleaned.application_type) {
    cleaned.application_type = 'individual'
  }
  if (!cleaned.nb_applicants) {
    cleaned.nb_applicants = 1
  }

  return cleaned
}

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
        lots (
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
      .limit(1)
      .maybeSingle()

    if (linkError) throw linkError

    if (!linkData) {
      return { data: null, error: new Error('Lien d\'invitation invalide ou expiré') }
    }

    log('Lot found:', linkData.lots)
    return { data: linkData.lots, error: null }
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
        lots (
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
        lots (
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
      query = query.eq('lots.properties_new.entity_id', filters.entityId)
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

    // Récupérer le candidat avec le lot et la propriété
    const { data: candidate, error: fetchError } = await supabase
      .from('candidates')
      .select(`
        *,
        lots (
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
      .maybeSingle()

    if (fetchError) throw fetchError

    if (!candidate) {
      return { data: null, error: new Error('Candidature introuvable') }
    }

    // Récupérer les documents séparément
    console.log('🔍 DEBUG: Fetching documents for candidate_id:', id)
    const { data: documents, error: docError } = await supabase
      .from('candidate_documents')
      .select('*')
      .eq('candidate_id', id)
      .order('created_at', { ascending: false })

    console.log('🔍 DEBUG: Documents query result:', { documents, docError })

    if (docError) {
      log('Error fetching documents:', docError)
      console.error('❌ DEBUG: Error fetching documents:', docError)
      // Ne pas bloquer si erreur documents
    }

    // Fusionner candidat et documents
    const result = {
      ...candidate,
      documents: documents || []
    }

    console.log('✅ DEBUG: Final result with documents:', result)
    console.log('✅ DEBUG: Number of documents:', result.documents?.length || 0)
    log('Candidate found with documents:', result)
    return { data: result, error: null }
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
        lots (
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
      .maybeSingle()

    if (fetchError) throw fetchError

    if (!data) {
      return { data: null, error: new Error('Token invalide ou candidature introuvable') }
    }

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
        lots (
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

    // Nettoyer les données (convertir chaînes vides en null)
    const cleanedData = cleanData(candidateData)

    // L'UUID et le access_token sont générés automatiquement par PostgreSQL
    // Le score de solvabilité est calculé automatiquement par un trigger PostgreSQL
    const { data, error: createError } = await supabase
      .from('candidates')
      .insert({
        ...cleanedData,
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
 * VERSION 2 : Support applicant_number pour couples/colocations
 */
export const uploadDocument = async (candidateId, file, documentType, applicantNumber = 1) => {
  console.log('🔍 uploadDocument called with:', { candidateId, fileName: file.name, documentType, applicantNumber })

  try {
    // 1. Upload du fichier dans Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${candidateId}/${documentType}-applicant${applicantNumber}-${Date.now()}.${fileExt}`

    console.log('🔍 Uploading to storage:', fileName)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('candidate-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('❌ Storage upload error:', uploadError)
      throw uploadError
    }

    console.log('✅ Storage upload success:', uploadData)

    // 2. Récupérer l'URL publique
    const { data: urlData } = supabase.storage
      .from('candidate-documents')
      .getPublicUrl(fileName)

    const fileUrl = urlData.publicUrl
    console.log('🔍 Public URL:', fileUrl)

    // 3. Créer l'entrée dans candidate_documents
    const insertData = {
      candidate_id: candidateId,
      document_type: documentType,
      applicant_number: applicantNumber,
      file_name: file.name,
      file_path: uploadData.path,
      file_url: fileUrl,
      file_size: file.size,
      mime_type: file.type
    }

    console.log('🔍 Inserting into candidate_documents:', insertData)

    const { data, error } = await supabase
      .from('candidate_documents')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('❌ Database insert error:', error)
      throw error
    }

    console.log('✅ Document saved to database:', data)
    log('Document uploaded:', data)
    return { data, error: null }

  } catch (err) {
    console.error('❌ uploadDocument failed:', err)
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
        lots (
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
      .maybeSingle()

    if (candidateError) throw candidateError

    if (!candidate) {
      throw new Error('Candidature introuvable')
    }

    if (candidate.status !== 'accepted') {
      throw new Error('Seuls les candidats acceptés peuvent être convertis')
    }

    // Créer le locataire
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        entity_id: candidate.lots.properties_new.entity_id,
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
        rent_amount: candidate.lots.rent_amount,
        charges_amount: candidate.lots.charges_amount,
        deposit_amount: candidate.lots.deposit_amount,
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
