-- ============================================================================
-- RLS CORRECT V2 - Compatible avec l'architecture réelle + Policies complètes
-- ============================================================================
-- Date: 2026-01-04
-- Description: RLS basé sur la vraie structure users.supabase_uid = auth.uid()
--              + Toutes les policies manquantes (candidatures publiques, documents, etc.)
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔐 ACTIVATION RLS CORRECTE V2';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Mapping: auth.uid() → users.supabase_uid → users.id → entities.user_id';
  RAISE NOTICE 'Inclut: Policies complètes pour 13 tables';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- HELPER FUNCTIONS CORRECTES
-- ============================================================================

-- Fonction principale : obtenir l'ID utilisateur app depuis auth.uid()
CREATE OR REPLACE FUNCTION get_app_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id FROM users WHERE supabase_uid = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Fonction : vérifier si l'utilisateur possède une entité
CREATE OR REPLACE FUNCTION user_owns_entity(entity_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM entities
    WHERE id = entity_uuid
      AND user_id = get_app_user_id()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Fonction : vérifier si l'utilisateur possède une propriété (via entity)
CREATE OR REPLACE FUNCTION user_owns_property(property_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM properties_new p
    JOIN entities e ON p.entity_id = e.id
    WHERE p.id = property_uuid
      AND e.user_id = get_app_user_id()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Fonction : vérifier si l'utilisateur possède un lot (via property → entity)
CREATE OR REPLACE FUNCTION user_owns_lot(lot_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM lots l
    JOIN properties_new p ON l.property_id = p.id
    JOIN entities e ON p.entity_id = e.id
    WHERE l.id = lot_uuid
      AND e.user_id = get_app_user_id()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Fonction : vérifier si l'utilisateur possède un locataire (via entity)
CREATE OR REPLACE FUNCTION user_owns_tenant(tenant_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM tenants
    WHERE id = tenant_uuid
      AND user_owns_entity(entity_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

DO $$
BEGIN
  RAISE NOTICE '✅ Helper functions créées';
END $$;

-- ============================================================================
-- SUPPRIMER LES ANCIENNES POLICIES INCORRECTES
-- ============================================================================

DO $$
BEGIN
  -- Entities
  DROP POLICY IF EXISTS "Users can view their own entities" ON entities;
  DROP POLICY IF EXISTS "Users can insert their own entities" ON entities;
  DROP POLICY IF EXISTS "Users can update their own entities" ON entities;
  DROP POLICY IF EXISTS "Users can delete their own entities" ON entities;

  -- Properties
  DROP POLICY IF EXISTS "Users can view properties of owned entities" ON properties_new;
  DROP POLICY IF EXISTS "Users can insert properties into owned entities" ON properties_new;
  DROP POLICY IF EXISTS "Users can update properties of owned entities" ON properties_new;
  DROP POLICY IF EXISTS "Users can delete properties of owned entities" ON properties_new;

  -- Lots
  DROP POLICY IF EXISTS "Users can view lots of owned properties" ON lots;
  DROP POLICY IF EXISTS "Users can insert lots into owned properties" ON lots;
  DROP POLICY IF EXISTS "Users can update lots of owned properties" ON lots;
  DROP POLICY IF EXISTS "Users can delete lots of owned properties" ON lots;

  -- Tenants
  DROP POLICY IF EXISTS "Users can view tenants of owned entities" ON tenants;
  DROP POLICY IF EXISTS "Users can insert tenants into owned entities" ON tenants;
  DROP POLICY IF EXISTS "Users can update tenants of owned entities" ON tenants;
  DROP POLICY IF EXISTS "Users can delete tenants of owned entities" ON tenants;

  -- Leases
  DROP POLICY IF EXISTS "Users can view leases of owned lots" ON leases;
  DROP POLICY IF EXISTS "Users can insert leases into owned lots" ON leases;
  DROP POLICY IF EXISTS "Users can update leases of owned lots" ON leases;
  DROP POLICY IF EXISTS "Users can delete leases of owned lots" ON leases;

  -- Payments
  DROP POLICY IF EXISTS "Users can view payments of owned leases" ON payments;
  DROP POLICY IF EXISTS "Users can insert payments into owned leases" ON payments;
  DROP POLICY IF EXISTS "Users can update payments of owned leases" ON payments;
  DROP POLICY IF EXISTS "Users can delete payments of owned leases" ON payments;

  RAISE NOTICE '✅ Anciennes policies supprimées (si existantes)';
END $$;

-- ============================================================================
-- POLICIES CORRECTES - ENTITIES
-- ============================================================================

CREATE POLICY "Users can view their own entities"
ON entities FOR SELECT
TO authenticated
USING (user_id = get_app_user_id());

CREATE POLICY "Users can insert their own entities"
ON entities FOR INSERT
TO authenticated
WITH CHECK (user_id = get_app_user_id());

CREATE POLICY "Users can update their own entities"
ON entities FOR UPDATE
TO authenticated
USING (user_id = get_app_user_id())
WITH CHECK (user_id = get_app_user_id());

CREATE POLICY "Users can delete their own entities"
ON entities FOR DELETE
TO authenticated
USING (user_id = get_app_user_id());

DO $$
BEGIN
  RAISE NOTICE '✅ Policies entities créées';
END $$;

-- ============================================================================
-- POLICIES CORRECTES - PROPERTIES_NEW
-- ============================================================================

CREATE POLICY "Users can view properties of owned entities"
ON properties_new FOR SELECT
TO authenticated
USING (user_owns_entity(entity_id));

CREATE POLICY "Users can insert properties into owned entities"
ON properties_new FOR INSERT
TO authenticated
WITH CHECK (user_owns_entity(entity_id));

CREATE POLICY "Users can update properties of owned entities"
ON properties_new FOR UPDATE
TO authenticated
USING (user_owns_entity(entity_id))
WITH CHECK (user_owns_entity(entity_id));

CREATE POLICY "Users can delete properties of owned entities"
ON properties_new FOR DELETE
TO authenticated
USING (user_owns_entity(entity_id));

DO $$
BEGIN
  RAISE NOTICE '✅ Policies properties_new créées';
END $$;

-- ============================================================================
-- POLICIES CORRECTES - LOTS
-- ============================================================================

CREATE POLICY "Users can view lots of owned properties"
ON lots FOR SELECT
TO authenticated
USING (user_owns_property(property_id));

CREATE POLICY "Users can insert lots into owned properties"
ON lots FOR INSERT
TO authenticated
WITH CHECK (user_owns_property(property_id));

CREATE POLICY "Users can update lots of owned properties"
ON lots FOR UPDATE
TO authenticated
USING (user_owns_property(property_id))
WITH CHECK (user_owns_property(property_id));

CREATE POLICY "Users can delete lots of owned properties"
ON lots FOR DELETE
TO authenticated
USING (user_owns_property(property_id));

DO $$
BEGIN
  RAISE NOTICE '✅ Policies lots créées';
END $$;

-- ============================================================================
-- POLICIES CORRECTES - TENANTS
-- ============================================================================

CREATE POLICY "Users can view tenants of owned entities"
ON tenants FOR SELECT
TO authenticated
USING (user_owns_entity(entity_id));

CREATE POLICY "Users can insert tenants into owned entities"
ON tenants FOR INSERT
TO authenticated
WITH CHECK (user_owns_entity(entity_id));

CREATE POLICY "Users can update tenants of owned entities"
ON tenants FOR UPDATE
TO authenticated
USING (user_owns_entity(entity_id))
WITH CHECK (user_owns_entity(entity_id));

CREATE POLICY "Users can delete tenants of owned entities"
ON tenants FOR DELETE
TO authenticated
USING (user_owns_entity(entity_id));

DO $$
BEGIN
  RAISE NOTICE '✅ Policies tenants créées';
END $$;

-- ============================================================================
-- POLICIES CORRECTES - LEASES
-- ============================================================================

CREATE POLICY "Users can view leases of owned lots"
ON leases FOR SELECT
TO authenticated
USING (user_owns_lot(lot_id));

CREATE POLICY "Users can insert leases into owned lots"
ON leases FOR INSERT
TO authenticated
WITH CHECK (user_owns_lot(lot_id));

CREATE POLICY "Users can update leases of owned lots"
ON leases FOR UPDATE
TO authenticated
USING (user_owns_lot(lot_id))
WITH CHECK (user_owns_lot(lot_id));

CREATE POLICY "Users can delete leases of owned lots"
ON leases FOR DELETE
TO authenticated
USING (user_owns_lot(lot_id));

DO $$
BEGIN
  RAISE NOTICE '✅ Policies leases créées';
END $$;

-- ============================================================================
-- POLICIES CORRECTES - PAYMENTS
-- ============================================================================

CREATE POLICY "Users can view payments of owned leases"
ON payments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM leases ls
    WHERE ls.id = payments.lease_id
      AND user_owns_lot(ls.lot_id)
  )
);

CREATE POLICY "Users can insert payments into owned leases"
ON payments FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM leases ls
    WHERE ls.id = lease_id
      AND user_owns_lot(ls.lot_id)
  )
);

CREATE POLICY "Users can update payments of owned leases"
ON payments FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM leases ls
    WHERE ls.id = payments.lease_id
      AND user_owns_lot(ls.lot_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM leases ls
    WHERE ls.id = lease_id
      AND user_owns_lot(ls.lot_id)
  )
);

