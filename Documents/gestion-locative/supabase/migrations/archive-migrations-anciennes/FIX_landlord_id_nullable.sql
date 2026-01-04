-- ============================================================================
-- CORRECTION : Rendre landlord_id nullable dans tenants
-- ============================================================================
-- Raison : Avec le système tenant_groups, landlord_id n'est plus obligatoire
-- Les locataires sont liés via entity_id (directement) ou group_id (via tenant_groups)

-- 1. Rendre landlord_id nullable
ALTER TABLE tenants
ALTER COLUMN landlord_id DROP NOT NULL;

-- 2. Créer un index pour les requêtes sur landlord_id (si pas déjà existant)
CREATE INDEX IF NOT EXISTS idx_tenants_landlord ON tenants(landlord_id) WHERE landlord_id IS NOT NULL;

-- 3. Notification pour rafraîchir le cache
NOTIFY pgrst, 'reload schema';

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Colonne landlord_id rendue nullable';
    RAISE NOTICE '✅ Index créé pour landlord_id';
    RAISE NOTICE '✅ Cache rafraîchi';
    RAISE NOTICE '';
    RAISE NOTICE 'Vous pouvez maintenant créer des locataires via tenant_groups !';
END $$;
