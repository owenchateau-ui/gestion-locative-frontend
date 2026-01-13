/**
 * Fonctions utilitaires pour l'indexation automatique des loyers (IRL)
 */

/**
 * Détermine le trimestre d'une date
 * @param {string|Date} date - La date à analyser
 * @returns {number} Le numéro du trimestre (1-4)
 */
export function getQuarterFromDate(date) {
  const month = new Date(date).getMonth() + 1
  if (month <= 3) return 1
  if (month <= 6) return 2
  if (month <= 9) return 3
  return 4
}

/**
 * Détermine l'année d'une date
 * @param {string|Date} date - La date à analyser
 * @returns {number} L'année
 */
export function getYearFromDate(date) {
  return new Date(date).getFullYear()
}

/**
 * Calcule le nouveau loyer avec l'indexation IRL
 * @param {number} currentRent - Loyer actuel
 * @param {number} oldIRL - Ancien indice IRL
 * @param {number} newIRL - Nouvel indice IRL
 * @returns {number} Le nouveau loyer arrondi à 2 décimales
 */
export function calculateNewRent(currentRent, oldIRL, newIRL) {
  return Math.round((currentRent * (newIRL / oldIRL)) * 100) / 100
}

/**
 * Calcule le pourcentage d'augmentation
 * @param {number} oldRent - Ancien loyer
 * @param {number} newRent - Nouveau loyer
 * @returns {number} Pourcentage d'augmentation arrondi à 2 décimales
 */
export function calculateIncreasePercentage(oldRent, newRent) {
  return Math.round(((newRent - oldRent) / oldRent) * 10000) / 100
}

/**
 * Formate un trimestre pour l'affichage
 * @param {number} quarter - Numéro du trimestre (1-4)
 * @param {number} year - Année
 * @returns {string} Format "T1 2024"
 */
export function formatQuarter(quarter, year) {
  return `T${quarter} ${year}`
}

/**
 * Calcule la prochaine date anniversaire d'un bail
 * @param {string|Date} startDate - Date de début du bail
 * @returns {Date} La prochaine date anniversaire
 */
export function getNextAnniversaryDate(startDate) {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset time to midnight for accurate comparison

  const start = new Date(startDate)
  const thisYear = today.getFullYear()

  // Créer l'anniversaire de cette année avec le jour/mois du bail
  const anniversary = new Date(thisYear, start.getMonth(), start.getDate())

  // Si l'anniversaire de cette année est déjà passé, prendre celui de l'année prochaine
  if (anniversary < today) {
    anniversary.setFullYear(thisYear + 1)
  }

  return anniversary
}

/**
 * Calcule le nombre de jours jusqu'à une date
 * @param {string|Date} targetDate - Date cible
 * @returns {number} Nombre de jours
 */
export function getDaysUntil(targetDate) {
  const today = new Date()
  const target = new Date(targetDate)
  const diffTime = target - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

/**
 * Détermine si un bail doit être indexé
 * @param {Object} lease - Le bail à vérifier
 * @param {number} daysAhead - Nombre de jours d'avance pour la détection (défaut: 60)
 * @returns {boolean} True si le bail doit être indexé
 */
export function shouldBeIndexed(lease, daysAhead = 60) {
  // Vérifier que l'indexation est activée
  if (!lease.indexation_enabled) {
    return false
  }

  // Vérifier que le bail est actif
  if (lease.status !== 'active') {
    return false
  }

  // Calculer la prochaine date anniversaire
  const anniversaryDate = getNextAnniversaryDate(lease.start_date)
  const daysUntilAnniversary = getDaysUntil(anniversaryDate)

  // Vérifier si l'anniversaire est dans la fenêtre
  if (daysUntilAnniversary < 0 || daysUntilAnniversary > daysAhead) {
    return false
  }

  // Vérifier si l'indexation n'a pas déjà été faite cette année
  if (lease.last_indexation_date) {
    const lastIndexation = new Date(lease.last_indexation_date)
    if (lastIndexation >= new Date()) {
      return false
    }

    // Vérifier que la dernière indexation n'est pas de cette année
    const currentYear = new Date().getFullYear()
    const lastIndexationYear = lastIndexation.getFullYear()
    if (lastIndexationYear === currentYear && anniversaryDate > new Date()) {
      return false
    }
  }

  return true
}

/**
 * Détermine le trimestre et l'année de référence pour un bail
 * @param {string|Date} startDate - Date de début du bail
 * @returns {Object} { quarter, year }
 */
export function getReferenceQuarterAndYear(startDate) {
  return {
    quarter: getQuarterFromDate(startDate),
    year: getYearFromDate(startDate)
  }
}

/**
 * Formate une date en français
 * @param {string|Date} date - Date à formater
 * @returns {string} Date formatée (ex: "15 mars 2024")
 */
export function formatDateFR(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

/**
 * Formate une date courte en français
 * @param {string|Date} date - Date à formater
 * @returns {string} Date formatée (ex: "15/03/2024")
 */
export function formatDateShortFR(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR')
}

/**
 * Obtient le trimestre actuel
 * @returns {Object} { quarter, year }
 */
export function getCurrentQuarter() {
  const now = new Date()
  return {
    quarter: getQuarterFromDate(now),
    year: now.getFullYear()
  }
}

/**
 * Obtient le trimestre précédent
 * @param {number} quarter - Trimestre actuel (1-4)
 * @param {number} year - Année actuelle
 * @returns {Object} { quarter, year }
 */
export function getPreviousQuarter(quarter, year) {
  if (quarter === 1) {
    return { quarter: 4, year: year - 1 }
  }
  return { quarter: quarter - 1, year }
}

/**
 * Obtient le prochain trimestre
 * @param {number} quarter - Trimestre actuel (1-4)
 * @param {number} year - Année actuelle
 * @returns {Object} { quarter, year }
 */
export function getNextQuarter(quarter, year) {
  if (quarter === 4) {
    return { quarter: 1, year: year + 1 }
  }
  return { quarter: quarter + 1, year }
}

/**
 * Obtient le mois de publication prévu d'un IRL
 * @param {number} quarter - Trimestre (1-4)
 * @returns {string} Mois de publication
 */
export function getPublicationMonth(quarter) {
  const months = {
    1: 'mi-avril',
    2: 'mi-juillet',
    3: 'mi-octobre',
    4: 'mi-janvier (année suivante)'
  }
  return months[quarter] || ''
}
