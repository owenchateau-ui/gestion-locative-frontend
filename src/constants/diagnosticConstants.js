/**
 * Constantes pour la gestion des diagnostics immobiliers
 * Conformité législation française
 */

// Types de diagnostics
export const DIAGNOSTIC_TYPES = {
  dpe: {
    label: 'DPE',
    fullLabel: 'Diagnostic de Performance Énergétique',
    description: 'Évalue la consommation énergétique et les émissions de gaz à effet de serre',
    mandatory: true,
    validityMonths: 120, // 10 ans
    icon: 'Zap'
  },
  ges: {
    label: 'GES',
    fullLabel: 'Gaz à Effet de Serre',
    description: 'Inclus dans le DPE depuis juillet 2021',
    mandatory: true,
    validityMonths: 120,
    icon: 'Cloud'
  },
  amiante: {
    label: 'Amiante',
    fullLabel: 'État d\'amiante',
    description: 'Obligatoire pour les logements construits avant le 1er juillet 1997',
    mandatory: false, // Dépend de l'année de construction
    mandatoryBefore: 1997,
    validityMonths: null, // Illimité si négatif
    validityIfPositiveMonths: 36, // 3 ans si positif
    icon: 'AlertTriangle'
  },
  plomb: {
    label: 'Plomb',
    fullLabel: 'Constat de Risque d\'Exposition au Plomb (CREP)',
    description: 'Obligatoire pour les logements construits avant le 1er janvier 1949',
    mandatory: false,
    mandatoryBefore: 1949,
    validityMonths: null, // Illimité si négatif
    validityIfPositiveMonths: 12, // 1 an si positif
    icon: 'Shield'
  },
  gaz: {
    label: 'Gaz',
    fullLabel: 'État de l\'installation intérieure de gaz',
    description: 'Obligatoire si l\'installation a plus de 15 ans',
    mandatory: false,
    mandatoryIfOlderThan: 15, // ans
    validityMonths: 72, // 6 ans
    icon: 'Flame'
  },
  electricity: {
    label: 'Électricité',
    fullLabel: 'État de l\'installation intérieure d\'électricité',
    description: 'Obligatoire si l\'installation a plus de 15 ans',
    mandatory: false,
    mandatoryIfOlderThan: 15,
    validityMonths: 72, // 6 ans
    icon: 'Plug'
  },
  erp: {
    label: 'ERP',
    fullLabel: 'État des Risques et Pollutions',
    description: 'Informe sur les risques naturels, miniers, technologiques, pollution des sols',
    mandatory: true,
    validityMonths: 6,
    icon: 'AlertCircle'
  },
  termites: {
    label: 'Termites',
    fullLabel: 'État relatif à la présence de termites',
    description: 'Obligatoire dans les zones déclarées par arrêté préfectoral',
    mandatory: false, // Selon zone
    mandatoryInZone: true,
    validityMonths: 6,
    icon: 'Bug'
  },
  surface: {
    label: 'Surface',
    fullLabel: 'Mesurage (Carrez/Boutin)',
    description: 'Carrez pour les copropriétés, Boutin pour les locations',
    mandatory: true,
    validityMonths: null, // Illimité sauf travaux
    icon: 'Maximize'
  },
  assainissement: {
    label: 'Assainissement',
    fullLabel: 'Diagnostic assainissement non collectif',
    description: 'Obligatoire si le bien n\'est pas raccordé au tout-à-l\'égout',
    mandatory: false,
    validityMonths: 36, // 3 ans
    icon: 'Droplet'
  },
  bruit: {
    label: 'Bruit',
    fullLabel: 'État des nuisances sonores aériennes',
    description: 'Obligatoire dans les zones exposées au bruit des aéroports',
    mandatory: false,
    mandatoryInZone: true,
    validityMonths: null,
    icon: 'Volume2'
  }
}

// Classes énergétiques DPE
export const ENERGY_CLASSES = {
  A: {
    label: 'A',
    color: '#319834', // Vert foncé
    bgColor: '#d4edda',
    description: 'Logement économe',
    maxKwhM2: 50
  },
  B: {
    label: 'B',
    color: '#33a357',
    bgColor: '#d4edda',
    description: 'Logement économe',
    maxKwhM2: 90
  },
  C: {
    label: 'C',
    color: '#79b752',
    bgColor: '#e8f5e9',
    description: 'Logement standard',
    maxKwhM2: 150
  },
  D: {
    label: 'D',
    color: '#f3ec19',
    bgColor: '#fff9c4',
    description: 'Logement standard',
    maxKwhM2: 230
  },
  E: {
    label: 'E',
    color: '#f9b233',
    bgColor: '#fff3cd',
    description: 'Logement énergivore',
    maxKwhM2: 330
  },
  F: {
    label: 'F',
    color: '#ee8234',
    bgColor: '#ffe0b2',
    description: 'Passoire énergétique',
    maxKwhM2: 450
  },
  G: {
    label: 'G',
    color: '#d62027',
    bgColor: '#ffcdd2',
    description: 'Passoire énergétique',
    maxKwhM2: null // > 450
  }
}

