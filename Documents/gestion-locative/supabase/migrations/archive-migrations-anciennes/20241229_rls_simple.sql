-- ============================================================================
-- FIX SIMPLE : Politiques RLS sans table users
-- ============================================================================
-- Date: 2024-12-29
-- Description: Politiques RLS directes (suppose que owner_id = supabase_uid)
-- ============================================================================

-- Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "Public read active links" ON candidate_invitation_links;
DROP POLICY IF EXISTS "Owners manage links" ON candidate_invitation_links;
DROP POLICY IF EXISTS "Owners insert links" ON candidate_invitation_links;
DROP POLICY IF EXISTS "Owners update links" ON candidate_invitation_links;
DROP POLICY IF EXISTS "Owners delete links" ON candidate_invitation_links;

-- ============================================================================
-- POLITIQUES SIMPLIFIÉES
-- ============================================================================

-- SELECT: Tout le monde peut lire les liens actifs
CREATE POLICY "Public read active links"
ON candidate_invitation_links
FOR SELECT
USING (is_active = true);

-- INSERT: Propriétaires créent des liens (SIMPLIFIÉ)
CREATE POLICY "Owners insert links"
ON candidate_invitation_links
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM lots l
    INNER JOIN properties p ON l.property_id = p.id
    WHERE l.id = lot_id
    AND p.owner_id = auth.uid()
  )
);

-- UPDATE: Propriétaires modifient leurs liens (SIMPLIFIÉ)
CREATE POLICY "Owners update links"
ON candidate_invitation_links
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lots l
    INNER JOIN properties p ON l.property_id = p.id
    WHERE l.id = candidate_invitation_links.lot_id
    AND p.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM lots l
    INNER JOIN properties p ON l.property_id = p.id
    WHERE l.id = lot_id
    AND p.owner_id = auth.uid()
  )
);

-- DELETE: Propriétaires suppriment leurs liens (SIMPLIFIÉ)
CREATE POLICY "Owners delete links"
ON candidate_invitation_links
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lots l
    INNER JOIN properties p ON l.property_id = p.id
    WHERE l.id = candidate_invitation_links.lot_id
    AND p.owner_id = auth.uid()
  )
);

-- ============================================================================
-- VÉRIFICATION : Test si les politiques fonctionnent
-- ============================================================================

DO $$
DECLARE
  current_user_id UUID;
BEGIN
    -- Récupérer l'ID de l'utilisateur connecté
    current_user_id := auth.uid();

    IF current_user_id IS NULL THEN
        RAISE NOTICE '';
        RAISE NOTICE '⚠️  ATTENTION: Aucun utilisateur connecté (auth.uid() = NULL)';
        RAISE NOTICE '   Tu dois être connecté pour créer des liens d''invitation';
        RAISE NOTICE '';
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE '✅ POLITIQUES RLS SIMPLIFIÉES APPLIQUÉES';
        RAISE NOTICE '';
        RAISE NOTICE 'Utilisateur connecté: %', current_user_id;
        RAISE NOTICE '';
        RAISE NOTICE 'Les politiques vérifient maintenant:';
        RAISE NOTICE '  lots → properties → owner_id = auth.uid()';
        RAISE NOTICE '';
        RAISE NOTICE '🎉 Réessaye de générer un lien d''invitation !';
        RAISE NOTICE '';
    END IF;
END $$;
