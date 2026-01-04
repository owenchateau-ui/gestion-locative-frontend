# 🎯 MÉTHODOLOGIE - Modifications Systémiques

> **Règle d'Or** : JAMAIS de modification partielle. Toujours analyser l'impact global.

---

## 📊 CHECKLIST OBLIGATOIRE AVANT TOUTE MODIFICATION

### 1️⃣ ANALYSE D'IMPACT (OBLIGATOIRE)

Avant TOUTE modification, répondre à ces questions :

#### A. Cartographie des Dépendances
```
┌─────────────────────────────────────────────────────────────┐
│ MODIFICATION PROPOSÉE : [Description]                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────┐
        │ Quelles tables sont impactées ?         │
        └─────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────┐
        │ Quels RLS policies sont affectés ?      │
        └─────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────┐
        │ Quels services frontend utilisent ça ?  │
        └─────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────┐
        │ Quels formulaires sont concernés ?      │
        └─────────────────────────────────────────┘
```

#### B. Questions Critiques
- [ ] **Schéma DB** : La modification change-t-elle une colonne NOT NULL → nullable ou l'inverse ?
- [ ] **Foreign Keys** : Y a-t-il des relations à mettre à jour ?
- [ ] **RLS Policies** : Les policies existantes doivent-elles être modifiées ?
- [ ] **Frontend Services** : Les services (tenantService, leaseService...) doivent-ils être adaptés ?
- [ ] **Formulaires** : Les formulaires créent-ils toutes les données requises ?
- [ ] **Données Existantes** : Faut-il migrer les données existantes ?

---

## 2️⃣ PLAN D'EXÉCUTION COMPLET

### Template de Plan

```markdown
## MODIFICATION : [Titre]

### 🎯 Objectif
[Description claire de ce qu'on veut accomplir]

### 📊 Impact Analysis
| Composant | Impact | Action Requise |
|-----------|--------|----------------|
| **Base de Données** | | |
| - Table `xxx` | ⚠️ Colonne modifiée | Migration + Trigger |
| - Table `yyy` | ✅ Aucun | - |
| **RLS Policies** | | |
| - Policy `xxx` | ⚠️ À modifier | Ajouter condition |
| **Frontend** | | |
| - Service `xxxService.js` | ⚠️ À adapter | Ajouter champ |
| - Formulaire `XxxForm.jsx` | ⚠️ À adapter | Ajouter input |
| - Page `Xxx.jsx` | ✅ Aucun | - |
| **Données Existantes** | | |
| - Locataires | ⚠️ Migration | Script UPDATE |

### 📝 Scripts à Créer
1. [ ] `YYYYMMDD_modify_xxx.sql` - Modification schéma
2. [ ] `YYYYMMDD_migrate_xxx_data.sql` - Migration données
3. [ ] `YYYYMMDD_update_xxx_policies.sql` - RLS policies

### 🔧 Fichiers Frontend à Modifier
1. [ ] `src/services/xxxService.js` - Ligne XX
2. [ ] `src/pages/XxxForm.jsx` - Ligne YY
3. [ ] `src/pages/Xxx.jsx` - Ligne ZZ

### ✅ Tests de Validation
1. [ ] Créer un nouveau XXX via formulaire
2. [ ] Modifier un XXX existant
3. [ ] Supprimer un XXX
4. [ ] Vérifier RLS (créer 2ème utilisateur)
5. [ ] Vérifier données existantes toujours visibles
```

---

## 3️⃣ ORDRE D'EXÉCUTION STRICT

### Règle : Backend → Frontend → Tests

