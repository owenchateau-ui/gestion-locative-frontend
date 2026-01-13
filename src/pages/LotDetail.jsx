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
import InvitationLinkModal from '../components/candidates/InvitationLinkModal'
import { getCandidatesByLot } from '../services/candidateService'

function LotDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { success, error: showError } = useToast()

  const [lot, setLot] = useState(null)
  const [activeLease, setActiveLease] = useState(null)
  const [pastLeases, setPastLeases] = useState([])
  const [candidates, setCandidates] = useState([])
  const [showInvitationModal, setShowInvitationModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchLotDetails()
  }, [id, user])

  const fetchLotDetails = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // Récupérer le lot avec sa propriété et son entité
      const { data: lotData, error: lotError } = await supabase
        .from('lots')
        .select(`
          *,
          properties_new!inner(
            id,
            name,
            address,
            city,
            postal_code,
            entity_id,
            entities!inner(id, name, color, entity_type)
          )
        `)
        .eq('id', id)
        .single()

      if (lotError) throw lotError
      setLot(lotData)

      // Récupérer le bail actif (si le lot est occupé)
      if (lotData.status === 'occupied') {
        const { data: activeLeaseData, error: leaseError } = await supabase
          .from('leases')
          .select(`
            *,
            tenants!inner(
              id,
              first_name,
              last_name,
              email,
              phone,
              group_id,
              is_main_tenant,
              tenant_groups!group_id(id, name, group_type)
            )
          `)
          .eq('lot_id', lotData.id)
          .eq('status', 'active')
          .single()

        if (!leaseError && activeLeaseData) {
          setActiveLease(activeLeaseData)
        }
      }

      // Récupérer l'historique des baux
      const { data: pastLeasesData, error: pastLeasesError } = await supabase
        .from('leases')
        .select(`
          *,
          tenants!inner(
            id,
            first_name,
            last_name,
            group_id,
            tenant_groups!group_id(id, name, group_type)
          )
        `)
        .eq('lot_id', lotData.id)
        .in('status', ['terminated', 'archived'])
        .order('end_date', { ascending: false })

      if (!pastLeasesError) {
        setPastLeases(pastLeasesData || [])
      }

      // Récupérer les candidatures si le lot est vacant
      if (lotData.status === 'vacant') {
        const { data: candidatesData } = await getCandidatesByLot(lotData.id)
        setCandidates(candidatesData || [])
      }

    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le lot "${lot.name}" ?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('lots')
        .delete()
        .eq('id', id)

      if (error) throw error

      success('Lot supprimé avec succès')
      navigate('/lots')
    } catch (err) {
      showError('Erreur lors de la suppression : ' + err.message)
    }
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

  const getDPEColor = (rating) => {
    const colors = {
      A: 'bg-emerald-500',
      B: 'bg-green-500',
      C: 'bg-lime-500',
      D: 'bg-yellow-500',
      E: 'bg-orange-500',
      F: 'bg-red-500',
      G: 'bg-red-700'
    }
    return colors[rating] || 'bg-[var(--text-muted)]'
  }

  if (loading) {
    return (
      <DashboardLayout title="Détail lot">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-[var(--text-secondary)]">Chargement...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!lot) {
    return (
      <DashboardLayout title="Lot introuvable">
        <Card className="text-center py-12">
          <h3 className="text-lg font-display font-semibold text-[var(--text)] mb-2">Lot introuvable</h3>
          <p className="text-[var(--text-secondary)] mb-6">
            Le lot demandé n'existe pas ou a été supprimé.
          </p>
          <Button onClick={() => navigate('/lots')}>
            Retour à la liste
          </Button>
        </Card>
      </DashboardLayout>
    )
  }

  const totalRent = parseFloat(lot.rent_amount) + parseFloat(lot.charges_amount || 0)

  const breadcrumbItems = [
    { label: 'Entités', href: '/entities' },
    { label: lot.properties_new.entities.name, href: `/entities/${lot.properties_new.entity_id}` },
    { label: lot.properties_new.name, href: `/properties/${lot.properties_new.id}` },
    { label: lot.name }
  ]

  return (
    <DashboardLayout title={lot.name} breadcrumb={breadcrumbItems}>

      <div className="space-y-6">
        {/* Header avec informations principales */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-display font-bold text-[var(--text)]">{lot.name}</h2>
                <Badge variant="info">{getLotTypeLabel(lot.lot_type)}</Badge>
                {getStatusBadge(lot.status)}
              </div>
              {lot.reference && (
                <p className="text-sm text-[var(--text-secondary)] mb-2">
                  Référence : {lot.reference}
                </p>
              )}
              <p className="text-[var(--text-secondary)]">
                {lot.properties_new.name}
                <br />
                {lot.properties_new.address}, {lot.properties_new.postal_code} {lot.properties_new.city}
              </p>
              {lot.floor !== null && (
                <p className="text-sm text-[var(--text-muted)] mt-2">
                  Étage : {lot.floor === 0 ? 'Rez-de-chaussée' : `${lot.floor}${lot.floor === 1 ? 'er' : 'ème'}`}
                  {lot.door_number && ` - Porte ${lot.door_number}`}
                </p>
              )}
            </div>
            <div className="flex space-x-3">
              <Button variant="secondary" onClick={() => navigate(`/lots/${id}/edit`)}>
                Modifier
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Supprimer
              </Button>
            </div>
          </div>
        </Card>

        {error && (
          <Alert variant="error">{error}</Alert>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Loyer mensuel"
            value={`${totalRent.toFixed(2)} €`}
            subtitle={lot.charges_amount > 0 ? `${lot.rent_amount} + ${lot.charges_amount} charges` : 'Hors charges'}
            variant="emerald"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          <StatCard
            title="Surface"
            value={lot.surface_area ? `${lot.surface_area} m²` : 'Non renseigné'}
            subtitle={lot.nb_rooms ? `${lot.nb_rooms} pièce${lot.nb_rooms > 1 ? 's' : ''}` : ''}
            variant="blue"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            }
          />

          <StatCard
            title="DPE"
            value={lot.dpe_rating || 'Non renseigné'}
            subtitle={lot.dpe_value ? `${lot.dpe_value} kWh/m²/an` : ''}
            variant="indigo"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          />

          <StatCard
            title="Statut"
            value={lot.status === 'occupied' ? 'Occupé' : lot.status === 'vacant' ? 'Vacant' : 'Indisponible'}
            subtitle={lot.status === 'occupied' ? 'Bail actif' : lot.status === 'vacant' ? 'Disponible' : ''}
            variant={lot.status === 'occupied' ? 'blue' : lot.status === 'vacant' ? 'emerald' : 'red'}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Caractéristiques */}
        <Card title="Caractéristiques">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lot.surface_area && (
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">Surface</p>
                <p className="text-lg font-semibold text-[var(--text)]">{lot.surface_area} m²</p>
              </div>
            )}
            {lot.nb_rooms && (
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">Nombre de pièces</p>
                <p className="text-lg font-semibold text-[var(--text)]">{lot.nb_rooms}</p>
              </div>
            )}
            {lot.nb_bedrooms && (
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">Nombre de chambres</p>
                <p className="text-lg font-semibold text-[var(--text)]">{lot.nb_bedrooms}</p>
              </div>
            )}
            {lot.nb_bathrooms && (
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">Salles de bain</p>
                <p className="text-lg font-semibold text-[var(--text)]">{lot.nb_bathrooms}</p>
              </div>
            )}
            {lot.heating_type && (
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">Chauffage</p>
                <p className="text-lg font-semibold text-[var(--text)]">{lot.heating_type}</p>
              </div>
            )}
            {lot.deposit_amount && (
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">Dépôt de garantie</p>
                <p className="text-lg font-semibold text-[var(--text)]">{lot.deposit_amount.toFixed(2)} €</p>
              </div>
            )}
          </div>
        </Card>

        {/* Équipements */}
        <Card title="Équipements">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {lot.furnished && (
              <div className="flex items-center text-sm text-[var(--text)]">
                <svg className="w-5 h-5 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Meublé</span>
              </div>
            )}
            {lot.has_parking && (
              <div className="flex items-center text-sm text-[var(--text)]">
                <svg className="w-5 h-5 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Parking</span>
              </div>
            )}
            {lot.has_cellar && (
              <div className="flex items-center text-sm text-[var(--text)]">
                <svg className="w-5 h-5 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Cave</span>
              </div>
            )}
            {lot.has_balcony && (
              <div className="flex items-center text-sm text-[var(--text)]">
                <svg className="w-5 h-5 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Balcon</span>
              </div>
            )}
            {lot.has_terrace && (
              <div className="flex items-center text-sm text-[var(--text)]">
                <svg className="w-5 h-5 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Terrasse</span>
              </div>
            )}
            {lot.has_garden && (
              <div className="flex items-center text-sm text-[var(--text)]">
                <svg className="w-5 h-5 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Jardin</span>
              </div>
            )}
            {lot.has_elevator && (
              <div className="flex items-center text-sm text-[var(--text)]">
                <svg className="w-5 h-5 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Ascenseur</span>
              </div>
            )}
          </div>
        </Card>

        {/* DPE */}
        {(lot.dpe_rating || lot.ges_rating) && (
          <Card title="Diagnostics énergétiques">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {lot.dpe_rating && (
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">DPE (Diagnostic de Performance Énergétique)</p>
                  <div className="flex items-center space-x-3">
                    <div className={`${getDPEColor(lot.dpe_rating)} text-white font-bold text-2xl w-12 h-12 rounded-xl flex items-center justify-center`}>
                      {lot.dpe_rating}
                    </div>
                    {lot.dpe_value && (
                      <span className="text-lg text-[var(--text)]">{lot.dpe_value} kWh/m²/an</span>
                    )}
                  </div>
                  {lot.dpe_date && (
                    <p className="text-xs text-[var(--text-muted)] mt-2">
                      Date du diagnostic : {new Date(lot.dpe_date).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              )}
              {lot.ges_rating && (
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">GES (Gaz à Effet de Serre)</p>
                  <div className="flex items-center space-x-3">
                    <div className={`${getDPEColor(lot.ges_rating)} text-white font-bold text-2xl w-12 h-12 rounded-xl flex items-center justify-center`}>
                      {lot.ges_rating}
                    </div>
                    {lot.ges_value && (
                      <span className="text-lg text-[var(--text)]">{lot.ges_value} kg CO2/m²/an</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Bail actif */}
        {activeLease && (
          <Card
            title="Bail actif"
            subtitle={activeLease.tenants.tenant_groups ?
              `${activeLease.tenants.tenant_groups.group_type === 'couple' ? '👫 Couple' :
                 activeLease.tenants.tenant_groups.group_type === 'colocation' ? '👥 Colocation' :
                 '👤 Individuel'}` :
              'Locataire actuel'}
          >
            <div className="bg-[var(--color-electric-blue)]/10 p-4 rounded-xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display font-semibold text-lg text-[var(--text)]">
                    {activeLease.tenants.tenant_groups?.name ||
                     `${activeLease.tenants.first_name} ${activeLease.tenants.last_name}`}
                  </p>
                  {activeLease.tenants.tenant_groups && (
                    <p className="text-sm text-[var(--text-secondary)] mb-2">
                      Locataire principal : {activeLease.tenants.first_name} {activeLease.tenants.last_name}
                    </p>
                  )}
                  <p className="text-sm text-[var(--text-secondary)]">{activeLease.tenants.email}</p>
                  {activeLease.tenants.phone && (
                    <p className="text-sm text-[var(--text-secondary)]">{activeLease.tenants.phone}</p>
                  )}
                  <p className="text-sm text-[var(--text-muted)] mt-2">
                    Début du bail : {new Date(activeLease.start_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/leases/${activeLease.id}`)}
                  >
                    Voir le bail
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(activeLease.tenants.tenant_groups ?
                      `/tenants/${activeLease.tenants.tenant_groups.id}` :
                      `/tenants/${activeLease.tenants.id}`)}
                  >
                    Voir {activeLease.tenants.tenant_groups ? 'le groupe' : 'le locataire'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Bouton créer un bail si vacant */}
        {lot.status === 'vacant' && (
          <Card>
            <div className="text-center py-6">
              <p className="text-[var(--text-secondary)] mb-4">Ce lot est actuellement vacant</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => navigate(`/leases/new?lot=${id}`)}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Créer un bail
                </Button>
                <Button variant="secondary" onClick={() => setShowInvitationModal(true)}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Générer un lien d'invitation
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Candidatures pour les lots vacants */}
        {lot.status === 'vacant' && candidates.length > 0 && (
          <Card
            title="Candidatures"
            subtitle={`${candidates.length} candidature${candidates.length > 1 ? 's' : ''} reçue${candidates.length > 1 ? 's' : ''}`}
          >
            <div className="space-y-3">
              {candidates.slice(0, 5).map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-center justify-between p-4 bg-[var(--surface-elevated)] rounded-xl hover:bg-[var(--surface-hover)] cursor-pointer transition-colors"
                  onClick={() => navigate(`/candidates/${candidate.id}`)}
                >
                  <div>
                    <p className="font-medium text-[var(--text)]">
                      {candidate.first_name} {candidate.last_name}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">{candidate.email}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Candidature du {new Date(candidate.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        candidate.solvability_score >= 3
                          ? 'success'
                          : candidate.solvability_score >= 2
                          ? 'warning'
                          : 'danger'
                      }
                    >
                      Score: {candidate.solvability_score}/5
                    </Badge>
                    <Badge
                      variant={
                        candidate.status === 'pending'
                          ? 'default'
                          : candidate.status === 'accepted'
                          ? 'success'
                          : candidate.status === 'rejected'
                          ? 'danger'
                          : 'info'
                      }
                    >
                      {candidate.status === 'pending'
                        ? 'En attente'
                        : candidate.status === 'accepted'
                        ? 'Acceptée'
                        : candidate.status === 'rejected'
                        ? 'Refusée'
                        : 'En cours'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            {candidates.length > 5 && (
              <div className="mt-4 text-center">
                <Button variant="secondary" onClick={() => navigate(`/candidates?lot=${id}`)}>
                  Voir toutes les candidatures ({candidates.length})
                </Button>
              </div>
            )}
            <div className="mt-4 pt-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/candidates?lot=${id}`)}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Gérer les candidatures
              </Button>
            </div>
          </Card>
        )}

        {/* Historique des baux */}
        {pastLeases.length > 0 && (
          <Card title="Historique des baux" subtitle={`${pastLeases.length} bail${pastLeases.length > 1 ? 'x' : ''} passé${pastLeases.length > 1 ? 's' : ''}`}>
            <div className="space-y-3">
              {pastLeases.map((lease) => (
                <div
                  key={lease.id}
                  className="flex items-center justify-between p-4 bg-[var(--surface-elevated)] rounded-xl hover:bg-[var(--surface-hover)] cursor-pointer transition-colors"
                  onClick={() => navigate(`/leases/${lease.id}`)}
                >
                  <div>
                    <p className="font-medium text-[var(--text)]">
                      {lease.tenants.tenant_groups?.name ||
                       `${lease.tenants.first_name} ${lease.tenants.last_name}`}
                    </p>
                    {lease.tenants.tenant_groups && (
                      <p className="text-xs text-[var(--text-muted)]">
                        {lease.tenants.tenant_groups.group_type === 'couple' && '👫 Couple'}
                        {lease.tenants.tenant_groups.group_type === 'colocation' && '👥 Colocation'}
                        {lease.tenants.tenant_groups.group_type === 'individual' && '👤 Individuel'}
                      </p>
                    )}
                    <p className="text-sm text-[var(--text-secondary)]">
                      {new Date(lease.start_date).toLocaleDateString('fr-FR')} - {lease.end_date ? new Date(lease.end_date).toLocaleDateString('fr-FR') : 'En cours'}
                    </p>
                  </div>
                  <Badge variant={lease.status === 'terminated' ? 'default' : 'warning'}>
                    {lease.status === 'terminated' ? 'Terminé' : 'Archivé'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Description et notes */}
        {(lot.description || lot.notes) && (
          <Card title="Informations additionnelles">
            {lot.description && (
              <div className="mb-4">
                <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">Description</p>
                <p className="text-[var(--text)]">{lot.description}</p>
              </div>
            )}
            {lot.notes && (
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">Notes privées</p>
                <p className="text-[var(--text)]">{lot.notes}</p>
              </div>
            )}
          </Card>
        )}

        {/* Modal lien d'invitation */}
        {showInvitationModal && (
          <InvitationLinkModal
            lot={lot}
            onClose={() => setShowInvitationModal(false)}
            onSuccess={() => {
              setShowInvitationModal(false)
              fetchLotDetails()
            }}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

export default LotDetail
