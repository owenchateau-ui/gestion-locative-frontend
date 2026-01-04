-- ============================================================================
-- FIX CRITIQUE - Trigger création automatique users après inscription
-- ============================================================================
-- Date: 2026-01-04
-- Problème: Après inscription, pas d'entrée dans table users
-- Symptômes: "Utilisateur non trouvé", "Cannot coerce to single JSON object"
-- Cause: Trigger handle_new_user() n'existe pas ou ne fonctionne pas
-- Solution: Créer trigger Supabase Auth → table users
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🚨 FIX CRITIQUE - USER CREATION TRIGGER';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- 1. Vérifier l'état actuel
-- ============================================================================

DO $$
DECLARE
  auth_users_count INTEGER;
  app_users_count INTEGER;
  missing_users INTEGER;
BEGIN
  -- Compter les utilisateurs Supabase Auth
  SELECT COUNT(*) INTO auth_users_count FROM auth.users;

  -- Compter les utilisateurs dans notre table
  SELECT COUNT(*) INTO app_users_count FROM users;

  missing_users := auth_users_count - app_users_count;

  RAISE NOTICE '';
  RAISE NOTICE '📊 État actuel:';
  RAISE NOTICE '   Comptes Supabase Auth: %', auth_users_count;
  RAISE NOTICE '   Entrées table users: %', app_users_count;
  RAISE NOTICE '   Utilisateurs manquants: %', missing_users;
  RAISE NOTICE '';

  IF missing_users > 0 THEN
    RAISE NOTICE '⚠️  PROBLÈME DÉTECTÉ : % utilisateurs sans entrée users', missing_users;
  ELSE
    RAISE NOTICE '✅ Tous les utilisateurs ont une entrée users';
  END IF;
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- 2. Créer la fonction handle_new_user()
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Création fonction handle_new_user()...';
  RAISE NOTICE '';
END $$;

-- Supprimer l'ancienne fonction si elle existe
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Créer la nouvelle fonction
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer une nouvelle entrée dans la table users
  INSERT INTO public.users (
    supabase_uid,
    email,
    first_name,
    last_name
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  RAISE NOTICE '✅ Fonction handle_new_user() créée';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- 3. Créer le trigger sur auth.users
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Création trigger on_auth_user_created...';
  RAISE NOTICE '';
END $$;

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le nouveau trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

DO $$
BEGIN
  RAISE NOTICE '✅ Trigger on_auth_user_created créé';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- 4. Remplir les entrées manquantes (BACKFILL)
-- ============================================================================

DO $$
DECLARE
  inserted_count INTEGER := 0;
  r RECORD;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Remplissage des utilisateurs manquants...';
  RAISE NOTICE '';

  -- Pour chaque utilisateur auth.users sans entrée dans users
  FOR r IN
    SELECT
      au.id AS supabase_uid,
      au.email,
      COALESCE(au.raw_user_meta_data->>'first_name', '') AS first_name,
      COALESCE(au.raw_user_meta_data->>'last_name', '') AS last_name
    FROM auth.users au
    LEFT JOIN users u ON au.id = u.supabase_uid
    WHERE u.id IS NULL
  LOOP
    -- Insérer l'entrée manquante
    INSERT INTO users (supabase_uid, email, first_name, last_name)
    VALUES (r.supabase_uid, r.email, r.first_name, r.last_name);

    inserted_count := inserted_count + 1;
    RAISE NOTICE '   ✓ Créé entrée pour: %', r.email;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '✅ Utilisateurs créés: %', inserted_count;
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- 5. Créer entité par défaut pour les nouveaux utilisateurs
-- ============================================================================

DO $$
DECLARE
  r RECORD;
  new_entity_id UUID;
  entities_created INTEGER := 0;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🏢 Création entités par défaut pour nouveaux utilisateurs...';
  RAISE NOTICE '';

  -- Pour chaque utilisateur sans entité
  FOR r IN
    SELECT u.id, u.email, u.first_name, u.last_name
    FROM users u
    LEFT JOIN entities e ON e.user_id = u.id
    WHERE e.id IS NULL
  LOOP
    -- Créer une entité par défaut
    INSERT INTO entities (
      user_id,
      name,
      entity_type,
      default_entity
    )
    VALUES (
      r.id,
      CASE
        WHEN r.first_name != '' THEN r.first_name || ' ' || r.last_name
        ELSE 'Mon Patrimoine'
      END,
      'individual',
      true
    )
    RETURNING id INTO new_entity_id;

    entities_created := entities_created + 1;
    RAISE NOTICE '   ✓ Entité créée pour: %', r.email;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '✅ Entités créées: %', entities_created;
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- 6. Vérification finale
-- ============================================================================

DO $$
DECLARE
  auth_users_count INTEGER;
  app_users_count INTEGER;
  users_with_entity INTEGER;
BEGIN
  SELECT COUNT(*) INTO auth_users_count FROM auth.users;
  SELECT COUNT(*) INTO app_users_count FROM users;
  SELECT COUNT(*) INTO users_with_entity
  FROM users u
  INNER JOIN entities e ON e.user_id = u.id;

  RAISE NOTICE '';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '🎉 FIX TERMINÉ !';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 État final:';
  RAISE NOTICE '   Comptes Auth: %', auth_users_count;
  RAISE NOTICE '   Entrées users: %', app_users_count;
  RAISE NOTICE '   Users avec entité: %', users_with_entity;
  RAISE NOTICE '';

  IF auth_users_count = app_users_count THEN
    RAISE NOTICE '✅ SYNCHRONISATION PARFAITE !';
  ELSE
    RAISE NOTICE '⚠️  Désynchronisation détectée';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '💡 PROCHAINES ÉTAPES:';
  RAISE NOTICE '   1. Déconnectez-vous de l''application';
  RAISE NOTICE '   2. Reconnectez-vous';
  RAISE NOTICE '   3. Vérifiez que l''erreur "Utilisateur non trouvé" a disparu';
  RAISE NOTICE '   4. Testez la création d''un nouveau compte';
  RAISE NOTICE '';
END $$;

-- Afficher tous les utilisateurs pour vérification
SELECT
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  COUNT(e.id) AS nb_entities,
  CASE
    WHEN COUNT(e.id) > 0 THEN '✅ OK'
    ELSE '❌ Sans entité'
  END AS "Statut"
FROM users u
LEFT JOIN entities e ON e.user_id = u.id
GROUP BY u.id, u.email, u.first_name, u.last_name
ORDER BY u.created_at DESC;
