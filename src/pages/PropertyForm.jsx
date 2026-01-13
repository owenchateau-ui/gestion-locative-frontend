import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useUserEntities } from '../hooks/useUserEntities'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

function PropertyForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEditMode = Boolean(id)

  // Hook centralisé pour les entités
  const { entities, defaultEntity } = useUserEntities()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    entity_id: '',
    name: '',
    category: 'building',
    address: '',
    city: '',
    postal_code: '',
    country: 'France',
    construction_year: '',
    acquisition_date: '',
    acquisition_price: '',
    current_value: '',
    is_coproperty: false,
    coproperty_lots: '',
    syndic_name: '',
    syndic_email: '',
    syndic_phone: '',
    syndic_fees: '',
    description: '',
    notes: ''
  })

  useEffect(() => {
    if (isEditMode) {
      fetchProperty()
    } else if (defaultEntity) {
      // Sélectionner l'entité par défaut automatiquement via le hook
      setFormData(prev => ({ ...prev, entity_id: defaultEntity.id }))
    }
  }, [id, defaultEntity])

  const fetchProperty = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('properties_new')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      setFormData({
        entity_id: data.entity_id || '',
        name: data.name || '',
        category: data.category || 'building',
        address: data.address || '',
        city: data.city || '',
        postal_code: data.postal_code || '',
        country: data.country || 'France',
        construction_year: data.construction_year || '',
        acquisition_date: data.acquisition_date || '',
        acquisition_price: data.acquisition_price || '',
        current_value: data.current_value || '',
        is_coproperty: data.is_coproperty || false,
        coproperty_lots: data.coproperty_lots || '',
        syndic_name: data.syndic_name || '',
        syndic_email: data.syndic_email || '',
        syndic_phone: data.syndic_phone || '',
        syndic_fees: data.syndic_fees || '',
        description: data.description || '',
        notes: data.notes || ''
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
      // Préparer les données pour l'insertion/mise à jour
      const propertyData = {
        entity_id: formData.entity_id,
        name: formData.name,
        category: formData.category,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postal_code,
        country: formData.country,
        construction_year: formData.construction_year ? parseInt(formData.construction_year) : null,
        acquisition_date: formData.acquisition_date || null,
        acquisition_price: formData.acquisition_price ? parseFloat(formData.acquisition_price) : null,
        current_value: formData.current_value ? parseFloat(formData.current_value) : null,
        is_coproperty: formData.is_coproperty,
        coproperty_lots: formData.coproperty_lots ? parseInt(formData.coproperty_lots) : null,
        syndic_name: formData.syndic_name || null,
        syndic_email: formData.syndic_email || null,
        syndic_phone: formData.syndic_phone || null,
        syndic_fees: formData.syndic_fees ? parseFloat(formData.syndic_fees) : null,
        description: formData.description || null,
        notes: formData.notes || null
      }

      if (isEditMode) {
        // Mise à jour
        const { error } = await supabase
          .from('properties_new')
          .update(propertyData)
          .eq('id', id)

        if (error) throw error
      } else {
        // Création
        const { error } = await supabase
          .from('properties_new')
          .insert([propertyData])

        if (error) throw error
      }

      // Rediriger vers la liste des propriétés
      navigate('/properties')
    } catch (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  const categoryOptions = [
    { value: 'building', label: 'Immeuble (contient plusieurs lots)' },
    { value: 'house', label: 'Maison individuelle' },
    { value: 'apartment', label: 'Appartement (1 seul lot)' },
    { value: 'commercial', label: 'Local commercial' },
    { value: 'office', label: 'Bureau' },
    { value: 'land', label: 'Terrain' },
    { value: 'parking', label: 'Parking (1 seul lot)' },
    { value: 'other', label: 'Autre' }
  ]

  if (entities.length === 0 && !isEditMode) {
    return (
      <DashboardLayout title="Ajouter une propriété">
        <Card className="text-center py-12">
          <h3 className="text-lg font-display font-semibold text-[var(--text)] mb-2">Aucune entité juridique</h3>
          <p className="text-[var(--text-secondary)] mb-6">
            Vous devez d'abord créer une entité juridique avant d'ajouter une propriété
          </p>
          <Button onClick={() => navigate('/entities/new')}>
            Créer une entité
          </Button>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={isEditMode ? 'Modifier la propriété' : 'Ajouter une propriété'}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-display font-bold text-[var(--text)]">
            {isEditMode ? 'Modifier la propriété' : 'Ajouter une propriété'}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Renseignez les informations de la propriété immobilière (immeuble, maison, terrain...)
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
                {/* Entité propriétaire */}
                <div>
                  <label htmlFor="property-entity_id" className="block text-sm font-medium text-[var(--text)] mb-2">
                    Entité propriétaire *
                  </label>
                  <select
                    id="property-entity_id"
                    name="entity_id"
                    value={formData.entity_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                    required
                  >
                    <option value="">Sélectionnez une entité</option>
                    {entities.map((entity) => (
                      <option key={entity.id} value={entity.id}>
                        {entity.name}
                        {entity.default_entity && ' (Par défaut)'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nom */}
                <div>
                  <label htmlFor="property-name" className="block text-sm font-medium text-[var(--text)] mb-2">
                    Nom de la propriété *
                  </label>
                  <input
                    id="property-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                    placeholder="Ex: Immeuble Rue de la Paix, Maison Bordeaux..."
                    required
                  />
                </div>

                {/* Catégorie */}
                <div>
                  <label htmlFor="property-category" className="block text-sm font-medium text-[var(--text)] mb-2">
                    Catégorie de propriété *
                  </label>
                  <select
                    id="property-category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                    required
                  >
                    {categoryOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Un immeuble/bâtiment peut contenir plusieurs lots (appartements, parkings, etc.)
                  </p>
                </div>
              </div>
            </div>

            {/* Localisation */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-lg font-display font-semibold text-[var(--text)] mb-4">Localisation</h3>

              <div className="space-y-6">
                {/* Adresse */}
                <div>
                  <label htmlFor="property-address" className="block text-sm font-medium text-[var(--text)] mb-2">
                    Adresse *
                  </label>
                  <input
                    id="property-address"
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                    placeholder="15 rue de la République"
                    required
                  />
                </div>

                {/* Ville et Code postal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="property-city" className="block text-sm font-medium text-[var(--text)] mb-2">
                      Ville *
                    </label>
                    <input
                      id="property-city"
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                      placeholder="Paris"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="property-postal_code" className="block text-sm font-medium text-[var(--text)] mb-2">
                      Code postal *
                    </label>
                    <input
                      id="property-postal_code"
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                      placeholder="75001"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Caractéristiques */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-lg font-display font-semibold text-[var(--text)] mb-4">Caractéristiques</h3>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="property-construction_year" className="block text-sm font-medium text-[var(--text)] mb-2">
                      Année de construction
                    </label>
                    <input
                      id="property-construction_year"
                      type="number"
                      name="construction_year"
                      value={formData.construction_year}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                      placeholder="1990"
                      min="1800"
                      max={new Date().getFullYear() + 5}
                    />
                  </div>
                  <div>
                    <label htmlFor="property-acquisition_date" className="block text-sm font-medium text-[var(--text)] mb-2">
                      Date d'acquisition
                    </label>
                    <input
                      id="property-acquisition_date"
                      type="date"
                      name="acquisition_date"
                      value={formData.acquisition_date}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="property-acquisition_price" className="block text-sm font-medium text-[var(--text)] mb-2">
                      Prix d'acquisition (€)
                    </label>
                    <input
                      id="property-acquisition_price"
                      type="number"
                      name="acquisition_price"
                      value={formData.acquisition_price}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                      placeholder="250000"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div>
                    <label htmlFor="property-current_value" className="block text-sm font-medium text-[var(--text)] mb-2">
                      Valeur actuelle estimée (€)
                    </label>
                    <input
                      id="property-current_value"
                      type="number"
                      name="current_value"
                      value={formData.current_value}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                      placeholder="280000"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Copropriété */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-lg font-display font-semibold text-[var(--text)] mb-4">Copropriété</h3>

              <div className="space-y-6">
                {/* Checkbox copropriété */}
                <label htmlFor="property-is_coproperty" className="flex items-center cursor-pointer">
                  <input
                    id="property-is_coproperty"
                    type="checkbox"
                    name="is_coproperty"
                    checked={formData.is_coproperty}
                    onChange={handleChange}
                    className="h-4 w-4 text-[var(--color-electric-blue)] focus:ring-[var(--color-electric-blue)] border-[var(--border)] rounded"
                  />
                  <span className="ml-2 text-sm text-[var(--text)]">
                    Cette propriété est en copropriété
                  </span>
                </label>

                {/* Champs copropriété (affichés seulement si cochée) */}
                {formData.is_coproperty && (
                  <div className="space-y-6 pl-6 border-l-2 border-[var(--color-electric-blue)]/30">
                    <div>
                      <label htmlFor="property-coproperty_lots" className="block text-sm font-medium text-[var(--text)] mb-2">
                        Nombre de lots dans la copropriété
                      </label>
                      <input
                        id="property-coproperty_lots"
                        type="number"
                        name="coproperty_lots"
                        value={formData.coproperty_lots}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                        placeholder="20"
                        min="1"
                      />
                    </div>

                    <div>
                      <label htmlFor="property-syndic_name" className="block text-sm font-medium text-[var(--text)] mb-2">
                        Nom du syndic
                      </label>
                      <input
                        id="property-syndic_name"
                        type="text"
                        name="syndic_name"
                        value={formData.syndic_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                        placeholder="Syndic Foncia"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="property-syndic_email" className="block text-sm font-medium text-[var(--text)] mb-2">
                          Email du syndic
                        </label>
                        <input
                          id="property-syndic_email"
                          type="email"
                          name="syndic_email"
                          value={formData.syndic_email}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                          placeholder="syndic@example.com"
                        />
                      </div>
                      <div>
                        <label htmlFor="property-syndic_phone" className="block text-sm font-medium text-[var(--text)] mb-2">
                          Téléphone du syndic
                        </label>
                        <input
                          id="property-syndic_phone"
                          type="tel"
                          name="syndic_phone"
                          value={formData.syndic_phone}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                          placeholder="01 23 45 67 89"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="property-syndic_fees" className="block text-sm font-medium text-[var(--text)] mb-2">
                        Charges de syndic mensuelles (€)
                      </label>
                      <input
                        id="property-syndic_fees"
                        type="number"
                        name="syndic_fees"
                        value={formData.syndic_fees}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                        placeholder="150.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Informations additionnelles */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-lg font-display font-semibold text-[var(--text)] mb-4">Informations additionnelles</h3>

              <div className="space-y-6">
                {/* Description */}
                <div>
                  <label htmlFor="property-description" className="block text-sm font-medium text-[var(--text)] mb-2">
                    Description
                  </label>
                  <textarea
                    id="property-description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                    rows="3"
                    placeholder="Description générale de la propriété..."
                  />
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="property-notes" className="block text-sm font-medium text-[var(--text)] mb-2">
                    Notes privées
                  </label>
                  <textarea
                    id="property-notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                    rows="3"
                    placeholder="Notes internes (non visibles par les locataires)..."
                  />
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              <Button
                type="submit"
                loading={loading}
                className="flex-1"
              >
                {isEditMode ? 'Mettre à jour la propriété' : 'Créer la propriété'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/properties')}
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

export default PropertyForm
