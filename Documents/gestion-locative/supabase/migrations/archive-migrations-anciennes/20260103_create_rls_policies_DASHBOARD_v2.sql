-- ============================================================================
-- CRÉATION POLICIES RLS (Row Level Security) - VERSION CORRIGÉE
-- Date: 2026-01-03
-- Priorité: CRITIQUE
-- VERSION: v2 - Pour Supabase Dashboard SQL Editor
-- ============================================================================

-- PRÉREQUIS: Avoir exécuté 20260103_activate_rls_DASHBOARD.sql AVANT

-- ============================================================================
-- HELPER FUNCTION
-- ============================================================================

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

-- ============================================================================
-- POLICIES: USERS
-- ============================================================================

CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ============================================================================
-- POLICIES: ENTITIES
-- ============================================================================

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
-- POLICIES: TENANT_GROUPS (Structure corrigée)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'tenant_groups') THEN
    -- Les tenant_groups ont un entity_id direct
    EXECUTE 'CREATE POLICY "Users can view tenant_groups of owned entities"
    ON tenant_groups FOR SELECT
    USING (user_owns_entity(entity_id))';

    EXECUTE 'CREATE POLICY "Users can insert tenant_groups for owned entities"
    ON tenant_groups FOR INSERT
    WITH CHECK (user_owns_entity(entity_id))';

    EXECUTE 'CREATE POLICY "Users can update tenant_groups of owned entities"
    ON tenant_groups FOR UPDATE
    USING (user_owns_entity(entity_id))
    WITH CHECK (user_owns_entity(entity_id))';

    EXECUTE 'CREATE POLICY "Users can delete tenant_groups of owned entities"
    ON tenant_groups FOR DELETE
    USING (user_owns_entity(entity_id))';
  END IF;
END $$;

-- ============================================================================
-- POLICIES: GUARANTEES
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'guarantees') THEN
    EXECUTE 'CREATE POLICY "Users can view guarantees via tenants"
    ON guarantees FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM tenants t
        WHERE t.id = guarantees.tenant_id
          AND user_owns_entity(t.entity_id)
      )
    )';

    EXECUTE 'CREATE POLICY "Users can insert guarantees via tenants"
    ON guarantees FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM tenants t
        WHERE t.id = tenant_id
          AND user_owns_entity(t.entity_id)
      )
    )';

    EXECUTE 'CREATE POLICY "Users can update guarantees via tenants"
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
    )';

    EXECUTE 'CREATE POLICY "Users can delete guarantees via tenants"
    ON guarantees FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM tenants t
        WHERE t.id = guarantees.tenant_id
          AND user_owns_entity(t.entity_id)
      )
    )';
  END IF;
END $$;

-- ============================================================================
-- POLICIES: TENANT_DOCUMENTS
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'tenant_documents') THEN
    EXECUTE 'CREATE POLICY "Users can view tenant_documents via tenants"
    ON tenant_documents FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM tenants t
        WHERE t.id = tenant_documents.tenant_id
          AND user_owns_entity(t.entity_id)
      )
    )';

    EXECUTE 'CREATE POLICY "Users can insert tenant_documents via tenants"
    ON tenant_documents FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM tenants t
        WHERE t.id = tenant_id
          AND user_owns_entity(t.entity_id)
      )
    )';

    EXECUTE 'CREATE POLICY "Users can update tenant_documents via tenants"
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
    )';

    EXECUTE 'CREATE POLICY "Users can delete tenant_documents via tenants"
    ON tenant_documents FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM tenants t
        WHERE t.id = tenant_documents.tenant_id
          AND user_owns_entity(t.entity_id)
      )
    )';
  END IF;
END $$;

