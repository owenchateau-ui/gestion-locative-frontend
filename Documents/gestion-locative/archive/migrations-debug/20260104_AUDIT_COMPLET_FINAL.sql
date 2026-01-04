-- ============================================================================
-- AUDIT COMPLET FINAL - RLS, Triggers, Policies, Schéma
-- ============================================================================
-- Date: 2026-01-04
-- Objectif: Vérification exhaustive du système de sécurité
-- Usage: Exécuter dans Supabase SQL Editor
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔══════════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║           AUDIT COMPLET - SÉCURITÉ & ARCHITECTURE                ║';
  RAISE NOTICE '╚══════════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- SECTION 1: TABLES ET RLS
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '┌──────────────────────────────────────────────────────────────────┐';
  RAISE NOTICE '│ SECTION 1: TABLES ET STATUT RLS                                  │';
  RAISE NOTICE '└──────────────────────────────────────────────────────────────────┘';
  RAISE NOTICE '';
END $$;

-- 1.1 Lister toutes les tables avec statut RLS
SELECT
  tablename AS "Table",
  CASE
    WHEN rowsecurity THEN '✅ RLS Activé'
    ELSE '❌ RLS Désactivé'
  END AS "Statut RLS",
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename AND schemaname = 'public') AS "Nb Policies"
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY
  CASE WHEN rowsecurity THEN 0 ELSE 1 END,
  tablename;

-- 1.2 Résumé RLS
DO $$
DECLARE
  total_tables INTEGER;
  tables_with_rls INTEGER;
  tables_without_rls INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_tables FROM pg_tables WHERE schemaname = 'public';
  SELECT COUNT(*) INTO tables_with_rls FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true;
  tables_without_rls := total_tables - tables_with_rls;

  RAISE NOTICE '';
  RAISE NOTICE '📊 RÉSUMÉ RLS:';
  RAISE NOTICE '   Total tables: %', total_tables;
  RAISE NOTICE '   Avec RLS: % (%.0f%%)', tables_with_rls, (tables_with_rls::float / total_tables * 100);
  RAISE NOTICE '   Sans RLS: %', tables_without_rls;
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- SECTION 2: POLICIES DÉTAILLÉES
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '┌──────────────────────────────────────────────────────────────────┐';
  RAISE NOTICE '│ SECTION 2: POLICIES PAR TABLE                                    │';
  RAISE NOTICE '└──────────────────────────────────────────────────────────────────┘';
  RAISE NOTICE '';
END $$;

-- 2.1 Compter policies par table et type d'opération
SELECT
  tablename AS "Table",
  COUNT(*) FILTER (WHERE cmd = 'SELECT') AS "SELECT",
  COUNT(*) FILTER (WHERE cmd = 'INSERT') AS "INSERT",
  COUNT(*) FILTER (WHERE cmd = 'UPDATE') AS "UPDATE",
  COUNT(*) FILTER (WHERE cmd = 'DELETE') AS "DELETE",
  COUNT(*) AS "Total"
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- 2.2 Policies publiques (anon)
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🌐 POLICIES PUBLIQUES (anon):';
  RAISE NOTICE '';
END $$;

SELECT
  tablename AS "Table",
  policyname AS "Policy",
  cmd AS "Opération"
FROM pg_policies
WHERE schemaname = 'public'
  AND 'anon' = ANY(roles)
ORDER BY tablename, policyname;

-- 2.3 Résumé policies
DO $$
DECLARE
  total_policies INTEGER;
  public_policies INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_policies FROM pg_policies WHERE schemaname = 'public';
  SELECT COUNT(*) INTO public_policies FROM pg_policies WHERE schemaname = 'public' AND 'anon' = ANY(roles);

  RAISE NOTICE '';
  RAISE NOTICE '📊 RÉSUMÉ POLICIES:';
  RAISE NOTICE '   Total policies: %', total_policies;
  RAISE NOTICE '   Policies publiques (anon): %', public_policies;
  RAISE NOTICE '   Policies authentifiées: %', total_policies - public_policies;
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- SECTION 3: TRIGGERS
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '┌──────────────────────────────────────────────────────────────────┐';
  RAISE NOTICE '│ SECTION 3: TRIGGERS ACTIFS                                       │';
  RAISE NOTICE '└──────────────────────────────────────────────────────────────────┘';
  RAISE NOTICE '';
