-- ============================================================================
-- PHASE 1 : ARCHITECTURE MULTI-ENTITÉS
-- Script de création des nouvelles tables
-- ============================================================================
-- Date : Décembre 2024
-- Description : Création des tables entities, properties (nouvelle version), lots
-- NOTE : Ce script NE MODIFIE PAS les tables existantes (migration ultérieure)
-- ============================================================================

-- ============================================================================
-- 1. ACTIVATION DE L'EXTENSION UUID (si pas déjà activée)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. FONCTION TRIGGER POUR updated_at (réutilisable)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- 3. CRÉATION DES TYPES ENUM
-- ============================================================================

-- Type pour les entités juridiques
CREATE TYPE entity_type AS ENUM (
  'individual',        -- Nom propre (personne physique)
  'sci',              -- Société Civile Immobilière
  'sarl',             -- Société À Responsabilité Limitée
  'sas',              -- Société par Actions Simplifiée
  'sasu',             -- SAS Unipersonnelle
  'eurl',             -- SARL Unipersonnelle
  'lmnp',             -- Loueur Meublé Non Professionnel
  'lmp',              -- Loueur Meublé Professionnel
  'other'             -- Autre
);

-- Type pour les catégories de propriétés
CREATE TYPE property_category AS ENUM (
  'building',         -- Immeuble entier (contient plusieurs lots)
  'house',            -- Maison individuelle
  'apartment',        -- Appartement (si 1 seul lot dans la propriété)
  'commercial',       -- Local commercial
  'office',           -- Bureau
  'land',             -- Terrain
  'parking',          -- Parking (si 1 seul lot dans la propriété)
  'other'             -- Autre
);

-- Type pour les types de lots
CREATE TYPE lot_type AS ENUM (
  'apartment',        -- Appartement
  'studio',           -- Studio
  'house',            -- Maison
  'commercial',       -- Local commercial
  'office',           -- Bureau
  'parking',          -- Parking
  'cellar',           -- Cave
  'storage',          -- Débarras/Box de stockage
  'land',             -- Terrain
  'other'             -- Autre
);

-- Type pour le statut des lots
CREATE TYPE lot_status AS ENUM (
  'vacant',           -- Vacant (disponible à la location)
  'occupied',         -- Occupé (loué)
  'unavailable',      -- Indisponible (travaux, rénovation, etc.)
  'for_sale'          -- En vente
);

-- ============================================================================
-- 4. TABLE ENTITIES (Entités juridiques)
-- ============================================================================

