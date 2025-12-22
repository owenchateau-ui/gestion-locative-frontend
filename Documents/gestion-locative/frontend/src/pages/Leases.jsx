import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useEntity } from '../context/EntityContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'

function Leases() {
  const [leases, setLeases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { selectedEntity } = useEntity()

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
          tenant:tenants!inner(id, first_name, last_name, landlord_id)
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
    } catch (error) {
      alert('Erreur lors de la suppression : ' + error.message)
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
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-500">Chargement...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Mes baux">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mes baux</h2>
            <p className="text-sm text-gray-600 mt-1">
              {leases.length} bail{leases.length > 1 ? 'x' : ''}
            </p>
          </div>
          <Button onClick={() => navigate('/leases/new')} size="lg">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Créer un bail
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {leases.length === 0 ? (
          <Card className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun bail</h3>
            <p className="text-gray-600 mb-6">
              Créez votre premier bail pour commencer
            </p>
            <Button onClick={() => navigate('/leases/new')}>
              Créer votre premier bail
            </Button>
          </Card>
        ) : (
          <Card padding={false}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bien / Lot
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Locataire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Période
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loyer total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leases.map((lease) => (
                    <tr key={lease.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {lease.lot.properties_new.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {lease.lot.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {lease.tenant.first_name} {lease.tenant.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          Du {formatDate(lease.start_date)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Au {formatDate(lease.end_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {(parseFloat(lease.rent_amount) + parseFloat(lease.charges_amount)).toFixed(2)} €
                        </div>
                        <div className="text-xs text-gray-500">
                          Loyer: {parseFloat(lease.rent_amount).toFixed(2)} € + Charges: {parseFloat(lease.charges_amount).toFixed(2)} €
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getLeaseTypeLabel(lease.lease_type)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(lease.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <button
                          onClick={() => navigate(`/leases/${lease.id}/edit`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(lease.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Supprimer
                        </button>
                        <button
                          className="text-emerald-600 hover:text-emerald-900"
                          onClick={() => alert('Génération PDF à venir')}
                        >
                          PDF
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
