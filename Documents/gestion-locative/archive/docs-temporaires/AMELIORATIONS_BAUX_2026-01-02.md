# Améliorations des Baux et Aides au Logement
**Date** : 2 Janvier 2026
**Phase** : 2.6 - Aides au logement et amélioration des baux

---

## ✅ Fonctionnalités implémentées

### 1. Gestion des aides au logement (CAF/APL)

#### Base de données
- **Nouveau champ** : `housing_assistance` dans `tenant_groups`
  - Type : `DECIMAL(10,2)`
  - Montant mensuel des aides CAF/APL en euros
  - Migration : [FIX_add_housing_assistance.sql](supabase/migrations/FIX_add_housing_assistance.sql)

- **Champs supplémentaires CAF** :
  - `caf_file_number` : Numéro de dossier CAF (VARCHAR 50)
  - `last_caf_attestation_date` : Date dernière attestation (DATE)
  - Migration : [FIX_add_caf_fields.sql](supabase/migrations/FIX_add_caf_fields.sql)

#### Formulaire TenantForm
- ~~Input pour saisir le montant des aides au logement~~ **RETIRÉ** (utiliser "Revenus complémentaires" à la place)
- Le champ `housing_assistance` existe dans la BDD mais doit être rempli via d'autres moyens
- Les revenus complémentaires peuvent inclure les aides CAF/APL

### 2. Calculs financiers corrigés

#### Formule du taux d'effort
```javascript
taux_effort = (loyer_total - housing_assistance) / revenus_groupe * 100
```

**Ancienne formule (incorrecte)** :
```javascript
taux_effort = loyer_total / revenus_groupe * 100
```

#### Pages corrigées
1. **[TenantDetail.jsx](frontend/src/pages/TenantDetail.jsx:186-192)** - Calcul du loyer net
2. **[LeaseDetail.jsx](frontend/src/pages/LeaseDetail.jsx:137-140)** - Affichage avec aides
3. **[Tenants.jsx](frontend/src/pages/Tenants.jsx:186-192)** - Taux d'effort corrigé
4. **[FinancialSummary.jsx](frontend/src/components/tenants/FinancialSummary.jsx:37-44)** - Calcul ratio

#### Affichage visuel
- Loyer + Charges (gris)
- **- Aides CAF/APL** (vert)
- **= Loyer net** (vert, mis en avant)

### 3. LeaseForm amélioré

#### A. Pré-remplissage automatique CAF
**Comportement** :
- Dès qu'un locataire est sélectionné dans le formulaire de bail
- Le système récupère automatiquement `housing_assistance` depuis `tenant_groups`
- Les champs CAF se remplissent :
  - ✅ `caf_direct_payment` = `true` (si aides > 0)
  - ✅ `caf_amount` = montant des aides

