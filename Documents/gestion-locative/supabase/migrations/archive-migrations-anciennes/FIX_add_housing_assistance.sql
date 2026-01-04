-- ============================================================================
-- CORRECTION : Ajouter housing_assistance à tenant_groups
-- ============================================================================
-- Raison : Besoin de stocker le montant des aides au logement (CAF/APL)
-- pour calculer correctement le loyer net et le taux d'effort

-- 1. Ajouter la colonne housing_assistance
ALTER TABLE tenant_groups
ADD COLUMN IF NOT EXISTS housing_assistance DECIMAL(10,2) DEFAULT 0;

-- 2. Créer un commentaire sur la colonne
COMMENT ON COLUMN tenant_groups.housing_assistance IS 'Montant mensuel des aides au logement (CAF, APL, etc.)';

-- 3. Notification pour rafraîchir le cache
NOTIFY pgrst, 'reload schema';

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Colonne housing_assistance ajoutée à tenant_groups';
    RAISE NOTICE '✅ Cache rafraîchi';
    RAISE NOTICE '';
    RAISE NOTICE 'Vous pouvez maintenant enregistrer les aides au logement pour les groupes de locataires !';
END $$;
