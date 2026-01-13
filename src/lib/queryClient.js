import { QueryClient } from '@tanstack/react-query'

/**
 * Configuration du QueryClient pour le cache des données
 *
 * Stratégies de cache par type de données :
 * - Données de référence (IRL, types) : staleTime long (24h)
 * - Listes (entités, lots, baux) : staleTime moyen (5 min)
 * - Détails : staleTime court (1 min)
 */

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Données considérées fraîches pendant 2 minutes par défaut
      staleTime: 2 * 60 * 1000,

      // Cache conservé 30 minutes après le dernier usage
      gcTime: 30 * 60 * 1000,

      // Pas de retry automatique sur erreur (géré manuellement)
      retry: 1,

      // Refetch automatique quand la fenêtre reprend le focus
      refetchOnWindowFocus: true,

      // Pas de refetch sur reconnexion réseau (éviter surcharge)
      refetchOnReconnect: false,
    },
  },
})

/**
 * Clés de cache standardisées
 */
export const queryKeys = {
  // Entités
  entities: ['entities'],
  entity: (id) => ['entities', id],

  // Propriétés
  properties: ['properties'],
  propertiesByEntity: (entityId) => ['properties', { entityId }],
  property: (id) => ['properties', id],

  // Lots
  lots: ['lots'],
  lotsByProperty: (propertyId) => ['lots', { propertyId }],
  lotsByEntity: (entityId) => ['lots', { entityId }],
  lot: (id) => ['lots', id],

  // Locataires / Groupes
  tenantGroups: ['tenantGroups'],
  tenantGroupsByEntity: (entityId) => ['tenantGroups', { entityId }],
  tenantGroup: (id) => ['tenantGroups', id],

  // Baux
  leases: ['leases'],
  leasesByLot: (lotId) => ['leases', { lotId }],
  leasesByEntity: (entityId) => ['leases', { entityId }],
  lease: (id) => ['leases', id],

  // Paiements
  payments: ['payments'],
  paymentsByLease: (leaseId) => ['payments', { leaseId }],
  payment: (id) => ['payments', id],

  // Documents
  documents: ['documents'],
  documentsByEntity: (entityId) => ['documents', { entityId }],
  document: (id) => ['documents', id],

  // Diagnostics
  diagnostics: ['diagnostics'],
  diagnosticsByLot: (lotId) => ['diagnostics', { lotId }],
  expiringDiagnostics: (days) => ['diagnostics', 'expiring', days],

  // États des lieux
  inventories: ['inventories'],
  inventoriesByLot: (lotId) => ['inventories', { lotId }],
  inventory: (id) => ['inventories', id],

  // IRL (données de référence - cache long)
  irlHistory: ['irl', 'history'],

  // Stats Dashboard
  dashboardStats: ['dashboard', 'stats'],
  entityStats: (entityId) => ['dashboard', 'stats', entityId],
}

/**
 * Options de cache par type de données
 */
export const cacheOptions = {
  // Données de référence (rarement modifiées)
  reference: {
    staleTime: 24 * 60 * 60 * 1000, // 24h
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 jours
  },

  // Listes principales
  list: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  },

  // Détails d'un élément
  detail: {
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
  },

  // Stats dashboard (rafraîchissement fréquent)
  stats: {
    staleTime: 30 * 1000, // 30 secondes
    gcTime: 5 * 60 * 1000, // 5 minutes
  },
}
