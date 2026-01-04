# Guide Système de Candidatures

> Créé le 2 Janvier 2026
> Statut : ✅ IMPLÉMENTÉ (en attente migration SQL)

## 📋 Vue d'ensemble

Le système de candidatures permet aux bailleurs de recevoir et gérer des candidatures de locataires en ligne via un lien partageable.

## ✅ Ce qui est implémenté

### 1. Base de données

**Fichier** : `supabase/migrations/20260102_create_candidates.sql`

**Tables créées** :
- `candidates` - Stocke les candidatures
- `candidate_documents` - Documents joints aux candidatures
- `candidate_invitation_links` - Liens d'invitation partageables

**Champs importants** :
- Score automatique (0-100)
- Taux d'effort
- Ratio revenus/loyer
- Statut workflow (submitted → under_review → accepted/rejected)

**⚠️ À faire** : Appliquer la migration via l'interface Supabase

### 2. Service Backend

**Fichier** : `frontend/src/services/candidateService.js`

**Fonctions disponibles** :
```javascript
// Gestion des liens d'invitation
getInvitationLink(lotId)
generateNewLink(lotId)
getLotByInvitationToken(token)

// CRUD Candidatures
getAllCandidates(filters)
getCandidatesByLot(lotId)
getCandidateById(id)
createCandidate(data)
updateCandidateStatus(id, status, reason)

// Documents
uploadDocument(candidateId, file, type)
getDocuments(candidateId)
deleteDocument(documentId, filePath)

// Conversion
convertToTenant(candidateId) // Convertit en locataire + bail

// Statistiques
countPendingCandidates(lotId)
```

### 3. Schéma de validation

**Fichier** : `frontend/src/schemas/candidateSchema.js`

Validation Yup pour le formulaire de candidature avec tous les champs requis/optionnels.

### 4. Pages Frontend

#### A. Page Candidates.jsx (`/candidates`)
**Fonctionnalités** :
- Liste de toutes les candidatures
- Filtres par statut (pending, reviewing, accepted, rejected)
- Filtres par lot
- Cartes candidatures avec scoring visuel
- Badges de statut colorés
- Tri par date de création

#### B. Page CandidateDetail.jsx (`/candidates/:id`)
**Fonctionnalités** :
- Vue complète de la candidature
- **Scoring automatique** avec explication des critères :
  - Ratio revenus/loyer (40 points)
  - Stabilité emploi (20 points)
  - Garant (20 points)
  - Documents (20 points)
- Informations personnelles
- Situation professionnelle
- Informations garant
- Liste des documents uploadés
- Actions : Accepter / Refuser / Mettre en attente

#### C. Page PublicCandidateForm.jsx (`/apply/:token`)
**Formulaire public pour les candidats** :
- Accessible via lien unique
- Multi-étapes (informations perso → situation pro → garant → documents)
- Upload documents multiples
- Sauvegarde automatique
- Page confirmation après soumission

#### D. Page CandidateStatus.jsx (`/application-status`)
**Suivi pour le candidat** :
- Le candidat peut suivre l'état de sa candidature
- Accès sécurisé par token

### 5. Composants UI

**Fichier** : `frontend/src/components/candidates/InvitationLinkModal.jsx`

Modal pour générer et partager le lien d'invitation pour un lot.

### 6. Routes configurées

```javascript
// Routes publiques
/apply/:token              → PublicCandidateForm (formulaire public)
/application-status        → CandidateStatus (suivi candidature)

// Routes privées (bailleurs)
/candidates               → Candidates (liste)
/candidates/:id           → CandidateDetail (détail + scoring)
```

### 7. Intégration dans LotDetail.jsx

- Affiche automatiquement les candidatures pour les lots vacants
- Bouton pour générer le lien d'invitation
- Compteur de candidatures en attente

## 🎯 Workflow complet

### Côté Bailleur

1. **Créer un lien d'invitation**
   - Aller sur `/lots/:id` (détail du lot)
   - Cliquer sur "Générer lien d'invitation"
   - Copier et partager le lien

2. **Recevoir des candidatures**
   - Les candidatures arrivent automatiquement
   - Visible dans `/lots/:id` et `/candidates`

3. **Évaluer une candidature**
   - Aller sur `/candidates/:id`
   - Consulter le score automatique
   - Vérifier les documents
   - Accepter / Refuser / Mettre en attente

4. **Convertir en locataire** (si accepté)
   - Utiliser la fonction `convertToTenant()`
   - Crée automatiquement :
     - Un locataire dans `tenants`
     - Un bail en brouillon dans `leases`

### Côté Candidat

1. **Recevoir le lien d'invitation**
   - Le bailleur partage `/apply/:token`

