-- ============================================================================
-- FIX - Activer RLS sur tables manquantes
-- ============================================================================
-- Date: 2026-01-04
-- Problème: 5 tables sans RLS détectées par diagnostic
-- Tables: documents, invitations, irl_indices, lots_new, properties
-- Solution: Activer RLS + créer policies appropriées
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔐 FIX - TABLES SANS RLS';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- 1. Vérifier quelles tables existent et sont utilisées
-- ============================================================================

DO $$
DECLARE
  documents_exists BOOLEAN;
  invitations_exists BOOLEAN;
  irl_indices_exists BOOLEAN;
  lots_new_exists BOOLEAN;
  properties_exists BOOLEAN;
BEGIN
  -- Vérifier l'existence des tables
  SELECT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'documents') INTO documents_exists;
  SELECT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'invitations') INTO invitations_exists;
  SELECT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'irl_indices') INTO irl_indices_exists;
  SELECT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'lots_new') INTO lots_new_exists;
  SELECT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'properties') INTO properties_exists;

  RAISE NOTICE '';
  RAISE NOTICE '📊 Vérification tables:';
  RAISE NOTICE '   documents: %', CASE WHEN documents_exists THEN '✅ Existe' ELSE '❌ N''existe pas' END;
  RAISE NOTICE '   invitations: %', CASE WHEN invitations_exists THEN '✅ Existe' ELSE '❌ N''existe pas' END;
  RAISE NOTICE '   irl_indices: %', CASE WHEN irl_indices_exists THEN '✅ Existe' ELSE '❌ N''existe pas' END;
  RAISE NOTICE '   lots_new: %', CASE WHEN lots_new_exists THEN '✅ Existe' ELSE '❌ N''existe pas' END;
  RAISE NOTICE '   properties: %', CASE WHEN properties_exists THEN '✅ Existe' ELSE '❌ N''existe pas' END;
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- 2. Analyser chaque table
-- ============================================================================

-- Table: irl_indices (probablement ancienne version de irl_history)
DO $$
DECLARE
  row_count INTEGER;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'irl_indices') THEN
    SELECT COUNT(*) INTO row_count FROM irl_indices;
    RAISE NOTICE '';
    RAISE NOTICE '📊 Table irl_indices:';
    RAISE NOTICE '   Lignes: %', row_count;

    IF row_count = 0 THEN
      RAISE NOTICE '   ⚠️  Table vide - Probablement obsolète';
      RAISE NOTICE '   💡 Suggestion: Supprimer si irl_history existe';
    ELSE
      RAISE NOTICE '   ✅ Table utilisée - Nécessite RLS';
    END IF;
  END IF;
END $$;

-- Table: properties (ancienne version de properties_new)
DO $$
DECLARE
  row_count INTEGER;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'properties') THEN
    SELECT COUNT(*) INTO row_count FROM properties;
    RAISE NOTICE '';
    RAISE NOTICE '📊 Table properties:';
    RAISE NOTICE '   Lignes: %', row_count;

    IF row_count = 0 THEN
      RAISE NOTICE '   ⚠️  Table vide - Probablement obsolète';
      RAISE NOTICE '   💡 Suggestion: Supprimer si properties_new existe';
    ELSE
      RAISE NOTICE '   ⚠️  ATTENTION: properties ET properties_new existent';
      RAISE NOTICE '   💡 Migration nécessaire: properties → properties_new';
    END IF;
  END IF;
END $$;

-- Table: lots_new (probablement en cours d'utilisation)
DO $$
DECLARE
  row_count INTEGER;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'lots_new') THEN
    SELECT COUNT(*) INTO row_count FROM lots_new;
    RAISE NOTICE '';
    RAISE NOTICE '📊 Table lots_new:';
    RAISE NOTICE '   Lignes: %', row_count;

    IF row_count > 0 THEN
      RAISE NOTICE '   🔴 CRITIQUE: Table utilisée SANS RLS !';
      RAISE NOTICE '   ⚠️  Données potentiellement exposées';
    END IF;
  END IF;
END $$;

-- Table: documents (probablement table générique documents)
DO $$
DECLARE
  row_count INTEGER;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'documents') THEN
    SELECT COUNT(*) INTO row_count FROM documents;
    RAISE NOTICE '';
    RAISE NOTICE '📊 Table documents:';
    RAISE NOTICE '   Lignes: %', row_count;

    IF row_count > 0 THEN
      RAISE NOTICE '   🔴 CRITIQUE: Documents SANS RLS !';
      RAISE NOTICE '   ⚠️  Documents potentiellement exposés';
    END IF;
  END IF;
END $$;

-- Table: invitations (probablement candidate_invitation_links)
DO $$
DECLARE
  row_count INTEGER;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'invitations') THEN
    SELECT COUNT(*) INTO row_count FROM invitations;
    RAISE NOTICE '';
    RAISE NOTICE '📊 Table invitations:';
    RAISE NOTICE '   Lignes: %', row_count;

    IF row_count > 0 THEN
      RAISE NOTICE '   ⚠️  Table utilisée - Vérifier si doublon avec candidate_invitation_links';
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 3. ACTIVER RLS sur les tables utilisées
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Activation RLS...';
  RAISE NOTICE '';
END $$;

-- Activer RLS sur documents (si existe et utilisée)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'documents') THEN
    ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS activé sur: documents';
  END IF;
END $$;

