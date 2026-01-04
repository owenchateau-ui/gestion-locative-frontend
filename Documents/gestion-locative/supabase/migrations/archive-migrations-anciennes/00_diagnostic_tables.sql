-- Script de diagnostic : Vérifier quelles tables existent
-- Exécute ce script pour voir l'état actuel de ta base de données

-- Liste toutes les tables du schéma public
SELECT
  table_name,
  CASE
    WHEN table_name LIKE '%candidate%' THEN '🟢 Candidatures'
    WHEN table_name LIKE '%entity%' OR table_name LIKE '%entit%' THEN '🔵 Entités'
    WHEN table_name IN ('properties', 'properties_new') THEN '🟡 Propriétés'
    WHEN table_name IN ('lots', 'lots_new') THEN '🟠 Lots'
    WHEN table_name IN ('tenants', 'leases', 'payments') THEN '🟣 Locataires/Baux'
    ELSE '⚪ Autre'
  END as categorie
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY categorie, table_name;

-- Vérifier si RLS est activé sur les tables candidates
SELECT
  tablename,
  rowsecurity as "RLS Activé"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE '%candidate%'
ORDER BY tablename;

-- Compter les politiques existantes
SELECT
  tablename as "Table",
  COUNT(*) as "Nombre de politiques"
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