2. **Remplir la candidature**
   - Formulaire multi-étapes guidé
   - Upload de documents
   - Soumission

3. **Suivre sa candidature**
   - Accès via `/application-status`
   - Voir le statut en temps réel

## 📊 Calcul du Score (0-100)

Le score est calculé automatiquement selon 4 critères :

### 1. Ratio Revenus/Loyer (40 points max)
- Ratio ≥ 4 → 40 points
- Ratio ≥ 3.5 → 35 points
- Ratio ≥ 3 → 30 points
- Ratio ≥ 2.5 → 20 points
- Ratio ≥ 2 → 10 points

### 2. Stabilité Emploi (20 points max)
- CDI ou Fonctionnaire → 20 points
- CDD → 10 points
- Indépendant/Freelance → 5 points

### 3. Garant (20 points max)
- Revenus garant ≥ 3× loyer → 20 points
- Revenus garant ≥ 2× loyer → 15 points
- Garant présent → 10 points

### 4. Documents (20 points max)
- 4 points par document requis uploadé
- Documents requis : ID, revenus, RIB, contrat travail, avis imposition

**Exemple** :
- Revenus 3.2× loyer → 30 points
- CDI → 20 points
- Garant avec revenus 3× loyer → 20 points
- 5 documents uploadés → 20 points
- **Score total : 90/100** ✅

## 🔒 Sécurité

- Tokens d'invitation uniques (UUID v4)
- Les candidats ne voient QUE leur candidature
- Les bailleurs voient TOUTES les candidatures de leurs entités
- RLS (Row Level Security) à activer dans Supabase

## 📁 Structure des fichiers

```
gestion-locative/
├── supabase/
│   └── migrations/
│       └── 20260102_create_candidates.sql        ✅
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── candidateService.js              ✅
│   │   ├── schemas/
│   │   │   ├── candidateSchema.js                ✅
│   │   │   └── guaranteeSchema.js                ✅
│   │   ├── pages/
│   │   │   ├── Candidates.jsx                    ✅
│   │   │   ├── CandidateDetail.jsx               ✅
│   │   │   ├── PublicCandidateForm.jsx           ✅
│   │   │   ├── CandidateStatus.jsx               ✅
│   │   │   └── LotDetail.jsx (intégré)          ✅
│   │   └── components/
│   │       └── candidates/
│   │           └── InvitationLinkModal.jsx       ✅
│   └── App.jsx (routes configurées)               ✅
```

## ⚙️ Configuration requise

### 1. Supabase Storage

Créer un bucket `candidate-documents` :
```sql
-- Via interface Supabase ou SQL
INSERT INTO storage.buckets (id, name, public)
VALUES ('candidate-documents', 'candidate-documents', true);
```

### 2. Variables d'environnement

Déjà configurées dans `.env` :
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## 🚀 Prochaines étapes

1. ✅ **Appliquer la migration SQL**
   - Aller sur Supabase Dashboard
   - SQL Editor
   - Copier/coller le contenu de `20260102_create_candidates.sql`
   - Exécuter

2. ✅ **Créer le bucket Storage**
   - Storage → New bucket → `candidate-documents`
   - Public access : ON

3. ✅ **Tester le workflow complet**
   - Créer un lien d'invitation
   - Remplir une candidature
   - Consulter la liste
   - Accepter/Refuser

4. 📝 **Documenter pour l'utilisateur final**
   - Guide bailleur
   - Guide candidat

## 💡 Améliorations futures

- [ ] Envoi email automatique au candidat
- [ ] Notifications en temps réel
- [ ] Export PDF candidature
- [ ] Comparaison multi-candidats
- [ ] Templates de réponse (acceptation/refus)
- [ ] Intégration calendrier pour visites
- [ ] Score basé sur IA/ML

## 🐛 Dépannage

### Les documents ne s'affichent pas
- Vérifier que le bucket `candidate-documents` existe
- Vérifier les permissions publiques du bucket
- Vérifier la colonne `file_url` dans `candidate_documents`

### Le score est à 0
- Vérifier que les revenus sont renseignés
- Vérifier le loyer du lot
- Le score se recalcule après upload de documents

### Erreur "Lien expiré"
- Générer un nouveau lien depuis `/lots/:id`
- Les liens peuvent être désactivés manuellement

## 📞 Support

Pour toute question, consulter :
- Le fichier `CLAUDE.md` (roadmap globale)
- Les commentaires dans le code
- Les logs de développement (mode DEBUG activé)

---

**Dernière mise à jour** : 2 Janvier 2026
**Version** : MVP Candidatures 1.0
**Statut** : ✅ Prêt pour tests
