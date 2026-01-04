-- ============================================================================
-- FIX: Colonnes NULLABLE dans table tenants - VERSION DASHBOARD
-- Date: 2026-01-03
-- Problème: entity_id et user_id sont NULLABLE (risque sécurité RLS)
-- Solution: Les rendre NOT NULL après nettoyage données
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔧 CORRECTION: Colonnes NULLABLE dans tenants';
  RAISE NOTICE '================================================';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- ÉTAPE 1: Vérifier les données NULL existantes
-- ============================================================================

DO $$
DECLARE
  tenants_without_entity INTEGER;
  tenants_without_user INTEGER;
BEGIN
  -- Compter les tenants sans entity_id
  SELECT COUNT(*) INTO tenants_without_entity
  FROM tenants
  WHERE entity_id IS NULL;

  -- Compter les tenants sans user_id
  SELECT COUNT(*) INTO tenants_without_user
  FROM tenants
  WHERE user_id IS NULL;

  RAISE NOTICE '📊 État actuel:';
  RAISE NOTICE '  - Tenants sans entity_id: %', tenants_without_entity;
  RAISE NOTICE '  - Tenants sans user_id: %', tenants_without_user;
  RAISE NOTICE '';

  IF tenants_without_entity > 0 OR tenants_without_user > 0 THEN
    RAISE NOTICE '⚠️  ATTENTION: Des données NULL existent !';
    RAISE NOTICE '   Ces lignes seront SUPPRIMÉES pour garantir la sécurité.';
    RAISE NOTICE '';
  END IF;
END $$;

-- ============================================================================
-- ÉTAPE 2: Supprimer les tenants orphelins (si existants)
-- ============================================================================

DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Supprimer les tenants sans entity_id OU sans user_id
  WITH deleted AS (
    DELETE FROM tenants
    WHERE entity_id IS NULL OR user_id IS NULL
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;

  IF deleted_count > 0 THEN
    RAISE NOTICE '🗑️  Suppression tenants orphelins: % lignes', deleted_count;
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '✅ Aucun tenant orphelin à supprimer';
    RAISE NOTICE '';
  END IF;
END $$;

-- ============================================================================
-- ÉTAPE 3: Rendre les colonnes NOT NULL
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '🔒 Application contraintes NOT NULL...';

  -- entity_id NOT NULL
  ALTER TABLE tenants ALTER COLUMN entity_id SET NOT NULL;
  RAISE NOTICE '  ✅ tenants.entity_id → NOT NULL';

  -- user_id NOT NULL (si la colonne existe)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tenants' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE tenants ALTER COLUMN user_id SET NOT NULL;
    RAISE NOTICE '  ✅ tenants.user_id → NOT NULL';
  END IF;

  RAISE NOTICE '';
END $$;

-- ============================================================================
-- ÉTAPE 4: Vérification finale
-- ============================================================================

DO $$
DECLARE
  entity_id_nullable TEXT;
  user_id_nullable TEXT;
BEGIN
  -- Vérifier entity_id
  SELECT is_nullable INTO entity_id_nullable
  FROM information_schema.columns
  WHERE table_name = 'tenants' AND column_name = 'entity_id';

  -- Vérifier user_id
  SELECT is_nullable INTO user_id_nullable
  FROM information_schema.columns
  WHERE table_name = 'tenants' AND column_name = 'user_id';

  RAISE NOTICE '✅ VÉRIFICATION FINALE:';
  RAISE NOTICE '  - tenants.entity_id: %',
    CASE WHEN entity_id_nullable = 'NO' THEN 'NOT NULL ✅' ELSE 'NULLABLE ❌' END;
  RAISE NOTICE '  - tenants.user_id: %',
    CASE WHEN user_id_nullable = 'NO' THEN 'NOT NULL ✅' ELSE 'NULLABLE ❌' END;
  RAISE NOTICE '';

  IF entity_id_nullable = 'NO' AND user_id_nullable = 'NO' THEN
    RAISE NOTICE '🎉 SUCCÈS: Toutes les colonnes sont NOT NULL !';
    RAISE NOTICE '    La sécurité RLS est maintenant garantie.';
  ELSE
    RAISE WARNING '❌ ÉCHEC: Certaines colonnes sont encore NULLABLE';
    RAISE WARNING '   Vérifiez qu''il n''y a pas de données NULL restantes.';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '================================================';
END $$;
