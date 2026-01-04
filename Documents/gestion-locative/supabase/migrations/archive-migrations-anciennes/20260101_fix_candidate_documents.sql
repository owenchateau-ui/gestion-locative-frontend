-- ============================================================================
-- FIX: Ajouter les colonnes manquantes à candidate_documents
-- ============================================================================
-- Date: 2026-01-01
-- Problème: PGRST204 - Could not find 'file_path' column
-- Solution: Ajouter file_path et file_url si elles n'existent pas
-- ============================================================================

-- 1. Ajouter file_url si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'candidate_documents'
        AND column_name = 'file_url'
    ) THEN
        ALTER TABLE candidate_documents ADD COLUMN file_url VARCHAR(500);
        RAISE NOTICE '✅ Colonne file_url ajoutée';
    ELSE
        RAISE NOTICE 'ℹ️  Colonne file_url existe déjà';
    END IF;
END $$;

-- 2. Ajouter file_path si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'candidate_documents'
        AND column_name = 'file_path'
    ) THEN
        ALTER TABLE candidate_documents ADD COLUMN file_path VARCHAR(500);
        RAISE NOTICE '✅ Colonne file_path ajoutée';
    ELSE
        RAISE NOTICE 'ℹ️  Colonne file_path existe déjà';
    END IF;
END $$;

-- 3. Ajouter mime_type si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'candidate_documents'
        AND column_name = 'mime_type'
    ) THEN
        ALTER TABLE candidate_documents ADD COLUMN mime_type VARCHAR(100);
        RAISE NOTICE '✅ Colonne mime_type ajoutée';
    ELSE
        RAISE NOTICE 'ℹ️  Colonne mime_type existe déjà';
    END IF;
END $$;

-- 4. Vérifier la structure finale
DO $$
DECLARE
    col_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO col_count
    FROM information_schema.columns
    WHERE table_name = 'candidate_documents';

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'STRUCTURE FINALE DE candidate_documents';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Nombre de colonnes: %', col_count;
    RAISE NOTICE '';
END $$;

-- 5. Lister toutes les colonnes
SELECT
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'candidate_documents'
ORDER BY ordinal_position;