```
1. Base de Données
   ├─ Modifier schéma (ALTER TABLE)
   ├─ Créer triggers si nécessaire
   ├─ Migrer données existantes
   └─ Vérifier via SQL direct

2. RLS Policies
   ├─ Modifier policies existantes
   ├─ Créer nouvelles policies
   └─ Tester avec 2 utilisateurs

3. Frontend Services
   ├─ Adapter services (xxxService.js)
   ├─ Mettre à jour schemas Zod
   └─ Tester appels API

4. Frontend Formulaires
   ├─ Ajouter champs manquants
   ├─ Adapter validation
   └─ Tester création/modification

5. Frontend Pages
   ├─ Adapter affichage
   └─ Tester navigation

6. Tests Complets
   ├─ Scénario utilisateur complet
   ├─ Test isolation multi-tenant
   └─ Test données existantes
```

---

## 4️⃣ CHECKLIST POST-MODIFICATION

### Validation Obligatoire

- [ ] **DB Schema** : `SELECT` sur toutes les tables modifiées → données visibles
- [ ] **RLS Policies** : `SELECT pg_policies WHERE tablename = 'xxx'` → policies présentes
- [ ] **Frontend** : Formulaire création → succès sans erreur
- [ ] **Frontend** : Formulaire modification → succès
- [ ] **Frontend** : Liste données → toutes visibles
- [ ] **Multi-tenant** : Créer 2ème user → isolation OK
- [ ] **Console** : Aucune erreur dans DevTools

---

## 5️⃣ ANTI-PATTERNS À ÉVITER

### ❌ Ce qu'il NE FAUT JAMAIS FAIRE

1. **Modifier seulement le schéma DB sans adapter le frontend**
   - ❌ Créer une colonne NOT NULL sans valeur par défaut/trigger
   - ❌ Renommer une colonne sans adapter les services
   - ❌ Ajouter une FK sans migrer les données existantes

2. **Modifier seulement les RLS policies sans vérifier les données**
   - ❌ Ajouter une policy avec condition sur colonne NULL
   - ❌ Changer la logique d'ownership sans migration

3. **Modifier seulement le frontend sans adapter le backend**
   - ❌ Ajouter un champ formulaire sans colonne DB
   - ❌ Envoyer des données non autorisées par RLS

4. **Tester partiellement**
   - ❌ Tester seulement la création, pas la modification
   - ❌ Tester seulement avec 1 utilisateur
   - ❌ Ne pas vérifier les données existantes

---

## 6️⃣ EXEMPLE CONCRET : Ajout de user_id à tenants

### ❌ Mauvaise Approche (ce qui a été fait)
1. Modifier RLS policies pour utiliser `user_id`
2. ❌ Oublier que `user_id` est NOT NULL
3. ❌ Oublier d'adapter le formulaire
4. ❌ Oublier de migrer les données existantes
→ **RÉSULTAT** : Formulaire cassé, données invisibles

### ✅ Bonne Approche (ce qu'il fallait faire)

**ÉTAPE 1 : Analyse d'Impact**
```
Table `tenants` :
- Colonne `user_id` UUID NOT NULL
- Utilisée par RLS policy "Users can view tenants of owned entities"
- Formulaire TenantForm.jsx ne l'envoie pas
- Données existantes : 3 locataires avec user_id NULL ou incorrect
```

**ÉTAPE 2 : Plan Complet**
```sql
-- Script 1 : Migration données + schéma
1. UPDATE tenants SET user_id = (SELECT id FROM users WHERE email = 'owen.chateau@gmail.com')
2. ALTER TABLE tenants ALTER COLUMN user_id DROP NOT NULL
3. CREATE TRIGGER set_tenant_user_id_trigger
4. Tester : SELECT * FROM tenants → tous visibles

-- Script 2 : RLS policies
1. Vérifier policy "Users can view tenants of owned entities"
2. S'assurer que user_owns_entity() utilise entity_id (pas user_id direct)
3. Tester avec 2 utilisateurs → isolation OK
```

**ÉTAPE 3 : Frontend**
```js
// TenantForm.jsx - Aucune modification nécessaire
// Le trigger remplira user_id automatiquement

// tenantService.js - Vérifier que user_id n'est PAS envoyé
// (sera géré par trigger)
```

