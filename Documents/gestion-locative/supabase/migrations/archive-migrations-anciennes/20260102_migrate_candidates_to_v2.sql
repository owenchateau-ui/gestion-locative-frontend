-- Migration pour le système de candidatures V2
-- Date: 2026-01-02
-- Amélioration: Gestion des couples et colocations
-- ATTENTION: Cette migration MODIFIE la table existante

-- 1. AJOUTER les nouvelles colonnes à la table candidates
ALTER TABLE candidates
  -- TYPE DE CANDIDATURE (NOUVEAU)
  ADD COLUMN IF NOT EXISTS application_type VARCHAR(20) DEFAULT 'individual' CHECK (application_type IN ('individual', 'couple', 'colocation')),
  ADD COLUMN IF NOT EXISTS nb_applicants INTEGER DEFAULT 1 CHECK (nb_applicants >= 1 AND nb_applicants <= 6),

  -- Ajouter champs manquants pour candidat 1 si nécessaire
  ADD COLUMN IF NOT EXISTS birth_place VARCHAR(255),
  ADD COLUMN IF NOT EXISTS nationality VARCHAR(100),

  -- CANDIDAT 2 (pour couple ou colocation - NOUVEAU)
  ADD COLUMN IF NOT EXISTS applicant2_first_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS applicant2_last_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS applicant2_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS applicant2_phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS applicant2_birth_date DATE,
  ADD COLUMN IF NOT EXISTS applicant2_birth_place VARCHAR(255),
  ADD COLUMN IF NOT EXISTS applicant2_nationality VARCHAR(100),
  ADD COLUMN IF NOT EXISTS applicant2_professional_status VARCHAR(100),
  ADD COLUMN IF NOT EXISTS applicant2_employer_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS applicant2_job_title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS applicant2_contract_type VARCHAR(100),
  ADD COLUMN IF NOT EXISTS applicant2_employment_start_date DATE,
  ADD COLUMN IF NOT EXISTS applicant2_monthly_income DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS applicant2_other_income DECIMAL(10,2) DEFAULT 0,

  -- CANDIDAT 3 (pour colocation 3+ personnes - NOUVEAU)
  ADD COLUMN IF NOT EXISTS applicant3_first_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS applicant3_last_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS applicant3_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS applicant3_phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS applicant3_monthly_income DECIMAL(10,2) DEFAULT 0,

  -- CANDIDAT 4 (pour colocation 4+ personnes - NOUVEAU)
  ADD COLUMN IF NOT EXISTS applicant4_first_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS applicant4_last_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS applicant4_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS applicant4_phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS applicant4_monthly_income DECIMAL(10,2) DEFAULT 0,

  -- GARANT 2 (optionnel, pour colocation si chacun a son garant - NOUVEAU)
  ADD COLUMN IF NOT EXISTS has_guarantor2 BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS guarantor2_first_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS guarantor2_last_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS guarantor2_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS guarantor2_phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS guarantor2_relationship VARCHAR(100),
  ADD COLUMN IF NOT EXISTS guarantor2_monthly_income DECIMAL(10,2) DEFAULT 0;

-- 2. AJOUTER la colonne calculée pour les revenus totaux
-- Note: On doit d'abord vérifier si elle existe déjà
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'total_monthly_income'
  ) THEN
    ALTER TABLE candidates
      ADD COLUMN total_monthly_income DECIMAL(10,2) GENERATED ALWAYS AS (
        COALESCE(monthly_income, 0) + COALESCE(other_income, 0) +
        COALESCE(applicant2_monthly_income, 0) + COALESCE(applicant2_other_income, 0) +
        COALESCE(applicant3_monthly_income, 0) +
        COALESCE(applicant4_monthly_income, 0)
      ) STORED;
  END IF;
END $$;

-- 3. MODIFIER la table candidate_documents pour ajouter applicant_number
ALTER TABLE candidate_documents
  ADD COLUMN IF NOT EXISTS applicant_number INTEGER DEFAULT 1 CHECK (applicant_number >= 1 AND applicant_number <= 4);

-- 4. AJOUTER les nouveaux types de documents autorisés
-- Note: Il faut recréer la contrainte CHECK avec les nouveaux types
DO $$
BEGIN
  -- Supprimer l'ancienne contrainte si elle existe
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'candidate_documents' AND constraint_name LIKE '%document_type%check%'
  ) THEN
    ALTER TABLE candidate_documents DROP CONSTRAINT IF EXISTS candidate_documents_document_type_check;
  END IF;

  -- Ajouter la nouvelle contrainte avec tous les types
  ALTER TABLE candidate_documents
    ADD CONSTRAINT candidate_documents_document_type_check
    CHECK (document_type IN (
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
    ));
END $$;

-- 5. CRÉER les index manquants (IF NOT EXISTS n'est pas supporté pour les index, on utilise DO)
DO $$
BEGIN
  -- Index sur application_type
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_candidates_type') THEN
    CREATE INDEX idx_candidates_type ON candidates(application_type);
  END IF;

  -- Index sur applicant_number dans candidate_documents
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_candidate_documents_applicant') THEN
    CREATE INDEX idx_candidate_documents_applicant ON candidate_documents(applicant_number);
  END IF;
END $$;

-- 6. AJOUTER les commentaires
COMMENT ON COLUMN candidates.application_type IS 'Type: individual, couple, colocation';
COMMENT ON COLUMN candidates.nb_applicants IS 'Nombre de candidats (1-6)';
COMMENT ON COLUMN candidates.total_monthly_income IS 'Revenus mensuels cumulés de tous les candidats (calculé automatiquement)';
COMMENT ON COLUMN candidate_documents.applicant_number IS 'Numéro du candidat (1, 2, 3, 4)';

-- 7. METTRE À JOUR les candidatures existantes
-- Toutes les candidatures existantes sont de type "individual"
UPDATE candidates
SET
  application_type = 'individual',
  nb_applicants = 1
WHERE application_type IS NULL;

-- 8. METTRE À JOUR les documents existants
-- Tous les documents existants appartiennent au candidat 1
UPDATE candidate_documents
SET applicant_number = 1
WHERE applicant_number IS NULL;

-- 9. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Migration V2 terminée avec succès!';
  RAISE NOTICE 'Nouvelles fonctionnalités:';
  RAISE NOTICE '  - Support couples (2 personnes)';
  RAISE NOTICE '  - Support colocations (jusqu''à 4 personnes)';
  RAISE NOTICE '  - Calcul automatique revenus cumulés';
  RAISE NOTICE '  - Support 2 garants';
  RAISE NOTICE '  - Documents par candidat';
END $$;
