-- ============================================================================
-- FIX URGENCE: Relier les données existantes au bon utilisateur
-- Date: 2026-01-03
-- Problème: Données existantes non visibles après activation RLS
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🚨 FIX URGENCE: Restauration accès données';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- ÉTAPE 1: Identifier votre utilisateur
-- ============================================================================

DO $$
DECLARE
  current_user_id UUID;
  current_user_email TEXT;
BEGIN
  -- Récupérer l'ID utilisateur actuel (celui qui exécute ce script)
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE NOTICE '⚠️  ATTENTION: Vous devez exécuter ce script en étant connecté';
    RAISE NOTICE '   Ce script doit être exécuté via l''application, pas via SQL Editor';
    RAISE NOTICE '';
    RAISE NOTICE '💡 Solution alternative ci-dessous...';
  ELSE
    SELECT email INTO current_user_email FROM auth.users WHERE id = current_user_id;
    RAISE NOTICE '✅ Utilisateur connecté:';
    RAISE NOTICE '   ID: %', current_user_id;
    RAISE NOTICE '   Email: %', current_user_email;
  END IF;

  RAISE NOTICE '';
END $$;

-- ============================================================================
-- ÉTAPE 2: SOLUTION MANUELLE - Lister tous les utilisateurs
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '📊 Liste des utilisateurs auth:';
  RAISE NOTICE '----------------------------------------';
END $$;

SELECT
  id AS "User ID",
  email AS "Email",
  created_at AS "Créé le"
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '💡 ÉTAPE SUIVANTE:';
  RAISE NOTICE '   1. Repérer votre email dans la liste ci-dessus';
  RAISE NOTICE '   2. Copier votre User ID';
  RAISE NOTICE '   3. Remplacer YOUR_USER_ID ci-dessous par votre ID';
  RAISE NOTICE '   4. Exécuter les commandes UPDATE';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- ÉTAPE 3: MISE À JOUR - À PERSONNALISER
-- ============================================================================

-- ⚠️ IMPORTANT: Remplacez 'YOUR_USER_ID' par votre vrai ID (copié ci-dessus)
-- Exemple: '123e4567-e89b-12d3-a456-426614174000'

-- Décommenter et personnaliser ces lignes:

/*
-- Votre User ID (à remplacer)
DO $$
DECLARE
  my_user_id UUID := 'YOUR_USER_ID'; -- ⚠️ REMPLACER ICI
  entities_updated INTEGER;
  properties_updated INTEGER;
  lots_updated INTEGER;
  tenants_updated INTEGER;
  leases_updated INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Mise à jour des données...';
  RAISE NOTICE '';

  -- 1. Créer/Mettre à jour l'entrée users
  INSERT INTO users (id, email)
  SELECT id, email FROM auth.users WHERE id = my_user_id
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE '✅ Entrée users créée/vérifiée';

  -- 2. Mettre à jour les entités
  UPDATE entities
  SET user_id = my_user_id
  WHERE user_id IS NULL OR user_id != my_user_id;

  GET DIAGNOSTICS entities_updated = ROW_COUNT;
  RAISE NOTICE '✅ Entités mises à jour: %', entities_updated;

  -- 3. Mettre à jour les propriétés via leurs entités
  WITH entity_ids AS (
    SELECT id FROM entities WHERE user_id = my_user_id
  )
  UPDATE properties_new
  SET entity_id = (SELECT id FROM entity_ids LIMIT 1)
  WHERE entity_id IS NULL
    OR entity_id NOT IN (SELECT id FROM entity_ids);

  GET DIAGNOSTICS properties_updated = ROW_COUNT;
  RAISE NOTICE '✅ Propriétés mises à jour: %', properties_updated;

  -- 4. Mettre à jour les lots via leurs propriétés
  WITH property_ids AS (
    SELECT p.id
    FROM properties_new p
    JOIN entities e ON p.entity_id = e.id
    WHERE e.user_id = my_user_id
  )
  UPDATE lots
  SET property_id = (SELECT id FROM property_ids LIMIT 1)
  WHERE property_id IS NULL
    OR property_id NOT IN (SELECT id FROM property_ids);

  GET DIAGNOSTICS lots_updated = ROW_COUNT;
  RAISE NOTICE '✅ Lots mis à jour: %', lots_updated;

  -- 5. Mettre à jour les locataires
  WITH entity_ids AS (
    SELECT id FROM entities WHERE user_id = my_user_id
  )
  UPDATE tenants
  SET entity_id = (SELECT id FROM entity_ids LIMIT 1),
      user_id = my_user_id
  WHERE entity_id IS NULL OR user_id IS NULL;

  GET DIAGNOSTICS tenants_updated = ROW_COUNT;
  RAISE NOTICE '✅ Locataires mis à jour: %', tenants_updated;

  -- 6. Mettre à jour les baux
  WITH lot_ids AS (
    SELECT l.id
    FROM lots l
    JOIN properties_new p ON l.property_id = p.id
    JOIN entities e ON p.entity_id = e.id
    WHERE e.user_id = my_user_id
  )
  UPDATE leases
  SET lot_id = (SELECT id FROM lot_ids LIMIT 1)
  WHERE lot_id IS NULL
    OR lot_id NOT IN (SELECT id FROM lot_ids);

  GET DIAGNOSTICS leases_updated = ROW_COUNT;
  RAISE NOTICE '✅ Baux mis à jour: %', leases_updated;

  RAISE NOTICE '';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '🎉 RESTAURATION TERMINÉE !';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Résumé:';
  RAISE NOTICE '   - Entités: % mises à jour', entities_updated;
  RAISE NOTICE '   - Propriétés: % mises à jour', properties_updated;
  RAISE NOTICE '   - Lots: % mis à jour', lots_updated;
  RAISE NOTICE '   - Locataires: % mis à jour', tenants_updated;
  RAISE NOTICE '   - Baux: % mis à jour', leases_updated;
  RAISE NOTICE '';
  RAISE NOTICE '✅ Vous devriez maintenant voir toutes vos données !';
  RAISE NOTICE '';
END $$;
*/

-- ============================================================================
-- NOTES IMPORTANTES
-- ============================================================================

/*
📝 PROCÉDURE:

1. Exécutez ce script UNE PREMIÈRE FOIS pour voir la liste des utilisateurs
2. Repérez votre email et copiez votre User ID
3. Décommentez le bloc ci-dessus (enlever les /* et */)
4. Remplacez 'YOUR_USER_ID' par votre vrai ID
5. Exécutez à nouveau le script

⚠️ SÉCURITÉ:
Ce script lie TOUTES les données orphelines au User ID spécifié.
Assurez-vous d'utiliser le BON User ID (le vôtre).

✅ APRÈS L'EXÉCUTION:
- Actualisez votre application
- Toutes vos données devraient être de retour
- Le RLS continuera de protéger vos données
*/
