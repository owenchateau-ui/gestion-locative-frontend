-- ============================================================================
-- FIX : Politiques RLS pour candidate_invitation_links
-- ============================================================================
-- Date: 2024-12-29
-- Description: Correction des politiques RLS (séparation INSERT/UPDATE/DELETE)
-- ============================================================================

-- Supprimer l'ancienne politique "FOR ALL"
DROP POLICY IF EXISTS "Owners manage links" ON candidate_invitation_links;

-- ============================================================================
-- POLITIQUES SÉPARÉES POUR candidate_invitation_links
-- ============================================================================

-- SELECT: Tout le monde peut lire les liens actifs (déjà créée)
-- (Pas besoin de la recréer)

-- INSERT: Propriétaires créent des liens pour leurs lots
DROP POLICY IF EXISTS "Owners insert links" ON candidate_invitation_links;
CREATE POLICY "Owners insert links"
ON candidate_invitation_links
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM lots l
    INNER JOIN properties p ON l.property_id = p.id
    INNER JOIN users u ON u.id = p.owner_id
    WHERE l.id = lot_id
    AND u.supabase_uid = auth.uid()
  )
);

-- UPDATE: Propriétaires modifient leurs liens
DROP POLICY IF EXISTS "Owners update links" ON candidate_invitation_links;
CREATE POLICY "Owners update links"
ON candidate_invitation_links
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lots l
    INNER JOIN properties p ON l.property_id = p.id
    INNER JOIN users u ON u.id = p.owner_id
    WHERE l.id = candidate_invitation_links.lot_id
    AND u.supabase_uid = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM lots l
    INNER JOIN properties p ON l.property_id = p.id
    INNER JOIN users u ON u.id = p.owner_id
    WHERE l.id = lot_id
    AND u.supabase_uid = auth.uid()
  )
);

-- DELETE: Propriétaires suppriment leurs liens
DROP POLICY IF EXISTS "Owners delete links" ON candidate_invitation_links;
CREATE POLICY "Owners delete links"
ON candidate_invitation_links
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lots l
    INNER JOIN properties p ON l.property_id = p.id
    INNER JOIN users u ON u.id = p.owner_id
    WHERE l.id = candidate_invitation_links.lot_id
    AND u.supabase_uid = auth.uid()
  )
);

-- ============================================================================
-- CONFIRMATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ POLITIQUES RLS CORRIGÉES';
    RAISE NOTICE '';
    RAISE NOTICE 'candidate_invitation_links:';
    RAISE NOTICE '  - INSERT: Owners insert links';
    RAISE NOTICE '  - UPDATE: Owners update links';
    RAISE NOTICE '  - DELETE: Owners delete links';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Tu peux maintenant générer des liens d''invitation !';
END $$;