**Code** : [LeaseForm.jsx:86-126](frontend/src/pages/LeaseForm.jsx#L86-L126)

#### B. Validation taux d'effort en temps réel
**Calcul automatique** pendant la saisie des champs :
- Loyer
- Charges
- Montant CAF

**Alertes contextuelles** avec 4 niveaux :

| Taux d'effort | Couleur | Icône | Message |
|---------------|---------|-------|---------|
| ≤ 33% | 🟢 Vert | ✅ | Aucune alerte (excellent) |
| 33-40% | 🔵 Bleu | ℹ️ | Légèrement élevé (max 33%) |
| 40-50% | 🟠 Orange | ⚠️ | Risque élevé, garantie recommandée |
| > 50% | 🔴 Rouge | ⚠️ | Risque très élevé, garantie solide nécessaire |

**Informations affichées** :
- Taux d'effort calculé (ex: 28.5%)
- Revenus mensuels du groupe
- Loyer net après aides

**Code** : [LeaseForm.jsx:128-154](frontend/src/pages/LeaseForm.jsx#L128-L154) et [LeaseForm.jsx:623-659](frontend/src/pages/LeaseForm.jsx#L623-L659)

### 4. Pages détail créées

#### TenantDetail.jsx (450 lignes)
**Route** : `/tenants/:id`

**Fonctionnalités** :
- Informations du groupe (type, statut couple)
- Revenus mensuels totaux
- **Bail actif** avec :
  - Loyer + Charges
  - Aides CAF/APL (en vert)
  - **Loyer net** (mis en avant)
  - **Taux d'effort avant/après aides**
- Liste des membres du groupe :
  - Infos personnelles
  - Situation professionnelle
  - Revenus par membre
- Icônes selon type : 👤 Individuel / 👫 Couple / 👥 Colocation

**Code** : [TenantDetail.jsx](frontend/src/pages/TenantDetail.jsx)

#### LeaseDetail.jsx (450 lignes)
**Route** : `/leases/:id`

**Fonctionnalités** :
- Breadcrumb : Entité > Propriété > Lot > Bail
- Informations du bail (dates, statut)
- **Montants mensuels** :
  - Loyer : XXX €
  - Charges : XXX €
  - Total loyer : XXX €
  - Aides CAF/APL : - XXX € (vert)
  - **Loyer net à payer** : XXX € (vert, mis en avant)
- Dépôt de garantie
- Notes
- Card Lot loué
- Card Locataire/Groupe
- Lien vers paiements

**Code** : [LeaseDetail.jsx](frontend/src/pages/LeaseDetail.jsx)

### 5. Corrections critiques

#### LotDetail.jsx - Bug property_id
**Problème** : Utilisait `property_id` (colonne supprimée)
**Solution** : Remplacement par `lot_id`
**Impact** : CRITIQUE - La page affichait 0 baux
**Lignes** : [66](frontend/src/pages/LotDetail.jsx#L66), [82](frontend/src/pages/LotDetail.jsx#L82)

#### LeaseForm.jsx - Filtre landlord_id obsolète
**Problème** : Filtrage locataires par `landlord_id` (obsolète)
**Solution** : Filtrage via `entity_id` des `tenant_groups`
**Impact** : CRITIQUE - Liste locataires vide
**Lignes** : [107-129](frontend/src/pages/LeaseForm.jsx#L107-L129)

#### Dashboard.jsx - Count incorrect
**Problème** : Comptait les `tenants` individuels
**Solution** : Compte les `tenant_groups`
**Impact** : Statistique "Locataires" incorrecte
**Lignes** : [84-98](frontend/src/pages/Dashboard.jsx#L84-L98)

### 6. Intégrations

#### Affichage groupes avec icônes
- **[Leases.jsx:207-218](frontend/src/pages/Leases.jsx#L207-L218)** - Liste baux
- **[Payments.jsx:352-364](frontend/src/pages/Payments.jsx#L352-L364)** - Liste paiements
- **[LotDetail.jsx:478-525](frontend/src/pages/LotDetail.jsx#L478-L525)** - Bail actif

Format :
```
Nom du groupe
👤/👫/👥 Type de groupe
```

#### Service tenantGroupService
**Fichier** : [tenantGroupService.js:161](frontend/src/services/tenantGroupService.js#L161)

**Amélioration** : Ajout de `housing_assistance` dans la query `getAllTenantGroups`

Avant :
```javascript
.select(`
  *,
  tenants (...)
`)
```

Après :
```javascript
.select(`
  *,
  housing_assistance,  // ✅ AJOUTÉ
  tenants (...)
`)
```

#### FinancialSummary.jsx
**Fichier** : [FinancialSummary.jsx](frontend/src/components/tenants/FinancialSummary.jsx)

**Améliorations** :
1. Nouvelle prop `housingAssistance`
2. Calcul taux d'effort sur loyer net
3. Ratio revenus/loyer sur loyer net
4. Affichage visuel des aides (vert)

---

## 📊 Impact

### Conformité CAF
✅ Suivi complet des aides au logement
✅ Numéro de dossier CAF enregistrable
✅ Date dernière attestation trackée

### Prévention des impayés
✅ Validation temps réel du taux d'effort
✅ Alertes adaptées selon le niveau de risque
✅ Recommandations automatiques (garantie nécessaire)

### Gain de temps
✅ Pré-remplissage automatique des données CAF
✅ Pas de double saisie (groupe → bail)
✅ Cohérence garantie entre groupe et bail

### Précision financière
✅ Tous les calculs utilisent le loyer net (après aides)
✅ Taux d'effort reflète la réalité du reste à charge
✅ Ratio revenus/loyer basé sur le loyer effectif

### UX améliorée
✅ Alertes contextuelles pendant la création de bail
✅ Affichage clair et visuel des aides (couleur verte)
✅ Pages détail complètes (TenantDetail, LeaseDetail)

---

## 🔧 Utilisation

### 1. Créer un groupe de locataires
1. Aller dans **Locataires** > **Nouveau groupe**
2. Remplir les informations (type, membres, revenus)
3. **Nouveau** : Saisir le montant des aides CAF/APL
4. Sauvegarder

### 2. Créer un bail
1. Aller dans **Baux** > **Nouveau bail**
2. Sélectionner un lot
3. Sélectionner un locataire
4. **Automatique** : Les champs CAF se pré-remplissent
5. Saisir loyer et charges
6. **Automatique** : Alerte taux d'effort si nécessaire
7. Vérifier la solvabilité avant de valider

### 3. Voir le détail d'un locataire
1. Aller dans **Locataires**
2. Cliquer sur **Voir** pour un groupe
3. **Nouveau** : Section "Bail actif" affiche :
   - Loyer total
   - Aides CAF/APL déduites (vert)
   - Loyer net (vert, mis en avant)
   - Taux d'effort avant et après aides

### 4. Voir le détail d'un bail
1. Depuis la liste des baux, cliquer sur **Voir détail**
2. OU depuis un lot, cliquer sur **Voir le bail**
3. **Nouveau** : Affichage complet avec breadcrumb, montants avec aides

---

## 📁 Fichiers modifiés

### Créations (2)
- ✨ `frontend/src/pages/TenantDetail.jsx` (450 lignes)
- ✨ `frontend/src/pages/LeaseDetail.jsx` (450 lignes)

### Modifications majeures (3)
- ⚡ `frontend/src/pages/LeaseForm.jsx` - Pré-remplissage CAF + validation taux effort
- ⚡ `frontend/src/pages/TenantForm.jsx` - Input housing_assistance
- ⚡ `frontend/src/components/tenants/FinancialSummary.jsx` - Support aides

### Corrections bugs (3)
- 🐛 `frontend/src/pages/LotDetail.jsx` - Fix property_id → lot_id (CRITIQUE)
- 🐛 `frontend/src/pages/Dashboard.jsx` - Count tenant_groups
- 🐛 `frontend/src/pages/Tenants.jsx` - Calcul taux effort corrigé

### Intégrations (3)
- 🔗 `frontend/src/pages/Leases.jsx` - Display groups
- 🔗 `frontend/src/pages/Payments.jsx` - Display groups
- 🔗 `frontend/src/services/tenantGroupService.js` - Fetch housing_assistance

### Nettoyage (2)
- 🧹 `frontend/src/services/tenantService.js` - 230 → 111 lignes
- 🧹 `frontend/src/constants/tenantConstants.js` - Fix concubinage

### Migrations SQL (2)
- ✨ `supabase/migrations/FIX_add_housing_assistance.sql`
- ✨ `supabase/migrations/FIX_add_caf_fields.sql`

---

## 🚀 Prochaines améliorations possibles

### Court terme (recommandées)
1. **Attestation de loyer CAF** - Génération PDF automatique
2. **Dashboard aides** - Vue centralisée des aides reçues
3. **Alertes impayés** - Détection si aide non reçue 2 mois

### Moyen terme
4. **Export comptable** - Distinction loyer/aides pour déclaration
5. **Historique aides** - Évolution montant CAF dans le temps
6. **Notifications CAF** - Rappel renouvellement attestation

---

## 📞 Support

En cas de problème avec les nouvelles fonctionnalités :
1. Vérifier que les migrations SQL sont appliquées
2. Recharger le schéma Supabase : `NOTIFY pgrst, 'reload schema';`
3. Vider le cache navigateur (Ctrl+F5)
4. Consulter [CLAUDE.md](CLAUDE.md) pour l'architecture complète