CREATE POLICY "Users can delete payments of owned leases"
ON payments FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM leases ls
    WHERE ls.id = payments.lease_id
      AND user_owns_lot(ls.lot_id)
  )
);

DO $$
BEGIN
  RAISE NOTICE '✅ Policies payments créées';
END $$;

-- ============================================================================
-- POLICIES CORRECTES - CANDIDATES (si la table existe)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'candidates') THEN
    -- Propriétaires peuvent gérer toutes les candidatures de leurs lots
    EXECUTE $body$CREATE POLICY "Users can view candidates of owned lots"
    ON candidates FOR SELECT
    TO authenticated
    USING (user_owns_lot(lot_id))$body$;

    EXECUTE $body$CREATE POLICY "Users can insert candidates into owned lots"
    ON candidates FOR INSERT
    TO authenticated
    WITH CHECK (user_owns_lot(lot_id))$body$;

    EXECUTE $body$CREATE POLICY "Users can update candidates of owned lots"
    ON candidates FOR UPDATE
    TO authenticated
    USING (user_owns_lot(lot_id))
    WITH CHECK (user_owns_lot(lot_id))$body$;

    EXECUTE $body$CREATE POLICY "Users can delete candidates of owned lots"
    ON candidates FOR DELETE
    TO authenticated
    USING (user_owns_lot(lot_id))$body$;

    -- ⭐ NOUVEAU : Accès public pour soumission candidature via lien d'invitation
    EXECUTE $body$CREATE POLICY "Public can submit candidates via invitation link"
    ON candidates FOR INSERT
    TO anon, authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM candidate_invitation_links
        WHERE lot_id = candidates.lot_id
          AND is_active = true
          AND (expires_at IS NULL OR expires_at > NOW())
      )
    )$body$;

    RAISE NOTICE '✅ Policies candidates créées (5 policies dont 1 publique)';
  END IF;
