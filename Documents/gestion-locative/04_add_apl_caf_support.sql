-- ============================================================================
-- AJOUT DU SUPPORT APL/CAF
-- ============================================================================
--
-- Ce script ajoute les colonnes nécessaires pour gérer les APL/CAF :
-- - Versement direct au bailleur
-- - Montant APL mensuel
-- - Jour de versement CAF
-- - Nouveau type de paiement "caf"
--
-- Date : Décembre 2024
-- ============================================================================

-- ============================================================================
-- 1. AJOUTER LES COLONNES APL À LA TABLE leases
-- ============================================================================

DO $$
BEGIN
    -- Colonne caf_direct_payment
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'leases'
        AND column_name = 'caf_direct_payment'
    ) THEN
        ALTER TABLE leases
        ADD COLUMN caf_direct_payment BOOLEAN DEFAULT FALSE;

        RAISE NOTICE 'Colonne caf_direct_payment ajoutée à leases';
    ELSE
        RAISE NOTICE 'La colonne caf_direct_payment existe déjà';
    END IF;

    -- Colonne caf_amount
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'leases'
        AND column_name = 'caf_amount'
    ) THEN
        ALTER TABLE leases
        ADD COLUMN caf_amount DECIMAL(10,2) DEFAULT 0;

        RAISE NOTICE 'Colonne caf_amount ajoutée à leases';
    ELSE
        RAISE NOTICE 'La colonne caf_amount existe déjà';
    END IF;

    -- Colonne caf_payment_day
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'leases'
        AND column_name = 'caf_payment_day'
    ) THEN
        ALTER TABLE leases
        ADD COLUMN caf_payment_day INTEGER DEFAULT 5 CHECK (caf_payment_day >= 1 AND caf_payment_day <= 28);

        RAISE NOTICE 'Colonne caf_payment_day ajoutée à leases';
    ELSE
        RAISE NOTICE 'La colonne caf_payment_day existe déjà';
    END IF;
END $$;

-- Commentaires sur les colonnes
COMMENT ON COLUMN leases.caf_direct_payment IS 'Indique si les APL sont versées directement au bailleur';
COMMENT ON COLUMN leases.caf_amount IS 'Montant mensuel des APL versées par la CAF (en euros)';
COMMENT ON COLUMN leases.caf_payment_day IS 'Jour du mois où la CAF verse les APL (généralement le 5)';


-- ============================================================================
-- 2. AJOUTER "caf" COMME MÉTHODE DE PAIEMENT
-- ============================================================================

-- Vérifier si le type payment_method existe et contient déjà 'caf'
DO $$
BEGIN
    -- Vérifier si le type existe
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
        -- Vérifier si 'caf' est déjà dans les valeurs
        IF NOT EXISTS (
            SELECT 1
            FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'payment_method'
            AND e.enumlabel = 'caf'
        ) THEN
            -- Ajouter 'caf' au type enum
            ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'caf';
            RAISE NOTICE 'Valeur "caf" ajoutée au type payment_method';
        ELSE
            RAISE NOTICE 'La valeur "caf" existe déjà dans payment_method';
        END IF;
    ELSE
        RAISE NOTICE 'Le type payment_method n''existe pas encore, il sera créé avec toutes les valeurs';
    END IF;
END $$;


-- ============================================================================
-- 3. CRÉER UN INDEX SUR LES BAUX AVEC APL
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_leases_caf_direct_payment
ON leases(caf_direct_payment)
WHERE caf_direct_payment = true;

COMMENT ON INDEX idx_leases_caf_direct_payment IS 'Index pour retrouver rapidement les baux avec APL en versement direct';


-- ============================================================================
-- 4. FONCTION UTILITAIRE : CALCULER LE RESTE À CHARGE
-- ============================================================================

-- Fonction pour calculer le reste à charge locataire
CREATE OR REPLACE FUNCTION calculate_tenant_remaining_charge(
    p_rent_amount DECIMAL,
    p_charges_amount DECIMAL,
    p_caf_amount DECIMAL
)
RETURNS DECIMAL AS $$
BEGIN
    RETURN (COALESCE(p_rent_amount, 0) + COALESCE(p_charges_amount, 0)) - COALESCE(p_caf_amount, 0);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_tenant_remaining_charge IS 'Calcule le reste à charge du locataire après déduction des APL';


