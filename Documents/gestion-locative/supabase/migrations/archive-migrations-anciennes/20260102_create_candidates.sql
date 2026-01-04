-- Migration pour le système de candidatures
-- Date: 2026-01-02

-- Table des candidatures
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lot_id UUID NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,

  -- Informations candidat principal
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  birth_date DATE,
  birth_place VARCHAR(255),
  nationality VARCHAR(100),

  -- Situation professionnelle
  professional_status VARCHAR(100),
  employer_name VARCHAR(255),
  job_title VARCHAR(255),
  contract_type VARCHAR(100),
  employment_start_date DATE,
  monthly_income DECIMAL(10,2) DEFAULT 0,
  other_income DECIMAL(10,2) DEFAULT 0,

  -- Garant
  has_guarantor BOOLEAN DEFAULT FALSE,
  guarantor_first_name VARCHAR(100),
  guarantor_last_name VARCHAR(100),
  guarantor_email VARCHAR(255),
  guarantor_phone VARCHAR(20),
  guarantor_relationship VARCHAR(100),
  guarantor_professional_status VARCHAR(100),
  guarantor_monthly_income DECIMAL(10,2) DEFAULT 0,

  -- Colocation (si applicable)
  is_colocation BOOLEAN DEFAULT FALSE,
  nb_cotenants INTEGER DEFAULT 1,
  cotenants_total_income DECIMAL(10,2) DEFAULT 0,

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

-- Table des documents de candidature
CREATE TABLE IF NOT EXISTS candidate_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,

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
CREATE INDEX idx_candidates_created ON candidates(created_at DESC);
CREATE INDEX idx_candidate_documents_candidate ON candidate_documents(candidate_id);
CREATE INDEX idx_candidate_documents_type ON candidate_documents(document_type);

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

-- RLS (Row Level Security) - À activer selon besoins
-- ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE candidate_documents ENABLE ROW LEVEL SECURITY;

-- Commentaires
COMMENT ON TABLE candidates IS 'Table des candidatures pour les lots disponibles';
COMMENT ON TABLE candidate_documents IS 'Documents joints aux candidatures';
COMMENT ON COLUMN candidates.score IS 'Score automatique de 0 à 100 basé sur critères objectifs';
COMMENT ON COLUMN candidates.income_to_rent_ratio IS 'Ratio revenus/loyer (ex: 3.5 = revenus 3.5x supérieurs au loyer)';
COMMENT ON COLUMN candidates.taux_effort IS 'Pourcentage du revenu consacré au loyer';
