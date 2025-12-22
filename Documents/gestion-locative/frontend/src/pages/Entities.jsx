import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'

function Entities() {
  const [entities, setEntities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    fetchEntities()
  }, [user])

  const fetchEntities = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // Récupérer l'ID de l'utilisateur
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('supabase_uid', user.id)
        .single()

      if (userError) throw userError

      // Récupérer les entités avec statistiques
      const { data, error: entitiesError } = await supabase
        .from('entities')
        .select('*')
        .eq('user_id', userData.id)
        .order('default_entity', { ascending: false })
        .order('created_at', { ascending: false })

      if (entitiesError) throw entitiesError

      // Pour chaque entité, récupérer les stats
      const entitiesWithStats = await Promise.all(
        (data || []).map(async (entity) => {
          // Compter les propriétés
          const { count: propertiesCount } = await supabase
            .from('properties_new')
            .select('*', { count: 'exact', head: true })
            .eq('entity_id', entity.id)

          // Calculer les revenus mensuels (via lots et baux actifs)
          const { data: lotsData } = await supabase
            .from('lots')
            .select('id, rent_amount, charges_amount, property_id, properties_new!inner(entity_id)')
            .eq('properties_new.entity_id', entity.id)
            .eq('status', 'occupied')

          const monthlyRevenue = (lotsData || []).reduce((total, lot) => {
            return total + (parseFloat(lot.rent_amount) || 0) + (parseFloat(lot.charges_amount) || 0)
          }, 0)

          return {
            ...entity,
            propertiesCount: propertiesCount || 0,
            monthlyRevenue
          }
        })
      )

      setEntities(entitiesWithStats)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette entité ? Toutes les propriétés et lots associés seront également supprimés.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('entities')
        .delete()
        .eq('id', id)

      if (error) throw error

      fetchEntities()
    } catch (error) {
      alert('Erreur lors de la suppression : ' + error.message)
    }
  }

  const getEntityTypeLabel = (type) => {
    const labels = {
      individual: 'Nom propre',
      sci: 'SCI',
      sarl: 'SARL',
      sas: 'SAS',
      sasu: 'SASU',
      eurl: 'EURL',
      lmnp: 'LMNP',
      lmp: 'LMP',
      other: 'Autre'
    }
    return labels[type] || type
  }

  const getEntityTypeBadge = (type) => {
    const variants = {
      individual: 'default',
      sci: 'info',
      sarl: 'success',
      sas: 'success',
      sasu: 'success',
      eurl: 'success',
      lmnp: 'warning',
      lmp: 'warning',
      other: 'default'
    }
    return <Badge variant={variants[type] || 'default'}>{getEntityTypeLabel(type)}</Badge>
  }

  if (loading) {
    return (
      <DashboardLayout title="Mes entités">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-500">Chargement...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Mes entités">
      <div className="space-y-6">
        {/* Header avec actions */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mes entités juridiques</h2>
            <p className="text-sm text-gray-600 mt-1">
              {entities.length} entité{entities.length > 1 ? 's' : ''}
            </p>
          </div>
          <Button onClick={() => navigate('/entities/new')} size="lg">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter une entité
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {entities.length === 0 ? (
          <Card className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune entité juridique</h3>
            <p className="text-gray-600 mb-6">
              Commencez par créer votre première entité (SCI, SARL, nom propre...)
            </p>
            <Button onClick={() => navigate('/entities/new')}>
              Créer votre première entité
            </Button>
          </Card>
        ) : (
          <Card padding={false}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SIREN
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ville
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Propriétés
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenus mensuels
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {entities.map((entity) => (
                    <tr key={entity.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-3"
                            style={{ backgroundColor: entity.color }}
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {entity.name}
                            </div>
                            {entity.default_entity && (
                              <div className="text-xs text-blue-600">
                                Entité par défaut
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getEntityTypeBadge(entity.entity_type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {entity.siren || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {entity.city || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {entity.propertiesCount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-emerald-600">
                          {entity.monthlyRevenue.toFixed(2)} €
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <button
                          onClick={() => navigate(`/entities/${entity.id}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Voir
                        </button>
                        <button
                          onClick={() => navigate(`/entities/${entity.id}/edit`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(entity.id)}
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

export default Entities
