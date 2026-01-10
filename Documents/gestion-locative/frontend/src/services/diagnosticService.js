/**
 * Service pour la gestion des diagnostics immobiliers
 * Conformité législation française
 */

import { supabase } from '../lib/supabase'
import {
  DIAGNOSTIC_TYPES,
  getExpirationStatus,
  calculateExpirationDate
} from '../constants/diagnosticConstants'

// =====================================================
// CRUD DIAGNOSTICS
// =====================================================

/**
 * Récupère tous les diagnostics avec filtres optionnels
 * @param {object} filters - Filtres { lotId, propertyId, entityId, type, expired }
 * @returns {Promise<Array>} Liste des diagnostics
 */
export const getAllDiagnostics = async (filters = {}) => {
  try {
    let query = supabase
      .from('diagnostics')
      .select(`
        *,
        lot:lots(
          id,
          name,
          property:properties_new(
            id,
            name,
            address,
            construction_year,
            entity:entities(
              id,
              name
            )
          )
        ),
        document:documents(
          id,
          file_name,
          file_path
        )
      `)
      .order('expiration_date', { ascending: true, nullsFirst: false })

    // Filtres
    if (filters.lotId) {
      query = query.eq('lot_id', filters.lotId)
    }

    if (filters.type) {
      query = query.eq('type', filters.type)
    }

    if (filters.expired === true) {
      query = query.lt('expiration_date', new Date().toISOString().split('T')[0])
    } else if (filters.expired === false) {
      query = query.or(`expiration_date.gte.${new Date().toISOString().split('T')[0]},expiration_date.is.null`)
    }

    const { data, error } = await query

    if (error) throw error

    // Filtrer côté client pour propertyId et entityId (nested filters)
    let result = data || []

    if (filters.propertyId) {
      result = result.filter(d => d.lot?.property?.id === filters.propertyId)
    }

    if (filters.entityId) {
      result = result.filter(d => d.lot?.property?.entity?.id === filters.entityId)
    }

    // Enrichir avec statut d'expiration
    return result.map(d => ({
      ...d,
      expirationStatus: getExpirationStatus(d.expiration_date)
    }))
  } catch (error) {
    console.error('Erreur getAllDiagnostics:', error)
    throw error
  }
}

/**
 * Récupère un diagnostic par son ID
 * @param {string} id - ID du diagnostic
 * @returns {Promise<object>} Diagnostic
 */
