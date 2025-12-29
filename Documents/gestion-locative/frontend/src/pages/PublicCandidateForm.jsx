import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Alert from '../components/ui/Alert'
import Loading from '../components/ui/Loading'
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
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  Euro,
  UserPlus,
  Upload,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Home,
  Building
} from 'lucide-react'

const STEPS = [
  { id: 1, title: 'Informations personnelles', icon: User },
  { id: 2, title: 'Situation professionnelle', icon: Briefcase },
  { id: 3, title: 'Revenus', icon: Euro },
  { id: 4, title: 'Garant', icon: UserPlus },
  { id: 5, title: 'Documents', icon: Upload },
  { id: 6, title: 'Récapitulatif', icon: CheckCircle }
]

function PublicCandidateForm() {
  const { token } = useParams()
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState(1)
  const [lot, setLot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [errors, setErrors] = useState({})
  const [successToken, setSuccessToken] = useState(null)

  // Formulaire
  const [formData, setFormData] = useState({
    // Étape 1
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    birth_date: '',
    current_address: '',
    // Étape 2
    employment_status: 'cdi',
    employer_name: '',
    job_title: '',
    contract_type: '',
    employment_start_date: '',
    // Étape 3
    monthly_income: 0,
    other_income: 0,
    // Étape 4
    has_guarantor: false,
    guarantor_first_name: '',
    guarantor_last_name: '',
    guarantor_relationship: '',
    guarantor_email: '',
    guarantor_phone: '',
    guarantor_monthly_income: 0
  })

  // Documents
  const [documents, setDocuments] = useState({
    identity: null,
    payslip_1: null,
    payslip_2: null,
    payslip_3: null,
    tax_notice: null,
    proof_of_address: null
  })

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
      setError(err.message || 'Lien invalide ou expiré')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
    }))
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleFileChange = (e, docType) => {
    const file = e.target.files[0]
    if (file) {
      setDocuments((prev) => ({ ...prev, [docType]: file }))
    }
  }

  const validateStep = (step) => {
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
          employment_status: formData.employment_status,
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
        // Vérifier les documents obligatoires
        if (!documents.identity) throw new Error('La pièce d\'identité est obligatoire')
        if (!documents.payslip_1) throw new Error('Au moins un bulletin de salaire est obligatoire')
      }

      setErrors({})
      return true
    } catch (err) {
      if (err.errors) {
        const fieldErrors = {}
        err.errors.forEach((error) => {
          fieldErrors[error.path[0]] = error.message
        })
        setErrors(fieldErrors)
      } else {
        setError(err.message)
      }
      return false
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1)
      window.scrollTo(0, 0)
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1)
    window.scrollTo(0, 0)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)

    try {
      // Créer la candidature
      const candidateData = {
        ...formData,
        lot_id: lot.id
      }

      const { data: candidate, error: createError } = await createCandidate(candidateData)
      if (createError) throw createError

      // Upload des documents
      const uploadPromises = []
      Object.entries(documents).forEach(([docType, file]) => {
        if (file) {
          uploadPromises.push(uploadDocument(candidate.id, file, docType))
        }
      })

      await Promise.all(uploadPromises)

      // Succès
      setSuccessToken(candidate.access_token)
      setCurrentStep(7) // Étape de succès
    } catch (err) {
      console.error('Error submitting application:', err)
      setError(err.message || 'Erreur lors de la soumission de la candidature')
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading message="Chargement..." />
      </div>
    )
  }

  if (error && !lot) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <Alert variant="error" title="Erreur">
            {error}
          </Alert>
        </Card>
      </div>
    )
  }

  // Étape de succès
  if (currentStep === 7 && successToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full" padding>
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Candidature envoyée avec succès !
            </h1>
            <p className="text-gray-600 mb-6">
              Votre candidature a bien été reçue. Le propriétaire va l'examiner et vous
              contactera prochainement.
            </p>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900 font-medium mb-2">
                Votre numéro de suivi :
              </p>
              <p className="text-lg font-mono font-bold text-blue-600">{successToken}</p>
              <p className="text-xs text-blue-700 mt-2">
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* En-tête avec infos du lot */}
        <Card className="mb-6" padding>
          <div className="flex items-start gap-4">
            <Building className="w-12 h-12 text-blue-500" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Candidature pour {lot.name}
              </h1>
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Home className="w-4 h-4" />
                <span className="text-sm">
                  {lot.properties_new?.address}, {lot.properties_new?.postal_code}{' '}
                  {lot.properties_new?.city}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Euro className="w-4 h-4" />
                <span className="text-sm">
                  Loyer : {formatCurrency(lot.rent_amount)}
                  {lot.charges_amount > 0 &&
                    ` + ${formatCurrency(lot.charges_amount)} de charges`}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Barre de progression */}
        <Card className="mb-6" padding>
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
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
                    <step.icon className="w-5 h-5" />
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
            ))}
          </div>
        </Card>

        {error && (
          <Alert variant="error" title="Erreur" className="mb-6">
            {error}
          </Alert>
        )}

        {/* Formulaire */}
        <Card padding>
          {/* Étape 1 : Informations personnelles */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Informations personnelles
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.first_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.last_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="06 12 34 56 78"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de naissance *
                </label>
                <input
                  type="date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.birth_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.birth_date && (
                  <p className="text-red-500 text-xs mt-1">{errors.birth_date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse actuelle *
                </label>
                <input
                  type="text"
                  name="current_address"
                  value={formData.current_address}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.current_address ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.current_address && (
                  <p className="text-red-500 text-xs mt-1">{errors.current_address}</p>
                )}
              </div>
            </div>
          )}

          {/* Étape 2 : Situation professionnelle */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Situation professionnelle
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut professionnel *
                </label>
                <select
                  name="employment_status"
                  value={formData.employment_status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cdi">CDI</option>
                  <option value="cdd">CDD</option>
                  <option value="interim">Intérim</option>
                  <option value="freelance">Indépendant</option>
                  <option value="student">Étudiant</option>
                  <option value="retired">Retraité</option>
                  <option value="unemployed">Sans emploi</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'employeur
                </label>
                <input
                  type="text"
                  name="employer_name"
                  value={formData.employer_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Poste</label>
                <input
                  type="text"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de contrat
                </label>
                <input
                  type="text"
                  name="contract_type"
                  value={formData.contract_type}
                  onChange={handleChange}
                  placeholder="Ex: Temps plein, Temps partiel..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début d'emploi
                </label>
                <input
                  type="date"
                  name="employment_start_date"
                  value={formData.employment_start_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Étape 3 : Revenus */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Revenus</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salaire mensuel net *
                </label>
                <input
                  type="number"
                  name="monthly_income"
                  value={formData.monthly_income}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.monthly_income ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.monthly_income && (
                  <p className="text-red-500 text-xs mt-1">{errors.monthly_income}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Autres revenus mensuels (optionnel)
                </label>
                <input
                  type="number"
                  name="other_income"
                  value={formData.other_income}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="Allocations, pensions, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-900 font-medium">Revenus totaux</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(formData.monthly_income + formData.other_income)}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Ratio avec le loyer :{' '}
                  {lot.rent_amount > 0
                    ? ((formData.monthly_income + formData.other_income) / lot.rent_amount).toFixed(
                        2
                      )
                    : 0}
                  x
                </p>
              </div>
            </div>
          )}

          {/* Étape 4 : Garant */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Garant (optionnel)</h2>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="has_guarantor"
                  checked={formData.has_guarantor}
                  onChange={handleChange}
                  id="has_guarantor"
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="has_guarantor" className="text-sm font-medium text-gray-700">
                  J'ai un garant
                </label>
              </div>

              {formData.has_guarantor && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom du garant *
                      </label>
                      <input
                        type="text"
                        name="guarantor_first_name"
                        value={formData.guarantor_first_name}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.guarantor_first_name ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.guarantor_first_name && (
                        <p className="text-red-500 text-xs mt-1">{errors.guarantor_first_name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom du garant *
                      </label>
                      <input
                        type="text"
                        name="guarantor_last_name"
                        value={formData.guarantor_last_name}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.guarantor_last_name ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.guarantor_last_name && (
                        <p className="text-red-500 text-xs mt-1">{errors.guarantor_last_name}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lien avec le garant
                    </label>
                    <input
                      type="text"
                      name="guarantor_relationship"
                      value={formData.guarantor_relationship}
                      onChange={handleChange}
                      placeholder="Ex: Parent, Ami, Employeur..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email du garant *
                    </label>
                    <input
                      type="email"
                      name="guarantor_email"
                      value={formData.guarantor_email}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.guarantor_email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.guarantor_email && (
                      <p className="text-red-500 text-xs mt-1">{errors.guarantor_email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone du garant *
                    </label>
                    <input
                      type="tel"
                      name="guarantor_phone"
                      value={formData.guarantor_phone}
                      onChange={handleChange}
                      placeholder="06 12 34 56 78"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.guarantor_phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.guarantor_phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.guarantor_phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Revenus mensuels du garant *
                    </label>
                    <input
                      type="number"
                      name="guarantor_monthly_income"
                      value={formData.guarantor_monthly_income}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.guarantor_monthly_income ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.guarantor_monthly_income && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.guarantor_monthly_income}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Étape 5 : Documents */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Documents</h2>

              <p className="text-sm text-gray-600">
                Veuillez télécharger les documents suivants (formats acceptés : PDF, JPEG, PNG
                - max 10 Mo par fichier)
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pièce d'identité * (recto-verso)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'identity')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {documents.identity && (
                    <p className="text-xs text-green-600 mt-1">✓ {documents.identity.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bulletin de salaire 1 * (le plus récent)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'payslip_1')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {documents.payslip_1 && (
                    <p className="text-xs text-green-600 mt-1">✓ {documents.payslip_1.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bulletin de salaire 2 (mois précédent)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'payslip_2')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {documents.payslip_2 && (
                    <p className="text-xs text-green-600 mt-1">✓ {documents.payslip_2.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bulletin de salaire 3 (mois précédent)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'payslip_3')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {documents.payslip_3 && (
                    <p className="text-xs text-green-600 mt-1">✓ {documents.payslip_3.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Avis d'imposition
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'tax_notice')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {documents.tax_notice && (
                    <p className="text-xs text-green-600 mt-1">✓ {documents.tax_notice.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Justificatif de domicile
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'proof_of_address')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {documents.proof_of_address && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ {documents.proof_of_address.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Étape 6 : Récapitulatif */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Récapitulatif</h2>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Informations personnelles</h3>
                  <p className="text-sm text-gray-600">
                    {formData.first_name} {formData.last_name}
                  </p>
                  <p className="text-sm text-gray-600">{formData.email}</p>
                  <p className="text-sm text-gray-600">{formData.phone}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Situation professionnelle</h3>
                  <p className="text-sm text-gray-600">{formData.employment_status}</p>
                  {formData.employer_name && (
                    <p className="text-sm text-gray-600">{formData.employer_name}</p>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Revenus</h3>
                  <p className="text-sm text-gray-600">
                    Revenus totaux : {formatCurrency(formData.monthly_income + formData.other_income)}
                  </p>
                </div>

                {formData.has_guarantor && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Garant</h3>
                    <p className="text-sm text-gray-600">
                      {formData.guarantor_first_name} {formData.guarantor_last_name}
                    </p>
                    <p className="text-sm text-gray-600">{formData.guarantor_email}</p>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Documents</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {Object.entries(documents).map(
                      ([key, file]) =>
                        file && (
                          <li key={key} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            {file.name}
                          </li>
                        )
                    )}
                  </ul>
                </div>
              </div>

              <Alert variant="info">
                En soumettant cette candidature, vous confirmez que toutes les informations
                fournies sont exactes et véridiques.
              </Alert>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {currentStep > 1 && currentStep < 7 && (
              <Button variant="outline" onClick={handlePrevious} disabled={submitting}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Précédent
              </Button>
            )}

            {currentStep < 6 && (
              <Button variant="primary" onClick={handleNext} className="ml-auto">
                Suivant
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}

            {currentStep === 6 && (
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={submitting}
                className="ml-auto"
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
        </Card>
      </div>
    </div>
  )
}

export default PublicCandidateForm
