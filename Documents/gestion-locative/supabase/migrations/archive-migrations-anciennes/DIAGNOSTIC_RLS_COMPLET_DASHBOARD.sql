-- ============================================================================
-- DIAGNOSTIC COMPLET RLS (Row Level Security) - VERSION DASHBOARD
-- Date: 2026-01-03
-- Objectif: Auditer la sécurité des données multi-entités
-- ============================================================================

-- Ce script NE MODIFIE RIEN, il affiche seulement l'état actuel

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '🔍 DIAGNOSTIC RLS - GESTION LOCATIVE';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- 1. VÉRIFIER SI RLS EST ACTIVÉ SUR TOUTES LES TABLES
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '📋 1. État RLS par table';
  RAISE NOTICE '----------------------------------------';
END $$;

SELECT
  schemaname AS "Schema",
  tablename AS "Table",
  CASE
    WHEN rowsecurity THEN '✅ ACTIVÉ'
    ELSE '❌ DÉSACTIVÉ'
  END AS "RLS"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
  AND tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns')
ORDER BY
  CASE WHEN rowsecurity THEN 0 ELSE 1 END,
  tablename;

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  CRITIQUE: Toutes les tables doivent avoir RLS = ACTIVÉ';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- 2. COMPTER LES POLICIES PAR TABLE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '📊 2. Nombre de policies par table';
  RAISE NOTICE '----------------------------------------';
END $$;

SELECT
  schemaname AS "Schema",
  tablename AS "Table",
  COUNT(*) AS "Nb Policies"
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY COUNT(*) DESC;

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  Minimum recommandé: 4 policies par table (SELECT, INSERT, UPDATE, DELETE)';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- 3. DÉTAILS DES POLICIES EXISTANTES
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '🔐 3. Détails des policies existantes';
  RAISE NOTICE '----------------------------------------';
END $$;

SELECT
  schemaname AS "Schema",
  tablename AS "Table",
  policyname AS "Policy Name",
  cmd AS "Command",
  CASE
    WHEN roles = '{public}' THEN '⚠️  PUBLIC (DANGEREUX)'
    ELSE roles::text
  END AS "Roles",
  CASE
    WHEN qual IS NOT NULL THEN '✅ AVEC CHECK'
    ELSE '❌ SANS CHECK'
  END AS "Protection"
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- ============================================================================
-- 4. IDENTIFIER LES TABLES SANS POLICIES
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  4. Tables SANS aucune policy (VULNÉRABLES)';
  RAISE NOTICE '----------------------------------------';
END $$;

SELECT
  t.tablename AS "⚠️  Table Vulnérable",
  CASE
    WHEN t.rowsecurity THEN 'RLS activé mais AUCUNE policy → ACCÈS REFUSÉ TOTAL'
    ELSE 'RLS désactivé → ACCÈS LIBRE TOTAL ❌❌❌'
  END AS "Conséquence"
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND p.schemaname = 'public'
WHERE t.schemaname = 'public'
  AND t.tablename NOT LIKE 'pg_%'
  AND t.tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns')
  AND p.policyname IS NULL
ORDER BY t.rowsecurity DESC;

-- ============================================================================
-- 5. VÉRIFIER LES TABLES CRITIQUES
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎯 5. État des tables critiques multi-entités';
  RAISE NOTICE '----------------------------------------';
END $$;

WITH critical_tables AS (
  SELECT unnest(ARRAY[
    'users',
    'entities',
    'properties_new',
    'lots',
    'tenants',
    'tenant_groups',
    'guarantees',
    'leases',
    'payments',
    'candidates',
    'candidate_documents'
  ]) AS table_name
)
SELECT
  ct.table_name AS "Table Critique",
  CASE
    WHEN pt.rowsecurity THEN '✅'
    ELSE '❌ DANGER'
  END AS "RLS",
  COALESCE(COUNT(pp.policyname), 0) AS "Nb Policies",
  CASE
    WHEN COUNT(pp.policyname) >= 4 THEN '✅ OK'
    WHEN COUNT(pp.policyname) BETWEEN 1 AND 3 THEN '⚠️  PARTIEL'
    ELSE '❌ AUCUNE'
  END AS "Protection"
FROM critical_tables ct
LEFT JOIN pg_tables pt ON ct.table_name = pt.tablename AND pt.schemaname = 'public'
LEFT JOIN pg_policies pp ON ct.table_name = pp.tablename AND pp.schemaname = 'public'
GROUP BY ct.table_name, pt.rowsecurity
ORDER BY
  CASE WHEN pt.rowsecurity THEN 0 ELSE 1 END,
  COUNT(pp.policyname) ASC;

-- ============================================================================
-- 6. TESTER LA FONCTION auth.uid()
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔑 6. Test fonction auth.uid() (indispensable pour RLS)';
  RAISE NOTICE '----------------------------------------';
END $$;