export const getDiagnosticById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('diagnostics')
      .select(`
        *,
        lot:lots(
          id,
          name,
          surface_area,
          property:properties_new(
            id,
            name,
            address,
            construction_year,
            entity:entities(
              id,
              name
            )
          )
        ),
        document:documents(
          id,
          file_name,
          file_path,
          file_type
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    return {
      ...data,
      expirationStatus: getExpirationStatus(data.expiration_date)
    }
  } catch (error) {
    console.error('Erreur getDiagnosticById:', error)
    throw error
  }
}

/**
 * Crée un nouveau diagnostic
 * @param {object} diagnosticData - Données du diagnostic
 * @returns {Promise<object>} Diagnostic créé
 */
export const createDiagnostic = async (diagnosticData) => {
  try {
    // Calculer la date d'expiration si non fournie
    let expirationDate = diagnosticData.expiration_date
    if (!expirationDate && diagnosticData.performed_date) {
      expirationDate = calculateExpirationDate(
        diagnosticData.type,
        diagnosticData.performed_date,
        diagnosticData.is_positive
      )
    }

    const { data, error } = await supabase
      .from('diagnostics')
      .insert({
        ...diagnosticData,
        expiration_date: expirationDate
      })
      .select(`
        *,
        lot:lots(id, name)
      `)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erreur createDiagnostic:', error)
    throw error
  }
}

/**
 * Met à jour un diagnostic
 * @param {string} id - ID du diagnostic
 * @param {object} updates - Données à mettre à jour
 * @returns {Promise<object>} Diagnostic mis à jour
 */
export const updateDiagnostic = async (id, updates) => {
  try {
    // Recalculer la date d'expiration si nécessaire
    if (updates.performed_date || updates.type || updates.is_positive !== undefined) {
      const current = await getDiagnosticById(id)
      const type = updates.type || current.type
      const performedDate = updates.performed_date || current.performed_date
      const isPositive = updates.is_positive !== undefined ? updates.is_positive : current.is_positive

      if (!updates.expiration_date) {
        updates.expiration_date = calculateExpirationDate(type, performedDate, isPositive)
      }
    }

    const { data, error } = await supabase
      .from('diagnostics')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erreur updateDiagnostic:', error)
    throw error
  }
}

/**
 * Supprime un diagnostic
 * @param {string} id - ID du diagnostic
 * @returns {Promise<void>}
 */
export const deleteDiagnostic = async (id) => {
  try {
    const { error } = await supabase
      .from('diagnostics')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Erreur deleteDiagnostic:', error)
    throw error
  }
}

// =====================================================
// FONCTIONS UTILITAIRES
// =====================================================

/**
 * Récupère les diagnostics d'un lot
 * @param {string} lotId - ID du lot
 * @returns {Promise<Array>} Diagnostics du lot
 */
export const getDiagnosticsByLot = async (lotId) => {
  return getAllDiagnostics({ lotId })
}

/**
 * Récupère les diagnostics expirés ou à expirer
 * @param {number} daysThreshold - Seuil en jours (défaut: 60)
 * @returns {Promise<Array>} Diagnostics expirés/à expirer
 */
export const getExpiringDiagnostics = async (daysThreshold = 60) => {
  try {
    const thresholdDate = new Date()
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold)

    const { data, error } = await supabase
      .from('diagnostics')
      .select(`
        *,
        lot:lots(
          id,
          name,
          property:properties_new(
            id,
            name,
            entity:entities(id, name)
          )
        )
      `)
      .not('expiration_date', 'is', null)
      .lte('expiration_date', thresholdDate.toISOString().split('T')[0])
      .order('expiration_date', { ascending: true })

    if (error) throw error

    return (data || []).map(d => ({
      ...d,
      expirationStatus: getExpirationStatus(d.expiration_date)
    }))
  } catch (error) {
    console.error('Erreur getExpiringDiagnostics:', error)
    throw error
  }
}

/**
 * Récupère le dernier diagnostic par type pour un lot
 * @param {string} lotId - ID du lot
 * @param {string} type - Type de diagnostic
 * @returns {Promise<object|null>} Dernier diagnostic ou null
 */
export const getLatestDiagnostic = async (lotId, type) => {
  try {
    const { data, error } = await supabase
      .from('diagnostics')
      .select('*')
      .eq('lot_id', lotId)
      .eq('type', type)
      .order('performed_date', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows

    return data ? {
      ...data,
      expirationStatus: getExpirationStatus(data.expiration_date)
    } : null
  } catch (error) {
    if (error.code === 'PGRST116') return null
    console.error('Erreur getLatestDiagnostic:', error)
    throw error
  }
}

/**
 * Vérifie la conformité des diagnostics d'un lot
 * @param {string} lotId - ID du lot
 * @param {number} constructionYear - Année de construction
 * @returns {Promise<object>} Statut de conformité
 */
export const checkLotCompliance = async (lotId, constructionYear) => {
  try {
    const diagnostics = await getDiagnosticsByLot(lotId)

    const compliance = {
      isCompliant: true,
      missing: [],
      expired: [],
      expiringSoon: [],
      valid: []
    }

    // Vérifier chaque type de diagnostic
    Object.entries(DIAGNOSTIC_TYPES).forEach(([type, info]) => {
      const diagnostic = diagnostics.find(d => d.type === type)
      const isRequired = info.mandatory ||
        (info.mandatoryBefore && constructionYear < info.mandatoryBefore)

      if (!isRequired) return

      if (!diagnostic) {
        compliance.missing.push({ type, info })
        compliance.isCompliant = false
      } else {
        const status = getExpirationStatus(diagnostic.expiration_date)

        if (status.color === 'danger') {
          compliance.expired.push({ type, diagnostic, info })
          compliance.isCompliant = false
        } else if (status.color === 'warning') {
          compliance.expiringSoon.push({ type, diagnostic, info })
        } else {
          compliance.valid.push({ type, diagnostic, info })
        }
      }
    })

    return compliance
  } catch (error) {
    console.error('Erreur checkLotCompliance:', error)
    throw error
  }
}

/**
 * Récupère les statistiques des diagnostics
 * @param {string} entityId - ID de l'entité (optionnel)
 * @returns {Promise<object>} Statistiques
 */
export const getDiagnosticsStats = async (entityId = null) => {
  try {
    const diagnostics = await getAllDiagnostics({ entityId })

    const stats = {
      total: diagnostics.length,
      byType: {},
      byStatus: {
        valid: 0,
        expiringSoon: 0,
        expired: 0,
        perpetual: 0
      },
      byEnergyClass: {}
    }

    diagnostics.forEach(d => {
      // Par type
      stats.byType[d.type] = (stats.byType[d.type] || 0) + 1

      // Par statut
      const status = d.expirationStatus
      if (status.color === 'success') stats.byStatus.valid++
      else if (status.color === 'warning') stats.byStatus.expiringSoon++
      else if (status.color === 'danger') stats.byStatus.expired++
      else stats.byStatus.perpetual++

      // Par classe énergétique (DPE uniquement)
      if (d.type === 'dpe' && d.dpe_rating) {
        stats.byEnergyClass[d.dpe_rating] = (stats.byEnergyClass[d.dpe_rating] || 0) + 1
      }
    })

    return stats
  } catch (error) {
    console.error('Erreur getDiagnosticsStats:', error)
    throw error
  }
}

// =====================================================
// EXPORTS
// =====================================================

export default {
  // CRUD
  getAllDiagnostics,
  getDiagnosticById,
  createDiagnostic,
  updateDiagnostic,
  deleteDiagnostic,

  // Utilitaires
  getDiagnosticsByLot,
  getExpiringDiagnostics,
  getLatestDiagnostic,
  checkLotCompliance,
  getDiagnosticsStats
}
