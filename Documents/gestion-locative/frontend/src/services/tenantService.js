import { supabase } from '../lib/supabase'

/**
 * Service pour la gestion des locataires individuels
 *
 * NOTE: Pour la gestion des groupes de locataires (individuel, couple, colocation),
 * utilisez tenantGroupService.js
 */

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

/**
 * Récupérer un locataire avec ses garanties et documents
 */
export const getTenantWithDetails = async (id) => {
  const { data: tenant, error } = await supabase
    .from('tenants')
    .select(`
      *,
      tenant_groups (*),
      guarantees (*),
      tenant_documents (*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return tenant
}

/**
 * Récupérer tous les locataires d'un groupe
 */
export const getTenantsByGroup = async (groupId) => {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('group_id', groupId)
    .order('is_main_tenant', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Upload un document pour un locataire
 */
export const uploadTenantDocument = async (tenantId, file, documentType, isShared = false) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${tenantId}/${documentType}-${Date.now()}.${fileExt}`

  // Upload dans Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('tenant-documents')
    .upload(fileName, file)

  if (uploadError) throw uploadError

  // Récupérer l'URL
  const { data: { publicUrl } } = supabase.storage
    .from('tenant-documents')
    .getPublicUrl(fileName)

  // Créer l'entrée en base
  const { data, error } = await supabase
    .from('tenant_documents')
    .insert({
      tenant_id: tenantId,
      document_type: documentType,
      file_name: file.name,
      file_url: publicUrl,
      file_size: file.size,
      mime_type: file.type,
      is_shared: isShared
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Récupérer les documents d'un locataire
 */
export const getTenantDocuments = async (tenantId) => {
  const { data, error } = await supabase
    .from('tenant_documents')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}
