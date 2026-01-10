import { memo } from 'react'
import PropTypes from 'prop-types'
import { ChevronLeft, ChevronRight, Send } from 'lucide-react'
import Button from '../ui/Button'

const FormNavigation = memo(function FormNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  isSubmitting = false,
  canGoNext = true
}) {
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === totalSteps

  return (
    <div className="flex justify-between pt-6 border-t border-[var(--border)] mt-8">
      {!isFirstStep ? (
        <Button
          variant="secondary"
          onClick={onPrevious}
          disabled={isSubmitting}
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Précédent
        </Button>
      ) : (
        <div />
      )}

      {isLastStep ? (
        <Button
          variant="primary"
          onClick={onSubmit}
          disabled={isSubmitting || !canGoNext}
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Envoi en cours...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Envoyer ma candidature
            </>
          )}
        </Button>
      ) : (
        <Button
          variant="primary"
          onClick={onNext}
          disabled={!canGoNext}
        >
          Suivant
          <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      )}
    </div>
  )
})

FormNavigation.propTypes = {
  currentStep: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
  canGoNext: PropTypes.bool
}

export default FormNavigation
