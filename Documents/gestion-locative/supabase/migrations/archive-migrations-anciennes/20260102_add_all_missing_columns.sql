-- Migration complète pour ajouter TOUTES les colonnes manquantes
-- Date: 2026-01-02
-- Fix: Ajout de toutes les colonnes pour support complet couples/colocations

-- ============================================================================
-- 1. COLONNES TYPE DE CANDIDATURE
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'application_type'
  ) THEN
    ALTER TABLE candidates ADD COLUMN application_type VARCHAR(20) DEFAULT 'individual'
      CHECK (application_type IN ('individual', 'couple', 'colocation'));
    RAISE NOTICE '✅ Colonne application_type ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'nb_applicants'
  ) THEN
    ALTER TABLE candidates ADD COLUMN nb_applicants INTEGER DEFAULT 1
      CHECK (nb_applicants >= 1 AND nb_applicants <= 6);
    RAISE NOTICE '✅ Colonne nb_applicants ajoutée';
  END IF;
END $$;

-- ============================================================================
-- 2. COLONNES CANDIDAT PRINCIPAL (peuvent manquer sur anciennes tables)
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'birth_place'
  ) THEN
    ALTER TABLE candidates ADD COLUMN birth_place VARCHAR(255);
    RAISE NOTICE '✅ Colonne birth_place ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'nationality'
  ) THEN
    ALTER TABLE candidates ADD COLUMN nationality VARCHAR(100);
    RAISE NOTICE '✅ Colonne nationality ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'contract_type'
  ) THEN
    ALTER TABLE candidates ADD COLUMN contract_type VARCHAR(100);
    RAISE NOTICE '✅ Colonne contract_type ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'other_income'
  ) THEN
    ALTER TABLE candidates ADD COLUMN other_income DECIMAL(10,2) DEFAULT 0;
    RAISE NOTICE '✅ Colonne other_income ajoutée';
  END IF;
END $$;

-- ============================================================================
-- 3. COLONNES CANDIDAT 2 (Couple / Colocation)
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'applicant2_first_name'
  ) THEN
    ALTER TABLE candidates ADD COLUMN applicant2_first_name VARCHAR(100);
    RAISE NOTICE '✅ Colonne applicant2_first_name ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'applicant2_last_name'
  ) THEN
    ALTER TABLE candidates ADD COLUMN applicant2_last_name VARCHAR(100);
    RAISE NOTICE '✅ Colonne applicant2_last_name ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'applicant2_email'
  ) THEN
    ALTER TABLE candidates ADD COLUMN applicant2_email VARCHAR(255);
    RAISE NOTICE '✅ Colonne applicant2_email ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'applicant2_phone'
  ) THEN
    ALTER TABLE candidates ADD COLUMN applicant2_phone VARCHAR(20);
    RAISE NOTICE '✅ Colonne applicant2_phone ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'applicant2_birth_date'
  ) THEN
    ALTER TABLE candidates ADD COLUMN applicant2_birth_date DATE;
    RAISE NOTICE '✅ Colonne applicant2_birth_date ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'applicant2_birth_place'
  ) THEN
    ALTER TABLE candidates ADD COLUMN applicant2_birth_place VARCHAR(255);
    RAISE NOTICE '✅ Colonne applicant2_birth_place ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'applicant2_nationality'
  ) THEN
    ALTER TABLE candidates ADD COLUMN applicant2_nationality VARCHAR(100);
    RAISE NOTICE '✅ Colonne applicant2_nationality ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'applicant2_professional_status'
  ) THEN
    ALTER TABLE candidates ADD COLUMN applicant2_professional_status VARCHAR(100);
    RAISE NOTICE '✅ Colonne applicant2_professional_status ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'applicant2_employer_name'
  ) THEN
    ALTER TABLE candidates ADD COLUMN applicant2_employer_name VARCHAR(255);
    RAISE NOTICE '✅ Colonne applicant2_employer_name ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'applicant2_job_title'
  ) THEN
    ALTER TABLE candidates ADD COLUMN applicant2_job_title VARCHAR(255);
    RAISE NOTICE '✅ Colonne applicant2_job_title ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'applicant2_contract_type'
  ) THEN
    ALTER TABLE candidates ADD COLUMN applicant2_contract_type VARCHAR(100);
    RAISE NOTICE '✅ Colonne applicant2_contract_type ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'applicant2_employment_start_date'
  ) THEN
    ALTER TABLE candidates ADD COLUMN applicant2_employment_start_date DATE;
    RAISE NOTICE '✅ Colonne applicant2_employment_start_date ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'applicant2_monthly_income'
  ) THEN
    ALTER TABLE candidates ADD COLUMN applicant2_monthly_income DECIMAL(10,2) DEFAULT 0;
    RAISE NOTICE '✅ Colonne applicant2_monthly_income ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'applicant2_other_income'
  ) THEN
    ALTER TABLE candidates ADD COLUMN applicant2_other_income DECIMAL(10,2) DEFAULT 0;
    RAISE NOTICE '✅ Colonne applicant2_other_income ajoutée';
  END IF;
