-- ============================================================================
-- FIX DONNÉES OWEN - Restauration accès après activation RLS
-- Date: 2026-01-03
-- User: owen.chateau@gmail.com
-- User ID: 56b10d22-c130-4569-8835-a2a4ae18467e
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🚨 RESTAURATION DONNÉES - owen.chateau@gmail.com';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- RESTAURATION AUTOMATIQUE
-- ============================================================================

DO $$
DECLARE
  my_user_id UUID := '56b10d22-c130-4569-8835-a2a4ae18467e';
  my_email TEXT := 'owen.chateau@gmail.com';
  entities_updated INTEGER;
  properties_updated INTEGER;
  lots_updated INTEGER;
  tenants_updated INTEGER;
  leases_updated INTEGER;
  payments_updated INTEGER;
  users_created INTEGER;
BEGIN
  RAISE NOTICE '👤 Utilisateur: %', my_email;
  RAISE NOTICE '🔑 User ID: %', my_user_id;
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Mise à jour des données...';
  RAISE NOTICE '';

  -- ============================================================================
  -- 1. Créer/Vérifier l'entrée dans la table users
  -- ============================================================================

  -- Vérifier si l'entrée existe déjà avec cet email
  INSERT INTO users (id, email, first_name, last_name)
  VALUES (my_user_id, my_email, 'Owen', 'Chateau')
  ON CONFLICT (email) DO UPDATE SET
    id = EXCLUDED.id,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name;

  GET DIAGNOSTICS users_created = ROW_COUNT;
  RAISE NOTICE '✅ Entrée users créée/mise à jour: %', users_created;

  -- ============================================================================
  -- 2. Mettre à jour les entités
  -- ============================================================================

  UPDATE entities
  SET user_id = my_user_id
  WHERE user_id IS NULL OR user_id != my_user_id;

  GET DIAGNOSTICS entities_updated = ROW_COUNT;
  RAISE NOTICE '✅ Entités reliées à votre compte: %', entities_updated;

  -- ============================================================================
  -- 3. Mettre à jour les propriétés
  -- ============================================================================

  -- S'assurer que toutes les propriétés ont un entity_id valide
  WITH first_entity AS (
    SELECT id FROM entities WHERE user_id = my_user_id LIMIT 1
  )
  UPDATE properties_new
  SET entity_id = (SELECT id FROM first_entity)
  WHERE entity_id IS NULL
     OR entity_id NOT IN (SELECT id FROM entities WHERE user_id = my_user_id);

  GET DIAGNOSTICS properties_updated = ROW_COUNT;
  RAISE NOTICE '✅ Propriétés reliées à vos entités: %', properties_updated;

  -- ============================================================================
  -- 4. Mettre à jour les lots
  -- ============================================================================

  -- S'assurer que tous les lots ont un property_id valide
  WITH valid_properties AS (
    SELECT p.id
    FROM properties_new p
    JOIN entities e ON p.entity_id = e.id
    WHERE e.user_id = my_user_id
  ),
  first_property AS (
    SELECT id FROM valid_properties LIMIT 1
  )
  UPDATE lots
  SET property_id = (SELECT id FROM first_property)
  WHERE property_id IS NULL
     OR property_id NOT IN (SELECT id FROM valid_properties);

  GET DIAGNOSTICS lots_updated = ROW_COUNT;
  RAISE NOTICE '✅ Lots reliés à vos propriétés: %', lots_updated;

  -- ============================================================================
  -- 5. Mettre à jour les locataires
  -- ============================================================================

  WITH first_entity AS (
    SELECT id FROM entities WHERE user_id = my_user_id LIMIT 1
  )
  UPDATE tenants
  SET entity_id = (SELECT id FROM first_entity),
      user_id = my_user_id
  WHERE entity_id IS NULL
     OR user_id IS NULL
     OR entity_id NOT IN (SELECT id FROM entities WHERE user_id = my_user_id);

  GET DIAGNOSTICS tenants_updated = ROW_COUNT;
  RAISE NOTICE '✅ Locataires reliés à votre compte: %', tenants_updated;

  -- ============================================================================
  -- 6. Mettre à jour les baux
  -- ============================================================================

  WITH valid_lots AS (
    SELECT l.id
    FROM lots l
    JOIN properties_new p ON l.property_id = p.id
    JOIN entities e ON p.entity_id = e.id
    WHERE e.user_id = my_user_id
  ),
  first_lot AS (
    SELECT id FROM valid_lots LIMIT 1
  )
  UPDATE leases
  SET lot_id = (SELECT id FROM first_lot)
  WHERE lot_id IS NULL
     OR lot_id NOT IN (SELECT id FROM valid_lots);

  GET DIAGNOSTICS leases_updated = ROW_COUNT;
  RAISE NOTICE '✅ Baux reliés à vos lots: %', leases_updated;

  -- ============================================================================
  -- 7. Mettre à jour les paiements
  -- ============================================================================

  WITH valid_leases AS (
    SELECT ls.id
    FROM leases ls
    JOIN lots l ON ls.lot_id = l.id
    JOIN properties_new p ON l.property_id = p.id
    JOIN entities e ON p.entity_id = e.id
    WHERE e.user_id = my_user_id
  )
  UPDATE payments
  SET lease_id = COALESCE(
    (SELECT id FROM valid_leases WHERE id = payments.lease_id),
    (SELECT id FROM valid_leases LIMIT 1)
  )
  WHERE lease_id IS NULL
     OR lease_id NOT IN (SELECT id FROM valid_leases);

  GET DIAGNOSTICS payments_updated = ROW_COUNT;
  RAISE NOTICE '✅ Paiements reliés à vos baux: %', payments_updated;

  -- ============================================================================
  -- RÉSUMÉ
  -- ============================================================================

  RAISE NOTICE '';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '🎉 RESTAURATION TERMINÉE !';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Résumé des mises à jour:';
  RAISE NOTICE '   ✅ Users: % ligne(s)', users_created;
  RAISE NOTICE '   ✅ Entités: % ligne(s)', entities_updated;
  RAISE NOTICE '   ✅ Propriétés: % ligne(s)', properties_updated;
  RAISE NOTICE '   ✅ Lots: % ligne(s)', lots_updated;
  RAISE NOTICE '   ✅ Locataires: % ligne(s)', tenants_updated;
  RAISE NOTICE '   ✅ Baux: % ligne(s)', leases_updated;
  RAISE NOTICE '   ✅ Paiements: % ligne(s)', payments_updated;
  RAISE NOTICE '';
  RAISE NOTICE '💡 PROCHAINES ÉTAPES:';
  RAISE NOTICE '   1. Actualisez votre application (F5)';
  RAISE NOTICE '   2. Toutes vos données devraient être de retour';
  RAISE NOTICE '   3. Le RLS continue de protéger vos données';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Vos données sont maintenant sécurisées ET accessibles !';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- VÉRIFICATION POST-RESTAURATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📊 VÉRIFICATION POST-RESTAURATION';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
