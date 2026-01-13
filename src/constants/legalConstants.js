/**
 * Constantes légales françaises pour la gestion locative
 * Conformité loi ALUR n° 2014-366 du 24 mars 2014
 *
 * @see https://www.legifrance.gouv.fr/loda/id/JORFTEXT000028772256/
 */

export const LEASE_LEGAL_RULES = {
  empty: {
    label: 'Non meublé',
    minDurationMonths: 36,
    maxDepositMultiplier: 1,
    noticePeriodMonths: 3,
    noticePeriodTenseZoneMonths: 1,
  },
  furnished: {
    label: 'Meublé',
    minDurationMonths: 12,
    maxDepositMultiplier: 2,
    noticePeriodMonths: 1,
    noticePeriodTenseZoneMonths: 1,
  },
  student: {
    label: 'Étudiant meublé',
    minDurationMonths: 9,
    maxDepositMultiplier: 2,
    noticePeriodMonths: 1,
    noticePeriodTenseZoneMonths: 1,
  },
  mobility: {
    label: 'Bail mobilité',
    minDurationMonths: 1,
    maxDurationMonths: 10,
    maxDepositMultiplier: 0, // Pas de dépôt autorisé
    noticePeriodMonths: 1,
  }
}

/**
 * Calcule la durée en mois entre deux dates
 * @param {string} startDate - Date de début (format YYYY-MM-DD)
 * @param {string} endDate - Date de fin (format YYYY-MM-DD)
 * @returns {number} Nombre de mois
 */
export const calculateDurationMonths = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const months = (end.getFullYear() - start.getFullYear()) * 12 +
                 (end.getMonth() - start.getMonth())
  return months
}

/**
 * Formate la durée en texte lisible
 * @param {number} months - Nombre de mois
 * @returns {string} Texte formaté (ex: "3 ans" ou "12 mois")
 */
export const formatDuration = (months) => {
  if (months >= 12 && months % 12 === 0) {
    const years = months / 12
    return `${years} an${years > 1 ? 's' : ''}`
  }
  return `${months} mois`
}

/**
 * Valide la durée du bail selon le type
 * @param {string} leaseType - Type de bail (empty, furnished, student, mobility)
 * @param {string} startDate - Date de début
 * @param {string} endDate - Date de fin (optionnel pour reconduction tacite)
 * @returns {{ valid: boolean, message?: string, minMonths?: number, currentMonths?: number }}
 */
export const validateLeaseDuration = (leaseType, startDate, endDate) => {
  // Reconduction tacite autorisée (pas de date de fin)
  if (!endDate) {
    return { valid: true }
  }

  const rules = LEASE_LEGAL_RULES[leaseType]
  if (!rules) {
    return { valid: false, message: 'Type de bail non reconnu' }
  }

  const durationMonths = calculateDurationMonths(startDate, endDate)

  // Vérification durée minimale
  if (durationMonths < rules.minDurationMonths) {
    return {
      valid: false,
      message: `La durée minimale d'un bail ${rules.label.toLowerCase()} est de ${formatDuration(rules.minDurationMonths)}. Durée saisie : ${formatDuration(durationMonths)}.`,
      minMonths: rules.minDurationMonths,
      currentMonths: durationMonths
    }
  }

  // Vérification durée maximale pour bail mobilité
  if (rules.maxDurationMonths && durationMonths > rules.maxDurationMonths) {
    return {
      valid: false,
      message: `La durée maximale d'un bail ${rules.label.toLowerCase()} est de ${formatDuration(rules.maxDurationMonths)}. Durée saisie : ${formatDuration(durationMonths)}.`,
      maxMonths: rules.maxDurationMonths,
      currentMonths: durationMonths
    }
  }

  return { valid: true, durationMonths }
}

/**
 * Valide le dépôt de garantie selon le type de bail
 * @param {string} leaseType - Type de bail
 * @param {number} rentAmount - Montant du loyer hors charges
 * @param {number} depositAmount - Montant du dépôt de garantie
 * @returns {{ valid: boolean, message?: string, maxAmount?: number, currentAmount?: number }}
 */
export const validateDepositAmount = (leaseType, rentAmount, depositAmount) => {
  // Pas de dépôt saisi = valide
  if (!depositAmount || depositAmount <= 0) {
    return { valid: true }
  }

  const rules = LEASE_LEGAL_RULES[leaseType]
  if (!rules) {
    return { valid: false, message: 'Type de bail non reconnu' }
  }

  const maxDeposit = rentAmount * rules.maxDepositMultiplier

  // Bail mobilité : pas de dépôt autorisé
  if (rules.maxDepositMultiplier === 0 && depositAmount > 0) {
    return {
      valid: false,
      message: `Le bail ${rules.label.toLowerCase()} n'autorise pas de dépôt de garantie.`,
      maxAmount: 0,
      currentAmount: depositAmount
    }
  }

  // Vérification montant maximum
  if (depositAmount > maxDeposit) {
    return {
      valid: false,
      message: `Le dépôt de garantie ne peut excéder ${rules.maxDepositMultiplier} mois de loyer hors charges. Maximum autorisé : ${maxDeposit.toFixed(2)} €. Montant saisi : ${depositAmount.toFixed(2)} €.`,
      maxAmount: maxDeposit,
      currentAmount: depositAmount
    }
  }

  return { valid: true, maxAmount: maxDeposit }
}

/**
 * Obtient le maximum de dépôt autorisé pour un type de bail
 * @param {string} leaseType - Type de bail
 * @param {number} rentAmount - Montant du loyer hors charges
 * @returns {number} Montant maximum du dépôt
 */
export const getMaxDepositAmount = (leaseType, rentAmount) => {
  const rules = LEASE_LEGAL_RULES[leaseType]
  if (!rules) return 0
  return rentAmount * rules.maxDepositMultiplier
}

/**
 * Obtient la durée minimale pour un type de bail
 * @param {string} leaseType - Type de bail
 * @returns {number} Durée minimale en mois
 */
export const getMinDurationMonths = (leaseType) => {
  const rules = LEASE_LEGAL_RULES[leaseType]
  return rules?.minDurationMonths || 12
}
