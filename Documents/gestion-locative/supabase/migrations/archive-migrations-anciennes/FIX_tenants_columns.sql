-- Ajouter toutes les colonnes manquantes à tenants

-- Colonnes de base
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES tenant_groups(id) ON DELETE CASCADE;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS is_main_tenant BOOLEAN DEFAULT FALSE;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS relationship VARCHAR(100);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS birth_place VARCHAR(100);

-- Colonnes professionnelles
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS professional_status VARCHAR(100);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS employer_name VARCHAR(255);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS job_title VARCHAR(255);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS contract_type VARCHAR(100);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS employment_start_date DATE;

-- Colonnes revenus
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS monthly_income DECIMAL(10,2) DEFAULT 0;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS other_income DECIMAL(10,2) DEFAULT 0;

-- Index
CREATE INDEX IF NOT EXISTS idx_tenants_group ON tenants(group_id);
CREATE INDEX IF NOT EXISTS idx_tenants_main ON tenants(is_main_tenant) WHERE is_main_tenant = TRUE;

-- Mettre à jour la politique RLS
DROP POLICY IF EXISTS tenants_policy ON tenants;

CREATE POLICY tenants_policy ON tenants
    FOR ALL
    USING (
        auth.uid() = (
            SELECT u.supabase_uid
            FROM users u
            WHERE (
                u.id IN (
                    SELECT e.user_id FROM entities e WHERE e.id = tenants.entity_id
                )
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
                u.id IN (
                    SELECT e.user_id FROM entities e WHERE e.id = tenants.entity_id
                )
                OR (tenants.group_id IS NOT NULL AND u.id IN (
                    SELECT e.user_id
                    FROM entities e
                    INNER JOIN tenant_groups tg ON tg.entity_id = e.id
                    WHERE tg.id = tenants.group_id
                ))
            )
        )
    );

NOTIFY pgrst, 'reload schema';

SELECT '✅ Toutes les colonnes ajoutées à tenants' AS status;
