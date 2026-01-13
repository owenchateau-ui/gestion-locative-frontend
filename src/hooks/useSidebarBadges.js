import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

/**
 * Hook pour récupérer les compteurs de badges de la sidebar
 *
 * Les badges affichent uniquement les éléments nécessitant une action :
 * - Lots vacants (à louer)
 * - Candidatures en attente de réponse
 * - Paiements en retard
 * - Baux expirant dans 30 jours
 * - Diagnostics expirant bientôt
 *
 * @param {string|null} entityId - ID de l'entité sélectionnée (null = toutes)
 * @returns {Object} badges - Compteurs pour chaque type d'action
 */
export function useSidebarBadges(entityId = null) {
  const { user } = useAuth()
  const [badges, setBadges] = useState({
    lotsVacants: 0,
    candidatesPending: 0,
    unpaidPayments: 0,
    leasesExpiring: 0,
    diagnosticsExpiring: 0,
  })
  const [loading, setLoading] = useState(true)

  const fetchBadges = useCallback(async () => {
    if (!user) {
      setBadges({
        lotsVacants: 0,
        candidatesPending: 0,
        unpaidPayments: 0,
        leasesExpiring: 0,
        diagnosticsExpiring: 0,
      })
      return
    }

    try {
      // Récupérer l'ID utilisateur interne
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('supabase_uid', user.id)
        .single()

      if (userError) throw userError

      // 1. Lots vacants
      let lotsQuery = supabase
        .from('lots')
        .select('id, properties_new!inner(entity_id, entities!inner(user_id))', { count: 'exact', head: true })
        .eq('properties_new.entities.user_id', userData.id)
        .eq('status', 'vacant')

      if (entityId) {
        lotsQuery = lotsQuery.eq('properties_new.entity_id', entityId)
      }

      const { count: lotsVacants } = await lotsQuery

      // 2. Candidatures en attente
      let candidatesQuery = supabase
        .from('candidates')
        .select('id, candidate_groups!inner(entity_id, entities!inner(user_id))', { count: 'exact', head: true })
        .eq('candidate_groups.entities.user_id', userData.id)
        .eq('status', 'pending')

      if (entityId) {
        candidatesQuery = candidatesQuery.eq('candidate_groups.entity_id', entityId)
      }

      const { count: candidatesPending } = await candidatesQuery

      // 3. Paiements en retard
      const today = new Date().toISOString().split('T')[0]
      let paymentsQuery = supabase
        .from('payments')
        .select(`
          id,
          lease:leases!inner(
            lot:lots!inner(
              properties_new!inner(entity_id, entities!inner(user_id))
            )
          )
        `, { count: 'exact', head: true })
        .eq('lease.lot.properties_new.entities.user_id', userData.id)
        .eq('status', 'pending')
        .lt('due_date', today)

      if (entityId) {
        paymentsQuery = paymentsQuery.eq('lease.lot.properties_new.entity_id', entityId)
      }

      const { count: unpaidPayments } = await paymentsQuery

      // 4. Baux expirant dans 30 jours
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

      let leasesQuery = supabase
        .from('leases')
        .select('id, lot:lots!inner(properties_new!inner(entity_id, entities!inner(user_id)))', { count: 'exact', head: true })
        .eq('lot.properties_new.entities.user_id', userData.id)
        .eq('status', 'active')
        .not('end_date', 'is', null)
        .lt('end_date', thirtyDaysFromNow.toISOString().split('T')[0])
        .gt('end_date', today)

      if (entityId) {
        leasesQuery = leasesQuery.eq('lot.properties_new.entity_id', entityId)
      }

      const { count: leasesExpiring } = await leasesQuery

      // 5. Diagnostics expirant dans 60 jours (à implémenter selon la structure de la table)
      // Pour l'instant on met 0, à adapter selon la table diagnostics
      const diagnosticsExpiring = 0

      setBadges({
        lotsVacants: lotsVacants || 0,
        candidatesPending: candidatesPending || 0,
        unpaidPayments: unpaidPayments || 0,
        leasesExpiring: leasesExpiring || 0,
        diagnosticsExpiring,
      })
    } catch (error) {
      console.error('Error fetching sidebar badges:', error)
    } finally {
      setLoading(false)
    }
  }, [user, entityId])

  useEffect(() => {
    fetchBadges()

    // Rafraîchir toutes les 5 minutes
    const interval = setInterval(fetchBadges, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [fetchBadges])

  return { badges, loading, refetch: fetchBadges }
}

export default useSidebarBadges