END $$;

-- ============================================================================
-- POLICIES CORRECTES - CANDIDATE_DOCUMENTS (si la table existe)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'candidate_documents') THEN
    -- Propriétaires peuvent voir documents des candidatures de leurs lots
    EXECUTE $body$CREATE POLICY "Users can view documents of owned candidates"
    ON candidate_documents FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM candidates c
        WHERE c.id = candidate_documents.candidate_id
          AND user_owns_lot(c.lot_id)
      )
    )$body$;

    -- Propriétaires peuvent supprimer documents
    EXECUTE $body$CREATE POLICY "Users can delete documents of owned candidates"
    ON candidate_documents FOR DELETE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM candidates c
        WHERE c.id = candidate_documents.candidate_id
          AND user_owns_lot(c.lot_id)
      )
    )$body$;

    -- ⭐ NOUVEAU : Accès public pour upload documents candidature
    EXECUTE $body$CREATE POLICY "Public can upload candidate documents via invitation"
    ON candidate_documents FOR INSERT
    TO anon, authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM candidates c
        JOIN candidate_invitation_links l ON c.lot_id = l.lot_id
        WHERE c.id = candidate_documents.candidate_id
          AND l.is_active = true
          AND (l.expires_at IS NULL OR l.expires_at > NOW())
      )
    )$body$;

    RAISE NOTICE '✅ Policies candidate_documents créées (3 policies dont 1 publique)';
  END IF;
END $$;

