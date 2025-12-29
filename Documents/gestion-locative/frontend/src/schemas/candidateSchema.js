import { z } from 'zod'

/**
 * Schéma de validation pour le formulaire de candidature
 */
export const candidateSchema = z.object({
  // Informations personnelles
  first_name: z
    .string()
    .min(1, 'Le prénom est requis')
    .max(100, 'Le prénom ne peut pas dépasser 100 caractères'),

  last_name: z
    .string()
    .min(1, 'Le nom est requis')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),

  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide')
    .max(255, 'L\'email ne peut pas dépasser 255 caractères')
    .transform(val => val.toLowerCase()),

  phone: z
    .string()
    .min(1, 'Le téléphone est requis')
    .regex(
      /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
      'Format de téléphone invalide (ex: 06 12 34 56 78)'
    ),

  birth_date: z
    .string()
    .min(1, 'La date de naissance est requise')
    .refine((date) => {
      const birthDate = new Date(date)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      return age >= 18 && age <= 100
    }, 'Vous devez avoir au moins 18 ans'),

  current_address: z
    .string()
    .min(1, 'L\'adresse actuelle est requise')
    .max(500, 'L\'adresse ne peut pas dépasser 500 caractères'),

  // Situation professionnelle
  employment_status: z
    .enum(
      ['cdi', 'cdd', 'interim', 'freelance', 'student', 'retired', 'unemployed', 'other'],
      { errorMap: () => ({ message: 'Le statut professionnel est requis' }) }
    ),

  employer_name: z
    .string()
    .max(255, 'Le nom de l\'employeur ne peut pas dépasser 255 caractères')
    .optional()
    .or(z.literal('')),

  job_title: z
    .string()
    .max(255, 'Le poste ne peut pas dépasser 255 caractères')
    .optional()
    .or(z.literal('')),

  contract_type: z
    .string()
    .max(100, 'Le type de contrat ne peut pas dépasser 100 caractères')
    .optional()
    .or(z.literal('')),

  employment_start_date: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((date) => {
      if (!date) return true
      const startDate = new Date(date)
      const today = new Date()
      return startDate <= today
    }, 'La date de début ne peut pas être dans le futur'),

  // Revenus
  monthly_income: z
    .number({ invalid_type_error: 'Le revenu mensuel doit être un nombre' })
    .min(0, 'Le revenu mensuel ne peut pas être négatif')
    .max(1000000, 'Le revenu mensuel semble invalide'),

  other_income: z
    .number({ invalid_type_error: 'Les autres revenus doivent être un nombre' })
    .min(0, 'Les autres revenus ne peuvent pas être négatifs')
    .max(1000000, 'Les autres revenus semblent invalides')
    .optional()
    .default(0),

  // Garant (optionnel)
  has_guarantor: z.boolean().default(false),

  guarantor_first_name: z
    .string()
    .max(100, 'Le prénom du garant ne peut pas dépasser 100 caractères')
    .optional()
    .or(z.literal('')),

  guarantor_last_name: z
    .string()
    .max(100, 'Le nom du garant ne peut pas dépasser 100 caractères')
    .optional()
    .or(z.literal('')),

  guarantor_relationship: z
    .string()
    .max(100, 'Le lien avec le garant ne peut pas dépasser 100 caractères')
    .optional()
    .or(z.literal('')),

  guarantor_email: z
    .string()
    .email('Format d\'email invalide')
    .max(255, 'L\'email du garant ne peut pas dépasser 255 caractères')
    .optional()
    .or(z.literal(''))
    .transform(val => val ? val.toLowerCase() : val),

  guarantor_phone: z
    .string()
    .regex(
      /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
      'Format de téléphone invalide (ex: 06 12 34 56 78)'
    )
    .optional()
    .or(z.literal('')),

  guarantor_monthly_income: z
    .number({ invalid_type_error: 'Le revenu du garant doit être un nombre' })
    .min(0, 'Le revenu du garant ne peut pas être négatif')
    .max(1000000, 'Le revenu du garant semble invalide')
    .optional()
    .default(0),

  // Lot ID
  lot_id: z
    .string()
    .uuid('ID de lot invalide')
    .min(1, 'Le lot est requis')
}).refine((data) => {
  // Si le candidat a un garant, vérifier que les champs du garant sont remplis
  if (data.has_guarantor) {
    return (
      data.guarantor_first_name &&
      data.guarantor_last_name &&
      data.guarantor_email &&
      data.guarantor_phone &&
      data.guarantor_monthly_income > 0
    )
  }
  return true
}, {
  message: 'Les informations du garant sont incomplètes',
  path: ['has_guarantor']
})

/**
 * Schéma pour l'étape 1 : Informations personnelles
 */
export const candidateStep1Schema = candidateSchema.pick({
  first_name: true,
  last_name: true,
  email: true,
  phone: true,
  birth_date: true,
  current_address: true
})

/**
 * Schéma pour l'étape 2 : Situation professionnelle
 */
export const candidateStep2Schema = candidateSchema.pick({
  employment_status: true,
  employer_name: true,
  job_title: true,
  contract_type: true,
  employment_start_date: true
})

/**
 * Schéma pour l'étape 3 : Revenus
 */
export const candidateStep3Schema = candidateSchema.pick({
  monthly_income: true,
  other_income: true
})

/**
 * Schéma pour l'étape 4 : Garant
 */
export const candidateStep4Schema = candidateSchema.pick({
  has_guarantor: true,
  guarantor_first_name: true,
  guarantor_last_name: true,
  guarantor_relationship: true,
  guarantor_email: true,
  guarantor_phone: true,
  guarantor_monthly_income: true
})

/**
 * Schéma de validation pour les documents
 */
export const documentSchema = z.object({
  document_type: z.enum([
    'identity',
    'payslip_1',
    'payslip_2',
    'payslip_3',
    'tax_notice',
    'proof_of_address',
    'employment_contract',
    'guarantor_identity',
    'guarantor_payslip',
    'guarantor_tax_notice',
    'other'
  ], { errorMap: () => ({ message: 'Type de document invalide' }) }),

  file: z
    .instanceof(File, { message: 'Un fichier est requis' })
    .refine((file) => file.size <= 10 * 1024 * 1024, 'Le fichier ne doit pas dépasser 10 Mo')
    .refine(
      (file) => ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(file.type),
      'Format de fichier invalide (PDF, JPEG ou PNG uniquement)'
    )
})

/**
 * Schéma pour la mise à jour du statut
 */
export const updateStatusSchema = z.object({
  status: z.enum(['pending', 'reviewing', 'accepted', 'rejected'], {
    errorMap: () => ({ message: 'Statut invalide' })
  }),

  rejection_reason: z
    .string()
    .max(1000, 'La raison du refus ne peut pas dépasser 1000 caractères')
    .optional()
    .or(z.literal(''))
}).refine((data) => {
  // Si le statut est "rejected", la raison est requise
  if (data.status === 'rejected') {
    return data.rejection_reason && data.rejection_reason.length > 0
  }
  return true
}, {
  message: 'La raison du refus est requise',
  path: ['rejection_reason']
})

export default {
  candidateSchema,
  candidateStep1Schema,
  candidateStep2Schema,
  candidateStep3Schema,
  candidateStep4Schema,
  documentSchema,
  updateStatusSchema
}
