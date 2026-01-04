-- ============================================================================
-- ROLLBACK : Désactiver le nouveau RLS (janvier 2026)
-- ============================================================================
-- Date: 2026-01-04
-- Raison: Conflit avec l'ancien système RLS basé sur owner_id
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔄 ROLLBACK DU NOUVEAU RLS';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- 1. SUPPRIMER TOUTES LES POLICIES DU NOUVEAU SYSTÈME
-- ============================================================================

-- Helper function (à supprimer aussi)
DROP FUNCTION IF EXISTS user_owns_entity(UUID);

-- Policies entities
DROP POLICY IF EXISTS "Users can view their own entities" ON entities;
DROP POLICY IF EXISTS "Users can insert their own entities" ON entities;
DROP POLICY IF EXISTS "Users can update their own entities" ON entities;
DROP POLICY IF EXISTS "Users can delete their own entities" ON entities;

-- Policies properties_new
DROP POLICY IF EXISTS "Users can view properties of owned entities" ON properties_new;
DROP POLICY IF EXISTS "Users can insert properties into owned entities" ON properties_new;
DROP POLICY IF EXISTS "Users can update properties of owned entities" ON properties_new;
DROP POLICY IF EXISTS "Users can delete properties of owned entities" ON properties_new;

-- Policies lots
DROP POLICY IF EXISTS "Users can view lots of owned properties" ON lots;
DROP POLICY IF EXISTS "Users can insert lots into owned properties" ON lots;
DROP POLICY IF EXISTS "Users can update lots of owned properties" ON lots;
DROP POLICY IF EXISTS "Users can delete lots of owned properties" ON lots;

-- Policies tenants
DROP POLICY IF EXISTS "Users can view tenants of owned entities" ON tenants;
DROP POLICY IF EXISTS "Users can insert tenants into owned entities" ON tenants;
DROP POLICY IF EXISTS "Users can update tenants of owned entities" ON tenants;
DROP POLICY IF EXISTS "Users can delete tenants of owned entities" ON tenants;

-- Policies leases
DROP POLICY IF EXISTS "Users can view leases of owned lots" ON leases;
DROP POLICY IF EXISTS "Users can insert leases into owned lots" ON leases;
DROP POLICY IF EXISTS "Users can update leases of owned lots" ON leases;
DROP POLICY IF EXISTS "Users can delete leases of owned lots" ON leases;

-- Policies payments
DROP POLICY IF EXISTS "Users can view payments of owned leases" ON payments;
DROP POLICY IF EXISTS "Users can insert payments into owned leases" ON payments;
DROP POLICY IF EXISTS "Users can update payments of owned leases" ON payments;
DROP POLICY IF EXISTS "Users can delete payments of owned leases" ON payments;

-- Policies candidates
DROP POLICY IF EXISTS "Users can view candidates of owned entities" ON candidates;
DROP POLICY IF EXISTS "Users can insert candidates into owned entities" ON candidates;
DROP POLICY IF EXISTS "Users can update candidates of owned entities" ON candidates;
DROP POLICY IF EXISTS "Users can delete candidates of owned entities" ON candidates;

-- Policies candidate_documents
DROP POLICY IF EXISTS "Users can view documents of owned candidates" ON candidate_documents;
DROP POLICY IF EXISTS "Users can insert documents of owned candidates" ON candidate_documents;
DROP POLICY IF EXISTS "Users can update documents of owned candidates" ON candidate_documents;
DROP POLICY IF EXISTS "Users can delete documents of owned candidates" ON candidate_documents;

-- Policies guarantees
DROP POLICY IF EXISTS "Users can view guarantees of owned candidates" ON guarantees;
DROP POLICY IF EXISTS "Users can insert guarantees of owned candidates" ON guarantees;
DROP POLICY IF EXISTS "Users can update guarantees of owned candidates" ON guarantees;
DROP POLICY IF EXISTS "Users can delete guarantees of owned candidates" ON guarantees;

-- Policies candidate_groups
DROP POLICY IF EXISTS "Users can view candidate_groups of owned entities" ON candidate_groups;
DROP POLICY IF EXISTS "Users can insert candidate_groups of owned entities" ON candidate_groups;
DROP POLICY IF EXISTS "Users can update candidate_groups of owned entities" ON candidate_groups;
DROP POLICY IF EXISTS "Users can delete candidate_groups of owned entities" ON candidate_groups;

-- Policies tenant_groups
DROP POLICY IF EXISTS "Users can view tenant_groups of owned entities" ON tenant_groups;
DROP POLICY IF EXISTS "Users can insert tenant_groups of owned entities" ON tenant_groups;
DROP POLICY IF EXISTS "Users can update tenant_groups of owned entities" ON tenant_groups;
DROP POLICY IF EXISTS "Users can delete tenant_groups of owned entities" ON tenant_groups;

-- Policies irl_history
DROP POLICY IF EXISTS "Public can view IRL history" ON irl_history;
DROP POLICY IF EXISTS "Only admins can insert IRL history" ON irl_history;

-- Policies indexation_history
DROP POLICY IF EXISTS "Users can view indexation_history of owned leases" ON indexation_history;
DROP POLICY IF EXISTS "Users can insert indexation_history of owned leases" ON indexation_history;
DROP POLICY IF EXISTS "Users can update indexation_history of owned leases" ON indexation_history;

-- Policies users
DROP POLICY IF EXISTS "Users can view their own record" ON users;
DROP POLICY IF EXISTS "Users can update their own record" ON users;

-- ============================================================================
-- 2. DÉSACTIVER LE RLS SUR LES TABLES (RETOUR À L'ANCIEN SYSTÈME)
-- ============================================================================

-- Ne pas désactiver RLS sur les tables qui avaient déjà du RLS (candidate_invitation_links)
-- Désactiver uniquement sur les nouvelles tables

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE entities DISABLE ROW LEVEL SECURITY;
-- properties_new et lots gardent leur ancien RLS basé sur owner_id
-- ALTER TABLE properties_new DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE lots DISABLE ROW LEVEL SECURITY;
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE leases DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE guarantees DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE irl_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE indexation_history DISABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '✅ ROLLBACK TERMINÉ !';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Actions effectuées:';
  RAISE NOTICE '   ✅ Policies du nouveau système supprimées';
  RAISE NOTICE '   ✅ RLS désactivé sur tables non-critiques';
  RAISE NOTICE '   ✅ Ancien système RLS (owner_id) conservé';
  RAISE NOTICE '';
  RAISE NOTICE '💡 PROCHAINES ÉTAPES:';
  RAISE NOTICE '   1. Actualisez votre application (F5)';
  RAISE NOTICE '   2. Vos données devraient être de retour';
  RAISE NOTICE '   3. L''ancien système RLS continue de fonctionner';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Retour à l''état stable !';
  RAISE NOTICE '';
END $$;
