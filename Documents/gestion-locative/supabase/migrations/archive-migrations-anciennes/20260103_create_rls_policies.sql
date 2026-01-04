-- ============================================================================
-- CRÉATION POLICIES RLS (Row Level Security)
-- Date: 2026-01-03
-- Priorité: CRITIQUE
-- ============================================================================

-- Cette migration crée les policies RLS pour TOUTES les tables critiques
-- PRÉREQUIS: Avoir exécuté 20260103_activate_rls.sql AVANT ce fichier

-- PRINCIPE: Isolation multi-tenant via entity_id
-- Chaque utilisateur ne peut accéder qu'aux données des entités qu'il possède
-- Pattern: entity_id IN (SELECT id FROM entities WHERE user_id = auth.uid())

\echo '=========================================='
\echo '🔐 CRÉATION POLICIES RLS - PHASE 2'
\echo '=========================================='
\echo ''

-- ============================================================================
-- HELPER FUNCTION: Vérifier si l'utilisateur possède une entité
-- ============================================================================

\echo '🛠️  Création fonction helper user_owns_entity...'

CREATE OR REPLACE FUNCTION user_owns_entity(entity_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM entities
    WHERE id = entity_uuid
      AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION user_owns_entity IS 'Vérifie si l''utilisateur authentifié possède l''entité donnée';

-- ============================================================================
-- POLICIES: USERS
-- ============================================================================

\echo '👤 Création policies: users...'

-- Users peuvent voir uniquement leur propre profil
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (id = auth.uid());

-- Users peuvent mettre à jour uniquement leur propre profil
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Pas de INSERT/DELETE (géré par Supabase Auth)

-- ============================================================================
-- POLICIES: ENTITIES
-- ============================================================================

\echo '🏢 Création policies: entities...'

CREATE POLICY "Users can view own entities"
ON entities FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own entities"
ON entities FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own entities"
ON entities FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own entities"
ON entities FOR DELETE
USING (user_id = auth.uid());

-- ============================================================================
-- POLICIES: PROPERTIES_NEW
-- ============================================================================

\echo '🏠 Création policies: properties_new...'

CREATE POLICY "Users can view properties of owned entities"
ON properties_new FOR SELECT
USING (user_owns_entity(entity_id));

CREATE POLICY "Users can insert properties for owned entities"
ON properties_new FOR INSERT
WITH CHECK (user_owns_entity(entity_id));

CREATE POLICY "Users can update properties of owned entities"
ON properties_new FOR UPDATE
USING (user_owns_entity(entity_id))
WITH CHECK (user_owns_entity(entity_id));

CREATE POLICY "Users can delete properties of owned entities"
ON properties_new FOR DELETE
USING (user_owns_entity(entity_id));

-- ============================================================================
-- POLICIES: LOTS
-- ============================================================================

\echo '🏘️  Création policies: lots...'

CREATE POLICY "Users can view lots of owned properties"
ON lots FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM properties_new p
    WHERE p.id = lots.property_id
      AND user_owns_entity(p.entity_id)
  )
);

CREATE POLICY "Users can insert lots for owned properties"
ON lots FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM properties_new p
    WHERE p.id = property_id
      AND user_owns_entity(p.entity_id)
  )
);

CREATE POLICY "Users can update lots of owned properties"
ON lots FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM properties_new p
    WHERE p.id = lots.property_id
      AND user_owns_entity(p.entity_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM properties_new p
    WHERE p.id = property_id
      AND user_owns_entity(p.entity_id)
  )
);

CREATE POLICY "Users can delete lots of owned properties"
ON lots FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM properties_new p
    WHERE p.id = lots.property_id
      AND user_owns_entity(p.entity_id)
  )
);

-- ============================================================================
-- POLICIES: TENANTS
-- ============================================================================

\echo '👥 Création policies: tenants...'

CREATE POLICY "Users can view tenants of owned entities"
ON tenants FOR SELECT
USING (user_owns_entity(entity_id));

CREATE POLICY "Users can insert tenants for owned entities"
ON tenants FOR INSERT
WITH CHECK (user_owns_entity(entity_id));

