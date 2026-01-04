-- ============================================================================
-- MIGRATION : Tables pour le système de candidatures
-- ============================================================================
-- Date: 2024-12-29
-- Description: Création des tables candidates + politiques RLS
-- Prérequis: Tables entities, properties, lots doivent exister
-- ============================================================================

-- Activer l'extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. CRÉATION DES TYPES ENUM
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE candidate_status AS ENUM (
      'pending',          -- En attente
      'reviewing',        -- En cours d'examen
      'accepted',         -- Acceptée
      'rejected'          -- Refusée
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE employment_status AS ENUM (
      'cdi',              -- CDI
      'cdd',              -- CDD
      'interim',          -- Intérim
      'freelance',        -- Freelance
      'student',          -- Étudiant
      'retired',          -- Retraité
      'unemployed',       -- Sans emploi
      'other'             -- Autre
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 2. TABLE CANDIDATE_INVITATION_LINKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS candidate_invitation_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lot_id UUID NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
  token UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidate_invitation_links_lot ON candidate_invitation_links(lot_id);
CREATE INDEX IF NOT EXISTS idx_candidate_invitation_links_token ON candidate_invitation_links(token) WHERE is_active = TRUE;

COMMENT ON TABLE candidate_invitation_links IS 'Liens d''invitation pour postuler aux lots vacants';

-- ============================================================================
-- 3. TABLE CANDIDATES
-- ============================================================================

CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lot_id UUID NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
  access_token VARCHAR(100) NOT NULL UNIQUE,

  -- Informations personnelles
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  birth_date DATE,
  current_address TEXT,

  -- Situation professionnelle
  employment_status employment_status,
  employer_name VARCHAR(255),
  job_title VARCHAR(255),
  employment_start_date DATE,

  -- Revenus
  monthly_income DECIMAL(10,2),
  other_income DECIMAL(10,2) DEFAULT 0,
  other_income_source VARCHAR(255),

  -- Garant
  has_guarantor BOOLEAN DEFAULT FALSE,
  guarantor_first_name VARCHAR(100),
  guarantor_last_name VARCHAR(100),
  guarantor_email VARCHAR(255),
  guarantor_phone VARCHAR(20),
  guarantor_relationship VARCHAR(100),
  guarantor_monthly_income DECIMAL(10,2),

  -- Scoring
  solvency_score INTEGER CHECK (solvency_score >= 1 AND solvency_score <= 5),
  income_ratio DECIMAL(5,2),

  -- Statut
  status candidate_status DEFAULT 'pending',
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,

  -- Conversion
  converted_to_tenant BOOLEAN DEFAULT FALSE,
  converted_at TIMESTAMP WITH TIME ZONE,

  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidates_lot ON candidates(lot_id);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_access_token ON candidates(access_token);

COMMENT ON TABLE candidates IS 'Candidatures pour les lots vacants';

-- ============================================================================
-- 4. TABLE CANDIDATE_DOCUMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS candidate_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT candidate_documents_type_valid CHECK (
    document_type IN (
      'identity', 'payslip', 'tax_notice', 'employment_contract',
      'bank_statement', 'guarantor_identity', 'guarantor_payslip',
      'guarantor_tax', 'other'
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_candidate_documents_candidate ON candidate_documents(candidate_id);

COMMENT ON TABLE candidate_documents IS 'Documents des candidatures';

-- ============================================================================
-- 5. ACTIVATION RLS
-- ============================================================================

ALTER TABLE candidate_invitation_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_documents ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. POLITIQUES RLS - CANDIDATE_INVITATION_LINKS
-- ============================================================================

-- SELECT: Tout le monde peut lire les liens actifs
DROP POLICY IF EXISTS "Liens actifs lisibles par tous" ON candidate_invitation_links;
CREATE POLICY "Liens actifs lisibles par tous"
ON candidate_invitation_links FOR SELECT
USING (is_active = true);

-- INSERT: Propriétaires créent des liens pour leurs lots
DROP POLICY IF EXISTS "Propriétaires créent liens" ON candidate_invitation_links;
CREATE POLICY "Propriétaires créent liens"
ON candidate_invitation_links FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM lots l
    INNER JOIN properties p ON l.property_id = p.id
    INNER JOIN entities e ON p.entity_id = e.id
    INNER JOIN users u ON u.id = e.user_id
    WHERE l.id = candidate_invitation_links.lot_id
    AND u.supabase_uid = auth.uid()
  )
);

-- UPDATE: Propriétaires modifient leurs liens
DROP POLICY IF EXISTS "Propriétaires modifient liens" ON candidate_invitation_links;
CREATE POLICY "Propriétaires modifient liens"
ON candidate_invitation_links FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lots l
    INNER JOIN properties p ON l.property_id = p.id
    INNER JOIN entities e ON p.entity_id = e.id
    INNER JOIN users u ON u.id = e.user_id
    WHERE l.id = candidate_invitation_links.lot_id
    AND u.supabase_uid = auth.uid()
  )
);

-- DELETE: Propriétaires suppriment leurs liens
DROP POLICY IF EXISTS "Propriétaires suppriment liens" ON candidate_invitation_links;
CREATE POLICY "Propriétaires suppriment liens"
ON candidate_invitation_links FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lots l
    INNER JOIN properties p ON l.property_id = p.id
    INNER JOIN entities e ON p.entity_id = e.id
    INNER JOIN users u ON u.id = e.user_id
    WHERE l.id = candidate_invitation_links.lot_id
    AND u.supabase_uid = auth.uid()
  )
);

-- ============================================================================
-- 7. POLITIQUES RLS - CANDIDATES
-- ============================================================================

