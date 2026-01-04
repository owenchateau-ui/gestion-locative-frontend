import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { fetchEntities } from '../../services/entityService'
import Alert from '../ui/Alert'
import Loading from '../ui/Loading'

/**
 * Composant de sélection d'entité
 *
 * @param {Object} props
 * @param {string} props.value - ID de l'entité sélectionnée
 * @param {function} props.onChange - Callback appelé quand l'entité change
 * @param {boolean} props.required - Si la sélection est obligatoire
 * @param {string} props.label - Label du champ
 * @param {string} props.placeholder - Placeholder du select
 */
function EntitySelect({ value, onChange, required = false, label = 'Entité', placeholder = 'Sélectionner une entité...' }) {
  const { user } = useAuth()
  const [entities, setEntities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadEntities()
  }, [])

  const loadEntities = async () => {
    try {
      setLoading(true)
      const data = await fetchEntities(user.id)
      setEntities(data)

      // Si une seule entité et pas de valeur sélectionnée, la sélectionner automatiquement
      if (data.length === 1 && !value && onChange) {
        onChange(data[0].id)
      }
    } catch (err) {
      console.error('Erreur lors du chargement des entités:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
          <span className="text-sm text-gray-500">Chargement des entités...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <Alert variant="error" title="Erreur">
          {error}
        </Alert>
      </div>
    )
  }

  if (entities.length === 0) {
    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <Alert variant="warning" title="Aucune entité">
          Vous devez créer une entité avant de créer un locataire.
          <a href="/entities/new" className="ml-2 text-blue-600 hover:text-blue-700 underline">
            Créer une entité
          </a>
        </Alert>
      </div>
    )
  }

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        value={value || ''}
        onChange={(e) => onChange && onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">{placeholder}</option>
        {entities.map((entity) => (
          <option key={entity.id} value={entity.id}>
            {entity.name}
          </option>
        ))}
      </select>
      {entities.length === 1 && (
        <p className="text-xs text-gray-500 mt-1">
          Une seule entité disponible
        </p>
      )}
    </div>
  )
}

export default EntitySelect