END $$;

-- 3.1 Lister tous les triggers
SELECT
  n.nspname AS "Schema",
  c.relname AS "Table",
  t.tgname AS "Trigger",
  CASE t.tgenabled
    WHEN 'O' THEN '✅ Enabled'
    WHEN 'D' THEN '❌ Disabled'
    ELSE '⚠️ ' || t.tgenabled
  END AS "Statut",
  p.proname AS "Fonction"
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
LEFT JOIN pg_proc p ON t.tgfoid = p.oid
WHERE n.nspname IN ('public', 'auth')
  AND NOT t.tgisinternal
ORDER BY n.nspname, c.relname, t.tgname;

-- 3.2 Résumé triggers
DO $$
DECLARE
  total_triggers INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_triggers
  FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname IN ('public', 'auth') AND NOT t.tgisinternal;

  RAISE NOTICE '';
  RAISE NOTICE '📊 RÉSUMÉ TRIGGERS:';
  RAISE NOTICE '   Total triggers: %', total_triggers;
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- SECTION 4: FONCTIONS HELPER RLS
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '┌──────────────────────────────────────────────────────────────────┐';
  RAISE NOTICE '│ SECTION 4: FONCTIONS HELPER RLS                                  │';
  RAISE NOTICE '└──────────────────────────────────────────────────────────────────┘';
  RAISE NOTICE '';
END $$;

-- 4.1 Lister les fonctions helper
SELECT
  proname AS "Fonction",
  CASE
    WHEN prosecdef THEN '🔐 SECURITY DEFINER'
    ELSE '👤 SECURITY INVOKER'
  END AS "Sécurité",
  pg_get_function_arguments(oid) AS "Arguments",
  pg_get_function_result(oid) AS "Retour"
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname IN (
    'get_app_user_id',
    'user_owns_entity',
    'user_owns_property',
    'user_owns_lot',
    'user_owns_tenant',
    'handle_new_user',
    'set_tenant_user_id'
  )
ORDER BY proname;

-- 4.2 Vérifier que les fonctions critiques existent
DO $$
DECLARE
  fn_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO fn_count
  FROM pg_proc
  WHERE pronamespace = 'public'::regnamespace
    AND proname IN ('get_app_user_id', 'user_owns_entity', 'user_owns_property', 'user_owns_lot', 'handle_new_user');

  RAISE NOTICE '';
  RAISE NOTICE '📊 FONCTIONS CRITIQUES:';
  RAISE NOTICE '   Trouvées: %/5', fn_count;
  IF fn_count = 5 THEN
    RAISE NOTICE '   ✅ Toutes les fonctions critiques sont présentes';
  ELSE
    RAISE NOTICE '   ⚠️ Certaines fonctions manquent!';
  END IF;
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- SECTION 5: SYNCHRONISATION AUTH ↔ USERS
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '┌──────────────────────────────────────────────────────────────────┐';
  RAISE NOTICE '│ SECTION 5: SYNCHRONISATION AUTH ↔ USERS                          │';
  RAISE NOTICE '└──────────────────────────────────────────────────────────────────┘';
  RAISE NOTICE '';
END $$;

DO $$
DECLARE
  auth_count INTEGER;
  users_count INTEGER;
  orphan_auth INTEGER;
  orphan_users INTEGER;
