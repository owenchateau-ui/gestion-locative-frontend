# Option A - Support Couples & Colocations - État d'avancement

> Date : 2 Janvier 2026
> Statut global : **70% TERMINÉ** 🚧

---

## ✅ CE QUI EST TERMINÉ (70%)

### 1. Migration SQL V2 ✅
**Fichier** : `supabase/migrations/20260102_create_candidates_v2.sql`

**Ajouts** :
- ✅ Champ `application_type` : 'individual' | 'couple' | 'colocation'
- ✅ Champ `nb_applicants` : 1-4
- ✅ Candidat 2 : Champs complets (nom, prénom, email, téléphone, revenus, emploi...)
- ✅ Candidat 3 : Champs simplifiés (nom, prénom, email, revenus)
- ✅ Candidat 4 : Champs simplifiés
- ✅ Garant 2 : Champs complets
- ✅ **Colonne générée** `total_monthly_income` : Calcule automatiquement la somme des revenus
- ✅ Index sur `application_type`
- ✅ Champ `applicant_number` dans `candidate_documents`

**Action requise** :
```bash
# Exécuter dans Supabase SQL Editor
# Copier/coller le contenu de 20260102_create_candidates_v2.sql
```

---

### 2. Schéma de validation Zod ✅
**Fichier** : `frontend/src/schemas/candidateSchema.js`

**Modifications effectuées** :
- ✅ Ajout validation `application_type`
- ✅ Ajout validation `nb_applicants`
- ✅ Validation conditionnelle candidat 2 (si couple ou colocation)
- ✅ Validation conditionnelle candidat 3 (si colocation 3+)
- ✅ Validation conditionnelle candidat 4 (si colocation 4)
- ✅ Validation conditionnelle garant 2
- ✅ Ajout `applicant_number` dans `documentSchema`

**Résultat** : Le schéma valide correctement tous les types de candidatures

---

### 3. Service Backend ✅
**Fichier** : `frontend/src/services/candidateService.js`

**Modifications effectuées** :

#### Fonction `cleanData()` ✅
```javascript
// Gère maintenant :
- application_type (default: 'individual')
- nb_applicants (default: 1)
- Tous les champs applicant2_*, applicant3_*, applicant4_*
- Tous les champs guarantor2_*
- Conversion revenus en nombres
- Valeurs par défaut intelligentes (0 pour revenus, null pour garants)
```

#### Fonction `uploadDocument()` ✅
```javascript
// Nouveau paramètre :
uploadDocument(candidateId, file, documentType, applicantNumber = 1)

// Nommage fichier :
{candidateId}/{documentType}-applicant{N}-{timestamp}.{ext}

// Enregistrement :
{ candidate_id, document_type, applicant_number, file_path, file_url, ... }
```

**Résultat** : Le service backend est prêt pour gérer couples et colocations

---

### 4. Documentation complète ✅

#### AMELIORATIONS_CANDIDATURES.md
- ✅ Analyse du problème
- ✅ Comparaison Option A vs Option B
- ✅ Recommandation détaillée
- ✅ Nouveau système de scoring adapté
- ✅ Exemples de calcul

#### IMPLEMENTATION_COUPLES_COLOCATIONS.md
- ✅ Guide complet étape par étape
- ✅ Code exemple pour chaque modification
- ✅ Explications détaillées
- ✅ Checklist de validation

---

## 🚧 CE QUI RESTE À FAIRE (30%)

### 5. Formulaire Public 🔜
**Fichier** : `frontend/src/pages/PublicCandidateForm.jsx` (1174 lignes)

**Modifications requises** :

#### Étape 0 : Choix du type (NOUVEAU) 📝
- [ ] Créer la nouvelle étape 0
- [ ] 3 cards cliquables : Individuel / Couple / Colocation
- [ ] Sélecteur nombre de colocataires (2-4)
- [ ] Modifier `step` initial de 1 → 0

#### Étape 1 : Informations personnelles 📝
- [ ] Ajouter section Candidat 2 (conditionnel si couple/colocation)
- [ ] Ajouter section Candidat 3 (conditionnel si colocation 3+)
- [ ] Ajouter section Candidat 4 (conditionnel si colocation 4)
- [ ] Design avec border-left coloré par candidat

#### Étape 2 : Situation professionnelle 📝
- [ ] Ajouter revenus Candidat 2
- [ ] Ajouter revenus Candidat 3 (champs simplifiés)
- [ ] Ajouter revenus Candidat 4 (champs simplifiés)
- [ ] **Card "Revenus cumulés"** en bas de page (fond vert)

#### Étape 3 : Garant 📝
- [ ] Ajouter section Garant 2 (optionnel)
- [ ] Checkbox "Ajouter un second garant"

#### Étape 4 : Documents 📝
- [ ] Section documents par candidat
- [ ] Upload avec `applicantNumber` = 1, 2, 3, 4
- [ ] Modifier `handleFileUpload(file, type, applicantNumber)`