CREATE POLICY "Users can update tenants of owned entities"
ON tenants FOR UPDATE
USING (user_owns_entity(entity_id))
WITH CHECK (user_owns_entity(entity_id));

CREATE POLICY "Users can delete tenants of owned entities"
ON tenants FOR DELETE
USING (user_owns_entity(entity_id));

-- ============================================================================
-- POLICIES: TENANT_GROUPS
-- ============================================================================

\echo '👨‍👩‍👧 Création policies: tenant_groups...'

CREATE POLICY "Users can view tenant_groups via tenants"
ON tenant_groups FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tenants t
    WHERE t.id = tenant_groups.primary_tenant_id
      AND user_owns_entity(t.entity_id)
  )
);

CREATE POLICY "Users can insert tenant_groups via tenants"
ON tenant_groups FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tenants t
    WHERE t.id = primary_tenant_id
      AND user_owns_entity(t.entity_id)
  )
);

CREATE POLICY "Users can update tenant_groups via tenants"
ON tenant_groups FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM tenants t
    WHERE t.id = tenant_groups.primary_tenant_id
      AND user_owns_entity(t.entity_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tenants t
    WHERE t.id = primary_tenant_id
      AND user_owns_entity(t.entity_id)
  )
);

CREATE POLICY "Users can delete tenant_groups via tenants"
ON tenant_groups FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM tenants t
    WHERE t.id = tenant_groups.primary_tenant_id
      AND user_owns_entity(t.entity_id)
  )
);

-- ============================================================================
-- POLICIES: GUARANTEES
-- ============================================================================

\echo '🛡️  Création policies: guarantees...'

CREATE POLICY "Users can view guarantees via tenants"
ON guarantees FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tenants t
    WHERE t.id = guarantees.tenant_id
      AND user_owns_entity(t.entity_id)
  )
);

CREATE POLICY "Users can insert guarantees via tenants"
ON guarantees FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tenants t
    WHERE t.id = tenant_id
      AND user_owns_entity(t.entity_id)
  )
);

CREATE POLICY "Users can update guarantees via tenants"
ON guarantees FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM tenants t
    WHERE t.id = guarantees.tenant_id
      AND user_owns_entity(t.entity_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tenants t
    WHERE t.id = tenant_id
      AND user_owns_entity(t.entity_id)
  )
);

CREATE POLICY "Users can delete guarantees via tenants"
ON guarantees FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM tenants t
    WHERE t.id = guarantees.tenant_id
      AND user_owns_entity(t.entity_id)
  )
);

-- ============================================================================
-- POLICIES: TENANT_DOCUMENTS
-- ============================================================================

\echo '📄 Création policies: tenant_documents...'

CREATE POLICY "Users can view tenant_documents via tenants"
ON tenant_documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tenants t
    WHERE t.id = tenant_documents.tenant_id
      AND user_owns_entity(t.entity_id)
  )
);

CREATE POLICY "Users can insert tenant_documents via tenants"
ON tenant_documents FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tenants t
    WHERE t.id = tenant_id
      AND user_owns_entity(t.entity_id)
  )
);

CREATE POLICY "Users can update tenant_documents via tenants"
ON tenant_documents FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM tenants t
    WHERE t.id = tenant_documents.tenant_id
      AND user_owns_entity(t.entity_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tenants t
    WHERE t.id = tenant_id
      AND user_owns_entity(t.entity_id)
  )
);

CREATE POLICY "Users can delete tenant_documents via tenants"
ON tenant_documents FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM tenants t
    WHERE t.id = tenant_documents.tenant_id
      AND user_owns_entity(t.entity_id)
  )
);

-- ============================================================================
-- POLICIES: LEASES
-- ============================================================================

\echo '📋 Création policies: leases...'

CREATE POLICY "Users can view leases via lots"
ON leases FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM lots l
    JOIN properties_new p ON p.id = l.property_id
    WHERE l.id = leases.lot_id
      AND user_owns_entity(p.entity_id)
  )
);

