import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle, Building, Home, Euro, AlertCircle } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Alert from '../components/ui/Alert'
import Loading from '../components/ui/Loading'
import {
  FormProgress,
  formatError,
  formatCurrency,
  INITIAL_FORM_DATA,
  INITIAL_DOCUMENTS
} from '../components/candidates'
import {
  ApplicationTypeStep,
  PersonalInfoStep,
  ProfessionalStep,
  IncomeStep,
  GuarantorStep,
  DocumentsStep,
  SummaryStep
} from '../components/candidates/steps'
import {
  getLotByInvitationToken,
  createCandidate,
  uploadDocument
} from '../services/candidateService'
import {
  candidateStep1Schema,
  candidateStep2Schema,
  candidateStep3Schema,
  candidateStep4Schema
} from '../schemas/candidateSchema'

function PublicCandidateForm() {
  const { token } = useParams()
  const navigate = useNavigate()

  // États
  const [currentStep, setCurrentStep] = useState(0)
  const [lot, setLot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [errors, setErrors] = useState({})
  const [successToken, setSuccessToken] = useState(null)
  const [formData, setFormData] = useState(INITIAL_FORM_DATA)
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS)

  // Chargement du lot
  useEffect(() => {
    loadLot()
  }, [token])

  const loadLot = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await getLotByInvitationToken(token)
      if (fetchError) throw fetchError
      setLot(data)
    } catch (err) {
      console.error('Error loading lot:', err)
      setError(formatError(err) || 'Lien invalide ou expiré')
    } finally {
      setLoading(false)
    }
  }

  // Gestion des changements de formulaire
  const clearFieldError = useCallback((fieldName) => {
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[fieldName]
      return newErrors
    })
  }, [])

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    let finalValue = value

    if (type === 'checkbox') {
      finalValue = checked
    } else if (type === 'number') {
      finalValue = value === '' ? '' : parseFloat(value) || 0
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }))
    clearFieldError(name)
  }, [clearFieldError])

  const handleFileChange = useCallback((e, docType, applicantNumber = 1) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      const key = applicantNumber > 1 ? `${docType}_applicant${applicantNumber}` : docType
      setDocuments((prev) => {
        const existingFiles = prev[key] ? (Array.isArray(prev[key]) ? prev[key] : [prev[key]]) : []
        return {
          ...prev,
          [key]: [...existingFiles, ...files],
          [`${key}_applicantNumber`]: applicantNumber
        }
      })
    }
  }, [])

  // Validation des étapes
  const validateStep = useCallback((step) => {
    try {
      if (step === 1) {
        candidateStep1Schema.parse({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          birth_date: formData.birth_date,
          current_address: formData.current_address
        })
      } else if (step === 2) {
        candidateStep2Schema.parse({
          professional_status: formData.professional_status,
          employer_name: formData.employer_name,
          job_title: formData.job_title,
          contract_type: formData.contract_type,
          employment_start_date: formData.employment_start_date
        })
      } else if (step === 3) {
        candidateStep3Schema.parse({
          monthly_income: formData.monthly_income,
          other_income: formData.other_income
        })
      } else if (step === 4) {
        candidateStep4Schema.parse({
          has_guarantor: formData.has_guarantor,
          guarantor_first_name: formData.guarantor_first_name,
          guarantor_last_name: formData.guarantor_last_name,
          guarantor_relationship: formData.guarantor_relationship,
          guarantor_email: formData.guarantor_email,
          guarantor_phone: formData.guarantor_phone,
          guarantor_monthly_income: formData.guarantor_monthly_income
        })
      } else if (step === 5) {
        if (!documents.id_card) throw new Error('La pièce d\'identité du candidat 1 est obligatoire')
        if (!documents.proof_income) throw new Error('Les justificatifs de revenus du candidat 1 sont obligatoires')

        if (formData.application_type === 'couple' || formData.application_type === 'colocation') {
          if (!documents.id_card_applicant2) throw new Error('La pièce d\'identité du candidat 2 est obligatoire')
          if (!documents.proof_income_applicant2) throw new Error('Les justificatifs de revenus du candidat 2 sont obligatoires')
        }

        if (formData.application_type === 'colocation' && formData.nb_applicants >= 3) {
          if (!documents.id_card_applicant3) throw new Error('La pièce d\'identité du candidat 3 est obligatoire')
          if (!documents.proof_income_applicant3) throw new Error('Les justificatifs de revenus du candidat 3 sont obligatoires')
        }

        if (formData.application_type === 'colocation' && formData.nb_applicants >= 4) {
          if (!documents.id_card_applicant4) throw new Error('La pièce d\'identité du candidat 4 est obligatoire')
          if (!documents.proof_income_applicant4) throw new Error('Les justificatifs de revenus du candidat 4 sont obligatoires')
        }
      }

      setErrors({})
      return true
    } catch (err) {
      const zodErrors = err.issues || err.errors || (Array.isArray(err) ? err : null)

      if (zodErrors && Array.isArray(zodErrors)) {
        const fieldErrors = {}
        zodErrors.forEach((error) => {
          const fieldName = error.path[0]
          fieldErrors[fieldName] = error.message
        })
        setErrors(fieldErrors)
        setError(null)
      } else {
        setError(formatError(err))
        setErrors({})
      }
      return false
    }
  }, [formData, documents])

  // Navigation
  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setErrors({})
      setError(null)
      setCurrentStep((prev) => prev + 1)
      window.scrollTo(0, 0)
    }
  }, [currentStep, validateStep])

  const handlePrevious = useCallback(() => {
    setCurrentStep((prev) => prev - 1)
    window.scrollTo(0, 0)
  }, [])

  // Soumission
  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)

    try {
      const candidateData = { ...formData, lot_id: lot.id }
      const { data: candidate, error: createError } = await createCandidate(candidateData)
      if (createError) throw createError

      // Upload des documents
      const uploadPromises = []
      Object.entries(documents).forEach(([key, value]) => {
        if (key.endsWith('_applicantNumber')) return

        const files = Array.isArray(value) ? value : (value ? [value] : [])
        files.forEach(file => {
          if (file instanceof File) {
            let docType = key
            let applicantNumber = 1

            if (key.includes('_applicant')) {
              const match = key.match(/(.+)_applicant(\d+)/)
              if (match) {
                docType = match[1]
                applicantNumber = parseInt(match[2])
              }
            }
            uploadPromises.push(uploadDocument(candidate.id, file, docType, applicantNumber))
          }
        })
      })

      const uploadResults = await Promise.all(uploadPromises)
      const uploadErrors = uploadResults.filter(result => result.error)
      if (uploadErrors.length > 0) {
        throw new Error(`${uploadErrors.length} document(s) n'ont pas pu être uploadés`)
      }

      setSuccessToken(candidate.access_token)
      setCurrentStep(7)
    } catch (err) {
      console.error('Error submitting application:', err)
      setError(formatError(err) || 'Erreur lors de la soumission de la candidature')
    } finally {
      setSubmitting(false)
    }
  }

  // États de chargement et d'erreur
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loading message="Chargement..." />
      </div>
    )
  }

  if (error && !lot) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <Alert variant="error" title="Erreur">
            {typeof error === 'string' ? error : formatError(error)}
          </Alert>
        </Card>
      </div>
    )
  }

  // Écran de succès
  if (currentStep === 7 && successToken) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full" padding>
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-emerald-500 dark:text-emerald-400 mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold text-[var(--text)] mb-4">
              Candidature envoyée avec succès !
            </h1>
            <p className="text-[var(--text-secondary)] mb-6">
              Votre candidature a bien été reçue. Le propriétaire va l'examiner et vous
              contactera prochainement.
            </p>
            <div className="bg-[var(--color-electric-blue)]/10 dark:bg-[var(--color-electric-blue)]/20 rounded-xl p-4 mb-6">
              <p className="text-sm text-[var(--text)] font-medium mb-2">
                Votre numéro de suivi :
              </p>
              <p className="text-lg font-mono font-bold text-[var(--color-electric-blue)]">{successToken}</p>
              <p className="text-xs text-[var(--text-muted)] mt-2">
                Conservez ce numéro pour suivre l'état de votre candidature
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => navigate(`/application-status?token=${successToken}`)}
            >
              Suivre ma candidature
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Formulaire principal
  return (
    <div className="min-h-screen bg-[var(--background)] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* En-tête avec infos du lot */}
        <Card className="mb-6" padding>
          <div className="flex items-start gap-4">
            <Building className="w-12 h-12 text-[var(--color-electric-blue)]" />
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold text-[var(--text)] mb-2">
                Candidature pour {lot.name}
              </h1>
              <div className="flex items-center gap-2 text-[var(--text-secondary)] mb-1">
                <Home className="w-4 h-4" />
                <span className="text-sm">
                  {lot.properties_new?.address}, {lot.properties_new?.postal_code}{' '}
                  {lot.properties_new?.city}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <Euro className="w-4 h-4" />
                <span className="text-sm">
                  Loyer : {formatCurrency(lot.rent_amount)}
                  {lot.charges_amount > 0 && ` + ${formatCurrency(lot.charges_amount)} de charges`}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Barre de progression (visible à partir de l'étape 1) */}
        {currentStep >= 1 && (
          <Card className="mb-6" padding>
            <FormProgress currentStep={currentStep} />
          </Card>
        )}

        {/* Alertes d'erreur */}
        {error && (
          <Alert variant="error" title="Erreur" className="mb-6">
            {typeof error === 'string' ? error : formatError(error)}
          </Alert>
        )}

        {Object.keys(errors).length > 0 && !error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-red-700 dark:text-red-400 font-medium">
                Veuillez corriger les erreurs ci-dessous avant de continuer.
              </p>
            </div>
          </div>
        )}

        {/* Formulaire */}
        <Card padding>
          {/* Étape 0 : Type de candidature */}
          {currentStep === 0 && (
            <ApplicationTypeStep
              formData={formData}
              setFormData={setFormData}
              onNext={() => setCurrentStep(1)}
            />
          )}

          {/* Étape 1 : Informations personnelles */}
          {currentStep === 1 && (
            <PersonalInfoStep
              formData={formData}
              errors={errors}
              onChange={handleChange}
            />
          )}

          {/* Étape 2 : Situation professionnelle */}
          {currentStep === 2 && (
            <ProfessionalStep
              formData={formData}
              errors={errors}
              onChange={handleChange}
            />
          )}

          {/* Étape 3 : Revenus */}
          {currentStep === 3 && (
            <IncomeStep
              formData={formData}
              errors={errors}
              onChange={handleChange}
            />
          )}

          {/* Étape 4 : Garant */}
          {currentStep === 4 && (
            <GuarantorStep
              formData={formData}
              errors={errors}
              onChange={handleChange}
            />
          )}

          {/* Étape 5 : Documents */}
          {currentStep === 5 && (
            <DocumentsStep
              formData={formData}
              documents={documents}
              onFileChange={handleFileChange}
            />
          )}

          {/* Étape 6 : Récapitulatif */}
          {currentStep === 6 && (
            <SummaryStep
              formData={formData}
              documents={documents}
            />
          )}

          {/* Navigation (sauf étape 0 qui a sa propre navigation) */}
          {currentStep > 0 && currentStep < 7 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-[var(--border)]">
              <Button variant="outline" onClick={handlePrevious} disabled={submitting}>
                Précédent
              </Button>

              {currentStep < 6 ? (
                <Button variant="primary" onClick={handleNext}>
                  Suivant
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loading variant="spinner" size="sm" />
                      <span className="ml-2">Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Envoyer ma candidature
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default PublicCandidateForm