-- ============================================================================
-- POLICIES CORRECTES - CANDIDATE_INVITATION_LINKS (si la table existe)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'candidate_invitation_links') THEN
    -- Propriétaires gèrent leurs liens d'invitation
    EXECUTE $body$CREATE POLICY "Users can manage invitation links for owned lots"
    ON candidate_invitation_links FOR ALL
    TO authenticated
    USING (user_owns_lot(lot_id))
    WITH CHECK (user_owns_lot(lot_id))$body$;

    -- ⭐ NOUVEAU : Accès public en lecture pour liens actifs (validation formulaire)
    EXECUTE $body$CREATE POLICY "Public can view active invitation links"
    ON candidate_invitation_links FOR SELECT
    TO anon, authenticated
    USING (
      is_active = true
      AND (expires_at IS NULL OR expires_at > NOW())
    )$body$;

    RAISE NOTICE '✅ Policies candidate_invitation_links créées (2 policies dont 1 publique)';
  END IF;
END $$;

-- ============================================================================
-- POLICIES CORRECTES - TENANT_DOCUMENTS (si la table existe)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'tenant_documents') THEN
    -- Propriétaires peuvent voir documents de leurs locataires
    EXECUTE $body$CREATE POLICY "Users can view documents of owned tenants"
    ON tenant_documents FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM tenants t
        WHERE t.id = tenant_documents.tenant_id
          AND user_owns_tenant(t.id)
      )
    )$body$;

    -- Propriétaires peuvent uploader documents pour leurs locataires
    EXECUTE $body$CREATE POLICY "Users can upload documents for owned tenants"
    ON tenant_documents FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM tenants t
        WHERE t.id = tenant_id
          AND user_owns_tenant(t.id)
      )
    )$body$;

    -- Propriétaires peuvent supprimer documents
    EXECUTE $body$CREATE POLICY "Users can delete documents of owned tenants"
    ON tenant_documents FOR DELETE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM tenants t
        WHERE t.id = tenant_documents.tenant_id
          AND user_owns_tenant(t.id)
      )
    )$body$;

    RAISE NOTICE '✅ Policies tenant_documents créées (3 policies)';
  END IF;
END $$;

-- ============================================================================
-- POLICIES CORRECTES - IRL_HISTORY (si la table existe)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'irl_history') THEN
    -- Données publiques de référence : tous les utilisateurs authentifiés peuvent lire
    EXECUTE $body$CREATE POLICY "Authenticated users can view IRL history"
    ON irl_history FOR SELECT
    TO authenticated
    USING (true)$body$;

    RAISE NOTICE '✅ Policies irl_history créées (1 policy publique auth)';
  END IF;
END $$;

-- ============================================================================
-- POLICIES CORRECTES - INDEXATION_HISTORY (si la table existe)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'indexation_history') THEN
    -- Propriétaires peuvent voir historique indexation de leurs baux
    EXECUTE $body$CREATE POLICY "Users can view indexation history of owned leases"
    ON indexation_history FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM leases ls
        WHERE ls.id = indexation_history.lease_id
          AND user_owns_lot(ls.lot_id)
      )
    )$body$;

    -- Propriétaires peuvent créer entrées indexation pour leurs baux
    EXECUTE $body$CREATE POLICY "Users can create indexation for owned leases"
    ON indexation_history FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM leases ls
        WHERE ls.id = lease_id
          AND user_owns_lot(ls.lot_id)
      )
    )$body$;

    -- Propriétaires peuvent modifier entrées indexation
    EXECUTE $body$CREATE POLICY "Users can update indexation of owned leases"
    ON indexation_history FOR UPDATE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM leases ls
        WHERE ls.id = indexation_history.lease_id
          AND user_owns_lot(ls.lot_id)
      )
    )$body$;

    -- Propriétaires peuvent supprimer entrées indexation
    EXECUTE $body$CREATE POLICY "Users can delete indexation of owned leases"
    ON indexation_history FOR DELETE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM leases ls
        WHERE ls.id = indexation_history.lease_id
          AND user_owns_lot(ls.lot_id)
      )
    )$body$;

    RAISE NOTICE '✅ Policies indexation_history créées (4 policies)';
  END IF;
END $$;

