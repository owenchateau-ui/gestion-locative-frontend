/**
 * Convention de couleurs pour le design Bold Geometric
 *
 * Ce fichier définit les couleurs à utiliser selon le type de donnée affichée.
 * Utiliser ces conventions pour maintenir une cohérence visuelle dans l'application.
 */

// Palette Bold Geometric
export const COLORS = {
  electricBlue: '#0055FF',
  purple: '#8B5CF6',
  coral: '#FF6B4A',
  lime: '#C6F135',
  emerald: '#10B981',
  amber: '#F59E0B'
}

/**
 * Convention de couleurs par type de donnée
 *
 * @type {Object.<string, string>}
 */
export const STAT_CARD_VARIANTS = {
  // Finances / Argent
  revenue: 'emerald',      // Revenus, loyers, paiements reçus
  expense: 'coral',        // Dépenses, charges à payer
  payment: 'emerald',      // Paiements effectués

  // Immobilier
  property: 'blue',        // Propriétés, immeubles
  lot: 'blue',             // Lots, appartements
  surface: 'blue',         // Surface, m²
  dpe: 'blue',             // DPE, diagnostics techniques

  // Personnes
  tenant: 'coral',         // Locataires (couleur chaude pour personnes)
  candidate: 'purple',     // Candidatures

  // Performance / Statistiques
  yield: 'purple',         // Rendement, ROI
  occupancy: 'emerald',    // Taux d'occupation

  // Alertes / Statuts
  alert: 'coral',          // Alertes, impayés, urgences
  success: 'emerald',      // OK, validé, payé, disponible
  warning: 'amber',        // Attention modérée
  info: 'blue',            // Information générale

  // Croissance
  growth: 'lime',          // Évolution positive
}

/**
 * Mapping des pages vers les couleurs de StatCards
 * Permet de maintenir une cohérence au sein de chaque page
 */
export const PAGE_STAT_COLORS = {
  dashboard: {
    revenue: 'blue',        // Premier = bleu signature
    occupancy: 'emerald',   // Deuxième = succès/occupation
    tenants: 'purple',      // Troisième = personnes
    alerts: 'coral',        // Quatrième = alertes
  },
  entityDetail: {
    properties: 'blue',
    lots: 'purple',
    revenue: 'emerald',
    tenants: 'coral',
  },
  propertyDetail: {
    lots: 'blue',
    occupancy: 'emerald',
    revenue: 'emerald',
    value: 'purple',
  },
  lotDetail: {
    rent: 'emerald',        // Loyer = argent
    surface: 'blue',        // Surface = immobilier
    dpe: 'blue',            // DPE = technique
    status: 'emerald',      // Statut = succès si disponible
  },
  leaseDetail: {
    rentHC: 'emerald',
    charges: 'emerald',
    tenant: 'coral',
    duration: 'purple',
  },
  tenantDetail: {
    rent: 'emerald',
    effortRate: 'purple',
    income: 'emerald',
    documents: 'blue',
  },
  payments: {
    total: 'emerald',
    paid: 'emerald',
    pending: 'amber',
    late: 'coral',
  },
}

/**
 * Retourne le variant approprié pour un type de donnée
 * @param {string} dataType - Type de donnée (revenue, tenant, property, etc.)
 * @returns {string} - Variant pour StatCard (blue, emerald, purple, coral, lime, amber)
 */
export const getVariantForDataType = (dataType) => {
  return STAT_CARD_VARIANTS[dataType] || 'blue'
}

/**
 * Retourne les couleurs pour une page spécifique
 * @param {string} pageName - Nom de la page (dashboard, lotDetail, etc.)
 * @returns {Object} - Mapping des types vers les variants
 */
export const getPageColors = (pageName) => {
  return PAGE_STAT_COLORS[pageName] || PAGE_STAT_COLORS.dashboard
}

export default {
  COLORS,
  STAT_CARD_VARIANTS,
  PAGE_STAT_COLORS,
  getVariantForDataType,
  getPageColors,
}
