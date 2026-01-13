import { z } from 'zod'

/**
 * Schéma de validation pour les propriétés
 */
export const propertySchema = z.object({
  entity_id: z.string()
    .uuid('Entité invalide')
    .min(1, 'L\'entité est requise'),

  name: z.string()
    .min(1, 'Le nom est requis')
    .max(255, 'Le nom ne peut pas dépasser 255 caractères'),

  category: z.enum([
    'building',
    'house',
    'apartment',
    'commercial',
    'office',
    'land',
    'parking',
    'other'
  ], {
    errorMap: () => ({ message: 'Catégorie invalide' })
  }),

  address: z.string()
    .min(1, 'L\'adresse est requise')
    .max(500, 'L\'adresse ne peut pas dépasser 500 caractères'),

  city: z.string()
    .min(1, 'La ville est requise')
    .max(100, 'La ville ne peut pas dépasser 100 caractères'),

  postal_code: z.string()
    .regex(/^\d{5}$/, 'Le code postal doit contenir 5 chiffres'),

  country: z.string()
    .max(100)
    .optional()
    .or(z.literal(''))
    .default('France'),

  construction_year: z.number()
    .int('L\'année doit être un nombre entier')
    .min(1800, 'Année invalide')
    .max(new Date().getFullYear(), 'L\'année ne peut pas être dans le futur')
    .optional()
    .or(z.literal('')),

  acquisition_date: z.string()
    .optional()
    .or(z.literal('')),

  acquisition_price: z.number()
    .min(0, 'Le prix ne peut pas être négatif')
    .optional()
    .or(z.literal('')),

  current_value: z.number()
    .min(0, 'La valeur ne peut pas être négative')
    .optional()
    .or(z.literal('')),

  is_coproperty: z.boolean()
    .optional()
    .default(false),

  coproperty_lots: z.number()
    .int()
    .min(1)
    .optional()
    .or(z.literal('')),

  syndic_name: z.string()
    .max(255)
    .optional()
    .or(z.literal('')),

  syndic_email: z.string()
    .email('Email invalide')
    .optional()
    .or(z.literal('')),

  syndic_phone: z.string()
    .regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, 'Numéro invalide')
    .optional()
    .or(z.literal('')),

  syndic_fees: z.number()
    .min(0)
    .optional()
    .or(z.literal('')),

  description: z.string()
    .optional()
    .or(z.literal('')),

  notes: z.string()
    .optional()
    .or(z.literal(''))
})

export default propertySchema
