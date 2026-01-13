import { memo } from 'react'
import PropTypes from 'prop-types'
import { User, CheckCircle, ChevronRight } from 'lucide-react'
import Button from '../../ui/Button'

const ApplicationTypeStep = memo(function ApplicationTypeStep({
  formData,
  setFormData,
  onNext
}) {
  const handleSelectType = (type, nbApplicants) => {
    setFormData(prev => ({
      ...prev,
      application_type: type,
      nb_applicants: nbApplicants
    }))
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Type de candidature
        </h2>
        <p className="text-gray-600 text-lg">
          Combien de personnes souhaitent louer ce logement ?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Option Individuel */}
        <button
          type="button"
          onClick={() => handleSelectType('individual', 1)}
          className={`relative p-8 border-2 rounded-xl transition-all duration-200 hover:shadow-lg ${
            formData.application_type === 'individual'
              ? 'border-blue-600 bg-blue-50 shadow-lg'
              : 'border-gray-200 hover:border-blue-300'
          }`}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
              formData.application_type === 'individual' ? 'bg-blue-600' : 'bg-gray-200'
            }`}>
              <User className={`w-12 h-12 ${
                formData.application_type === 'individual' ? 'text-white' : 'text-gray-500'
              }`} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Individuel</h3>
              <p className="text-sm text-gray-600 mt-2">Je candidate seul(e)</p>
            </div>
            {formData.application_type === 'individual' && (
              <div className="absolute top-4 right-4">
                <CheckCircle className="w-7 h-7 text-blue-600" />
              </div>
            )}
          </div>
        </button>

        {/* Option Couple */}
        <button
          type="button"
          onClick={() => handleSelectType('couple', 2)}
          className={`relative p-8 border-2 rounded-xl transition-all duration-200 hover:shadow-lg ${
            formData.application_type === 'couple'
              ? 'border-green-600 bg-green-50 shadow-lg'
              : 'border-gray-200 hover:border-green-300'
          }`}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
              formData.application_type === 'couple' ? 'bg-green-600' : 'bg-gray-200'
            }`}>
              <div className="flex">
                <User className={`w-10 h-10 ${
                  formData.application_type === 'couple' ? 'text-white' : 'text-gray-500'
                }`} />
                <User className={`w-10 h-10 -ml-3 ${
                  formData.application_type === 'couple' ? 'text-white' : 'text-gray-500'
                }`} />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Couple</h3>
              <p className="text-sm text-gray-600 mt-2">Nous candidatons à deux</p>
            </div>
            {formData.application_type === 'couple' && (
              <div className="absolute top-4 right-4">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
            )}
          </div>
        </button>

        {/* Option Colocation */}
        <button
          type="button"
          onClick={() => handleSelectType('colocation', 3)}
          className={`relative p-8 border-2 rounded-xl transition-all duration-200 hover:shadow-lg ${
            formData.application_type === 'colocation'
              ? 'border-purple-600 bg-purple-50 shadow-lg'
              : 'border-gray-200 hover:border-purple-300'
          }`}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
              formData.application_type === 'colocation' ? 'bg-purple-600' : 'bg-gray-200'
            }`}>
              <div className="flex -space-x-2">
                <User className={`w-8 h-8 ${
                  formData.application_type === 'colocation' ? 'text-white' : 'text-gray-500'
                }`} />
                <User className={`w-8 h-8 ${
                  formData.application_type === 'colocation' ? 'text-white' : 'text-gray-500'
                }`} />
                <User className={`w-8 h-8 ${
                  formData.application_type === 'colocation' ? 'text-white' : 'text-gray-500'
                }`} />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Colocation</h3>
              <p className="text-sm text-gray-600 mt-2">Nous candidatons à plusieurs</p>
            </div>
            {formData.application_type === 'colocation' && (
              <>
                <div className="w-full mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de colocataires
                  </label>
                  <select
                    value={formData.nb_applicants}
                    onChange={(e) => {
                      e.stopPropagation()
                      setFormData(prev => ({
                        ...prev,
                        nb_applicants: parseInt(e.target.value)
                      }))
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value={2}>2 personnes</option>
                    <option value={3}>3 personnes</option>
                    <option value={4}>4 personnes</option>
                  </select>
                </div>
                <div className="absolute top-4 right-4">
                  <CheckCircle className="w-7 h-7 text-purple-600" />
                </div>
              </>
            )}
          </div>
        </button>
      </div>

      <div className="flex justify-end pt-6">
        <Button
          onClick={onNext}
          disabled={!formData.application_type}
          size="lg"
        >
          Suivant
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  )
})

ApplicationTypeStep.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired
}

export default ApplicationTypeStep
