import { memo } from 'react'
import PropTypes from 'prop-types'
import {
  User,
  Briefcase,
  Euro,
  UserPlus,
  Upload,
  CheckCircle
} from 'lucide-react'

const STEP_ICONS = {
  1: User,
  2: Briefcase,
  3: Euro,
  4: UserPlus,
  5: Upload,
  6: CheckCircle
}

const STEPS = [
  { id: 1, title: 'Informations personnelles' },
  { id: 2, title: 'Situation professionnelle' },
  { id: 3, title: 'Revenus' },
  { id: 4, title: 'Garant' },
  { id: 5, title: 'Documents' },
  { id: 6, title: 'Récapitulatif' }
]

const FormProgress = memo(function FormProgress({ currentStep }) {
  return (
    <div className="flex items-center justify-between">
      {STEPS.map((step, index) => {
        const Icon = STEP_ICONS[step.id]
        return (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex flex-col items-center ${
                index < STEPS.length - 1 ? 'flex-1' : ''
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= step.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs text-gray-600 mt-2 text-center hidden md:block">
                {step.title}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`h-1 flex-1 mx-2 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
})

FormProgress.propTypes = {
  currentStep: PropTypes.number.isRequired
}

export default FormProgress
