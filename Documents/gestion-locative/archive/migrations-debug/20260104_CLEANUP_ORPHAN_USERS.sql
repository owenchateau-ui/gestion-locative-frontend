-- ============================================================================
-- CLEANUP - Nettoyer les entrées orphelines dans users
-- ============================================================================
-- Date: 2026-01-04
-- Problème: Entrées dans users sans correspondance dans auth.users
-- Solution: Supprimer les entrées orphelines
-- ============================================================================

-- 1. Diagnostic avant nettoyage
DO $$
DECLARE
  orphan_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphan_count
  FROM users u
  LEFT JOIN auth.users au ON u.supabase_uid = au.id
  WHERE au.id IS NULL;

  RAISE NOTICE '';
  RAISE NOTICE '🔍 DIAGNOSTIC AVANT NETTOYAGE';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '   Entrées orphelines dans users: %', orphan_count;
  RAISE NOTICE '';
END $$;

-- 2. Lister les orphelins (pour info)
SELECT
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.created_at
FROM users u
LEFT JOIN auth.users au ON u.supabase_uid = au.id
WHERE au.id IS NULL;

-- 3. Supprimer les entrées orphelines dans users
-- (CASCADE supprimera aussi les entities liées)
DELETE FROM users
WHERE supabase_uid IS NULL
   OR supabase_uid NOT IN (SELECT id FROM auth.users);

-- 4. Diagnostic après nettoyage
DO $$
DECLARE
  auth_count INTEGER;
  users_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO auth_count FROM auth.users;
  SELECT COUNT(*) INTO users_count FROM users;

  RAISE NOTICE '';
  RAISE NOTICE '✅ NETTOYAGE TERMINÉ';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '   auth.users: %', auth_count;
  RAISE NOTICE '   users: %', users_count;
  RAISE NOTICE '   Synchronisation: %',
    CASE WHEN auth_count = users_count THEN '✅ PARFAITE' ELSE '⚠️ Différence' END;
  RAISE NOTICE '';
END $$;
