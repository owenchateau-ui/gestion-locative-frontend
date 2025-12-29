-- ============================================================================
-- SCRIPT DE DIAGNOSTIC RLS
-- ============================================================================
-- Copie-colle ce script dans Supabase SQL Editor pour diagnostiquer
-- ============================================================================

-- ============================================================================
-- 1. VÉRIFIER L'UTILISATEUR CONNECTÉ
-- ============================================================================

DO $$
DECLARE
  current_user_id UUID;
BEGIN
    current_user_id := auth.uid();

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '1. UTILISATEUR CONNECTÉ';
    RAISE NOTICE '========================================';

    IF current_user_id IS NULL THEN
        RAISE NOTICE '❌ PROBLÈME: Aucun utilisateur connecté !';
        RAISE NOTICE '   auth.uid() retourne NULL';
        RAISE NOTICE '   Tu dois être connecté à l''application pour que RLS fonctionne';
    ELSE
        RAISE NOTICE '✅ Utilisateur connecté';
        RAISE NOTICE '   auth.uid() = %', current_user_id;
    END IF;
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- 2. VÉRIFIER LA STRUCTURE DES TABLES
-- ============================================================================

SELECT
    '========================================' as "Step",
    '2. STRUCTURE DES TABLES' as "Info"
UNION ALL
SELECT
    '========================================',
    ''
UNION ALL
SELECT
    'Table',
    'Colonnes'
UNION ALL
SELECT
    'properties',
    string_agg(column_name, ', ' ORDER BY ordinal_position)
FROM information_schema.columns
WHERE table_name = 'properties'
  AND table_schema = 'public'
GROUP BY table_name
UNION ALL
SELECT
    'lots',
    string_agg(column_name, ', ' ORDER BY ordinal_position)
FROM information_schema.columns
WHERE table_name = 'lots'
  AND table_schema = 'public'
GROUP BY table_name;

-- ============================================================================
-- 3. VÉRIFIER LES DONNÉES (Propriétés et Lots)
-- ============================================================================

SELECT
    '========================================' as "Step",
    '3. VÉRIFICATION PROPRIÉTÉS vs AUTH' as "lot_id",
    '' as "lot_name",
    '' as "property_name",
    '' as "owner_id",
    '' as "my_auth_uid",
    '' as "Match?"
UNION ALL
SELECT
    '========================================',
    '',
    '',
    '',
    '',
    '',
    ''
UNION ALL
SELECT
    'Lot',
    l.id::TEXT,
    l.name,
    p.name,
    p.owner_id::TEXT,
    auth.uid()::TEXT,
    CASE
        WHEN p.owner_id = auth.uid() THEN '✅ OUI'
        ELSE '❌ NON'
    END
FROM lots l
INNER JOIN properties p ON l.property_id = p.id
ORDER BY l.created_at DESC
LIMIT 5;

-- ============================================================================
-- 4. VÉRIFIER LES POLITIQUES RLS ACTIVES
-- ============================================================================

SELECT
    '========================================' as "Table",
    '4. POLITIQUES RLS ACTIVES' as "Policy",
    '' as "Command",
    '' as "Roles"
UNION ALL
SELECT
    '========================================',
    '',
    '',
    ''
UNION ALL
SELECT
    schemaname || '.' || tablename,
    policyname,
    cmd,
    roles::TEXT
FROM pg_policies
WHERE tablename = 'candidate_invitation_links'
ORDER BY policyname;

-- ============================================================================
-- 5. TEST MANUEL DE LA POLITIQUE RLS
-- ============================================================================

DO $$
DECLARE
  test_lot_id UUID;
  policy_allows BOOLEAN;
  current_user_id UUID;
BEGIN
    current_user_id := auth.uid();

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '5. TEST MANUEL POLITIQUE RLS';
    RAISE NOTICE '========================================';

    -- Récupérer un lot de test
    SELECT l.id INTO test_lot_id
    FROM lots l
    INNER JOIN properties p ON l.property_id = p.id
    WHERE p.owner_id = current_user_id
    LIMIT 1;

    IF test_lot_id IS NULL THEN
        RAISE NOTICE '❌ PROBLÈME: Aucun lot trouvé pour cet utilisateur !';
        RAISE NOTICE '   Tes propriétés n''ont pas le bon owner_id';
        RAISE NOTICE '   Vérifie la section 3 ci-dessus';
    ELSE
        -- Tester la politique manuellement
        SELECT EXISTS (
            SELECT 1 FROM lots l
            INNER JOIN properties p ON l.property_id = p.id
            WHERE l.id = test_lot_id
            AND p.owner_id = auth.uid()
        ) INTO policy_allows;

        RAISE NOTICE 'Lot de test: %', test_lot_id;
        RAISE NOTICE 'Politique autorise: %', policy_allows;

        IF policy_allows THEN
            RAISE NOTICE '✅ La politique devrait fonctionner !';
        ELSE
            RAISE NOTICE '❌ La politique bloque l''accès';
        END IF;
    END IF;
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- 6. RECOMMANDATIONS
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '6. RECOMMANDATIONS';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Si "Match?" = ❌ NON dans la section 3 :';
    RAISE NOTICE '  → Les owner_id de tes properties ne correspondent pas à auth.uid()';
    RAISE NOTICE '  → Solution: Mettre à jour les owner_id';
    RAISE NOTICE '';
    RAISE NOTICE 'Si auth.uid() = NULL dans la section 1 :';
    RAISE NOTICE '  → Tu n''es pas connecté à l''application';
    RAISE NOTICE '  → Solution: Te connecter avant de créer des liens';
    RAISE NOTICE '';
    RAISE NOTICE 'Si "Politique autorise" = false dans la section 5 :';
    RAISE NOTICE '  → Les politiques RLS bloquent l''accès';
    RAISE NOTICE '  → Vérifie les sections 3 et 4';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- FIN DU DIAGNOSTIC
-- ============================================================================

SELECT '🎯 DIAGNOSTIC TERMINÉ - Vérifie les messages ci-dessus' as "Résultat";
