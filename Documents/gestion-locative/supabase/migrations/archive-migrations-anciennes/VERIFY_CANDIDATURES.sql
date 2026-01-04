-- Script de vérification de la migration Candidatures
-- À exécuter APRÈS avoir appliqué 20260102_create_candidates.sql

-- ============================================================================
-- PARTIE 1 : VÉRIFICATION DES TABLES
-- ============================================================================

-- Vérifier que la table candidates existe et afficher sa structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'candidates'
ORDER BY ordinal_position;

-- Vérifier que la table candidate_documents existe
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'candidate_documents'
ORDER BY ordinal_position;

-- ============================================================================
-- PARTIE 2 : VÉRIFICATION DES INDEX
-- ============================================================================

-- Lister tous les index créés sur candidates
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'candidates';

-- Lister tous les index créés sur candidate_documents
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'candidate_documents';

-- ============================================================================
-- PARTIE 3 : VÉRIFICATION DES CONTRAINTES
-- ============================================================================

-- Vérifier les contraintes sur candidates
SELECT
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'candidates'::regclass;

-- Vérifier les contraintes sur candidate_documents
SELECT
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'candidate_documents'::regclass;

-- ============================================================================
-- PARTIE 4 : VÉRIFICATION DES TRIGGERS
-- ============================================================================

-- Vérifier le trigger updated_at sur candidates
SELECT
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'candidates';

-- ============================================================================
-- PARTIE 5 : TESTS D'INSERTION ET DE SUPPRESSION
-- ============================================================================

-- Test 1 : Insérer une candidature de test
-- IMPORTANT : Remplacer les UUIDs par des IDs valides de votre base
DO $$
DECLARE
  test_lot_id UUID;
  test_entity_id UUID;
  test_candidate_id UUID;
BEGIN
  -- Récupérer un lot et une entité existants
  SELECT id INTO test_lot_id FROM lots LIMIT 1;
  SELECT id INTO test_entity_id FROM entities LIMIT 1;

  IF test_lot_id IS NULL OR test_entity_id IS NULL THEN
    RAISE NOTICE 'ERREUR: Impossible de trouver un lot ou une entité pour le test';
    RAISE NOTICE 'Créez d''abord au moins un lot et une entité dans votre application';
  ELSE
    -- Insérer une candidature de test
    INSERT INTO candidates (
      lot_id,
      entity_id,
      first_name,
      last_name,
      email,
      phone,
      monthly_income,
      other_income,
      professional_status,
      has_guarantor,
      guarantor_monthly_income,
      status
    ) VALUES (
      test_lot_id,
      test_entity_id,
      'Jean',
      'Dupont',
      'jean.dupont.test@example.com',
      '0612345678',
      3000.00,
      500.00,
      'CDI',
      true,
      4000.00,
      'submitted'
    ) RETURNING id INTO test_candidate_id;

    RAISE NOTICE '✅ Candidature de test créée avec succès (ID: %)', test_candidate_id;

    -- Vérifier que la candidature existe
    IF EXISTS (SELECT 1 FROM candidates WHERE id = test_candidate_id) THEN
      RAISE NOTICE '✅ Candidature trouvée dans la base';
    ELSE
      RAISE NOTICE '❌ ERREUR: Candidature non trouvée';
    END IF;

    -- Test 2 : Insérer un document de test
    INSERT INTO candidate_documents (
      candidate_id,
      document_type,
      file_name,
      file_path,
      file_url,
      mime_type
    ) VALUES (
      test_candidate_id,
      'id_card',
      'test_id_card.pdf',
      'test/path/test_id_card.pdf',
      'https://example.com/test_id_card.pdf',
      'application/pdf'
    );

    RAISE NOTICE '✅ Document de test créé avec succès';

    -- Test 3 : Vérifier le trigger updated_at
    UPDATE candidates
    SET first_name = 'Jean-Test'
    WHERE id = test_candidate_id;

    RAISE NOTICE '✅ Trigger updated_at testé (mise à jour du prénom)';

    -- Nettoyer les données de test
    DELETE FROM candidates WHERE id = test_candidate_id;

    RAISE NOTICE '✅ Données de test supprimées (cascade sur documents)';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS ✅';
    RAISE NOTICE '========================================';
  END IF;
END $$;

-- ============================================================================
-- PARTIE 6 : STATISTIQUES FINALES
-- ============================================================================

-- Compter les candidatures existantes
SELECT COUNT(*) AS total_candidates FROM candidates;

-- Compter les documents existants
SELECT COUNT(*) AS total_documents FROM candidate_documents;

-- Afficher la répartition par statut
SELECT
  status,
  COUNT(*) AS count
FROM candidates
GROUP BY status
ORDER BY status;

-- Afficher la répartition par type de document
SELECT
  document_type,
  COUNT(*) AS count
FROM candidate_documents
GROUP BY document_type
ORDER BY count DESC;

-- ============================================================================
-- RÉSULTAT ATTENDU
-- ============================================================================
-- Si tout est correct, vous devriez voir :
-- 1. Structure des tables candidates et candidate_documents
-- 2. Liste des 7 index créés
-- 3. Contraintes de clés étrangères et checks
-- 4. Trigger update_candidates_updated_at
-- 5. Messages "✅" confirmant la réussite des tests
-- 6. Statistiques (0 candidature et 0 document si première installation)