END $$;

-- ============================================================================
-- 4. COLONNES CANDIDAT 3 (Colocation 3+ personnes)
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'applicant3_first_name'
  ) THEN
    ALTER TABLE candidates ADD COLUMN applicant3_first_name VARCHAR(100);
    RAISE NOTICE '✅ Colonne applicant3_first_name ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'applicant3_last_name'
  ) THEN
    ALTER TABLE candidates ADD COLUMN applicant3_last_name VARCHAR(100);
    RAISE NOTICE '✅ Colonne applicant3_last_name ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'applicant3_email'
  ) THEN
    ALTER TABLE candidates ADD COLUMN applicant3_email VARCHAR(255);
    RAISE NOTICE '✅ Colonne applicant3_email ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'applicant3_phone'
  ) THEN
    ALTER TABLE candidates ADD COLUMN applicant3_phone VARCHAR(20);
    RAISE NOTICE '✅ Colonne applicant3_phone ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'applicant3_monthly_income'
  ) THEN
    ALTER TABLE candidates ADD COLUMN applicant3_monthly_income DECIMAL(10,2) DEFAULT 0;
    RAISE NOTICE '✅ Colonne applicant3_monthly_income ajoutée';
  END IF;
END $$;

-- ============================================================================
-- 5. COLONNES CANDIDAT 4 (Colocation 4+ personnes)
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'applicant4_first_name'
  ) THEN
    ALTER TABLE candidates ADD COLUMN applicant4_first_name VARCHAR(100);
    RAISE NOTICE '✅ Colonne applicant4_first_name ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'applicant4_last_name'
  ) THEN
    ALTER TABLE candidates ADD COLUMN applicant4_last_name VARCHAR(100);
    RAISE NOTICE '✅ Colonne applicant4_last_name ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'applicant4_email'
  ) THEN
    ALTER TABLE candidates ADD COLUMN applicant4_email VARCHAR(255);
    RAISE NOTICE '✅ Colonne applicant4_email ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'applicant4_phone'
  ) THEN
    ALTER TABLE candidates ADD COLUMN applicant4_phone VARCHAR(20);
    RAISE NOTICE '✅ Colonne applicant4_phone ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'applicant4_monthly_income'
  ) THEN
    ALTER TABLE candidates ADD COLUMN applicant4_monthly_income DECIMAL(10,2) DEFAULT 0;
    RAISE NOTICE '✅ Colonne applicant4_monthly_income ajoutée';
  END IF;
END $$;

-- ============================================================================
-- 6. COLONNE REVENUS TOTAUX CUMULÉS (calculé automatiquement)
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'total_monthly_income'
  ) THEN
    ALTER TABLE candidates ADD COLUMN total_monthly_income DECIMAL(10,2)
      GENERATED ALWAYS AS (
        COALESCE(monthly_income, 0) + COALESCE(other_income, 0) +
        COALESCE(applicant2_monthly_income, 0) + COALESCE(applicant2_other_income, 0) +
        COALESCE(applicant3_monthly_income, 0) +
        COALESCE(applicant4_monthly_income, 0)
      ) STORED;
    RAISE NOTICE '✅ Colonne total_monthly_income ajoutée (calculée)';
  END IF;
END $$;