**Difficulté** : ⭐⭐⭐ Élevée (fichier très long)

**Temps estimé** : 1-2 heures

**Guide disponible** : [IMPLEMENTATION_COUPLES_COLOCATIONS.md](IMPLEMENTATION_COUPLES_COLOCATIONS.md) - Étape 4

---

### 6. Page Détail Candidature 🔜
**Fichier** : `frontend/src/pages/CandidateDetail.jsx`

**Modifications requises** :

#### Affichage Type de candidature 📝
- [ ] Badge en haut : "📄 Individuel" / "💑 Couple" / "👥 Colocation (3)"

#### Affichage Multi-candidats 📝
- [ ] Section Candidat 1 avec border-left bleu
- [ ] Section Candidat 2 avec border-left rose (si présent)
- [ ] Section Candidat 3 avec border-left violet (si présent)
- [ ] Section Candidat 4 avec border-left indigo (si présent)
- [ ] Card "Revenus cumulés" (fond vert) si multi-candidats

#### Modification Scoring 📝
- [ ] Utiliser `candidate.total_monthly_income` au lieu de `monthly_income`
- [ ] Texte adapté : "Revenus cumulés" vs "Revenus mensuels"
- [ ] Ratio calculé sur total_monthly_income

**Difficulté** : ⭐⭐ Moyenne

**Temps estimé** : 30-45 minutes

**Guide disponible** : [IMPLEMENTATION_COUPLES_COLOCATIONS.md](IMPLEMENTATION_COUPLES_COLOCATIONS.md) - Étape 5

---

### 7. Page Liste Candidatures 🔜
**Fichier** : `frontend/src/pages/Candidates.jsx`

**Modifications requises** :

#### Affichage dans les cartes 📝
- [ ] Icône : 💑 pour couple, 👥 x3 pour colocation
- [ ] Nom : "Jean Dupont + 1 autre" ou "+ 2 autres"
- [ ] Revenus : "Revenus cumulés : 3800 €" au lieu de "Revenus : 2000 €"

**Difficulté** : ⭐ Faible

**Temps estimé** : 15 minutes

**Guide disponible** : [IMPLEMENTATION_COUPLES_COLOCATIONS.md](IMPLEMENTATION_COUPLES_COLOCATIONS.md) - Étape 6

---

## 📊 RÉCAPITULATIF

| Composant | Statut | Difficulté | Temps |
|-----------|--------|------------|-------|
| Migration SQL V2 | ✅ Terminé | - | - |
| Schéma Zod | ✅ Terminé | - | - |
| Service Backend | ✅ Terminé | - | - |
| Documentation | ✅ Terminé | - | - |
| **Formulaire Public** | 🔜 À faire | ⭐⭐⭐ | 1-2h |
| **Page Détail** | 🔜 À faire | ⭐⭐ | 30-45min |
| **Page Liste** | 🔜 À faire | ⭐ | 15min |

**Total temps restant** : **2-3 heures**

---

## 🎯 PROCHAINES ACTIONS

### Option 1 : Finir l'implémentation maintenant
1. Modifier `PublicCandidateForm.jsx` (étapes 0-4)
2. Modifier `CandidateDetail.jsx`
3. Modifier `Candidates.jsx`
4. Tester workflow complet

### Option 2 : Tester d'abord la V1 simple
1. Exécuter migration V1 (sans couples/colocations)
2. Tester le système de base
3. Revenir finir l'Option A plus tard

### Option 3 : Déléguer
Le guide [IMPLEMENTATION_COUPLES_COLOCATIONS.md](IMPLEMENTATION_COUPLES_COLOCATIONS.md) contient tout le code nécessaire pour terminer l'implémentation.

---

## ✅ AVANTAGES DÉJÀ OBTENUS

Même si le frontend n'est pas encore adapté, vous avez déjà :

1. **Migration SQL prête** : Tables qui supportent couples/colocations
2. **Validation prête** : Schéma Zod complet
3. **Backend prêt** : Service qui gère tout
4. **Documentation complète** : Guides détaillés

**→ Les fondations sont solides ! Il ne reste "que" l'adaptation du frontend**

---

## 📖 RESSOURCES

- [AMELIORATIONS_CANDIDATURES.md](AMELIORATIONS_CANDIDATURES.md) - Analyse et recommandations
- [IMPLEMENTATION_COUPLES_COLOCATIONS.md](IMPLEMENTATION_COUPLES_COLOCATIONS.md) - Guide d'implémentation détaillé
- [20260102_create_candidates_v2.sql](supabase/migrations/20260102_create_candidates_v2.sql) - Migration SQL

---

**Date de mise à jour** : 2 Janvier 2026
**Contributeur** : Claude Sonnet 4.5 via Claude Code
