-- Migration pour le système de candidatures V2
-- Date: 2026-01-02
-- Amélioration: Gestion des couples et colocations

-- Table des candidatures (VERSION AMÉLIORÉE)
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lot_id UUID NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,

  -- TYPE DE CANDIDATURE (NOUVEAU)
  application_type VARCHAR(20) DEFAULT 'individual' CHECK (application_type IN ('individual', 'couple', 'colocation')),
  nb_applicants INTEGER DEFAULT 1 CHECK (nb_applicants >= 1 AND nb_applicants <= 6),

  -- CANDIDAT PRINCIPAL (Candidat 1)
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  birth_date DATE,
  birth_place VARCHAR(255),
  nationality VARCHAR(100),

  -- Situation professionnelle Candidat 1
  professional_status VARCHAR(100),
  employer_name VARCHAR(255),
  job_title VARCHAR(255),
  contract_type VARCHAR(100),
  employment_start_date DATE,
  monthly_income DECIMAL(10,2) DEFAULT 0,
  other_income DECIMAL(10,2) DEFAULT 0,

  -- CANDIDAT 2 (pour couple ou colocation - NOUVEAU)
  applicant2_first_name VARCHAR(100),
  applicant2_last_name VARCHAR(100),
  applicant2_email VARCHAR(255),
  applicant2_phone VARCHAR(20),
  applicant2_birth_date DATE,
  applicant2_birth_place VARCHAR(255),
  applicant2_nationality VARCHAR(100),
  applicant2_professional_status VARCHAR(100),
  applicant2_employer_name VARCHAR(255),
  applicant2_job_title VARCHAR(255),
  applicant2_contract_type VARCHAR(100),
  applicant2_employment_start_date DATE,
  applicant2_monthly_income DECIMAL(10,2) DEFAULT 0,
  applicant2_other_income DECIMAL(10,2) DEFAULT 0,

  -- CANDIDAT 3 (pour colocation 3+ personnes - NOUVEAU)
  applicant3_first_name VARCHAR(100),
  applicant3_last_name VARCHAR(100),
  applicant3_email VARCHAR(255),
  applicant3_phone VARCHAR(20),
  applicant3_monthly_income DECIMAL(10,2) DEFAULT 0,

  -- CANDIDAT 4 (pour colocation 4+ personnes - NOUVEAU)
  applicant4_first_name VARCHAR(100),
  applicant4_last_name VARCHAR(100),
  applicant4_email VARCHAR(255),
  applicant4_phone VARCHAR(20),
  applicant4_monthly_income DECIMAL(10,2) DEFAULT 0,

  -- REVENUS TOTAUX CUMULÉS (NOUVEAU - calculé automatiquement)
  total_monthly_income DECIMAL(10,2) GENERATED ALWAYS AS (
    COALESCE(monthly_income, 0) + COALESCE(other_income, 0) +
    COALESCE(applicant2_monthly_income, 0) + COALESCE(applicant2_other_income, 0) +
    COALESCE(applicant3_monthly_income, 0) +
    COALESCE(applicant4_monthly_income, 0)
  ) STORED,

  -- GARANT (peut être commun au couple/colocation)
  has_guarantor BOOLEAN DEFAULT FALSE,
  guarantor_first_name VARCHAR(100),
  guarantor_last_name VARCHAR(100),
  guarantor_email VARCHAR(255),
  guarantor_phone VARCHAR(20),
  guarantor_relationship VARCHAR(100),
  guarantor_professional_status VARCHAR(100),
  guarantor_monthly_income DECIMAL(10,2) DEFAULT 0,

  -- GARANT 2 (optionnel, pour colocation si chacun a son garant - NOUVEAU)
  has_guarantor2 BOOLEAN DEFAULT FALSE,
  guarantor2_first_name VARCHAR(100),
  guarantor2_last_name VARCHAR(100),
  guarantor2_email VARCHAR(255),
  guarantor2_phone VARCHAR(20),
  guarantor2_relationship VARCHAR(100),
  guarantor2_monthly_income DECIMAL(10,2) DEFAULT 0,

  -- Scoring et validation
  score INTEGER CHECK (score >= 0 AND score <= 100),
  income_to_rent_ratio DECIMAL(5,2),
  taux_effort DECIMAL(5,2),

  -- Workflow
  status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'accepted', 'rejected', 'withdrawn')),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  internal_notes TEXT,

  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des documents de candidature (AMÉLIORÉE)
CREATE TABLE IF NOT EXISTS candidate_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,

  -- QUEL CANDIDAT ? (NOUVEAU)
  applicant_number INTEGER DEFAULT 1 CHECK (applicant_number >= 1 AND applicant_number <= 4),

  -- Type de document
  document_type VARCHAR(100) NOT NULL CHECK (document_type IN (
    'id_card',              -- Pièce d'identité
    'proof_income',         -- Justificatif revenus (3 derniers bulletins)
    'tax_notice',           -- Avis d'imposition
    'employment_contract',  -- Contrat de travail
    'rib',                  -- RIB
    'guarantor_id',         -- Pièce identité garant
    'guarantor_income',     -- Justificatifs revenus garant
    'guarantor_tax',        -- Avis imposition garant
    'guarantor2_id',        -- NOUVEAU - Garant 2
    'guarantor2_income',    -- NOUVEAU - Revenus garant 2
    'guarantor2_tax',       -- NOUVEAU - Avis imposition garant 2
    'other'                 -- Autre
  )),

  -- Informations fichier
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_url VARCHAR(500),
  file_size INTEGER,
  mime_type VARCHAR(100),

  -- Métadonnées
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_candidates_lot ON candidates(lot_id);
CREATE INDEX idx_candidates_entity ON candidates(entity_id);
CREATE INDEX idx_candidates_status ON candidates(status);
CREATE INDEX idx_candidates_score ON candidates(score);
CREATE INDEX idx_candidates_type ON candidates(application_type);
CREATE INDEX idx_candidates_created ON candidates(created_at DESC);
CREATE INDEX idx_candidate_documents_candidate ON candidate_documents(candidate_id);
CREATE INDEX idx_candidate_documents_type ON candidate_documents(document_type);
CREATE INDEX idx_candidate_documents_applicant ON candidate_documents(applicant_number);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON candidates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Commentaires
COMMENT ON TABLE candidates IS 'Table des candidatures pour les lots disponibles (individuel, couple, colocation)';
COMMENT ON TABLE candidate_documents IS 'Documents joints aux candidatures (un document par candidat)';
COMMENT ON COLUMN candidates.application_type IS 'Type: individual, couple, colocation';
COMMENT ON COLUMN candidates.nb_applicants IS 'Nombre de candidats (1-6)';
COMMENT ON COLUMN candidates.total_monthly_income IS 'Revenus mensuels cumulés de tous les candidats (calculé automatiquement)';
COMMENT ON COLUMN candidates.score IS 'Score automatique de 0 à 100 basé sur critères objectifs';
COMMENT ON COLUMN candidates.income_to_rent_ratio IS 'Ratio revenus TOTAUX/loyer (ex: 3.5 = revenus 3.5x supérieurs au loyer)';
COMMENT ON COLUMN candidates.taux_effort IS 'Pourcentage du revenu consacré au loyer';
COMMENT ON COLUMN candidate_documents.applicant_number IS 'Numéro du candidat (1, 2, 3, 4)';
