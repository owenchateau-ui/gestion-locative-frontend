-- ============================================================================
-- MIGRATION : Création de l'architecture tenant_groups
-- ============================================================================
--
-- Ce script crée la table tenant_groups et ajoute les colonnes nécessaires
-- à la table tenants pour supporter les groupes de locataires (couples, colocations)
--
-- Date : 2 Janvier 2026
-- ============================================================================

-- ============================================================================
-- 1. CRÉATION DES TYPES ENUM
-- ============================================================================

-- Type pour les types de groupes de locataires
DO $$ BEGIN
    CREATE TYPE group_type AS ENUM (
        'individual',    -- Locataire seul
        'couple',        -- Couple (2 personnes)
        'colocation'     -- Colocation (2+ personnes)
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Type pour le statut couple
DO $$ BEGIN
    CREATE TYPE couple_status AS ENUM (
        'married',       -- Mariés
        'pacs',          -- Pacsés
        'concubinage'    -- Concubinage
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 2. CRÉATION DE LA TABLE tenant_groups
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenant_groups (
    -- Identifiant unique
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Relation avec l'entité
    entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,

    -- Informations du groupe
    name VARCHAR(255) NOT NULL,
    group_type group_type NOT NULL DEFAULT 'individual',
    couple_status couple_status,

    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Contraintes
    CONSTRAINT tenant_groups_couple_status_check
        CHECK (
            (group_type = 'couple' AND couple_status IS NOT NULL) OR
            (group_type != 'couple' AND couple_status IS NULL)
        )
);

-- Commentaires
COMMENT ON TABLE tenant_groups IS 'Groupes de locataires : individuel, couple, colocation';
COMMENT ON COLUMN tenant_groups.name IS 'Nom du groupe (ex: "Jean Dupont & Marie Martin")';
COMMENT ON COLUMN tenant_groups.group_type IS 'Type de groupe : individual, couple, colocation';
COMMENT ON COLUMN tenant_groups.couple_status IS 'Statut du couple si group_type = couple';

-- ============================================================================
-- 3. AJOUT DES COLONNES À LA TABLE tenants
-- ============================================================================

-- Colonne group_id (lien vers tenant_groups)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tenants' AND column_name = 'group_id'
    ) THEN
        ALTER TABLE tenants
        ADD COLUMN group_id UUID REFERENCES tenant_groups(id) ON DELETE CASCADE;

        RAISE NOTICE 'Colonne group_id ajoutée à tenants';
    END IF;
END $$;

-- Colonne is_main_tenant (indicateur locataire principal du groupe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tenants' AND column_name = 'is_main_tenant'
    ) THEN
        ALTER TABLE tenants
        ADD COLUMN is_main_tenant BOOLEAN DEFAULT FALSE;

        RAISE NOTICE 'Colonne is_main_tenant ajoutée à tenants';
    END IF;
END $$;

-- Colonne relationship (relation avec le locataire principal)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tenants' AND column_name = 'relationship'
    ) THEN
        ALTER TABLE tenants
        ADD COLUMN relationship VARCHAR(100);

        RAISE NOTICE 'Colonne relationship ajoutée à tenants';
    END IF;
END $$;

-- Colonne birth_place
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tenants' AND column_name = 'birth_place'
    ) THEN
        ALTER TABLE tenants
        ADD COLUMN birth_place VARCHAR(100);

        RAISE NOTICE 'Colonne birth_place ajoutée à tenants';
    END IF;
END $$;

-- ============================================================================
-- 4. AJOUT DES COLONNES PROFESSIONNELLES À tenants
-- ============================================================================

-- Statut professionnel
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tenants' AND column_name = 'professional_status'
    ) THEN
        ALTER TABLE tenants
        ADD COLUMN professional_status VARCHAR(100);

        RAISE NOTICE 'Colonne professional_status ajoutée à tenants';
    END IF;
END $$;

-- Employeur
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tenants' AND column_name = 'employer_name'
    ) THEN
        ALTER TABLE tenants
        ADD COLUMN employer_name VARCHAR(255);

        RAISE NOTICE 'Colonne employer_name ajoutée à tenants';
    END IF;
END $$;

-- Poste
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tenants' AND column_name = 'job_title'
    ) THEN
        ALTER TABLE tenants
        ADD COLUMN job_title VARCHAR(255);

        RAISE NOTICE 'Colonne job_title ajoutée à tenants';
    END IF;
END $$;

-- Type de contrat
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tenants' AND column_name = 'contract_type'
    ) THEN
        ALTER TABLE tenants
        ADD COLUMN contract_type VARCHAR(100);

        RAISE NOTICE 'Colonne contract_type ajoutée à tenants';
    END IF;
END $$;

-- Date de début d'emploi
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tenants' AND column_name = 'employment_start_date'
    ) THEN
        ALTER TABLE tenants
        ADD COLUMN employment_start_date DATE;

        RAISE NOTICE 'Colonne employment_start_date ajoutée à tenants';
    END IF;
END $$;

-- ============================================================================
-- 5. AJOUT DES COLONNES DE REVENUS À tenants
-- ============================================================================

-- Revenus mensuels
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tenants' AND column_name = 'monthly_income'
    ) THEN
        ALTER TABLE tenants
        ADD COLUMN monthly_income DECIMAL(10,2) DEFAULT 0;

        RAISE NOTICE 'Colonne monthly_income ajoutée à tenants';
    END IF;
