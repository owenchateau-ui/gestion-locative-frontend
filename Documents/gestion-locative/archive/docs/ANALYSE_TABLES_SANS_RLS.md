# 🔍 Analyse - 5 Tables Sans RLS Détectées

> **Date** : 4 Janvier 2026
> **Source** : Diagnostic SQL complet
> **Impact** : Potentielle fuite de données si tables utilisées

---

## 📊 Tables Sans RLS Détectées

| Table | Priorité | Statut Probable | Action Recommandée |
|-------|----------|-----------------|-------------------|
| `documents` | 🔴 CRITIQUE | Active | ✅ Activer RLS + Policies |
| `lots_new` | 🔴 CRITIQUE | Active | ✅ Activer RLS + Policies |
| `invitations` | 🟡 MOYENNE | Doublon ? | 🔍 Vérifier si = `candidate_invitation_links` |
| `irl_indices` | 🟡 MOYENNE | Obsolète ? | 🔍 Vérifier si = `irl_history` |
| `properties` | 🟡 MOYENNE | Obsolète | 🔍 Vérifier si = `properties_new` |

---

## 🔴 Tables CRITIQUES

### 1. Table `documents`

**Hypothèse** : Table générique pour stocker tous les documents (baux, quittances, EDL, etc.)

**Risque** :
- 🔴 **CRITIQUE** - Documents potentiellement accessibles par tous les utilisateurs
- Documents peuvent contenir données sensibles (pièces d'identité, RIB, etc.)

**Questions** :
1. Cette table est-elle utilisée actuellement ?
2. Quelle est sa structure ? (colonnes : `entity_id`, `property_id`, `lot_id`, `tenant_id` ?)
3. Y a-t-il un lien avec `tenant_documents` et `candidate_documents` ?

**Action** :
```sql
-- Vérifier la structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'documents'
ORDER BY ordinal_position;

-- Compter les documents
SELECT COUNT(*) AS nb_documents FROM documents;
```

**Policy Recommandée** (à adapter selon structure) :
```sql
-- Si documents a entity_id
CREATE POLICY "Users can view documents of owned entities"
ON documents FOR SELECT
TO authenticated
USING (user_owns_entity(entity_id));
```

---

### 2. Table `lots_new`

**Hypothèse** : Probablement une migration en cours depuis table `lots` vers `lots_new`

**Risque** :
- 🔴 **CRITIQUE** - Lots accessibles par tous = fuite d'informations immobilières
- Loyers, charges, DPE, équipements exposés

**Questions** :
1. `lots` et `lots_new` existent toutes les deux ?
2. Laquelle est utilisée par le frontend ?
3. Y a-t-il des données dans les deux tables ?

**Action** :
```sql
-- Vérifier quelle table est utilisée
SELECT 'lots' AS table_name, COUNT(*) AS nb_rows FROM lots
UNION ALL
SELECT 'lots_new', COUNT(*) FROM lots_new;

-- Vérifier les références dans le code frontend
-- Chercher: import.*lotService | fetchLots | from 'lots
```

**Policy Recommandée** :
```sql
-- Copier les policies de 'lots' (voir script 20260104_FIX_TABLES_SANS_RLS.sql)
```

---

## 🟡 Tables MOYENNES (Probablement Obsolètes)

### 3. Table `invitations`

**Hypothèse** : Ancienne version de `candidate_invitation_links`

**Risque** :
- 🟡 MOYEN - Liens d'invitation exposés si table active
- Risque mineur si table obsolète

**Questions** :
1. Table vide ou contient des données ?
2. `candidate_invitation_links` existe et est utilisée ?

**Action** :
```sql
-- Comparer les deux tables
SELECT 'invitations' AS table_name, COUNT(*) FROM invitations
UNION ALL
SELECT 'candidate_invitation_links', COUNT(*) FROM candidate_invitation_links;
```

**Décision** :
- Si `invitations` vide → **Supprimer la table**
- Si `invitations` utilisée → **Migrer vers `candidate_invitation_links`** puis supprimer
- Si les deux sont utilisées → **Activer RLS sur `invitations`**

---

### 4. Table `irl_indices`

**Hypothèse** : Ancienne version de `irl_history`

**Risque** :
- 🟢 FAIBLE - Données publiques INSEE (indices IRL)
- Pas de données sensibles

**Questions** :
1. Table vide ou contient des données ?
2. `irl_history` existe et contient les mêmes données ?

**Action** :
```sql
-- Comparer les deux tables
SELECT 'irl_indices' AS table_name, COUNT(*) FROM irl_indices
UNION ALL
SELECT 'irl_history', COUNT(*) FROM irl_history;
```

**Décision** :
- Si `irl_indices` vide → **Supprimer la table**
- Si identique à `irl_history` → **Supprimer `irl_indices`**
- Si différente → **Migrer les données** puis supprimer

---

### 5. Table `properties`

**Hypothèse** : Ancienne version de `properties_new` (migration multi-entités)

**Risque** :
- 🟡 MOYEN - Propriétés immobilières accessibles par tous
- Adresses, valeurs, informations sensibles

**Questions** :
1. Table vide ou contient des données ?
2. `properties_new` existe et est utilisée ?
3. Migration complète `properties` → `properties_new` ?

**Action** :
```sql
-- Vérifier quelle table est utilisée
SELECT 'properties' AS table_name, COUNT(*) FROM properties
UNION ALL
SELECT 'properties_new', COUNT(*) FROM properties_new;
```

**Décision** :
- Si `properties` vide → **Supprimer la table**
- Si `properties` contient données → **Migrer vers `properties_new`**
- Si migration en cours → **Activer RLS temporaire** puis finaliser migration

---

## 🎯 Plan d'Action Recommandé

### Étape 1 : Diagnostic Rapide (2 minutes)

Exécutez ces requêtes pour comprendre l'état des tables :

```sql
-- Script de diagnostic rapide
SELECT 'documents' AS table_name, COUNT(*) AS rows FROM documents
UNION ALL
SELECT 'invitations', COUNT(*) FROM invitations
UNION ALL
SELECT 'irl_indices', COUNT(*) FROM irl_indices
UNION ALL
SELECT 'lots_new', COUNT(*) FROM lots_new
UNION ALL
SELECT 'properties', COUNT(*) FROM properties
UNION ALL
SELECT 'lots', COUNT(*) FROM lots
UNION ALL
SELECT 'irl_history', COUNT(*) FROM irl_history
UNION ALL
SELECT 'properties_new', COUNT(*) FROM properties_new
UNION ALL
SELECT 'candidate_invitation_links', COUNT(*) FROM candidate_invitation_links
ORDER BY table_name;
```

---

### Étape 2 : Décision Selon Résultats

#### Scénario A : Tables Vides (Obsolètes)

**Si 0 lignes** :
```sql
-- Supprimer la table (exemple : invitations)
DROP TABLE IF EXISTS invitations CASCADE;
```

#### Scénario B : Tables Utilisées (Doublons)

**Exemple : `lots` vs `lots_new`**

Si `lots_new` a des données ET est utilisée par le frontend :
1. Activer RLS sur `lots_new` (script fourni)
2. Migrer données de `lots` vers `lots_new` (si nécessaire)
3. Supprimer `lots`

#### Scénario C : Tables Actives Sans RLS

**Exemple : `documents` avec données**

**URGENT** :
1. Exécuter `20260104_FIX_TABLES_SANS_RLS.sql`
2. Adapter les policies selon structure réelle
3. Tester l'accès

---

### Étape 3 : Exécution du Fix (5 minutes)

1. **Exécuter le diagnostic rapide** (Étape 1)
2. **Analyser les résultats**
3. **Exécuter le script** : `20260104_FIX_TABLES_SANS_RLS.sql`
4. **Adapter les policies** selon structure réelle des tables
5. **Supprimer les tables obsolètes**

---

## 📝 Scripts Créés

| Fichier | Type | Contenu |
|---------|------|---------|
| `20260104_DIAGNOSTIC_COMPLET.sql` | Diagnostic | Audit complet (déjà exécuté) |
| `20260104_FIX_TABLES_SANS_RLS.sql` | Fix | Activer RLS + créer policies |
| `ANALYSE_TABLES_SANS_RLS.md` | Analyse | Ce document |

---

## ⚠️ Risques Identifiés

### Risque 1 : Fuite de Données

**Avant Fix** :
- ❌ Table `documents` sans RLS → Tous les utilisateurs peuvent voir tous les documents
- ❌ Table `lots_new` sans RLS → Tous les utilisateurs peuvent voir tous les lots

**Impact** :
- Violation RGPD (données personnelles)
- Fuite informations immobilières (adresses, loyers)
- Possible accès à documents sensibles (pièces d'identité, RIB)

**Après Fix** :
- ✅ RLS activé sur toutes les tables
- ✅ Policies propriétaires uniquement
- ✅ Isolation multi-tenant

---

### Risque 2 : Incohérence Données

**Problème** :
- Si `lots` ET `lots_new` existent avec données différentes
- Frontend pourrait utiliser mauvaise table

**Solution** :
1. Vérifier quelle table est utilisée par le frontend
2. Migrer les données vers la bonne table
3. Supprimer la table obsolète

---

## 🧪 Tests Post-Fix

### Test 1 : Vérifier RLS Actif

```sql
-- Toutes les tables doivent avoir RLS
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Résultat attendu : rowsecurity = true pour toutes
```

---

### Test 2 : Vérifier Policies

```sql
-- Compter policies par table
SELECT tablename, COUNT(*) AS nb_policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- documents : doit avoir au moins 3-4 policies
-- lots_new : doit avoir 4 policies
```

---

### Test 3 : Test Isolation

1. Créer 2 comptes différents
2. Créer un document avec compte 1
3. Se connecter avec compte 2
4. Vérifier qu'on ne voit **PAS** le document du compte 1

---

## 🎯 Conclusion

**Prochaine Action Immédiate** :

1. ✅ **Exécuter diagnostic rapide** (requête SQL Étape 1)
2. 📋 **Me communiquer les résultats**
3. 🔧 **J'adapte le script de fix** selon résultats
4. ✅ **Vous exécutez le fix final**

**Objectif** : **0 table sans RLS** = **100% sécurisé**

---

**Créé par** : Claude Sonnet 4.5
**Date** : 4 Janvier 2026
**Priorité** : 🔴 CRITIQUE si tables utilisées