BEGIN
  SELECT COUNT(*) INTO auth_count FROM auth.users;
  SELECT COUNT(*) INTO users_count FROM users;

  -- Comptes auth sans entrée users
  SELECT COUNT(*) INTO orphan_auth
  FROM auth.users au
  LEFT JOIN users u ON au.id = u.supabase_uid
  WHERE u.id IS NULL;

  -- Entrées users sans compte auth
  SELECT COUNT(*) INTO orphan_users
  FROM users u
  LEFT JOIN auth.users au ON u.supabase_uid = au.id
  WHERE au.id IS NULL;

  RAISE NOTICE '📊 SYNCHRONISATION:';
  RAISE NOTICE '   auth.users: %', auth_count;
  RAISE NOTICE '   users: %', users_count;
  RAISE NOTICE '   Orphelins auth (sans users): %', orphan_auth;
  RAISE NOTICE '   Orphelins users (sans auth): %', orphan_users;
  RAISE NOTICE '';

  IF orphan_auth = 0 AND orphan_users = 0 THEN
    RAISE NOTICE '   ✅ SYNCHRONISATION PARFAITE';
  ELSE
    RAISE NOTICE '   ⚠️ DÉSYNCHRONISATION DÉTECTÉE';
  END IF;
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- SECTION 6: INTÉGRITÉ ENTITÉS
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '┌──────────────────────────────────────────────────────────────────┐';
  RAISE NOTICE '│ SECTION 6: INTÉGRITÉ DES ENTITÉS                                 │';
  RAISE NOTICE '└──────────────────────────────────────────────────────────────────┘';
  RAISE NOTICE '';
END $$;

DO $$
DECLARE
  users_without_entity INTEGER;
  entities_count INTEGER;
  default_entities INTEGER;
BEGIN
  -- Users sans entité
  SELECT COUNT(*) INTO users_without_entity
  FROM users u
  LEFT JOIN entities e ON e.user_id = u.id
  WHERE e.id IS NULL;

  -- Total entités
  SELECT COUNT(*) INTO entities_count FROM entities;

  -- Entités par défaut
  SELECT COUNT(*) INTO default_entities FROM entities WHERE default_entity = true;

  RAISE NOTICE '📊 ENTITÉS:';
  RAISE NOTICE '   Total entités: %', entities_count;
  RAISE NOTICE '   Entités par défaut: %', default_entities;
  RAISE NOTICE '   Users sans entité: %', users_without_entity;
  RAISE NOTICE '';

  IF users_without_entity = 0 THEN
    RAISE NOTICE '   ✅ Tous les users ont une entité';
  ELSE
    RAISE NOTICE '   ⚠️ % user(s) sans entité!', users_without_entity;
  END IF;
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- SECTION 7: INTÉGRITÉ TENANTS
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '┌──────────────────────────────────────────────────────────────────┐';
  RAISE NOTICE '│ SECTION 7: INTÉGRITÉ DES LOCATAIRES                              │';
  RAISE NOTICE '└──────────────────────────────────────────────────────────────────┘';
  RAISE NOTICE '';
END $$;

DO $$
DECLARE
  tenants_count INTEGER;
  tenants_without_user_id INTEGER;
  tenants_without_entity INTEGER;
BEGIN
  SELECT COUNT(*) INTO tenants_count FROM tenants;
  SELECT COUNT(*) INTO tenants_without_user_id FROM tenants WHERE user_id IS NULL;
  SELECT COUNT(*) INTO tenants_without_entity FROM tenants WHERE entity_id IS NULL;

  RAISE NOTICE '📊 LOCATAIRES:';
  RAISE NOTICE '   Total locataires: %', tenants_count;
  RAISE NOTICE '   Sans user_id: %', tenants_without_user_id;
  RAISE NOTICE '   Sans entity_id: %', tenants_without_entity;
  RAISE NOTICE '';

  IF tenants_without_user_id = 0 AND tenants_without_entity = 0 THEN
    RAISE NOTICE '   ✅ Tous les locataires ont user_id et entity_id';
  ELSE
    RAISE NOTICE '   ⚠️ Certains locataires ont des données manquantes';
  END IF;
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- SECTION 8: CONTRAINTES ET INDEX
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '┌──────────────────────────────────────────────────────────────────┐';
  RAISE NOTICE '│ SECTION 8: CONTRAINTES ET INDEX                                  │';
  RAISE NOTICE '└──────────────────────────────────────────────────────────────────┘';
  RAISE NOTICE '';
