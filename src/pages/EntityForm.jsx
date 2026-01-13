import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

function EntityForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEditMode = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    entity_type: 'individual',
    siren: '',
    siret: '',
    vat_number: '',
    rcs_city: '',
    capital: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'France',
    email: '',
    phone: '',
    color: '#2563EB',
    vat_applicable: false,
    default_entity: false
  })

  useEffect(() => {
    if (isEditMode) {
      fetchEntity()
    }
  }, [id])

  const fetchEntity = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('entities')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      setFormData({
        name: data.name || '',
        entity_type: data.entity_type || 'individual',
        siren: data.siren || '',
        siret: data.siret || '',
        vat_number: data.vat_number || '',
        rcs_city: data.rcs_city || '',
        capital: data.capital || '',
        address: data.address || '',
        city: data.city || '',
        postal_code: data.postal_code || '',
        country: data.country || 'France',
        email: data.email || '',
        phone: data.phone || '',
        color: data.color || '#2563EB',
        vat_applicable: data.vat_applicable || false,
        default_entity: data.default_entity || false
      })
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Récupérer l'ID de l'utilisateur
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('supabase_uid', user.id)
        .single()

      if (userError) throw userError

      // Préparer les données
      const entityData = {
        name: formData.name,
        entity_type: formData.entity_type,
        siren: formData.siren || null,
        siret: formData.siret || null,
        vat_number: formData.vat_number || null,
        rcs_city: formData.rcs_city || null,
        capital: formData.capital ? parseFloat(formData.capital) : null,
        address: formData.address || null,
        city: formData.city || null,
        postal_code: formData.postal_code || null,
        country: formData.country,
        email: formData.email || null,
        phone: formData.phone || null,
        color: formData.color,
        vat_applicable: formData.vat_applicable,
        default_entity: formData.default_entity
      }

      if (isEditMode) {
        // Mise à jour
        const { error } = await supabase
          .from('entities')
          .update(entityData)
          .eq('id', id)

        if (error) throw error
      } else {
        // Création
        entityData.user_id = userData.id

        const { error } = await supabase
          .from('entities')
          .insert([entityData])

        if (error) throw error
      }

      // Si cette entité est définie par défaut, désactiver les autres
      if (formData.default_entity) {
        await supabase
          .from('entities')
          .update({ default_entity: false })
          .eq('user_id', userData.id)
          .neq('id', id || 'new')
      }

      // Rediriger vers la liste des entités
      navigate('/entities')
    } catch (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  const entityTypeOptions = [
    { value: 'individual', label: 'Nom propre (personne physique)' },
    { value: 'sci', label: 'SCI - Société Civile Immobilière' },
    { value: 'sarl', label: 'SARL - Société À Responsabilité Limitée' },
    { value: 'sas', label: 'SAS - Société par Actions Simplifiée' },
    { value: 'sasu', label: 'SASU - SAS Unipersonnelle' },
    { value: 'eurl', label: 'EURL - SARL Unipersonnelle' },
    { value: 'lmnp', label: 'LMNP - Loueur Meublé Non Professionnel' },
    { value: 'lmp', label: 'LMP - Loueur Meublé Professionnel' },
    { value: 'other', label: 'Autre' }
  ]

  const requiresLegalInfo = ['sci', 'sarl', 'sas', 'sasu', 'eurl'].includes(formData.entity_type)

  return (
    <DashboardLayout title={isEditMode ? "Modifier l'entité" : "Ajouter une entité"}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-display font-bold text-[var(--text)]">
            {isEditMode ? "Modifier l'entité" : "Ajouter une entité juridique"}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Renseignez les informations de votre entité (SCI, SARL, nom propre...)
          </p>
        </div>

        <Card>
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations générales */}
            <div>
              <h3 className="text-lg font-display font-semibold text-[var(--text)] mb-4">Informations générales</h3>

              <div className="space-y-6">
                <div>
                  <label htmlFor="entity-name" className="block text-sm font-medium text-[var(--text)] mb-2">
                    Nom de l'entité *
                  </label>
                  <input
                    id="entity-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent"
                    placeholder="Ex: SCI Famille Dupont, Mon patrimoine..."
                    required
                  />
                </div>

                <div>
                  <label htmlFor="entity-entity_type" className="block text-sm font-medium text-[var(--text)] mb-2">
                    Type d'entité *
                  </label>
                  <select
                    id="entity-entity_type"
                    name="entity_type"
                    value={formData.entity_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent"
                    required
                  >
                    {entityTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="entity-color" className="block text-sm font-medium text-[var(--text)] mb-2">
                    Couleur de différenciation
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      id="entity-color"
                      type="color"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      className="h-10 w-20 border border-[var(--border)] rounded-xl cursor-pointer"
                    />
                    <span className="text-sm text-[var(--text-secondary)]">
                      Couleur utilisée pour identifier l'entité dans l'interface
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations légales */}
            {requiresLegalInfo && (
              <div className="border-t border-[var(--border)] pt-6">
                <h3 className="text-lg font-display font-semibold text-[var(--text)] mb-4">Informations légales</h3>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="entity-siren" className="block text-sm font-medium text-[var(--text)] mb-2">
                        SIREN
                      </label>
                      <input
                        id="entity-siren"
                        type="text"
                        name="siren"
                        value={formData.siren}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent"
                        placeholder="123456789"
                        maxLength="9"
                      />
                    </div>

                    <div>
                      <label htmlFor="entity-siret" className="block text-sm font-medium text-[var(--text)] mb-2">
                        SIRET
                      </label>
                      <input
                        id="entity-siret"
                        type="text"
                        name="siret"
                        value={formData.siret}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent"
                        placeholder="12345678900001"
                        maxLength="14"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="entity-vat_number" className="block text-sm font-medium text-[var(--text)] mb-2">
                        Numéro de TVA intracommunautaire
                      </label>
                      <input
                        id="entity-vat_number"
                        type="text"
                        name="vat_number"
                        value={formData.vat_number}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent"
                        placeholder="FR12345678900"
                      />
                    </div>

                    <div>
                      <label htmlFor="entity-rcs_city" className="block text-sm font-medium text-[var(--text)] mb-2">
                        Ville RCS
                      </label>
                      <input
                        id="entity-rcs_city"
                        type="text"
                        name="rcs_city"
                        value={formData.rcs_city}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent"
                        placeholder="Paris"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="entity-capital" className="block text-sm font-medium text-[var(--text)] mb-2">
                      Capital social (€)
                    </label>
                    <input
                      id="entity-capital"
                      type="number"
                      name="capital"
                      value={formData.capital}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent"
                      placeholder="10000"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Adresse */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-lg font-display font-semibold text-[var(--text)] mb-4">Adresse du siège</h3>

              <div className="space-y-6">
                <div>
                  <label htmlFor="entity-address" className="block text-sm font-medium text-[var(--text)] mb-2">
                    Adresse
                  </label>
                  <input
                    id="entity-address"
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent"
                    placeholder="15 rue de la République"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="entity-city" className="block text-sm font-medium text-[var(--text)] mb-2">
                      Ville
                    </label>
                    <input
                      id="entity-city"
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent"
                      placeholder="Paris"
                    />
                  </div>

                  <div>
                    <label htmlFor="entity-postal_code" className="block text-sm font-medium text-[var(--text)] mb-2">
                      Code postal
                    </label>
                    <input
                      id="entity-postal_code"
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent"
                      placeholder="75001"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-lg font-display font-semibold text-[var(--text)] mb-4">Informations de contact</h3>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="entity-email" className="block text-sm font-medium text-[var(--text)] mb-2">
                      Email
                    </label>
                    <input
                      id="entity-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent"
                      placeholder="contact@sci-dupont.fr"
                    />
                  </div>

                  <div>
                    <label htmlFor="entity-phone" className="block text-sm font-medium text-[var(--text)] mb-2">
                      Téléphone
                    </label>
                    <input
                      id="entity-phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent"
                      placeholder="06 12 34 56 78"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-lg font-display font-semibold text-[var(--text)] mb-4">Options</h3>

              <div className="space-y-4">
                <label htmlFor="entity-vat_applicable" className="flex items-center cursor-pointer">
                  <input
                    id="entity-vat_applicable"
                    type="checkbox"
                    name="vat_applicable"
                    checked={formData.vat_applicable}
                    onChange={handleChange}
                    className="h-4 w-4 text-[var(--color-electric-blue)] focus:ring-[var(--color-electric-blue)] border-[var(--border)] rounded"
                  />
                  <span className="ml-2 text-sm text-[var(--text)]">
                    Assujetti à la TVA (la TVA s'applique aux loyers)
                  </span>
                </label>

                <label htmlFor="entity-default_entity" className="flex items-center cursor-pointer">
                  <input
                    id="entity-default_entity"
                    type="checkbox"
                    name="default_entity"
                    checked={formData.default_entity}
                    onChange={handleChange}
                    className="h-4 w-4 text-[var(--color-electric-blue)] focus:ring-[var(--color-electric-blue)] border-[var(--border)] rounded"
                  />
                  <span className="ml-2 text-sm text-[var(--text)]">
                    Définir comme entité par défaut (sélectionnée automatiquement dans l'interface)
                  </span>
                </label>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-[var(--border)]">
              <Button
                type="submit"
                loading={loading}
                className="flex-1"
              >
                {isEditMode ? "Mettre à jour l'entité" : "Créer l'entité"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/entities')}
                className="flex-1"
              >
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default EntityForm
