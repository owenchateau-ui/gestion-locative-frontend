import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import Breadcrumb from '../components/ui/Breadcrumb'
import Tabs from '../components/ui/Tabs'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import StatCard from '../components/ui/StatCard'
import Alert from '../components/ui/Alert'
import { useToast } from '../context/ToastContext'
import {
  Building2,
  Home,
  Users,
  Euro,
  TrendingUp,
  Edit,
  Trash2,
  Plus
} from 'lucide-react'

function EntityDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { success, error: showError } = useToast()

  const [entity, setEntity] = useState(null)
  const [stats, setStats] = useState({
    properties: 0,
    lots: 0,
    occupiedLots: 0,
    monthlyRevenue: 0,
    tenantsCount: 0
  })
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchEntityDetails()
  }, [id, user])

  const fetchEntityDetails = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // Récupérer l'entité
      const { data: entityData, error: entityError } = await supabase
        .from('entities')
        .select('*')
        .eq('id', id)
        .single()

      if (entityError) throw entityError
      setEntity(entityData)

      // Récupérer les propriétés de cette entité
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties_new')
        .select('*')
        .eq('entity_id', id)
        .order('created_at', { ascending: false })

      if (propertiesError) throw propertiesError

      // Pour chaque propriété, compter les lots
      const propertiesWithLots = await Promise.all(
        (propertiesData || []).map(async (property) => {
          const { count } = await supabase
            .from('lots')
            .select('*', { count: 'exact', head: true })
            .eq('property_id', property.id)

          return {
            ...property,
            lotsCount: count || 0
          }
        })
      )

      setProperties(propertiesWithLots)

      // Calculer les statistiques
      const { data: lotsData } = await supabase
        .from('lots')
        .select('*, properties_new!inner(entity_id)')
        .eq('properties_new.entity_id', id)

      const totalLots = lotsData?.length || 0
      const occupiedLots = lotsData?.filter(lot => lot.status === 'occupied').length || 0

      const monthlyRevenue = lotsData
        ?.filter(lot => lot.status === 'occupied')
        .reduce((total, lot) => {
          return total + (parseFloat(lot.rent_amount) || 0) + (parseFloat(lot.charges_amount) || 0)
        }, 0) || 0

      // Compter les locataires (groupes de locataires)
      const { count: tenantsCount } = await supabase
        .from('tenant_groups')
        .select('id', { count: 'exact', head: true })
        .eq('entity_id', id)

      setStats({
        properties: propertiesData?.length || 0,
        lots: totalLots,
        occupiedLots,
        monthlyRevenue,
        tenantsCount: tenantsCount || 0
      })

    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'entité "${entity.name}" ? Toutes les propriétés et lots associés seront également supprimés.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('entities')
        .delete()
        .eq('id', id)

      if (error) throw error

      success('Entité supprimée avec succès')
      navigate('/entities')
    } catch (err) {
      showError('Erreur lors de la suppression : ' + err.message)
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

  const getPropertyCategoryLabel = (category) => {
    const labels = {
      building: 'Immeuble',
      house: 'Maison',
      apartment: 'Appartement',
      commercial: 'Commercial',
      office: 'Bureau',
      land: 'Terrain',
      parking: 'Parking',
      other: 'Autre'
    }
    return labels[category] || category
  }

  if (loading) {
    return (
      <DashboardLayout title="Détail entité">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-[var(--text-muted)]">Chargement...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!entity) {
    return (
      <DashboardLayout title="Entité introuvable">
        <Card className="text-center py-12">
          <h3 className="text-lg font-display font-semibold text-[var(--text)] mb-2">Entité introuvable</h3>
          <p className="text-[var(--text-secondary)] mb-6">
            L'entité demandée n'existe pas ou a été supprimée.
          </p>
          <Button onClick={() => navigate('/entities')}>
            Retour à la liste
          </Button>
        </Card>
      </DashboardLayout>
    )
  }

  const occupancyRate = stats.lots > 0 ? (stats.occupiedLots / stats.lots * 100) : 0

  const breadcrumbItems = [
    { label: 'Entités', href: '/entities' },
    { label: entity.name }
  ]

  const tabs = [
    {
      id: 'overview',
      label: 'Vue d\'ensemble',
      icon: <Building2 className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <Card title="Informations de l'entité">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">Type d'entité</p>
                <p className="text-lg font-display font-semibold text-[var(--text)]">{getEntityTypeLabel(entity.entity_type)}</p>
              </div>

              {entity.siren && (
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">SIREN</p>
                  <p className="text-lg font-display font-semibold text-[var(--text)]">{entity.siren}</p>
                </div>
              )}

              {entity.siret && (
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">SIRET</p>
                  <p className="text-lg font-display font-semibold text-[var(--text)]">{entity.siret}</p>
                </div>
              )}

              {entity.vat_number && (
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">N° TVA</p>
                  <p className="text-lg font-display font-semibold text-[var(--text)]">{entity.vat_number}</p>
                </div>
              )}

              {entity.address && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-[var(--text-secondary)]">Adresse</p>
                  <p className="text-[var(--text)]">
                    {entity.address}
                    {entity.city && entity.postal_code && (
                      <><br />{entity.postal_code} {entity.city}</>
                    )}
                  </p>
                </div>
              )}

              {entity.email && (
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">Email</p>
                  <p className="text-[var(--text)]">{entity.email}</p>
                </div>
              )}

              {entity.phone && (
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">Téléphone</p>
                  <p className="text-[var(--text)]">{entity.phone}</p>
                </div>
              )}

              {entity.vat_applicable && (
                <div className="md:col-span-2">
                  <Badge variant="warning">Assujetti à la TVA</Badge>
                </div>
              )}
            </div>
          </Card>

          <Card title="Actions rapides">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="primary"
                onClick={() => navigate(`/properties/new?entity=${id}`)}
                className="justify-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une propriété
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate(`/tenants/new?entity=${id}`)}
                className="justify-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un locataire
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate(`/leases/new?entity=${id}`)}
                className="justify-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer un bail
              </Button>
            </div>
          </Card>
        </div>
      )
    },
    {
      id: 'properties',
      label: 'Propriétés',
      icon: <Home className="w-5 h-5" />,
      badge: stats.properties,
      content: (
        <div className="space-y-4">
          {properties.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[var(--text-secondary)] mb-4">Aucune propriété dans cette entité</p>
              <Button onClick={() => navigate(`/properties/new?entity=${id}`)}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter la première propriété
              </Button>
            </div>
          ) : (
            properties.map(property => (
              <Card
                key={property.id}
                className="hover:shadow-md transition-all cursor-pointer"
                onClick={() => navigate(`/properties/${property.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-display font-semibold text-[var(--text)]">{property.name}</h3>
                      <Badge variant="info">{getPropertyCategoryLabel(property.category)}</Badge>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {property.address}, {property.postal_code} {property.city}
                    </p>
                    <div className="mt-3 flex gap-4 text-sm text-[var(--text-muted)]">
                      <span>{property.lotsCount} lot{property.lotsCount > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/properties/${property.id}/edit`)
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )
    },
    {
      id: 'stats',
      label: 'Statistiques',
      icon: <TrendingUp className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <Card title="Performance financière">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">Revenus mensuels</p>
                <p className="text-3xl font-display font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.monthlyRevenue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                </p>
                <p className="text-sm text-[var(--text-muted)] mt-1">Loyers + charges des lots occupés</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">Revenus annuels estimés</p>
                <p className="text-3xl font-display font-bold text-[var(--color-electric-blue)]">
                  {(stats.monthlyRevenue * 12).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                </p>
                <p className="text-sm text-[var(--text-muted)] mt-1">Projection sur 12 mois</p>
              </div>
            </div>
          </Card>

          <Card title="Taux d'occupation">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[var(--text-secondary)]">
                  {stats.occupiedLots} / {stats.lots} lots occupés
                </span>
                <span className="text-2xl font-display font-bold text-[var(--text)]">{occupancyRate.toFixed(1)} %</span>
              </div>
              <div className="w-full bg-[var(--surface-elevated)] rounded-full h-4">
                <div
                  className="bg-emerald-500 h-4 rounded-full transition-all"
                  style={{ width: `${occupancyRate}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-[var(--border)]">
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-emerald-600 dark:text-emerald-400">{stats.occupiedLots}</p>
                <p className="text-sm text-[var(--text-muted)]">Occupés</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-[var(--color-vivid-coral)]">{stats.lots - stats.occupiedLots}</p>
                <p className="text-sm text-[var(--text-muted)]">Vacants</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-[var(--color-electric-blue)]">{stats.lots}</p>
                <p className="text-sm text-[var(--text-muted)]">Total</p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Patrimoine">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">Propriétés</span>
                  <span className="text-2xl font-display font-bold text-[var(--text)]">{stats.properties}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">Lots</span>
                  <span className="text-2xl font-display font-bold text-[var(--text)]">{stats.lots}</span>
                </div>
              </div>
            </Card>
            <Card title="Locataires">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">Groupes de locataires</span>
                  <span className="text-2xl font-display font-bold text-[var(--text)]">{stats.tenantsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">Baux actifs</span>
                  <span className="text-2xl font-display font-bold text-[var(--text)]">{stats.occupiedLots}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )
    }
  ]

  return (
    <DashboardLayout title={entity.name} breadcrumb={breadcrumbItems}>

      {/* En-tête avec actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: entity.color || '#2563EB' }}
          />
          <Badge variant="info">{getEntityTypeLabel(entity.entity_type)}</Badge>
          {entity.default_entity && <Badge variant="success">Par défaut</Badge>}
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate(`/entities/${id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Statistiques en haut */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Revenus mensuels"
          value={`${stats.monthlyRevenue.toFixed(2)} €`}
          subtitle={`${stats.occupiedLots} bail${stats.occupiedLots > 1 ? 'x' : ''} actif${stats.occupiedLots > 1 ? 's' : ''}`}
          variant="emerald"
          icon={<Euro className="w-6 h-6" />}
        />
        <StatCard
          title="Taux d'occupation"
          value={`${occupancyRate.toFixed(1)} %`}
          subtitle={`${stats.occupiedLots} / ${stats.lots} lots`}
          variant="blue"
          icon={<TrendingUp className="w-6 h-6" />}
        />
        <StatCard
          title="Propriétés"
          value={stats.properties}
          subtitle={`${stats.lots} lot${stats.lots > 1 ? 's' : ''} au total`}
          variant="indigo"
          icon={<Building2 className="w-6 h-6" />}
          href={`/properties?entity=${id}`}
        />
        <StatCard
          title="Locataires"
          value={stats.tenantsCount}
          subtitle="Groupes de locataires"
          variant="purple"
          icon={<Users className="w-6 h-6" />}
          href={`/tenants?entity=${id}`}
        />
      </div>

      {/* Onglets */}
      <Tabs tabs={tabs} defaultTab="overview" />
    </DashboardLayout>
  )
}

export default EntityDetail
