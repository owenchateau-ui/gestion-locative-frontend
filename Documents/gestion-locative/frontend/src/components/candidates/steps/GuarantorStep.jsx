import { memo } from 'react'
import PropTypes from 'prop-types'
import { UserPlus, Shield } from 'lucide-react'
import { ErrorMessage } from '../utils'

const RELATIONSHIP_OPTIONS = [
  { value: '', label: '-- Sélectionner --' },
  { value: 'parent', label: 'Parent' },
  { value: 'grandparent', label: 'Grand-parent' },
  { value: 'sibling', label: 'Frère/Soeur' },
  { value: 'other_family', label: 'Autre membre de la famille' },
  { value: 'friend', label: 'Ami(e)' },
  { value: 'employer', label: 'Employeur' },
  { value: 'other', label: 'Autre' }
]

const PROFESSIONAL_STATUS_OPTIONS = [
  { value: '', label: '-- Sélectionner --' },
  { value: 'cdi', label: 'CDI' },
  { value: 'cdd', label: 'CDD' },
  { value: 'freelance', label: 'Indépendant' },
  { value: 'retired', label: 'Retraité' },
  { value: 'other', label: 'Autre' }
]

const GuarantorStep = memo(function GuarantorStep({
  formData,
  errors,
  onChange
}) {
  const hasGuarantor = formData.has_guarantor
  const hasGuarantor2 = formData.has_guarantor2

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Garant</h2>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <Shield className="w-4 h-4 inline mr-2" />
          Un garant peut renforcer votre dossier de candidature. Il s'engage à payer
          le loyer si vous ne pouvez pas le faire.
        </p>
      </div>

      {/* Garant 1 */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            id="has_guarantor"
            name="has_guarantor"
            checked={hasGuarantor}
            onChange={onChange}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="has_guarantor" className="text-lg font-medium text-gray-900 cursor-pointer">
            J'ai un garant
          </label>
        </div>

        {hasGuarantor && (
          <GuarantorFields
            formData={formData}
            errors={errors}
            onChange={onChange}
            prefix="guarantor_"
          />
        )}
      </div>

      {/* Garant 2 */}
      {hasGuarantor && (
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="has_guarantor2"
              name="has_guarantor2"
              checked={hasGuarantor2}
              onChange={onChange}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="has_guarantor2" className="text-lg font-medium text-gray-900 cursor-pointer">
              J'ai un second garant
            </label>
          </div>

          {hasGuarantor2 && (
            <GuarantorFields
              formData={formData}
              errors={errors}
              onChange={onChange}
              prefix="guarantor2_"
            />
          )}
        </div>
      )}

      {!hasGuarantor && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            Vous pouvez continuer sans garant, mais cela peut réduire vos chances
            d'être sélectionné(e).
          </p>
        </div>
      )}
    </div>
  )
})

const GuarantorFields = memo(function GuarantorFields({
  formData,
  errors,
  onChange,
  prefix
}) {
  const getFieldName = (field) => `${prefix}${field}`
  const getFieldValue = (field) => formData[getFieldName(field)] || ''
  const getFieldError = (field) => errors[getFieldName(field)]

  const inputClass = 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prénom *
          </label>
          <input
            type="text"
            name={getFieldName('first_name')}
            value={getFieldValue('first_name')}
            onChange={onChange}
            className={`${inputClass} ${getFieldError('first_name') ? 'border-red-500' : 'border-gray-300'}`}
          />
          <ErrorMessage error={getFieldError('first_name')} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom *
          </label>
          <input
            type="text"
            name={getFieldName('last_name')}
            value={getFieldValue('last_name')}
            onChange={onChange}
            className={`${inputClass} ${getFieldError('last_name') ? 'border-red-500' : 'border-gray-300'}`}
          />
          <ErrorMessage error={getFieldError('last_name')} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lien avec le candidat *
        </label>
        <select
          name={getFieldName('relationship')}
          value={getFieldValue('relationship')}
          onChange={onChange}
          className={`${inputClass} ${getFieldError('relationship') ? 'border-red-500' : 'border-gray-300'}`}
        >
          {RELATIONSHIP_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ErrorMessage error={getFieldError('relationship')} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            name={getFieldName('email')}
            value={getFieldValue('email')}
            onChange={onChange}
            placeholder="garant@exemple.fr"
            className={`${inputClass} ${getFieldError('email') ? 'border-red-500' : 'border-gray-300'}`}
          />
          <ErrorMessage error={getFieldError('email')} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Téléphone *
          </label>
          <input
            type="tel"
            name={getFieldName('phone')}
            value={getFieldValue('phone')}
            onChange={onChange}
            placeholder="06 12 34 56 78"
            className={`${inputClass} ${getFieldError('phone') ? 'border-red-500' : 'border-gray-300'}`}
          />
          <ErrorMessage error={getFieldError('phone')} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Situation professionnelle
        </label>
        <select
          name={getFieldName('professional_status')}
          value={getFieldValue('professional_status')}
          onChange={onChange}
          className={`${inputClass} border-gray-300`}
        >
          {PROFESSIONAL_STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Revenus mensuels nets *
        </label>
        <div className="relative">
          <input
            type="number"
            name={getFieldName('monthly_income')}
            value={getFieldValue('monthly_income')}
            onChange={onChange}
            step="0.01"
            min="0"
            placeholder="Ex: 3500"
            className={`w-full px-4 py-3 pr-16 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
              ${getFieldError('monthly_income') ? 'border-red-500' : 'border-gray-300'}`}
          />
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
            €/mois
          </span>
        </div>
        <ErrorMessage error={getFieldError('monthly_income')} />
      </div>
    </div>
  )
})

GuarantorFields.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  prefix: PropTypes.string.isRequired
}

GuarantorStep.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
}

export default GuarantorStep