CREATE TABLE entities (
  -- Identifiant unique
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relation avec l'utilisateur (bailleur)
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Informations générales
  name VARCHAR(255) NOT NULL,
  entity_type entity_type NOT NULL DEFAULT 'individual',

  -- Informations légales (optionnelles selon le type d'entité)
  siren VARCHAR(9),
  siret VARCHAR(14),
  vat_number VARCHAR(20),
  rcs_city VARCHAR(100),
  capital DECIMAL(15,2),

  -- Coordonnées
  address VARCHAR(500),
  city VARCHAR(100),
  postal_code VARCHAR(10),
  country VARCHAR(100) DEFAULT 'France',
  email VARCHAR(255),
  phone VARCHAR(20),

  -- Paramètres de personnalisation
  logo_url VARCHAR(500),
  color VARCHAR(7) DEFAULT '#2563EB',
  vat_applicable BOOLEAN DEFAULT FALSE,
  default_entity BOOLEAN DEFAULT FALSE,

  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Contraintes
  CONSTRAINT entities_user_name_unique UNIQUE(user_id, name),
  CONSTRAINT entities_color_format CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

-- Commentaires sur la table
COMMENT ON TABLE entities IS 'Entités juridiques : SCI, SARL, LMNP, nom propre, etc.';
COMMENT ON COLUMN entities.default_entity IS 'Entité sélectionnée par défaut dans l''interface';
COMMENT ON COLUMN entities.vat_applicable IS 'Si TRUE, la TVA s''applique aux loyers';
COMMENT ON COLUMN entities.color IS 'Couleur de personnalisation (format hexadécimal)';

-- ============================================================================
-- 5. TABLE PROPERTIES (Propriétés/Immeubles) - NOUVELLE VERSION
-- ============================================================================

CREATE TABLE properties_new (
  -- Identifiant unique
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relation avec l'entité juridique
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,

  -- Informations générales
  name VARCHAR(255) NOT NULL,
  category property_category NOT NULL DEFAULT 'building',

  -- Localisation
  address VARCHAR(500) NOT NULL,
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  country VARCHAR(100) DEFAULT 'France',

  -- Caractéristiques du bien
  construction_year INTEGER,
  acquisition_date DATE,
  acquisition_price DECIMAL(15,2),
  current_value DECIMAL(15,2),

  -- Informations copropriété
  is_coproperty BOOLEAN DEFAULT FALSE,
  coproperty_lots INTEGER,
  syndic_name VARCHAR(255),
  syndic_email VARCHAR(255),
  syndic_phone VARCHAR(20),
  syndic_fees DECIMAL(10,2),

  -- Informations additionnelles
  description TEXT,
  notes TEXT,

  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Contraintes
  CONSTRAINT properties_new_entity_name_unique UNIQUE(entity_id, name),
  CONSTRAINT properties_new_year_valid CHECK (construction_year >= 1800 AND construction_year <= EXTRACT(YEAR FROM CURRENT_DATE) + 5)
);

-- Commentaires sur la table
COMMENT ON TABLE properties_new IS 'Propriétés immobilières : immeubles, maisons, terrains (contiennent des lots)';
COMMENT ON COLUMN properties_new.category IS 'Type de propriété : building (immeuble), house (maison), etc.';
COMMENT ON COLUMN properties_new.is_coproperty IS 'Si TRUE, la propriété est en copropriété';
COMMENT ON COLUMN properties_new.syndic_fees IS 'Charges de syndic mensuelles';

-- ============================================================================
-- 6. TABLE LOTS (Unités locatives)
-- ============================================================================

CREATE TABLE lots (
  -- Identifiant unique
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relation avec la propriété
  property_id UUID NOT NULL REFERENCES properties_new(id) ON DELETE CASCADE,

  -- Informations générales
  name VARCHAR(255) NOT NULL,
  reference VARCHAR(50),
  lot_type lot_type NOT NULL DEFAULT 'apartment',
  status lot_status NOT NULL DEFAULT 'vacant',

  -- Localisation dans la propriété
  floor INTEGER,
  door_number VARCHAR(20),

  -- Caractéristiques du lot
  surface_area DECIMAL(10,2),
  nb_rooms INTEGER,
  nb_bedrooms INTEGER,
  nb_bathrooms INTEGER,

  -- Montants financiers
  rent_amount DECIMAL(10,2) NOT NULL,
  charges_amount DECIMAL(10,2) DEFAULT 0,
  deposit_amount DECIMAL(10,2),

  -- Équipements
  furnished BOOLEAN DEFAULT FALSE,
  has_parking BOOLEAN DEFAULT FALSE,
  has_cellar BOOLEAN DEFAULT FALSE,
  has_balcony BOOLEAN DEFAULT FALSE,
  has_terrace BOOLEAN DEFAULT FALSE,
  has_garden BOOLEAN DEFAULT FALSE,
  has_elevator BOOLEAN DEFAULT FALSE,

  -- Diagnostics énergétiques
  heating_type VARCHAR(100),
  dpe_rating VARCHAR(1),
  dpe_value INTEGER,
  dpe_date DATE,
  ges_rating VARCHAR(1),
  ges_value INTEGER,

  -- Informations copropriété (si applicable)
  coproperty_lot_number VARCHAR(50),
  coproperty_tantieme INTEGER,

  -- Informations additionnelles
  description TEXT,
  notes TEXT,

  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Contraintes
  CONSTRAINT lots_property_reference_unique UNIQUE(property_id, reference),
  CONSTRAINT lots_rent_positive CHECK (rent_amount >= 0),
  CONSTRAINT lots_charges_positive CHECK (charges_amount >= 0),
  CONSTRAINT lots_dpe_rating_valid CHECK (dpe_rating IN ('A', 'B', 'C', 'D', 'E', 'F', 'G') OR dpe_rating IS NULL),
  CONSTRAINT lots_ges_rating_valid CHECK (ges_rating IN ('A', 'B', 'C', 'D', 'E', 'F', 'G') OR ges_rating IS NULL)
);

-- Commentaires sur la table
COMMENT ON TABLE lots IS 'Unités locatives (lots) : appartements, parkings, caves, etc.';
COMMENT ON COLUMN lots.reference IS 'Référence unique du lot dans la propriété (ex: A101, Parking-12)';
COMMENT ON COLUMN lots.status IS 'Statut du lot : vacant, occupied, unavailable, for_sale';
COMMENT ON COLUMN lots.furnished IS 'Si TRUE, le lot est loué meublé';
COMMENT ON COLUMN lots.dpe_rating IS 'Classe DPE (A à G)';
COMMENT ON COLUMN lots.ges_rating IS 'Classe GES (A à G)';
COMMENT ON COLUMN lots.coproperty_tantieme IS 'Tantièmes de copropriété (en millièmes)';

-- ============================================================================
-- 7. CRÉATION DES INDEX POUR LES PERFORMANCES
-- ============================================================================

-- Index sur la table entities
CREATE INDEX idx_entities_user ON entities(user_id);
CREATE INDEX idx_entities_default ON entities(user_id, default_entity) WHERE default_entity = TRUE;
CREATE INDEX idx_entities_created_at ON entities(created_at DESC);

-- Index sur la table properties_new
CREATE INDEX idx_properties_new_entity ON properties_new(entity_id);
CREATE INDEX idx_properties_new_created_at ON properties_new(created_at DESC);
CREATE INDEX idx_properties_new_city ON properties_new(city);
CREATE INDEX idx_properties_new_category ON properties_new(category);

-- Index sur la table lots
CREATE INDEX idx_lots_property ON lots(property_id);
CREATE INDEX idx_lots_status ON lots(status);
CREATE INDEX idx_lots_created_at ON lots(created_at DESC);
CREATE INDEX idx_lots_type ON lots(lot_type);
CREATE INDEX idx_lots_vacant ON lots(property_id, status) WHERE status = 'vacant';

-- ============================================================================
-- 8. CRÉATION DES TRIGGERS POUR updated_at
-- ============================================================================

-- Trigger pour entities
CREATE TRIGGER trigger_entities_updated_at
    BEFORE UPDATE ON entities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour properties_new
CREATE TRIGGER trigger_properties_new_updated_at
    BEFORE UPDATE ON properties_new
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour lots
CREATE TRIGGER trigger_lots_updated_at
    BEFORE UPDATE ON lots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 9. ACTIVATION DE ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Activer RLS sur toutes les nouvelles tables
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE lots ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour entities : un utilisateur ne voit que ses propres entités
CREATE POLICY entities_policy ON entities
    FOR ALL
    USING (auth.uid() = (SELECT supabase_uid FROM users WHERE id = user_id))
    WITH CHECK (auth.uid() = (SELECT supabase_uid FROM users WHERE id = user_id));

-- Politique RLS pour properties_new : via l'entité
CREATE POLICY properties_new_policy ON properties_new
    FOR ALL
    USING (
        auth.uid() = (
            SELECT u.supabase_uid
            FROM users u
            INNER JOIN entities e ON e.user_id = u.id
            WHERE e.id = entity_id
        )
    )
    WITH CHECK (
        auth.uid() = (
            SELECT u.supabase_uid
            FROM users u
            INNER JOIN entities e ON e.user_id = u.id
            WHERE e.id = entity_id
        )
    );

-- Politique RLS pour lots : via la propriété et l'entité
CREATE POLICY lots_policy ON lots
    FOR ALL
    USING (
        auth.uid() = (
            SELECT u.supabase_uid
            FROM users u
            INNER JOIN entities e ON e.user_id = u.id
            INNER JOIN properties_new p ON p.entity_id = e.id
            WHERE p.id = property_id
        )
    )
    WITH CHECK (
        auth.uid() = (
            SELECT u.supabase_uid
            FROM users u
            INNER JOIN entities e ON e.user_id = u.id
            INNER JOIN properties_new p ON p.entity_id = e.id
            WHERE p.id = property_id
        )
    );

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================

-- Afficher un message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Nouvelles tables créées avec succès !';
    RAISE NOTICE '   - entities';
    RAISE NOTICE '   - properties_new';
    RAISE NOTICE '   - lots';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Index créés pour optimiser les performances';
    RAISE NOTICE '🔒 Row Level Security (RLS) activé';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  PROCHAINE ÉTAPE : Migration des données existantes';
END $$;
