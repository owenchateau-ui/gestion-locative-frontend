/**
 * Rate Limiter Middleware - Supabase Edge Function
 *
 * Protection contre:
 * - Brute force login (5 tentatives/minute)
 * - Spam API (100 requêtes/minute/user)
 * - Abus upload (10 fichiers/minute)
 *
 * Stack: Deno + Upstash Redis
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

// ============================================================================
// CONFIGURATION
// ============================================================================

interface RateLimitConfig {
  maxRequests: number
  windowSeconds: number
  message: string
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Authentification (critique)
  'auth:login': {
    maxRequests: 5,
    windowSeconds: 60, // 5 tentatives par minute
    message: 'Trop de tentatives de connexion. Réessayez dans 1 minute.',
  },
  'auth:register': {
    maxRequests: 3,
    windowSeconds: 3600, // 3 inscriptions par heure
    message: 'Trop d\'inscriptions. Réessayez dans 1 heure.',
  },

  // API générale (par utilisateur authentifié)
  'api:general': {
    maxRequests: 100,
    windowSeconds: 60, // 100 requêtes par minute
    message: 'Limite de requêtes atteinte. Ralentissez.',
  },

  // Upload fichiers
  'upload:file': {
    maxRequests: 10,
    windowSeconds: 60, // 10 fichiers par minute
    message: 'Trop d\'uploads. Réessayez dans 1 minute.',
  },

  // Candidatures publiques (par IP)
  'public:candidate': {
    maxRequests: 5,
    windowSeconds: 3600, // 5 candidatures par heure
    message: 'Trop de candidatures soumises. Réessayez dans 1 heure.',
  },

  // Génération quittances PDF
  'pdf:generate': {
    maxRequests: 50,
    windowSeconds: 60, // 50 PDFs par minute
    message: 'Trop de générations de PDF. Ralentissez.',
  },
}

// ============================================================================
// UPSTASH REDIS CLIENT
// ============================================================================

class UpstashRedis {
  private baseUrl: string
  private token: string

  constructor() {
    this.baseUrl = Deno.env.get('UPSTASH_REDIS_REST_URL')!
    this.token = Deno.env.get('UPSTASH_REDIS_REST_TOKEN')!

    if (!this.baseUrl || !this.token) {
      throw new Error('Missing Upstash Redis credentials')
    }
  }

  /**
   * Incrémenter un compteur avec expiration
   */
  async incr(key: string, ttl: number): Promise<number> {
    // Pipeline: INCR + EXPIRE en une seule requête
    const response = await fetch(`${this.baseUrl}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify([
        ['INCR', key],
        ['EXPIRE', key, ttl],
      ]),
    })

    if (!response.ok) {
      throw new Error(`Redis error: ${response.statusText}`)
    }

    const results = await response.json()
    return results[0].result // Résultat de INCR
  }

  /**
   * Obtenir la valeur d'un compteur
   */
  async get(key: string): Promise<number | null> {
    const response = await fetch(`${this.baseUrl}/get/${key}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.result ? parseInt(data.result) : null
  }

  /**
   * Obtenir le TTL restant (en secondes)
   */
  async ttl(key: string): Promise<number> {
    const response = await fetch(`${this.baseUrl}/ttl/${key}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })

    if (!response.ok) {
      return -1
    }

    const data = await response.json()
    return data.result
  }
}

// ============================================================================
// RATE LIMITER
// ============================================================================

class RateLimiter {
  private redis: UpstashRedis

  constructor() {
    this.redis = new UpstashRedis()
  }

  /**
   * Vérifier et incrémenter le rate limit
   * @returns { allowed: boolean, remaining: number, resetAt: number }
   */
  async check(
    identifier: string,
    action: keyof typeof RATE_LIMITS
  ): Promise<{
    allowed: boolean
    remaining: number
    resetAt: number
    message?: string
  }> {
    const config = RATE_LIMITS[action]
    if (!config) {
      throw new Error(`Unknown rate limit action: ${action}`)
    }

    const key = `ratelimit:${action}:${identifier}`

    // Incrémenter le compteur
    const count = await this.redis.incr(key, config.windowSeconds)

    // Calculer les valeurs de retour
    const remaining = Math.max(0, config.maxRequests - count)
    const ttl = await this.redis.ttl(key)
    const resetAt = Date.now() + ttl * 1000

    if (count > config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt,
        message: config.message,
      }
    }

    return {
      allowed: true,
      remaining,
      resetAt,
    }
  }

  /**
   * Obtenir le statut actuel sans incrémenter
   */
  async status(
    identifier: string,
    action: keyof typeof RATE_LIMITS
  ): Promise<{
    count: number
    remaining: number
    resetAt: number
  }> {
    const config = RATE_LIMITS[action]
    const key = `ratelimit:${action}:${identifier}`

    const count = (await this.redis.get(key)) || 0
    const ttl = await this.redis.ttl(key)
    const resetAt = ttl > 0 ? Date.now() + ttl * 1000 : Date.now()

    return {
      count,
      remaining: Math.max(0, config.maxRequests - count),
      resetAt,
    }
  }
}

// ============================================================================
// EDGE FUNCTION HANDLER
// ============================================================================

serve(async (req: Request) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type, x-rate-limit-action, x-rate-limit-identifier',
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Récupérer l'action et l'identifiant depuis les headers
    const action = req.headers.get('x-rate-limit-action') as keyof typeof RATE_LIMITS
    const identifier = req.headers.get('x-rate-limit-identifier')

    if (!action || !identifier) {
      return new Response(
        JSON.stringify({
          error: 'Missing x-rate-limit-action or x-rate-limit-identifier header',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Vérifier le rate limit
    const rateLimiter = new RateLimiter()
    const result = await rateLimiter.check(identifier, action)

    // Headers de réponse standard
    const responseHeaders = {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'X-RateLimit-Limit': RATE_LIMITS[action].maxRequests.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
    }

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: result.message,
          retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            ...responseHeaders,
            'Retry-After': Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    return new Response(
      JSON.stringify({
        allowed: true,
        remaining: result.remaining,
        resetAt: result.resetAt,
      }),
      {
        status: 200,
        headers: responseHeaders,
      }
    )
  } catch (error) {
    console.error('Rate limiter error:', error)

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
