import { memo } from 'react'
import PropTypes from 'prop-types'
import { User } from 'lucide-react'
import { ErrorMessage } from '../utils'

const INPUT_CLASS = 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
const ERROR_INPUT_CLASS = 'border-red-500'
const NORMAL_INPUT_CLASS = 'border-gray-300'

const PersonalInfoStep = memo(function PersonalInfoStep({
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

  const getInputClass = (fieldName) => {
    return `${INPUT_CLASS} ${errors[fieldName] ? ERROR_INPUT_CLASS : NORMAL_INPUT_CLASS}`
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Informations personnelles
      </h2>

      {/* Candidat principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prénom *
          </label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={onChange}
            className={getInputClass('first_name')}
          />
          <ErrorMessage error={errors.first_name} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom *
          </label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={onChange}
            className={getInputClass('last_name')}
          />
          <ErrorMessage error={errors.last_name} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email *
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={onChange}
          placeholder="nom@exemple.fr"
          className={getInputClass('email')}
        />
        <ErrorMessage error={errors.email} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Téléphone *
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={onChange}
          placeholder="06 12 34 56 78"
          className={getInputClass('phone')}
        />
        <ErrorMessage error={errors.phone} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date de naissance *
        </label>
        <input
          type="date"
          name="birth_date"
          value={formData.birth_date}
          onChange={onChange}
          max={new Date().toISOString().split('T')[0]}
          className={getInputClass('birth_date')}
        />
        <ErrorMessage error={errors.birth_date} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Adresse actuelle *
        </label>
        <input
          type="text"
          name="current_address"
          value={formData.current_address}
          onChange={onChange}
          placeholder="1 rue de la Paix, 75001 Paris"
          className={getInputClass('current_address')}
        />
        <ErrorMessage error={errors.current_address} />
      </div>

      {/* Candidat 2 */}
      {showApplicant2 && (
        <ApplicantSection
          number={2}
          title={isCouple ? 'Votre conjoint(e)' : 'Candidat 2'}
          formData={formData}
          errors={errors}
          onChange={onChange}
          colorClass={isCouple ? 'green' : 'purple'}
        />
      )}

      {/* Candidat 3 */}
      {showApplicant3 && (
        <ApplicantSection
          number={3}
          title="Candidat 3"
          formData={formData}
          errors={errors}
          onChange={onChange}
          colorClass="purple"
          simplified
        />
      )}

      {/* Candidat 4 */}
      {showApplicant4 && (
        <ApplicantSection
          number={4}
          title="Candidat 4"
          formData={formData}
          errors={errors}
          onChange={onChange}
          colorClass="purple"
          simplified
        />
      )}
    </div>
  )
})

// Sous-composant pour les candidats additionnels
const ApplicantSection = memo(function ApplicantSection({
  number,
  title,
  formData,
  errors,
  onChange,
  colorClass,
  simplified = false
}) {
  const prefix = `applicant${number}_`
  const borderColor = colorClass === 'green' ? 'border-green-500' : 'border-purple-500'
  const bgColor = colorClass === 'green' ? 'bg-green-50' : 'bg-purple-50'
  const iconColor = colorClass === 'green' ? 'text-green-600' : 'text-purple-600'
  const ringColor = colorClass === 'green' ? 'focus:ring-green-500' : 'focus:ring-purple-500'

  const getInputClass = (fieldName) => {
    const base = `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${ringColor}`
    return `${base} ${errors[fieldName] ? 'border-red-500' : 'border-gray-300'}`
  }

  return (
    <div className={`mt-8 pt-8 border-t-4 ${borderColor}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <User className={`w-5 h-5 ${iconColor}`} />
        {title}
      </h3>

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${bgColor} p-6 rounded-lg`}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prénom *
          </label>
          <input
            type="text"
            name={`${prefix}first_name`}
            value={formData[`${prefix}first_name`]}
            onChange={onChange}
            className={getInputClass(`${prefix}first_name`)}
          />
          <ErrorMessage error={errors[`${prefix}first_name`]} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom *
          </label>
          <input
            type="text"
            name={`${prefix}last_name`}
            value={formData[`${prefix}last_name`]}
            onChange={onChange}
            className={getInputClass(`${prefix}last_name`)}
          />
          <ErrorMessage error={errors[`${prefix}last_name`]} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            name={`${prefix}email`}
            value={formData[`${prefix}email`]}
            onChange={onChange}
            placeholder="nom@exemple.fr"
            className={getInputClass(`${prefix}email`)}
          />
          <ErrorMessage error={errors[`${prefix}email`]} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Téléphone {simplified ? '' : '*'}
          </label>
          <input
            type="tel"
            name={`${prefix}phone`}
            value={formData[`${prefix}phone`]}
            onChange={onChange}
            placeholder="06 12 34 56 78"
            className={getInputClass(`${prefix}phone`)}
          />
          <ErrorMessage error={errors[`${prefix}phone`]} />
        </div>

        {!simplified && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de naissance *
            </label>
            <input
              type="date"
              name={`${prefix}birth_date`}
              value={formData[`${prefix}birth_date`]}
              onChange={onChange}
              max={new Date().toISOString().split('T')[0]}
              className={getInputClass(`${prefix}birth_date`)}
            />
            <ErrorMessage error={errors[`${prefix}birth_date`]} />
          </div>
        )}
      </div>
    </div>
  )
})

ApplicantSection.propTypes = {
  number: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  colorClass: PropTypes.string.isRequired,
  simplified: PropTypes.bool
}

PersonalInfoStep.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
}

export default PersonalInfoStep
