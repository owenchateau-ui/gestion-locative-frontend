import { supabase } from '../lib/supabase'

// Types de garanties
export const GUARANTEE_TYPES = {
  physical_person: {
    label: 'Garant physique',
    description: 'Une personne (parent, ami, employeur) se porte caution',
    icon: 'User',
    requiresDetails: true,
    cost: 'Gratuit'
  },
  visale: {
    label: 'Garantie Visale',
    description: 'Garantie gratuite Action Logement (< 30 ans ou conditions)',
    icon: 'Shield',
    requiresDetails: false,
    cost: 'Gratuit',
    website: 'https://www.visale.fr'
  },
  garantme: {
    label: 'GarantMe',
    description: 'Organisme de cautionnement privé',
    icon: 'Building',
    requiresDetails: true,
    cost: '~3-4% loyer/an',
    website: 'https://garantme.fr'
  },
  cautioneo: {
    label: 'Cautioneo',
    description: 'Organisme de cautionnement privé',
    icon: 'Building',
    requiresDetails: true,
    cost: '~2.9% loyer/an',
    website: 'https://www.cautioneo.com'
  },
  smartgarant: {
    label: 'SmartGarant',
    description: 'Organisme de cautionnement privé',
    icon: 'Building',
    requiresDetails: true,
    cost: '~3.5% loyer/an',
    website: 'https://www.smartgarant.com'
  },
  unkle: {
    label: 'Unkle',
    description: 'Organisme de cautionnement privé',
    icon: 'Building',
    requiresDetails: true,
    cost: '~3.5% loyer/an',
    website: 'https://www.unkle.fr'
  },
  gli: {
    label: 'GLI (Assurance propriétaire)',
    description: 'Garantie Loyers Impayés souscrite par le propriétaire',
    icon: 'FileCheck',
    requiresDetails: false,
    cost: 'Payé par le propriétaire'
  },
  bank_guarantee: {
    label: 'Caution bancaire',
    description: 'Somme bloquée en banque (6-12 mois de loyer)',
    icon: 'Landmark',
    requiresDetails: true,
    cost: 'Variable'
  },
  other: {
    label: 'Autre organisme',
    description: 'Autre type de garantie',
    icon: 'HelpCircle',
    requiresDetails: true,
    cost: 'Variable'
  }
}

// Relations avec le garant
export const GUARANTOR_RELATIONSHIPS = {
  parent: 'Parent',
  family: 'Autre membre de la famille',
  employer: 'Employeur',
  friend: 'Ami',
  other: 'Autre'
}

// Créer une garantie
export const createGuarantee = async (guaranteeData) => {
  const { data, error } = await supabase
    .from('guarantees')
    .insert(guaranteeData)
    .select()
    .single()

  if (error) throw error
  return data
}

// Récupérer les garanties d'un candidat
export const getGuaranteesByCandidate = async (candidateId) => {
  const { data, error } = await supabase
    .from('guarantees')
    .select('*')
    .eq('candidate_id', candidateId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

// Récupérer les garanties d'un locataire
export const getGuaranteesByTenant = async (tenantId) => {
  const { data, error } = await supabase
    .from('guarantees')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

// Mettre à jour une garantie
export const updateGuarantee = async (id, guaranteeData) => {
  const { data, error } = await supabase
    .from('guarantees')
    .update(guaranteeData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Supprimer une garantie
export const deleteGuarantee = async (id) => {
  const { error } = await supabase
    .from('guarantees')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Copier les garanties d'un candidat vers un locataire
export const copyGuaranteesToTenant = async (candidateId, tenantId) => {
  // Récupérer les garanties du candidat
  const guarantees = await getGuaranteesByCandidate(candidateId)

  // Créer les mêmes garanties pour le locataire
  const newGuarantees = []
  for (const guarantee of guarantees) {
    const { id, candidate_id, created_at, updated_at, ...guaranteeData } = guarantee
    const newGuarantee = await createGuarantee({
      ...guaranteeData,
      candidate_id: null,
      tenant_id: tenantId
    })
    newGuarantees.push(newGuarantee)
  }

  return newGuarantees
}

// Calculer le niveau de garantie
export const calculateGuaranteeLevel = (guarantees, totalRent) => {
  if (!guarantees || guarantees.length === 0) {
    return { level: 'none', label: 'Aucune garantie', color: 'red' }
  }

  const hasVisale = guarantees.some(g => g.guarantee_type === 'visale')
  const hasGLI = guarantees.some(g => g.guarantee_type === 'gli')
  const hasOrganism = guarantees.some(g =>
    ['garantme', 'cautioneo', 'smartgarant', 'unkle'].includes(g.guarantee_type)
  )
  const physicalGuarantors = guarantees.filter(g => g.guarantee_type === 'physical_person')
  const guarantorIncome = physicalGuarantors.reduce((sum, g) =>
    sum + (parseFloat(g.guarantor_monthly_income) || 0), 0
  )

  if (hasVisale || hasGLI) {
    return { level: 'excellent', label: 'Garantie excellente', color: 'green' }
  }

  if (hasOrganism) {
    return { level: 'very_good', label: 'Très bonne garantie', color: 'green' }
  }

  if (guarantorIncome >= totalRent * 3) {
    return { level: 'good', label: 'Bonne garantie', color: 'blue' }
  }

  if (physicalGuarantors.length > 0) {
    return { level: 'standard', label: 'Garantie standard', color: 'orange' }
  }

  return { level: 'weak', label: 'Garantie faible', color: 'red' }
}
