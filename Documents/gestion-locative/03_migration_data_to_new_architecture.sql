-- ============================================================================
-- MIGRATION DES DONNÉES : Ancienne architecture → Nouvelle architecture
-- ============================================================================
--
-- Ce script migre les données existantes vers la nouvelle architecture :
-- 1. Crée une entité par défaut pour chaque utilisateur
-- 2. Migre les propriétés de 'properties' vers 'properties_new'
-- 3. Crée un lot pour chaque propriété migrée
-- 4. Met à jour les baux pour pointer vers les lots
-- 5. Lie les locataires à l'entité par défaut
--
-- IMPORTANT : Ce script est IDEMPOTENT (peut être exécuté plusieurs fois)
-- Il ne créera pas de doublons.
--
-- Date : Décembre 2024
-- ============================================================================

-- Activer l'extension UUID si nécessaire
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ÉTAPE 1 : Créer une entité par défaut pour chaque utilisateur
-- ============================================================================

DO $$
DECLARE
    v_user RECORD;
    v_entity_id UUID;
    v_count INTEGER := 0;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ÉTAPE 1 : Création des entités par défaut';
    RAISE NOTICE '========================================';

    -- Pour chaque utilisateur qui n'a pas d'entité
    FOR v_user IN
        SELECT u.id, u.first_name, u.last_name
        FROM users u
        WHERE NOT EXISTS (
            SELECT 1 FROM entities e WHERE e.user_id = u.id
        )
    LOOP
        -- Créer une entité "Nom propre" par défaut
        INSERT INTO entities (
            user_id,
            name,
            entity_type,
            color,
            default_entity,
            created_at,
            updated_at
        ) VALUES (
            v_user.id,
            v_user.first_name || ' ' || v_user.last_name,  -- "Prénom Nom"
            'individual',  -- Nom propre
            '#3B82F6',     -- Couleur bleue par défaut
            true,          -- Entité par défaut
            NOW(),
            NOW()
        )
        RETURNING id INTO v_entity_id;

        v_count := v_count + 1;
        RAISE NOTICE 'Entité créée pour % % (ID: %)',
            v_user.first_name, v_user.last_name, v_entity_id;
    END LOOP;

    IF v_count = 0 THEN
        RAISE NOTICE 'Aucune entité à créer (tous les utilisateurs ont déjà au moins une entité)';
    ELSE
        RAISE NOTICE 'Total : % entité(s) créée(s)', v_count;
    END IF;
    RAISE NOTICE '';
END $$;


-- ============================================================================
-- ÉTAPE 2 : Migrer les propriétés de 'properties' vers 'properties_new'
-- ============================================================================

DO $$
DECLARE
    v_property RECORD;
    v_entity_id UUID;
    v_new_property_id UUID;
    v_count INTEGER := 0;
    v_skipped INTEGER := 0;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ÉTAPE 2 : Migration des propriétés';
    RAISE NOTICE '========================================';

    -- Pour chaque propriété de l'ancienne table
    FOR v_property IN
        SELECT p.*
        FROM properties p
        WHERE NOT EXISTS (
            -- Vérifier qu'elle n'a pas déjà été migrée
            SELECT 1 FROM properties_new pn
            WHERE pn.migrated_from_property_id = p.id
        )
    LOOP
        -- Récupérer l'entité par défaut de l'utilisateur
        SELECT id INTO v_entity_id
        FROM entities
        WHERE user_id = v_property.owner_id
        AND default_entity = true
        LIMIT 1;

        IF v_entity_id IS NULL THEN
            RAISE WARNING 'Aucune entité trouvée pour le propriétaire ID %, propriété % ignorée',
                v_property.owner_id, v_property.id;
            v_skipped := v_skipped + 1;
            CONTINUE;
        END IF;

        -- Insérer dans properties_new
        INSERT INTO properties_new (
            entity_id,
            name,
            address,
            city,
            postal_code,
            category,
            construction_year,
            is_coproperty,
            migrated_from_property_id,
            created_at,
            updated_at
        ) VALUES (
            v_entity_id,
            v_property.name,
            v_property.address,
            v_property.city,
            v_property.postal_code,
            -- Mapper property_type vers category
            CASE v_property.property_type
                WHEN 'apartment' THEN 'apartment'
                WHEN 'house' THEN 'house'
                WHEN 'commercial' THEN 'commercial'
                WHEN 'parking' THEN 'parking'
                ELSE 'other'
            END,
            NULL,  -- construction_year non disponible dans ancienne structure
            false, -- is_coproperty par défaut
            v_property.id,  -- Lien vers ancienne propriété
            v_property.created_at,
            NOW()
        )
        RETURNING id INTO v_new_property_id;

        v_count := v_count + 1;
        RAISE NOTICE 'Propriété migrée : "%" (ancien ID: %, nouveau ID: %)',
            v_property.name, v_property.id, v_new_property_id;
    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE 'Total : % propriété(s) migrée(s), % ignorée(s)', v_count, v_skipped;
    RAISE NOTICE '';
END $$;


-- ============================================================================
-- ÉTAPE 3 : Créer un lot pour chaque propriété migrée
-- ============================================================================