CREATE POLICY "Users can insert leases via lots"
ON leases FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM lots l
    JOIN properties_new p ON p.id = l.property_id
    WHERE l.id = lot_id
      AND user_owns_entity(p.entity_id)
  )
);

CREATE POLICY "Users can update leases via lots"
ON leases FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM lots l
    JOIN properties_new p ON p.id = l.property_id
    WHERE l.id = leases.lot_id
      AND user_owns_entity(p.entity_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM lots l
    JOIN properties_new p ON p.id = l.property_id
    WHERE l.id = lot_id
      AND user_owns_entity(p.entity_id)
  )
);

CREATE POLICY "Users can delete leases via lots"
ON leases FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM lots l
    JOIN properties_new p ON p.id = l.property_id
    WHERE l.id = leases.lot_id
      AND user_owns_entity(p.entity_id)
  )
);

-- ============================================================================
-- POLICIES: PAYMENTS
-- ============================================================================

\echo '💰 Création policies: payments...'

CREATE POLICY "Users can view payments via leases"
ON payments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM leases le
    JOIN lots l ON l.id = le.lot_id
    JOIN properties_new p ON p.id = l.property_id
    WHERE le.id = payments.lease_id
      AND user_owns_entity(p.entity_id)
  )
);

CREATE POLICY "Users can insert payments via leases"
ON payments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM leases le
    JOIN lots l ON l.id = le.lot_id
    JOIN properties_new p ON p.id = l.property_id
    WHERE le.id = lease_id
      AND user_owns_entity(p.entity_id)
  )
);

CREATE POLICY "Users can update payments via leases"
ON payments FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM leases le
    JOIN lots l ON l.id = le.lot_id
    JOIN properties_new p ON p.id = l.property_id
    WHERE le.id = payments.lease_id
      AND user_owns_entity(p.entity_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM leases le
    JOIN lots l ON l.id = le.lot_id
    JOIN properties_new p ON p.id = l.property_id
    WHERE le.id = lease_id
      AND user_owns_entity(p.entity_id)
  )
);

CREATE POLICY "Users can delete payments via leases"
ON payments FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM leases le
    JOIN lots l ON l.id = le.lot_id
    JOIN properties_new p ON p.id = l.property_id
    WHERE le.id = payments.lease_id
      AND user_owns_entity(p.entity_id)
  )
);

-- ============================================================================
-- POLICIES: CANDIDATES
-- ============================================================================

\echo '📝 Création policies: candidates...'

CREATE POLICY "Users can view candidates via lots"
ON candidates FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM lots l
    JOIN properties_new p ON p.id = l.property_id
    WHERE l.id = candidates.lot_id
      AND user_owns_entity(p.entity_id)
  )
);

CREATE POLICY "Users can insert candidates via lots"
ON candidates FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM lots l
    JOIN properties_new p ON p.id = l.property_id
    WHERE l.id = lot_id
      AND user_owns_entity(p.entity_id)
  )
);

CREATE POLICY "Users can update candidates via lots"
ON candidates FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM lots l
    JOIN properties_new p ON p.id = l.property_id
    WHERE l.id = candidates.lot_id
      AND user_owns_entity(p.entity_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM lots l
    JOIN properties_new p ON p.id = l.property_id
    WHERE l.id = lot_id
      AND user_owns_entity(p.entity_id)
  )
);

CREATE POLICY "Users can delete candidates via lots"
ON candidates FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM lots l
    JOIN properties_new p ON p.id = l.property_id
    WHERE l.id = candidates.lot_id
      AND user_owns_entity(p.entity_id)
  )
);

-- ============================================================================
-- POLICIES: CANDIDATE_DOCUMENTS
-- ============================================================================

\echo '📎 Création policies: candidate_documents...'

CREATE POLICY "Users can view candidate_documents via candidates"
ON candidate_documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM candidates c
    JOIN lots l ON l.id = c.lot_id
    JOIN properties_new p ON p.id = l.property_id
    WHERE c.id = candidate_documents.candidate_id
      AND user_owns_entity(p.entity_id)
  )
);

