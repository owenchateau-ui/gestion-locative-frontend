import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const EntityContext = createContext()

export function EntityProvider({ children }) {
  const { user } = useAuth()
  const [entities, setEntities] = useState([])
  const [selectedEntity, setSelectedEntity] = useState(null) // null = toutes les entités
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadEntities()
    } else {
      setEntities([])
      setSelectedEntity(null)
      setLoading(false)
    }
  }, [user])

  const loadEntities = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Récupérer l'ID de l'utilisateur
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('supabase_uid', user.id)
        .single()

      if (userError) throw userError

      // Récupérer les entités de l'utilisateur
      const { data, error } = await supabase
        .from('entities')
        .select('*')
        .eq('user_id', userData.id)
        .order('default_entity', { ascending: false })
        .order('name', { ascending: true })

      if (error) throw error

      setEntities(data || [])

      // Si aucune entité n'est sélectionnée et qu'il y a une entité par défaut,
      // la sélectionner automatiquement
      if (!selectedEntity && data && data.length > 0) {
        const defaultEntity = data.find(e => e.default_entity)
        if (defaultEntity) {
          setSelectedEntity(defaultEntity.id)
        }
        // Sinon, on laisse "null" pour afficher toutes les entités
      }
    } catch (error) {
      console.error('Error loading entities:', error)
    } finally {
      setLoading(false)
    }
  }

  const changeSelectedEntity = (entityId) => {
    // Si entityId est 'all', on met null
    setSelectedEntity(entityId === 'all' ? null : entityId)
  }

  const getSelectedEntityData = () => {
    if (!selectedEntity) return null
    return entities.find(e => e.id === selectedEntity) || null
  }

  const value = {
    entities,
    selectedEntity,
    setSelectedEntity: changeSelectedEntity,
    loadEntities,
    loading,
    getSelectedEntityData
  }

  return (
    <EntityContext.Provider value={value}>
      {children}
    </EntityContext.Provider>
  )
}

export function useEntity() {
  const context = useContext(EntityContext)
  if (context === undefined) {
    throw new Error('useEntity must be used within an EntityProvider')
  }
  return context
}
