import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useEntity } from '../context/EntityContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

function Tenants() {
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { selectedEntity } = useEntity()

  useEffect(() => {
    fetchTenants()
  }, [user, selectedEntity])

  const fetchTenants = async () => {
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

      // Récupérer tous les locataires avec leurs baux
      const { data, error: tenantsError } = await supabase
        .from('tenants')
        .select(`
          *,
          leases (
            id,
            lot:lots!inner (
              properties_new!inner (
                entity_id
              )
            )
          )
        `)
        .eq('landlord_id', userData.id)
        .order('created_at', { ascending: false })

      if (tenantsError) throw tenantsError

      // Filtrer par entité si nécessaire
      let filteredTenants = data || []
      if (selectedEntity && data) {
        filteredTenants = data.filter(tenant =>
          tenant.leases?.some(lease =>
            lease.lot?.properties_new?.entity_id === selectedEntity
          )
        )
      }

      // Retirer les baux de la structure avant de setter
      const tenantsWithoutLeases = filteredTenants.map(({ leases, ...tenant }) => tenant)

      setTenants(tenantsWithoutLeases)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce locataire ?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', id)

      if (error) throw error

      fetchTenants()
    } catch (error) {
      alert('Erreur lors de la suppression : ' + error.message)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR')
  }

  if (loading) {
    return (
      <DashboardLayout title="Mes locataires">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-500">Chargement...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Mes locataires">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mes locataires</h2>
            <p className="text-sm text-gray-600 mt-1">
              {tenants.length} locataire{tenants.length > 1 ? 's' : ''}
            </p>
          </div>
          <Button onClick={() => navigate('/tenants/new')} size="lg">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un locataire
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {tenants.length === 0 ? (
          <Card className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun locataire</h3>
            <p className="text-gray-600 mb-6">
              Commencez par ajouter votre premier locataire
            </p>
            <Button onClick={() => navigate('/tenants/new')}>
              Ajouter votre premier locataire
            </Button>
          </Card>
        ) : (
          <Card padding={false}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom complet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Téléphone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date de naissance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {tenant.first_name} {tenant.last_name}
                        </div>
                        {tenant.place_of_birth && (
                          <div className="text-sm text-gray-500">
                            Né(e) à {tenant.place_of_birth}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{tenant.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {tenant.phone || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(tenant.date_of_birth)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <button
                          onClick={() => navigate(`/tenants/${tenant.id}/edit`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(tenant.id)}
                          className="text-red-600 hover:text-red-900"
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

export default Tenants
