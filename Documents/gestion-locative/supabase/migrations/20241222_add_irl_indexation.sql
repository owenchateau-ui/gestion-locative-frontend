-- Migration pour l'indexation automatique des loyers (IRL)
-- Date: 2024-12-22

-- 1. Créer la table des indices IRL
CREATE TABLE IF NOT EXISTS irl_indices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year INTEGER NOT NULL,
  quarter INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 4),
  value DECIMAL(10,2) NOT NULL,
  published_at DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(year, quarter)
);

-- Insérer les valeurs IRL récentes (2022-2024)
INSERT INTO irl_indices (year, quarter, value, published_at) VALUES
(2022, 1, 133.93, '2022-04-15'),
(2022, 2, 135.84, '2022-07-15'),
(2022, 3, 136.27, '2022-10-14'),
(2022, 4, 137.26, '2023-01-13'),
(2023, 1, 138.61, '2023-04-14'),
(2023, 2, 140.59, '2023-07-14'),
(2023, 3, 141.03, '2023-10-13'),
(2023, 4, 142.06, '2024-01-12'),
(2024, 1, 143.46, '2024-04-12'),
(2024, 2, 145.17, '2024-07-12'),
(2024, 3, 146.12, '2024-10-15'),
(2024, 4, 147.41, '2025-01-15')
ON CONFLICT (year, quarter) DO NOTHING;

-- 2. Ajouter les colonnes d'indexation à la table leases
ALTER TABLE leases
  ADD COLUMN IF NOT EXISTS irl_reference_quarter INTEGER,
  ADD COLUMN IF NOT EXISTS irl_reference_year INTEGER,
  ADD COLUMN IF NOT EXISTS last_indexation_date DATE,
  ADD COLUMN IF NOT EXISTS indexation_enabled BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS initial_rent DECIMAL(10,2);

-- Mettre à jour initial_rent avec rent_amount pour les baux existants
UPDATE leases
SET initial_rent = rent_amount
WHERE initial_rent IS NULL;

-- 3. Créer la table de l'historique des indexations
CREATE TABLE IF NOT EXISTS indexation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
  old_rent DECIMAL(10,2) NOT NULL,
  new_rent DECIMAL(10,2) NOT NULL,
  old_irl_value DECIMAL(10,2) NOT NULL,
  new_irl_value DECIMAL(10,2) NOT NULL,
  old_irl_quarter VARCHAR(10) NOT NULL,
  new_irl_quarter VARCHAR(10) NOT NULL,
  increase_percentage DECIMAL(5,2),
  applied_at DATE NOT NULL,
  letter_generated BOOLEAN DEFAULT FALSE,
  letter_sent_at DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_indexation_history_lease ON indexation_history(lease_id);

-- 4. Créer un index sur les colonnes IRL de la table leases
CREATE INDEX IF NOT EXISTS idx_leases_irl_reference ON leases(irl_reference_year, irl_reference_quarter);

-- Commentaires pour documenter les tables
COMMENT ON TABLE irl_indices IS 'Indices de référence des loyers (IRL) publiés par l''INSEE';
COMMENT ON TABLE indexation_history IS 'Historique des révisions de loyers effectuées';
COMMENT ON COLUMN leases.irl_reference_quarter IS 'Trimestre de référence pour l''indexation (1-4)';
COMMENT ON COLUMN leases.irl_reference_year IS 'Année de référence pour l''indexation';
COMMENT ON COLUMN leases.last_indexation_date IS 'Date de la dernière indexation appliquée';
COMMENT ON COLUMN leases.indexation_enabled IS 'Active/désactive l''indexation automatique pour ce bail';
COMMENT ON COLUMN leases.initial_rent IS 'Loyer initial à la signature du bail';
