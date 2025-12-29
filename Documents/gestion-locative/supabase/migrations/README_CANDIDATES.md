# Installation du Système de Candidatures

> Guide d'installation des tables et politiques RLS pour le système de candidatures

## 📋 Prérequis

- Accès au Dashboard Supabase
- Les tables `entities`, `properties_new`, `lots_new` déjà créées
- La migration `20241222_add_candidates_tables.sql` déjà appliquée

## 🚀 Installation en 3 étapes

### Étape 1 : Appliquer la migration RLS

Dans le **SQL Editor** de Supabase Dashboard :

1. Aller sur https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql
2. Copier-coller le contenu de `20241229_add_rls_policies_candidates.sql`
3. Cliquer sur **Run**

Cette migration va :
- ✅ Activer RLS sur les 3 tables candidates
- ✅ Créer les politiques pour `candidate_invitation_links`
- ✅ Créer les politiques pour `candidates`
- ✅ Créer les politiques pour `candidate_documents`
- ✅ Créer les politiques pour le bucket Storage

### Étape 2 : Créer le bucket Storage

Dans **Storage** de Supabase Dashboard :

1. Aller sur https://supabase.com/dashboard/project/YOUR_PROJECT_ID/storage/buckets
2. Cliquer sur **New bucket**
3. Remplir les champs :
   - **Name** : `candidate-documents`
   - **Public** : ❌ Non (privé)
   - **File size limit** : `10 MB`
   - **Allowed MIME types** : `image/jpeg, image/png, application/pdf`
4. Cliquer sur **Create bucket**

### Étape 3 : Vérifier l'installation

Exécuter ce SQL pour vérifier que tout est OK :

```sql
-- Vérifier que RLS est activé
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('candidate_invitation_links', 'candidates', 'candidate_documents');
-- Résultat attendu: rowsecurity = true pour les 3 tables

-- Vérifier les politiques
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('candidate_invitation_links', 'candidates', 'candidate_documents')
ORDER BY tablename, policyname;
-- Résultat attendu: 13 politiques au total

-- Vérifier le bucket
SELECT * FROM storage.buckets WHERE name = 'candidate-documents';
-- Résultat attendu: 1 ligne avec public = false
```

## 🔐 Résumé des Politiques RLS

### Table `candidate_invitation_links`

| Action | Qui | Condition |
|--------|-----|-----------|
| SELECT | Tous (anon + auth) | Liens actifs uniquement |
| INSERT | Propriétaires authentifiés | Pour leurs propres lots |
| UPDATE | Propriétaires authentifiés | Leurs propres liens |
| DELETE | Propriétaires authentifiés | Leurs propres liens |

### Table `candidates`

| Action | Qui | Condition |
|--------|-----|-----------|
| SELECT | Propriétaires authentifiés | Candidatures de leurs lots |
| SELECT | Candidats (anon) | Leur propre candidature via token |
| INSERT | Tous (anon + auth) | Formulaire public |
| UPDATE | Propriétaires authentifiés | Candidatures de leurs lots |
| DELETE | Propriétaires authentifiés | Candidatures de leurs lots |

### Table `candidate_documents`

| Action | Qui | Condition |
|--------|-----|-----------|
| SELECT | Propriétaires authentifiés | Documents de leurs candidatures |
| SELECT | Candidats (anon) | Leurs propres documents |
| INSERT | Tous (anon + auth) | Upload depuis formulaire public |
| DELETE | Propriétaires authentifiés | Documents de leurs candidatures |

### Storage Bucket `candidate-documents`

| Action | Qui | Condition |
|--------|-----|-----------|
| SELECT | Propriétaires authentifiés | Documents de leurs candidatures |
| SELECT | Candidats (anon) | Leurs propres documents |
| INSERT | Tous (anon + auth) | Upload de fichiers |
| DELETE | Propriétaires authentifiés | Documents de leurs candidatures |

## 🧪 Tester le Système

### Test 1 : Générer un lien d'invitation (Propriétaire)

1. Se connecter à l'application
2. Aller sur un lot vacant : `/lots/:id`
3. Cliquer sur **"Générer un lien d'invitation"**
4. Vérifier que le lien est créé et affiché

### Test 2 : Soumettre une candidature (Public)

1. Copier le lien d'invitation
2. Ouvrir en navigation privée (pour tester en tant que non-authentifié)
3. Remplir le formulaire en 6 étapes
4. Uploader les documents
5. Valider la candidature
6. Vérifier la page de succès avec le token de suivi

### Test 3 : Voir les candidatures (Propriétaire)

1. Aller sur `/candidates`
2. Vérifier que la candidature est visible
3. Cliquer sur la candidature
4. Vérifier que tous les détails sont visibles
5. Vérifier que les documents sont téléchargeables

### Test 4 : Suivre une candidature (Public)

1. Aller sur `/application-status`
2. Entrer l'email ou le token du candidat
3. Vérifier que le statut est affiché
4. Vérifier que les documents peuvent être uploadés

### Test 5 : Accepter et convertir (Propriétaire)

1. Aller sur le détail d'une candidature
2. Cliquer sur **"Accepter"**
3. Cliquer sur **"Convertir en locataire"**
4. Vérifier la redirection vers le bail créé

## 🐛 Dépannage

### Erreur : "new row violates row-level security policy"

**Cause** : Les politiques RLS ne sont pas appliquées ou incorrectes

**Solution** :
1. Vérifier que la migration `20241229_add_rls_policies_candidates.sql` a été exécutée
2. Vérifier que les tables `lots_new`, `properties_new`, `entities` existent
3. Vérifier que l'utilisateur est bien authentifié pour les opérations protégées

### Erreur : "storage/bucket-not-found"

**Cause** : Le bucket `candidate-documents` n'existe pas

**Solution** :
1. Créer le bucket dans Storage (Étape 2)
2. Vérifier le nom exact : `candidate-documents` (avec tiret)

### Erreur : "storage/object-not-found"

**Cause** : Problème de chemin de fichier

**Solution** :
1. Vérifier que le bucket existe
2. Vérifier que les politiques Storage sont appliquées
3. Vérifier le format du chemin : `candidateId/type-timestamp.ext`

### Les documents ne s'affichent pas

**Cause** : Politiques Storage manquantes

**Solution** :
1. Réexécuter la partie Storage de la migration
2. Vérifier les politiques avec :
```sql
SELECT * FROM storage.policies WHERE bucket_id = 'candidate-documents';
```

## 📝 Notes Importantes

- **Sécurité** : Le bucket Storage est **privé** (public = false)
- **Accès public** : Les candidats peuvent soumettre des candidatures sans compte
- **Accès authentifié** : Seuls les propriétaires voient les candidatures de leurs lots
- **Isolation** : Un propriétaire ne peut pas voir les candidatures des autres propriétaires
- **Token unique** : Chaque candidature génère un token unique pour le suivi

## ✅ Checklist Installation

- [ ] Migration `20241222_add_candidates_tables.sql` exécutée
- [ ] Migration `20241229_add_rls_policies_candidates.sql` exécutée
- [ ] Bucket `candidate-documents` créé
- [ ] RLS activé sur les 3 tables (vérification SQL)
- [ ] 13 politiques créées (vérification SQL)
- [ ] Test 1 : Génération lien d'invitation OK
- [ ] Test 2 : Soumission candidature publique OK
- [ ] Test 3 : Affichage candidatures propriétaire OK
- [ ] Test 4 : Suivi candidature public OK
- [ ] Test 5 : Conversion en locataire OK

---

**Dernière mise à jour** : 29 Décembre 2024
