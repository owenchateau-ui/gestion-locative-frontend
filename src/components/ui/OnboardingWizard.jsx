import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  Home,
  Users,
  FileText,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  Sparkles
} from 'lucide-react'
import Button from './Button'
import { STAT_ICON_STYLES } from '../../constants/designSystem'

/**
 * OnboardingWizard - Guide de première utilisation pour les nouveaux utilisateurs
 *
 * Affiche un wizard pas à pas pour guider l'utilisateur dans la création de :
 * 1. Une entité juridique
 * 2. Une propriété
 * 3. Un lot
 * 4. Un locataire
 * 5. Un bail
 */

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Bienvenue sur LocaPro !',
    description: 'Configurons ensemble votre espace de gestion locative en quelques étapes simples.',
    icon: Sparkles,
    action: null
  },
  {
    id: 'entity',
    title: 'Créez votre entité juridique',
    description: 'Une entité représente votre structure juridique (SCI, SARL, nom propre...). C\'est le point de départ pour organiser votre patrimoine.',
    icon: Building2,
    action: '/entities/new',
    actionLabel: 'Créer mon entité'
  },
  {
    id: 'property',
    title: 'Ajoutez une propriété',
    description: 'Une propriété représente un bien immobilier (immeuble, maison, appartement...) que vous possédez.',
    icon: Home,
    action: '/properties/new',
    actionLabel: 'Ajouter une propriété'
  },
  {
    id: 'lot',
    title: 'Créez un lot',
    description: 'Un lot est une unité locative (appartement, parking, cave...) au sein d\'une propriété.',
    icon: Home,
    action: '/lots/new',
    actionLabel: 'Créer un lot'
  },
  {
    id: 'tenant',
    title: 'Ajoutez un locataire',
    description: 'Enregistrez les informations de vos locataires pour pouvoir créer des baux.',
    icon: Users,
    action: '/tenants/new',
    actionLabel: 'Ajouter un locataire'
  },
  {
    id: 'lease',
    title: 'Créez votre premier bail',
    description: 'Un bail lie un lot à un locataire avec toutes les conditions de location.',
    icon: FileText,
    action: '/leases/new',
    actionLabel: 'Créer un bail'
  },
  {
    id: 'complete',
    title: 'Vous êtes prêt !',
    description: 'Félicitations ! Vous pouvez maintenant gérer vos paiements, générer des quittances et bien plus encore.',
    icon: Check,
    action: '/dashboard',
    actionLabel: 'Aller au tableau de bord'
  }
]

function OnboardingWizard({ isOpen, onClose, initialStep = 0 }) {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(initialStep)

  const step = ONBOARDING_STEPS[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1
  const progress = ((currentStep) / (ONBOARDING_STEPS.length - 1)) * 100

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleAction = () => {
    if (step.action) {
      // Sauvegarder l'étape actuelle
      localStorage.setItem('onboardingStep', currentStep.toString())
      // Naviguer vers l'action
      navigate(step.action)
      onClose()
    }
  }

  const handleSkip = () => {
    localStorage.setItem('onboardingCompleted', 'true')
    onClose()
  }

  const handleComplete = () => {
    localStorage.setItem('onboardingCompleted', 'true')
    if (step.action) {
      navigate(step.action)
    }
    onClose()
  }

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowRight' && !isLastStep) {
        handleNext()
      } else if (e.key === 'ArrowLeft' && !isFirstStep) {
        handlePrev()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isFirstStep, isLastStep])

  if (!isOpen) return null

  const StepIcon = step.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Modal */}
      <div className="relative bg-[var(--surface)] rounded-2xl shadow-2xl border border-[var(--border)] w-full max-w-lg overflow-hidden animate-scale-in">
        {/* Progress bar */}
        <div className="h-1 bg-[var(--surface-elevated)]">
          <div
            className="h-full bg-[var(--color-electric-blue)] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <span>Étape {currentStep + 1}</span>
            <span>/</span>
            <span>{ONBOARDING_STEPS.length}</span>
          </div>
          <button
            onClick={handleSkip}
            className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-8 text-center">
          {/* Icon - Bold Geometric TYPE 1 */}
          <div className={`
            inline-flex items-center justify-center w-16 h-16 rounded-full mb-6
            ${currentStep === ONBOARDING_STEPS.length - 1
              ? `${STAT_ICON_STYLES.emerald.container} ${STAT_ICON_STYLES.emerald.icon}`
              : `${STAT_ICON_STYLES.blue.container} ${STAT_ICON_STYLES.blue.icon}`
            }
          `}>
            <StepIcon className="w-8 h-8" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold font-display text-[var(--text)] mb-3">
            {step.title}
          </h2>

          {/* Description */}
          <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
            {step.description}
          </p>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {ONBOARDING_STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`
                  w-2.5 h-2.5 rounded-full transition-all duration-300
                  ${index === currentStep
                    ? 'bg-[var(--color-electric-blue)] w-6'
                    : index < currentStep
                      ? 'bg-[var(--color-electric-blue)]/50'
                      : 'bg-[var(--surface-elevated)]'
                  }
                `}
                aria-label={`Aller à l'étape ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[var(--surface-elevated)] border-t border-[var(--border)]">
          <div className="flex items-center justify-between">
            {/* Left side - Previous button */}
            <div>
              {!isFirstStep && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handlePrev}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Précédent
                </Button>
              )}
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-3">
              {!isLastStep && (
                <button
                  onClick={handleSkip}
                  className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                >
                  Passer le guide
                </button>
              )}

              {isLastStep ? (
                <Button onClick={handleComplete}>
                  <Check className="w-4 h-4 mr-2" />
                  Terminé !
                </Button>
              ) : step.action ? (
                <div className="flex gap-2">
                  <Button onClick={handleAction}>
                    {step.actionLabel}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                  <Button variant="secondary" onClick={handleNext}>
                    Suivant
                  </Button>
                </div>
              ) : (
                <Button onClick={handleNext}>
                  Commencer
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Hook pour gérer l'état de l'onboarding
 */
export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [initialStep, setInitialStep] = useState(0)

  useEffect(() => {
    const completed = localStorage.getItem('onboardingCompleted')
    const savedStep = localStorage.getItem('onboardingStep')

    if (!completed) {
      // Première visite - afficher l'onboarding
      setShowOnboarding(true)
      if (savedStep) {
        setInitialStep(parseInt(savedStep, 10))
      }
    }
  }, [])

  const openOnboarding = (step = 0) => {
    setInitialStep(step)
    setShowOnboarding(true)
  }

  const closeOnboarding = () => {
    setShowOnboarding(false)
  }

  const resetOnboarding = () => {
    localStorage.removeItem('onboardingCompleted')
    localStorage.removeItem('onboardingStep')
    setInitialStep(0)
    setShowOnboarding(true)
  }

  return {
    showOnboarding,
    initialStep,
    openOnboarding,
    closeOnboarding,
    resetOnboarding
  }
}

export default OnboardingWizard
