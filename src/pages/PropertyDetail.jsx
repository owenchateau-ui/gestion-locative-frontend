import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import Breadcrumb from '../components/ui/Breadcrumb'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import StatCard from '../components/ui/StatCard'
import Alert from '../components/ui/Alert'

function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { success, error: showError } = useToast()

  const [property, setProperty] = useState(null)
  const [stats, setStats] = useState({
    totalLots: 0,
    occupiedLots: 0,
    vacantLots: 0,
    monthlyRevenue: 0
  })
  const [lots, setLots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPropertyDetails()
  }, [id, user])

  const fetchPropertyDetails = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // Récupérer la propriété avec son entité
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties_new')
        .select('*, entities!inner(id, name, color, entity_type)')
        .eq('id', id)
        .single()

      if (propertyError) throw propertyError
      setProperty(propertyData)

      // Récupérer les lots de cette propriété
      const { data: lotsData, error: lotsError } = await supabase
        .from('lots')
        .select('*')
        .eq('property_id', id)
        .order('created_at', { ascending: false })

      if (lotsError) throw lotsError
      setLots(lotsData || [])

      // Calculer les statistiques
      const totalLots = lotsData?.length || 0
      const occupiedLots = lotsData?.filter(lot => lot.status === 'occupied').length || 0
      const vacantLots = lotsData?.filter(lot => lot.status === 'vacant').length || 0

      const monthlyRevenue = lotsData
        ?.filter(lot => lot.status === 'occupied')
        .reduce((total, lot) => {
          return total + (parseFloat(lot.rent_amount) || 0) + (parseFloat(lot.charges_amount) || 0)
        }, 0) || 0

      setStats({
        totalLots,
        occupiedLots,
        vacantLots,
        monthlyRevenue
      })

    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la propriété "${property.name}" ? Tous les lots associés seront également supprimés.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('properties_new')
        .delete()
        .eq('id', id)

      if (error) throw error

      success('Propriété supprimée avec succès')
      navigate('/properties')
    } catch (err) {
      showError('Erreur lors de la suppression : ' + err.message)
    }
  }

  const getCategoryLabel = (category) => {
    const labels = {
      building: 'Immeuble',
      house: 'Maison',
      apartment: 'Appartement',
      commercial: 'Local commercial',
      office: 'Bureau',
      land: 'Terrain',
      parking: 'Parking',
      other: 'Autre'
    }
    return labels[category] || category
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

  const getStatusBadge = (status) => {
    const variants = {
      vacant: 'success',
      occupied: 'info',
      unavailable: 'warning',
      for_sale: 'default'
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
      <DashboardLayout title="Détail propriété">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-[var(--text-muted)]">Chargement...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!property) {
    return (
      <DashboardLayout title="Propriété introuvable">
        <Card className="text-center py-12">
          <h3 className="text-lg font-display font-semibold text-[var(--text)] mb-2">Propriété introuvable</h3>
          <p className="text-[var(--text-secondary)] mb-6">
            La propriété demandée n'existe pas ou a été supprimée.
          </p>
          <Button onClick={() => navigate('/properties')}>
            Retour à la liste
          </Button>
        </Card>
      </DashboardLayout>
    )
  }

  const occupancyRate = stats.totalLots > 0 ? (stats.occupiedLots / stats.totalLots * 100) : 0

  const breadcrumbItems = [
    { label: 'Entités', href: '/entities' },
    { label: property.entities.name, href: `/entities/${property.entities.id}` },
    { label: property.name }
  ]

  return (
    <DashboardLayout title={property.name} breadcrumb={breadcrumbItems}>

      <div className="space-y-6">
        {/* Header avec informations principales */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-display font-bold text-[var(--text)]">{property.name}</h2>
                <Badge variant="info">{getCategoryLabel(property.category)}</Badge>
              </div>
              <div className="flex items-center space-x-2 mb-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: property.entities.color }}
                />
                <span className="text-sm font-medium text-[var(--text-secondary)]">
                  {property.entities.name}
                </span>
              </div>
              <p className="text-[var(--text-secondary)]">
                {property.address}
                <br />
                {property.postal_code} {property.city}
              </p>
              {property.description && (
                <p className="text-sm text-[var(--text-muted)] mt-3">
                  {property.description}
                </p>
              )}
            </div>
            <div className="flex space-x-3">
              <Button variant="secondary" onClick={() => navigate(`/properties/${id}/edit`)}>
                Modifier
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Supprimer
              </Button>
            </div>
          </div>
        </Card>

        {error && (
          <Alert variant="error">
            {error}
          </Alert>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Lots"
            value={stats.totalLots}
            subtitle="Total des unités"
            variant="blue"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            }
          />

          <StatCard
            title="Lots occupés"
            value={stats.occupiedLots}
            subtitle={`${stats.vacantLots} vacant${stats.vacantLots > 1 ? 's' : ''}`}
            variant="emerald"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          <StatCard
            title="Taux d'occupation"
            value={`${occupancyRate.toFixed(0)}%`}
            subtitle={`${stats.occupiedLots}/${stats.totalLots} lots`}
            variant="indigo"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />

          <StatCard
            title="Revenus mensuels"
            value={`${stats.monthlyRevenue.toFixed(2)} €`}
            subtitle="Loyers + charges"
            variant="emerald"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Informations complémentaires */}
        {(property.construction_year || property.acquisition_date || property.is_coproperty) && (
          <Card title="Informations complémentaires">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {property.construction_year && (
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">Année de construction</p>
                  <p className="text-lg font-display font-semibold text-[var(--text)]">{property.construction_year}</p>
                </div>
              )}
              {property.acquisition_date && (
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">Date d'acquisition</p>
                  <p className="text-lg font-display font-semibold text-[var(--text)]">
                    {new Date(property.acquisition_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
              {property.acquisition_price && (
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">Prix d'acquisition</p>
                  <p className="text-lg font-display font-semibold text-[var(--text)]">
                    {property.acquisition_price.toLocaleString('fr-FR')} €
                  </p>
                </div>
              )}
              {property.current_value && (
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">Valeur actuelle</p>
                  <p className="text-lg font-display font-semibold text-[var(--text)]">
                    {property.current_value.toLocaleString('fr-FR')} €
                  </p>
                </div>
              )}
              {property.is_coproperty && (
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">Copropriété</p>
                  <p className="text-lg font-display font-semibold text-[var(--text)]">
                    Oui ({property.coproperty_lots} lots)
                  </p>
                  {property.syndic_name && (
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                      Syndic : {property.syndic_name}
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Liste des lots */}
        <Card
          title="Lots de cette propriété"
          subtitle={`${lots.length} lot${lots.length > 1 ? 's' : ''}`}
        >
          <div className="mb-4">
            <Button onClick={() => navigate(`/lots/new?property=${id}`)}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter un lot
            </Button>
          </div>

          {lots.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto text-[var(--text-muted)] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <p className="text-[var(--text-secondary)] mb-4">
                Aucun lot dans cette propriété
              </p>
              <Button onClick={() => navigate(`/lots/new?property=${id}`)}>
                Ajouter le premier lot
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--border)]">
                <thead className="bg-[var(--surface-elevated)]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Nom / Référence
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Surface
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Loyer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--surface)] divide-y divide-[var(--border)]">
                  {lots.map((lot) => (
                    <tr key={lot.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[var(--text)]">
                          {lot.name}
                        </div>
                        {lot.reference && (
                          <div className="text-sm text-[var(--text-muted)]">
                            Réf: {lot.reference}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--text)]">
                          {getLotTypeLabel(lot.lot_type)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--text)]">
                          {lot.surface_area ? `${lot.surface_area} m²` : '-'}
                        </div>
                        {lot.nb_rooms && (
                          <div className="text-xs text-[var(--text-muted)]">
                            {lot.nb_rooms} pièce{lot.nb_rooms > 1 ? 's' : ''}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-[var(--text)]">
                          {lot.rent_amount.toFixed(2)} €
                        </div>
                        {lot.charges_amount > 0 && (
                          <div className="text-xs text-[var(--text-muted)]">
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
                          className="text-[var(--color-purple)] hover:text-[var(--color-purple-light)] transition-colors"
                        >
                          Voir
                        </button>
                        <button
                          onClick={() => navigate(`/lots/${lot.id}/edit`)}
                          className="text-[var(--color-electric-blue)] hover:text-[var(--color-electric-blue-dark)] transition-colors"
                        >
                          Modifier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default PropertyDetail
