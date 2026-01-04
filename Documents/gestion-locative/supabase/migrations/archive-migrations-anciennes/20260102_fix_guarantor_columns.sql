-- Migration pour ajouter les colonnes manquantes du garant
-- Date: 2026-01-02
-- Fix: Ajout de guarantor_professional_status si manquant

-- Vérifier et ajouter la colonne guarantor_professional_status si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'guarantor_professional_status'
  ) THEN
    ALTER TABLE candidates ADD COLUMN guarantor_professional_status VARCHAR(100);
    RAISE NOTICE 'Colonne guarantor_professional_status ajoutée';
  ELSE
    RAISE NOTICE 'Colonne guarantor_professional_status existe déjà';
  END IF;
END $$;

-- Vérifier et ajouter la colonne guarantor_relationship si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'guarantor_relationship'
  ) THEN
    ALTER TABLE candidates ADD COLUMN guarantor_relationship VARCHAR(100);
    RAISE NOTICE 'Colonne guarantor_relationship ajoutée';
  ELSE
    RAISE NOTICE 'Colonne guarantor_relationship existe déjà';
  END IF;
END $$;

-- Vérifier et ajouter la colonne guarantor2_relationship si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'guarantor2_relationship'
  ) THEN
    ALTER TABLE candidates ADD COLUMN guarantor2_relationship VARCHAR(100);
    RAISE NOTICE 'Colonne guarantor2_relationship ajoutée';
  ELSE
    RAISE NOTICE 'Colonne guarantor2_relationship existe déjà';
  END IF;
END $$;

-- Vérifier toutes les colonnes de garant
DO $$
DECLARE
  missing_columns TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Vérifier guarantor_first_name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'guarantor_first_name'
  ) THEN
    ALTER TABLE candidates ADD COLUMN guarantor_first_name VARCHAR(100);
    missing_columns := array_append(missing_columns, 'guarantor_first_name');
  END IF;

  -- Vérifier guarantor_last_name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'guarantor_last_name'
  ) THEN
    ALTER TABLE candidates ADD COLUMN guarantor_last_name VARCHAR(100);
    missing_columns := array_append(missing_columns, 'guarantor_last_name');
  END IF;

  -- Vérifier guarantor_email
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'guarantor_email'
  ) THEN
    ALTER TABLE candidates ADD COLUMN guarantor_email VARCHAR(255);
    missing_columns := array_append(missing_columns, 'guarantor_email');
  END IF;

  -- Vérifier guarantor_phone
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'guarantor_phone'
  ) THEN
    ALTER TABLE candidates ADD COLUMN guarantor_phone VARCHAR(20);
    missing_columns := array_append(missing_columns, 'guarantor_phone');
  END IF;

  -- Vérifier guarantor_monthly_income
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'guarantor_monthly_income'
  ) THEN
    ALTER TABLE candidates ADD COLUMN guarantor_monthly_income DECIMAL(10,2) DEFAULT 0;
    missing_columns := array_append(missing_columns, 'guarantor_monthly_income');
  END IF;

  IF array_length(missing_columns, 1) > 0 THEN
    RAISE NOTICE 'Colonnes ajoutées: %', array_to_string(missing_columns, ', ');
  ELSE
    RAISE NOTICE 'Toutes les colonnes de garant existent déjà';
  END IF;
END $$;