**ÉTAPE 4 : Tests**
- [ ] Créer nouveau locataire → user_id rempli auto
- [ ] Modifier locataire existant → user_id préservé
- [ ] Vérifier isolation multi-tenant
- [ ] Vérifier données existantes visibles

---

## 7️⃣ UTILISATION FUTURE

### Avant TOUTE modification, créer un fichier :

`ANALYSE_IMPACT_[FEATURE].md` avec :

```markdown
# Analyse d'Impact : [Feature]

## 🎯 Objectif
[...]

## 📊 Tables Impactées
| Table | Colonnes | Contraintes | Migration Nécessaire |
|-------|----------|-------------|---------------------|
| xxx   | yyy      | NOT NULL    | ✅ Oui              |

## 🔐 RLS Policies Impactées
| Policy | Table | Modification |
|--------|-------|--------------|
| xxx    | yyy   | Ajouter condition |

## 🎨 Frontend Impacté
| Fichier | Type | Modification |
|---------|------|--------------|
| xxx.js  | Service | Ajouter champ |

## 📝 Scripts SQL
1. [x] `xxx.sql` - Description
2. [ ] `yyy.sql` - Description

## ✅ Checklist Validation
- [ ] ...
```

---

## 8️⃣ RÈGLES D'OR

### 🔥 TOUJOURS

1. **Analyser AVANT d'agir**
   - Cartographier toutes les dépendances
   - Identifier tous les impacts

2. **Planifier COMPLÈTEMENT**
   - Scripts DB (schéma + migration + policies)
   - Modifications frontend (services + formulaires + pages)
   - Tests complets

3. **Exécuter dans l'ORDRE**
   - DB → RLS → Services → Formulaires → Pages → Tests

4. **Valider SYSTÉMATIQUEMENT**
   - Chaque étape testée avant la suivante
   - Test complet utilisateur final
   - Test isolation multi-tenant

### 🔥 JAMAIS

1. ❌ Modifier une table sans migrer les données existantes
2. ❌ Ajouter/modifier une policy sans vérifier les données
3. ❌ Toucher au frontend sans adapter le backend
4. ❌ Considérer une modification "terminée" sans tests complets

---

## 9️⃣ TEMPLATE RAPIDE

Pour toute modification, copier/coller ce template :

```markdown
## MODIFICATION : [Titre]

### Analyse d'Impact
- [ ] Tables DB impactées : [liste]
- [ ] RLS policies impactées : [liste]
- [ ] Services frontend impactés : [liste]
- [ ] Formulaires impactés : [liste]
- [ ] Données existantes à migrer : [oui/non]

### Scripts SQL à Créer
1. [ ] `YYYYMMDD_modify_schema.sql`
2. [ ] `YYYYMMDD_migrate_data.sql`
3. [ ] `YYYYMMDD_update_policies.sql`

### Fichiers Frontend à Modifier
1. [ ] `src/services/xxx.js`
2. [ ] `src/pages/XxxForm.jsx`
3. [ ] `src/schemas/xxxSchema.js`

### Ordre d'Exécution
1. [ ] Exécuter script 1
2. [ ] Exécuter script 2
3. [ ] Exécuter script 3
4. [ ] Modifier service
5. [ ] Modifier formulaire
6. [ ] Tester création
7. [ ] Tester modification
8. [ ] Tester isolation
9. [ ] Vérifier données existantes

### Validation Finale
- [ ] Aucune erreur console
- [ ] Toutes données visibles
- [ ] Formulaires fonctionnels
- [ ] Isolation multi-tenant OK
```

---

**Date de Création** : 4 Janvier 2026
**Créé par** : Claude Sonnet 4.5
**Objectif** : Éviter les modifications partielles qui créent des bugs en cascade

**🔥 RÈGLE ABSOLUE : Ce fichier DOIT être consulté AVANT toute modification dans ce projet.**
