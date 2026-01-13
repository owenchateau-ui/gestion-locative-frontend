/**
 * Utilitaire d'export CSV pour les listes de données
 * Supporte les caractères français (UTF-8 BOM)
 */

/**
 * Convertit un tableau d'objets en chaîne CSV
 * @param {Array} data - Tableau d'objets à exporter
 * @param {Array} columns - Configuration des colonnes [{key, label, formatter}]
 * @returns {string} Chaîne CSV formatée
 */
export function convertToCSV(data, columns) {
  if (!data || data.length === 0) {
    return ''
  }

  // En-têtes
  const headers = columns.map(col => `"${col.label}"`).join(';')

  // Lignes de données
  const rows = data.map(item => {
    return columns.map(col => {
      let value = col.key.split('.').reduce((obj, key) => obj?.[key], item)

      // Appliquer le formatter si défini
      if (col.formatter) {
        value = col.formatter(value, item)
      }

      // Gérer les valeurs null/undefined
      if (value === null || value === undefined) {
        value = ''
      }

      // Convertir en string et échapper les guillemets
      const stringValue = String(value).replace(/"/g, '""')
      return `"${stringValue}"`
    }).join(';')
  })

  return [headers, ...rows].join('\n')
}

/**
 * Télécharge les données en fichier CSV
 * @param {Array} data - Tableau d'objets à exporter
 * @param {Array} columns - Configuration des colonnes
 * @param {string} filename - Nom du fichier (sans extension)
 */
export function downloadCSV(data, columns, filename) {
  const csv = convertToCSV(data, columns)

  // Ajouter BOM UTF-8 pour Excel
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })

  // Créer le lien de téléchargement
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${formatDateForFilename(new Date())}.csv`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Formate une date pour nom de fichier (YYYY-MM-DD)
 */
function formatDateForFilename(date) {
  return date.toISOString().split('T')[0]
}

/**
 * Formatters courants pour les colonnes CSV
 */
export const csvFormatters = {
  // Format date française
  date: (value) => {
    if (!value) return ''
    return new Date(value).toLocaleDateString('fr-FR')
  },

  // Format monétaire
  currency: (value) => {
    if (value === null || value === undefined) return ''
    return `${parseFloat(value).toFixed(2)} €`
  },

  // Format pourcentage
  percent: (value) => {
    if (value === null || value === undefined) return ''
    return `${parseFloat(value).toFixed(1)}%`
  },

  // Format booléen
  boolean: (value) => value ? 'Oui' : 'Non',

  // Format statut paiement
  paymentStatus: (value) => {
    const labels = {
      pending: 'En attente',
      paid: 'Payé',
      late: 'En retard',
      partial: 'Partiel'
    }
    return labels[value] || value
  },

  // Format statut bail
  leaseStatus: (value) => {
    const labels = {
      draft: 'Brouillon',
      active: 'Actif',
      terminated: 'Résilié',
      archived: 'Archivé'
    }
    return labels[value] || value
  },

  // Format statut lot
  lotStatus: (value) => {
    const labels = {
      vacant: 'Vacant',
      occupied: 'Occupé',
      unavailable: 'Indisponible',
      for_sale: 'En vente'
    }
    return labels[value] || value
  },

  // Format type de lot
  lotType: (value) => {
    const labels = {
      apartment: 'Appartement',
      studio: 'Studio',
      house: 'Maison',
      commercial: 'Commercial',
      office: 'Bureau',
      parking: 'Parking',
      cellar: 'Cave',
      storage: 'Débarras',
      land: 'Terrain',
      other: 'Autre'
    }
    return labels[value] || value
  },

  // Format type d'entité
  entityType: (value) => {
    const labels = {
      individual: 'Nom propre',
      sci: 'SCI',
      sarl: 'SARL',
      sas: 'SAS',
      sasu: 'SASU',
      eurl: 'EURL',
      lmnp: 'LMNP',
      lmp: 'LMP',
      other: 'Autre'
    }
    return labels[value] || value
  },

  // Format catégorie propriété
  propertyCategory: (value) => {
    const labels = {
      building: 'Immeuble',
      house: 'Maison',
      apartment: 'Appartement',
      commercial: 'Local commercial',
      office: 'Bureau',
      land: 'Terrain',
      parking: 'Parking',
      other: 'Autre'
    }
    return labels[value] || value
  },

  // Format type de bail
  leaseType: (value) => {
    return value === 'empty' ? 'Vide' : 'Meublé'
  },

  // Format méthode paiement
  paymentMethod: (value) => {
    const labels = {
      bank_transfer: 'Virement',
      check: 'Chèque',
      cash: 'Espèces',
      direct_debit: 'Prélèvement',
      other: 'Autre'
    }
    return labels[value] || value
  }
}

/**
 * Configurations d'export prédéfinies par type de données
 */
export const exportConfigs = {
  entities: [
    { key: 'name', label: 'Nom' },
    { key: 'entity_type', label: 'Type', formatter: csvFormatters.entityType },
    { key: 'siren', label: 'SIREN' },
    { key: 'siret', label: 'SIRET' },
    { key: 'address', label: 'Adresse' },
    { key: 'postal_code', label: 'Code postal' },
    { key: 'city', label: 'Ville' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Téléphone' },
    { key: 'created_at', label: 'Date création', formatter: csvFormatters.date }
  ],

  properties: [
    { key: 'name', label: 'Nom' },
    { key: 'entities.name', label: 'Entité' },
    { key: 'category', label: 'Catégorie', formatter: csvFormatters.propertyCategory },
    { key: 'address', label: 'Adresse' },
    { key: 'postal_code', label: 'Code postal' },
    { key: 'city', label: 'Ville' },
    { key: 'lotsCount', label: 'Nb lots' },
    { key: 'occupiedLots', label: 'Lots occupés' },
    { key: 'monthlyRevenue', label: 'Revenus mensuels', formatter: csvFormatters.currency },
    { key: 'created_at', label: 'Date création', formatter: csvFormatters.date }
  ],

  lots: [
    { key: 'reference', label: 'Référence' },
    { key: 'name', label: 'Nom' },
    { key: 'properties_new.name', label: 'Propriété' },
    { key: 'properties_new.entities.name', label: 'Entité' },
    { key: 'lot_type', label: 'Type', formatter: csvFormatters.lotType },
    { key: 'status', label: 'Statut', formatter: csvFormatters.lotStatus },
    { key: 'floor', label: 'Étage' },
    { key: 'surface_area', label: 'Surface (m²)' },
    { key: 'nb_rooms', label: 'Nb pièces' },
    { key: 'rent_amount', label: 'Loyer', formatter: csvFormatters.currency },
    { key: 'charges_amount', label: 'Charges', formatter: csvFormatters.currency },
    { key: 'dpe_rating', label: 'DPE' },
    { key: 'created_at', label: 'Date création', formatter: csvFormatters.date }
  ],

  tenants: [
    { key: 'name', label: 'Groupe/Nom' },
    { key: 'group_type', label: 'Type', formatter: (v) => {
      const labels = { individual: 'Individuel', couple: 'Couple', colocation: 'Colocation' }
      return labels[v] || v
    }},
    { key: 'email', label: 'Email principal' },
    { key: 'phone', label: 'Téléphone' },
    { key: 'entity_name', label: 'Entité' },
    { key: 'lease_status', label: 'Bail actif', formatter: (v) => v ? 'Oui' : 'Non' },
    { key: 'total_income', label: 'Revenus totaux', formatter: csvFormatters.currency },
    { key: 'created_at', label: 'Date création', formatter: csvFormatters.date }
  ],

  leases: [
    { key: 'lot.properties_new.name', label: 'Propriété' },
    { key: 'lot.name', label: 'Lot' },
    { key: 'tenant_name', label: 'Locataire' },
    { key: 'lease_type', label: 'Type', formatter: csvFormatters.leaseType },
    { key: 'status', label: 'Statut', formatter: csvFormatters.leaseStatus },
    { key: 'start_date', label: 'Date début', formatter: csvFormatters.date },
    { key: 'end_date', label: 'Date fin', formatter: csvFormatters.date },
    { key: 'rent_amount', label: 'Loyer', formatter: csvFormatters.currency },
    { key: 'charges_amount', label: 'Charges', formatter: csvFormatters.currency },
    { key: 'deposit_amount', label: 'Dépôt garantie', formatter: csvFormatters.currency },
    { key: 'created_at', label: 'Date création', formatter: csvFormatters.date }
  ],

  payments: [
    { key: 'lease.lot.properties_new.name', label: 'Propriété' },
    { key: 'lease.lot.name', label: 'Lot' },
    { key: 'tenant_name', label: 'Locataire' },
    { key: 'amount', label: 'Montant', formatter: csvFormatters.currency },
    { key: 'due_date', label: 'Date échéance', formatter: csvFormatters.date },
    { key: 'payment_date', label: 'Date paiement', formatter: csvFormatters.date },
    { key: 'status', label: 'Statut', formatter: csvFormatters.paymentStatus },
    { key: 'payment_method', label: 'Méthode', formatter: csvFormatters.paymentMethod },
    { key: 'reference', label: 'Référence' }
  ]
}
