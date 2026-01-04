-- Ajouter les champs CAF à la table tenant_groups
-- Date: 2026-01-02
-- Description: Ajout du numéro de dossier CAF et date dernière attestation

ALTER TABLE tenant_groups
ADD COLUMN IF NOT EXISTS caf_file_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS last_caf_attestation_date DATE;

-- Commentaires
COMMENT ON COLUMN tenant_groups.caf_file_number IS 'Numéro de dossier CAF du locataire (pour suivi des aides)';
COMMENT ON COLUMN tenant_groups.last_caf_attestation_date IS 'Date de dernière attestation de loyer envoyée à la CAF';

-- Recharger le schéma Supabase
NOTIFY pgrst, 'reload schema';
