import { z } from 'zod'

/**
 * Schéma de validation pour les locataires
 */
export const tenantSchema = z.object({
  entity_id: z.string()
    .uuid('Entité invalide')
    .min(1, 'L\'entité est requise'),

  first_name: z.string()
    .min(1, 'Le prénom est requis')
    .max(100, 'Le prénom ne peut pas dépasser 100 caractères'),

  last_name: z.string()
    .min(1, 'Le nom est requis')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),

  email: z.string()
    .email('Email invalide')
    .min(1, 'L\'email est requis'),

  phone: z.string()
    .regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, 'Numéro de téléphone invalide')
    .optional()
    .or(z.literal('')),

  birth_date: z.string()
    .optional()
    .or(z.literal('')),

  birth_place: z.string()
    .max(100)
    .optional()
    .or(z.literal('')),

  nationality: z.string()
    .max(100)
    .optional()
    .or(z.literal(''))
    .default('Française'),

  id_type: z.enum(['cni', 'passport', 'residence_permit', 'other', ''])
    .optional()
    .or(z.literal('')),

  id_number: z.string()
    .max(50)
    .optional()
    .or(z.literal('')),

  occupation: z.string()
    .max(100)
    .optional()
    .or(z.literal('')),

  employer: z.string()
    .max(255)
    .optional()
    .or(z.literal('')),

  monthly_income: z.number()
    .min(0)
    .optional()
    .or(z.literal('')),

  notes: z.string()
    .optional()
    .or(z.literal(''))
})

export default tenantSchema