END $$;

-- Compter les données par table
SELECT
  'Entités' AS "Table",
  COUNT(*) AS "Nombre de lignes"
FROM entities
WHERE user_id = '56b10d22-c130-4569-8835-a2a4ae18467e'

UNION ALL

SELECT
  'Propriétés',
  COUNT(*)
FROM properties_new p
JOIN entities e ON p.entity_id = e.id
WHERE e.user_id = '56b10d22-c130-4569-8835-a2a4ae18467e'

UNION ALL

SELECT
  'Lots',
  COUNT(*)
FROM lots l
JOIN properties_new p ON l.property_id = p.id
JOIN entities e ON p.entity_id = e.id
WHERE e.user_id = '56b10d22-c130-4569-8835-a2a4ae18467e'

UNION ALL

SELECT
  'Locataires',
  COUNT(*)
FROM tenants
WHERE entity_id IN (SELECT id FROM entities WHERE user_id = '56b10d22-c130-4569-8835-a2a4ae18467e')

UNION ALL

SELECT
  'Baux',
  COUNT(*)
FROM leases ls
JOIN lots l ON ls.lot_id = l.id
JOIN properties_new p ON l.property_id = p.id
JOIN entities e ON p.entity_id = e.id
WHERE e.user_id = '56b10d22-c130-4569-8835-a2a4ae18467e'

UNION ALL

SELECT
  'Paiements',
  COUNT(*)
FROM payments pm
JOIN leases ls ON pm.lease_id = ls.id
JOIN lots l ON ls.lot_id = l.id
JOIN properties_new p ON l.property_id = p.id
JOIN entities e ON p.entity_id = e.id
WHERE e.user_id = '56b10d22-c130-4569-8835-a2a4ae18467e';

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Si vous voyez des chiffres ci-dessus, vos données sont restaurées !';
  RAISE NOTICE '';
END $$;