-- SELECT: Propriétaires voient candidatures de leurs lots
DROP POLICY IF EXISTS "Propriétaires voient candidatures" ON candidates;
CREATE POLICY "Propriétaires voient candidatures"
ON candidates FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lots l
    INNER JOIN properties p ON l.property_id = p.id
    INNER JOIN entities e ON p.entity_id = e.id
    INNER JOIN users u ON u.id = e.user_id
    WHERE l.id = candidates.lot_id
    AND u.supabase_uid = auth.uid()
  )
);

-- SELECT: Candidats voient leur candidature (anon)
DROP POLICY IF EXISTS "Candidats voient leur candidature" ON candidates;
CREATE POLICY "Candidats voient leur candidature"
ON candidates FOR SELECT TO anon
USING (true);

-- INSERT: Tout le monde peut soumettre une candidature
DROP POLICY IF EXISTS "Soumission candidature publique" ON candidates;
CREATE POLICY "Soumission candidature publique"
ON candidates FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- UPDATE: Propriétaires modifient leurs candidatures
DROP POLICY IF EXISTS "Propriétaires modifient candidatures" ON candidates;
CREATE POLICY "Propriétaires modifient candidatures"
ON candidates FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lots l
    INNER JOIN properties p ON l.property_id = p.id
    INNER JOIN entities e ON p.entity_id = e.id
    INNER JOIN users u ON u.id = e.user_id
    WHERE l.id = candidates.lot_id
    AND u.supabase_uid = auth.uid()
  )
);

-- DELETE: Propriétaires suppriment candidatures
DROP POLICY IF EXISTS "Propriétaires suppriment candidatures" ON candidates;
CREATE POLICY "Propriétaires suppriment candidatures"
ON candidates FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lots l
    INNER JOIN properties p ON l.property_id = p.id
    INNER JOIN entities e ON p.entity_id = e.id
    INNER JOIN users u ON u.id = e.user_id
    WHERE l.id = candidates.lot_id
    AND u.supabase_uid = auth.uid()
  )
);

-- ============================================================================
-- 8. POLITIQUES RLS - CANDIDATE_DOCUMENTS
-- ============================================================================

-- SELECT: Propriétaires voient documents
DROP POLICY IF EXISTS "Propriétaires voient documents" ON candidate_documents;
CREATE POLICY "Propriétaires voient documents"
ON candidate_documents FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM candidates c
    INNER JOIN lots l ON c.lot_id = l.id
    INNER JOIN properties p ON l.property_id = p.id
    INNER JOIN entities e ON p.entity_id = e.id
    INNER JOIN users u ON u.id = e.user_id
    WHERE c.id = candidate_documents.candidate_id
    AND u.supabase_uid = auth.uid()
  )
);

-- SELECT: Candidats voient leurs documents (anon)
DROP POLICY IF EXISTS "Candidats voient documents" ON candidate_documents;
CREATE POLICY "Candidats voient documents"
ON candidate_documents FOR SELECT TO anon
USING (true);

-- INSERT: Upload documents public
DROP POLICY IF EXISTS "Upload documents public" ON candidate_documents;
CREATE POLICY "Upload documents public"
ON candidate_documents FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- DELETE: Propriétaires suppriment documents
DROP POLICY IF EXISTS "Propriétaires suppriment documents" ON candidate_documents;
CREATE POLICY "Propriétaires suppriment documents"
ON candidate_documents FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM candidates c
    INNER JOIN lots l ON c.lot_id = l.id
    INNER JOIN properties p ON l.property_id = p.id
    INNER JOIN entities e ON p.entity_id = e.id
    INNER JOIN users u ON u.id = e.user_id
    WHERE c.id = candidate_documents.candidate_id
    AND u.supabase_uid = auth.uid()
  )
);

-- ============================================================================
-- 9. POLITIQUES STORAGE
-- ============================================================================

-- NOTE: Le bucket 'candidate-documents' doit être créé manuellement (privé, 10MB)

DROP POLICY IF EXISTS "Propriétaires voient storage" ON storage.objects;
CREATE POLICY "Propriétaires voient storage"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'candidate-documents'
  AND EXISTS (
    SELECT 1 FROM candidate_documents cd
    INNER JOIN candidates c ON cd.candidate_id = c.id
    INNER JOIN lots l ON c.lot_id = l.id
    INNER JOIN properties p ON l.property_id = p.id
    INNER JOIN entities e ON p.entity_id = e.id
    INNER JOIN users u ON u.id = e.user_id
    WHERE storage.objects.name = cd.file_path
    AND u.supabase_uid = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidats voient storage" ON storage.objects;
CREATE POLICY "Candidats voient storage"
ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'candidate-documents');

DROP POLICY IF EXISTS "Upload storage public" ON storage.objects;
CREATE POLICY "Upload storage public"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'candidate-documents');

DROP POLICY IF EXISTS "Propriétaires suppriment storage" ON storage.objects;
CREATE POLICY "Propriétaires suppriment storage"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'candidate-documents'
  AND EXISTS (
    SELECT 1 FROM candidate_documents cd
    INNER JOIN candidates c ON cd.candidate_id = c.id
    INNER JOIN lots l ON c.lot_id = l.id
    INNER JOIN properties p ON l.property_id = p.id
    INNER JOIN entities e ON p.entity_id = e.id
    INNER JOIN users u ON u.id = e.user_id
    WHERE storage.objects.name = cd.file_path
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
    RAISE NOTICE 'Politiques RLS créées: ~15 politiques';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  N''oublie pas de créer le bucket: candidate-documents';
    RAISE NOTICE '    Storage → New bucket → Private, 10MB';
END $$;
