-- ============================================================================
-- DIAGNOSTIC - Synchronisation auth.users ↔ users
-- ============================================================================
-- Date: 2026-01-04
-- Objectif: Vérifier désynchronisation entre auth.users et users
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔍 DIAGNOSTIC SYNCHRONISATION';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
END $$;

-- 1. Compter total dans chaque table
DO $$
DECLARE
  auth_count INTEGER;
  app_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO auth_count FROM auth.users;
  SELECT COUNT(*) INTO app_count FROM users;

  RAISE NOTICE '📊 TOTAUX:';
  RAISE NOTICE '   auth.users: %', auth_count;
  RAISE NOTICE '   users: %', app_count;
  RAISE NOTICE '   Différence: %', auth_count - app_count;
  RAISE NOTICE '';
END $$;

-- 2. Lister emails dans auth.users SANS entrée dans users
DO $$
BEGIN
  RAISE NOTICE '❌ EMAILS DANS auth.users MAIS PAS DANS users:';
  RAISE NOTICE '';
END $$;

SELECT
  au.email AS "Email auth.users",
  au.created_at AS "Créé le"
FROM auth.users au
LEFT JOIN users u ON au.id = u.supabase_uid
WHERE u.id IS NULL
ORDER BY au.created_at DESC;

-- 3. Lister emails dans users SANS entrée dans auth.users
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '❌ EMAILS DANS users MAIS PAS DANS auth.users:';
  RAISE NOTICE '';
END $$;

SELECT
  u.email AS "Email users",
  u.created_at AS "Créé le"
FROM users u
LEFT JOIN auth.users au ON u.supabase_uid = au.id
WHERE au.id IS NULL
ORDER BY u.created_at DESC;

-- 4. Lister emails DUPLIQUÉS dans users
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  EMAILS DUPLIQUÉS DANS users:';
  RAISE NOTICE '';
END $$;

SELECT
  email AS "Email dupliqué",
  COUNT(*) AS "Nombre d'occurrences"
FROM users
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

-- 5. Résumé
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '📋 RÉSUMÉ';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
  RAISE NOTICE '💡 Si désynchronisation détectée:';
  RAISE NOTICE '   1. Supprimer entrées orphelines dans users';
  RAISE NOTICE '   2. Backfill entrées manquantes depuis auth.users';
  RAISE NOTICE '   3. Retester inscription';
  RAISE NOTICE '';
END $$;
