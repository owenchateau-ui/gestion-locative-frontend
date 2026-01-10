import { supabase } from '../lib/supabase'

// Types de groupes (doit correspondre à l'ENUM SQL)
export const GROUP_TYPES = {
  individual: 'Individuel',
  couple: 'Couple',
  colocation: 'Colocation'  // Added to match SQL ENUM
}

// Statuts de couple (doit correspondre à l'ENUM SQL)
export const COUPLE_STATUS = {
  married: 'Mariés',
  pacs: 'Pacsés',
  concubinage: 'Concubinage'  // Changed from 'cohabiting' to match SQL ENUM
}

// Créer un groupe de locataires avec ses locataires
export const createTenantGroup = async (groupData) => {
  const { entity_id, name, group_type, couple_status, tenants } = groupData

  // Validation
  if (!entity_id) {
    throw new Error('entity_id est obligatoire')
  }
  if (!name || !name.trim()) {
    throw new Error('Le nom du groupe est obligatoire')
  }
  if (!tenants || tenants.length === 0) {
    throw new Error('Au moins un locataire est requis')
  }

  // 1. Créer le groupe
  const { data: group, error: groupError } = await supabase
    .from('tenant_groups')
    .insert({
      entity_id,
      name,
      group_type: group_type || 'individual',
      couple_status: group_type === 'couple' ? couple_status : null
    })
    .select()
    .single()

  if (groupError) {
    // Messages d'erreur personnalisés
    if (groupError.message?.includes('entity_id')) {
      throw new Error('Erreur de configuration : veuillez exécuter le script SQL FIX_add_entity_id.sql dans Supabase')
    }
    throw new Error(groupError.message || 'Erreur lors de la création du groupe de locataires')
  }

  // 2. Créer les locataires associés
  const tenantsToInsert = tenants.map(tenant => ({
    group_id: group.id,
    entity_id,
    first_name: tenant.first_name,
    last_name: tenant.last_name,
    email: tenant.email,
    phone: tenant.phone || null,
    birth_date: tenant.birth_date || null,
    birth_place: tenant.birth_place || null,
    is_main_tenant: tenant.is_main_tenant || false,
    relationship: tenant.relationship || null,
    professional_status: tenant.professional_status || null,
    employer_name: tenant.employer_name || null,
    job_title: tenant.job_title || null,
    contract_type: tenant.contract_type || null,
    employment_start_date: tenant.employment_start_date || null,
    monthly_income: parseFloat(tenant.monthly_income) || 0,
    other_income: parseFloat(tenant.other_income) || 0
  }))

  const { data: insertedTenants, error: tenantsError } = await supabase
    .from('tenants')
    .insert(tenantsToInsert)
    .select()

  if (tenantsError) {
    // Rollback: supprimer le groupe si l'insertion des locataires échoue
    await supabase.from('tenant_groups').delete().eq('id', group.id)

    // Messages d'erreur personnalisés
    if (tenantsError.message?.includes('birth_date') || tenantsError.message?.includes('schema cache')) {
      throw new Error('Erreur de configuration : veuillez exécuter le script SQL FIX_tenants_columns.sql dans Supabase')
    }
    if (tenantsError.message?.includes('landlord_id')) {
      throw new Error('Erreur de configuration : veuillez exécuter le script SQL FIX_landlord_id_nullable.sql dans Supabase')
    }
    if (tenantsError.message?.includes('group_id')) {
      throw new Error('Erreur de configuration : la table tenants n\'est pas correctement configurée')
    }

    throw new Error(tenantsError.message || 'Erreur lors de la création des locataires')
  }

  return {
    ...group,
    tenants: insertedTenants
  }
}

// Récupérer un groupe avec ses locataires et bail
export const getTenantGroupById = async (id) => {
  const { data: group, error } = await supabase
    .from('tenant_groups')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error

  // Récupérer les locataires du groupe
  const { data: tenants, error: tenantsError } = await supabase
    .from('tenants')
    .select('*')
    .eq('group_id', id)
    .order('is_main_tenant', { ascending: false })

  if (tenantsError) throw tenantsError

  // Récupérer le bail actif (via le locataire principal)
  const mainTenant = tenants?.find(t => t.is_main_tenant)
  let lease = null

  if (mainTenant) {
    const { data: leaseData } = await supabase
      .from('leases')
      .select(`
        *,
        lot:lots(
          id,
          name,
          rent_amount,
          charges_amount,
          property:properties_new(
            id,
            name
          )
        )
      `)
      .eq('tenant_id', mainTenant.id)
      .eq('status', 'active')
      .maybeSingle()

    lease = leaseData
  }

  return {
    ...group,
    tenants: tenants || [],
    lease
  }
}

