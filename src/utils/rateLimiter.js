/**
 * Rate Limiter Client - Frontend
 *
 * Wrapper pour appeler l'Edge Function de rate limiting
 * avant chaque action critique
 *
 * Usage:
 * import { checkRateLimit } from '@/utils/rateLimiter'
 *
 * const canProceed = await checkRateLimit('auth:login', userEmail)
 * if (!canProceed) {
 *   toast.error('Trop de tentatives. Réessayez plus tard.')
 *   return
 * }
 */

import { supabase } from '../lib/supabase'

/**
 * Actions disponibles pour le rate limiting
 * @typedef {'auth:login' | 'auth:register' | 'api:general' | 'upload:file' | 'public:candidate' | 'pdf:generate'} RateLimitAction
 */

/**
 * Résultat du rate limit check
 * @typedef {Object} RateLimitResult
 * @property {boolean} allowed - Si l'action est autorisée
 * @property {number} remaining - Requêtes restantes
 * @property {number} resetAt - Timestamp de reset (ms)
 * @property {string} [message] - Message d'erreur si refusé
 * @property {number} [retryAfter] - Secondes à attendre avant retry
 */

/**
 * Vérifier le rate limit pour une action
 * @param {RateLimitAction} action - Type d'action
 * @param {string} identifier - Identifiant unique (email, user_id, IP)
 * @returns {Promise<boolean>} true si autorisé, false sinon
 */
export async function checkRateLimit(action, identifier) {
  try {
    const { data, error } = await supabase.functions.invoke('rate-limiter', {
      headers: {
        'x-rate-limit-action': action,
        'x-rate-limit-identifier': identifier,
      },
    })

    if (error) {
      console.error('Rate limit check error:', error)
      // En cas d'erreur, on autorise (fail-open pour éviter blocage total)
      return true
    }

    // Si rate limit dépassé (429)
    if (data?.error === 'Rate limit exceeded') {
      console.warn(`Rate limit exceeded for ${action}:`, data.message)
      return false
    }

    return data?.allowed === true
  } catch (error) {
    console.error('Rate limit exception:', error)
    // Fail-open: autoriser en cas d'erreur réseau
    return true
  }
}

/**
 * Vérifier le rate limit avec détails complets
 * @param {RateLimitAction} action - Type d'action
 * @param {string} identifier - Identifiant unique
 * @returns {Promise<RateLimitResult>}
 */
export async function checkRateLimitDetailed(action, identifier) {
  try {
    const { data, error } = await supabase.functions.invoke('rate-limiter', {
      headers: {
        'x-rate-limit-action': action,
        'x-rate-limit-identifier': identifier,
      },
    })

    if (error) {
      console.error('Rate limit check error:', error)
      // Retourner un résultat permissif en cas d'erreur
      return {
        allowed: true,
        remaining: 999,
        resetAt: Date.now() + 60000,
      }
    }

    // Si rate limit dépassé
    if (data?.error === 'Rate limit exceeded') {
      return {
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + (data.retryAfter || 60) * 1000,
        message: data.message,
        retryAfter: data.retryAfter,
      }
    }

    return {
      allowed: data?.allowed || false,
      remaining: data?.remaining || 0,
      resetAt: data?.resetAt || Date.now() + 60000,
    }
  } catch (error) {
    console.error('Rate limit exception:', error)
    return {
      allowed: true,
      remaining: 999,
      resetAt: Date.now() + 60000,
    }
  }
}

/**
 * Hook pour obtenir l'identifiant approprié selon l'action
 * @param {RateLimitAction} action - Type d'action
 * @returns {Promise<string>} Identifiant à utiliser
 */
export async function getIdentifier(action) {
  // Actions publiques → utiliser l'IP (via header forwarded)
  if (action === 'public:candidate') {
    // En production, Vercel/Supabase fournit l'IP via headers
    // En dev, utiliser un identifiant générique
    return 'dev-ip-placeholder'
  }

  // Actions authentifiées → utiliser user_id
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user?.id) {
    return user.id
  }

  // Fallback: utiliser email si en cours de login
  return 'anonymous'
}

/**
 * Wrapper complet pour vérifier + obtenir identifiant automatiquement
 * @param {RateLimitAction} action - Type d'action
 * @param {string} [customIdentifier] - Identifiant custom (optionnel)
 * @returns {Promise<boolean>}
 */
export async function rateLimitGuard(action, customIdentifier = null) {
  const identifier = customIdentifier || (await getIdentifier(action))
  return await checkRateLimit(action, identifier)
}

/**
 * Format un timestamp de reset en texte lisible
 * @param {number} resetAt - Timestamp (ms)
 * @returns {string} Ex: "dans 45 secondes" ou "dans 2 minutes"
 */
export function formatRetryTime(resetAt) {
  const seconds = Math.ceil((resetAt - Date.now()) / 1000)

  if (seconds < 60) {
    return `dans ${seconds} seconde${seconds > 1 ? 's' : ''}`
  }

  const minutes = Math.ceil(seconds / 60)
  return `dans ${minutes} minute${minutes > 1 ? 's' : ''}`
}

/**
 * Configuration des limites (pour affichage UI)
 */
export const RATE_LIMIT_CONFIG = {
  'auth:login': {
    max: 5,
    window: 60,
    label: '5 tentatives par minute',
  },
  'auth:register': {
    max: 3,
    window: 3600,
    label: '3 inscriptions par heure',
  },
  'api:general': {
    max: 100,
    window: 60,
    label: '100 requêtes par minute',
  },
  'upload:file': {
    max: 10,
    window: 60,
    label: '10 fichiers par minute',
  },
  'public:candidate': {
    max: 5,
    window: 3600,
    label: '5 candidatures par heure',
  },
  'pdf:generate': {
    max: 50,
    window: 60,
    label: '50 PDFs par minute',
  },
}
