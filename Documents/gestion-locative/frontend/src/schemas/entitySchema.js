import { z } from 'zod'

/**
 * Schéma de validation pour les entités juridiques
 */
export const entitySchema = z.object({
  name: z.string()
    .min(1, 'Le nom est requis')
    .max(255, 'Le nom ne peut pas dépasser 255 caractères'),

  entity_type: z.enum([
    'individual',
    'sci',
    'sarl',
    'sas',
    'sasu',
    'eurl',
    'lmnp',
    'lmp',
    'other'
  ], {
    errorMap: () => ({ message: 'Type d\'entité invalide' })
  }),

  siren: z.string()
    .regex(/^\d{9}$/, 'Le SIREN doit contenir 9 chiffres')
    .optional()
    .or(z.literal('')),

  siret: z.string()
    .regex(/^\d{14}$/, 'Le SIRET doit contenir 14 chiffres')
    .optional()
    .or(z.literal('')),

  vat_number: z.string()
    .max(20, 'Le numéro de TVA ne peut pas dépasser 20 caractères')
    .optional()
    .or(z.literal('')),

  rcs_city: z.string()
    .max(100)
    .optional()
    .or(z.literal('')),

  capital: z.number()
    .min(0, 'Le capital ne peut pas être négatif')
    .optional()
    .or(z.literal('')),

  address: z.string()
    .max(500)
    .optional()
    .or(z.literal('')),

  city: z.string()
    .max(100)
    .optional()
    .or(z.literal('')),

  postal_code: z.string()
    .regex(/^\d{5}$/, 'Le code postal doit contenir 5 chiffres')
    .optional()
    .or(z.literal('')),

  country: z.string()
    .max(100)
    .optional()
    .or(z.literal(''))
    .default('France'),

  email: z.string()
    .email('Email invalide')
    .optional()
    .or(z.literal('')),

  phone: z.string()
    .regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, 'Numéro de téléphone invalide')
    .optional()
    .or(z.literal('')),

  logo_url: z.string()
    .url('URL invalide')
    .optional()
    .or(z.literal('')),

  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur invalide (format: #RRGGBB)')
    .optional()
    .or(z.literal('')),

  vat_applicable: z.boolean()
    .optional()
    .default(false),

  default_entity: z.boolean()
    .optional()
    .default(false)
})

export default entitySchema
