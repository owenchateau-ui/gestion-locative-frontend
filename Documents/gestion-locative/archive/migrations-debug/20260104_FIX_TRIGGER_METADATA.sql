-- ============================================================================
-- FIX - Mise à jour trigger handle_new_user() avec metadata complètes
-- ============================================================================
-- Date: 2026-01-04
-- Problème: Trigger ne récupère pas phone depuis user_metadata
-- Solution: Mettre à jour la fonction pour inclure tous les champs
-- ============================================================================

-- Supprimer l'ancienne fonction et la recréer
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    supabase_uid,
    email,
    first_name,
    last_name,
    phone,
    role,
    plan
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'landlord',
    'free'
  );

  -- Créer une entité par défaut pour le nouvel utilisateur
  INSERT INTO public.entities (
    user_id,
    name,
    entity_type,
    default_entity
  )
  SELECT
    u.id,
    CASE
      WHEN COALESCE(NEW.raw_user_meta_data->>'first_name', '') != ''
      THEN COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name', '')
      ELSE 'Mon Patrimoine'
    END,
    'individual',
    true
  FROM public.users u
  WHERE u.supabase_uid = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vérifier que le trigger existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
    RAISE NOTICE '✅ Trigger on_auth_user_created créé';
  ELSE
    RAISE NOTICE '✅ Trigger on_auth_user_created existe déjà';
  END IF;
END $$;

-- Résumé
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '✅ TRIGGER MIS À JOUR';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Champs récupérés depuis metadata:';
  RAISE NOTICE '   - first_name';
  RAISE NOTICE '   - last_name';
  RAISE NOTICE '   - phone';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Champs par défaut:';
  RAISE NOTICE '   - role: landlord';
  RAISE NOTICE '   - plan: free';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Actions automatiques:';
  RAISE NOTICE '   1. Création entrée users';
  RAISE NOTICE '   2. Création entité par défaut';
  RAISE NOTICE '';
END $$;