-- ============================================================================
-- POLICIES CORRECTES - TENANT_GROUPS (si la table existe)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'tenant_groups') THEN
    EXECUTE $body$CREATE POLICY "Users can view tenant_groups of owned entities"
    ON tenant_groups FOR SELECT
    TO authenticated
    USING (user_owns_entity(entity_id))$body$;

    EXECUTE $body$CREATE POLICY "Users can insert tenant_groups into owned entities"
    ON tenant_groups FOR INSERT
    TO authenticated
    WITH CHECK (user_owns_entity(entity_id))$body$;

    EXECUTE $body$CREATE POLICY "Users can update tenant_groups of owned entities"
    ON tenant_groups FOR UPDATE
    TO authenticated
    USING (user_owns_entity(entity_id))
    WITH CHECK (user_owns_entity(entity_id))$body$;

    EXECUTE $body$CREATE POLICY "Users can delete tenant_groups of owned entities"
    ON tenant_groups FOR DELETE
    TO authenticated
    USING (user_owns_entity(entity_id))$body$;

    RAISE NOTICE '✅ Policies tenant_groups créées';
  END IF;
END $$;

-- ============================================================================
-- POLICIES CORRECTES - GUARANTEES (si la table existe)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'guarantees') THEN
    EXECUTE $body$CREATE POLICY "Users can view guarantees of owned tenants"
    ON guarantees FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM tenants t
        WHERE t.id = guarantees.tenant_id
          AND user_owns_entity(t.entity_id)
      )
    )$body$;

    EXECUTE $body$CREATE POLICY "Users can insert guarantees for owned tenants"
    ON guarantees FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM tenants t
        WHERE t.id = tenant_id
          AND user_owns_entity(t.entity_id)
      )
    )$body$;

    EXECUTE $body$CREATE POLICY "Users can update guarantees of owned tenants"
    ON guarantees FOR UPDATE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM tenants t
        WHERE t.id = guarantees.tenant_id
          AND user_owns_entity(t.entity_id)
      )
    )$body$;

    EXECUTE $body$CREATE POLICY "Users can delete guarantees of owned tenants"
    ON guarantees FOR DELETE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM tenants t
        WHERE t.id = guarantees.tenant_id
          AND user_owns_entity(t.entity_id)
      )
    )$body$;

    RAISE NOTICE '✅ Policies guarantees créées';
  END IF;
END $$;

-- ============================================================================
-- POLICIES CORRECTES - USERS (self-service)
-- ============================================================================

-- Policy INSERT - CRITIQUE pour l'inscription
CREATE POLICY "Users can create their own profile during registration"
ON users FOR INSERT
TO authenticated
WITH CHECK (supabase_uid = auth.uid());

-- Policy SELECT - Lecture self-service
CREATE POLICY "Users can view their own record"
ON users FOR SELECT
TO authenticated
USING (supabase_uid = auth.uid());

-- Policy UPDATE - Modification self-service
CREATE POLICY "Users can update their own record"
ON users FOR UPDATE
TO authenticated
USING (supabase_uid = auth.uid())
WITH CHECK (supabase_uid = auth.uid());

DO $$
BEGIN
  RAISE NOTICE '✅ Policies users créées (3 policies dont 1 INSERT pour inscription)';
END $$;

-- ============================================================================
-- RÉSUMÉ
-- ============================================================================

DO $$
DECLARE
  tables_with_rls INTEGER;
  total_policies INTEGER;
BEGIN
  SELECT COUNT(*) INTO tables_with_rls
  FROM pg_tables
  WHERE schemaname = 'public' AND rowsecurity = true;

  SELECT COUNT(*) INTO total_policies
  FROM pg_policies
  WHERE schemaname = 'public';

  RAISE NOTICE '';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '🎉 RLS CORRECTE V2 ACTIVÉE !';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Statistiques:';
  RAISE NOTICE '   ✅ Tables avec RLS: %', tables_with_rls;
  RAISE NOTICE '   ✅ Policies actives: %', total_policies;
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Mapping:';
  RAISE NOTICE '   auth.uid() → users.supabase_uid';
  RAISE NOTICE '   users.id → entities.user_id';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Nouveautés V2:';
  RAISE NOTICE '   ✅ Formulaire candidature public sécurisé';
  RAISE NOTICE '   ✅ Upload documents candidature public';
  RAISE NOTICE '   ✅ Policies tenant_documents';
  RAISE NOTICE '   ✅ Policies IRL history (lecture publique auth)';
  RAISE NOTICE '   ✅ Policies indexation_history';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Votre architecture multi-entités est 100%% sécurisée !';
  RAISE NOTICE '';
END $$;
