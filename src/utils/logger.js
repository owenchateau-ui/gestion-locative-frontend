/**
 * Système de logging centralisé
 * @module utils/logger
 *
 * Usage:
 * import { logger } from '@/utils/logger'
 *
 * logger.debug('Message debug') // Dev uniquement
 * logger.log('Message info') // Dev uniquement
 * logger.warn('Attention') // Toujours
 * logger.error('Erreur critique') // Toujours + Sentry
 */

const isDev = import.meta.env.MODE === 'development'
const isDebugEnabled = import.meta.env.VITE_DEBUG === 'true'

class Logger {
  constructor() {
    this.context = null
  }

  /**
   * Définir un contexte pour tous les logs suivants
   * @param {string} context - Nom du contexte (ex: 'CandidateService')
   * @example logger.setContext('TenantService')
   */
  setContext(context) {
    this.context = context
    return this
  }

  /**
   * Formater le message avec contexte et timestamp
   * @private
   */
  _format(level, ...args) {
    const timestamp = new Date().toISOString()
    const prefix = this.context ? `[${this.context}]` : ''
    return [`[${timestamp}]`, prefix, `[${level}]`, ...args].filter(Boolean)
  }

  /**
   * Log de debug (UNIQUEMENT en dev + debug activé)
   * Utilisez pour des logs très verbeux
   * @param {...any} args - Messages à logger
   */
  debug(...args) {
    if (isDev && isDebugEnabled) {
      console.debug(...this._format('DEBUG', ...args))
    }
  }

  /**
   * Log standard (UNIQUEMENT en dev)
   * Utilisez pour suivre le flow de l'application
   * @param {...any} args - Messages à logger
   */
  log(...args) {
    if (isDev) {
      console.log(...this._format('INFO', ...args))
    }
  }

  /**
   * Log d'information (UNIQUEMENT en dev)
   * Alias de log()
   * @param {...any} args - Messages à logger
   */
  info(...args) {
    this.log(...args)
  }

  /**
   * Log de warning (TOUJOURS)
   * Utilisez pour des situations anormales mais non critiques
   * @param {...any} args - Messages à logger
   */
  warn(...args) {
    console.warn(...this._format('WARN', ...args))

    // TODO: Envoyer à Sentry en production avec niveau "warning"
    if (!isDev) {
      this._sendToSentry('warning', args)
    }
  }

  /**
   * Log d'erreur (TOUJOURS)
   * Utilisez pour les erreurs critiques
   * @param {Error|string} error - Erreur à logger
   * @param {object} context - Contexte additionnel
   */
  error(error, context = {}) {
    const formatted = this._format('ERROR', error)
    console.error(...formatted, context)

    // TODO: Envoyer à Sentry en production
    if (!isDev) {
      this._sendToSentry('error', { error, context })
    }
  }

  /**
   * Log de succès (développement uniquement, coloré en vert)
   * Utilisez pour confirmer des opérations réussies
   * @param {...any} args - Messages à logger
   */
  success(...args) {
    if (isDev) {
      console.log(
        '%c✓ SUCCESS',
        'color: #10b981; font-weight: bold',
        ...args
      )
    }
  }

  /**
   * Groupe de logs (utile pour les opérations complexes)
   * @param {string} label - Titre du groupe
   * @param {Function} fn - Fonction à exécuter dans le groupe
   */
  group(label, fn) {
    if (isDev) {
      console.group(label)
      try {
        fn()
      } finally {
        console.groupEnd()
      }
    } else {
      fn()
    }
  }

  /**
   * Mesurer le temps d'exécution
   * @param {string} label - Label de la mesure
   * @example
   * logger.time('fetchTenants')
   * await fetchTenants()
   * logger.timeEnd('fetchTenants') // Affiche: "fetchTenants: 234ms"
   */
  time(label) {
    if (isDev) {
      console.time(label)
    }
  }

  /**
   * Terminer une mesure de temps
   * @param {string} label - Label de la mesure
   */
  timeEnd(label) {
    if (isDev) {
      console.timeEnd(label)
    }
  }

  /**
   * Logger un tableau de données
   * @param {Array} data - Données à afficher
   */
  table(data) {
    if (isDev) {
      console.table(data)
    }
  }

  /**
   * Envoyer les erreurs à Sentry (production)
   * @private
   */
  _sendToSentry(level, data) {
    // TODO: Implémenter l'envoi à Sentry
    // if (window.Sentry) {
    //   window.Sentry.captureMessage(data, level)
    // }
  }
}

// Instance singleton
export const logger = new Logger()

// Export du logger par défaut
export default logger

/**
 * Créer un logger avec contexte prédéfini
 * @param {string} context - Nom du contexte
 * @returns {Logger} Instance de logger avec contexte
 * @example
 * const log = createLogger('TenantService')
 * log.info('Fetching tenants...') // [TenantService] [INFO] Fetching tenants...
 */
export function createLogger(context) {
  const instance = new Logger()
  instance.setContext(context)
  return instance
}
