# 🚀 Guide de Migration - Architecture Multi-Entités

Ce guide explique comment migrer votre application de gestion locative vers la nouvelle architecture multi-entités.

## 📋 Vue d'ensemble

La migration se fait en **3 étapes** :

1. **Script 01** : Création des nouvelles tables (entities, properties_new, lots)
2. **Script 02** : Ajout des colonnes de liaison aux tables existantes
3. **Script 03** : Migration des données existantes vers la nouvelle architecture

---

## ⚠️ Avant de commencer

### Prérequis
- ✅ Accès à Supabase SQL Editor
- ✅ Sauvegarde de votre base de données
- ✅ Les tables existantes : `users`, `properties`, `tenants`, `leases`, `payments`

### Sauvegarde (IMPORTANT)
Avant toute migration, sauvegardez votre base de données :
```sql
-- Dans Supabase : Settings > Database > Backups
```

---

## 📝 Étape 1 : Créer les nouvelles tables

**Fichier** : `01_create_multi_entity_tables.sql`

### Ce que fait ce script :
- ✨ Crée la table `entities` (SCI, SARL, LMNP, Nom propre, etc.)
- ✨ Crée la table `properties_new` (biens immobiliers liés aux entités)
- ✨ Crée la table `lots` (unités locatives : appartements, parkings, etc.)
- ✨ Crée les types ENUM nécessaires
- ✨ Configure les RLS (Row Level Security) policies

### Exécution :
1. Ouvre Supabase SQL Editor
2. Copie/colle le contenu de `01_create_multi_entity_tables.sql`
3. Exécute le script ▶️
4. Vérifie les messages de confirmation

### Résultat attendu :
```
✓ 3 types ENUM créés
✓ 3 nouvelles tables créées
✓ RLS activé et policies configurées
```

---

## 🔗 Étape 2 : Lier les tables existantes

**Fichier** : `02_migration_link_entities_to_existing_tables.sql`

### Ce que fait ce script :
- 🔧 Ajoute `entity_id` à la table `tenants`
- 🔧 Ajoute `lot_id` à la table `leases`
- 🔧 Ajoute les colonnes de traçabilité `migrated_from_property_id`
- 🔧 Crée les index pour optimiser les performances
- ⚠️ **AUCUNE donnée n'est supprimée**

### Exécution :
1. Ouvre Supabase SQL Editor
2. Copie/colle le contenu de `02_migration_link_entities_to_existing_tables.sql`
3. Exécute le script ▶️
4. Vérifie les messages de confirmation

### Résultat attendu :
```
✓ Colonne entity_id ajoutée à tenants
✓ Colonne lot_id ajoutée à leases
✓ Colonnes de traçabilité ajoutées
✓ 6 index créés
```

### Colonnes ajoutées :
| Table | Colonne | Type | Description |
|-------|---------|------|-------------|
| `tenants` | `entity_id` | UUID (nullable) | Lien vers l'entité |
| `leases` | `lot_id` | UUID (nullable) | Lien vers le lot |
| `properties_new` | `migrated_from_property_id` | UUID (nullable) | Traçabilité migration |
| `lots` | `migrated_from_property_id` | UUID (nullable) | Traçabilité migration |

---

## 📦 Étape 3 : Migrer les données

**Fichier** : `03_migration_data_to_new_architecture.sql`

### Ce que fait ce script :
1. 👤 **Crée une entité par défaut** "Prénom Nom" pour chaque utilisateur
2. 🏠 **Migre les propriétés** de `properties` → `properties_new`
3. 🏘️ **Crée un lot** pour chaque propriété migrée
4. 📝 **Met à jour les baux** pour pointer vers les lots
5. 👥 **Lie les locataires** aux entités

### Caractéristiques :
- ✅ **Idempotent** : peut être exécuté plusieurs fois sans créer de doublons
- ✅ **Sécurisé** : ne supprime aucune donnée existante
- ✅ **Verbeux** : affiche des logs détaillés de chaque opération
- ✅ **Statistiques** : résumé complet en fin d'exécution

### Exécution :
1. Ouvre Supabase SQL Editor
2. Copie/colle le contenu de `03_migration_data_to_new_architecture.sql`
3. Exécute le script ▶️
4. Lis attentivement les logs et statistiques

### Résultat attendu :
```
========================================
MIGRATION TERMINÉE - STATISTIQUES
========================================

Entités totales : 1
Propriétés migrées : 5
Lots créés : 5
Baux mis à jour : 3 / 3
Locataires liés : 2 / 2

SUCCÈS : Migration 100% complète !
========================================
```

### Exemple de logs :
```
ÉTAPE 1 : Création des entités par défaut
Entité créée pour Jean Dupont (ID: abc123...)
Total : 1 entité(s) créée(s)

ÉTAPE 2 : Migration des propriétés
Propriété migrée : "Appartement Paris 11" (ancien ID: xyz789, nouveau ID: def456)
Total : 5 propriété(s) migrée(s), 0 ignorée(s)

ÉTAPE 3 : Création des lots
Lot créé pour propriété "Appartement Paris 11" (ID: ghi012...)
Total : 5 lot(s) créé(s), 0 ignoré(s)

ÉTAPE 4 : Mise à jour des baux
Bail ID xyz mis à jour avec lot ID abc
Total : 3 bail/baux mis à jour, 0 ignoré(s)

ÉTAPE 5 : Liaison des locataires aux entités
Locataire Marie Martin lié à l'entité ID abc123
Total : 2 locataire(s) lié(s), 0 ignoré(s)
```

---

## 🔍 Vérification après migration

### Requêtes SQL de vérification

