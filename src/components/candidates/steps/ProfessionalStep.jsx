import { memo } from 'react'
import PropTypes from 'prop-types'
import { Briefcase } from 'lucide-react'
import { ErrorMessage } from '../utils'

const PROFESSIONAL_STATUS_OPTIONS = [
  { value: 'cdi', label: 'CDI' },
  { value: 'cdd', label: 'CDD' },
  { value: 'interim', label: 'Intérim' },
  { value: 'freelance', label: 'Indépendant' },
  { value: 'student', label: 'Étudiant' },
  { value: 'retired', label: 'Retraité' },
  { value: 'unemployed', label: 'Sans emploi' },
  { value: 'other', label: 'Autre' }
]

const ProfessionalStep = memo(function ProfessionalStep({
  formData,
  errors,
  onChange
}) {
  const applicationType = formData.application_type
  const isCouple = applicationType === 'couple'
  const isColocation = applicationType === 'colocation'
  const showApplicant2 = isCouple || isColocation

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Situation professionnelle
      </h2>

      {/* Candidat principal */}
      <ProfessionalFields
        formData={formData}
        errors={errors}
        onChange={onChange}
        prefix=""
      />

      {/* Candidat 2 */}
      {showApplicant2 && (
        <div className={`mt-8 pt-8 border-t-4 ${isCouple ? 'border-green-500' : 'border-purple-500'}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className={`w-5 h-5 ${isCouple ? 'text-green-600' : 'text-purple-600'}`} />
            Situation professionnelle - {isCouple ? 'Conjoint(e)' : 'Candidat 2'}
          </h3>

          <div className={`space-y-4 p-6 rounded-lg ${isCouple ? 'bg-green-50' : 'bg-purple-50'}`}>
            <ProfessionalFields
              formData={formData}
              errors={errors}
              onChange={onChange}
              prefix="applicant2_"
              showRequired
            />
          </div>
        </div>
      )}
    </div>
  )
})

const ProfessionalFields = memo(function ProfessionalFields({
  formData,
  errors,
  onChange,
  prefix = '',
  showRequired = false
}) {
  const statusField = `${prefix}professional_status`
  const employerField = `${prefix}employer_name`
  const jobField = `${prefix}job_title`
  const contractField = `${prefix}contract_type`
  const startDateField = `${prefix}employment_start_date`

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Statut professionnel {showRequired ? '*' : ''}
        </label>
        <select
          name={statusField}
          value={formData[statusField] || ''}
          onChange={onChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
            errors[statusField] ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          {showRequired && <option value="">-- Sélectionner --</option>}
          {PROFESSIONAL_STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ErrorMessage error={errors[statusField]} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nom de l'employeur
        </label>
        <input
          type="text"
          name={employerField}
          value={formData[employerField] || ''}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Poste
        </label>
        <input
          type="text"
          name={jobField}
          value={formData[jobField] || ''}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type de contrat
        </label>
        <input
          type="text"
          name={contractField}
          value={formData[contractField] || ''}
          onChange={onChange}
          placeholder="Ex: Temps plein, Temps partiel..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date de début d'emploi
        </label>
        <input
          type="date"
          name={startDateField}
          value={formData[startDateField] || ''}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
    </>
  )
})

ProfessionalFields.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  prefix: PropTypes.string,
  showRequired: PropTypes.bool
}

ProfessionalStep.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
}

export default ProfessionalStep
