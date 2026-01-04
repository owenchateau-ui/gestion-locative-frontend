-- ============================================================================
-- FIX URGENT - Policy d'inscription pour table users
-- ============================================================================
-- Date: 2026-01-04
-- Problème: "new row violates row-level security policy for table users"
-- Cause: Manque policy INSERT publique pour l'inscription
-- Solution: Ajouter policy permettant création user lors de l'inscription
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔧 FIX USERS REGISTRATION';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- 1. Vérifier les policies actuelles sur users
-- ============================================================================

DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'users';

  RAISE NOTICE '📊 Policies users existantes: %', policy_count;
  RAISE NOTICE '';
END $$;

-- Afficher les policies existantes
SELECT
  policyname AS "Policy Name",
  cmd AS "Command",
  roles AS "Roles",
  qual AS "USING",
  with_check AS "WITH CHECK"
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- ============================================================================
-- 2. Supprimer anciennes policies users (si existent)
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🗑️  Suppression anciennes policies users...';
  RAISE NOTICE '';

  DROP POLICY IF EXISTS "Users can view their own data" ON users;
  DROP POLICY IF EXISTS "Users can update their own data" ON users;
  DROP POLICY IF EXISTS "Users can insert their own data" ON users;

  RAISE NOTICE '✅ Anciennes policies supprimées';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- 3. Créer les policies CORRECTES pour users
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Création nouvelles policies users...';
  RAISE NOTICE '';
END $$;

-- Policy 1: Inscription (INSERT public) - CRITIQUE
-- Permet à un utilisateur de créer sa propre entrée lors de l'inscription
CREATE POLICY "Users can create their own profile during registration"
ON users FOR INSERT
TO authenticated
WITH CHECK (supabase_uid = auth.uid());

-- Policy 2: Lecture (SELECT) - Self-service
-- Un utilisateur peut voir ses propres données
CREATE POLICY "Users can view their own profile"
ON users FOR SELECT
TO authenticated
USING (supabase_uid = auth.uid());

-- Policy 3: Modification (UPDATE) - Self-service
-- Un utilisateur peut modifier ses propres données
CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
TO authenticated
USING (supabase_uid = auth.uid())
WITH CHECK (supabase_uid = auth.uid());

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ 3 policies users créées';
  RAISE NOTICE '   1. INSERT (inscription) - authenticated';
  RAISE NOTICE '   2. SELECT (lecture) - self-service';
  RAISE NOTICE '   3. UPDATE (modification) - self-service';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- 4. Vérification finale
-- ============================================================================

DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'users';

  RAISE NOTICE '';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '🎉 FIX TERMINÉ !';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 État final:';
  RAISE NOTICE '   Policies users: %', policy_count;
  RAISE NOTICE '';
  RAISE NOTICE '💡 Test à faire:';
  RAISE NOTICE '   1. Déconnectez-vous';
  RAISE NOTICE '   2. Cliquez sur "S''inscrire"';
  RAISE NOTICE '   3. Créez un nouveau compte';
  RAISE NOTICE '   4. Vérifiez qu''il n''y a pas d''erreur RLS';
  RAISE NOTICE '';
END $$;

-- Afficher les policies finales
SELECT
  policyname AS "Policy Name",
  cmd AS "Command",
  roles AS "Roles"
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;
