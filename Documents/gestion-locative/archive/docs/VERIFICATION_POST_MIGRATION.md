# ✅ Vérification Post-Migration RLS V2

> **Date** : 4 Janvier 2026
> **Objectif** : Vérifier que l'application fonctionne correctement après la migration RLS V2

---

## 🎯 Checklist de Vérification

### 1. Dashboard et Navigation ✅

- [ ] **Connexion** : Vous pouvez vous connecter avec owen.chateau@gmail.com
- [ ] **Dashboard** : Le dashboard s'affiche avec les statistiques
- [ ] **Sidebar** : La navigation fonctionne (clic sur chaque menu)
- [ ] **Déconnexion** : Vous pouvez vous déconnecter

**Test** : Ouvrez http://localhost:5173 et naviguez dans l'application.

---

### 2. Entités et Propriétés ✅

- [ ] **Liste entités** : Vous voyez vos 2 entités
- [ ] **Liste propriétés** : Vous voyez votre propriété
- [ ] **Liste lots** : Vous voyez vos 2 lots
- [ ] **Création entité** : Vous pouvez créer une nouvelle entité (test puis supprimer)
- [ ] **Création propriété** : Vous pouvez créer une nouvelle propriété (test puis supprimer)
- [ ] **Création lot** : Vous pouvez créer un nouveau lot (test puis supprimer)

**Test** : Naviguez dans `/entities`, `/properties`, `/lots`

---

### 3. Locataires et Baux ✅

- [ ] **Liste locataires** : Vous voyez vos locataires
- [ ] **Création locataire** : Formulaire fonctionne (le trigger user_id devrait remplir automatiquement)
- [ ] **Liste baux** : Vous voyez vos baux
- [ ] **Création bail** : Vous pouvez créer un bail

**Test** : Naviguez dans `/tenants`, `/leases`

**⚠️ IMPORTANT** : Lors de la création d'un locataire, vérifiez qu'il n'y a **PAS d'erreur** `user_id violates not-null constraint`. Si erreur, le trigger n'est pas actif.

---

### 4. Paiements et Quittances ✅

- [ ] **Liste paiements** : Vous voyez vos paiements
- [ ] **Création paiement** : Vous pouvez enregistrer un paiement
- [ ] **Génération PDF** : Clic sur "Télécharger quittance" génère un PDF

**Test** : Naviguez dans `/payments`

---

### 5. Indexation IRL ✅

- [ ] **Page indexation** : La page s'affiche
- [ ] **Historique IRL** : Vous voyez les indices IRL depuis 2015
- [ ] **Graphique** : Le graphique d'évolution s'affiche
- [ ] **Simulation** : Vous pouvez simuler une révision de loyer

**Test** : Naviguez dans `/indexation`

---

### 6. Candidatures (Fonctionnalité Clé) ✅

#### 6.1 Test Propriétaire (Authentifié)

- [ ] **Page candidatures** : `/applications` s'affiche (si route existe)
- [ ] **Création lien d'invitation** : Vous pouvez créer un lien pour un lot
- [ ] **Voir candidatures** : Vous pouvez voir les candidatures pour vos lots

#### 6.2 Test Public (Non Authentifié)

- [ ] **Formulaire public** : Ouvrir le lien d'invitation en navigation privée
- [ ] **Soumission candidature** : Remplir et soumettre une candidature
- [ ] **Upload documents** : Uploader des documents (pièce d'identité, justificatifs)
- [ ] **Pas d'erreur RLS** : Aucune erreur "insufficient privileges"

**Test** :
1. Créez un lien d'invitation pour un lot
2. Copiez le lien
3. Ouvrez une fenêtre de navigation privée
4. Collez le lien et remplissez le formulaire

**⚠️ CRITIQUE** : Si erreur RLS, les policies publiques ne fonctionnent pas.

---

### 7. Isolation Multi-Tenant (SÉCURITÉ) 🔒

**Test avec 2 comptes** :

1. **Créez un 2ème compte** : Inscrivez-vous avec un autre email
2. **Connectez-vous avec compte 2**
3. **Vérifiez l'isolation** :
   - [ ] Vous ne voyez **AUCUNE** donnée du compte 1 (entités, propriétés, locataires, baux)
   - [ ] Créez une entité, propriété, lot pour le compte 2
   - [ ] Déconnectez-vous et reconnectez-vous avec compte 1
   - [ ] Vérifiez que vous ne voyez **PAS** les données du compte 2

**⚠️ CRITIQUE** : Si vous voyez les données de l'autre compte, le RLS est cassé.

---

## 🐛 Problèmes Fréquents

### Erreur 1 : "null value in column user_id violates not-null constraint"

**Cause** : Le trigger `set_tenant_user_id` n'est pas actif.

**Solution** :
```sql
-- Vérifier le trigger
SELECT * FROM pg_trigger WHERE tgname = 'set_tenant_user_id_trigger';

-- Si absent, ré-exécuter 20260104_FIX_TENANTS_URGENT.sql
```

---

### Erreur 2 : "permission denied for table candidates"

**Cause** : Les policies publiques ne sont pas actives.

**Solution** :
```sql
-- Vérifier les policies candidates
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'candidates';

-- Devrait afficher 5 policies dont 1 avec roles = '{anon,authenticated}'
```

---

### Erreur 3 : Voir les données d'un autre utilisateur

**Cause** : RLS mal configuré, mapping auth.uid() incorrect.

**Solution** :
```sql
-- Vérifier le mapping
SELECT
  auth.uid() AS supabase_auth_uid,
  u.id AS app_user_id,
  u.email
FROM users u
WHERE u.supabase_uid = auth.uid();

-- Devrait retourner votre user_id et email
```

---

### Erreur 4 : Ne voir AUCUNE donnée (même les siennes)

**Cause** : user_id ou entity_id NULL dans la table.

**Solution** :
```sql
-- Diagnostic rapide
SELECT
  'Entités' AS "Table",
  COUNT(*) AS "Total",
  COUNT(user_id) AS "Avec user_id"
FROM entities;

-- Si "Total" > "Avec user_id", exécuter 20260104_RESTORE_DATA_FINAL.sql
```

---

## ✅ Validation Finale

Si **TOUS** les tests passent :

- ✅ **RLS V2 fonctionne correctement**
- ✅ **Isolation multi-tenant OK**
- ✅ **Candidatures publiques OK**
- ✅ **Application production-ready**

Vous pouvez passer aux étapes suivantes :
- **Étape 3** : Ajouter mémoïsation React
- **Étape 4** : Refactoring PublicCandidateForm

---

## 📝 Rapport de Test

**Date du test** : _________________

**Résultats** :
- [ ] Tous les tests passent ✅
- [ ] Problèmes rencontrés : _________________

**Notes** : _________________

---

**Créé par** : Claude Sonnet 4.5
**Date** : 4 Janvier 2026