-- Activer RLS sur invitations (si existe et utilisée)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'invitations') THEN
    ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS activé sur: invitations';
  END IF;
END $$;

-- Activer RLS sur irl_indices (si existe et utilisée)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'irl_indices') THEN
    ALTER TABLE irl_indices ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS activé sur: irl_indices';
  END IF;
END $$;

-- Activer RLS sur lots_new (si existe - CRITIQUE)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'lots_new') THEN
    ALTER TABLE lots_new ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS activé sur: lots_new';
  END IF;
END $$;

-- Activer RLS sur properties (ancienne version)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'properties') THEN
    ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS activé sur: properties';
  END IF;
END $$;

-- ============================================================================
-- 4. Créer policies pour tables critiques
-- ============================================================================

-- ⚠️ IMPORTANT: Ces policies sont des PLACEHOLDERS
-- Elles doivent être adaptées selon la structure réelle des tables

-- POLICIES pour 'documents' (si table générique)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'documents') THEN
    RAISE NOTICE '';
    RAISE NOTICE '🔐 Création policies documents...';

    -- Vérifier la structure de la table
    -- Si elle a entity_id, property_id, lot_id, etc.

    -- Policy placeholder (à adapter selon colonnes réelles)
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their documents" ON documents';

    -- Cette policy suppose que documents a une colonne user_id ou entity_id
    -- À ADAPTER selon la structure réelle
    RAISE NOTICE '⚠️  ATTENTION: Policies documents nécessitent adaptation manuelle';
    RAISE NOTICE '   Vérifier colonnes: entity_id, property_id, lot_id, user_id';
  END IF;
END $$;

-- POLICIES pour 'lots_new' (si différent de 'lots')
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'lots_new') THEN
    RAISE NOTICE '';
    RAISE NOTICE '🔐 Création policies lots_new...';

    -- Copier les policies de 'lots' vers 'lots_new'
    -- Propriétaires peuvent voir leurs lots
    EXECUTE 'DROP POLICY IF EXISTS "Users can view lots of owned properties" ON lots_new';
    EXECUTE $body$
    CREATE POLICY "Users can view lots of owned properties"
    ON lots_new FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM properties_new p
        WHERE p.id = lots_new.property_id
          AND user_owns_property(p.id)
      )
    )
    $body$;

    EXECUTE 'DROP POLICY IF EXISTS "Users can insert lots into owned properties" ON lots_new';
    EXECUTE $body$
    CREATE POLICY "Users can insert lots into owned properties"
    ON lots_new FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM properties_new p
        WHERE p.id = property_id
          AND user_owns_property(p.id)
      )
    )
    $body$;

    EXECUTE 'DROP POLICY IF EXISTS "Users can update lots of owned properties" ON lots_new';
    EXECUTE $body$
    CREATE POLICY "Users can update lots of owned properties"
    ON lots_new FOR UPDATE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM properties_new p
        WHERE p.id = lots_new.property_id
          AND user_owns_property(p.id)
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM properties_new p
        WHERE p.id = property_id
          AND user_owns_property(p.id)
      )
    )
    $body$;

    EXECUTE 'DROP POLICY IF EXISTS "Users can delete lots of owned properties" ON lots_new';
    EXECUTE $body$
    CREATE POLICY "Users can delete lots of owned properties"
    ON lots_new FOR DELETE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM properties_new p
        WHERE p.id = lots_new.property_id
          AND user_owns_property(p.id)
      )
    )
    $body$;

    RAISE NOTICE '✅ 4 policies créées pour lots_new';
  END IF;
END $$;

-- POLICIES pour 'irl_indices' (lecture publique auth)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'irl_indices') THEN
    RAISE NOTICE '';
    RAISE NOTICE '🔐 Création policy irl_indices...';

    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can view IRL indices" ON irl_indices';
    EXECUTE $body$
    CREATE POLICY "Authenticated users can view IRL indices"
    ON irl_indices FOR SELECT
    TO authenticated
    USING (true)
    $body$;

    RAISE NOTICE '✅ Policy créée pour irl_indices';
  END IF;
END $$;

-- ============================================================================
-- 5. Vérification finale
-- ============================================================================

DO $$
DECLARE
  tables_without_rls INTEGER;
BEGIN
  SELECT COUNT(*) INTO tables_without_rls
  FROM pg_tables
  WHERE schemaname = 'public'
    AND rowsecurity = false;

  RAISE NOTICE '';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '🎉 FIX TERMINÉ !';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 État final:';
  RAISE NOTICE '   Tables sans RLS: %', tables_without_rls;
  RAISE NOTICE '';

  IF tables_without_rls = 0 THEN
    RAISE NOTICE '✅ TOUTES LES TABLES ONT RLS ACTIVÉ';
  ELSE
    RAISE NOTICE '⚠️  Certaines tables restent sans RLS';
    RAISE NOTICE '   (probablement tables obsolètes)';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '💡 ACTIONS RECOMMANDÉES:';
  RAISE NOTICE '   1. Vérifier la structure de la table documents';
  RAISE NOTICE '   2. Adapter les policies selon les colonnes réelles';
  RAISE NOTICE '   3. Supprimer les tables obsolètes (properties, irl_indices)';
  RAISE NOTICE '   4. Migrer lots_new → lots si nécessaire';
  RAISE NOTICE '';
END $$;

-- Afficher les tables restant sans RLS
SELECT
  tablename AS "Table Sans RLS (si applicable)"
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false
ORDER BY tablename;
