import { z } from 'zod'

/**
 * Schéma de validation pour le formulaire de candidature
 * VERSION 2 : Support couples et colocations
 */
export const candidateSchema = z.object({
  // TYPE DE CANDIDATURE (NOUVEAU)
  application_type: z
    .enum(['individual', 'couple', 'colocation'], {
      errorMap: () => ({ message: 'Type de candidature requis' })
    })
    .default('individual'),

  nb_applicants: z
    .number()
    .min(1, 'Au moins 1 candidat requis')
    .max(4, 'Maximum 4 candidats')
    .default(1),

  // ========================================
  // CANDIDAT 1 (Principal)
  // ========================================

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
    .min(10, 'Le téléphone doit contenir au moins 10 caractères')
    .max(20, 'Le téléphone ne peut pas dépasser 20 caractères'),

  birth_date: z
    .string()
    .min(1, 'La date de naissance est requise')
    .refine((date) => {
      const birthDate = new Date(date)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      return age >= 18 && age <= 100
    }, 'Vous devez avoir au moins 18 ans'),

  birth_place: z
    .string()
    .max(255, 'Le lieu de naissance ne peut pas dépasser 255 caractères')
    .optional()
    .or(z.literal('')),

  nationality: z
    .string()
    .max(100, 'La nationalité ne peut pas dépasser 100 caractères')
    .optional()
    .or(z.literal('')),

  // Situation professionnelle
  professional_status: z
    .string()
    .min(1, 'Le statut professionnel est requis')
    .max(100),

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

  other_income: z.preprocess(
    (val) => (val === '' || val === undefined || val === null) ? 0 : Number(val),
    z.number().min(0, 'Le montant doit être positif')
  ).optional(),

  // ========================================
  // CANDIDAT 2 (Pour couple ou colocation)
  // ========================================

  applicant2_first_name: z
    .string()
    .max(100, 'Le prénom ne peut pas dépasser 100 caractères')
    .optional()
    .or(z.literal('')),

  applicant2_last_name: z
    .string()
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .optional()
    .or(z.literal('')),

  applicant2_email: z
    .string()
    .email('Format d\'email invalide')
    .max(255)
    .optional()
    .or(z.literal(''))
    .transform(val => val ? val.toLowerCase() : val),

  applicant2_phone: z
    .string()
    .max(20)
    .optional()
    .or(z.literal('')),

  applicant2_birth_date: z
    .string()
    .optional()
    .or(z.literal('')),

  applicant2_birth_place: z
    .string()
    .max(255)
    .optional()
    .or(z.literal('')),

  applicant2_nationality: z
    .string()
    .max(100)
    .optional()
    .or(z.literal('')),

  applicant2_professional_status: z
    .string()
    .max(100)
    .optional()
    .or(z.literal('')),

  applicant2_employer_name: z
    .string()
    .max(255)
    .optional()
    .or(z.literal('')),

  applicant2_job_title: z
    .string()
    .max(255)
    .optional()
    .or(z.literal('')),

  applicant2_contract_type: z
    .string()
    .max(100)
    .optional()
    .or(z.literal('')),

  applicant2_employment_start_date: z
    .string()
    .optional()
    .or(z.literal('')),

  applicant2_monthly_income: z.preprocess(
    (val) => (val === '' || val === undefined || val === null) ? 0 : Number(val),
    z.number().min(0, 'Le montant doit être positif')
  ).optional(),

  applicant2_other_income: z.preprocess(
    (val) => (val === '' || val === undefined || val === null) ? 0 : Number(val),
    z.number().min(0, 'Le montant doit être positif')
  ).optional(),

  // ========================================
  // CANDIDAT 3 (Pour colocation 3+)
  // ========================================

  applicant3_first_name: z
    .string()
    .max(100)
    .optional()
    .or(z.literal('')),

  applicant3_last_name: z
    .string()
    .max(100)
    .optional()
    .or(z.literal('')),

  applicant3_email: z
    .string()
    .email('Format d\'email invalide')
    .max(255)
    .optional()
    .or(z.literal(''))
    .transform(val => val ? val.toLowerCase() : val),

  applicant3_phone: z
    .string()
    .max(20)
    .optional()
    .or(z.literal('')),

  applicant3_monthly_income: z.preprocess(
    (val) => (val === '' || val === undefined || val === null) ? 0 : Number(val),
    z.number().min(0, 'Le montant doit être positif')
  ).optional(),

  // ========================================
  // CANDIDAT 4 (Pour colocation 4)
  // ========================================

  applicant4_first_name: z
    .string()
    .max(100)
    .optional()
    .or(z.literal('')),

  applicant4_last_name: z
    .string()
    .max(100)
    .optional()
    .or(z.literal('')),

  applicant4_email: z
    .string()
    .email('Format d\'email invalide')
    .max(255)
    .optional()
    .or(z.literal(''))
    .transform(val => val ? val.toLowerCase() : val),

  applicant4_phone: z
    .string()
    .max(20)
    .optional()
    .or(z.literal('')),

  applicant4_monthly_income: z.preprocess(
    (val) => (val === '' || val === undefined || val === null) ? 0 : Number(val),
    z.number().min(0, 'Le montant doit être positif')
  ).optional(),

  // ========================================
  // GARANT 1
  // ========================================

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
    .min(10, 'Le téléphone du garant doit contenir au moins 10 caractères')
    .max(20, 'Le téléphone du garant ne peut pas dépasser 20 caractères')
    .optional()
    .or(z.literal('')),

  guarantor_professional_status: z
    .string()
    .max(100)
    .optional()
    .or(z.literal('')),

  guarantor_monthly_income: z.preprocess(
    (val) => (val === '' || val === undefined || val === null) ? 0 : Number(val),
    z.number().min(0, 'Le montant doit être positif')
  ).optional(),

  // ========================================
  // GARANT 2 (optionnel pour colocation)
  // ========================================

  has_guarantor2: z.boolean().default(false),

  guarantor2_first_name: z
    .string()
    .max(100)
    .optional()
    .or(z.literal('')),

  guarantor2_last_name: z
    .string()
    .max(100)
    .optional()
    .or(z.literal('')),

  guarantor2_relationship: z
    .string()
    .max(100)
    .optional()
    .or(z.literal('')),

  guarantor2_email: z
    .string()
    .email('Format d\'email invalide')
    .max(255)
    .optional()
    .or(z.literal(''))
    .transform(val => val ? val.toLowerCase() : val),

  guarantor2_phone: z
    .string()
    .max(20)
    .optional()
    .or(z.literal('')),

  guarantor2_monthly_income: z.preprocess(
    (val) => (val === '' || val === undefined || val === null) ? 0 : Number(val),
    z.number().min(0, 'Le montant doit être positif')
  ).optional(),

  // Lot ID
  lot_id: z
    .string()
    .uuid('ID de lot invalide')
    .min(1, 'Le lot est requis')

}).superRefine((data, ctx) => {
  // VALIDATION CANDIDAT 2 (si couple ou colocation)
  if ((data.application_type === 'couple' || data.application_type === 'colocation') && data.nb_applicants >= 2) {
    if (!data.applicant2_first_name || data.applicant2_first_name.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le prénom du candidat 2 est obligatoire",
        path: ["applicant2_first_name"]
      })
    }
    if (!data.applicant2_last_name || data.applicant2_last_name.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le nom du candidat 2 est obligatoire",
        path: ["applicant2_last_name"]
      })
    }
    if (!data.applicant2_email || data.applicant2_email.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "L'email du candidat 2 est obligatoire",
        path: ["applicant2_email"]
      })
    }
    if (!data.applicant2_monthly_income || data.applicant2_monthly_income <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Les revenus du candidat 2 sont obligatoires",
        path: ["applicant2_monthly_income"]
      })
    }
  }

  // VALIDATION CANDIDAT 3 (si colocation 3+)
  if (data.application_type === 'colocation' && data.nb_applicants >= 3) {
    if (!data.applicant3_first_name || data.applicant3_first_name.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le prénom du candidat 3 est obligatoire",
        path: ["applicant3_first_name"]
      })
    }
    if (!data.applicant3_last_name || data.applicant3_last_name.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le nom du candidat 3 est obligatoire",
        path: ["applicant3_last_name"]
      })
    }
    if (!data.applicant3_monthly_income || data.applicant3_monthly_income <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Les revenus du candidat 3 sont obligatoires",
        path: ["applicant3_monthly_income"]
      })
    }
  }

  // VALIDATION CANDIDAT 4 (si colocation 4)
  if (data.application_type === 'colocation' && data.nb_applicants === 4) {
    if (!data.applicant4_first_name || data.applicant4_first_name.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le prénom du candidat 4 est obligatoire",
        path: ["applicant4_first_name"]
      })
    }
    if (!data.applicant4_last_name || data.applicant4_last_name.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le nom du candidat 4 est obligatoire",
        path: ["applicant4_last_name"]
      })
    }
    if (!data.applicant4_monthly_income || data.applicant4_monthly_income <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Les revenus du candidat 4 sont obligatoires",
        path: ["applicant4_monthly_income"]
      })
    }
  }

  // VALIDATION GARANT 1
  if (data.has_guarantor) {
    if (!data.guarantor_first_name || data.guarantor_first_name.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le prénom du garant est obligatoire",
        path: ["guarantor_first_name"]
      })
    }
    if (!data.guarantor_last_name || data.guarantor_last_name.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le nom du garant est obligatoire",
        path: ["guarantor_last_name"]
      })
    }
    if (!data.guarantor_monthly_income || data.guarantor_monthly_income <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Les revenus du garant sont obligatoires",
        path: ["guarantor_monthly_income"]
      })
    }
  }

  // VALIDATION GARANT 2
  if (data.has_guarantor2) {
    if (!data.guarantor2_first_name || data.guarantor2_first_name.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le prénom du garant 2 est obligatoire",
        path: ["guarantor2_first_name"]
      })
    }
    if (!data.guarantor2_last_name || data.guarantor2_last_name.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le nom du garant 2 est obligatoire",
        path: ["guarantor2_last_name"]
      })
    }
    if (!data.guarantor2_monthly_income || data.guarantor2_monthly_income <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Les revenus du garant 2 sont obligatoires",
        path: ["guarantor2_monthly_income"]
      })
    }
  }
})

