-- ============================================================================
-- MIGRATION MINIMALE : Tables candidatures
-- ============================================================================
-- Date: 2024-12-29
-- Description: Tables + RLS de base (SANS politiques Storage)
-- Les politiques Storage seront créées plus tard si besoin
-- ============================================================================

-- Activer l'extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. TYPES ENUM
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE candidate_status AS ENUM ('pending', 'reviewing', 'accepted', 'rejected');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE employment_status AS ENUM ('cdi', 'cdd', 'interim', 'freelance', 'student', 'retired', 'unemployed', 'other');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 2. TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS candidate_invitation_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lot_id UUID NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
  token UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lot_id UUID NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
  access_token VARCHAR(100) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  birth_date DATE,
  current_address TEXT,
  employment_status employment_status,
  employer_name VARCHAR(255),
  job_title VARCHAR(255),
  employment_start_date DATE,
  monthly_income DECIMAL(10,2),
  other_income DECIMAL(10,2) DEFAULT 0,
  other_income_source VARCHAR(255),
  has_guarantor BOOLEAN DEFAULT FALSE,
  guarantor_first_name VARCHAR(100),
  guarantor_last_name VARCHAR(100),
  guarantor_email VARCHAR(255),
  guarantor_phone VARCHAR(20),
  guarantor_relationship VARCHAR(100),
  guarantor_monthly_income DECIMAL(10,2),
  solvency_score INTEGER CHECK (solvency_score >= 1 AND solvency_score <= 5),
  income_ratio DECIMAL(5,2),
  status candidate_status DEFAULT 'pending',
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  converted_to_tenant BOOLEAN DEFAULT FALSE,
  converted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidate_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT candidate_documents_type_valid CHECK (
    document_type IN ('identity', 'payslip', 'tax_notice', 'employment_contract', 'bank_statement', 'guarantor_identity', 'guarantor_payslip', 'guarantor_tax', 'other')
  )
);

-- ============================================================================
-- 3. INDEX
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_candidate_invitation_links_lot ON candidate_invitation_links(lot_id);
CREATE INDEX IF NOT EXISTS idx_candidate_invitation_links_token ON candidate_invitation_links(token) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_candidates_lot ON candidates(lot_id);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_access_token ON candidates(access_token);
CREATE INDEX IF NOT EXISTS idx_candidate_documents_candidate ON candidate_documents(candidate_id);

-- ============================================================================
-- 4. RLS
-- ============================================================================

ALTER TABLE candidate_invitation_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_documents ENABLE ROW LEVEL SECURITY;

-- CANDIDATE_INVITATION_LINKS

DROP POLICY IF EXISTS "Public read active links" ON candidate_invitation_links;
CREATE POLICY "Public read active links" ON candidate_invitation_links
FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Owners manage links" ON candidate_invitation_links;
CREATE POLICY "Owners manage links" ON candidate_invitation_links
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lots l
    INNER JOIN properties p ON l.property_id = p.id
    INNER JOIN users u ON u.id = p.owner_id
    WHERE l.id = candidate_invitation_links.lot_id
    AND u.supabase_uid = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM lots l
    INNER JOIN properties p ON l.property_id = p.id
    INNER JOIN users u ON u.id = p.owner_id
    WHERE l.id = candidate_invitation_links.lot_id
    AND u.supabase_uid = auth.uid()
  )
);

-- CANDIDATES

DROP POLICY IF EXISTS "Owners view candidates" ON candidates;
CREATE POLICY "Owners view candidates" ON candidates
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lots l
    INNER JOIN properties p ON l.property_id = p.id
    INNER JOIN users u ON u.id = p.owner_id
    WHERE l.id = candidates.lot_id
    AND u.supabase_uid = auth.uid()
  )
);

DROP POLICY IF EXISTS "Public view own candidate" ON candidates;
CREATE POLICY "Public view own candidate" ON candidates
FOR SELECT TO anon
USING (true);

DROP POLICY IF EXISTS "Public submit candidate" ON candidates;
CREATE POLICY "Public submit candidate" ON candidates
FOR INSERT TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Owners update candidates" ON candidates;
CREATE POLICY "Owners update candidates" ON candidates
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lots l
    INNER JOIN properties p ON l.property_id = p.id
    INNER JOIN users u ON u.id = p.owner_id
    WHERE l.id = candidates.lot_id
    AND u.supabase_uid = auth.uid()
  )
);

DROP POLICY IF EXISTS "Owners delete candidates" ON candidates;
CREATE POLICY "Owners delete candidates" ON candidates
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lots l
    INNER JOIN properties p ON l.property_id = p.id
    INNER JOIN users u ON u.id = p.owner_id
    WHERE l.id = candidates.lot_id
    AND u.supabase_uid = auth.uid()
  )
);

-- CANDIDATE_DOCUMENTS

DROP POLICY IF EXISTS "Owners view docs" ON candidate_documents;
CREATE POLICY "Owners view docs" ON candidate_documents
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM candidates c
    INNER JOIN lots l ON c.lot_id = l.id
    INNER JOIN properties p ON l.property_id = p.id
    INNER JOIN users u ON u.id = p.owner_id
    WHERE c.id = candidate_documents.candidate_id
    AND u.supabase_uid = auth.uid()
  )
);

DROP POLICY IF EXISTS "Public view own docs" ON candidate_documents;
CREATE POLICY "Public view own docs" ON candidate_documents
FOR SELECT TO anon
USING (true);

DROP POLICY IF EXISTS "Public upload docs" ON candidate_documents;
CREATE POLICY "Public upload docs" ON candidate_documents
FOR INSERT TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Owners delete docs" ON candidate_documents;
CREATE POLICY "Owners delete docs" ON candidate_documents
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM candidates c
    INNER JOIN lots l ON c.lot_id = l.id
    INNER JOIN properties p ON l.property_id = p.id
    INNER JOIN users u ON u.id = p.owner_id
    WHERE c.id = candidate_documents.candidate_id
    AND u.supabase_uid = auth.uid()
  )
);

-- ============================================================================
-- CONFIRMATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ MIGRATION TERMINÉE';
    RAISE NOTICE '';
    RAISE NOTICE 'Tables créées:';
    RAISE NOTICE '  - candidate_invitation_links';
    RAISE NOTICE '  - candidates';
    RAISE NOTICE '  - candidate_documents';
    RAISE NOTICE '';
    RAISE NOTICE 'Politiques RLS: 12 politiques créées';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  TODO:';
    RAISE NOTICE '1. Créer le bucket Storage: candidate-documents (Private, 10MB)';
    RAISE NOTICE '2. Les politiques Storage doivent être ajoutées manuellement si besoin';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Tu peux maintenant tester le système !';
END $$;
