import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

/**
 * Hook pour récupérer l'ID utilisateur interne depuis Supabase Auth
 * Élimine la duplication du code de mapping auth.uid() -> users.id
 *
 * @example
 * const { userId, loading, error, refetch } = useSupabaseUser()
 *
 * // Utilisation dans une requête
 * if (userId) {
 *   const { data } = await supabase
 *     .from('entities')
 *     .select('*')
 *     .eq('user_id', userId)
 * }
 *
 * @returns {Object} { userId, userData, loading, error, refetch }
 */
export function useSupabaseUser() {
  const { user } = useAuth()
  const [userId, setUserId] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUser = useCallback(async () => {
    if (!user?.id) {
      setUserId(null)
      setUserData(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, phone, address, city, postal_code, country')
        .eq('supabase_uid', user.id)
        .single()

      if (fetchError) throw fetchError

      setUserId(data?.id || null)
      setUserData(data || null)
    } catch (err) {
      console.error('Error fetching user:', err)
      setError(err.message)
      setUserId(null)
      setUserData(null)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return {
    userId,
    userData,
    loading,
    error,
    refetch: fetchUser
  }
}

/**
 * Hook pour récupérer uniquement l'ID utilisateur (version légère)
 * À utiliser quand on n'a besoin que de l'ID pour les requêtes
 *
 * @example
 * const userId = useUserId()
 *
 * @returns {string|null} L'ID utilisateur ou null
 */
export function useUserId() {
  const { userId } = useSupabaseUser()
  return userId
}

export default useSupabaseUser
