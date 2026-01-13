import { memo } from 'react'
import PropTypes from 'prop-types'
import { DollarSign } from 'lucide-react'
import { ErrorMessage } from '../utils'

const IncomeStep = memo(function IncomeStep({
  formData,
  errors,
  onChange
}) {
  const applicationType = formData.application_type
  const isCouple = applicationType === 'couple'
  const isColocation = applicationType === 'colocation'
  const showApplicant2 = isCouple || isColocation
  const showApplicant3 = isColocation && formData.nb_applicants >= 3
  const showApplicant4 = isColocation && formData.nb_applicants >= 4

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Revenus</h2>

      {/* Candidat principal */}
      <IncomeFields
        formData={formData}
        errors={errors}
        onChange={onChange}
        prefix=""
      />

      {/* Candidat 2 */}
      {showApplicant2 && (
        <IncomeSection
          title={isCouple ? 'Conjoint(e)' : 'Candidat 2'}
          colorClass={isCouple ? 'green' : 'purple'}
          formData={formData}
          errors={errors}
          onChange={onChange}
          prefix="applicant2_"
        />
      )}

      {/* Candidat 3 */}
      {showApplicant3 && (
        <IncomeSection
          title="Candidat 3"
          colorClass="purple"
          formData={formData}
          errors={errors}
          onChange={onChange}
          prefix="applicant3_"
          simplified
        />
      )}

      {/* Candidat 4 */}
      {showApplicant4 && (
        <IncomeSection
          title="Candidat 4"
          colorClass="purple"
          formData={formData}
          errors={errors}
          onChange={onChange}
          prefix="applicant4_"
          simplified
        />
      )}
    </div>
  )
})

const IncomeSection = memo(function IncomeSection({
  title,
  colorClass,
  formData,
  errors,
  onChange,
  prefix,
  simplified = false
}) {
  const borderColor = colorClass === 'green' ? 'border-green-500' : 'border-purple-500'
  const bgColor = colorClass === 'green' ? 'bg-green-50' : 'bg-purple-50'
  const iconColor = colorClass === 'green' ? 'text-green-600' : 'text-purple-600'

  return (
    <div className={`mt-8 pt-8 border-t-4 ${borderColor}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <DollarSign className={`w-5 h-5 ${iconColor}`} />
        Revenus - {title}
      </h3>

      <div className={`space-y-4 p-6 rounded-lg ${bgColor}`}>
        <IncomeFields
          formData={formData}
          errors={errors}
          onChange={onChange}
          prefix={prefix}
          simplified={simplified}
        />
      </div>
    </div>
  )
})

const IncomeFields = memo(function IncomeFields({
  formData,
  errors,
  onChange,
  prefix = '',
  simplified = false
}) {
  const monthlyField = `${prefix}monthly_income`
  const otherField = `${prefix}other_income`

  const inputClass = `w-full px-4 py-3 pr-16 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500
    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Salaire mensuel net *
        </label>
        <div className="relative">
          <input
            type="number"
            name={monthlyField}
            value={formData[monthlyField] || ''}
            onChange={onChange}
            step="0.01"
            min="0"
            placeholder="Ex: 2500"
            className={`${inputClass} ${
              errors[monthlyField] ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
            €/mois
          </span>
        </div>
        <ErrorMessage error={errors[monthlyField]} />
      </div>

      {!simplified && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Autres revenus mensuels (optionnel)
          </label>
          <div className="relative">
            <input
              type="number"
              name={otherField}
              value={formData[otherField] || ''}
              onChange={onChange}
              step="0.01"
              min="0"
              placeholder="Ex: 500 (allocations, pensions...)"
              className={`${inputClass} border-gray-300`}
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
              €/mois
            </span>
          </div>
        </div>
      )}
    </>
  )
})

IncomeFields.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  prefix: PropTypes.string,
  simplified: PropTypes.bool
}

IncomeSection.propTypes = {
  title: PropTypes.string.isRequired,
  colorClass: PropTypes.string.isRequired,
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  prefix: PropTypes.string.isRequired,
  simplified: PropTypes.bool
}

IncomeStep.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
}

export default IncomeStep
