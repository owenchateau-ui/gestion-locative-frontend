import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Alert from '../components/ui/Alert'
import Loading from '../components/ui/Loading'
import Breadcrumb from '../components/ui/Breadcrumb'
import { useToast } from '../context/ToastContext'
import { getTenantGroupById, deleteTenantGroup, calculateGroupIncome } from '../services/tenantGroupService'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import {
  Users,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  Euro,
  FileText,
  Home,
  Trash2,
  Edit,
  ArrowLeft,
  Heart,
  Building2
} from 'lucide-react'

const GROUP_TYPE_LABELS = {
  individual: 'Individuel',
  couple: 'Couple',
  colocation: 'Colocation'
}

const COUPLE_STATUS_LABELS = {
  married: 'Mariés',
  pacs: 'Pacsés',
  concubinage: 'Concubinage'
}

function TenantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { success, error: showError } = useToast()

  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useDocumentTitle(group ? group.name : 'Détail locataire')

  useEffect(() => {
    loadGroup()
  }, [id])

  const loadGroup = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getTenantGroupById(id)
      setGroup(data)
    } catch (err) {
      console.error('Error loading tenant group:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le groupe "${group.name}" et tous ses locataires ?`)) {
      return
    }

    setDeleting(true)
    try {
      await deleteTenantGroup(id)
      success('Groupe de locataires supprimé avec succès')
      navigate('/tenants')
    } catch (err) {
      console.error('Error deleting tenant group:', err)
      showError('Erreur lors de la suppression : ' + err.message)
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Détail locataire">
        <Loading />
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout title="Détail locataire">
        <Alert variant="error" title="Erreur">
          {error}
        </Alert>
        <Button onClick={() => navigate('/tenants')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la liste
        </Button>
      </DashboardLayout>
    )
  }

  if (!group) {
    return (
      <DashboardLayout title="Détail locataire">
        <Alert variant="error" title="Non trouvé">
          Groupe de locataires introuvable
        </Alert>
        <Button onClick={() => navigate('/tenants')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la liste
        </Button>
      </DashboardLayout>
    )
  }

  const totalIncome = calculateGroupIncome(group.tenants || [])
  const mainTenant = group.tenants?.find(t => t.is_main_tenant) || group.tenants?.[0]

  const breadcrumbItems = [
    { label: 'Locataires', href: '/tenants' },
    { label: group.name }
  ]

  return (
    <DashboardLayout title={group.name}>
      <Breadcrumb items={breadcrumbItems} />

      {/* En-tête avec actions */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="secondary" onClick={() => navigate('/tenants')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <div className="flex gap-3">
          <Button onClick={() => navigate(`/tenants/${id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="w-4 h-4 mr-2" />
            {deleting ? 'Suppression...' : 'Supprimer'}
          </Button>
        </div>
      </div>

      {/* Informations du groupe */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card title="Informations du groupe" className="lg:col-span-2">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-[var(--text-muted)] mt-1" />
              <div>
                <div className="text-sm text-[var(--text-secondary)]">Type de groupe</div>
                <div className="font-medium text-[var(--text)]">{GROUP_TYPE_LABELS[group.group_type]}</div>
              </div>
            </div>

            {group.group_type === 'couple' && group.couple_status && (
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-[var(--text-muted)] mt-1" />
                <div>
                  <div className="text-sm text-[var(--text-secondary)]">Statut du couple</div>
                  <div className="font-medium text-[var(--text)]">{COUPLE_STATUS_LABELS[group.couple_status]}</div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Euro className="w-5 h-5 text-[var(--text-muted)] mt-1" />
              <div>
                <div className="text-sm text-[var(--text-secondary)]">Revenus mensuels totaux</div>
                <div className="font-medium text-lg text-[var(--text)]">{totalIncome.toLocaleString('fr-FR')} €</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[var(--text-muted)] mt-1" />
              <div>
                <div className="text-sm text-[var(--text-secondary)]">Date de création</div>
                <div className="font-medium text-[var(--text)]">
                  {new Date(group.created_at).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Bail actif */}
        {group.lease ? (
          <Card title="Bail actif">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Home className="w-5 h-5 text-[var(--text-muted)] mt-1" />
                <div>
                  <div className="text-sm text-[var(--text-secondary)]">Lot</div>
                  <div className="font-medium text-[var(--text)]">{group.lease.lot?.name}</div>
                  {group.lease.lot?.property && (
                    <div className="text-sm text-[var(--text-muted)]">
                      {group.lease.lot.property.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Euro className="w-5 h-5 text-[var(--text-muted)] mt-1" />
                <div className="w-full">
                  <div className="text-sm text-[var(--text-secondary)] mb-2">Montants mensuels</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">Loyer + Charges :</span>
                      <span className="font-medium text-[var(--text)]">
                        {(group.lease.rent_amount + group.lease.charges_amount).toLocaleString('fr-FR')} €
                      </span>
                    </div>
                    {group.housing_assistance > 0 && (
                      <>
                        <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                          <span>Aides (CAF/APL) :</span>
                          <span className="font-medium">- {group.housing_assistance.toLocaleString('fr-FR')} €</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-xl">
                          <span className="font-semibold text-emerald-700 dark:text-emerald-300">Loyer net :</span>
                          <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                            {((group.lease.rent_amount + group.lease.charges_amount) - group.housing_assistance).toLocaleString('fr-FR')} €
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-[var(--text-muted)] mt-1" />
                <div>
                  <div className="text-sm text-[var(--text-secondary)]">Période</div>
                  <div className="font-medium text-[var(--text)]">
                    {new Date(group.lease.start_date).toLocaleDateString('fr-FR')} -{' '}
                    {new Date(group.lease.end_date).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>

              {totalIncome > 0 && (
                <div className="pt-3 border-t border-[var(--border)]">
                  <div className="text-sm text-[var(--text-secondary)]">Taux d'effort</div>
                  <div className="font-medium">
                    {group.housing_assistance > 0 ? (
                      <>
                        <div className="text-[var(--text-muted)] line-through text-sm">
                          Avant aides : {((group.lease.rent_amount / totalIncome) * 100).toFixed(1)} %
                        </div>
                        <div className="text-lg text-emerald-600 dark:text-emerald-400">
                          Après aides : {((((group.lease.rent_amount + group.lease.charges_amount) - group.housing_assistance) / totalIncome) * 100).toFixed(1)} %
                        </div>
                      </>
                    ) : (
                      <div className="text-[var(--text)]">{((group.lease.rent_amount / totalIncome) * 100).toFixed(1)} %</div>
                    )}
                  </div>
                </div>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/leases/${group.lease.id}`)}
                className="w-full"
              >
                Voir le bail
              </Button>
            </div>
          </Card>
        ) : (
          <Card title="Bail">
            <Alert variant="info">
              Aucun bail actif pour ce groupe de locataires
            </Alert>
          </Card>
        )}
      </div>

      {/* Liste des locataires */}
      <Card title={`Locataires du groupe (${group.tenants?.length || 0})`}>
        <div className="space-y-4">
          {group.tenants?.map((tenant, index) => (
            <div
              key={tenant.id}
              className={`p-4 rounded-xl border transition-colors ${
                tenant.is_main_tenant
                  ? 'border-[var(--color-electric-blue)]/30 bg-[var(--color-electric-blue)]/5 dark:bg-[var(--color-electric-blue)]/10'
                  : 'border-[var(--border)]'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-electric-blue)] text-white flex items-center justify-center font-display font-semibold">
                    {tenant.first_name?.[0]}{tenant.last_name?.[0]}
                  </div>
                  <div>
                    <div className="font-display font-semibold text-lg text-[var(--text)]">
                      {tenant.first_name} {tenant.last_name}
                    </div>
                    {tenant.is_main_tenant && (
                      <Badge variant="info">Locataire principal</Badge>
                    )}
                    {!tenant.is_main_tenant && tenant.relationship && (
                      <div className="text-sm text-[var(--text-muted)]">{tenant.relationship}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Informations personnelles */}
                <div className="space-y-3">
                  <div className="text-sm font-display font-semibold text-[var(--text-secondary)] mb-2">
                    Informations personnelles
                  </div>

                  {tenant.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-[var(--text-muted)]" />
                      <a href={`mailto:${tenant.email}`} className="text-[var(--color-electric-blue)] hover:underline transition-colors">
                        {tenant.email}
                      </a>
                    </div>
                  )}

                  {tenant.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-[var(--text-muted)]" />
                      <a href={`tel:${tenant.phone}`} className="text-[var(--color-electric-blue)] hover:underline transition-colors">
                        {tenant.phone}
                      </a>
                    </div>
                  )}

                  {tenant.birth_date && (
                    <div className="flex items-center gap-2 text-sm text-[var(--text)]">
                      <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
                      <span>
                        Né(e) le {new Date(tenant.birth_date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}

                  {tenant.birth_place && (
                    <div className="flex items-center gap-2 text-sm text-[var(--text)]">
                      <MapPin className="w-4 h-4 text-[var(--text-muted)]" />
                      <span>à {tenant.birth_place}</span>
                    </div>
                  )}
                </div>

                {/* Situation professionnelle */}
                <div className="space-y-3">
                  <div className="text-sm font-display font-semibold text-[var(--text-secondary)] mb-2">
                    Situation professionnelle
                  </div>

                  {tenant.professional_status && (
                    <div className="flex items-center gap-2 text-sm text-[var(--text)]">
                      <Briefcase className="w-4 h-4 text-[var(--text-muted)]" />
                      <span>{tenant.professional_status}</span>
                    </div>
                  )}

                  {tenant.employer_name && (
                    <div className="flex items-center gap-2 text-sm text-[var(--text)]">
                      <Building2 className="w-4 h-4 text-[var(--text-muted)]" />
                      <span>{tenant.employer_name}</span>
                    </div>
                  )}

                  {tenant.job_title && (
                    <div className="text-sm text-[var(--text-secondary)]">
                      Poste : {tenant.job_title}
                    </div>
                  )}

                  {tenant.contract_type && (
                    <div className="text-sm text-[var(--text-secondary)]">
                      Type : {tenant.contract_type}
                    </div>
                  )}

                  {tenant.employment_start_date && (
                    <div className="flex items-center gap-2 text-sm text-[var(--text)]">
                      <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
                      <span>
                        Depuis le {new Date(tenant.employment_start_date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}

                  {(tenant.monthly_income > 0 || tenant.other_income > 0) && (
                    <div className="pt-2 border-t border-[var(--border)]">
                      <div className="flex items-center gap-2 text-sm font-medium text-[var(--text)]">
                        <Euro className="w-4 h-4 text-[var(--text-muted)]" />
                        <span>
                          Revenus : {(tenant.monthly_income + tenant.other_income).toLocaleString('fr-FR')} €/mois
                        </span>
                      </div>
                      {tenant.monthly_income > 0 && (
                        <div className="text-xs text-[var(--text-muted)] ml-6">
                          Salaire : {tenant.monthly_income.toLocaleString('fr-FR')} €
                        </div>
                      )}
                      {tenant.other_income > 0 && (
                        <div className="text-xs text-[var(--text-muted)] ml-6">
                          Autres : {tenant.other_income.toLocaleString('fr-FR')} €
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {(!group.tenants || group.tenants.length === 0) && (
            <Alert variant="info">Aucun locataire dans ce groupe</Alert>
          )}
        </div>
      </Card>
    </DashboardLayout>
  )
}

export default TenantDetail