// Récupérer tous les groupes avec filtrage optionnel par entité
export const getAllTenantGroups = async (entityId = null) => {
  let query = supabase
    .from('tenant_groups')
    .select(`
      *,
      housing_assistance,
      tenants!group_id (
        id,
        first_name,
        last_name,
        email,
        phone,
        is_main_tenant,
        monthly_income,
        other_income
      )
    `)

  // Filtrer par entité si spécifié
  if (entityId) {
    query = query.eq('entity_id', entityId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error

  // Enrichir chaque groupe avec son bail actif
  const groupsWithLeases = await Promise.all(
    (data || []).map(async (group) => {
      const mainTenant = group.tenants?.find(t => t.is_main_tenant)

      if (!mainTenant) {
        return { ...group, lease: null }
      }

      const { data: leaseData } = await supabase
        .from('leases')
        .select(`
          id,
          status,
          start_date,
          end_date,
          rent_amount,
          charges_amount,
          lot:lots(
            id,
            name
          )
        `)
        .eq('tenant_id', mainTenant.id)
        .eq('status', 'active')
        .maybeSingle()

      return { ...group, lease: leaseData }
    })
  )

  return groupsWithLeases
}

// Mettre à jour un groupe et ses locataires
export const updateTenantGroup = async (id, groupData) => {
  const { name, group_type, couple_status, tenants } = groupData

  // 1. Mettre à jour le groupe
  const { data: updatedGroup, error: groupError } = await supabase
    .from('tenant_groups')
    .update({
      name,
      group_type,
      couple_status: group_type === 'couple' ? couple_status : null
    })
    .eq('id', id)
    .select()
    .single()

  if (groupError) throw groupError

  // 2. Si des locataires sont fournis, les mettre à jour
  if (tenants && tenants.length > 0) {
    // Récupérer les locataires existants
    const { data: existingTenants } = await supabase
      .from('tenants')
      .select('id')
      .eq('group_id', id)

    const existingIds = new Set(existingTenants?.map(t => t.id) || [])

    // Séparer les locataires à créer, mettre à jour et supprimer
    const toUpdate = []
    const toCreate = []
    const providedIds = new Set()

    for (const tenant of tenants) {
      if (tenant.id && existingIds.has(tenant.id)) {
        // Mise à jour
        toUpdate.push(tenant)
        providedIds.add(tenant.id)
      } else {
        // Création
        toCreate.push(tenant)
      }
    }

    // Locataires à supprimer (présents en BDD mais pas dans la requête)
    const toDeleteIds = [...existingIds].filter(id => !providedIds.has(id))

    // Exécuter les opérations
    // Créer
    if (toCreate.length > 0) {
      const tenantsToInsert = toCreate.map(tenant => ({
        group_id: id,
        entity_id: updatedGroup.entity_id,
        first_name: tenant.first_name,
        last_name: tenant.last_name,
        email: tenant.email,
        phone: tenant.phone || null,
        birth_date: tenant.birth_date || null,
        birth_place: tenant.birth_place || null,
        is_main_tenant: tenant.is_main_tenant || false,
        relationship: tenant.relationship || null,
        professional_status: tenant.professional_status || null,
        employer_name: tenant.employer_name || null,
        job_title: tenant.job_title || null,
        contract_type: tenant.contract_type || null,
        employment_start_date: tenant.employment_start_date || null,
        monthly_income: parseFloat(tenant.monthly_income) || 0,
        other_income: parseFloat(tenant.other_income) || 0
      }))

      const { error: insertError } = await supabase.from('tenants').insert(tenantsToInsert)

      if (insertError) {
        // Messages d'erreur personnalisés
        if (insertError.message?.includes('birth_date') || insertError.message?.includes('schema cache')) {
          throw new Error('Erreur de configuration : veuillez exécuter le script SQL FIX_tenants_columns.sql dans Supabase')
        }
        if (insertError.message?.includes('landlord_id')) {
          throw new Error('Erreur de configuration : veuillez exécuter le script SQL FIX_landlord_id_nullable.sql dans Supabase')
        }
        throw new Error(insertError.message || 'Erreur lors de l\'ajout des locataires')
      }
    }

    // Mettre à jour
    for (const tenant of toUpdate) {
      await supabase
        .from('tenants')
        .update({
          first_name: tenant.first_name,
          last_name: tenant.last_name,
          email: tenant.email,
          phone: tenant.phone || null,
          birth_date: tenant.birth_date || null,
          birth_place: tenant.birth_place || null,
          is_main_tenant: tenant.is_main_tenant || false,
          relationship: tenant.relationship || null,
          professional_status: tenant.professional_status || null,
          employer_name: tenant.employer_name || null,
          job_title: tenant.job_title || null,
          contract_type: tenant.contract_type || null,
          employment_start_date: tenant.employment_start_date || null,
          monthly_income: parseFloat(tenant.monthly_income) || 0,
          other_income: parseFloat(tenant.other_income) || 0
        })
        .eq('id', tenant.id)
    }

    // Supprimer
    if (toDeleteIds.length > 0) {
      await supabase
        .from('tenants')
        .delete()
        .in('id', toDeleteIds)
    }
  }

  // Retourner le groupe avec ses locataires mis à jour
  return await getTenantGroupById(id)
}

// Supprimer un groupe
export const deleteTenantGroup = async (id) => {
  const { error } = await supabase
    .from('tenant_groups')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Générer le nom du groupe automatiquement
export const generateGroupName = (tenants) => {
  if (!tenants || tenants.length === 0) return 'Nouveau groupe'
  if (tenants.length === 1) {
    return `${tenants[0].first_name} ${tenants[0].last_name}`
  }
  // Pour un couple
  const mainTenant = tenants.find(t => t.is_main_tenant) || tenants[0]
  const otherTenant = tenants.find(t => !t.is_main_tenant) || tenants[1]

  if (mainTenant.last_name === otherTenant?.last_name) {
    return `M. et Mme ${mainTenant.last_name}`
  }
  return `${mainTenant.last_name} & ${otherTenant?.last_name || ''}`
}

// Calculer les revenus totaux du groupe
export const calculateGroupIncome = (tenants) => {
  return tenants.reduce((total, tenant) => {
    return total + (parseFloat(tenant.monthly_income) || 0) + (parseFloat(tenant.other_income) || 0)
  }, 0)
}