END $$;

-- 8.1 Contraintes clés étrangères
SELECT
  tc.table_name AS "Table",
  tc.constraint_name AS "Contrainte",
  kcu.column_name AS "Colonne",
  ccu.table_name AS "Référence Table",
  ccu.column_name AS "Référence Colonne"
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- 8.2 Résumé contraintes
DO $$
DECLARE
  fk_count INTEGER;
  unique_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO fk_count
  FROM information_schema.table_constraints
  WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public';

  SELECT COUNT(*) INTO unique_count
  FROM information_schema.table_constraints
  WHERE constraint_type = 'UNIQUE' AND table_schema = 'public';

  RAISE NOTICE '';
  RAISE NOTICE '📊 CONTRAINTES:';
  RAISE NOTICE '   Foreign Keys: %', fk_count;
  RAISE NOTICE '   Unique: %', unique_count;
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- SECTION 9: STATISTIQUES DONNÉES
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '┌──────────────────────────────────────────────────────────────────┐';
  RAISE NOTICE '│ SECTION 9: STATISTIQUES DONNÉES                                  │';
  RAISE NOTICE '└──────────────────────────────────────────────────────────────────┘';
  RAISE NOTICE '';
END $$;

DO $$
DECLARE
  r RECORD;
BEGIN
  RAISE NOTICE '📊 COMPTAGE PAR TABLE:';
  RAISE NOTICE '';

  FOR r IN
    SELECT 'users' AS tbl, COUNT(*) AS cnt FROM users
    UNION ALL SELECT 'entities', COUNT(*) FROM entities
    UNION ALL SELECT 'properties_new', COUNT(*) FROM properties_new
    UNION ALL SELECT 'lots', COUNT(*) FROM lots
    UNION ALL SELECT 'tenants', COUNT(*) FROM tenants
    UNION ALL SELECT 'leases', COUNT(*) FROM leases
    UNION ALL SELECT 'payments', COUNT(*) FROM payments
    UNION ALL SELECT 'candidates', COUNT(*) FROM candidates
    UNION ALL SELECT 'candidate_documents', COUNT(*) FROM candidate_documents
    UNION ALL SELECT 'candidate_invitation_links', COUNT(*) FROM candidate_invitation_links
    ORDER BY tbl
  LOOP
    RAISE NOTICE '   %: % lignes', RPAD(r.tbl, 25), r.cnt;
  END LOOP;
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- SECTION 10: RAPPORT FINAL
-- ============================================================================

DO $$
DECLARE
  total_tables INTEGER;
  tables_with_rls INTEGER;
  total_policies INTEGER;
  total_triggers INTEGER;
  sync_ok BOOLEAN;
  entities_ok BOOLEAN;
  tenants_ok BOOLEAN;
  score INTEGER := 0;
  max_score INTEGER := 6;
