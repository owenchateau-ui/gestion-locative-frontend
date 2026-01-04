import { memo } from 'react'
import PropTypes from 'prop-types'
import { CheckCircle } from 'lucide-react'
import Alert from '../../ui/Alert'
import { formatCurrency } from '../utils'

const PROFESSIONAL_STATUS_LABELS = {
  cdi: 'CDI',
  cdd: 'CDD',
  interim: 'Intérim',
  freelance: 'Indépendant',
  student: 'Étudiant',
  retired: 'Retraité',
  unemployed: 'Sans emploi',
  other: 'Autre'
}

const SummaryStep = memo(function SummaryStep({
  formData,
  documents
}) {
  const applicationType = formData.application_type
  const isCouple = applicationType === 'couple'
  const isColocation = applicationType === 'colocation'
  const showApplicant2 = isCouple || isColocation

  const totalIncome =
    (parseFloat(formData.monthly_income) || 0) +
    (parseFloat(formData.other_income) || 0) +
    (parseFloat(formData.applicant2_monthly_income) || 0) +
    (parseFloat(formData.applicant2_other_income) || 0) +
    (parseFloat(formData.applicant3_monthly_income) || 0) +
    (parseFloat(formData.applicant4_monthly_income) || 0)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Récapitulatif</h2>

      <div className="space-y-4">
        {/* Type de candidature */}
        <SummaryCard title="Type de candidature">
          <p className="text-sm text-gray-600 capitalize">
            {applicationType === 'individual' && 'Individuel'}
            {applicationType === 'couple' && 'Couple'}
            {applicationType === 'colocation' && `Colocation (${formData.nb_applicants} personnes)`}
          </p>
        </SummaryCard>

        {/* Informations personnelles - Candidat 1 */}
        <SummaryCard title="Informations personnelles">
          <p className="text-sm text-gray-600 font-medium">
            {formData.first_name} {formData.last_name}
          </p>
          <p className="text-sm text-gray-600">{formData.email}</p>
          <p className="text-sm text-gray-600">{formData.phone}</p>
          {formData.current_address && (
            <p className="text-sm text-gray-600">{formData.current_address}</p>
          )}
        </SummaryCard>

        {/* Candidat 2 */}
        {showApplicant2 && formData.applicant2_first_name && (
          <SummaryCard title={isCouple ? 'Conjoint(e)' : 'Candidat 2'}>
            <p className="text-sm text-gray-600 font-medium">
              {formData.applicant2_first_name} {formData.applicant2_last_name}
            </p>
            <p className="text-sm text-gray-600">{formData.applicant2_email}</p>
            <p className="text-sm text-gray-600">{formData.applicant2_phone}</p>
          </SummaryCard>
        )}

        {/* Situation professionnelle */}
        <SummaryCard title="Situation professionnelle">
          <p className="text-sm text-gray-600">
            {PROFESSIONAL_STATUS_LABELS[formData.professional_status] || formData.professional_status}
          </p>
          {formData.employer_name && (
            <p className="text-sm text-gray-600">Employeur : {formData.employer_name}</p>
          )}
          {formData.job_title && (
            <p className="text-sm text-gray-600">Poste : {formData.job_title}</p>
          )}
        </SummaryCard>

        {/* Revenus */}
        <SummaryCard title="Revenus">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Revenus mensuels (candidat 1) :</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency((parseFloat(formData.monthly_income) || 0) + (parseFloat(formData.other_income) || 0))}
              </span>
            </div>
            {showApplicant2 && formData.applicant2_monthly_income && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  Revenus mensuels ({isCouple ? 'conjoint(e)' : 'candidat 2'}) :
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(
                    (parseFloat(formData.applicant2_monthly_income) || 0) +
                    (parseFloat(formData.applicant2_other_income) || 0)
                  )}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-700">Revenus totaux :</span>
              <span className="text-sm font-bold text-green-600">
                {formatCurrency(totalIncome)}
              </span>
            </div>
          </div>
        </SummaryCard>

        {/* Garant */}
        {formData.has_guarantor && (
          <SummaryCard title="Garant">
            <p className="text-sm text-gray-600 font-medium">
              {formData.guarantor_first_name} {formData.guarantor_last_name}
            </p>
            {formData.guarantor_email && (
              <p className="text-sm text-gray-600">{formData.guarantor_email}</p>
            )}
            {formData.guarantor_monthly_income && (
              <p className="text-sm text-gray-600">
                Revenus : {formatCurrency(parseFloat(formData.guarantor_monthly_income) || 0)}
              </p>
            )}
          </SummaryCard>
        )}

        {/* Garant 2 */}
        {formData.has_guarantor2 && (
          <SummaryCard title="Garant 2">
            <p className="text-sm text-gray-600 font-medium">
              {formData.guarantor2_first_name} {formData.guarantor2_last_name}
            </p>
            {formData.guarantor2_email && (
              <p className="text-sm text-gray-600">{formData.guarantor2_email}</p>
            )}
            {formData.guarantor2_monthly_income && (
              <p className="text-sm text-gray-600">
                Revenus : {formatCurrency(parseFloat(formData.guarantor2_monthly_income) || 0)}
              </p>
            )}
          </SummaryCard>
        )}

        {/* Documents */}
        <SummaryCard title="Documents uploadés">
          <ul className="text-sm text-gray-600 space-y-1">
            {Object.entries(documents).map(([key, value]) => {
              if (key.endsWith('_applicantNumber') || !value) return null

              const files = Array.isArray(value) ? value : [value]
              return files.map((file, index) => (
                <li key={`${key}-${index}`} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="truncate">{file.name}</span>
                </li>
              ))
            })}
          </ul>
        </SummaryCard>
      </div>

      <Alert variant="info">
        En soumettant cette candidature, vous confirmez que toutes les informations
        fournies sont exactes et véridiques.
      </Alert>
    </div>
  )
})

const SummaryCard = memo(function SummaryCard({ title, children }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="font-medium text-gray-900 mb-2">{title}</h3>
      {children}
    </div>
  )
})

SummaryCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
}

SummaryStep.propTypes = {
  formData: PropTypes.object.isRequired,
  documents: PropTypes.object.isRequired
}

export default SummaryStep
