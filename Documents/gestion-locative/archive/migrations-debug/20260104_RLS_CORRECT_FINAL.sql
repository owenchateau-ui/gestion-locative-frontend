-- ============================================================================
-- RLS CORRECT - Compatible avec l'architecture réelle
-- ============================================================================
-- Date: 2026-01-04
-- Description: RLS basé sur la vraie structure users.supabase_uid = auth.uid()
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔐 ACTIVATION RLS CORRECTE';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Mapping: auth.uid() → users.supabase_uid → users.id → entities.user_id';
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

  RAISE NOTICE '✅ Anciennes policies supprimées';
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
    EXECUTE 'CREATE POLICY "Users can view candidates of owned lots"
    ON candidates FOR SELECT
    TO authenticated
    USING (user_owns_lot(lot_id))';

    EXECUTE 'CREATE POLICY "Users can insert candidates into owned lots"
    ON candidates FOR INSERT
    TO authenticated
    WITH CHECK (user_owns_lot(lot_id))';

    EXECUTE 'CREATE POLICY "Users can update candidates of owned lots"
    ON candidates FOR UPDATE
    TO authenticated
    USING (user_owns_lot(lot_id))
    WITH CHECK (user_owns_lot(lot_id))';

    EXECUTE 'CREATE POLICY "Users can delete candidates of owned lots"
    ON candidates FOR DELETE
    TO authenticated
    USING (user_owns_lot(lot_id))';

    RAISE NOTICE '✅ Policies candidates créées';
  END IF;
END $$;

-- ============================================================================
-- POLICIES CORRECTES - TENANT_GROUPS (si la table existe)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'tenant_groups') THEN
    EXECUTE 'CREATE POLICY "Users can view tenant_groups of owned entities"
    ON tenant_groups FOR SELECT
    TO authenticated
    USING (user_owns_entity(entity_id))';

    EXECUTE 'CREATE POLICY "Users can insert tenant_groups into owned entities"
    ON tenant_groups FOR INSERT
    TO authenticated
    WITH CHECK (user_owns_entity(entity_id))';

    EXECUTE 'CREATE POLICY "Users can update tenant_groups of owned entities"
    ON tenant_groups FOR UPDATE
    TO authenticated
    USING (user_owns_entity(entity_id))
    WITH CHECK (user_owns_entity(entity_id))';

    EXECUTE 'CREATE POLICY "Users can delete tenant_groups of owned entities"
    ON tenant_groups FOR DELETE
    TO authenticated
    USING (user_owns_entity(entity_id))';

    RAISE NOTICE '✅ Policies tenant_groups créées';
  END IF;
END $$;

-- ============================================================================
-- POLICIES CORRECTES - GUARANTEES (si la table existe)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'guarantees') THEN
    EXECUTE 'CREATE POLICY "Users can view guarantees of owned tenants"
    ON guarantees FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM tenants t
        WHERE t.id = guarantees.tenant_id
          AND user_owns_entity(t.entity_id)
      )
    )';

    EXECUTE 'CREATE POLICY "Users can insert guarantees for owned tenants"
    ON guarantees FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM tenants t
        WHERE t.id = tenant_id
          AND user_owns_entity(t.entity_id)
      )
    )';

    EXECUTE 'CREATE POLICY "Users can update guarantees of owned tenants"
    ON guarantees FOR UPDATE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM tenants t
        WHERE t.id = guarantees.tenant_id
          AND user_owns_entity(t.entity_id)
      )
    )';

    EXECUTE 'CREATE POLICY "Users can delete guarantees of owned tenants"
    ON guarantees FOR DELETE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM tenants t
        WHERE t.id = guarantees.tenant_id
          AND user_owns_entity(t.entity_id)
      )
    )';

    RAISE NOTICE '✅ Policies guarantees créées';
  END IF;
END $$;

-- ============================================================================
-- POLICIES CORRECTES - USERS (self-service)
-- ============================================================================

CREATE POLICY "Users can view their own record"
ON users FOR SELECT
TO authenticated
USING (supabase_uid = auth.uid());

CREATE POLICY "Users can update their own record"
ON users FOR UPDATE
TO authenticated
USING (supabase_uid = auth.uid())
WITH CHECK (supabase_uid = auth.uid());

DO $$
BEGIN
  RAISE NOTICE '✅ Policies users créées';
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
  RAISE NOTICE '🎉 RLS CORRECTE ACTIVÉE !';
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
  RAISE NOTICE '✅ Votre architecture multi-entités est sécurisée !';
  RAISE NOTICE '';
END $$;