// Classes GES (émissions CO2)
export const GES_CLASSES = {
  A: {
    label: 'A',
    color: '#c5aee2',
    bgColor: '#f3e5f5',
    description: 'Peu d\'émissions',
    maxKgCO2M2: 5
  },
  B: {
    label: 'B',
    color: '#b193d3',
    bgColor: '#f3e5f5',
    description: 'Peu d\'émissions',
    maxKgCO2M2: 10
  },
  C: {
    label: 'C',
    color: '#9d7ec4',
    bgColor: '#ede7f6',
    description: 'Émissions moyennes',
    maxKgCO2M2: 20
  },
  D: {
    label: 'D',
    color: '#8968b5',
    bgColor: '#ede7f6',
    description: 'Émissions moyennes',
    maxKgCO2M2: 35
  },
  E: {
    label: 'E',
    color: '#7553a6',
    bgColor: '#e1bee7',
    description: 'Émissions élevées',
    maxKgCO2M2: 55
  },
  F: {
    label: 'F',
    color: '#613d97',
    bgColor: '#d1c4e9',
    description: 'Émissions très élevées',
    maxKgCO2M2: 80
  },
  G: {
    label: 'G',
    color: '#4d2888',
    bgColor: '#d1c4e9',
    description: 'Émissions très élevées',
    maxKgCO2M2: null // > 80
  }
}

// Statuts d'expiration
export const EXPIRATION_STATUS = {
  valid: {
    label: 'Valide',
    color: 'success',
    description: 'Diagnostic en cours de validité'
  },
  expiring_soon: {
    label: 'Expire bientôt',
    color: 'warning',
    description: 'Expire dans moins de 60 jours'
  },
  expired: {
    label: 'Expiré',
    color: 'danger',
    description: 'Diagnostic expiré, renouvellement nécessaire'
  },
  perpetual: {
    label: 'Perpétuel',
    color: 'info',
    description: 'Validité illimitée'
  }
}

// Seuils d'alerte (en jours)
export const ALERT_THRESHOLDS = {
  CRITICAL: 0,    // Expiré
  WARNING: 30,    // Expire dans 30 jours
  INFO: 60        // Expire dans 60 jours
}

// Calcul du statut d'expiration
export const getExpirationStatus = (expirationDate) => {
  if (!expirationDate) {
    return EXPIRATION_STATUS.perpetual
  }

  const today = new Date()
  const expDate = new Date(expirationDate)
  const daysUntil = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24))

  if (daysUntil < ALERT_THRESHOLDS.CRITICAL) {
    return { ...EXPIRATION_STATUS.expired, daysUntil }
  }
  if (daysUntil <= ALERT_THRESHOLDS.INFO) {
    return { ...EXPIRATION_STATUS.expiring_soon, daysUntil }
  }
  return { ...EXPIRATION_STATUS.valid, daysUntil }
}

// Calcul de la date d'expiration par défaut selon le type
export const calculateExpirationDate = (type, performedDate, isPositive = false) => {
  const typeInfo = DIAGNOSTIC_TYPES[type]
  if (!typeInfo) return null

  let validityMonths = typeInfo.validityMonths

  // Si résultat positif et validité spécifique
  if (isPositive && typeInfo.validityIfPositiveMonths) {
    validityMonths = typeInfo.validityIfPositiveMonths
  }

  // Si validité illimitée
  if (!validityMonths) return null

  const expDate = new Date(performedDate)
  expDate.setMonth(expDate.getMonth() + validityMonths)
  return expDate.toISOString().split('T')[0]
}

// Vérifier si un diagnostic est obligatoire pour un lot
export const isDiagnosticRequired = (type, constructionYear, installationAge = null) => {
  const typeInfo = DIAGNOSTIC_TYPES[type]
  if (!typeInfo) return false

  // Toujours obligatoire
  if (typeInfo.mandatory === true) return true

  // Obligatoire selon année de construction
  if (typeInfo.mandatoryBefore && constructionYear < typeInfo.mandatoryBefore) {
    return true
  }

  // Obligatoire selon âge de l'installation
  if (typeInfo.mandatoryIfOlderThan && installationAge > typeInfo.mandatoryIfOlderThan) {
    return true
  }

  return false
}

// Diagnostics obligatoires pour la location
export const MANDATORY_FOR_RENTAL = [
  'dpe',
  'erp'
]

// Diagnostics conditionnels
export const CONDITIONAL_DIAGNOSTICS = [
  'plomb',      // Avant 1949
  'amiante',    // Avant 1997
  'gaz',        // Installation > 15 ans
  'electricity', // Installation > 15 ans
  'termites',   // Zone déclarée
  'bruit'       // Zone aéroportuaire
]

export default {
  DIAGNOSTIC_TYPES,
  ENERGY_CLASSES,
  GES_CLASSES,
  EXPIRATION_STATUS,
  ALERT_THRESHOLDS,
  getExpirationStatus,
  calculateExpirationDate,
  isDiagnosticRequired,
  MANDATORY_FOR_RENTAL,
  CONDITIONAL_DIAGNOSTICS
}
