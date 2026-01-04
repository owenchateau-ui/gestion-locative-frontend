-- ============================================================================
-- DIAGNOSTIC COMPLET - Tables, Triggers, Policies
-- ============================================================================
-- Date: 2026-01-04
-- Objectif: Vérifier qu'aucun trigger ou policy ne manque
-- Usage: Exécuter dans Supabase SQL Editor pour audit complet
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔍 DIAGNOSTIC COMPLET - TRIGGERS & POLICIES';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- 1. LISTER TOUTES LES TABLES PUBLIQUES
-- ============================================================================

DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM pg_tables
  WHERE schemaname = 'public';

  RAISE NOTICE '';
  RAISE NOTICE '📊 TABLES PUBLIQUES: %', table_count;
  RAISE NOTICE '';
END $$;

SELECT
  tablename AS "Table",
  CASE
    WHEN rowsecurity THEN '✅ RLS Activé'
    ELSE '❌ RLS Désactivé'
  END AS "RLS Status"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY
  CASE WHEN rowsecurity THEN 0 ELSE 1 END,
  tablename;

-- ============================================================================
-- 2. COMPTER POLICIES PAR TABLE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔐 POLICIES PAR TABLE';
  RAISE NOTICE '';
END $$;

SELECT
  tablename AS "Table",
  COUNT(*) AS "Nb Policies",
  STRING_AGG(DISTINCT cmd::text, ', ' ORDER BY cmd::text) AS "Commandes"
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY COUNT(*) DESC, tablename;

-- ============================================================================
-- 3. LISTER POLICIES PUBLIQUES (anon)
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🌐 POLICIES PUBLIQUES (anon)';
  RAISE NOTICE '';
END $$;

SELECT
  tablename AS "Table",
  policyname AS "Policy Name",
  cmd AS "Command"
FROM pg_policies
WHERE schemaname = 'public'
  AND 'anon' = ANY(roles)
ORDER BY tablename, policyname;

-- ============================================================================
-- 4. LISTER TOUS LES TRIGGERS
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '⚡ TRIGGERS ACTIFS';
  RAISE NOTICE '';
END $$;

SELECT
  c.relname AS "Table",
  t.tgname AS "Trigger Name",
  CASE t.tgenabled
    WHEN 'O' THEN '✅ Enabled'
    WHEN 'D' THEN '❌ Disabled'
    ELSE '⚠️  Unknown'
  END AS "Status",
  p.proname AS "Function Name"
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
LEFT JOIN pg_proc p ON t.tgfoid = p.oid
WHERE n.nspname IN ('public', 'auth')
  AND NOT t.tgisinternal
ORDER BY c.relname, t.tgname;

-- ============================================================================
-- 5. VÉRIFIER SYNC auth.users ↔ users
-- ============================================================================

DO $$
DECLARE
  auth_count INTEGER;
  app_count INTEGER;
  diff INTEGER;
BEGIN
  SELECT COUNT(*) INTO auth_count FROM auth.users;
  SELECT COUNT(*) INTO app_count FROM users;
  diff := auth_count - app_count;

  RAISE NOTICE '';
  RAISE NOTICE '👥 SYNCHRONISATION AUTH ↔ USERS';
  RAISE NOTICE '';
  RAISE NOTICE '   Comptes auth.users: %', auth_count;
  RAISE NOTICE '   Entrées users: %', app_count;
  RAISE NOTICE '   Différence: %', diff;
  RAISE NOTICE '';

  IF diff = 0 THEN
    RAISE NOTICE '   ✅ SYNCHRONISATION PARFAITE';
  ELSE
    RAISE NOTICE '   ⚠️  DÉSYNCHRONISATION DÉTECTÉE';
  END IF;
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- 6. VÉRIFIER USERS SANS ENTITÉ
-- ============================================================================

DO $$
DECLARE
  users_without_entity INTEGER;
BEGIN
  SELECT COUNT(*) INTO users_without_entity
  FROM users u
  LEFT JOIN entities e ON e.user_id = u.id
  WHERE e.id IS NULL;

  RAISE NOTICE '';
  RAISE NOTICE '🏢 USERS SANS ENTITÉ';
  RAISE NOTICE '';
  RAISE NOTICE '   Users sans entité: %', users_without_entity;
  RAISE NOTICE '';

  IF users_without_entity = 0 THEN
    RAISE NOTICE '   ✅ Tous les users ont une entité';
  ELSE
    RAISE NOTICE '   ⚠️  Certains users n''ont pas d''entité';
  END IF;
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- 7. VÉRIFIER TENANTS SANS user_id
-- ============================================================================

DO $$
DECLARE
  tenants_without_user_id INTEGER;
BEGIN
  SELECT COUNT(*) INTO tenants_without_user_id
  FROM tenants
  WHERE user_id IS NULL;

  RAISE NOTICE '';
  RAISE NOTICE '👤 TENANTS SANS user_id';
  RAISE NOTICE '';
  RAISE NOTICE '   Tenants sans user_id: %', tenants_without_user_id;
  RAISE NOTICE '';

  IF tenants_without_user_id = 0 THEN
    RAISE NOTICE '   ✅ Tous les tenants ont un user_id';
  ELSE
    RAISE NOTICE '   ⚠️  Certains tenants n''ont pas de user_id';
  END IF;
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- 8. VÉRIFIER TABLES SANS RLS
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  TABLES SANS RLS (si applicable)';
  RAISE NOTICE '';
END $$;

SELECT
  tablename AS "Table Sans RLS"
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false
ORDER BY tablename;

-- ============================================================================
-- 9. RÉSUMÉ GLOBAL
-- ============================================================================

DO $$
DECLARE
  total_tables INTEGER;
  tables_with_rls INTEGER;
  total_policies INTEGER;
  public_policies INTEGER;
  total_triggers INTEGER;
BEGIN
  -- Compter tables
  SELECT COUNT(*) INTO total_tables FROM pg_tables WHERE schemaname = 'public';
  SELECT COUNT(*) INTO tables_with_rls FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true;

  -- Compter policies
  SELECT COUNT(*) INTO total_policies FROM pg_policies WHERE schemaname = 'public';
  SELECT COUNT(*) INTO public_policies FROM pg_policies WHERE schemaname = 'public' AND 'anon' = ANY(roles);

  -- Compter triggers
  SELECT COUNT(*) INTO total_triggers
  FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname IN ('public', 'auth') AND NOT t.tgisinternal;

  RAISE NOTICE '';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '📊 RÉSUMÉ GLOBAL';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📁 Tables:';
  RAISE NOTICE '   Total: %', total_tables;
  RAISE NOTICE '   Avec RLS: %', tables_with_rls;
  RAISE NOTICE '   Sans RLS: %', total_tables - tables_with_rls;
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Policies:';
  RAISE NOTICE '   Total: %', total_policies;
  RAISE NOTICE '   Publiques (anon): %', public_policies;
  RAISE NOTICE '';
  RAISE NOTICE '⚡ Triggers:';
  RAISE NOTICE '   Total: %', total_triggers;
  RAISE NOTICE '';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
END $$;
