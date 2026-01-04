-- ============================================================================
-- NETTOYAGE COMPLET - Suppression ancien RLS avant nouveau
-- ============================================================================
-- Date: 2026-01-04
-- Description: Supprime TOUTES les anciennes policies et helper functions
-- IMPORTANT: À exécuter AVANT 20260104_RLS_CORRECT_FINAL.sql
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🧹 NETTOYAGE ANCIEN RLS';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- 1. LISTER TOUTES LES POLICIES EXISTANTES
-- ============================================================================

DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public';

  RAISE NOTICE '';
  RAISE NOTICE '📊 Policies existantes avant nettoyage: %', policy_count;
  RAISE NOTICE '';
END $$;

-- Afficher toutes les policies (pour debug)
SELECT
  tablename AS "Table",
  policyname AS "Policy",
  cmd AS "Command"
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- 2. SUPPRIMER TOUTES LES POLICIES PAR TABLE
-- ============================================================================

DO $$
DECLARE
  r RECORD;
  policies_dropped INTEGER := 0;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🗑️  Suppression de toutes les policies...';
  RAISE NOTICE '';

  -- Boucle sur toutes les policies
  FOR r IN
    SELECT tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
    policies_dropped := policies_dropped + 1;
    RAISE NOTICE '   ✓ Supprimé: %.%', r.tablename, r.policyname;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '✅ Total policies supprimées: %', policies_dropped;
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- 3. SUPPRIMER TOUTES LES HELPER FUNCTIONS (après les policies)
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🗑️  Suppression des helper functions...';
  RAISE NOTICE '';

  -- Maintenant que les policies sont supprimées, on peut supprimer les functions
  DROP FUNCTION IF EXISTS user_owns_entity(UUID) CASCADE;
  DROP FUNCTION IF EXISTS user_owns_property(UUID) CASCADE;
  DROP FUNCTION IF EXISTS user_owns_lot(UUID) CASCADE;
  DROP FUNCTION IF EXISTS get_app_user_id() CASCADE;

  RAISE NOTICE '✅ Anciennes helper functions supprimées';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- 4. VÉRIFICATION POST-NETTOYAGE
-- ============================================================================

DO $$
DECLARE
  policy_count INTEGER;
  function_count INTEGER;
BEGIN
  -- Compter policies restantes
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public';

  -- Compter helper functions restantes
  SELECT COUNT(*) INTO function_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.proname IN ('user_owns_entity', 'user_owns_property', 'user_owns_lot', 'get_app_user_id');

  RAISE NOTICE '';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '✅ NETTOYAGE TERMINÉ';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 État final:';
  RAISE NOTICE '   Policies restantes: % (devrait être 0)', policy_count;
  RAISE NOTICE '   Helper functions restantes: % (devrait être 0)', function_count;
  RAISE NOTICE '';

  IF policy_count > 0 THEN
    RAISE WARNING 'Il reste % policies. Consultez la liste ci-dessous:', policy_count;
  END IF;

  IF function_count > 0 THEN
    RAISE WARNING 'Il reste % helper functions. Elles seront écrasées par le nouveau RLS.', function_count;
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '💡 PROCHAINE ÉTAPE:';
  RAISE NOTICE '   Exécutez maintenant: 20260104_RLS_CORRECT_FINAL.sql';
  RAISE NOTICE '';
END $$;

-- Afficher les policies restantes (si il y en a)
SELECT
  tablename AS "Table",
  policyname AS "Policy Restante"
FROM pg_policies
WHERE schemaname = 'public';

-- ============================================================================
-- NOTES
-- ============================================================================

/*
Ce script fait un nettoyage COMPLET :

1. ✅ Supprime TOUTES les helper functions (anciennes versions)
2. ✅ Liste toutes les policies avant suppression
3. ✅ Supprime TOUTES les policies (boucle dynamique)
4. ✅ Vérifie qu'il ne reste rien
5. ✅ Prêt pour le nouveau RLS

⚠️  ATTENTION:
- Vos données sont toujours là (RLS ne supprime pas les données)
- Le RLS est toujours ACTIVÉ sur les tables
- Seules les POLICIES sont supprimées
- Après ce script, AUCUNE donnée n'est accessible (temporairement)
- Il FAUT exécuter 20260104_RLS_CORRECT_FINAL.sql juste après

🔒 SÉCURITÉ:
- Ce script est réversible (ré-exécuter le nouveau RLS)
- Pas de perte de données
- Transition propre entre ancien et nouveau système
*/
