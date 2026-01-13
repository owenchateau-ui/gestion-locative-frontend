import { z } from 'zod'

/**
 * Schéma de validation pour les baux
 */
export const leaseSchema = z.object({
  lot_id: z.string()
    .uuid('Lot invalide')
    .min(1, 'Le lot est requis'),

  tenant_id: z.string()
    .uuid('Locataire invalide')
    .min(1, 'Le locataire est requis'),

  start_date: z.string()
    .min(1, 'La date de début est requise'),

  end_date: z.string()
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

  payment_day: z.number()
    .int()
    .min(1, 'Le jour de paiement doit être entre 1 et 31')
    .max(31, 'Le jour de paiement doit être entre 1 et 31')
    .optional()
    .default(1),

  status: z.enum(['active', 'terminated', 'pending'])
    .optional()
    .default('active'),

  indexation_enabled: z.boolean()
    .optional()
    .default(false),

  irl_reference_quarter: z.number()
    .int()
    .min(1)
    .max(4)
    .optional()
    .or(z.literal('')),

  irl_reference_year: z.number()
    .int()
    .min(2000)
    .max(new Date().getFullYear() + 1)
    .optional()
    .or(z.literal('')),

  last_indexation_date: z.string()
    .optional()
    .or(z.literal('')),

  notes: z.string()
    .optional()
    .or(z.literal(''))
}).refine(
  (data) => {
    if (data.end_date && data.start_date) {
      return new Date(data.end_date) > new Date(data.start_date)
    }
    return true
  },
  {
    message: 'La date de fin doit être postérieure à la date de début',
    path: ['end_date']
  }
)

export default leaseSchema
