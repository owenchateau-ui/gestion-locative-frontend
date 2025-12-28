import { z } from 'zod'

/**
 * Schéma de validation pour les paiements
 */
export const paymentSchema = z.object({
  lease_id: z.string()
    .uuid('Bail invalide')
    .min(1, 'Le bail est requis'),

  amount: z.number()
    .min(0, 'Le montant ne peut pas être négatif')
    .refine(val => val > 0, 'Le montant doit être supérieur à 0'),

  payment_date: z.string()
    .min(1, 'La date de paiement est requise'),

  period_start: z.string()
    .min(1, 'La date de début de période est requise'),

  period_end: z.string()
    .min(1, 'La date de fin de période est requise'),

  status: z.enum(['pending', 'paid', 'late', 'partial'])
    .optional()
    .default('pending'),

  payment_method: z.enum(['bank_transfer', 'check', 'cash', 'card', 'other', ''])
    .optional()
    .or(z.literal('')),

  receipt_sent: z.boolean()
    .optional()
    .default(false),

  notes: z.string()
    .optional()
    .or(z.literal(''))
}).refine(
  (data) => {
    if (data.period_end && data.period_start) {
      return new Date(data.period_end) >= new Date(data.period_start)
    }
    return true
  },
  {
    message: 'La date de fin doit être postérieure ou égale à la date de début',
    path: ['period_end']
  }
)

export default paymentSchema
