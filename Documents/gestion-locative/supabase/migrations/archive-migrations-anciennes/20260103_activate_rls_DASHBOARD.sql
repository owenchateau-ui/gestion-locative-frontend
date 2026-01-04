-- ============================================================================
-- ACTIVATION RLS (Row Level Security) SUR TOUTES LES TABLES
-- Date: 2026-01-03
-- Priorité: CRITIQUE
-- VERSION: Pour Supabase Dashboard SQL Editor
-- ============================================================================

-- Cette migration active RLS sur toutes les tables critiques
-- ATTENTION: Une fois RLS activé, AUCUNE donnée ne sera accessible
-- sans policies → Exécuter 20260103_create_rls_policies_DASHBOARD.sql IMMÉDIATEMENT APRÈS

-- ============================================================================
-- TABLES UTILISATEURS ET ENTITÉS
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TABLES PATRIMOINE
-- ============================================================================

ALTER TABLE properties_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE lots ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TABLES LOCATAIRES
-- ============================================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tenant_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS guarantees ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tenant_documents ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TABLES BAUX ET PAIEMENTS
-- ============================================================================

ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TABLES CANDIDATURES
-- ============================================================================

ALTER TABLE IF EXISTS candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS candidate_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS invitation_links ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TABLES INDEXATION IRL
-- ============================================================================

ALTER TABLE IF EXISTS irl_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS indexation_history ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================

DO $$
DECLARE
  total_tables INTEGER;
  tables_with_rls INTEGER;
  tables_without_rls INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_tables
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
    AND tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns');

  SELECT COUNT(*) INTO tables_with_rls
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
    AND rowsecurity = true;

  tables_without_rls := total_tables - tables_with_rls;

  RAISE NOTICE '';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'RÉSULTAT ACTIVATION RLS';
  RAISE NOTICE '===========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'État RLS après activation:';
  RAISE NOTICE '  - Total tables: %', total_tables;
  RAISE NOTICE '  - Tables avec RLS: % ✅', tables_with_rls;
  RAISE NOTICE '  - Tables SANS RLS: %', tables_without_rls;
  RAISE NOTICE '';

  IF tables_without_rls = 0 THEN
    RAISE NOTICE '🎉 SUCCÈS: RLS activé sur TOUTES les tables !';
  ELSE
    RAISE NOTICE '⚠️  Il reste % tables sans RLS', tables_without_rls;
    RAISE NOTICE '   Vérifiez avec DIAGNOSTIC_RLS_COMPLET.sql';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '===========================================';
  RAISE NOTICE '⚠️  ATTENTION - ACTION REQUISE';
  RAISE NOTICE '===========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'RLS est maintenant activé MAIS sans policies.';
  RAISE NOTICE '';
  RAISE NOTICE '❌ CONSÉQUENCE: Toutes les requêtes vont ÉCHOUER';
  RAISE NOTICE '   (accès refusé par défaut)';
  RAISE NOTICE '';
  RAISE NOTICE '✅ SOLUTION: Exécutez IMMÉDIATEMENT:';
  RAISE NOTICE '   → 20260103_create_rls_policies_DASHBOARD.sql';
  RAISE NOTICE '';
  RAISE NOTICE '===========================================';
END $$;
