-- ============================================================================
-- DEBUG - Vérifier l'état des données
-- ============================================================================

-- Vérifier les locataires
SELECT
  'TENANTS' AS "Table",
  id,
  first_name,
  last_name,
  entity_id,
  user_id,
  CASE
    WHEN entity_id IS NULL THEN '❌ entity_id NULL'
    WHEN user_id IS NULL THEN '❌ user_id NULL'
    ELSE '✅ OK'
  END AS "Statut"
FROM tenants
ORDER BY created_at DESC;

-- Vérifier les baux
SELECT
  'LEASES' AS "Table",
  id,
  lot_id,
  tenant_id,
  start_date,
  end_date,
  CASE
    WHEN lot_id IS NULL THEN '❌ lot_id NULL'
    WHEN tenant_id IS NULL THEN '❌ tenant_id NULL'
    ELSE '✅ OK'
  END AS "Statut"
FROM leases
ORDER BY created_at DESC;

-- Vérifier la chaîne de possession
SELECT
  'VERIFICATION CHAINE' AS "Info",
  u.email,
  u.id AS user_id,
  e.id AS entity_id,
  e.name AS entity_name,
  COUNT(t.id) AS nb_tenants,
  COUNT(l.id) AS nb_leases
FROM users u
LEFT JOIN entities e ON e.user_id = u.id
LEFT JOIN tenants t ON t.entity_id = e.id
LEFT JOIN leases l ON l.tenant_id = t.id
WHERE u.email = 'owen.chateau@gmail.com'
GROUP BY u.email, u.id, e.id, e.name;
