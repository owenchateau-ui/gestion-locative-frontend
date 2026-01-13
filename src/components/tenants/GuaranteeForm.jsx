import { useState, useEffect } from 'react'
import { User, Shield, Building, Landmark, FileCheck, HelpCircle } from 'lucide-react'
import Button from '../ui/Button'
import Card from '../ui/Card'
import Alert from '../ui/Alert'
import { GUARANTEE_TYPES, GUARANTOR_RELATIONSHIPS } from '../../constants/tenantConstants'
import { simpleGuaranteeSchema } from '../../schemas/guaranteeSchema'

function GuaranteeForm({ onSave, onCancel, initialData = null }) {
  const [formData, setFormData] = useState({
    guarantee_type: '',

    // Garant physique
    guarantor_first_name: '',
    guarantor_last_name: '',
    guarantor_email: '',
    guarantor_phone: '',
    guarantor_relationship: '',
    guarantor_address: '',
    guarantor_monthly_income: '',
    guarantor_professional_status: '',

    // Organisme
    organism_name: '',
    certificate_number: '',
    certificate_url: '',
    coverage_amount: '',
    annual_cost: '',

    // Validité
    valid_from: '',
    valid_until: '',

    // Notes
    notes: ''
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({
        guarantee_type: initialData.guarantee_type || '',
        guarantor_first_name: initialData.guarantor_first_name || '',
        guarantor_last_name: initialData.guarantor_last_name || '',
        guarantor_email: initialData.guarantor_email || '',
        guarantor_phone: initialData.guarantor_phone || '',
        guarantor_relationship: initialData.guarantor_relationship || '',
        guarantor_address: initialData.guarantor_address || '',
        guarantor_monthly_income: initialData.guarantor_monthly_income || '',
        guarantor_professional_status: initialData.guarantor_professional_status || '',
        organism_name: initialData.organism_name || '',
        certificate_number: initialData.certificate_number || '',
        certificate_url: initialData.certificate_url || '',
        coverage_amount: initialData.coverage_amount || '',
        annual_cost: initialData.annual_cost || '',
        valid_from: initialData.valid_from || '',
        valid_until: initialData.valid_until || '',
        notes: initialData.notes || ''
      })
    }
  }, [initialData])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }))
    // Effacer l'erreur du champ
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      // Valider avec Zod
      const result = simpleGuaranteeSchema.safeParse(formData)

      if (!result.success) {
        const fieldErrors = {}
        result.error.errors.forEach((error) => {
          fieldErrors[error.path[0]] = error.message
        })
        setErrors(fieldErrors)
        setLoading(false)
        return
      }

      await onSave(formData)
    } catch (err) {
      console.error('Error saving guarantee:', err)
      setErrors({ _form: err.message || 'Une erreur est survenue' })
    } finally {
      setLoading(false)
    }
  }

  const selectedType = GUARANTEE_TYPES[formData.guarantee_type]

  const getIcon = (iconName) => {
    const icons = {
      User: User,
      Shield: Shield,
      Building: Building,
      Landmark: Landmark,
      FileCheck: FileCheck,
      HelpCircle: HelpCircle
    }
    const Icon = icons[iconName] || HelpCircle
    return <Icon className="w-5 h-5" />
  }

  return (
    <Card title={initialData ? "Modifier la garantie" : "Ajouter une garantie"} padding>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sélection du type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de garantie <span className="text-red-500">*</span>
          </label>
          <select
            name="guarantee_type"
            value={formData.guarantee_type}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.guarantee_type ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Sélectionnez un type...</option>
            {Object.entries(GUARANTEE_TYPES).map(([key, type]) => (
              <option key={key} value={key}>
                {type.label} - {type.cost}
              </option>
            ))}
          </select>
          {errors.guarantee_type && (
            <p className="text-red-500 text-sm mt-1">{errors.guarantee_type}</p>
          )}
        </div>

        {/* Info sur le type sélectionné */}
        {selectedType && (
          <Alert variant="info">
            <div className="flex items-start gap-3">
              {getIcon(selectedType.icon)}
              <div>
                <p className="font-medium">{selectedType.label}</p>
                <p className="text-sm mt-1">{selectedType.description}</p>
                {selectedType.website && (
                  <a
                    href={selectedType.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                  >
                    En savoir plus →
                  </a>
                )}
              </div>
            </div>
          </Alert>
        )}

        {/* Champs pour Garant physique */}
        {formData.guarantee_type === 'physical_person' && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-700">Informations du garant</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="guarantor_first_name"
                  value={formData.guarantor_first_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.guarantor_first_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.guarantor_first_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.guarantor_first_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="guarantor_last_name"
                  value={formData.guarantor_last_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.guarantor_last_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.guarantor_last_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.guarantor_last_name}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lien avec le garant <span className="text-red-500">*</span>
              </label>
              <select
                name="guarantor_relationship"
                value={formData.guarantor_relationship}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.guarantor_relationship ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionnez...</option>
                {Object.entries(GUARANTOR_RELATIONSHIPS).map(([key, rel]) => (
                  <option key={key} value={key}>{rel.label}</option>
                ))}
              </select>
              {errors.guarantor_relationship && (
                <p className="text-red-500 text-sm mt-1">{errors.guarantor_relationship}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-gray-500 text-sm">(optionnel)</span>
                </label>
                <input
                  type="email"
                  name="guarantor_email"
                  value={formData.guarantor_email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone <span className="text-gray-500 text-sm">(optionnel)</span>
                </label>
                <input
                  type="tel"
                  name="guarantor_phone"
                  value={formData.guarantor_phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Revenus mensuels <span className="text-gray-500 text-sm">(optionnel)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="guarantor_monthly_income"
                  value={formData.guarantor_monthly_income}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="Ex: 3000"
                  className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                  €/mois
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse <span className="text-gray-500 text-sm">(optionnel)</span>
              </label>
              <input
                type="text"
                name="guarantor_address"
                value={formData.guarantor_address}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Champs pour Visale */}
        {formData.guarantee_type === 'visale' && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de visa Visale <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="certificate_number"
                value={formData.certificate_number}
                onChange={handleChange}
                placeholder="Ex: VIS-123456789"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.certificate_number ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.certificate_number && (
                <p className="text-red-500 text-sm mt-1">{errors.certificate_number}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valable du <span className="text-gray-500 text-sm">(optionnel)</span>
                </label>
                <input
                  type="date"
                  name="valid_from"
                  value={formData.valid_from}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Au <span className="text-gray-500 text-sm">(optionnel)</span>
                </label>
                <input
                  type="date"
                  name="valid_until"
                  value={formData.valid_until}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Champs pour Organismes (GarantMe, Cautioneo, etc.) */}
        {['garantme', 'cautioneo', 'smartgarant', 'unkle', 'other'].includes(formData.guarantee_type) && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            {formData.guarantee_type === 'other' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'organisme
                </label>
                <input
                  type="text"
                  name="organism_name"
                  value={formData.organism_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de certificat <span className="text-gray-500 text-sm">(optionnel)</span>
              </label>
              <input
                type="text"
                name="certificate_number"
                value={formData.certificate_number}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant couvert <span className="text-gray-500 text-sm">(optionnel)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="coverage_amount"
                    value={formData.coverage_amount}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coût annuel <span className="text-gray-500 text-sm">(optionnel)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="annual_cost"
                    value={formData.annual_cost}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Champs pour Caution bancaire */}
        {formData.guarantee_type === 'bank_guarantee' && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la banque <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="organism_name"
                value={formData.organism_name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.organism_name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.organism_name && (
                <p className="text-red-500 text-sm mt-1">{errors.organism_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant de la caution <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="coverage_amount"
                  value={formData.coverage_amount}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.coverage_amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
              </div>
              {errors.coverage_amount && (
                <p className="text-red-500 text-sm mt-1">{errors.coverage_amount}</p>
              )}
            </div>
          </div>
        )}

        {/* Champs pour GLI */}
        {formData.guarantee_type === 'gli' && (
          <Alert variant="info">
            La GLI (Garantie Loyers Impayés) est souscrite par le propriétaire et couvre les loyers impayés.
          </Alert>
        )}

        {/* Notes (pour tous les types) */}
        {formData.guarantee_type && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes <span className="text-gray-500 text-sm">(optionnel)</span>
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Informations complémentaires..."
            />
          </div>
        )}

        {/* Erreur générale */}
        {errors._form && (
          <Alert variant="error" title="Erreur">
            {errors._form}
          </Alert>
        )}

        {/* Boutons */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Enregistrement...' : initialData ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default GuaranteeForm
