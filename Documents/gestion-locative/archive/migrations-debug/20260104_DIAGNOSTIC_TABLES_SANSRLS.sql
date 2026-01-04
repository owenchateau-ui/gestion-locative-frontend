-- ============================================================================
-- DIAGNOSTIC RAPIDE - Tables Sans RLS
-- ============================================================================
-- Date: 2026-01-04
-- Objectif: Identifier quelles tables sans RLS sont utilisées
-- ============================================================================

-- 1. Compter lignes dans 'documents'
DO $$
DECLARE
  row_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO row_count FROM documents;
  RAISE NOTICE '📊 documents: % lignes', row_count;
END $$;

-- 2. Compter lignes dans 'invitations'
DO $$
DECLARE
  row_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO row_count FROM invitations;
  RAISE NOTICE '📊 invitations: % lignes', row_count;
END $$;

-- 3. Compter lignes dans 'irl_indices'
DO $$
DECLARE
  row_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO row_count FROM irl_indices;
  RAISE NOTICE '📊 irl_indices: % lignes', row_count;
END $$;

-- 4. Compter lignes dans 'lots_new'
DO $$
DECLARE
  row_count BIGINT;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'lots_new') THEN
    SELECT COUNT(*) INTO row_count FROM lots_new;
    RAISE NOTICE '📊 lots_new: % lignes', row_count;
  ELSE
    RAISE NOTICE '⚠️  lots_new: n''existe pas';
  END IF;
END $$;

-- 5. Compter lignes dans 'properties'
DO $$
DECLARE
  row_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO row_count FROM properties;
  RAISE NOTICE '📊 properties: % lignes', row_count;
END $$;

-- 6. Comparer avec tables principales
DO $$
DECLARE
  lots_count BIGINT;
  properties_new_count BIGINT;
  candidate_links_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO lots_count FROM lots;
  SELECT COUNT(*) INTO properties_new_count FROM properties_new;
  SELECT COUNT(*) INTO candidate_links_count FROM candidate_invitation_links;

  RAISE NOTICE '';
  RAISE NOTICE '📊 COMPARAISON AVEC TABLES PRINCIPALES:';
  RAISE NOTICE '   lots: % lignes', lots_count;
  RAISE NOTICE '   properties_new: % lignes', properties_new_count;
  RAISE NOTICE '   candidate_invitation_links: % lignes', candidate_links_count;
  RAISE NOTICE '';
END $$;

-- 7. Afficher structure de 'documents'
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📋 STRUCTURE TABLE DOCUMENTS:';
  RAISE NOTICE '';
END $$;

SELECT
  column_name AS "Colonne",
  data_type AS "Type",
  is_nullable AS "Nullable"
FROM information_schema.columns
WHERE table_name = 'documents'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. Résumé
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '📊 RÉSUMÉ DIAGNOSTIC';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
  RAISE NOTICE '💡 Prochaine action:';
  RAISE NOTICE '   Communiquer ces résultats pour adapter le script de fix';
  RAISE NOTICE '';
END $$;
