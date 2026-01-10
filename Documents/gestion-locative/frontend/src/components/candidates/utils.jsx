import { AlertCircle } from 'lucide-react'

/**
 * Formate les erreurs provenant de diverses sources (Zod, API, etc.)
 * @param {*} err - L'erreur à formater
 * @returns {string} Message d'erreur formaté
 */
export const formatError = (err) => {
  if (!err) return 'Une erreur est survenue'
  if (typeof err === 'string') return err

  // Erreur Zod avec .issues
  if (err?.issues && Array.isArray(err.issues)) {
    const messages = err.issues.map(e => e.message).filter(Boolean)
    return messages.length > 0 ? messages.join(', ') : 'Erreur de validation'
  }

  // Tableau d'erreurs
  if (Array.isArray(err)) {
    const messages = err
      .map(e => (typeof e === 'string' ? e : e?.message))
      .filter(Boolean)
    return messages.length > 0 ? messages.join(', ') : 'Erreur de validation'
  }

  // Objet avec errors
  if (err?.errors && Array.isArray(err.errors)) {
    const messages = err.errors.map(e => e.message).filter(Boolean)
    return messages.length > 0 ? messages.join(', ') : 'Erreur de validation'
  }

  // Objet avec message
  if (err?.message) return err.message

  return 'Une erreur est survenue'
}

/**
 * Composant pour afficher un message d'erreur de champ
 */
export const ErrorMessage = ({ error }) => {
  if (!error) return null
  return (
    <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center gap-1">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{formatError(error)}</span>
    </p>
  )
}

/**
 * Configuration des étapes du formulaire
 */
export const STEPS = [
  { id: 1, title: 'Informations personnelles' },
  { id: 2, title: 'Situation professionnelle' },
  { id: 3, title: 'Revenus' },
  { id: 4, title: 'Garant' },
  { id: 5, title: 'Documents' },
  { id: 6, title: 'Récapitulatif' }
]

/**
 * État initial du formulaire
 */
export const INITIAL_FORM_DATA = {
  application_type: 'individual',
  nb_applicants: 1,

  // Candidat 1
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  birth_date: '',
  birth_place: '',
  nationality: '',
  current_address: '',
  professional_status: 'cdi',
  employer_name: '',
  job_title: '',
  contract_type: '',
  employment_start_date: '',
  monthly_income: '',
  other_income: '',

  // Candidat 2
  applicant2_first_name: '',
  applicant2_last_name: '',
  applicant2_email: '',
  applicant2_phone: '',
  applicant2_birth_date: '',
  applicant2_birth_place: '',
  applicant2_nationality: '',
  applicant2_professional_status: '',
  applicant2_employer_name: '',
  applicant2_job_title: '',
  applicant2_contract_type: '',
  applicant2_employment_start_date: '',
  applicant2_monthly_income: '',
  applicant2_other_income: '',

  // Candidat 3
  applicant3_first_name: '',
  applicant3_last_name: '',
  applicant3_email: '',
  applicant3_phone: '',
  applicant3_monthly_income: '',

  // Candidat 4
  applicant4_first_name: '',
  applicant4_last_name: '',
  applicant4_email: '',
  applicant4_phone: '',
  applicant4_monthly_income: '',

  // Garant 1
  has_guarantor: false,
  guarantor_first_name: '',
  guarantor_last_name: '',
  guarantor_relationship: '',
  guarantor_email: '',
  guarantor_phone: '',
  guarantor_professional_status: '',
  guarantor_monthly_income: '',

  // Garant 2
  has_guarantor2: false,
  guarantor2_first_name: '',
  guarantor2_last_name: '',
  guarantor2_relationship: '',
  guarantor2_email: '',
  guarantor2_phone: '',
  guarantor2_monthly_income: ''
}

/**
 * État initial des documents
 */
export const INITIAL_DOCUMENTS = {
  identity: null,
  payslip_1: null,
  payslip_2: null,
  payslip_3: null,
  tax_notice: null,
  proof_of_address: null
}

/**
 * Formateur de devise
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}