-- ============================================================================
-- 5. VUE UTILITAIRE : BAUX AVEC INFOS APL
-- ============================================================================

-- Vue pour afficher les baux avec calculs APL
CREATE OR REPLACE VIEW leases_with_apl_info AS
SELECT
    l.id,
    l.lot_id,
    l.tenant_id,
    l.start_date,
    l.end_date,
    l.rent_amount,
    l.charges_amount,
    l.rent_amount + l.charges_amount as total_rent,
    l.caf_direct_payment,
    l.caf_amount,
    l.caf_payment_day,
    calculate_tenant_remaining_charge(l.rent_amount, l.charges_amount, l.caf_amount) as tenant_remaining_charge,
    l.deposit_amount,
    l.payment_day,
    l.lease_type,
    l.status,
    l.special_clauses,
    l.created_at,
    l.updated_at
FROM leases l;

COMMENT ON VIEW leases_with_apl_info IS 'Vue des baux avec calculs APL (loyer total, reste à charge)';


-- ============================================================================
-- 6. TRIGGER : METTRE À JOUR LE STATUT DU LOT AUTOMATIQUEMENT
-- ============================================================================

-- Fonction trigger pour mettre à jour le statut du lot
CREATE OR REPLACE FUNCTION update_lot_status_on_lease_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Si le bail devient actif, marquer le lot comme occupé
    IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') THEN
        UPDATE lots
        SET status = 'occupied',
            updated_at = NOW()
        WHERE id = NEW.lot_id;

        RAISE NOTICE 'Lot % marqué comme occupé (bail % actif)', NEW.lot_id, NEW.id;
    END IF;

    -- Si le bail devient terminé ou archivé, marquer le lot comme vacant
    IF (NEW.status IN ('terminated', 'archived')) AND (OLD.status IS NULL OR OLD.status NOT IN ('terminated', 'archived')) THEN
        UPDATE lots
        SET status = 'vacant',
            updated_at = NOW()
        WHERE id = NEW.lot_id;

        RAISE NOTICE 'Lot % marqué comme vacant (bail % terminé)', NEW.lot_id, NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_update_lot_status ON leases;
CREATE TRIGGER trigger_update_lot_status
    AFTER INSERT OR UPDATE OF status
    ON leases
    FOR EACH ROW
    EXECUTE FUNCTION update_lot_status_on_lease_change();

COMMENT ON TRIGGER trigger_update_lot_status ON leases IS 'Met à jour automatiquement le statut du lot quand un bail change de statut';


-- ============================================================================
-- 7. RÉSUMÉ DES MODIFICATIONS
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SUPPORT APL/CAF AJOUTÉ AVEC SUCCÈS';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Modifications apportées :';
    RAISE NOTICE '1. 3 colonnes APL ajoutées à leases (caf_direct_payment, caf_amount, caf_payment_day)';
    RAISE NOTICE '2. Méthode de paiement "caf" ajoutée';
    RAISE NOTICE '3. Index créé pour les baux avec APL';
    RAISE NOTICE '4. Fonction calculate_tenant_remaining_charge créée';
    RAISE NOTICE '5. Vue leases_with_apl_info créée';
    RAISE NOTICE '6. Trigger automatique pour mettre à jour le statut des lots';
    RAISE NOTICE '';
    RAISE NOTICE 'PROCHAINES ÉTAPES :';
    RAISE NOTICE '1. Mettre à jour LeaseForm.jsx pour gérer les APL';
    RAISE NOTICE '2. Mettre à jour Tenants.jsx pour afficher les infos APL';
    RAISE NOTICE '3. Mettre à jour PaymentForm.jsx pour gérer les paiements CAF';
    RAISE NOTICE '========================================';
END $$;


-- ============================================================================
-- 8. REQUÊTES DE VÉRIFICATION
-- ============================================================================

-- Vérifier les colonnes ajoutées
SELECT
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'leases'
AND column_name IN ('caf_direct_payment', 'caf_amount', 'caf_payment_day')
ORDER BY column_name;

-- Tester la fonction de calcul
SELECT
    calculate_tenant_remaining_charge(950.00, 80.00, 200.00) as reste_a_charge,
    'Loyer: 950 + Charges: 80 - APL: 200 = 830' as explication;

-- Afficher un exemple de la vue
SELECT
    id,
    total_rent,
    caf_amount,
    tenant_remaining_charge,
    status
FROM leases_with_apl_info
LIMIT 5;
