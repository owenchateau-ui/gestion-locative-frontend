import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

function LotForm() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEditMode = Boolean(id)

  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    property_id: searchParams.get('property') || '',
    name: '',
    reference: '',
    lot_type: 'apartment',
    status: 'vacant',
    floor: '',
    door_number: '',
    surface_area: '',
    nb_rooms: '',
    nb_bedrooms: '',
    nb_bathrooms: '',
    rent_amount: '',
    charges_amount: '',
    deposit_amount: '',
    furnished: false,
    has_parking: false,
    has_cellar: false,
    has_balcony: false,
    has_terrace: false,
    has_garden: false,
    has_elevator: false,
    heating_type: '',
    dpe_rating: '',
    dpe_value: '',
    dpe_date: '',
    ges_rating: '',
    ges_value: '',
    coproperty_lot_number: '',
    coproperty_tantieme: '',
    description: '',
    notes: ''
  })

  useEffect(() => {
    fetchProperties()
  }, [user])

  useEffect(() => {
    if (isEditMode) {
      fetchLot()
    }
  }, [id])

  const fetchProperties = async () => {
    if (!user) return

    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('supabase_uid', user.id)
        .single()

      if (userError) throw userError

      const { data, error } = await supabase
        .from('properties_new')
        .select('*, entities!inner(id, name, user_id)')
        .eq('entities.user_id', userData.id)
        .order('name', { ascending: true })

      if (error) throw error

      setProperties(data || [])
    } catch (error) {
      console.error('Error fetching properties:', error)
    }
  }

  const fetchLot = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('lots')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      setFormData({
        property_id: data.property_id || '',
        name: data.name || '',
        reference: data.reference || '',
        lot_type: data.lot_type || 'apartment',
        status: data.status || 'vacant',
        floor: data.floor !== null ? data.floor : '',
        door_number: data.door_number || '',
        surface_area: data.surface_area || '',
        nb_rooms: data.nb_rooms || '',
        nb_bedrooms: data.nb_bedrooms || '',
        nb_bathrooms: data.nb_bathrooms || '',
        rent_amount: data.rent_amount || '',
        charges_amount: data.charges_amount || '',
        deposit_amount: data.deposit_amount || '',
        furnished: data.furnished || false,
        has_parking: data.has_parking || false,
        has_cellar: data.has_cellar || false,
        has_balcony: data.has_balcony || false,
        has_terrace: data.has_terrace || false,
        has_garden: data.has_garden || false,
        has_elevator: data.has_elevator || false,
        heating_type: data.heating_type || '',
        dpe_rating: data.dpe_rating || '',
        dpe_value: data.dpe_value || '',
        dpe_date: data.dpe_date || '',
        ges_rating: data.ges_rating || '',
        ges_value: data.ges_value || '',
        coproperty_lot_number: data.coproperty_lot_number || '',
        coproperty_tantieme: data.coproperty_tantieme || '',
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
      const lotData = {
        property_id: formData.property_id,
        name: formData.name,
        reference: formData.reference || null,
        lot_type: formData.lot_type,
        status: formData.status,
        floor: formData.floor !== '' ? parseInt(formData.floor) : null,
        door_number: formData.door_number || null,
        surface_area: formData.surface_area ? parseFloat(formData.surface_area) : null,
        nb_rooms: formData.nb_rooms ? parseInt(formData.nb_rooms) : null,
        nb_bedrooms: formData.nb_bedrooms ? parseInt(formData.nb_bedrooms) : null,
        nb_bathrooms: formData.nb_bathrooms ? parseInt(formData.nb_bathrooms) : null,
        rent_amount: parseFloat(formData.rent_amount),
        charges_amount: formData.charges_amount ? parseFloat(formData.charges_amount) : 0,
        deposit_amount: formData.deposit_amount ? parseFloat(formData.deposit_amount) : null,
        furnished: formData.furnished,
        has_parking: formData.has_parking,
        has_cellar: formData.has_cellar,
        has_balcony: formData.has_balcony,
        has_terrace: formData.has_terrace,
        has_garden: formData.has_garden,
        has_elevator: formData.has_elevator,
        heating_type: formData.heating_type || null,
        dpe_rating: formData.dpe_rating || null,
        dpe_value: formData.dpe_value ? parseInt(formData.dpe_value) : null,
        dpe_date: formData.dpe_date || null,
        ges_rating: formData.ges_rating || null,
        ges_value: formData.ges_value ? parseInt(formData.ges_value) : null,
        coproperty_lot_number: formData.coproperty_lot_number || null,
        coproperty_tantieme: formData.coproperty_tantieme ? parseInt(formData.coproperty_tantieme) : null,
        description: formData.description || null,
        notes: formData.notes || null
      }

      if (isEditMode) {
        // Mise à jour
        const { error } = await supabase
          .from('lots')
          .update(lotData)
          .eq('id', id)

        if (error) throw error
      } else {
        // Création
        const { error } = await supabase
          .from('lots')
          .insert([lotData])

        if (error) throw error
      }

      // Rediriger vers la liste des lots ou le détail de la propriété
      if (searchParams.get('property')) {
        navigate(`/properties/${searchParams.get('property')}`)
      } else {
        navigate('/lots')
      }
    } catch (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  const lotTypeOptions = [
    { value: 'apartment', label: 'Appartement' },
    { value: 'studio', label: 'Studio' },
    { value: 'house', label: 'Maison' },
    { value: 'commercial', label: 'Local commercial' },
    { value: 'office', label: 'Bureau' },
    { value: 'parking', label: 'Parking' },
    { value: 'cellar', label: 'Cave' },
    { value: 'storage', label: 'Débarras/Box' },
    { value: 'land', label: 'Terrain' },
    { value: 'other', label: 'Autre' }
  ]

  const statusOptions = [
    { value: 'vacant', label: 'Vacant (disponible à la location)' },
    { value: 'occupied', label: 'Occupé (loué)' },
    { value: 'unavailable', label: 'Indisponible (travaux, etc.)' },
    { value: 'for_sale', label: 'En vente' }
  ]

  const dpeRatings = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

  if (properties.length === 0 && !isEditMode) {
    return (
      <DashboardLayout title="Ajouter un lot">
        <Card className="text-center py-12">
          <h3 className="text-lg font-display font-semibold text-[var(--text)] mb-2">Aucune propriété</h3>
          <p className="text-[var(--text-secondary)] mb-6">
            Vous devez d'abord créer une propriété avant d'ajouter un lot
          </p>
          <Button onClick={() => navigate('/properties/new')}>
            Créer une propriété
          </Button>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={isEditMode ? 'Modifier le lot' : 'Ajouter un lot'}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-display font-bold text-[var(--text)]">
            {isEditMode ? 'Modifier le lot' : 'Ajouter un lot (unité locative)'}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Renseignez les informations du lot (appartement, parking, cave...)
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
                {/* Propriété */}
                <div>
                  <label htmlFor="lot-property_id" className="block text-sm font-medium text-[var(--text)] mb-2">
                    Propriété *
                  </label>
                  <select
                    id="lot-property_id"
                    name="property_id"
                    value={formData.property_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                    required
                  >
                    <option value="">Sélectionnez une propriété</option>
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.name} - {property.entities.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nom */}
                  <div>
                    <label htmlFor="lot-name" className="block text-sm font-medium text-[var(--text)] mb-2">
                      Nom du lot *
                    </label>
                    <input
                      id="lot-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                      placeholder="Ex: Appartement 101, Parking A12..."
                      required
                    />
                  </div>

                  {/* Référence */}
                  <div>
                    <label htmlFor="lot-reference" className="block text-sm font-medium text-[var(--text)] mb-2">
                      Référence interne
                    </label>
                    <input
                      id="lot-reference"
                      type="text"
                      name="reference"
                      value={formData.reference}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                      placeholder="Ex: A101, PKG-12..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Type */}
                  <div>
                    <label htmlFor="lot-lot_type" className="block text-sm font-medium text-[var(--text)] mb-2">
                      Type de lot *
                    </label>
                    <select
                      id="lot-lot_type"
                      name="lot_type"
                      value={formData.lot_type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                      required
                    >
                      {lotTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Statut */}
                  <div>
                    <label htmlFor="lot-status" className="block text-sm font-medium text-[var(--text)] mb-2">
                      Statut *
                    </label>
                    <select
                      id="lot-status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                      required
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Localisation */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-lg font-display font-semibold text-[var(--text)] mb-4">Localisation dans la propriété</h3>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="lot-floor" className="block text-sm font-medium text-[var(--text)] mb-2">
                      Étage
                    </label>
                    <input
                      id="lot-floor"
                      type="number"
                      name="floor"
                      value={formData.floor}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                      placeholder="0 pour RDC, -1 pour sous-sol..."
                    />
                  </div>

                  <div>
                    <label htmlFor="lot-door_number" className="block text-sm font-medium text-[var(--text)] mb-2">
                      Numéro de porte
                    </label>
                    <input
                      id="lot-door_number"
                      type="text"
                      name="door_number"
                      value={formData.door_number}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                      placeholder="Ex: 12, A, 1A..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Caractéristiques */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-lg font-display font-semibold text-[var(--text)] mb-4">Caractéristiques</h3>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="lot-surface_area" className="block text-sm font-medium text-[var(--text)] mb-2">
                      Surface (m²)
                    </label>
                    <input
                      id="lot-surface_area"
                      type="number"
                      name="surface_area"
                      value={formData.surface_area}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                      placeholder="45.5"
                      step="0.01"
                      min="0"
                    />
                  </div>

                  <div>
                    <label htmlFor="lot-nb_rooms" className="block text-sm font-medium text-[var(--text)] mb-2">
                      Nombre de pièces
                    </label>
                    <input
                      id="lot-nb_rooms"
                      type="number"
                      name="nb_rooms"
                      value={formData.nb_rooms}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                      placeholder="2"
                      min="0"
                    />
                  </div>

                  <div>
                    <label htmlFor="lot-nb_bedrooms" className="block text-sm font-medium text-[var(--text)] mb-2">
                      Nombre de chambres
                    </label>
                    <input
                      id="lot-nb_bedrooms"
                      type="number"
                      name="nb_bedrooms"
                      value={formData.nb_bedrooms}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                      placeholder="1"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="lot-nb_bathrooms" className="block text-sm font-medium text-[var(--text)] mb-2">
                      Nombre de salles de bain
                    </label>
                    <input
                      id="lot-nb_bathrooms"
                      type="number"
                      name="nb_bathrooms"
                      value={formData.nb_bathrooms}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                      placeholder="1"
                      min="0"
                    />
                  </div>

                  <div>
                    <label htmlFor="lot-heating_type" className="block text-sm font-medium text-[var(--text)] mb-2">
                      Type de chauffage
                    </label>
                    <input
                      id="lot-heating_type"
                      type="text"
                      name="heating_type"
                      value={formData.heating_type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                      placeholder="Ex: Individuel gaz, Collectif..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Informations financières */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-lg font-display font-semibold text-[var(--text)] mb-4">Informations financières</h3>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="lot-rent_amount" className="block text-sm font-medium text-[var(--text)] mb-2">
                      Loyer hors charges (€) *
                    </label>
                    <input
                      id="lot-rent_amount"
                      type="number"
                      name="rent_amount"
                      value={formData.rent_amount}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                      placeholder="950.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="lot-charges_amount" className="block text-sm font-medium text-[var(--text)] mb-2">
                      Charges mensuelles (€)
                    </label>
                    <input
                      id="lot-charges_amount"
                      type="number"
                      name="charges_amount"
                      value={formData.charges_amount}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                      placeholder="80.00"
                      step="0.01"
                      min="0"
                    />
                  </div>

                  <div>
                    <label htmlFor="lot-deposit_amount" className="block text-sm font-medium text-[var(--text)] mb-2">
                      Dépôt de garantie (€)
                    </label>
                    <input
                      id="lot-deposit_amount"
                      type="number"
                      name="deposit_amount"
                      value={formData.deposit_amount}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                      placeholder="950.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Équipements */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-lg font-display font-semibold text-[var(--text)] mb-4">Équipements</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label htmlFor="lot-furnished" className="flex items-center cursor-pointer">
                  <input
                    id="lot-furnished"
                    type="checkbox"
                    name="furnished"
                    checked={formData.furnished}
                    onChange={handleChange}
                    className="h-4 w-4 text-[var(--color-electric-blue)] focus:ring-[var(--color-electric-blue)] border-[var(--border)] rounded"
                  />
                  <span className="ml-2 text-sm text-[var(--text)]">Meublé</span>
                </label>

                <label htmlFor="lot-has_parking" className="flex items-center cursor-pointer">
                  <input
                    id="lot-has_parking"
                    type="checkbox"
                    name="has_parking"
                    checked={formData.has_parking}
                    onChange={handleChange}
                    className="h-4 w-4 text-[var(--color-electric-blue)] focus:ring-[var(--color-electric-blue)] border-[var(--border)] rounded"
                  />
                  <span className="ml-2 text-sm text-[var(--text)]">Parking inclus</span>
                </label>

                <label htmlFor="lot-has_cellar" className="flex items-center cursor-pointer">
                  <input
                    id="lot-has_cellar"
                    type="checkbox"
                    name="has_cellar"
                    checked={formData.has_cellar}
                    onChange={handleChange}
                    className="h-4 w-4 text-[var(--color-electric-blue)] focus:ring-[var(--color-electric-blue)] border-[var(--border)] rounded"
                  />
                  <span className="ml-2 text-sm text-[var(--text)]">Cave incluse</span>
                </label>

                <label htmlFor="lot-has_balcony" className="flex items-center cursor-pointer">
                  <input
                    id="lot-has_balcony"
                    type="checkbox"
                    name="has_balcony"
                    checked={formData.has_balcony}
                    onChange={handleChange}
                    className="h-4 w-4 text-[var(--color-electric-blue)] focus:ring-[var(--color-electric-blue)] border-[var(--border)] rounded"
                  />
                  <span className="ml-2 text-sm text-[var(--text)]">Balcon</span>
                </label>

                <label htmlFor="lot-has_terrace" className="flex items-center cursor-pointer">
                  <input
                    id="lot-has_terrace"
                    type="checkbox"
                    name="has_terrace"
                    checked={formData.has_terrace}
                    onChange={handleChange}
                    className="h-4 w-4 text-[var(--color-electric-blue)] focus:ring-[var(--color-electric-blue)] border-[var(--border)] rounded"
                  />
                  <span className="ml-2 text-sm text-[var(--text)]">Terrasse</span>
                </label>

                <label htmlFor="lot-has_garden" className="flex items-center cursor-pointer">
                  <input
                    id="lot-has_garden"
                    type="checkbox"
                    name="has_garden"
                    checked={formData.has_garden}
                    onChange={handleChange}
                    className="h-4 w-4 text-[var(--color-electric-blue)] focus:ring-[var(--color-electric-blue)] border-[var(--border)] rounded"
                  />
                  <span className="ml-2 text-sm text-[var(--text)]">Jardin</span>
                </label>

                <label htmlFor="lot-has_elevator" className="flex items-center cursor-pointer">
                  <input
                    id="lot-has_elevator"
                    type="checkbox"
                    name="has_elevator"
                    checked={formData.has_elevator}
                    onChange={handleChange}
                    className="h-4 w-4 text-[var(--color-electric-blue)] focus:ring-[var(--color-electric-blue)] border-[var(--border)] rounded"
                  />
                  <span className="ml-2 text-sm text-[var(--text)]">Ascenseur</span>
                </label>
              </div>
            </div>

            {/* Diagnostics énergétiques (DPE) */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-lg font-display font-semibold text-[var(--text)] mb-4">Diagnostics énergétiques (DPE)</h3>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="lot-dpe_rating" className="block text-sm font-medium text-[var(--text)] mb-2">
                      Classe DPE
                    </label>
                    <select
                      id="lot-dpe_rating"
                      name="dpe_rating"
                      value={formData.dpe_rating}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                    >
                      <option value="">Non renseigné</option>
                      {dpeRatings.map(rating => (
                        <option key={rating} value={rating}>{rating}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="lot-dpe_value" className="block text-sm font-medium text-[var(--text)] mb-2">
                      Valeur DPE (kWh/m²/an)
                    </label>
                    <input
                      id="lot-dpe_value"
                      type="number"
                      name="dpe_value"
                      value={formData.dpe_value}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                      placeholder="150"
                      min="0"
                    />
                  </div>

                  <div>
                    <label htmlFor="lot-dpe_date" className="block text-sm font-medium text-[var(--text)] mb-2">
                      Date DPE
                    </label>
                    <input
                      id="lot-dpe_date"
                      type="date"
                      name="dpe_date"
                      value={formData.dpe_date}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="lot-ges_rating" className="block text-sm font-medium text-[var(--text)] mb-2">
                      Classe GES (Gaz à Effet de Serre)
                    </label>
                    <select
                      id="lot-ges_rating"
                      name="ges_rating"
                      value={formData.ges_rating}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                    >
                      <option value="">Non renseigné</option>
                      {dpeRatings.map(rating => (
                        <option key={rating} value={rating}>{rating}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="lot-ges_value" className="block text-sm font-medium text-[var(--text)] mb-2">
                      Valeur GES (kg CO2/m²/an)
                    </label>
                    <input
                      id="lot-ges_value"
                      type="number"
                      name="ges_value"
                      value={formData.ges_value}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                      placeholder="30"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Informations copropriété */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-lg font-display font-semibold text-[var(--text)] mb-4">Informations copropriété</h3>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="lot-coproperty_lot_number" className="block text-sm font-medium text-[var(--text)] mb-2">
                      Numéro de lot en copropriété
                    </label>
                    <input
                      id="lot-coproperty_lot_number"
                      type="text"
                      name="coproperty_lot_number"
                      value={formData.coproperty_lot_number}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                      placeholder="Ex: 12, A-5..."
                    />
                  </div>

                  <div>
                    <label htmlFor="lot-coproperty_tantieme" className="block text-sm font-medium text-[var(--text)] mb-2">
                      Tantièmes de copropriété
                    </label>
                    <input
                      id="lot-coproperty_tantieme"
                      type="number"
                      name="coproperty_tantieme"
                      value={formData.coproperty_tantieme}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                      placeholder="Ex: 50 (en millièmes)"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Informations additionnelles */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-lg font-display font-semibold text-[var(--text)] mb-4">Informations additionnelles</h3>

              <div className="space-y-6">
                <div>
                  <label htmlFor="lot-description" className="block text-sm font-medium text-[var(--text)] mb-2">
                    Description
                  </label>
                  <textarea
                    id="lot-description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                    rows="3"
                    placeholder="Description du lot, points forts..."
                  />
                </div>

                <div>
                  <label htmlFor="lot-notes" className="block text-sm font-medium text-[var(--text)] mb-2">
                    Notes privées
                  </label>
                  <textarea
                    id="lot-notes"
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
                {isEditMode ? 'Mettre à jour le lot' : 'Créer le lot'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (searchParams.get('property')) {
                    navigate(`/properties/${searchParams.get('property')}`)
                  } else {
                    navigate('/lots')
                  }
                }}
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

export default LotForm
