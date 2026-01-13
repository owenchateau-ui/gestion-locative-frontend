import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import ExportButton from '../components/ui/ExportButton'
import Alert from '../components/ui/Alert'

function Entities() {
  const [entities, setEntities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { error: showError } = useToast()

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
    } catch (err) {
      showError(`Erreur lors de la suppression : ${err.message}`)
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
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="animate-pulse bg-[var(--border)] rounded-lg h-8 w-48" />
              <div className="animate-pulse bg-[var(--border)] rounded-lg h-4 w-24" />
            </div>
            <div className="animate-pulse bg-[var(--border)] rounded-xl h-10 w-36" />
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
    <DashboardLayout title="Mes entités" breadcrumb="Entités">
      <div className="space-y-6">
        {/* Header avec actions */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-display font-bold text-[var(--text)]">Mes entités juridiques</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {entities.length} entité{entities.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-3">
            <ExportButton
              data={entities}
              type="entities"
              filename="entites"
            />
            <Button onClick={() => navigate('/entities/new')} size="lg">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter une entité
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="error">{error}</Alert>
        )}

        {entities.length === 0 ? (
          <Card padding>
            <EmptyState
              icon={Building2}
              title="Aucune entité juridique"
              description="Commencez par créer votre première entité (SCI, SARL, nom propre...)"
              actionLabel="Créer votre première entité"
              onAction={() => navigate('/entities/new')}
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
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      SIREN
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Ville
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Propriétés
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Revenus mensuels
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--surface)] divide-y divide-[var(--border)]">
                  {entities.map((entity) => (
                    <tr key={entity.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-3"
                            style={{ backgroundColor: entity.color }}
                          />
                          <div>
                            <div className="text-sm font-medium text-[var(--text)]">
                              {entity.name}
                            </div>
                            {entity.default_entity && (
                              <div className="text-xs text-[var(--color-electric-blue)]">
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
                        <div className="text-sm text-[var(--text)]">
                          {entity.siren || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--text)]">
                          {entity.city || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-[var(--text)]">
                          {entity.propertiesCount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          {entity.monthlyRevenue.toFixed(2)} €
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <button
                          onClick={() => navigate(`/entities/${entity.id}`)}
                          className="text-[var(--color-purple)] hover:text-[var(--color-purple-light)] transition-colors"
                        >
                          Voir
                        </button>
                        <button
                          onClick={() => navigate(`/entities/${entity.id}/edit`)}
                          className="text-[var(--color-electric-blue)] hover:text-[var(--color-electric-blue-dark)] transition-colors"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(entity.id)}
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

export default Entities