END $$;

-- Autres revenus
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tenants' AND column_name = 'other_income'
    ) THEN
        ALTER TABLE tenants
        ADD COLUMN other_income DECIMAL(10,2) DEFAULT 0;

        RAISE NOTICE 'Colonne other_income ajoutée à tenants';
    END IF;
END $$;

-- ============================================================================
-- 6. CRÉATION DES INDEX
-- ============================================================================

-- Index sur tenant_groups
CREATE INDEX IF NOT EXISTS idx_tenant_groups_entity
ON tenant_groups(entity_id);

CREATE INDEX IF NOT EXISTS idx_tenant_groups_type
ON tenant_groups(group_type);

-- Index sur tenants
CREATE INDEX IF NOT EXISTS idx_tenants_group
ON tenants(group_id);

CREATE INDEX IF NOT EXISTS idx_tenants_main
ON tenants(is_main_tenant)
WHERE is_main_tenant = TRUE;

-- ============================================================================
-- 7. TRIGGER POUR updated_at
-- ============================================================================

CREATE TRIGGER trigger_tenant_groups_updated_at
    BEFORE UPDATE ON tenant_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. ACTIVATION DE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE tenant_groups ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour tenant_groups : via l'entité
CREATE POLICY tenant_groups_policy ON tenant_groups
    FOR ALL
    USING (
        auth.uid() = (
            SELECT u.supabase_uid
            FROM users u
            INNER JOIN entities e ON e.user_id = u.id
            WHERE e.id = entity_id
        )
    )
    WITH CHECK (
        auth.uid() = (
            SELECT u.supabase_uid
            FROM users u
            INNER JOIN entities e ON e.user_id = u.id
            WHERE e.id = entity_id
        )
    );

-- Mettre à jour la politique RLS des tenants pour prendre en compte les groupes
DROP POLICY IF EXISTS tenants_policy ON tenants;

CREATE POLICY tenants_policy ON tenants
    FOR ALL
    USING (
        auth.uid() = (
            SELECT u.supabase_uid
            FROM users u
            WHERE (
                -- Via entity_id direct
                u.id IN (
                    SELECT e.user_id
                    FROM entities e
                    WHERE e.id = tenants.entity_id
                )
                -- Via group_id
                OR (tenants.group_id IS NOT NULL AND u.id IN (
                    SELECT e.user_id
                    FROM entities e
                    INNER JOIN tenant_groups tg ON tg.entity_id = e.id
                    WHERE tg.id = tenants.group_id
                ))
            )
        )
    )
    WITH CHECK (
        auth.uid() = (
            SELECT u.supabase_uid
            FROM users u
            WHERE (
                -- Via entity_id direct
                u.id IN (
                    SELECT e.user_id
                    FROM entities e
                    WHERE e.id = tenants.entity_id
                )
                -- Via group_id
                OR (tenants.group_id IS NOT NULL AND u.id IN (
                    SELECT e.user_id
                    FROM entities e
                    INNER JOIN tenant_groups tg ON tg.entity_id = e.id
                    WHERE tg.id = tenants.group_id
                ))
            )
        )
    );

-- ============================================================================
-- 9. COMMENTAIRES SUR LES COLONNES
-- ============================================================================

COMMENT ON COLUMN tenants.group_id IS 'Groupe de locataires auquel appartient ce locataire';
COMMENT ON COLUMN tenants.is_main_tenant IS 'TRUE si locataire principal du groupe';
COMMENT ON COLUMN tenants.relationship IS 'Relation avec le locataire principal (spouse, partner, colocataire, etc.)';
COMMENT ON COLUMN tenants.professional_status IS 'Statut professionnel (cdi, cdd, freelance, student, etc.)';
COMMENT ON COLUMN tenants.employer_name IS 'Nom de l''employeur';
COMMENT ON COLUMN tenants.job_title IS 'Intitulé du poste';
COMMENT ON COLUMN tenants.contract_type IS 'Type de contrat (cdi, cdd, interim, etc.)';
COMMENT ON COLUMN tenants.employment_start_date IS 'Date de début du contrat de travail';
COMMENT ON COLUMN tenants.monthly_income IS 'Revenus mensuels nets en euros';
COMMENT ON COLUMN tenants.other_income IS 'Autres revenus mensuels (pensions, allocations, etc.)';

-- ============================================================================
-- 10. RÉSUMÉ
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'MIGRATION tenant_groups TERMINÉE';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Tables créées :';
    RAISE NOTICE '✅ tenant_groups';
    RAISE NOTICE '';
    RAISE NOTICE 'Colonnes ajoutées à tenants :';
    RAISE NOTICE '✅ group_id';
    RAISE NOTICE '✅ is_main_tenant';
    RAISE NOTICE '✅ relationship';
    RAISE NOTICE '✅ birth_place';
    RAISE NOTICE '✅ professional_status';
    RAISE NOTICE '✅ employer_name';
    RAISE NOTICE '✅ job_title';
    RAISE NOTICE '✅ contract_type';
    RAISE NOTICE '✅ employment_start_date';
    RAISE NOTICE '✅ monthly_income';
    RAISE NOTICE '✅ other_income';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 Row Level Security activé';
    RAISE NOTICE '📊 Index créés';
    RAISE NOTICE '';
    RAISE NOTICE 'Vous pouvez maintenant utiliser le module Locataires !';
    RAISE NOTICE '========================================';
END $$;