SELECT
  CASE
    WHEN auth.uid() IS NULL THEN '⚠️  NULL (normal si exécuté depuis SQL Editor)'
    ELSE '✅ ' || auth.uid()::text
  END AS "auth.uid() actuel",
  'Si NULL ici, c''est normal. La fonction retournera l''UUID user quand appelée via l''API.' AS "Note";

-- ============================================================================
-- 7. VÉRIFIER LES COLONNES entity_id/user_id
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔗 7. Vérification colonnes de liaison (entity_id, user_id)';
  RAISE NOTICE '----------------------------------------';
END $$;

SELECT
  table_name AS "Table",
  column_name AS "Colonne Liaison",
  data_type AS "Type",
  CASE
    WHEN is_nullable = 'YES' THEN '⚠️  NULLABLE'
    ELSE '✅ NOT NULL'
  END AS "Contrainte"
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (column_name = 'entity_id' OR column_name = 'user_id')
ORDER BY table_name, column_name;

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '💡 Toutes les tables doivent avoir entity_id (NOT NULL) sauf:';
  RAISE NOTICE '   - users (a user_id mais pas entity_id)';
  RAISE NOTICE '   - entities (a user_id pour lier au propriétaire)';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- 8. RÉSUMÉ ET RECOMMANDATIONS
-- ============================================================================

DO $$
DECLARE
  total_tables INTEGER;
  tables_with_rls INTEGER;
  tables_without_rls INTEGER;
  total_policies INTEGER;
  tables_without_policies INTEGER;
  score INTEGER;
BEGIN
  -- Compter les tables
  SELECT COUNT(*) INTO total_tables
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
    AND tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns');

  -- Compter les tables avec RLS
  SELECT COUNT(*) INTO tables_with_rls
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
    AND rowsecurity = true;

  tables_without_rls := total_tables - tables_with_rls;

  -- Compter les policies
  SELECT COUNT(*) INTO total_policies
  FROM pg_policies
  WHERE schemaname = 'public';

  -- Tables sans policies
  SELECT COUNT(*) INTO tables_without_policies
  FROM (
    SELECT DISTINCT t.tablename
    FROM pg_tables t
    LEFT JOIN pg_policies p ON t.tablename = p.tablename AND p.schemaname = 'public'
    WHERE t.schemaname = 'public'
      AND t.tablename NOT LIKE 'pg_%'
      AND p.policyname IS NULL
  ) sub;

  -- Calculer le score
  score := CASE
    WHEN tables_without_rls = 0 AND tables_without_policies = 0 THEN 100
    WHEN tables_without_rls = 0 AND tables_without_policies <= 2 THEN 80
    WHEN tables_without_rls <= 2 AND tables_without_policies <= 5 THEN 50
    WHEN tables_without_rls <= 5 THEN 30
    ELSE 0
  END;

  RAISE NOTICE '';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '📊 RÉSUMÉ DU DIAGNOSTIC';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Statistiques:';
  RAISE NOTICE '  - Total tables: %', total_tables;
  RAISE NOTICE '  - Tables avec RLS: % / %', tables_with_rls, total_tables;
  RAISE NOTICE '  - Tables SANS RLS: % ❌', tables_without_rls;
  RAISE NOTICE '  - Total policies: %', total_policies;
  RAISE NOTICE '  - Tables sans policies: % ❌', tables_without_policies;
  RAISE NOTICE '';
  RAISE NOTICE '🎯 SCORE SÉCURITÉ: %/100', score;
  RAISE NOTICE '';

  IF score >= 80 THEN
    RAISE NOTICE '✅ EXCELLENTE sécurité !';
  ELSIF score >= 50 THEN
    RAISE NOTICE '⚠️  Sécurité MOYENNE - Actions requises';
  ELSIF score >= 30 THEN
    RAISE NOTICE '❌ Sécurité FAIBLE - URGENT';
  ELSE
    RAISE NOTICE '🔴 Sécurité CRITIQUE - DANGER IMMÉDIAT';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📋 ACTIONS RECOMMANDÉES';
  RAISE NOTICE '========================================';

  IF tables_without_rls > 0 THEN
    RAISE NOTICE '1. ❌ Activer RLS sur % tables', tables_without_rls;
    RAISE NOTICE '   → Exécuter: 20260103_activate_rls_DASHBOARD.sql';
  END IF;

  IF tables_without_policies > 0 THEN
    RAISE NOTICE '2. ❌ Créer policies pour % tables', tables_without_policies;
    RAISE NOTICE '   → Exécuter: 20260103_create_rls_policies_DASHBOARD_v2.sql';
  END IF;

  IF tables_without_rls = 0 AND tables_without_policies = 0 THEN
    RAISE NOTICE '✅ Aucune action requise - Sécurité optimale !';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '⏱️  Temps estimé: % heures', (tables_without_rls + tables_without_policies) * 0.5;
  END IF;

  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '💡 Ce diagnostic a été exécuté avec succès depuis Supabase Dashboard';
  RAISE NOTICE '';
END $$;