DO $$
DECLARE
    v_property RECORD;
    v_old_property RECORD;
    v_lot_id UUID;
    v_count INTEGER := 0;
    v_skipped INTEGER := 0;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ÉTAPE 3 : Création des lots';
    RAISE NOTICE '========================================';

    -- Pour chaque propriété de properties_new qui n'a pas encore de lot
    FOR v_property IN
        SELECT pn.*
        FROM properties_new pn
        WHERE pn.migrated_from_property_id IS NOT NULL
        AND NOT EXISTS (
            SELECT 1 FROM lots l
            WHERE l.property_id = pn.id
            AND l.migrated_from_property_id = pn.migrated_from_property_id
        )
    LOOP
        -- Récupérer les infos de l'ancienne propriété
        SELECT * INTO v_old_property
        FROM properties
        WHERE id = v_property.migrated_from_property_id;

        IF v_old_property.id IS NULL THEN
            RAISE WARNING 'Propriété source introuvable pour ID %, lot non créé',
                v_property.migrated_from_property_id;
            v_skipped := v_skipped + 1;
            CONTINUE;
        END IF;

        -- Créer un lot correspondant
        INSERT INTO lots (
            property_id,
            name,
            reference,
            lot_type,
            floor,
            surface_area,
            nb_rooms,
            nb_bedrooms,
            rent_amount,
            charges_amount,
            deposit_amount,
            status,
            migrated_from_property_id,
            created_at,
            updated_at
        ) VALUES (
            v_property.id,
            'Lot principal',  -- Nom par défaut
            'LOT-001',        -- Référence par défaut
            -- Mapper property_type vers lot_type
            CASE v_old_property.property_type
                WHEN 'apartment' THEN 'apartment'
                WHEN 'house' THEN 'house'
                WHEN 'studio' THEN 'studio'
                WHEN 'commercial' THEN 'commercial'
                WHEN 'parking' THEN 'parking'
                ELSE 'other'
            END,
            NULL,  -- floor non disponible
            v_old_property.surface_area,
            v_old_property.nb_rooms,
            NULL,  -- nb_bedrooms non disponible
            v_old_property.rent_amount,
            v_old_property.charges_amount,
            v_old_property.deposit_amount,
            v_old_property.status::text,  -- Convertir enum en text
            v_old_property.id,  -- Lien vers ancienne propriété
            v_old_property.created_at,
            NOW()
        )
        RETURNING id INTO v_lot_id;

        v_count := v_count + 1;
        RAISE NOTICE 'Lot créé pour propriété "%" (ID: %)', v_property.name, v_lot_id;
    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE 'Total : % lot(s) créé(s), % ignoré(s)', v_count, v_skipped;
    RAISE NOTICE '';
END $$;


-- ============================================================================
-- ÉTAPE 4 : Mettre à jour les baux pour pointer vers les lots
-- ============================================================================

DO $$
DECLARE
    v_lease RECORD;
    v_lot_id UUID;
    v_count INTEGER := 0;
    v_skipped INTEGER := 0;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ÉTAPE 4 : Mise à jour des baux';
    RAISE NOTICE '========================================';

    -- Pour chaque bail qui n'a pas encore de lot_id
    FOR v_lease IN
        SELECT l.*
        FROM leases l
        WHERE l.lot_id IS NULL
        AND l.property_id IS NOT NULL
    LOOP
        -- Trouver le lot correspondant via la propriété d'origine
        SELECT lots.id INTO v_lot_id
        FROM lots
        WHERE lots.migrated_from_property_id = v_lease.property_id
        LIMIT 1;

        IF v_lot_id IS NULL THEN
            RAISE WARNING 'Aucun lot trouvé pour le bail ID % (property_id: %), bail ignoré',
                v_lease.id, v_lease.property_id;
            v_skipped := v_skipped + 1;
            CONTINUE;
        END IF;

        -- Mettre à jour le bail avec le lot_id
        UPDATE leases
        SET lot_id = v_lot_id,
            updated_at = NOW()
        WHERE id = v_lease.id;

        v_count := v_count + 1;
        RAISE NOTICE 'Bail ID % mis à jour avec lot ID %', v_lease.id, v_lot_id;
    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE 'Total : % bail/baux mis à jour, % ignoré(s)', v_count, v_skipped;
    RAISE NOTICE '';
END $$;


-- ============================================================================
-- ÉTAPE 5 : Lier les locataires à l'entité par défaut
-- ============================================================================

