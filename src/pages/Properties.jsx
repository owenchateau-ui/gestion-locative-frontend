import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useUserEntities } from '../hooks/useUserEntities'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import ExportButton from '../components/ui/ExportButton'
import Alert from '../components/ui/Alert'
import { Building2 } from 'lucide-react'

// Constantes extraites pour éviter recréation à chaque render
const CATEGORY_LABELS = {
  building: 'Immeuble',
  house: 'Maison',
  apartment: 'Appartement',
  commercial: 'Local commercial',
  office: 'Bureau',
  land: 'Terrain',
  parking: 'Parking',
  other: 'Autre'
}

const CATEGORY_VARIANTS = {
  building: 'info',
  house: 'success',
  apartment: 'default',
  commercial: 'warning',
  office: 'default',
  land: 'default',
  parking: 'default',
  other: 'default'
}

function Properties() {
  const [properties, setProperties] = useState([])
  const [selectedEntity, setSelectedEntity] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userPlan, setUserPlan] = useState('free')
  const navigate = useNavigate()
  const { user } = useAuth()
  const { warning, error: showError } = useToast()

  // Hook centralisé pour les entités
  const { entities, loading: entitiesLoading } = useUserEntities()

  useEffect(() => {
    fetchUserPlan()
  }, [user])

  useEffect(() => {
    if (entities.length > 0 || selectedEntity === 'all') {
      fetchProperties()
    }
  }, [selectedEntity, entities])

  const fetchUserPlan = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('users')
        .select('plan')
        .eq('supabase_uid', user.id)
        .single()

      if (error) throw error
      setUserPlan(data?.plan || 'free')
    } catch (error) {
      console.error('Error fetching user plan:', error)
    }
  }

  const fetchProperties = async () => {
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

      // Requête pour récupérer les propriétés avec leurs entités
      let query = supabase
        .from('properties_new')
        .select('*, entities!inner(id, name, color, entity_type)')
        .eq('entities.user_id', userData.id)

      // Filtrer par entité si sélectionné
      if (selectedEntity !== 'all') {
        query = query.eq('entity_id', selectedEntity)
      }

      const { data: propertiesData, error: propertiesError } = await query.order('created_at', { ascending: false })

      if (propertiesError) throw propertiesError

      // Pour chaque propriété, récupérer le nombre de lots et les lots occupés
      const propertiesWithLots = await Promise.all(
        (propertiesData || []).map(async (property) => {
          const { data: lotsData } = await supabase
            .from('lots')
            .select('id, status, rent_amount, charges_amount')
            .eq('property_id', property.id)

          const totalLots = lotsData?.length || 0
          const occupiedLots = lotsData?.filter(lot => lot.status === 'occupied').length || 0

          // Calculer les revenus mensuels (somme de tous les lots occupés)
          const monthlyRevenue = lotsData
            ?.filter(lot => lot.status === 'occupied')
            .reduce((total, lot) => {
              return total + (parseFloat(lot.rent_amount) || 0) + (parseFloat(lot.charges_amount) || 0)
            }, 0) || 0

          return {
            ...property,
            lotsCount: totalLots,
            occupiedLots,
            monthlyRevenue
          }
        })
      )

      setProperties(propertiesWithLots)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Handlers mémoïsés pour éviter recréation à chaque render
  const handleDelete = useCallback(async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette propriété ? Tous les lots associés seront également supprimés.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('properties_new')
        .delete()
        .eq('id', id)

      if (error) throw error

      fetchProperties()
    } catch (err) {
      showError(`Erreur lors de la suppression : ${err.message}`)
    }
  }, [showError])

  const handleAddProperty = useCallback(() => {
    if (entities.length === 0) {
      warning('Vous devez d\'abord créer une entité juridique avant d\'ajouter une propriété.')
      navigate('/entities/new')
      return
    }
    navigate('/properties/new')
  }, [entities.length, navigate, warning])

  // Fonctions utilitaires mémoïsées
  const getCategoryLabel = useCallback((category) => {
    return CATEGORY_LABELS[category] || category
  }, [])

  const getCategoryBadge = useCallback((category) => {
    return <Badge variant={CATEGORY_VARIANTS[category] || 'default'}>{CATEGORY_LABELS[category] || category}</Badge>
  }, [])

  if (loading) {
    return (
      <DashboardLayout title="Mes biens">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="animate-pulse bg-[var(--border)] rounded-lg h-8 w-48" />
              <div className="animate-pulse bg-[var(--border)] rounded-lg h-4 w-24" />
            </div>
            <div className="animate-pulse bg-[var(--border)] rounded-xl h-10 w-44" />
          </div>
          {/* Table skeleton */}
          <Card padding={false}>
            <Skeleton type="table-row" count={5} />
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Mes biens">
      <div className="space-y-6">
        {/* Header avec actions */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-display font-bold text-[var(--text)]">Mes propriétés</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {properties.length} propriété{properties.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-3">
            <ExportButton
              data={properties}
              type="properties"
              filename="proprietes"
            />
            <Button onClick={handleAddProperty} size="lg">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter une propriété
            </Button>
          </div>
        </div>

        {/* Filtre par entité */}
        {entities.length > 0 && (
          <Card>
            <div className="flex items-center space-x-4">
              <label className="text-sm font-display font-medium text-[var(--text)]">
                Filtrer par entité :
              </label>
              <select
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
                className="px-3 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-all"
              >
                <option value="all">Toutes les entités</option>
                {entities.map((entity) => (
                  <option key={entity.id} value={entity.id}>
                    {entity.name}
                  </option>
                ))}
              </select>
            </div>
          </Card>
        )}

        {error && (
          <Alert variant="error">{error}</Alert>
        )}

        {properties.length === 0 ? (
          <Card padding>
            <EmptyState
              icon={Building2}
              title="Aucune propriété"
              description={selectedEntity === 'all'
                ? 'Commencez par ajouter votre première propriété'
                : 'Aucune propriété pour cette entité'
              }
              actionLabel="Ajouter votre première propriété"
              onAction={handleAddProperty}
            />
          </Card>
        ) : (
          <Card padding={false}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--border)]">
                <thead className="bg-[var(--surface-elevated)]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Entité
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Adresse
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Lots
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Occupation
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Revenus
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--surface)] divide-y divide-[var(--border)]">
                  {properties.map((property) => (
                    <tr key={property.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[var(--text)]">
                          {property.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: property.entities.color }}
                          />
                          <span className="text-sm text-[var(--text)]">
                            {property.entities.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[var(--text)]">{property.address}</div>
                        <div className="text-sm text-[var(--text-muted)]">
                          {property.postal_code} {property.city}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getCategoryBadge(property.category)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-[var(--text)]">
                          {property.lotsCount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--text)]">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{property.occupiedLots}</span>
                          <span className="text-[var(--text-muted)]">/{property.lotsCount}</span>
                        </div>
                        {property.lotsCount > 0 && (
                          <div className="text-xs text-[var(--text-muted)]">
                            {((property.occupiedLots / property.lotsCount) * 100).toFixed(0)}% occupé
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          {property.monthlyRevenue.toFixed(2)} €
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          /mois
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <button
                          onClick={() => navigate(`/properties/${property.id}`)}
                          className="text-[var(--color-purple)] hover:text-[var(--color-purple-light)] transition-colors"
                        >
                          Voir
                        </button>
                        <button
                          onClick={() => navigate(`/properties/${property.id}/edit`)}
                          className="text-[var(--color-electric-blue)] hover:text-[var(--color-electric-blue-dark)] transition-colors"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(property.id)}
                          className="text-[var(--color-vivid-coral)] hover:text-[var(--color-coral-dark)] transition-colors"
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

export default Properties
