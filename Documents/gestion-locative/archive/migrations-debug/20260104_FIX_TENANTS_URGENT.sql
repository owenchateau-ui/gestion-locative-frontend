-- ============================================================================
-- FIX URGENT - Rendre user_id optionnel dans tenants
-- ============================================================================
-- Date: 2026-01-04
-- Problème: user_id NOT NULL empêche création de locataires
-- Solution: Rendre user_id nullable et le remplir automatiquement via trigger
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔧 FIX TENANTS - user_id';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- 1. Remplir tous les user_id manquants MAINTENANT
-- ============================================================================

DO $$
DECLARE
  my_email TEXT := 'owen.chateau@gmail.com';
  my_app_user_id UUID;
  tenants_fixed INTEGER;
BEGIN
  -- Récupérer l'ID de l'utilisateur
  SELECT id INTO my_app_user_id FROM users WHERE email = my_email;

  IF my_app_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur % non trouvé', my_email;
  END IF;

  RAISE NOTICE '👤 User ID trouvé: %', my_app_user_id;

  -- Remplir tous les user_id NULL
  UPDATE tenants
  SET user_id = my_app_user_id
  WHERE user_id IS NULL;

  GET DIAGNOSTICS tenants_fixed = ROW_COUNT;

  RAISE NOTICE '✅ Locataires mis à jour: %', tenants_fixed;
END $$;

-- ============================================================================
-- 2. Rendre user_id NULLABLE (pour permettre création via frontend)
-- ============================================================================

ALTER TABLE tenants ALTER COLUMN user_id DROP NOT NULL;

DO $$
BEGIN
  RAISE NOTICE '✅ Colonne user_id rendue nullable';
END $$;

-- ============================================================================
-- 3. Créer un trigger pour remplir user_id automatiquement
-- ============================================================================

CREATE OR REPLACE FUNCTION set_tenant_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Si user_id n'est pas fourni, le remplir avec l'utilisateur actuel
  IF NEW.user_id IS NULL THEN
    NEW.user_id := (SELECT id FROM users WHERE supabase_uid = auth.uid());
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS set_tenant_user_id_trigger ON tenants;

-- Créer le trigger
CREATE TRIGGER set_tenant_user_id_trigger
  BEFORE INSERT OR UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION set_tenant_user_id();

DO $$
BEGIN
  RAISE NOTICE '✅ Trigger de remplissage automatique créé';
END $$;

-- ============================================================================
-- 4. Vérifier les locataires existants
-- ============================================================================

DO $$
DECLARE
  total_tenants INTEGER;
  tenants_with_user_id INTEGER;
  tenants_without_user_id INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_tenants FROM tenants;
  SELECT COUNT(*) INTO tenants_with_user_id FROM tenants WHERE user_id IS NOT NULL;
  SELECT COUNT(*) INTO tenants_without_user_id FROM tenants WHERE user_id IS NULL;

  RAISE NOTICE '';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '🎉 FIX TERMINÉ !';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 État actuel:';
  RAISE NOTICE '   Total locataires: %', total_tenants;
  RAISE NOTICE '   Avec user_id: %', tenants_with_user_id;
  RAISE NOTICE '   Sans user_id: %', tenants_without_user_id;
  RAISE NOTICE '';
  RAISE NOTICE '💡 Vous pouvez maintenant:';
  RAISE NOTICE '   1. Créer des locataires via le formulaire';
  RAISE NOTICE '   2. Le user_id sera rempli automatiquement';
  RAISE NOTICE '   3. Actualisez l''application (F5)';
  RAISE NOTICE '';
END $$;
