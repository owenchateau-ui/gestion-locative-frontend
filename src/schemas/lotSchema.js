import { z } from 'zod'

/**
 * Schéma de validation pour les lots
 */
export const lotSchema = z.object({
  property_id: z.string()
    .uuid('Propriété invalide')
    .min(1, 'La propriété est requise'),

  name: z.string()
    .min(1, 'Le nom est requis')
    .max(255, 'Le nom ne peut pas dépasser 255 caractères'),

  reference: z.string()
    .max(50)
    .optional()
    .or(z.literal('')),

  lot_type: z.enum([
    'apartment',
    'studio',
    'house',
    'commercial',
    'office',
    'parking',
    'cellar',
    'storage',
    'land',
    'other'
  ], {
    errorMap: () => ({ message: 'Type de lot invalide' })
  }),

  status: z.enum([
    'vacant',
    'occupied',
    'unavailable',
    'for_sale'
  ], {
    errorMap: () => ({ message: 'Statut invalide' })
  }).optional().default('vacant'),

  floor: z.number()
    .int()
    .optional()
    .or(z.literal('')),

  door_number: z.string()
    .max(20)
    .optional()
    .or(z.literal('')),

  surface_area: z.number()
    .min(0, 'La surface ne peut pas être négative')
    .optional()
    .or(z.literal('')),

  nb_rooms: z.number()
    .int()
    .min(0)
    .optional()
    .or(z.literal('')),

  nb_bedrooms: z.number()
    .int()
    .min(0)
    .optional()
    .or(z.literal('')),

  nb_bathrooms: z.number()
    .int()
    .min(0)
    .optional()
    .or(z.literal('')),

  rent_amount: z.number()
    .min(0, 'Le loyer ne peut pas être négatif')
    .refine(val => val > 0, 'Le loyer doit être supérieur à 0'),

  charges_amount: z.number()
    .min(0)
    .optional()
    .default(0),

  deposit_amount: z.number()
    .min(0)
    .optional()
    .or(z.literal('')),

  furnished: z.boolean()
    .optional()
    .default(false),

  has_parking: z.boolean()
    .optional()
    .default(false),

  has_cellar: z.boolean()
    .optional()
    .default(false),

  has_balcony: z.boolean()
    .optional()
    .default(false),

  has_terrace: z.boolean()
    .optional()
    .default(false),

  has_garden: z.boolean()
    .optional()
    .default(false),

  has_elevator: z.boolean()
    .optional()
    .default(false),

  heating_type: z.string()
    .max(100)
    .optional()
    .or(z.literal('')),

  dpe_rating: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G', ''])
    .optional()
    .or(z.literal('')),

  dpe_value: z.number()
    .int()
    .min(0)
    .optional()
    .or(z.literal('')),

  dpe_date: z.string()
    .optional()
    .or(z.literal('')),

  ges_rating: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G', ''])
    .optional()
    .or(z.literal('')),

  ges_value: z.number()
    .int()
    .min(0)
    .optional()
    .or(z.literal('')),

  coproperty_lot_number: z.string()
    .max(50)
    .optional()
    .or(z.literal('')),

  coproperty_tantieme: z.number()
    .int()
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

export default lotSchema
