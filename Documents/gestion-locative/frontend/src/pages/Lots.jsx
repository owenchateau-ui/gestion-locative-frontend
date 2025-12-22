import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'

function Lots() {
  const [lots, setLots] = useState([])
  const [entities, setEntities] = useState([])
  const [properties, setProperties] = useState([])
  const [filteredProperties, setFilteredProperties] = useState([])
  const [selectedEntity, setSelectedEntity] = useState('all')
  const [selectedProperty, setSelectedProperty] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    fetchEntities()
    fetchProperties()
  }, [user])

  useEffect(() => {
    // Filtrer les propriétés par entité sélectionnée
    if (selectedEntity === 'all') {
      setFilteredProperties(properties)
    } else {
      setFilteredProperties(properties.filter(p => p.entity_id === selectedEntity))
    }
    // Réinitialiser le filtre propriété quand on change d'entité
    setSelectedProperty('all')
  }, [selectedEntity, properties])

  useEffect(() => {
    if (entities.length > 0 || selectedEntity === 'all') {
      fetchLots()
    }
  }, [selectedEntity, selectedProperty, entities])

  const fetchEntities = async () => {
    if (!user) return

    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('supabase_uid', user.id)
        .single()

      if (userError) throw userError

      const { data, error } = await supabase
        .from('entities')
        .select('*')
        .eq('user_id', userData.id)
        .order('default_entity', { ascending: false })
        .order('name', { ascending: true })

      if (error) throw error

      setEntities(data || [])
    } catch (error) {
      console.error('Error fetching entities:', error)
    }
  }

  const fetchProperties = async () => {
    if (!user) return

    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('supabase_uid', user.id)
        .single()

      if (userError) throw userError

      const { data, error } = await supabase
        .from('properties_new')
        .select('*, entities!inner(id, name, user_id)')
        .eq('entities.user_id', userData.id)
        .order('name', { ascending: true })

      if (error) throw error

      setProperties(data || [])
    } catch (error) {
      console.error('Error fetching properties:', error)
    }
  }

  const fetchLots = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('supabase_uid', user.id)
        .single()

      if (userError) throw userError

      // Requête pour récupérer les lots avec leurs propriétés et entités
      let query = supabase
        .from('lots')
        .select(`
          *,
          properties_new!inner(
            id,
            name,
            entity_id,
            entities!inner(id, name, color, user_id)
          )
        `)
        .eq('properties_new.entities.user_id', userData.id)

      // Filtrer par propriété si sélectionné
      if (selectedProperty !== 'all') {
        query = query.eq('property_id', selectedProperty)
      } else if (selectedEntity !== 'all') {
        // Filtrer par entité si sélectionnée
        query = query.eq('properties_new.entity_id', selectedEntity)
      }

      const { data: lotsData, error: lotsError } = await query.order('created_at', { ascending: false })

      if (lotsError) throw lotsError

      setLots(lotsData || [])
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce lot ?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('lots')
        .delete()
        .eq('id', id)

      if (error) throw error

      fetchLots()
    } catch (error) {
      alert('Erreur lors de la suppression : ' + error.message)
    }
  }

  const handleAddLot = () => {
    if (properties.length === 0) {
      alert('Vous devez d\'abord créer une propriété avant d\'ajouter un lot.')
      navigate('/properties/new')
      return
    }
    navigate('/lots/new')
  }

  const getLotTypeLabel = (type) => {
    const labels = {
      apartment: 'Appartement',
      studio: 'Studio',
      house: 'Maison',
      commercial: 'Commercial',
      office: 'Bureau',
      parking: 'Parking',
      cellar: 'Cave',
      storage: 'Débarras',
      land: 'Terrain',
      other: 'Autre'
    }
    return labels[type] || type
  }

  const getLotTypeBadge = (type) => {
    const variants = {
      apartment: 'info',
      studio: 'default',
      house: 'success',
      commercial: 'warning',
      office: 'default',
      parking: 'default',
      cellar: 'default',
      storage: 'default',
      land: 'default',
      other: 'default'
    }
    return <Badge variant={variants[type] || 'default'}>{getLotTypeLabel(type)}</Badge>
  }

  const getStatusBadge = (status) => {
    const variants = {
      vacant: 'success',
      occupied: 'info',
      unavailable: 'default',
      for_sale: 'warning'
    }
    const labels = {
      vacant: 'Vacant',
      occupied: 'Occupé',
      unavailable: 'Indisponible',
      for_sale: 'En vente'
    }
    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  if (loading) {
    return (
      <DashboardLayout title="Mes lots">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-500">Chargement...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Mes lots">
      <div className="space-y-6">
        {/* Header avec actions */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mes lots (unités locatives)</h2>
            <p className="text-sm text-gray-600 mt-1">
              {lots.length} lot{lots.length > 1 ? 's' : ''}
            </p>
          </div>
          <Button onClick={handleAddLot} size="lg">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un lot
          </Button>
        </div>

        {/* Filtres */}
        {entities.length > 0 && (
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Filtre par entité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrer par entité :
                </label>
                <select
                  value={selectedEntity}
                  onChange={(e) => setSelectedEntity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Toutes les entités</option>
                  {entities.map((entity) => (
                    <option key={entity.id} value={entity.id}>
                      {entity.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtre par propriété */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrer par propriété :
                </label>
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={filteredProperties.length === 0}
                >
                  <option value="all">Toutes les propriétés</option>
                  {filteredProperties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {lots.length === 0 ? (
          <Card className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun lot</h3>
            <p className="text-gray-600 mb-6">
              {selectedProperty !== 'all'
                ? 'Aucun lot pour cette propriété'
                : selectedEntity !== 'all'
                ? 'Aucun lot pour cette entité'
                : 'Commencez par ajouter votre premier lot (appartement, parking, cave...)'
              }
            </p>
            <Button onClick={handleAddLot}>
              Ajouter votre premier lot
            </Button>
          </Card>
        ) : (
          <Card padding={false}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Référence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Propriété
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Étage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Surface
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loyer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lots.map((lot) => (
                    <tr key={lot.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {lot.reference || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {lot.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {lot.properties_new.name}
                        </div>
                        <div className="flex items-center mt-1">
                          <div
                            className="w-2 h-2 rounded-full mr-1"
                            style={{ backgroundColor: lot.properties_new.entities.color }}
                          />
                          <span className="text-xs text-gray-500">
                            {lot.properties_new.entities.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getLotTypeBadge(lot.lot_type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {lot.floor !== null ? `${lot.floor}${lot.floor === 0 ? ' (RDC)' : lot.floor === 1 ? 'er' : 'ème'}` : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {lot.surface_area ? `${lot.surface_area} m²` : '-'}
                        </div>
                        {lot.nb_rooms && (
                          <div className="text-xs text-gray-500">
                            {lot.nb_rooms} pièce{lot.nb_rooms > 1 ? 's' : ''}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-emerald-600">
                          {lot.rent_amount.toFixed(2)} €
                        </div>
                        {lot.charges_amount > 0 && (
                          <div className="text-xs text-gray-500">
                            + {lot.charges_amount.toFixed(2)} € charges
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(lot.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <button
                          onClick={() => navigate(`/lots/${lot.id}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Voir
                        </button>
                        <button
                          onClick={() => navigate(`/lots/${lot.id}/edit`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(lot.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Lots