DO $$
DECLARE
    v_tenant RECORD;
    v_entity_id UUID;
    v_count INTEGER := 0;
    v_skipped INTEGER := 0;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ÉTAPE 5 : Liaison des locataires aux entités';
    RAISE NOTICE '========================================';

    -- Pour chaque locataire qui n'a pas d'entity_id
    FOR v_tenant IN
        SELECT t.*
        FROM tenants t
        WHERE t.entity_id IS NULL
    LOOP
        -- Trouver l'entité par défaut du bailleur
        SELECT e.id INTO v_entity_id
        FROM entities e
        WHERE e.user_id = v_tenant.landlord_id
        AND e.default_entity = true
        LIMIT 1;

        IF v_entity_id IS NULL THEN
            RAISE WARNING 'Aucune entité par défaut trouvée pour le bailleur ID %, locataire % % ignoré',
                v_tenant.landlord_id, v_tenant.first_name, v_tenant.last_name;
            v_skipped := v_skipped + 1;
            CONTINUE;
        END IF;

        -- Mettre à jour le locataire
        UPDATE tenants
        SET entity_id = v_entity_id,
            updated_at = NOW()
        WHERE id = v_tenant.id;

        v_count := v_count + 1;
        RAISE NOTICE 'Locataire % % lié à l''entité ID %',
            v_tenant.first_name, v_tenant.last_name, v_entity_id;
    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE 'Total : % locataire(s) lié(s), % ignoré(s)', v_count, v_skipped;
    RAISE NOTICE '';
END $$;


-- ============================================================================
-- ÉTAPE 6 : Vérification et statistiques finales
-- ============================================================================

DO $$
DECLARE
    v_entities_count INTEGER;
    v_properties_count INTEGER;
    v_lots_count INTEGER;
    v_leases_updated_count INTEGER;
    v_leases_total_count INTEGER;
    v_tenants_updated_count INTEGER;
    v_tenants_total_count INTEGER;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'MIGRATION TERMINÉE - STATISTIQUES';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';

    -- Compter les entités créées
    SELECT COUNT(*) INTO v_entities_count FROM entities;
    RAISE NOTICE 'Entités totales : %', v_entities_count;

    -- Compter les propriétés migrées
    SELECT COUNT(*) INTO v_properties_count
    FROM properties_new
    WHERE migrated_from_property_id IS NOT NULL;
    RAISE NOTICE 'Propriétés migrées : %', v_properties_count;

    -- Compter les lots créés
    SELECT COUNT(*) INTO v_lots_count
    FROM lots
    WHERE migrated_from_property_id IS NOT NULL;
    RAISE NOTICE 'Lots créés : %', v_lots_count;

    -- Compter les baux mis à jour
    SELECT COUNT(*) INTO v_leases_updated_count
    FROM leases
    WHERE lot_id IS NOT NULL;

    SELECT COUNT(*) INTO v_leases_total_count FROM leases;
    RAISE NOTICE 'Baux mis à jour : % / %', v_leases_updated_count, v_leases_total_count;

    -- Compter les locataires liés
    SELECT COUNT(*) INTO v_tenants_updated_count
    FROM tenants
    WHERE entity_id IS NOT NULL;

    SELECT COUNT(*) INTO v_tenants_total_count FROM tenants;
    RAISE NOTICE 'Locataires liés : % / %', v_tenants_updated_count, v_tenants_total_count;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';

    -- Vérifier si la migration est complète
    IF v_leases_updated_count = v_leases_total_count AND
       v_tenants_updated_count = v_tenants_total_count THEN
        RAISE NOTICE 'SUCCÈS : Migration 100%% complète !';
    ELSE
        RAISE NOTICE 'ATTENTION : Migration incomplète';
        IF v_leases_updated_count < v_leases_total_count THEN
            RAISE NOTICE '  - % bail/baux non migré(s)', v_leases_total_count - v_leases_updated_count;
        END IF;
        IF v_tenants_updated_count < v_tenants_total_count THEN
            RAISE NOTICE '  - % locataire(s) non lié(s)', v_tenants_total_count - v_tenants_updated_count;
        END IF;
    END IF;

    RAISE NOTICE '========================================';
END $$;


-- ============================================================================
-- REQUÊTES DE VÉRIFICATION (optionnel)
-- ============================================================================

-- Afficher les entités créées
SELECT
    e.id,
    e.name,
    e.entity_type,
    e.default_entity,
    u.first_name || ' ' || u.last_name as owner_name
FROM entities e
JOIN users u ON e.user_id = u.id
ORDER BY e.created_at DESC;

-- Afficher les propriétés migrées
SELECT
    pn.id as new_id,
    pn.name,
    pn.migrated_from_property_id as old_id,
    e.name as entity_name
FROM properties_new pn
JOIN entities e ON pn.entity_id = e.id
WHERE pn.migrated_from_property_id IS NOT NULL
ORDER BY pn.created_at DESC;

-- Afficher les lots créés
SELECT
    l.id,
    l.name,
    l.lot_type,
    l.rent_amount,
    pn.name as property_name,
    l.migrated_from_property_id as old_property_id
FROM lots l
JOIN properties_new pn ON l.property_id = pn.id
WHERE l.migrated_from_property_id IS NOT NULL
ORDER BY l.created_at DESC;

-- Afficher les baux mis à jour
SELECT
    l.id,
    l.lot_id,
    l.property_id as old_property_id,
    lot.name as lot_name,
    pn.name as property_name,
    t.first_name || ' ' || t.last_name as tenant_name
FROM leases l
LEFT JOIN lots lot ON l.lot_id = lot.id
LEFT JOIN properties_new pn ON lot.property_id = pn.id
LEFT JOIN tenants t ON l.tenant_id = t.id
WHERE l.lot_id IS NOT NULL
ORDER BY l.created_at DESC;