CREATE POLICY "Users can insert candidate_documents via candidates"
ON candidate_documents FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM candidates c
    JOIN lots l ON l.id = c.lot_id
    JOIN properties_new p ON p.id = l.property_id
    WHERE c.id = candidate_id
      AND user_owns_entity(p.entity_id)
  )
);

CREATE POLICY "Users can update candidate_documents via candidates"
ON candidate_documents FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM candidates c
    JOIN lots l ON l.id = c.lot_id
    JOIN properties_new p ON p.id = l.property_id
    WHERE c.id = candidate_documents.candidate_id
      AND user_owns_entity(p.entity_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM candidates c
    JOIN lots l ON l.id = c.lot_id
    JOIN properties_new p ON p.id = l.property_id
    WHERE c.id = candidate_id
      AND user_owns_entity(p.entity_id)
  )
);

CREATE POLICY "Users can delete candidate_documents via candidates"
ON candidate_documents FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM candidates c
    JOIN lots l ON l.id = c.lot_id
    JOIN properties_new p ON p.id = l.property_id
    WHERE c.id = candidate_documents.candidate_id
      AND user_owns_entity(p.entity_id)
  )
);

-- ============================================================================
-- POLICIES: INVITATION_LINKS
-- ============================================================================

\echo '🔗 Création policies: invitation_links...'

CREATE POLICY "Users can view invitation_links via lots"
ON invitation_links FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM lots l
    JOIN properties_new p ON p.id = l.property_id
    WHERE l.id = invitation_links.lot_id
      AND user_owns_entity(p.entity_id)
  )
);

CREATE POLICY "Users can insert invitation_links via lots"
ON invitation_links FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM lots l
    JOIN properties_new p ON p.id = l.property_id
    WHERE l.id = lot_id
      AND user_owns_entity(p.entity_id)
  )
);

CREATE POLICY "Users can update invitation_links via lots"
ON invitation_links FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM lots l
    JOIN properties_new p ON p.id = l.property_id
    WHERE l.id = invitation_links.lot_id
      AND user_owns_entity(p.entity_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM lots l
    JOIN properties_new p ON p.id = l.property_id
    WHERE l.id = lot_id
      AND user_owns_entity(p.entity_id)
  )
);

CREATE POLICY "Users can delete invitation_links via lots"
ON invitation_links FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM lots l
    JOIN properties_new p ON p.id = l.property_id
    WHERE l.id = invitation_links.lot_id
      AND user_owns_entity(p.entity_id)
  )
);

-- ============================================================================
-- POLICIES: IRL_HISTORY
-- ============================================================================

\echo '📈 Création policies: irl_history...'

-- IRL_history est une table de référence partagée (indices IRL nationaux)
-- Tous les utilisateurs authentifiés peuvent la consulter (lecture seule)
-- Seuls les admins peuvent insérer (géré via permissions Supabase)

CREATE POLICY "Authenticated users can view IRL history"
ON irl_history FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Pas de INSERT/UPDATE/DELETE pour utilisateurs normaux
-- (données importées par admin uniquement)

-- ============================================================================
-- POLICIES: INDEXATION_HISTORY
-- ============================================================================

\echo '📊 Création policies: indexation_history...'

CREATE POLICY "Users can view indexation_history via leases"
ON indexation_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM leases le
    JOIN lots l ON l.id = le.lot_id
    JOIN properties_new p ON p.id = l.property_id
    WHERE le.id = indexation_history.lease_id
      AND user_owns_entity(p.entity_id)
  )
);

CREATE POLICY "Users can insert indexation_history via leases"
ON indexation_history FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM leases le
    JOIN lots l ON l.id = le.lot_id
    JOIN properties_new p ON p.id = l.property_id
    WHERE le.id = lease_id
      AND user_owns_entity(p.entity_id)
  )
);

CREATE POLICY "Users can update indexation_history via leases"
ON indexation_history FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM leases le
    JOIN lots l ON l.id = le.lot_id
    JOIN properties_new p ON p.id = l.property_id
    WHERE le.id = indexation_history.lease_id
      AND user_owns_entity(p.entity_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM leases le
    JOIN lots l ON l.id = le.lot_id
    JOIN properties_new p ON p.id = l.property_id
    WHERE le.id = lease_id
      AND user_owns_entity(p.entity_id)
  )
);

