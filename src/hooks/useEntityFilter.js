import { useCallback } from 'react'
import { useEntity } from '../context/EntityContext'

/**
 * Hook pour appliquer le filtre d'entité aux requêtes Supabase
 * Centralise la logique de filtrage par entité
 *
 * @example
 * const { applyEntityFilter, selectedEntity, hasEntityFilter } = useEntityFilter()
 *
 * // Dans une requête
 * let query = supabase.from('properties_new').select('*')
 * query = applyEntityFilter(query, 'entity_id')
 *
 * @returns {Object} { applyEntityFilter, selectedEntity, hasEntityFilter }
 */
export function useEntityFilter() {
  const { selectedEntity, entities } = useEntity()

  /**
   * Applique le filtre d'entité à une requête Supabase
   *
   * @param {Object} query - La requête Supabase en cours
   * @param {string} entityColumn - Le nom de la colonne d'entité (défaut: 'entity_id')
   * @returns {Object} La requête avec le filtre appliqué
   */
  const applyEntityFilter = useCallback((query, entityColumn = 'entity_id') => {
    if (selectedEntity) {
      return query.eq(entityColumn, selectedEntity)
    }
    return query
  }, [selectedEntity])

  /**
   * Applique le filtre d'entité pour les requêtes avec jointures profondes
   * Exemple: 'lot.properties_new.entity_id'
   *
   * @param {Object} query - La requête Supabase en cours
   * @param {string} entityPath - Le chemin vers la colonne d'entité
   * @returns {Object} La requête avec le filtre appliqué
   */
  const applyDeepEntityFilter = useCallback((query, entityPath) => {
    if (selectedEntity) {
      return query.eq(entityPath, selectedEntity)
    }
    return query
  }, [selectedEntity])

  return {
    applyEntityFilter,
    applyDeepEntityFilter,
    selectedEntity,
    hasEntityFilter: !!selectedEntity,
    entities,
    allEntitiesMode: !selectedEntity && entities.length > 0
  }
}

export default useEntityFilter
