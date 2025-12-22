import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import StatCard from '../components/ui/StatCard'

function EntityDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [entity, setEntity] = useState(null)
  const [stats, setStats] = useState({
    properties: 0,
    lots: 0,
    occupiedLots: 0,
    monthlyRevenue: 0
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

      setStats({
        properties: propertiesData?.length || 0,
        lots: totalLots,
        occupiedLots,
        monthlyRevenue
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

      navigate('/entities')
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
          <div className="text-xl text-gray-500">Chargement...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!entity) {
    return (
      <DashboardLayout title="Entité introuvable">
        <Card className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Entité introuvable</h3>
          <p className="text-gray-600 mb-6">
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

  return (
    <DashboardLayout title={entity.name}>
      <div className="space-y-6">
        {/* Header avec informations principales */}
        <Card>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: entity.color }}
              >
                {entity.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h2 className="text-2xl font-bold text-gray-900">{entity.name}</h2>
                  <Badge variant="info">{getEntityTypeLabel(entity.entity_type)}</Badge>
                  {entity.default_entity && (
                    <Badge variant="success">Par défaut</Badge>
                  )}
                </div>
                <div className="mt-2 space-y-1">
                  {entity.siren && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">SIREN :</span> {entity.siren}
                    </p>
                  )}
                  {entity.city && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Ville :</span> {entity.city}
                    </p>
                  )}
                  {entity.vat_applicable && (
                    <p className="text-sm text-amber-600 font-medium">
                      Assujetti à la TVA
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="secondary" onClick={() => navigate(`/entities/${id}/edit`)}>
                Modifier
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Supprimer
              </Button>
            </div>
          </div>
        </Card>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Propriétés"
            value={stats.properties}
            subtitle="Total des biens"
            variant="blue"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />

          <StatCard
            title="Lots"
            value={stats.lots}
            subtitle={`${stats.occupiedLots} occupés`}
            variant="emerald"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            }
          />

          <StatCard
            title="Taux d'occupation"
            value={`${occupancyRate.toFixed(0)}%`}
            subtitle={`${stats.occupiedLots}/${stats.lots} lots`}
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

        {/* Liste des propriétés */}
        <Card title="Propriétés de cette entité" subtitle={`${properties.length} propriété${properties.length > 1 ? 's' : ''}`}>
          {properties.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                Aucune propriété dans cette entité
              </p>
              <Button onClick={() => navigate('/properties/new')}>
                Ajouter une propriété
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {properties.map(property => (
                <div
                  key={property.id}
                  className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  onClick={() => navigate(`/properties/${property.id}`)}
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{property.name}</h4>
                    <p className="text-sm text-gray-600">
                      {property.address}, {property.postal_code} {property.city}
                    </p>
                    <div className="flex items-center space-x-3 mt-1">
                      <Badge variant="default">
                        {getPropertyCategoryLabel(property.category)}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {property.lotsCount} lot{property.lotsCount > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default EntityDetail
