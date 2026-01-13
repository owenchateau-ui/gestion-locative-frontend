import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Save, User, Users, Heart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useEntity } from '../context/EntityContext'
import { useToast } from '../context/ToastContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Alert from '../components/ui/Alert'
import Loading from '../components/ui/Loading'
import EntitySelect from '../components/entities/EntitySelect'
import { createTenantGroup, getTenantGroupById, updateTenantGroup } from '../services/tenantGroupService'
import { PROFESSIONAL_STATUS, CONTRACT_TYPES, RELATIONSHIPS } from '../constants/tenantConstants'

function TenantForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { selectedEntity } = useEntity()
  const { warning } = useToast()
  const isEditMode = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [entityId, setEntityId] = useState(selectedEntity || '')

  const [groupData, setGroupData] = useState({
    group_type: 'individual',
    couple_status: null,
    name: ''
  })

  const [tenants, setTenants] = useState([
    {
      tempId: Date.now(),
      is_main_tenant: true,
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      birth_date: '',
      birth_place: '',
      relationship: null,
      professional_status: '',
      employer_name: '',
      job_title: '',
      contract_type: '',
      employment_start_date: '',
      monthly_income: '',
      other_income: ''
    }
  ])

  useEffect(() => {
    if (isEditMode) {
      fetchTenantGroup()
    }
  }, [id])

  // Synchroniser l'entité sélectionnée depuis le contexte
  useEffect(() => {
    if (selectedEntity && !entityId) {
      setEntityId(selectedEntity)
    }
  }, [selectedEntity])

  useEffect(() => {
    // Générer automatiquement le nom du groupe
    if (tenants.length > 0 && !isEditMode) {
      const names = tenants
        .filter(t => t.first_name && t.last_name)
        .map(t => `${t.first_name} ${t.last_name}`)
        .join(' & ')

      if (names) {
        setGroupData(prev => ({ ...prev, name: names }))
      }
    }
  }, [tenants, isEditMode])

  const fetchTenantGroup = async () => {
    try {
      setLoading(true)
      const data = await getTenantGroupById(id)

      setGroupData({
        group_type: data.group_type || 'individual',
        couple_status: data.couple_status,
        name: data.name || ''
      })

      // Charger l'entity_id du groupe
      if (data.entity_id) {
        setEntityId(data.entity_id)
      }

      if (data.tenants && data.tenants.length > 0) {
        setTenants(data.tenants.map(t => ({
          ...t,
          tempId: t.id,
          monthly_income: t.monthly_income || '',
          other_income: t.other_income || ''
        })))
      }
    } catch (err) {
      console.error('Erreur lors du chargement:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGroupChange = (field, value) => {
    setGroupData(prev => ({ ...prev, [field]: value }))

    // Ajuster le nombre de locataires selon le type de groupe
    if (field === 'group_type') {
      if (value === 'individual' && tenants.length > 1) {
        // Garder seulement le locataire principal
        setTenants(prev => prev.filter(t => t.is_main_tenant))
      } else if (value === 'couple' && tenants.length === 1) {
        // Ajouter un deuxième locataire pour le couple
        addTenant()
      }
    }
  }

  const handleTenantChange = (tempId, field, value) => {
    setTenants(prev =>
      prev.map(t =>
        t.tempId === tempId ? { ...t, [field]: value } : t
      )
    )
  }

  const addTenant = () => {
    setTenants(prev => [
      ...prev,
      {
        tempId: Date.now(),
        is_main_tenant: false,
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        birth_date: '',
        birth_place: '',
        relationship: groupData.group_type === 'couple' ? 'conjoint' : 'colocataire',
        professional_status: '',
        employer_name: '',
        job_title: '',
        contract_type: '',
        employment_start_date: '',
        monthly_income: '',
        other_income: ''
      }
    ])
  }

  const removeTenant = (tempId) => {
    if (tenants.length <= 1) {
      warning('Il doit y avoir au moins un locataire')
      return
    }

    setTenants(prev => prev.filter(t => t.tempId !== tempId))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!entityId) {
      setError('Veuillez sélectionner une entité')
      return
    }

    // Validation
    if (!groupData.name.trim()) {
      setError('Le nom du groupe est obligatoire')
      return
    }

    if (tenants.length === 0) {
      setError('Il doit y avoir au moins un locataire')
      return
    }

    const mainTenant = tenants.find(t => t.is_main_tenant)
    if (!mainTenant) {
      setError('Il doit y avoir un locataire principal')
      return
    }

    for (const tenant of tenants) {
      if (!tenant.first_name || !tenant.last_name || !tenant.email) {
        setError('Tous les locataires doivent avoir un prénom, nom et email')
        return
      }
    }

    try {
      setSubmitting(true)
      setError(null)

      const groupPayload = {
        ...groupData,
        entity_id: entityId,
        tenants: tenants.map(t => ({
          ...t,
          monthly_income: parseFloat(t.monthly_income) || 0,
          other_income: parseFloat(t.other_income) || 0
        }))
      }

      if (isEditMode) {
        await updateTenantGroup(id, groupPayload)
      } else {
        await createTenantGroup(groupPayload)
      }

      navigate('/tenants')
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err)
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title={isEditMode ? 'Modifier le locataire' : 'Nouveau locataire'}>
        <Loading message="Chargement..." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={isEditMode ? 'Modifier le locataire' : 'Nouveau locataire'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="error" title="Erreur">
            {error}
          </Alert>
        )}

        <div className="flex items-center gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/tenants')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>

        {/* Sélecteur d'entité */}
        <Card title="Entité juridique" padding>
          <EntitySelect
            value={entityId}
            onChange={setEntityId}
            required
            label="Entité propriétaire"
            placeholder="Sélectionner l'entité juridique..."
          />
          <p className="text-sm text-[var(--text-muted)] mt-2">
            L'entité juridique à laquelle sera rattaché ce locataire (SCI, SARL, nom propre, etc.)
          </p>
        </Card>

        {/* Type de groupe */}
        <Card title="Type de location" padding>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => handleGroupChange('group_type', 'individual')}
              className={`p-6 border-2 rounded-xl transition-all ${
                groupData.group_type === 'individual'
                  ? 'border-[var(--color-electric-blue)] bg-[var(--color-electric-blue)]/10'
                  : 'border-[var(--border)] hover:border-[var(--color-electric-blue)]/50'
              }`}
            >
              <User className="w-8 h-8 mx-auto mb-3 text-[var(--color-electric-blue)]" />
              <p className="font-display font-medium text-[var(--text)]">Individuel</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">Une seule personne</p>
            </button>

            <button
              type="button"
              onClick={() => handleGroupChange('group_type', 'couple')}
              className={`p-6 border-2 rounded-xl transition-all ${
                groupData.group_type === 'couple'
                  ? 'border-[var(--color-vivid-coral)] bg-[var(--color-vivid-coral)]/10'
                  : 'border-[var(--border)] hover:border-[var(--color-vivid-coral)]/50'
              }`}
            >
              <Heart className="w-8 h-8 mx-auto mb-3 text-[var(--color-vivid-coral)]" />
              <p className="font-display font-medium text-[var(--text)]">Couple</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">Deux conjoints</p>
            </button>

            <button
              type="button"
              onClick={() => handleGroupChange('group_type', 'colocation')}
              className={`p-6 border-2 rounded-xl transition-all ${
                groupData.group_type === 'colocation'
                  ? 'border-[var(--color-purple)] bg-[var(--color-purple)]/10'
                  : 'border-[var(--border)] hover:border-[var(--color-purple)]/50'
              }`}
            >
              <Users className="w-8 h-8 mx-auto mb-3 text-[var(--color-purple)]" />
              <p className="font-display font-medium text-[var(--text)]">Colocation</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">Plusieurs locataires</p>
            </button>
          </div>

          {/* Statut couple */}
          {groupData.group_type === 'couple' && (
            <div className="mt-6">
              <label htmlFor="tenant-couple-status" className="block text-sm font-medium text-[var(--text)] mb-2">
                Statut du couple
              </label>
              <select
                id="tenant-couple-status"
                value={groupData.couple_status || ''}
                onChange={(e) => handleGroupChange('couple_status', e.target.value || null)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
              >
                <option value="">Sélectionner...</option>
                <option value="married">Mariés</option>
                <option value="pacs">Pacsés</option>
                <option value="concubinage">Concubinage</option>
              </select>
            </div>
          )}

          {/* Nom du groupe */}
          <div className="mt-6">
            <label htmlFor="tenant-group-name" className="block text-sm font-medium text-[var(--text)] mb-2">
              Nom du groupe *
            </label>
            <input
              id="tenant-group-name"
              type="text"
              value={groupData.name}
              onChange={(e) => handleGroupChange('name', e.target.value)}
              placeholder="Ex: Jean Dupont & Marie Martin"
              required
              className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Ce nom sera généré automatiquement à partir des noms des locataires
            </p>
          </div>
        </Card>

        {/* Locataires */}
        {tenants.map((tenant, index) => (
          <Card
            key={tenant.tempId}
            title={`Locataire ${index + 1}${tenant.is_main_tenant ? ' (Principal)' : ''}`}
            padding
          >
            <div className="space-y-6">
              {/* Informations personnelles */}
              <div>
                <h4 className="text-sm font-display font-medium text-[var(--text)] mb-4">Informations personnelles</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`tenant-${tenant.tempId}-first_name`} className="block text-sm font-medium text-[var(--text)] mb-1">
                      Prénom *
                    </label>
                    <input
                      id={`tenant-${tenant.tempId}-first_name`}
                      type="text"
                      value={tenant.first_name}
                      onChange={(e) => handleTenantChange(tenant.tempId, 'first_name', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor={`tenant-${tenant.tempId}-last_name`} className="block text-sm font-medium text-[var(--text)] mb-1">
                      Nom *
                    </label>
                    <input
                      id={`tenant-${tenant.tempId}-last_name`}
                      type="text"
                      value={tenant.last_name}
                      onChange={(e) => handleTenantChange(tenant.tempId, 'last_name', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor={`tenant-${tenant.tempId}-email`} className="block text-sm font-medium text-[var(--text)] mb-1">
                      Email *
                    </label>
                    <input
                      id={`tenant-${tenant.tempId}-email`}
                      type="email"
                      value={tenant.email}
                      onChange={(e) => handleTenantChange(tenant.tempId, 'email', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor={`tenant-${tenant.tempId}-phone`} className="block text-sm font-medium text-[var(--text)] mb-1">
                      Téléphone
                    </label>
                    <input
                      id={`tenant-${tenant.tempId}-phone`}
                      type="tel"
                      value={tenant.phone}
                      onChange={(e) => handleTenantChange(tenant.tempId, 'phone', e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor={`tenant-${tenant.tempId}-birth_date`} className="block text-sm font-medium text-[var(--text)] mb-1">
                      Date de naissance
                    </label>
                    <input
                      id={`tenant-${tenant.tempId}-birth_date`}
                      type="date"
                      value={tenant.birth_date}
                      onChange={(e) => handleTenantChange(tenant.tempId, 'birth_date', e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor={`tenant-${tenant.tempId}-birth_place`} className="block text-sm font-medium text-[var(--text)] mb-1">
                      Lieu de naissance
                    </label>
                    <input
                      id={`tenant-${tenant.tempId}-birth_place`}
                      type="text"
                      value={tenant.birth_place}
                      onChange={(e) => handleTenantChange(tenant.tempId, 'birth_place', e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                    />
                  </div>

                  {!tenant.is_main_tenant && (
                    <div>
                      <label htmlFor={`tenant-${tenant.tempId}-relationship`} className="block text-sm font-medium text-[var(--text)] mb-1">
                        Relation avec le locataire principal
                      </label>
                      <select
                        id={`tenant-${tenant.tempId}-relationship`}
                        value={tenant.relationship || ''}
                        onChange={(e) => handleTenantChange(tenant.tempId, 'relationship', e.target.value || null)}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                      >
                        <option value="">Sélectionner...</option>
                        {Object.entries(RELATIONSHIPS).map(([key, rel]) => (
                          <option key={key} value={key}>{rel.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Situation professionnelle */}
              <div>
                <h4 className="text-sm font-display font-medium text-[var(--text)] mb-4">Situation professionnelle</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`tenant-${tenant.tempId}-professional_status`} className="block text-sm font-medium text-[var(--text)] mb-1">
                      Statut professionnel
                    </label>
                    <select
                      id={`tenant-${tenant.tempId}-professional_status`}
                      value={tenant.professional_status}
                      onChange={(e) => handleTenantChange(tenant.tempId, 'professional_status', e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                    >
                      <option value="">Sélectionner...</option>
                      {Object.entries(PROFESSIONAL_STATUS).map(([key, status]) => (
                        <option key={key} value={key}>{status.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor={`tenant-${tenant.tempId}-employer_name`} className="block text-sm font-medium text-[var(--text)] mb-1">
                      Employeur
                    </label>
                    <input
                      id={`tenant-${tenant.tempId}-employer_name`}
                      type="text"
                      value={tenant.employer_name}
                      onChange={(e) => handleTenantChange(tenant.tempId, 'employer_name', e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor={`tenant-${tenant.tempId}-job_title`} className="block text-sm font-medium text-[var(--text)] mb-1">
                      Poste
                    </label>
                    <input
                      id={`tenant-${tenant.tempId}-job_title`}
                      type="text"
                      value={tenant.job_title}
                      onChange={(e) => handleTenantChange(tenant.tempId, 'job_title', e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor={`tenant-${tenant.tempId}-contract_type`} className="block text-sm font-medium text-[var(--text)] mb-1">
                      Type de contrat
                    </label>
                    <select
                      id={`tenant-${tenant.tempId}-contract_type`}
                      value={tenant.contract_type}
                      onChange={(e) => handleTenantChange(tenant.tempId, 'contract_type', e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                    >
                      <option value="">Sélectionner...</option>
                      {Object.entries(CONTRACT_TYPES).map(([key, type]) => (
                        <option key={key} value={key}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor={`tenant-${tenant.tempId}-employment_start_date`} className="block text-sm font-medium text-[var(--text)] mb-1">
                      Date de début
                    </label>
                    <input
                      id={`tenant-${tenant.tempId}-employment_start_date`}
                      type="date"
                      value={tenant.employment_start_date}
                      onChange={(e) => handleTenantChange(tenant.tempId, 'employment_start_date', e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Revenus */}
              <div>
                <h4 className="text-sm font-display font-medium text-[var(--text)] mb-4">Revenus mensuels nets</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`tenant-${tenant.tempId}-monthly_income`} className="block text-sm font-medium text-[var(--text)] mb-1">
                      Salaire net mensuel (€)
                    </label>
                    <input
                      id={`tenant-${tenant.tempId}-monthly_income`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={tenant.monthly_income}
                      onChange={(e) => handleTenantChange(tenant.tempId, 'monthly_income', e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor={`tenant-${tenant.tempId}-other_income`} className="block text-sm font-medium text-[var(--text)] mb-1">
                      Autres revenus (€)
                    </label>
                    <input
                      id={`tenant-${tenant.tempId}-other_income`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={tenant.other_income}
                      onChange={(e) => handleTenantChange(tenant.tempId, 'other_income', e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                    />
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Pensions, allocations, revenus locatifs, etc.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {tenants.length > 1 && (
                <div className="border-t border-[var(--border)] pt-4">
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => removeTenant(tenant.tempId)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Retirer ce locataire
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}

        {/* Ajouter un locataire */}
        {(groupData.group_type === 'colocation' || (groupData.group_type === 'couple' && tenants.length < 2)) && (
          <Button
            type="button"
            variant="outline"
            onClick={addTenant}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un locataire
          </Button>
        )}

        {/* Actions finales */}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={() => navigate('/tenants')}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" loading={submitting}>
            <Save className="w-4 h-4 mr-2" />
            Enregistrer
          </Button>
        </div>
      </form>
    </DashboardLayout>
  )
}

export default TenantForm
