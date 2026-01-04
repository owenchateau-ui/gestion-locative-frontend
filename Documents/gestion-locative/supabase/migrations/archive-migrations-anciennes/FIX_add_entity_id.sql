-- ============================================================================
-- CORRECTION : Ajouter entity_id à tenant_groups
-- ============================================================================

-- 1. Ajouter la colonne entity_id
ALTER TABLE tenant_groups
ADD COLUMN entity_id UUID;

-- 2. Remplir avec une entité par défaut (prendre la première)
UPDATE tenant_groups
SET entity_id = (SELECT id FROM entities LIMIT 1)
WHERE entity_id IS NULL;

-- 3. Rendre la colonne obligatoire
ALTER TABLE tenant_groups
ALTER COLUMN entity_id SET NOT NULL;

-- 4. Ajouter la contrainte de clé étrangère
ALTER TABLE tenant_groups
ADD CONSTRAINT tenant_groups_entity_id_fkey
FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE;

-- 5. Créer l'index
CREATE INDEX IF NOT EXISTS idx_tenant_groups_entity ON tenant_groups(entity_id);

-- 6. Mettre à jour la politique RLS
DROP POLICY IF EXISTS tenant_groups_policy ON tenant_groups;

CREATE POLICY tenant_groups_policy ON tenant_groups
    FOR ALL
    USING (
        auth.uid() = (
            SELECT u.supabase_uid
            FROM users u
            INNER JOIN entities e ON e.user_id = u.id
            WHERE e.id = tenant_groups.entity_id
        )
    )
    WITH CHECK (
        auth.uid() = (
            SELECT u.supabase_uid
            FROM users u
            INNER JOIN entities e ON e.user_id = u.id
            WHERE e.id = tenant_groups.entity_id
        )
    );

-- 7. Notification pour rafraîchir le cache
NOTIFY pgrst, 'reload schema';

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Colonne entity_id ajoutée à tenant_groups';
    RAISE NOTICE '✅ Contrainte FK créée';
    RAISE NOTICE '✅ Index créé';
    RAISE NOTICE '✅ Politique RLS mise à jour';
    RAISE NOTICE '✅ Cache rafraîchi';
    RAISE NOTICE '';
    RAISE NOTICE 'Vous pouvez maintenant créer des locataires !';
END $$;
