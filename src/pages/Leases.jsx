import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useEntity } from '../context/EntityContext'
import { useToast } from '../context/ToastContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import ExportButton from '../components/ui/ExportButton'
import Alert from '../components/ui/Alert'
import { FileText, Download, Loader2 } from 'lucide-react'
import { generateBailVidePDF, generateBailMeublePDF } from '../services/leaseDocumentService'

function Leases() {
  const [leases, setLeases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [generatingPDF, setGeneratingPDF] = useState(null) // ID du bail en cours de génération
  const navigate = useNavigate()
  const { user } = useAuth()
  const { selectedEntity } = useEntity()
  const { success, error: showError } = useToast()

  useEffect(() => {
    fetchLeases()
  }, [user, selectedEntity])

  const fetchLeases = async () => {
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

      let leasesQuery = supabase
        .from('leases')
        .select(`
          *,
          lot:lots!inner(
            id,
            name,
            properties_new!inner(id, name, entity_id, entities!inner(id, name, color, user_id))
          ),
          tenant:tenants!inner(
            id,
            first_name,
            last_name,
            group_id,
            is_main_tenant,
            tenant_groups!group_id(id, name, group_type)
          )
        `)
        .eq('lot.properties_new.entities.user_id', userData.id)
        .order('created_at', { ascending: false })

      if (selectedEntity) {
        leasesQuery = leasesQuery.eq('lot.properties_new.entity_id', selectedEntity)
      }

      const { data, error: leasesError } = await leasesQuery

      if (leasesError) throw leasesError

      setLeases(data || [])
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce bail ?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('leases')
        .delete()
        .eq('id', id)

      if (error) throw error

      fetchLeases()
    } catch (err) {
      showError(`Erreur lors de la suppression : ${err.message}`)
    }
  }

  const handleGeneratePDF = async (lease) => {
    setGeneratingPDF(lease.id)

    try {
      // Récupérer les données complètes nécessaires pour le bail
      const { data: fullLeaseData, error: leaseError } = await supabase
        .from('leases')
        .select(`
          *,
          lot:lots!inner(
            *,
            properties_new!inner(
              *,
              entities!inner(*)
            )
          ),
          tenant:tenants!inner(*)
        `)
        .eq('id', lease.id)
        .single()

      if (leaseError) throw leaseError

      const leaseData = fullLeaseData
      const tenant = fullLeaseData.tenant
      const lot = fullLeaseData.lot
      const property = fullLeaseData.lot.properties_new
      const entity = fullLeaseData.lot.properties_new.entities

      // Récupérer les infos du bailleur (user)
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('supabase_uid', user.id)
        .single()

      // Générer le bon type de bail
      let filename
      if (lease.lease_type === 'furnished' || lease.lease_type === 'meuble') {
        filename = await generateBailMeublePDF(leaseData, userData, tenant, lot, property, entity)
      } else {
        filename = await generateBailVidePDF(leaseData, userData, tenant, lot, property, entity)
      }

      success(`Bail généré avec succès : ${filename}`)
    } catch (err) {
      console.error('Erreur génération PDF:', err)
      showError(`Erreur lors de la génération : ${err.message}`)
    } finally {
      setGeneratingPDF(null)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Reconduction tacite'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR')
  }

  const getStatusBadge = (status) => {
    const variants = {
      draft: 'default',
      active: 'success',
      terminated: 'danger',
      archived: 'warning'
    }
    const labels = {
      draft: 'Brouillon',
      active: 'Actif',
      terminated: 'Résilié',
      archived: 'Archivé'
    }
    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  const getLeaseTypeLabel = (type) => {
    return type === 'empty' ? 'Vide' : 'Meublé'
  }

  if (loading) {
    return (
      <DashboardLayout title="Mes baux">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="animate-pulse bg-[var(--border)] rounded-lg h-8 w-40" />
              <div className="animate-pulse bg-[var(--border)] rounded-lg h-4 w-20" />
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
    <DashboardLayout title="Mes baux">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-display font-bold text-[var(--text)]">Mes baux</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {leases.length} bail{leases.length > 1 ? 'x' : ''}
            </p>
          </div>
          <div className="flex gap-3">
            <ExportButton
              data={leases.map(l => ({
                ...l,
                tenant_name: l.tenant.tenant_groups?.name || `${l.tenant.first_name} ${l.tenant.last_name}`
              }))}
              type="leases"
              filename="baux"
            />
            <Button onClick={() => navigate('/leases/new')} size="lg">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Créer un bail
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="error">{error}</Alert>
        )}

        {leases.length === 0 ? (
          <Card padding>
            <EmptyState
              icon={FileText}
              title="Aucun bail"
              description="Créez votre premier bail pour commencer"
              actionLabel="Créer votre premier bail"
              onAction={() => navigate('/leases/new')}
            />
          </Card>
        ) : (
          <Card padding={false}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--border)]">
                <thead className="bg-[var(--surface-elevated)]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Bien / Lot
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Locataire
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Période
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Loyer total
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Type
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
                  {leases.map((lease) => (
                    <tr key={lease.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[var(--text)]">
                          {lease.lot.properties_new.name}
                        </div>
                        <div className="text-sm text-[var(--text-muted)]">
                          {lease.lot.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--text)]">
                          {lease.tenant.tenant_groups?.name || `${lease.tenant.first_name} ${lease.tenant.last_name}`}
                        </div>
                        {lease.tenant.tenant_groups && (
                          <div className="text-xs text-[var(--text-muted)]">
                            {lease.tenant.tenant_groups.group_type === 'couple' && '👫 Couple'}
                            {lease.tenant.tenant_groups.group_type === 'colocation' && '👥 Colocation'}
                            {lease.tenant.tenant_groups.group_type === 'individual' && '👤 Individuel'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[var(--text)]">
                          Du {formatDate(lease.start_date)}
                        </div>
                        <div className="text-sm text-[var(--text-muted)]">
                          Au {formatDate(lease.end_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-[var(--text)]">
                          {(parseFloat(lease.rent_amount) + parseFloat(lease.charges_amount)).toFixed(2)} €
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          Loyer: {parseFloat(lease.rent_amount).toFixed(2)} € + Charges: {parseFloat(lease.charges_amount).toFixed(2)} €
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--text)]">
                          {getLeaseTypeLabel(lease.lease_type)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(lease.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <button
                          onClick={() => navigate(`/leases/${lease.id}/edit`)}
                          className="text-[var(--color-electric-blue)] hover:text-[var(--color-electric-blue-dark)] transition-colors"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(lease.id)}
                          className="text-[var(--color-vivid-coral)] hover:text-[var(--color-coral-dark)] transition-colors"
                        >
                          Supprimer
                        </button>
                        <button
                          className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors disabled:opacity-50"
                          onClick={() => handleGeneratePDF(lease)}
                          disabled={generatingPDF === lease.id}
                        >
                          {generatingPDF === lease.id ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Génération...
                            </>
                          ) : (
                            <>
                              <Download className="w-3 h-3" />
                              PDF
                            </>
                          )}
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

export default Leases
