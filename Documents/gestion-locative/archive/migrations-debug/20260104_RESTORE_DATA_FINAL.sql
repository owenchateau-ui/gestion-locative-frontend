-- ============================================================================
-- RESTAURATION DONNÉES - Compatible avec RLS correct
-- ============================================================================
-- Date: 2026-01-04
-- User: owen.chateau@gmail.com
-- Auth UID: (votre Supabase auth.uid())
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🚨 RESTAURATION DONNÉES - owen.chateau@gmail.com';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- ÉTAPE 1: Vérifier/Créer l'entrée dans users
-- ============================================================================

DO $$
DECLARE
  my_email TEXT := 'owen.chateau@gmail.com';
  my_auth_uid UUID;
  my_app_user_id UUID;
  entities_updated INTEGER;
  properties_updated INTEGER;
  lots_updated INTEGER;
  tenants_updated INTEGER;
  leases_updated INTEGER;
  payments_updated INTEGER;
BEGIN
  -- Récupérer l'auth.uid() actuel (si connecté via SQL Editor)
  my_auth_uid := auth.uid();

  IF my_auth_uid IS NULL THEN
    RAISE NOTICE '⚠️  Vous n''êtes pas connecté. Utilisation de l''email pour trouver l''utilisateur.';

    -- Trouver l'utilisateur par email
    SELECT id, supabase_uid INTO my_app_user_id, my_auth_uid
    FROM users
    WHERE email = my_email;

    IF my_app_user_id IS NULL THEN
      RAISE EXCEPTION 'Utilisateur avec email % non trouvé dans la table users', my_email;
    END IF;
  ELSE
    -- Connecté : vérifier si l'entrée users existe
    SELECT id INTO my_app_user_id
    FROM users
    WHERE supabase_uid = my_auth_uid;

    IF my_app_user_id IS NULL THEN
      -- Créer l'entrée users
      INSERT INTO users (supabase_uid, email, first_name, last_name)
      VALUES (my_auth_uid, my_email, 'Owen', 'Chateau')
      RETURNING id INTO my_app_user_id;

      RAISE NOTICE '✅ Entrée users créée: %', my_app_user_id;
    ELSE
      RAISE NOTICE '✅ Entrée users existante: %', my_app_user_id;
    END IF;
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '👤 Email: %', my_email;
  RAISE NOTICE '🔑 Auth UID: %', my_auth_uid;
  RAISE NOTICE '🆔 App User ID: %', my_app_user_id;
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Mise à jour des données...';
  RAISE NOTICE '';

  -- ============================================================================
  -- ÉTAPE 2: Mettre à jour les entités
  -- ============================================================================

  UPDATE entities
  SET user_id = my_app_user_id
  WHERE user_id IS NULL OR user_id != my_app_user_id;

  GET DIAGNOSTICS entities_updated = ROW_COUNT;
  RAISE NOTICE '✅ Entités reliées: %', entities_updated;

  -- ============================================================================
  -- ÉTAPE 3: Mettre à jour les propriétés
  -- ============================================================================

  WITH first_entity AS (
    SELECT id FROM entities WHERE user_id = my_app_user_id LIMIT 1
  )
  UPDATE properties_new
  SET entity_id = (SELECT id FROM first_entity)
  WHERE entity_id IS NULL
     OR entity_id NOT IN (SELECT id FROM entities WHERE user_id = my_app_user_id);

  GET DIAGNOSTICS properties_updated = ROW_COUNT;
  RAISE NOTICE '✅ Propriétés reliées: %', properties_updated;

  -- ============================================================================
  -- ÉTAPE 4: Mettre à jour les lots
  -- ============================================================================

  WITH valid_properties AS (
    SELECT p.id
    FROM properties_new p
    JOIN entities e ON p.entity_id = e.id
    WHERE e.user_id = my_app_user_id
  ),
  first_property AS (
    SELECT id FROM valid_properties LIMIT 1
  )
  UPDATE lots
  SET property_id = (SELECT id FROM first_property)
  WHERE property_id IS NULL
     OR property_id NOT IN (SELECT id FROM valid_properties);

  GET DIAGNOSTICS lots_updated = ROW_COUNT;
  RAISE NOTICE '✅ Lots reliés: %', lots_updated;

  -- ============================================================================
  -- ÉTAPE 5: Mettre à jour les locataires
  -- ============================================================================

  WITH first_entity AS (
    SELECT id FROM entities WHERE user_id = my_app_user_id LIMIT 1
  )
  UPDATE tenants
  SET entity_id = (SELECT id FROM first_entity),
      user_id = my_app_user_id
  WHERE entity_id IS NULL
     OR user_id IS NULL
     OR entity_id NOT IN (SELECT id FROM entities WHERE user_id = my_app_user_id);

  GET DIAGNOSTICS tenants_updated = ROW_COUNT;
  RAISE NOTICE '✅ Locataires reliés: %', tenants_updated;

  -- ============================================================================
  -- ÉTAPE 6: Mettre à jour les baux
  -- ============================================================================

  WITH valid_lots AS (
    SELECT l.id
    FROM lots l
    JOIN properties_new p ON l.property_id = p.id
    JOIN entities e ON p.entity_id = e.id
    WHERE e.user_id = my_app_user_id
  ),
  first_lot AS (
    SELECT id FROM valid_lots LIMIT 1
  )
  UPDATE leases
  SET lot_id = (SELECT id FROM first_lot)
  WHERE lot_id IS NULL
     OR lot_id NOT IN (SELECT id FROM valid_lots);

  GET DIAGNOSTICS leases_updated = ROW_COUNT;
  RAISE NOTICE '✅ Baux reliés: %', leases_updated;

  -- ============================================================================
  -- ÉTAPE 7: Mettre à jour les paiements
  -- ============================================================================

  WITH valid_leases AS (
    SELECT ls.id
    FROM leases ls
    JOIN lots l ON ls.lot_id = l.id
    JOIN properties_new p ON l.property_id = p.id
    JOIN entities e ON p.entity_id = e.id
    WHERE e.user_id = my_app_user_id
  )
  UPDATE payments
  SET lease_id = COALESCE(
    (SELECT id FROM valid_leases WHERE id = payments.lease_id),
    (SELECT id FROM valid_leases LIMIT 1)
  )
  WHERE lease_id IS NULL
     OR lease_id NOT IN (SELECT id FROM valid_leases);

  GET DIAGNOSTICS payments_updated = ROW_COUNT;
  RAISE NOTICE '✅ Paiements reliés: %', payments_updated;

  -- ============================================================================
  -- RÉSUMÉ
  -- ============================================================================

  RAISE NOTICE '';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '🎉 RESTAURATION TERMINÉE !';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Résumé:';
  RAISE NOTICE '   ✅ Entités: %', entities_updated;
  RAISE NOTICE '   ✅ Propriétés: %', properties_updated;
  RAISE NOTICE '   ✅ Lots: %', lots_updated;
  RAISE NOTICE '   ✅ Locataires: %', tenants_updated;
  RAISE NOTICE '   ✅ Baux: %', leases_updated;
  RAISE NOTICE '   ✅ Paiements: %', payments_updated;
  RAISE NOTICE '';
  RAISE NOTICE '💡 PROCHAINES ÉTAPES:';
  RAISE NOTICE '   1. Actualisez votre application (F5)';
  RAISE NOTICE '   2. Toutes vos données devraient être visibles';
  RAISE NOTICE '   3. Le RLS protège maintenant vos données correctement';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- VÉRIFICATION POST-RESTAURATION