#### 1. Vérifier les entités créées
```sql
SELECT
    e.name,
    e.entity_type,
    e.default_entity,
    COUNT(pn.id) as nb_properties
FROM entities e
LEFT JOIN properties_new pn ON e.id = pn.entity_id
GROUP BY e.id, e.name, e.entity_type, e.default_entity;
```

#### 2. Vérifier les propriétés migrées
```sql
SELECT
    pn.name,
    pn.migrated_from_property_id as old_id,
    e.name as entity_name,
    COUNT(l.id) as nb_lots
FROM properties_new pn
JOIN entities e ON pn.entity_id = e.id
LEFT JOIN lots l ON pn.id = l.property_id
WHERE pn.migrated_from_property_id IS NOT NULL
GROUP BY pn.id, pn.name, pn.migrated_from_property_id, e.name;
```

#### 3. Vérifier les baux mis à jour
```sql
SELECT
    lease.id,
    lot.name as lot_name,
    pn.name as property_name,
    t.first_name || ' ' || t.last_name as tenant_name,
    lease.status
FROM leases lease
JOIN lots lot ON lease.lot_id = lot.id
JOIN properties_new pn ON lot.property_id = pn.id
JOIN tenants t ON lease.tenant_id = t.id
WHERE lease.lot_id IS NOT NULL;
```

#### 4. Vérifier les locataires liés
```sql
SELECT
    t.first_name || ' ' || t.last_name as tenant_name,
    e.name as entity_name,
    COUNT(l.id) as nb_leases
FROM tenants t
JOIN entities e ON t.entity_id = e.id
LEFT JOIN leases l ON t.id = l.tenant_id
GROUP BY t.id, t.first_name, t.last_name, e.name;
```

---

## 🎯 Étape suivante : Tester l'application

Après la migration, teste ces fonctionnalités :

### ✅ Checklist de tests

- [ ] **Connexion** : Je peux me connecter à l'application
- [ ] **Dashboard** : Les stats s'affichent correctement
- [ ] **Sélecteur d'entité** : Je vois mon entité dans le sélecteur de la sidebar
- [ ] **Propriétés** : Mes propriétés migrées s'affichent
- [ ] **Lots** : Les lots créés s'affichent avec les bonnes infos
- [ ] **Baux** : Les baux affichent "Bien / Lot" correctement
- [ ] **Locataires** : Mes locataires s'affichent
- [ ] **Paiements** : Les paiements s'affichent avec Bien/Lot
- [ ] **Filtrage** : Le filtre par entité fonctionne sur toutes les pages
- [ ] **Création** : Je peux créer un nouveau bien/lot/bail

---

## ❗ Résolution des problèmes

### Problème : "Aucune entité créée"
**Cause** : La table `users` est vide ou mal configurée
**Solution** :
```sql
-- Vérifier les utilisateurs
SELECT id, first_name, last_name FROM users;

-- Créer manuellement une entité si nécessaire
INSERT INTO entities (user_id, name, entity_type, default_entity, color)
VALUES ('YOUR_USER_ID', 'Mon Entité', 'individual', true, '#3B82F6');
```

### Problème : "Propriétés non migrées"
**Cause** : Aucune donnée dans la table `properties`
**Solution** : Les propriétés doivent exister dans l'ancienne table `properties`

### Problème : "Baux non mis à jour"
**Cause** : Les lots n'ont pas été créés
**Solution** : Réexécute le script 03 (il est idempotent)

### Problème : "Migration incomplète"
**Cause** : Certaines données ont des références manquantes
**Solution** : Vérifie les logs, corrige manuellement si nécessaire :
```sql
-- Vérifier les baux sans lot
SELECT l.id, l.property_id
FROM leases l
WHERE l.lot_id IS NULL;

-- Vérifier les locataires sans entité
SELECT t.id, t.first_name, t.last_name
FROM tenants t
WHERE t.entity_id IS NULL;
```

---

## 🔄 Rollback (si nécessaire)

Si la migration échoue et que tu veux revenir en arrière :

```sql
-- ATTENTION : Ceci supprimera les données migrées !

-- 1. Vider les colonnes ajoutées
UPDATE leases SET lot_id = NULL;
UPDATE tenants SET entity_id = NULL;

-- 2. Supprimer les données migrées
DELETE FROM lots WHERE migrated_from_property_id IS NOT NULL;
DELETE FROM properties_new WHERE migrated_from_property_id IS NOT NULL;

-- 3. Supprimer les entités créées automatiquement
-- (Garde celles créées manuellement si nécessaire)
DELETE FROM entities WHERE name LIKE '% %' AND entity_type = 'individual';

-- 4. Optionnel : Supprimer les colonnes ajoutées
ALTER TABLE leases DROP COLUMN IF EXISTS lot_id;
ALTER TABLE tenants DROP COLUMN IF EXISTS entity_id;
ALTER TABLE properties_new DROP COLUMN IF EXISTS migrated_from_property_id;
ALTER TABLE lots DROP COLUMN IF EXISTS migrated_from_property_id;
```

---

## 📞 Support

Si tu rencontres des problèmes :
1. Vérifie les logs du script (messages `NOTICE`, `WARNING`)
2. Exécute les requêtes de vérification ci-dessus
3. Consulte la section "Résolution des problèmes"
4. Conserve une sauvegarde de ta base de données !

---

## ✅ Checklist de migration

- [ ] Sauvegarde de la base de données effectuée
- [ ] Script 01 exécuté avec succès
- [ ] Script 02 exécuté avec succès
- [ ] Script 03 exécuté avec succès
- [ ] Vérifications SQL effectuées
- [ ] Tests de l'application effectués
- [ ] Migration validée ✨

**Durée estimée** : 10-15 minutes

**Bonne migration ! 🚀**
