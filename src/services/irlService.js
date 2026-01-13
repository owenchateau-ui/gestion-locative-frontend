import { supabase } from '../lib/supabase'

/**
 * Service pour la gestion de l'indexation des loyers (IRL)
 */

// Debug mode - only log in development
const DEBUG = import.meta.env.MODE === 'development'
const log = (...args) => DEBUG && console.log(...args)
const warn = (...args) => DEBUG && console.warn(...args)
const error = (...args) => DEBUG && console.error(...args)

/**
 * Retourne le trimestre (1-4) correspondant à une date
 * @param {Date} date - La date à analyser
 * @returns {number} Le trimestre (1 = Jan-Mar, 2 = Apr-Jun, 3 = Jul-Sep, 4 = Oct-Dec)
 */
const getQuarterFromDate = (date) => {
  const month = date.getMonth() // 0-11
  return Math.floor(month / 3) + 1
}

/**
 * Récupère tous les indices IRL
 */
export const getIRLIndices = async () => {
  const { data, error } = await supabase
    .from('irl_indices')
    .select('*')
    .order('year', { ascending: false })
    .order('quarter', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Récupère un indice IRL spécifique
 */
export const getIRLIndex = async (year, quarter) => {
  log(`[IRL] Recherche IRL pour T${quarter} ${year}`)

  const { data, error: err } = await supabase
    .from('irl_indices')
    .select('*')
    .eq('year', year)
    .eq('quarter', quarter)
    .limit(1)

  if (err) {
    error(`[IRL] Erreur lors de la récupération de l'IRL T${quarter} ${year}:`, err)
    throw err
  }

  if (!data || data.length === 0) {
    warn(`[IRL] Aucun indice IRL trouvé pour T${quarter} ${year}`)
    return null
  }

  log(`[IRL] IRL trouvé pour T${quarter} ${year}:`, data[0].value)
  return data[0]
}

/**
 * Récupère l'IRL pour une date donnée
 * Si l'IRL exact n'existe pas, retourne le dernier IRL disponible avec une indication
 * @param {Date|string} date - Date pour laquelle chercher l'IRL
 * @returns {Object} { irl: {...}, estimated: boolean, quarter, year }
 */
export const getIRLForDate = async (date) => {
  const targetDate = new Date(date)
  const month = targetDate.getMonth() + 1
  const year = targetDate.getFullYear()

  // Déterminer le trimestre
  let quarter
  if (month <= 3) quarter = 1
  else if (month <= 6) quarter = 2
  else if (month <= 9) quarter = 3
  else quarter = 4

  log(`[IRL] Recherche IRL pour date ${date} → T${quarter} ${year}`)

  // Essayer de trouver l'IRL exact
  const exactIRL = await getIRLIndex(year, quarter)

  if (exactIRL) {
    return {
      irl: exactIRL,
      estimated: false,
      quarter,
      year,
      label: `T${quarter} ${year}`
    }
  }

  // Si pas trouvé, prendre le dernier IRL disponible
  log(`[IRL] IRL T${quarter} ${year} non trouvé, recherche du dernier IRL disponible...`)

  const { data: lastIRL, error: err } = await supabase
    .from('irl_indices')
    .select('*')
    .order('year', { ascending: false })
    .order('quarter', { ascending: false })
    .limit(1)

  if (err) {
    error('[IRL] Erreur lors de la récupération du dernier IRL:', err)
    throw err
  }

  if (lastIRL && lastIRL.length > 0) {
    log(`[IRL] Dernier IRL disponible: T${lastIRL[0].quarter} ${lastIRL[0].year}`)
    return {
      irl: lastIRL[0],
      estimated: true,
      quarter,
      year,
      label: `T${quarter} ${year}`,
      estimatedFrom: `T${lastIRL[0].quarter} ${lastIRL[0].year}`
    }
  }

  warn('[IRL] Aucun IRL disponible dans la base de données')
  return null
}

/**
 * Récupère les baux éligibles à l'indexation
 * Un bail est éligible si :
 * - indexation_enabled = true
 * - status = 'active'
 * - La date anniversaire est dans les N prochains jours
 * - last_indexation_date est null OU date anniversaire > last_indexation_date
 */
export const getLeasesPendingIndexation = async (userId, daysAhead = 60, selectedEntity = null) => {
  try {
    log('[IRL] Récupération des baux à indexer...')

    // Récupérer l'ID utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('supabase_uid', userId)
      .limit(1)

    if (userError) throw userError
    if (!userData || userData.length === 0) {
      error('[IRL] Utilisateur non trouvé')
      return []
    }

    const userDbId = userData[0].id

    // Calculer les dates
    const today = new Date()
    const futureDate = new Date()
    futureDate.setDate(today.getDate() + daysAhead)

    // Query de base
    let query = supabase
      .from('leases')
      .select(`
        *,
        lot:lots!inner(
          id,
          name,
          properties_new!inner(id, name, entity_id, entities!inner(id, name, user_id))
        ),
        tenant:tenants!inner(id, first_name, last_name, email)
      `)
      .eq('lot.properties_new.entities.user_id', userDbId)
      .eq('status', 'active')
      .eq('indexation_enabled', true)

    // Filtre entité si applicable
    if (selectedEntity) {
      query = query.eq('lot.properties_new.entity_id', selectedEntity)
    }

    const { data: leases, error: leasesError } = await query

    if (leasesError) throw leasesError

    // Filtrer les baux dont la date anniversaire arrive
    const eligibleLeases = []

    for (const lease of leases) {
      const startDate = new Date(lease.start_date)
      const anniversaryDate = getNextAnniversaryDate(startDate)

      // Vérifier si l'anniversaire est dans la fenêtre
      if (anniversaryDate >= today && anniversaryDate <= futureDate) {
        // Vérifier si indexation déjà faite cette année
        const lastIndexation = lease.last_indexation_date ? new Date(lease.last_indexation_date) : null

        if (!lastIndexation || lastIndexation < anniversaryDate) {
          // Calculer le nouveau loyer
          const calculation = await calculateIndexation(lease)

          if (calculation) {
            eligibleLeases.push({
              ...lease,
              anniversaryDate: anniversaryDate.toISOString().split('T')[0],
              daysUntilAnniversary: Math.ceil((anniversaryDate - today) / (1000 * 60 * 60 * 24)),
              indexationCalculation: calculation
            })
          }
        }
      }
    }

    // Trier par date anniversaire (plus proche en premier)
    return eligibleLeases.sort((a, b) =>
      new Date(a.anniversaryDate) - new Date(b.anniversaryDate)
    )
  } catch (err) {
    error('Error fetching leases pending indexation:', err)
    throw err
  }
}

/**
 * Calcule la prochaine date anniversaire du bail
 */
const getNextAnniversaryDate = (startDate) => {
  const today = new Date()
  const anniversary = new Date(startDate)
  anniversary.setFullYear(today.getFullYear())

  // Si l'anniversaire de cette année est déjà passé, prendre celui de l'année prochaine
  if (anniversary < today) {
    anniversary.setFullYear(today.getFullYear() + 1)
  }

  return anniversary
}

/**
 * Calcule l'indexation pour un bail donné
 */
export const calculateIndexation = async (lease) => {
  try {
    // Vérifier que le bail a les infos nécessaires
    if (!lease.irl_reference_year || !lease.irl_reference_quarter) {
      return null
    }

    // Récupérer l'ancien IRL (référence du bail)
    const oldIRL = await getIRLIndex(lease.irl_reference_year, lease.irl_reference_quarter)

    if (!oldIRL) {
      error('Ancien IRL introuvable:', lease.irl_reference_year, lease.irl_reference_quarter)
      return null
    }

    // Calculer le trimestre de référence actuel (même trimestre, année suivante)
    const startDate = new Date(lease.start_date)
    const today = new Date()
    const yearsSinceStart = today.getFullYear() - startDate.getFullYear()
    const newYear = lease.irl_reference_year + yearsSinceStart
    const newQuarter = lease.irl_reference_quarter

    // Récupérer le nouvel IRL
    const newIRL = await getIRLIndex(newYear, newQuarter)

    if (!newIRL) {
      error('Nouvel IRL introuvable:', newYear, newQuarter)
      return null
    }

    // Calculer le nouveau loyer
    const currentRent = parseFloat(lease.rent_amount)
    const newRent = currentRent * (parseFloat(newIRL.value) / parseFloat(oldIRL.value))
    const increasePercentage = ((newRent - currentRent) / currentRent) * 100

    return {
      oldRent: currentRent,
      newRent: Math.round(newRent * 100) / 100, // Arrondir à 2 décimales
      oldIRLValue: parseFloat(oldIRL.value),
      newIRLValue: parseFloat(newIRL.value),
      oldIRLQuarter: `T${oldIRL.quarter} ${oldIRL.year}`,
      newIRLQuarter: `T${newIRL.quarter} ${newIRL.year}`,
      increasePercentage: Math.round(increasePercentage * 100) / 100
    }
  } catch (err) {
    error('Error calculating indexation:', err)
    return null
  }
}

/**
 * Applique l'indexation à un bail
 */
export const applyIndexation = async (leaseId, calculation) => {
  try {
    log(`[IRL] Application de l'indexation pour le bail ${leaseId}`)

    // Mettre à jour le bail
    const { data: lease, error: updateError } = await supabase
      .from('leases')
      .update({
        rent_amount: calculation.newRent,
        last_indexation_date: new Date().toISOString().split('T')[0],
        // Mettre à jour la référence IRL pour l'année suivante
        irl_reference_year: parseInt(calculation.newIRLQuarter.split(' ')[1]),
        irl_reference_quarter: parseInt(calculation.newIRLQuarter.charAt(1))
      })
      .eq('id', leaseId)
      .select()
      .limit(1)

    if (updateError) throw updateError
    if (!lease || lease.length === 0) {
      throw new Error('Bail non trouvé')
    }

    log(`[IRL] Indexation appliquée avec succès. Nouveau loyer: ${calculation.newRent} €`)

    // Créer l'entrée dans l'historique
    const { error: historyError } = await supabase
      .from('indexation_history')
      .insert([{
        lease_id: leaseId,
        old_rent: calculation.oldRent,
        new_rent: calculation.newRent,
        old_irl_value: calculation.oldIRLValue,
        new_irl_value: calculation.newIRLValue,
        old_irl_quarter: calculation.oldIRLQuarter,
        new_irl_quarter: calculation.newIRLQuarter,
        increase_percentage: calculation.increasePercentage,
        applied_at: new Date().toISOString().split('T')[0]
      }])

    if (historyError) throw historyError

    return lease[0]
  } catch (err) {
    error('[IRL] Erreur lors de l\'application de l\'indexation:', err)
    throw err
  }
}

/**
 * Marque une lettre d'indexation comme générée
 */
export const markLetterGenerated = async (leaseId) => {
  try {
    log(`[IRL] Marquage de la lettre comme générée pour le bail ${leaseId}`)

    // Récupérer la dernière indexation pour ce bail
    const { data: history, error: fetchError } = await supabase
      .from('indexation_history')
      .select('*')
      .eq('lease_id', leaseId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (fetchError) throw fetchError
    if (!history || history.length === 0) {
      warn(`[IRL] Aucun historique d'indexation trouvé pour le bail ${leaseId}`)
      return false
    }

    // Mettre à jour letter_generated
    const { error: updateError } = await supabase
      .from('indexation_history')
      .update({ letter_generated: true })
      .eq('id', history[0].id)

    if (updateError) throw updateError

    log('[IRL] Lettre marquée comme générée')
    return true
  } catch (err) {
    error('[IRL] Erreur lors du marquage de la lettre:', err)
    throw err
  }
}

/**
 * Récupère l'historique des indexations
 */
export const getIndexationHistory = async (userId, selectedEntity = null) => {
  try {
    log('[IRL] Récupération de l\'historique des indexations...')

    // Récupérer l'ID utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('supabase_uid', userId)
      .limit(1)

    if (userError) throw userError
    if (!userData || userData.length === 0) {
      error('[IRL] Utilisateur non trouvé')
      return []
    }

    const userDbId = userData[0].id

    // Query de base
    let query = supabase
      .from('indexation_history')
      .select(`
        *,
        lease:leases!inner(
          lot:lots!inner(
            id,
            name,
            properties_new!inner(id, name, entity_id, entities!inner(id, name, user_id))
          ),
          tenant:tenants!inner(id, first_name, last_name)
        )
      `)
      .eq('lease.lot.properties_new.entities.user_id', userDbId)
      .order('applied_at', { ascending: false })

    // Filtre entité si applicable
    if (selectedEntity) {
      query = query.eq('lease.lot.properties_new.entity_id', selectedEntity)
    }

    const { data, error: err } = await query

    if (err) throw err

    log(`[IRL] ${data?.length || 0} indexations trouvées dans l'historique`)
    return data || []
  } catch (err) {
    error('Error fetching indexation history:', err)
    throw err
  }
}

/**
 * Formatte un trimestre en chaîne lisible
 */
export const formatQuarter = (quarter, year) => {
  return `T${quarter} ${year}`
}

/**
 * Récupère les trimestres disponibles pour un select
 */
export const getAvailableQuarters = () => {
  const currentYear = new Date().getFullYear()
  const quarters = []

  // Générer les 8 derniers trimestres (2 ans)
  for (let i = 0; i < 8; i++) {
    const year = currentYear - Math.floor(i / 4)
    const quarter = 4 - (i % 4)
    quarters.push({ year, quarter, label: `T${quarter} ${year}` })
  }

  return quarters
}

/**
 * Ajoute un nouvel indice IRL dans la base de données
 * @param {number} year - Année de l'IRL
 * @param {number} quarter - Trimestre (1-4)
 * @param {number} value - Valeur de l'IRL
 * @returns {Object} L'IRL créé
 */
export const addIRLIndex = async (year, quarter, value) => {
  try {
    log(`[IRL] Ajout d'un nouvel IRL : T${quarter} ${year} = ${value}`)

    // Vérifier si l'IRL existe déjà
    const existing = await getIRLIndex(year, quarter)
    if (existing) {
      throw new Error(`Un IRL existe déjà pour T${quarter} ${year}`)
    }

    // Insérer le nouvel IRL
    const { data, error: err } = await supabase
      .from('irl_indices')
      .insert([{
        year: parseInt(year),
        quarter: parseInt(quarter),
        value: parseFloat(value)
      }])
      .select()
      .limit(1)

    if (err) throw err
    if (!data || data.length === 0) {
      throw new Error('Erreur lors de la création de l\'IRL')
    }

    log(`[IRL] IRL T${quarter} ${year} créé avec succès`)
    return data[0]
  } catch (err) {
    error('[IRL] Erreur lors de l\'ajout de l\'IRL:', err)
    throw err
  }
}

/**
 * Supprime un indice IRL
 * @param {string} id - ID de l'IRL à supprimer
 */
export const deleteIRLIndex = async (id) => {
  try {
    log(`[IRL] Suppression de l'IRL ${id}`)

    const { error: err } = await supabase
      .from('irl_indices')
      .delete()
      .eq('id', id)

    if (err) throw err

    log(`[IRL] IRL ${id} supprimé avec succès`)
  } catch (err) {
    error('[IRL] Erreur lors de la suppression de l\'IRL:', err)
    throw err
  }
}

/**
 * Récupère tous les baux indexables (actifs avec indexation activée)
 */
export const getAllIndexableLeases = async (userId, selectedEntity = null) => {
  try {
    log('[IRL] Récupération de tous les baux indexables...')

    // Récupérer l'ID utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('supabase_uid', userId)
      .limit(1)

    if (userError) throw userError
    if (!userData || userData.length === 0) {
      error('[IRL] Utilisateur non trouvé')
      return []
    }

    const userDbId = userData[0].id

    // Query de base
    let query = supabase
      .from('leases')
      .select(`
        *,
        lot:lots!inner(
          id,
          name,
          properties_new!inner(id, name, entity_id, entities!inner(id, name, user_id))
        ),
        tenant:tenants!inner(id, first_name, last_name, email)
      `)
      .eq('lot.properties_new.entities.user_id', userDbId)
      .eq('status', 'active')
      .eq('indexation_enabled', true)

    // Filtre entité si applicable
    if (selectedEntity) {
      query = query.eq('lot.properties_new.entity_id', selectedEntity)
    }

    const { data: leases, error: leasesError } = await query

    if (leasesError) throw leasesError

    // Calculer les informations pour chaque bail
    const leasesWithInfo = []

    for (const lease of leases) {
      const startDate = new Date(lease.start_date)
      const today = new Date()

      // Calculer la prochaine date anniversaire
      const anniversaryDate = getNextAnniversaryDate(startDate)
      const daysUntilAnniversary = Math.ceil((anniversaryDate - today) / (1000 * 60 * 60 * 24))

      // Calculer le trimestre de référence actuel
      const referenceQuarter = lease.irl_reference_quarter || getQuarterFromDate(startDate)
      const referenceYear = lease.irl_reference_year || startDate.getFullYear()

      // Récupérer l'IRL de référence
      const oldIRL = await getIRLIndex(referenceYear, referenceQuarter)

      // Récupérer le nouvel IRL pour la date anniversaire (avec estimation si nécessaire)
      const newIRLData = await getIRLForDate(anniversaryDate)

      let indexationCalculation = null
      if (oldIRL && newIRLData) {
        const currentRent = parseFloat(lease.rent_amount)
        const newRent = Math.round(currentRent * (parseFloat(newIRLData.irl.value) / parseFloat(oldIRL.value)) * 100) / 100
        const increasePercentage = Math.round(((newRent - currentRent) / currentRent) * 10000) / 100

        indexationCalculation = {
          oldRent: currentRent,
          newRent: newRent,
          oldIRLValue: parseFloat(oldIRL.value),
          newIRLValue: parseFloat(newIRLData.irl.value),
          oldIRLQuarter: `T${oldIRL.quarter} ${oldIRL.year}`,
          newIRLQuarter: newIRLData.label,
          newIRLEstimated: newIRLData.estimated,
          newIRLEstimatedFrom: newIRLData.estimatedFrom,
          increasePercentage: increasePercentage
        }
      }

      leasesWithInfo.push({
        ...lease,
        anniversaryDate: anniversaryDate.toISOString().split('T')[0],
        daysUntilAnniversary: daysUntilAnniversary,
        referenceQuarter: referenceQuarter,
        referenceYear: referenceYear,
        indexationCalculation: indexationCalculation
      })
    }

    // Trier par date anniversaire (plus proche en premier)
    return leasesWithInfo.sort((a, b) =>
      new Date(a.anniversaryDate) - new Date(b.anniversaryDate)
    )
  } catch (err) {
    error('Error fetching all indexable leases:', err)
    throw err
  }
}
