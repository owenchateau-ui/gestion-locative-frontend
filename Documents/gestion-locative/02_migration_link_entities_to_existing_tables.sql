-- ============================================================================
-- MIGRATION : Liaison des tables existantes à la nouvelle architecture
-- ============================================================================
--
-- Ce script ajoute les colonnes nécessaires pour lier les tables existantes
-- (tenants, leases) à la nouvelle architecture multi-entités (entities, lots)
--
-- IMPORTANT : Ce script ne supprime aucune donnée, il ajoute uniquement
-- des colonnes et des index.
--
-- Date : Décembre 2024
-- ============================================================================

-- ============================================================================
-- 1. AJOUT DE entity_id À LA TABLE tenants
-- ============================================================================
-- Un locataire peut être associé à une entité spécifique
-- (utile pour filtrer les locataires par entité)

DO $$
BEGIN
    -- Vérifier si la colonne n'existe pas déjà
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'tenants'
        AND column_name = 'entity_id'
    ) THEN
        ALTER TABLE tenants
        ADD COLUMN entity_id UUID REFERENCES entities(id) ON DELETE SET NULL;

        RAISE NOTICE 'Colonne entity_id ajoutée à la table tenants';
    ELSE
        RAISE NOTICE 'La colonne entity_id existe déjà dans la table tenants';
    END IF;
END $$;

-- Commentaire sur la colonne
COMMENT ON COLUMN tenants.entity_id IS 'Entité à laquelle le locataire est rattaché (optionnel, peut être déduit via les baux)';


-- ============================================================================
-- 2. AJOUT DE lot_id À LA TABLE leases
-- ============================================================================
-- Un bail est désormais lié à un lot (et non plus directement à une propriété)
-- On garde property_id pour la compatibilité avec les données existantes

DO $$
BEGIN
    -- Vérifier si la colonne n'existe pas déjà
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'leases'
        AND column_name = 'lot_id'
    ) THEN
        ALTER TABLE leases
        ADD COLUMN lot_id UUID REFERENCES lots(id) ON DELETE CASCADE;

        RAISE NOTICE 'Colonne lot_id ajoutée à la table leases';
    ELSE
        RAISE NOTICE 'La colonne lot_id existe déjà dans la table leases';
    END IF;
END $$;

-- Commentaire sur la colonne
COMMENT ON COLUMN leases.lot_id IS 'Lot (unité locative) concerné par le bail - nouvelle architecture';


-- ============================================================================
-- 3. AJOUT DES COLONNES DE TRAÇABILITÉ POUR LA MIGRATION
-- ============================================================================
-- Ces colonnes permettent de tracer l'origine des données migrées

-- Ajouter migrated_from_property_id à properties_new
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'properties_new'
        AND column_name = 'migrated_from_property_id'
    ) THEN
        ALTER TABLE properties_new
        ADD COLUMN migrated_from_property_id UUID REFERENCES properties(id) ON DELETE SET NULL;

        RAISE NOTICE 'Colonne migrated_from_property_id ajoutée à properties_new';
    ELSE
        RAISE NOTICE 'La colonne migrated_from_property_id existe déjà dans properties_new';
    END IF;
END $$;

COMMENT ON COLUMN properties_new.migrated_from_property_id IS 'ID de la propriété source (table properties) si cette propriété a été migrée';

-- Ajouter migrated_from_property_id à lots
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'lots'
        AND column_name = 'migrated_from_property_id'
    ) THEN
        ALTER TABLE lots
        ADD COLUMN migrated_from_property_id UUID REFERENCES properties(id) ON DELETE SET NULL;

        RAISE NOTICE 'Colonne migrated_from_property_id ajoutée à lots';
    ELSE
        RAISE NOTICE 'La colonne migrated_from_property_id existe déjà dans lots';
    END IF;
END $$;

COMMENT ON COLUMN lots.migrated_from_property_id IS 'ID de la propriété source (table properties) si ce lot a été créé lors de la migration';


-- ============================================================================
-- 4. CRÉATION DES INDEX POUR LES PERFORMANCES
-- ============================================================================

-- Index sur tenants.entity_id
CREATE INDEX IF NOT EXISTS idx_tenants_entity_id
ON tenants(entity_id)
WHERE entity_id IS NOT NULL;

-- Index sur leases.lot_id
CREATE INDEX IF NOT EXISTS idx_leases_lot_id
ON leases(lot_id)
WHERE lot_id IS NOT NULL;

-- Index composite pour les requêtes fréquentes
-- (trouver les baux actifs d'un lot)
CREATE INDEX IF NOT EXISTS idx_leases_lot_status
ON leases(lot_id, status)
WHERE lot_id IS NOT NULL;

-- Index pour les paiements liés aux lots via les baux
-- (Déjà existant sur lease_id, mais on s'assure qu'il existe)
CREATE INDEX IF NOT EXISTS idx_payments_lease_id
ON payments(lease_id);


-- ============================================================================
-- 4. VÉRIFICATION DES CONTRAINTES ET INDEX EXISTANTS
-- ============================================================================

-- S'assurer que l'index sur properties_new.entity_id existe
CREATE INDEX IF NOT EXISTS idx_properties_new_entity_id
ON properties_new(entity_id);

-- S'assurer que l'index sur lots.property_id existe
CREATE INDEX IF NOT EXISTS idx_lots_property_id
ON lots(property_id);


-- ============================================================================
-- 5. RÉSUMÉ DES MODIFICATIONS
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'MIGRATION TERMINÉE AVEC SUCCÈS';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Modifications apportées :';
    RAISE NOTICE '1. Colonne entity_id ajoutée à tenants (nullable)';
    RAISE NOTICE '2. Colonne lot_id ajoutée à leases (nullable)';
    RAISE NOTICE '3. Colonnes de traçabilité ajoutées (migrated_from_property_id)';
    RAISE NOTICE '4. Index créés pour optimiser les performances';
    RAISE NOTICE '';
    RAISE NOTICE 'PROCHAINES ÉTAPES :';
    RAISE NOTICE '1. Exécuter le script 03_migration_data_to_new_architecture.sql';
    RAISE NOTICE '   pour migrer les données existantes';
    RAISE NOTICE '';
    RAISE NOTICE 'Aucune donnée existante n''a été supprimée.';
    RAISE NOTICE '========================================';
END $$;


-- ============================================================================
-- 6. REQUÊTES DE VÉRIFICATION (optionnel)
-- ============================================================================

-- Vérifier que les colonnes ont bien été ajoutées
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('tenants', 'leases', 'properties_new', 'lots')
AND column_name IN ('entity_id', 'lot_id', 'migrated_from_property_id')
ORDER BY table_name, column_name;

-- Vérifier les index créés
SELECT
    schemaname,
    tablename,
    indexname
FROM pg_indexes
WHERE tablename IN ('tenants', 'leases', 'properties_new', 'lots')
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