-- ============================================================================

DO $$
DECLARE
  my_email TEXT := 'owen.chateau@gmail.com';
  my_app_user_id UUID;
BEGIN
  SELECT id INTO my_app_user_id FROM users WHERE email = my_email;

  RAISE NOTICE '';
  RAISE NOTICE '📊 VÉRIFICATION';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Vérification terminée - Consultez les résultats ci-dessous';
  RAISE NOTICE '';
END $$;

-- Afficher les comptes par table
SELECT
  'Entités' AS "Table",
  COUNT(*) AS "Nombre"
FROM entities e
JOIN users u ON e.user_id = u.id
WHERE u.email = 'owen.chateau@gmail.com'

UNION ALL

SELECT
  'Propriétés',
  COUNT(*)
FROM properties_new p
JOIN entities e ON p.entity_id = e.id
JOIN users u ON e.user_id = u.id
WHERE u.email = 'owen.chateau@gmail.com'

UNION ALL

SELECT
  'Lots',
  COUNT(*)
FROM lots l
JOIN properties_new p ON l.property_id = p.id
JOIN entities e ON p.entity_id = e.id
JOIN users u ON e.user_id = u.id
WHERE u.email = 'owen.chateau@gmail.com'

UNION ALL

SELECT
  'Locataires',
  COUNT(*)
FROM tenants t
JOIN entities e ON t.entity_id = e.id
JOIN users u ON e.user_id = u.id
WHERE u.email = 'owen.chateau@gmail.com'

UNION ALL

SELECT
  'Baux',
  COUNT(*)
FROM leases ls
JOIN lots l ON ls.lot_id = l.id
JOIN properties_new p ON l.property_id = p.id
JOIN entities e ON p.entity_id = e.id
JOIN users u ON e.user_id = u.id
WHERE u.email = 'owen.chateau@gmail.com'

UNION ALL

SELECT
  'Paiements',
  COUNT(*)
FROM payments pm
JOIN leases ls ON pm.lease_id = ls.id
JOIN lots l ON ls.lot_id = l.id
JOIN properties_new p ON l.property_id = p.id
JOIN entities e ON p.entity_id = e.id
JOIN users u ON e.user_id = u.id
WHERE u.email = 'owen.chateau@gmail.com';
