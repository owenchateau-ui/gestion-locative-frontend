import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import DashboardLayout from '../components/layout/DashboardLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Alert from '../components/ui/Alert'
import Loading from '../components/ui/Loading'
import Breadcrumb from '../components/ui/Breadcrumb'
import { useToast } from '../context/ToastContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import {
  Home,
  Users,
  Calendar,
  Euro,
  FileText,
  Edit,
  Trash2,
  ArrowLeft,
  Building2,
  MapPin
} from 'lucide-react'

function LeaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { success, error: showError } = useToast()

  const [lease, setLease] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useDocumentTitle(lease ? `Bail ${lease.lot?.name}` : 'Détail bail')

  useEffect(() => {
    loadLease()
  }, [id])

  const loadLease = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: leaseError } = await supabase
        .from('leases')
        .select(`
          *,
          lot:lots!inner(
            id,
            name,
            rent_amount,
            charges_amount,
            deposit_amount,
            properties_new!inner(
              id,
              name,
              address,
              city,
              postal_code,
              entity_id,
              entities!inner(id, name, color)
            )
          ),
          tenant:tenants!inner(
            id,
            first_name,
            last_name,
            email,
            phone,
            group_id,
            is_main_tenant,
            tenant_groups!group_id(
              id,
              name,
              group_type,
              couple_status,
              housing_assistance
            )
          )
        `)
        .eq('id', id)
        .single()

      if (leaseError) throw leaseError
      setLease(data)
    } catch (err) {
      console.error('Error loading lease:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce bail ?')) {
      return
    }

    setDeleting(true)
    try {
      const { error } = await supabase
        .from('leases')
        .delete()
        .eq('id', id)

      if (error) throw error

      success('Bail supprimé avec succès')
      navigate('/leases')
    } catch (err) {
      console.error('Error deleting lease:', err)
      showError('Erreur lors de la suppression : ' + err.message)
      setDeleting(false)
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      active: 'success',
      pending: 'warning',
      terminated: 'default',
      cancelled: 'danger'
    }
    const labels = {
      active: 'Actif',
      pending: 'En attente',
      terminated: 'Terminé',
      cancelled: 'Annulé'
    }
    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  if (loading) {
    return (
      <DashboardLayout title="Détail bail">
        <Loading />
      </DashboardLayout>
    )
  }

  if (error || !lease) {
    return (
      <DashboardLayout title="Détail bail">
        <Alert variant="error" title="Erreur">
          {error || 'Bail introuvable'}
        </Alert>
        <Button onClick={() => navigate('/leases')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la liste
        </Button>
      </DashboardLayout>
    )
  }

  const totalRent = lease.rent_amount + (lease.charges_amount || 0)
  const housingAssistance = lease.tenant?.tenant_groups?.housing_assistance || 0
  const netRent = totalRent - housingAssistance

  const breadcrumbItems = [
    { label: 'Entités', href: '/entities' },
    { label: lease.lot.properties_new.entities.name, href: `/entities/${lease.lot.properties_new.entity_id}` },
    { label: lease.lot.properties_new.name, href: `/properties/${lease.lot.properties_new.id}` },
    { label: lease.lot.name, href: `/lots/${lease.lot.id}` },
    { label: 'Bail' }
  ]

  return (
    <DashboardLayout title={`Bail - ${lease.lot.name}`}>
      <Breadcrumb items={breadcrumbItems} />

      {/* En-tête avec actions */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="secondary" onClick={() => navigate('/leases')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <div className="flex gap-3">
          <Button onClick={() => navigate(`/leases/${id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="w-4 h-4 mr-2" />
            {deleting ? 'Suppression...' : 'Supprimer'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <Card title="Informations du bail" className="lg:col-span-2">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-[var(--text-muted)] mt-1" />
              <div>
                <div className="text-sm text-[var(--text-secondary)]">Statut</div>
                {getStatusBadge(lease.status)}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[var(--text-muted)] mt-1" />
              <div>
                <div className="text-sm text-[var(--text-secondary)]">Période</div>
                <div className="font-medium text-[var(--text)]">
                  Du {new Date(lease.start_date).toLocaleDateString('fr-FR')} au{' '}
                  {new Date(lease.end_date).toLocaleDateString('fr-FR')}
                </div>
                <div className="text-sm text-[var(--text-muted)]">
                  Durée : {Math.round((new Date(lease.end_date) - new Date(lease.start_date)) / (1000 * 60 * 60 * 24 * 30))} mois
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Euro className="w-5 h-5 text-[var(--text-muted)] mt-1" />
              <div className="w-full">
                <div className="text-sm text-[var(--text-secondary)] mb-2">Loyer mensuel</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Loyer :</span>
                    <span className="font-medium text-[var(--text)]">{lease.rent_amount.toFixed(2)} €</span>
                  </div>
                  {lease.charges_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Charges :</span>
                      <span className="font-medium text-[var(--text)]">{lease.charges_amount.toFixed(2)} €</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-[var(--border)]">
                    <span className="font-semibold text-[var(--text)]">Total loyer :</span>
                    <span className="font-semibold text-lg text-[var(--text)]">{totalRent.toFixed(2)} €</span>
                  </div>
                  {housingAssistance > 0 && (
                    <>
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                        <span>Aides au logement (CAF/APL) :</span>
                        <span className="font-medium">- {housingAssistance.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-xl">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-300">Loyer net à payer :</span>
                        <span className="font-semibold text-lg text-emerald-700 dark:text-emerald-300">{netRent.toFixed(2)} €</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {lease.deposit_amount && (
              <div className="flex items-start gap-3">
                <Euro className="w-5 h-5 text-[var(--text-muted)] mt-1" />
                <div>
                  <div className="text-sm text-[var(--text-secondary)]">Dépôt de garantie</div>
                  <div className="font-medium text-[var(--text)]">{lease.deposit_amount.toFixed(2)} €</div>
                </div>
              </div>
            )}

            {lease.notes && (
              <div className="pt-4 border-t border-[var(--border)]">
                <div className="text-sm text-[var(--text-secondary)] mb-1">Notes</div>
                <div className="text-[var(--text)]">{lease.notes}</div>
              </div>
            )}
          </div>
        </Card>

        {/* Carte lot */}
        <div className="space-y-6">
          <Card title="Lot loué">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Home className="w-5 h-5 text-[var(--text-muted)] mt-1" />
                <div>
                  <div className="text-sm text-[var(--text-secondary)]">Lot</div>
                  <div className="font-medium text-[var(--text)]">{lease.lot.name}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-[var(--text-muted)] mt-1" />
                <div>
                  <div className="text-sm text-[var(--text-secondary)]">Propriété</div>
                  <div className="font-medium text-[var(--text)]">{lease.lot.properties_new.name}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[var(--text-muted)] mt-1" />
                <div>
                  <div className="text-sm text-[var(--text-secondary)]">Adresse</div>
                  <div className="text-sm text-[var(--text)]">
                    {lease.lot.properties_new.address}
                    <br />
                    {lease.lot.properties_new.postal_code} {lease.lot.properties_new.city}
                  </div>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/lots/${lease.lot.id}`)}
                className="w-full mt-4"
              >
                Voir le lot
              </Button>
            </div>
          </Card>

          {/* Carte locataire */}
          <Card title="Locataire">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-[var(--text-muted)] mt-1" />
                <div>
                  <div className="text-sm text-[var(--text-secondary)]">
                    {lease.tenant.tenant_groups ? 'Groupe' : 'Locataire'}
                  </div>
                  <div className="font-medium text-[var(--text)]">
                    {lease.tenant.tenant_groups?.name ||
                     `${lease.tenant.first_name} ${lease.tenant.last_name}`}
                  </div>
                  {lease.tenant.tenant_groups && (
                    <div className="text-xs text-[var(--text-muted)] mt-1">
                      {lease.tenant.tenant_groups.group_type === 'couple' && '👫 Couple'}
                      {lease.tenant.tenant_groups.group_type === 'colocation' && '👥 Colocation'}
                      {lease.tenant.tenant_groups.group_type === 'individual' && '👤 Individuel'}
                      {lease.tenant.tenant_groups.couple_status && (
                        <> - {lease.tenant.tenant_groups.couple_status === 'married' ? 'Mariés' :
                             lease.tenant.tenant_groups.couple_status === 'pacs' ? 'Pacsés' : 'Concubinage'}</>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {lease.tenant.tenant_groups && (
                <div className="text-sm text-[var(--text-secondary)]">
                  Locataire principal : {lease.tenant.first_name} {lease.tenant.last_name}
                </div>
              )}

              <div className="text-sm">
                <div className="text-[var(--text-secondary)]">Email</div>
                <div className="text-[var(--text)]">{lease.tenant.email}</div>
              </div>

              {lease.tenant.phone && (
                <div className="text-sm">
                  <div className="text-[var(--text-secondary)]">Téléphone</div>
                  <div className="text-[var(--text)]">{lease.tenant.phone}</div>
                </div>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(lease.tenant.tenant_groups ?
                  `/tenants/${lease.tenant.tenant_groups.id}` :
                  `/tenants/${lease.tenant.id}`)}
                className="w-full mt-4"
              >
                Voir {lease.tenant.tenant_groups ? 'le groupe' : 'le locataire'}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Paiements */}
      <Card title="Paiements" className="mt-6">
        <div className="flex items-center justify-between">
          <p className="text-[var(--text-secondary)]">
            Consultez l'historique des paiements pour ce bail
          </p>
          <Button
            variant="secondary"
            onClick={() => navigate(`/payments?lease=${id}`)}
          >
            Voir les paiements
          </Button>
        </div>
      </Card>
    </DashboardLayout>
  )
}

export default LeaseDetail