-- ============================================================================
-- POLICIES: LEASES
-- ============================================================================

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
-- POLICIES: CANDIDATES, DOCUMENTS, LINKS (si existent)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'candidates') THEN
    EXECUTE 'CREATE POLICY "Users can view candidates via lots"
    ON candidates FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM lots l
        JOIN properties_new p ON p.id = l.property_id
        WHERE l.id = candidates.lot_id
          AND user_owns_entity(p.entity_id)
      )
    )';

    EXECUTE 'CREATE POLICY "Users can insert candidates via lots"
    ON candidates FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM lots l
        JOIN properties_new p ON p.id = l.property_id
        WHERE l.id = lot_id
          AND user_owns_entity(p.entity_id)
      )
    )';

    EXECUTE 'CREATE POLICY "Users can update candidates via lots"
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
    )';

    EXECUTE 'CREATE POLICY "Users can delete candidates via lots"
    ON candidates FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM lots l
        JOIN properties_new p ON p.id = l.property_id
        WHERE l.id = candidates.lot_id
          AND user_owns_entity(p.entity_id)
      )
    )';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'candidate_documents') THEN
    EXECUTE 'CREATE POLICY "Users can view candidate_documents via candidates"
    ON candidate_documents FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM candidates c
        JOIN lots l ON l.id = c.lot_id
        JOIN properties_new p ON p.id = l.property_id
        WHERE c.id = candidate_documents.candidate_id
          AND user_owns_entity(p.entity_id)
      )
    )';

    EXECUTE 'CREATE POLICY "Users can insert candidate_documents via candidates"
    ON candidate_documents FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM candidates c
        JOIN lots l ON l.id = c.lot_id
        JOIN properties_new p ON p.id = l.property_id
        WHERE c.id = candidate_id
          AND user_owns_entity(p.entity_id)
      )
    )';

    EXECUTE 'CREATE POLICY "Users can update candidate_documents via candidates"
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
    )';

    EXECUTE 'CREATE POLICY "Users can delete candidate_documents via candidates"
    ON candidate_documents FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM candidates c
        JOIN lots l ON l.id = c.lot_id
        JOIN properties_new p ON p.id = l.property_id
        WHERE c.id = candidate_documents.candidate_id
          AND user_owns_entity(p.entity_id)
      )
    )';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'invitation_links') THEN
    EXECUTE 'CREATE POLICY "Users can view invitation_links via lots"
    ON invitation_links FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM lots l
        JOIN properties_new p ON p.id = l.property_id
        WHERE l.id = invitation_links.lot_id
          AND user_owns_entity(p.entity_id)
      )
    )';

    EXECUTE 'CREATE POLICY "Users can insert invitation_links via lots"
    ON invitation_links FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM lots l
        JOIN properties_new p ON p.id = l.property_id
        WHERE l.id = lot_id
          AND user_owns_entity(p.entity_id)
      )
    )';

    EXECUTE 'CREATE POLICY "Users can update invitation_links via lots"
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
    )';

    EXECUTE 'CREATE POLICY "Users can delete invitation_links via lots"
    ON invitation_links FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM lots l
        JOIN properties_new p ON p.id = l.property_id
        WHERE l.id = invitation_links.lot_id
          AND user_owns_entity(p.entity_id)
      )
    )';
  END IF;
END $$;

-- ============================================================================
-- POLICIES: IRL_HISTORY (lecture seule)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'irl_history') THEN
    EXECUTE 'CREATE POLICY "Authenticated users can view IRL history"
    ON irl_history FOR SELECT
    USING (auth.uid() IS NOT NULL)';
  END IF;
END $$;

-- ============================================================================
-- POLICIES: INDEXATION_HISTORY
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'indexation_history') THEN
    EXECUTE 'CREATE POLICY "Users can view indexation_history via leases"
    ON indexation_history FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM leases le
        JOIN lots l ON l.id = le.lot_id
        JOIN properties_new p ON p.id = l.property_id
        WHERE le.id = indexation_history.lease_id
          AND user_owns_entity(p.entity_id)
      )
    )';

    EXECUTE 'CREATE POLICY "Users can insert indexation_history via leases"
    ON indexation_history FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM leases le
        JOIN lots l ON l.id = le.lot_id
        JOIN properties_new p ON p.id = l.property_id
        WHERE le.id = lease_id
          AND user_owns_entity(p.entity_id)
      )
    )';

    EXECUTE 'CREATE POLICY "Users can update indexation_history via leases"
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
    )';

    EXECUTE 'CREATE POLICY "Users can delete indexation_history via leases"
    ON indexation_history FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM leases le
        JOIN lots l ON l.id = le.lot_id
        JOIN properties_new p ON p.id = l.property_id
        WHERE le.id = indexation_history.lease_id
          AND user_owns_entity(p.entity_id)
      )
    )';
  END IF;
END $$;

-- ============================================================================
-- VÉRIFICATION FINALE
-- ============================================================================

DO $$
DECLARE
  total_tables INTEGER;
  tables_with_rls INTEGER;
  tables_with_policies INTEGER;
  total_policies INTEGER;
  security_score INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_tables
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
    AND tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns');

  SELECT COUNT(*) INTO tables_with_rls
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
    AND rowsecurity = true;

  SELECT COUNT(DISTINCT tablename) INTO tables_with_policies
  FROM pg_policies
  WHERE schemaname = 'public';

  SELECT COUNT(*) INTO total_policies
  FROM pg_policies
  WHERE schemaname = 'public';

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
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'RÉSULTATS CRÉATION POLICIES RLS';
  RAISE NOTICE '===========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'État final:';
  RAISE NOTICE '  - Total tables: %', total_tables;
  RAISE NOTICE '  - Tables avec RLS: % ✅', tables_with_rls;
  RAISE NOTICE '  - Tables avec policies: % ✅', tables_with_policies;
  RAISE NOTICE '  - Total policies créées: % 🔐', total_policies;
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Score de sécurité: %/100', security_score;
  RAISE NOTICE '';

  IF security_score = 100 THEN
    RAISE NOTICE '🎉 PARFAIT! RLS est complètement configuré.';
  ELSIF security_score >= 80 THEN
    RAISE NOTICE '✅ BIEN! La plupart des tables sont protégées.';
  ELSIF security_score >= 50 THEN
    RAISE NOTICE '⚠️  MOYEN. Plusieurs tables manquent de protection.';
  ELSE
    RAISE NOTICE '❌ CRITIQUE! RLS n''est pas correctement configuré.';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '===========================================';
END $$;
