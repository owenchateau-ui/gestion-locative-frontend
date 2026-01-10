import { supabase } from '../lib/supabase'

/**
 * Service de gestion de la bibliothèque documentaire
 * Gère l'upload, la récupération, la recherche et la suppression de documents
 */

const STORAGE_BUCKET = 'documents'

// ===== CATÉGORIES DE DOCUMENTS =====

export const DOCUMENT_CATEGORIES = {
  bail: 'Bail',
  edl: 'État des lieux',
  quittance: 'Quittance',
  diagnostic: 'Diagnostic',
  insurance: 'Assurance',
  identity: 'Pièce d\'identité',
  income_proof: 'Justificatif de revenus',
  tax: 'Fiscal',
  correspondence: 'Courrier',
  invoice: 'Facture',
  work_report: 'Rapport de travaux',
  administrative: 'Administratif',
  other: 'Autre'
}

// ===== TYPES DE FICHIERS ACCEPTÉS =====

export const ALLOWED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

// ===== FONCTIONS UTILITAIRES =====

/**
 * Génère un chemin de fichier organisé hiérarchiquement
 */
const generateFilePath = (entityId, category, fileName) => {
  const timestamp = Date.now()
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `${entityId}/${category}/${timestamp}_${sanitizedFileName}`
}

/**
 * Valide un fichier avant upload
 */
export const validateFile = (file) => {
  const errors = []

  if (!file) {
    errors.push('Aucun fichier sélectionné')
    return { valid: false, errors }
  }

  if (file.size > MAX_FILE_SIZE) {
    errors.push(`Le fichier est trop volumineux (max ${MAX_FILE_SIZE / 1024 / 1024} MB)`)
  }

  if (!Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
    errors.push('Type de fichier non autorisé')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Formate la taille du fichier pour affichage
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// ===== OPÉRATIONS CRUD =====

/**
 * Upload un document vers Supabase Storage et crée l'entrée en base
 */
export const uploadDocument = async ({
  file,
  entityId,
  propertyId = null,
  lotId = null,
  leaseId = null,
  tenantId = null,
  tenantGroupId = null,
  candidateId = null,
  category = 'other',
  title = null,
  description = null,
  tags = []
}) => {
  try {
    // Validation du fichier
    const validation = validateFile(file)
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '))
    }

    // Générer le chemin du fichier
    const filePath = generateFilePath(entityId, category, file.name)

    // Upload vers Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    // Créer l'entrée dans la table documents
    const { data: documentData, error: documentError } = await supabase
      .from('documents')
      .insert({
        entity_id: entityId,
        property_id: propertyId,
        lot_id: lotId,
        lease_id: leaseId,
        tenant_id: tenantId,
        tenant_group_id: tenantGroupId,
        candidate_id: candidateId,
        file_name: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        file_type: file.type,
        category,
        title: title || file.name,
        description,
        tags
      })
      .select()
      .single()

    if (documentError) {
      // Supprimer le fichier du storage en cas d'erreur
      await supabase.storage.from(STORAGE_BUCKET).remove([uploadData.path])
      throw documentError
    }

    return { data: documentData, error: null }
  } catch (error) {
    console.error('Erreur upload document:', error)
    return { data: null, error }
  }
}

/**
 * Récupère tous les documents avec filtres optionnels
 */
export const getDocuments = async ({
  entityId = null,
  propertyId = null,
  lotId = null,
  leaseId = null,
  tenantId = null,
  tenantGroupId = null,
  candidateId = null,
  category = null,
  tags = null,
  searchQuery = null
}) => {
  try {
    let query = supabase
      .from('documents')
      .select(`
        *,
        entity:entities(id, name),
        property:properties_new(id, name),
        lot:lots(id, name),
        lease:leases(id, start_date, end_date),
        tenant:tenants(id, first_name, last_name)
      `)
      .order('uploaded_at', { ascending: false })

    // Filtres
    if (entityId) query = query.eq('entity_id', entityId)
    if (propertyId) query = query.eq('property_id', propertyId)
    if (lotId) query = query.eq('lot_id', lotId)
    if (leaseId) query = query.eq('lease_id', leaseId)
    if (tenantId) query = query.eq('tenant_id', tenantId)
    if (tenantGroupId) query = query.eq('tenant_group_id', tenantGroupId)
    if (candidateId) query = query.eq('candidate_id', candidateId)
    if (category) query = query.eq('category', category)
    if (tags && tags.length > 0) {
      query = query.contains('tags', tags)
    }

    // Recherche full-text (si implémentée côté SQL)
    if (searchQuery) {
      query = query.textSearch('search_vector', searchQuery, {
        type: 'websearch',
        config: 'french'
      })
    }

    const { data, error } = await query

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Erreur récupération documents:', error)
    return { data: null, error }
  }
}

/**
 * Récupère un document par ID
 */
export const getDocumentById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        entity:entities(id, name),
        property:properties_new(id, name),
        lot:lots(id, name),
        lease:leases(id, start_date, end_date),
        tenant:tenants(id, first_name, last_name)
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Erreur récupération document:', error)
    return { data: null, error }
  }
}

/**
 * Met à jour les métadonnées d'un document
 */
export const updateDocument = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Erreur mise à jour document:', error)
    return { data: null, error }
  }
}

/**
 * Supprime un document (fichier + entrée base de données)
 */
export const deleteDocument = async (id) => {
  try {
    // Récupérer le document pour obtenir le file_path
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('file_path')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    // Supprimer le fichier du storage
    const { error: storageError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([document.file_path])

    if (storageError) {
      console.warn('Erreur suppression fichier storage:', storageError)
      // Continuer quand même la suppression de l'entrée DB
    }

    // Supprimer l'entrée de la base de données
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError

    return { error: null }
  } catch (error) {
    console.error('Erreur suppression document:', error)
    return { error }
  }
}

/**
 * Obtient l'URL publique d'un document pour prévisualisation/téléchargement
 */
export const getDocumentUrl = (filePath) => {
  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath)

  return data.publicUrl
}

/**
 * Télécharge un document
 */
export const downloadDocument = async (filePath, fileName) => {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(filePath)

    if (error) throw error

    // Créer un lien de téléchargement
    const url = window.URL.createObjectURL(data)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    return { error: null }
  } catch (error) {
    console.error('Erreur téléchargement document:', error)
    return { error }
  }
}

/**
 * Obtient les statistiques des documents
 */
export const getDocumentStats = async (entityId = null) => {
  try {
    let query = supabase
      .from('documents')
      .select('id, category, file_size')

    if (entityId) {
      query = query.eq('entity_id', entityId)
    }

    const { data, error } = await query

    if (error) throw error

    // Calculer les stats
    const stats = {
      total: data.length,
      byCategory: {},
      totalSize: 0
    }

    data.forEach(doc => {
      stats.byCategory[doc.category] = (stats.byCategory[doc.category] || 0) + 1
      stats.totalSize += doc.file_size || 0
    })

    return { data: stats, error: null }
  } catch (error) {
    console.error('Erreur récupération stats documents:', error)
    return { data: null, error }
  }
}

export default {
  DOCUMENT_CATEGORIES,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  validateFile,
  formatFileSize,
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getDocumentUrl,
  downloadDocument,
  getDocumentStats
}
