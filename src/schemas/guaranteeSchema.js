import { z } from 'zod'

// Schéma pour un garant physique
export const physicalGuarantorSchema = z.object({
  guarantee_type: z.literal('physical_person'),
  guarantor_first_name: z.string().min(1, 'Le prénom est obligatoire'),
  guarantor_last_name: z.string().min(1, 'Le nom est obligatoire'),
  guarantor_email: z.string().email('Email invalide').optional().or(z.literal('')),
  guarantor_phone: z.string().min(10, 'Téléphone invalide').optional().or(z.literal('')),
  guarantor_relationship: z.string().min(1, 'Le lien est obligatoire'),
  guarantor_address: z.string().optional().or(z.literal('')),
  guarantor_monthly_income: z.preprocess(
    (val) => (val === '' || val === undefined || val === null) ? 0 : Number(val),
    z.number().min(0, 'Le montant doit être positif')
  ),
  guarantor_professional_status: z.string().optional().or(z.literal(''))
})

// Schéma pour Visale
export const visaleSchema = z.object({
  guarantee_type: z.literal('visale'),
  certificate_number: z.string().min(1, 'Le numéro de visa est obligatoire'),
  valid_from: z.string().optional().or(z.literal('')),
  valid_until: z.string().optional().or(z.literal(''))
})

// Schéma pour organisme (Garantme, Cautioneo, etc.)
export const organismSchema = z.object({
  guarantee_type: z.enum(['garantme', 'cautioneo', 'smartgarant', 'unkle', 'other']),
  organism_name: z.string().optional().or(z.literal('')),
  certificate_number: z.string().optional().or(z.literal('')),
  certificate_url: z.string().url('URL invalide').optional().or(z.literal('')),
  coverage_amount: z.preprocess(
    (val) => (val === '' || val === undefined || val === null) ? null : Number(val),
    z.number().min(0).nullable().optional()
  ),
  annual_cost: z.preprocess(
    (val) => (val === '' || val === undefined || val === null) ? null : Number(val),
    z.number().min(0).nullable().optional()
  )
})

// Schéma pour GLI
export const gliSchema = z.object({
  guarantee_type: z.literal('gli'),
  notes: z.string().optional().or(z.literal(''))
})

// Schéma pour caution bancaire
export const bankGuaranteeSchema = z.object({
  guarantee_type: z.literal('bank_guarantee'),
  coverage_amount: z.preprocess(
    (val) => (val === '' || val === undefined || val === null) ? 0 : Number(val),
    z.number().min(1, 'Le montant est obligatoire')
  ),
  organism_name: z.string().min(1, 'Le nom de la banque est obligatoire'),
  notes: z.string().optional().or(z.literal(''))
})

// Schéma générique qui accepte tous les types
export const guaranteeSchema = z.discriminatedUnion('guarantee_type', [
  physicalGuarantorSchema,
  visaleSchema,
  organismSchema.extend({ guarantee_type: z.literal('garantme') }),
  organismSchema.extend({ guarantee_type: z.literal('cautioneo') }),
  organismSchema.extend({ guarantee_type: z.literal('smartgarant') }),
  organismSchema.extend({ guarantee_type: z.literal('unkle') }),
  organismSchema.extend({ guarantee_type: z.literal('other') }),
  gliSchema,
  bankGuaranteeSchema
])

// Schéma simplifié pour le formulaire (sans discriminatedUnion)
export const simpleGuaranteeSchema = z.object({
  guarantee_type: z.string().min(1, 'Le type de garantie est obligatoire'),

  // Garant physique
  guarantor_first_name: z.string().optional().or(z.literal('')),
  guarantor_last_name: z.string().optional().or(z.literal('')),
  guarantor_email: z.string().optional().or(z.literal('')),
  guarantor_phone: z.string().optional().or(z.literal('')),
  guarantor_relationship: z.string().optional().or(z.literal('')),
  guarantor_address: z.string().optional().or(z.literal('')),
  guarantor_monthly_income: z.preprocess(
    (val) => (val === '' || val === undefined || val === null) ? null : Number(val),
    z.number().min(0).nullable().optional()
  ),
  guarantor_professional_status: z.string().optional().or(z.literal('')),

  // Organisme
  organism_name: z.string().optional().or(z.literal('')),
  certificate_number: z.string().optional().or(z.literal('')),
  certificate_url: z.string().optional().or(z.literal('')),
  coverage_amount: z.preprocess(
    (val) => (val === '' || val === undefined || val === null) ? null : Number(val),
    z.number().min(0).nullable().optional()
  ),
  coverage_duration_months: z.preprocess(
    (val) => (val === '' || val === undefined || val === null) ? null : Number(val),
    z.number().min(0).nullable().optional()
  ),
  annual_cost: z.preprocess(
    (val) => (val === '' || val === undefined || val === null) ? null : Number(val),
    z.number().min(0).nullable().optional()
  ),

  // Validité
  valid_from: z.string().optional().or(z.literal('')),
  valid_until: z.string().optional().or(z.literal('')),

  // Notes
  notes: z.string().optional().or(z.literal(''))
}).superRefine((data, ctx) => {
  // Validation conditionnelle selon le type
  if (data.guarantee_type === 'physical_person') {
    if (!data.guarantor_first_name || data.guarantor_first_name.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Le prénom du garant est obligatoire',
        path: ['guarantor_first_name']
      })
    }
    if (!data.guarantor_last_name || data.guarantor_last_name.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Le nom du garant est obligatoire',
        path: ['guarantor_last_name']
      })
    }
    if (!data.guarantor_relationship || data.guarantor_relationship.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Le lien avec le garant est obligatoire',
        path: ['guarantor_relationship']
      })
    }
  }

  if (data.guarantee_type === 'visale') {
    if (!data.certificate_number || data.certificate_number.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Le numéro de visa Visale est obligatoire',
        path: ['certificate_number']
      })
    }
  }

  if (data.guarantee_type === 'bank_guarantee') {
    if (!data.coverage_amount || data.coverage_amount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Le montant de la caution est obligatoire',
        path: ['coverage_amount']
      })
    }
    if (!data.organism_name || data.organism_name.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Le nom de la banque est obligatoire',
        path: ['organism_name']
      })
    }
  }
})

export default {
  physicalGuarantorSchema,
  visaleSchema,
  organismSchema,
  gliSchema,
  bankGuaranteeSchema,
  guaranteeSchema,
  simpleGuaranteeSchema
}