/**
 * Schéma de validation pour les documents
 */
export const documentSchema = z.object({
  document_type: z.enum([
    'id_card',
    'proof_income',
    'tax_notice',
    'employment_contract',
    'rib',
    'guarantor_id',
    'guarantor_income',
    'guarantor_tax',
    'guarantor2_id',
    'guarantor2_income',
    'guarantor2_tax',
    'other'
  ], { errorMap: () => ({ message: 'Type de document invalide' }) }),

  applicant_number: z
    .number()
    .min(1)
    .max(4)
    .default(1),

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
  status: z.enum(['submitted', 'under_review', 'accepted', 'rejected', 'withdrawn'], {
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

/**
 * Schémas par étape pour le formulaire public
 */

// Étape 1 : Informations personnelles
export const candidateStep1Schema = candidateSchema.pick({
  application_type: true,
  nb_applicants: true,
  first_name: true,
  last_name: true,
  email: true,
  phone: true,
  birth_date: true,
  birth_place: true,
  nationality: true,
  applicant2_first_name: true,
  applicant2_last_name: true,
  applicant2_email: true,
  applicant2_phone: true,
  applicant2_birth_date: true,
  applicant2_birth_place: true,
  applicant2_nationality: true,
  applicant3_first_name: true,
  applicant3_last_name: true,
  applicant3_email: true,
  applicant3_phone: true,
  applicant4_first_name: true,
  applicant4_last_name: true,
  applicant4_email: true,
  applicant4_phone: true
})

// Étape 2 : Situation professionnelle
export const candidateStep2Schema = candidateSchema.pick({
  professional_status: true,
  employer_name: true,
  job_title: true,
  contract_type: true,
  employment_start_date: true,
  applicant2_professional_status: true,
  applicant2_employer_name: true,
  applicant2_job_title: true,
  applicant2_contract_type: true,
  applicant2_employment_start_date: true
})

// Étape 3 : Revenus
export const candidateStep3Schema = candidateSchema.pick({
  monthly_income: true,
  other_income: true,
  applicant2_monthly_income: true,
  applicant2_other_income: true,
  applicant3_monthly_income: true,
  applicant4_monthly_income: true
})

// Étape 4 : Garant
export const candidateStep4Schema = candidateSchema.pick({
  has_guarantor: true,
  guarantor_first_name: true,
  guarantor_last_name: true,
  guarantor_email: true,
  guarantor_phone: true,
  guarantor_relationship: true,
  guarantor_professional_status: true,
  guarantor_monthly_income: true,
  has_guarantor2: true,
  guarantor2_first_name: true,
  guarantor2_last_name: true,
  guarantor2_email: true,
  guarantor2_phone: true,
  guarantor2_relationship: true,
  guarantor2_monthly_income: true
})

export default {
  candidateSchema,
  documentSchema,
  updateStatusSchema,
  candidateStep1Schema,
  candidateStep2Schema,
  candidateStep3Schema,
  candidateStep4Schema
}
