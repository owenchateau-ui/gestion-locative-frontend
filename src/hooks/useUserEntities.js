import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchEntities } from '../services/entityService'

/**
 * Hook personnalisé pour récupérer les entités de l'utilisateur connecté
 *
 * Centralise la logique de chargement des entités qui était dupliquée
 * dans Properties.jsx, Lots.jsx, PropertyForm.jsx, Entities.jsx, etc.
 *
 * @returns {Object} - { entities, loading, error, refetch }
 *
 * @example
 * const { entities, loading, error, refetch } = useUserEntities()
 *
 * if (loading) return <Loading />
 * if (error) return <Alert variant="error">{error}</Alert>
 *
 * return entities.map(entity => ...)
 */
export function useUserEntities() {
  const { user } = useAuth()
  const [entities, setEntities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadEntities = useCallback(async () => {
    if (!user) {
      setEntities([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const data = await fetchEntities(user.id)

      // Trier par default_entity (desc) puis par name (asc)
      const sortedData = [...data].sort((a, b) => {
        if (a.default_entity && !b.default_entity) return -1
        if (!a.default_entity && b.default_entity) return 1
        return a.name.localeCompare(b.name)
      })

      setEntities(sortedData)
    } catch (err) {
      console.error('Error fetching entities:', err)
      setError(err.message || 'Erreur lors du chargement des entités')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadEntities()
  }, [loadEntities])

  return {
    entities,
    loading,
    error,
    refetch: loadEntities,
    // Utilitaires pratiques
    hasEntities: entities.length > 0,
    defaultEntity: entities.find(e => e.default_entity) || entities[0] || null
  }
}

export default useUserEntities