BEGIN
  -- Calcul des métriques
  SELECT COUNT(*) INTO total_tables FROM pg_tables WHERE schemaname = 'public';
  SELECT COUNT(*) INTO tables_with_rls FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true;
  SELECT COUNT(*) INTO total_policies FROM pg_policies WHERE schemaname = 'public';
  SELECT COUNT(*) INTO total_triggers FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname IN ('public', 'auth') AND NOT t.tgisinternal;

  -- Vérification sync
  SELECT NOT EXISTS (
    SELECT 1 FROM auth.users au LEFT JOIN users u ON au.id = u.supabase_uid WHERE u.id IS NULL
    UNION
    SELECT 1 FROM users u LEFT JOIN auth.users au ON u.supabase_uid = au.id WHERE au.id IS NULL
  ) INTO sync_ok;

  -- Vérification entités
  SELECT NOT EXISTS (
    SELECT 1 FROM users u LEFT JOIN entities e ON e.user_id = u.id WHERE e.id IS NULL
  ) INTO entities_ok;

  -- Vérification tenants
  SELECT NOT EXISTS (
    SELECT 1 FROM tenants WHERE user_id IS NULL OR entity_id IS NULL
  ) INTO tenants_ok;

  -- Calcul score
  IF tables_with_rls >= total_tables * 0.8 THEN score := score + 1; END IF;
  IF total_policies >= 50 THEN score := score + 1; END IF;
  IF total_triggers >= 2 THEN score := score + 1; END IF;
  IF sync_ok THEN score := score + 1; END IF;
  IF entities_ok THEN score := score + 1; END IF;
  IF tenants_ok THEN score := score + 1; END IF;

  RAISE NOTICE '';
  RAISE NOTICE '╔══════════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║                    RAPPORT FINAL                                 ║';
  RAISE NOTICE '╚══════════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '┌────────────────────────────────────────────────────────────┐';
  RAISE NOTICE '│ MÉTRIQUES                                                  │';
  RAISE NOTICE '├────────────────────────────────────────────────────────────┤';
  RAISE NOTICE '│ Tables totales:        %-35s│', total_tables;
  RAISE NOTICE '│ Tables avec RLS:       %-35s│', tables_with_rls || ' (' || ROUND(tables_with_rls::numeric / total_tables * 100) || '%)';
  RAISE NOTICE '│ Policies actives:      %-35s│', total_policies;
  RAISE NOTICE '│ Triggers actifs:       %-35s│', total_triggers;
  RAISE NOTICE '└────────────────────────────────────────────────────────────┘';
  RAISE NOTICE '';
  RAISE NOTICE '┌────────────────────────────────────────────────────────────┐';
  RAISE NOTICE '│ VÉRIFICATIONS                                              │';
  RAISE NOTICE '├────────────────────────────────────────────────────────────┤';
  RAISE NOTICE '│ RLS >= 80%%:            %-35s│', CASE WHEN tables_with_rls >= total_tables * 0.8 THEN '✅ OK' ELSE '❌ ÉCHEC' END;
  RAISE NOTICE '│ Policies >= 50:        %-35s│', CASE WHEN total_policies >= 50 THEN '✅ OK' ELSE '❌ ÉCHEC' END;
  RAISE NOTICE '│ Triggers >= 2:         %-35s│', CASE WHEN total_triggers >= 2 THEN '✅ OK' ELSE '❌ ÉCHEC' END;
  RAISE NOTICE '│ Sync auth↔users:       %-35s│', CASE WHEN sync_ok THEN '✅ OK' ELSE '❌ ÉCHEC' END;
  RAISE NOTICE '│ Users ont entités:     %-35s│', CASE WHEN entities_ok THEN '✅ OK' ELSE '❌ ÉCHEC' END;
  RAISE NOTICE '│ Tenants complets:      %-35s│', CASE WHEN tenants_ok THEN '✅ OK' ELSE '❌ ÉCHEC' END;
  RAISE NOTICE '└────────────────────────────────────────────────────────────┘';
  RAISE NOTICE '';
  RAISE NOTICE '┌────────────────────────────────────────────────────────────┐';
  RAISE NOTICE '│ SCORE FINAL: %/6                                          │', score;
  RAISE NOTICE '├────────────────────────────────────────────────────────────┤';

  IF score = max_score THEN
    RAISE NOTICE '│ 🎉 EXCELLENT - SYSTÈME 100%% OPÉRATIONNEL                  │';
    RAISE NOTICE '│ Production Ready!                                         │';
  ELSIF score >= 5 THEN
    RAISE NOTICE '│ ✅ BON - Système fonctionnel avec améliorations mineures   │';
  ELSIF score >= 3 THEN
    RAISE NOTICE '│ ⚠️  MOYEN - Corrections nécessaires                        │';
  ELSE
    RAISE NOTICE '│ ❌ CRITIQUE - Corrections urgentes requises                │';
  END IF;

  RAISE NOTICE '└────────────────────────────────────────────────────────────┘';
  RAISE NOTICE '';
END $$;