-- ============================================================================
-- 7. COLONNES GARANT PRINCIPAL
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'has_guarantor'
  ) THEN
    ALTER TABLE candidates ADD COLUMN has_guarantor BOOLEAN DEFAULT FALSE;
    RAISE NOTICE '✅ Colonne has_guarantor ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'guarantor_first_name'
  ) THEN
    ALTER TABLE candidates ADD COLUMN guarantor_first_name VARCHAR(100);
    RAISE NOTICE '✅ Colonne guarantor_first_name ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'guarantor_last_name'
  ) THEN
    ALTER TABLE candidates ADD COLUMN guarantor_last_name VARCHAR(100);
    RAISE NOTICE '✅ Colonne guarantor_last_name ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'guarantor_email'
  ) THEN
    ALTER TABLE candidates ADD COLUMN guarantor_email VARCHAR(255);
    RAISE NOTICE '✅ Colonne guarantor_email ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'guarantor_phone'
  ) THEN
    ALTER TABLE candidates ADD COLUMN guarantor_phone VARCHAR(20);
    RAISE NOTICE '✅ Colonne guarantor_phone ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'guarantor_relationship'
  ) THEN
    ALTER TABLE candidates ADD COLUMN guarantor_relationship VARCHAR(100);
    RAISE NOTICE '✅ Colonne guarantor_relationship ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'guarantor_professional_status'
  ) THEN
    ALTER TABLE candidates ADD COLUMN guarantor_professional_status VARCHAR(100);
    RAISE NOTICE '✅ Colonne guarantor_professional_status ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'guarantor_monthly_income'
  ) THEN
    ALTER TABLE candidates ADD COLUMN guarantor_monthly_income DECIMAL(10,2) DEFAULT 0;
    RAISE NOTICE '✅ Colonne guarantor_monthly_income ajoutée';
  END IF;
END $$;

-- ============================================================================
-- 8. COLONNES GARANT 2 (optionnel pour colocation)
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'has_guarantor2'
  ) THEN
    ALTER TABLE candidates ADD COLUMN has_guarantor2 BOOLEAN DEFAULT FALSE;
    RAISE NOTICE '✅ Colonne has_guarantor2 ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'guarantor2_first_name'
  ) THEN
    ALTER TABLE candidates ADD COLUMN guarantor2_first_name VARCHAR(100);
    RAISE NOTICE '✅ Colonne guarantor2_first_name ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'guarantor2_last_name'
  ) THEN
    ALTER TABLE candidates ADD COLUMN guarantor2_last_name VARCHAR(100);
    RAISE NOTICE '✅ Colonne guarantor2_last_name ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'guarantor2_email'
  ) THEN
    ALTER TABLE candidates ADD COLUMN guarantor2_email VARCHAR(255);
    RAISE NOTICE '✅ Colonne guarantor2_email ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'guarantor2_phone'
  ) THEN
    ALTER TABLE candidates ADD COLUMN guarantor2_phone VARCHAR(20);
    RAISE NOTICE '✅ Colonne guarantor2_phone ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'guarantor2_relationship'
  ) THEN
    ALTER TABLE candidates ADD COLUMN guarantor2_relationship VARCHAR(100);
    RAISE NOTICE '✅ Colonne guarantor2_relationship ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'guarantor2_monthly_income'
  ) THEN
    ALTER TABLE candidates ADD COLUMN guarantor2_monthly_income DECIMAL(10,2) DEFAULT 0;
    RAISE NOTICE '✅ Colonne guarantor2_monthly_income ajoutée';
  END IF;
END $$;

-- ============================================================================
-- 9. COLONNES SCORING ET VALIDATION
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'taux_effort'
  ) THEN
    ALTER TABLE candidates ADD COLUMN taux_effort DECIMAL(5,2);
    RAISE NOTICE '✅ Colonne taux_effort ajoutée';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'internal_notes'
  ) THEN
    ALTER TABLE candidates ADD COLUMN internal_notes TEXT;
    RAISE NOTICE '✅ Colonne internal_notes ajoutée';
  END IF;
END $$;

-- ============================================================================
-- 10. RÉCAPITULATIF
-- ============================================================================

DO $$
DECLARE
  total_columns INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_columns
  FROM information_schema.columns
  WHERE table_name = 'candidates';

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Migration terminée avec succès !';
  RAISE NOTICE 'Total de colonnes dans candidates: %', total_columns;
  RAISE NOTICE '========================================';
END $$;