CREATE POLICY "Users can delete indexation_history via leases"
ON indexation_history FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM leases le
    JOIN lots l ON l.id = le.lot_id
    JOIN properties_new p ON p.id = l.property_id
    WHERE le.id = indexation_history.lease_id
      AND user_owns_entity(p.entity_id)
  )
);

-- ============================================================================
-- VÉRIFICATION FINALE
-- ============================================================================

\echo ''
\echo '=========================================='
\echo '✅ VÉRIFICATION FINALE'
\echo '=========================================='

DO $$
DECLARE
  total_tables INTEGER;
  tables_with_rls INTEGER;
  tables_with_policies INTEGER;
  total_policies INTEGER;
  security_score INTEGER;
BEGIN
  -- Compter les tables
  SELECT COUNT(*) INTO total_tables
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
    AND tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns');

  -- Compter les tables avec RLS activé
  SELECT COUNT(*) INTO tables_with_rls
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
    AND rowsecurity = true;

  -- Compter les tables avec policies
  SELECT COUNT(DISTINCT tablename) INTO tables_with_policies
  FROM pg_policies
  WHERE schemaname = 'public';

  -- Compter le total de policies
  SELECT COUNT(*) INTO total_policies
  FROM pg_policies
  WHERE schemaname = 'public';

  -- Calculer le score de sécurité
  IF tables_with_rls = total_tables AND tables_with_policies = total_tables THEN
    security_score := 100;
  ELSIF tables_with_rls >= total_tables - 2 AND tables_with_policies >= total_tables - 2 THEN
    security_score := 80;
  ELSIF tables_with_rls >= total_tables - 5 THEN
    security_score := 50;
  ELSE
    security_score := 0;
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '📊 RÉSULTATS:';
  RAISE NOTICE '  - Total tables: %', total_tables;
  RAISE NOTICE '  - Tables avec RLS: % ✅', tables_with_rls;
  RAISE NOTICE '  - Tables avec policies: % ✅', tables_with_policies;
  RAISE NOTICE '  - Total policies créées: % 🔐', total_policies;
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Score de sécurité: %/100', security_score;
  RAISE NOTICE '';

  IF security_score = 100 THEN
    RAISE NOTICE '🎉 PARFAIT! RLS est complètement configuré.';
    RAISE NOTICE '   Toutes les tables sont protégées avec policies.';
  ELSIF security_score >= 80 THEN
    RAISE NOTICE '✅ BIEN! La plupart des tables sont protégées.';
    RAISE NOTICE '   Vérifiez les tables restantes avec DIAGNOSTIC_RLS_COMPLET.sql';
  ELSIF security_score >= 50 THEN
    RAISE NOTICE '⚠️  MOYEN. Plusieurs tables manquent de protection.';
    RAISE NOTICE '   Exécutez DIAGNOSTIC_RLS_COMPLET.sql pour identifier les problèmes.';
  ELSE
    RAISE NOTICE '❌ CRITIQUE! RLS n''est pas correctement configuré.';
    RAISE NOTICE '   Vérifiez que 20260103_activate_rls.sql a été exécuté AVANT.';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ PROCHAINES ÉTAPES';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '1. Exécutez DIAGNOSTIC_RLS_COMPLET.sql pour vérifier';
  RAISE NOTICE '2. Testez l''isolation des données:';
  RAISE NOTICE '   - Créez 2 utilisateurs distincts';
  RAISE NOTICE '   - Vérifiez qu''ils ne voient QUE leurs données';
  RAISE NOTICE '3. Surveillez les logs Supabase pour erreurs RLS';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT:';
  RAISE NOTICE '   Si vous voyez "new row violates row-level security"';
  RAISE NOTICE '   → Vérifiez que entity_id est correct lors INSERT';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;

\echo ''
\echo '✅ Migration 20260103_create_rls_policies.sql terminée!'
\echo ''
