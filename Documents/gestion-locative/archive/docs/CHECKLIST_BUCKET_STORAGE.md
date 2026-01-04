# Checklist Bucket Storage - Candidatures

> Date : 2 Janvier 2026
> Objectif : Vérifier et créer le bucket Supabase Storage pour les documents de candidatures

---

## 📦 QU'EST-CE QU'UN BUCKET STORAGE ?

Un **bucket** est un espace de stockage de fichiers dans Supabase Storage, similaire à un dossier sur Amazon S3 ou Google Cloud Storage.

Pour le système de candidatures, nous avons besoin d'un bucket **public** nommé `candidate-documents` pour stocker :
- Pièces d'identité
- Justificatifs de revenus
- RIB
- Contrats de travail
- Avis d'imposition
- Documents garants

---

## ✅ ÉTAPE 1 : VÉRIFIER SI LE BUCKET EXISTE

### Option A : Via l'interface Supabase Dashboard

1. Aller sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionner votre projet
3. Dans le menu de gauche, cliquer sur **"Storage"**
4. Chercher un bucket nommé **`candidate-documents`**

**Résultat** :
- ✅ Le bucket existe → Passer à l'ÉTAPE 2 (vérification)
- ❌ Le bucket n'existe pas → Passer à l'ÉTAPE 3 (création)

### Option B : Via SQL (méthode avancée)

Exécuter cette requête dans **SQL Editor** :

```sql
SELECT
  id,
  name,
  public
FROM storage.buckets
WHERE name = 'candidate-documents';
```

**Résultat attendu** :
- Si le bucket existe : 1 ligne retournée
- Si le bucket n'existe pas : 0 ligne

---

## ✅ ÉTAPE 2 : VÉRIFIER LA CONFIGURATION DU BUCKET

Si le bucket existe déjà, vérifier qu'il est bien **public**.

### Via l'interface Supabase Dashboard

1. Aller sur **Storage** → **candidate-documents**
2. Cliquer sur les **3 points** (⋮) à droite du nom du bucket
3. Sélectionner **"Edit bucket"**
4. Vérifier que **"Public bucket"** est coché ✅
5. Si non coché, **cocher la case** et cliquer sur **"Save"**

### Via SQL

```sql
-- Vérifier si le bucket est public
SELECT public FROM storage.buckets WHERE name = 'candidate-documents';

-- Si le résultat est "false", exécuter cette commande pour le rendre public :
UPDATE storage.buckets
SET public = true
WHERE name = 'candidate-documents';
```

**Important** : Le bucket DOIT être public pour que les liens de téléchargement fonctionnent sans authentification.

---

## ✅ ÉTAPE 3 : CRÉER LE BUCKET (si nécessaire)

### Option A : Via l'interface Supabase Dashboard (RECOMMANDÉ)

1. Aller sur **Storage** dans le menu de gauche
2. Cliquer sur **"New bucket"** (en haut à droite)
3. Remplir le formulaire :
   - **Name** : `candidate-documents`
   - **Public bucket** : ✅ **COCHER CETTE CASE**
   - **File size limit** : 10 MB (optionnel, recommandé)
   - **Allowed MIME types** : Laisser vide ou spécifier :
     ```
     image/jpeg, image/png, image/jpg, application/pdf
     ```
4. Cliquer sur **"Create bucket"**

**Résultat attendu** :
- ✅ Le bucket apparaît dans la liste Storage
- ✅ L'icône 🌐 (globe) indique qu'il est public

### Option B : Via SQL

```sql
-- Créer le bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('candidate-documents', 'candidate-documents', true);
```

**Note** : Cette méthode nécessite des permissions élevées. Préférer l'interface web.

---

## ✅ ÉTAPE 4 : TESTER LE BUCKET

### Test 1 : Upload manuel d'un fichier

1. Aller sur **Storage** → **candidate-documents**
2. Cliquer sur **"Upload file"**
3. Sélectionner un fichier PDF ou image de test
4. Cliquer sur **"Upload"**

**Résultat attendu** :
- ✅ Le fichier apparaît dans la liste
- ✅ Un lien public est généré

### Test 2 : Vérifier l'URL publique

1. Cliquer sur le fichier uploadé
2. Copier l'**URL publique** (format : `https://[PROJECT_ID].supabase.co/storage/v1/object/public/candidate-documents/[FILE_PATH]`)
3. Coller l'URL dans un nouvel onglet de navigateur

**Résultat attendu** :
- ✅ Le fichier s'affiche ou se télécharge
- ❌ Si erreur 403 Forbidden → Le bucket n'est pas public (retour ÉTAPE 2)

### Test 3 : Supprimer le fichier de test

1. Sélectionner le fichier de test
2. Cliquer sur **"Delete"**
3. Confirmer

---

## ✅ ÉTAPE 5 : CONFIGURER LES POLITIQUES DE STOCKAGE (OPTIONNEL)

Par défaut, un bucket **public** permet :
- ✅ Tout le monde peut **lire** les fichiers (télécharger)
- ✅ Tout le monde peut **uploader** des fichiers

Pour plus de sécurité, vous pouvez restreindre l'upload aux utilisateurs authentifiés.

### Politique recommandée : Upload public, lecture publique

```sql
-- Politique 1 : Tout le monde peut uploader
CREATE POLICY "Public upload for candidate documents"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'candidate-documents');

-- Politique 2 : Tout le monde peut lire
CREATE POLICY "Public read for candidate documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'candidate-documents');

-- Politique 3 : Seuls les bailleurs peuvent supprimer
CREATE POLICY "Authenticated users can delete candidate documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'candidate-documents'
  AND auth.role() = 'authenticated'
);
```

**Note** : Ces politiques ne sont PAS obligatoires pour le MVP. Elles peuvent être ajoutées plus tard pour renforcer la sécurité.

---

## 🎯 RÉCAPITULATIF

### ✅ Checklist finale

- [ ] Le bucket `candidate-documents` existe
- [ ] Le bucket est **public** (case cochée)
- [ ] Upload manuel d'un fichier de test réussi
- [ ] URL publique accessible sans authentification
- [ ] Fichier de test supprimé
- [ ] (Optionnel) Politiques de stockage configurées

---

## 🐛 DÉPANNAGE

### Problème : "Bucket already exists"
**Cause** : Le bucket a déjà été créé
**Solution** : Aucune action nécessaire, passer à l'ÉTAPE 2 pour vérifier la configuration

### Problème : Erreur 403 Forbidden lors de l'accès à l'URL
**Cause** : Le bucket n'est pas public
**Solution** :
1. Aller sur Storage → candidate-documents
2. Edit bucket → Cocher "Public bucket" → Save

### Problème : Upload échoue depuis l'application
**Cause possible 1** : Le bucket n'existe pas
**Solution** : Créer le bucket (ÉTAPE 3)

**Cause possible 2** : Quota Storage dépassé
**Solution** : Vérifier les quotas Supabase (Dashboard → Settings → Usage)

**Cause possible 3** : Fichier trop gros
**Solution** : Réduire la taille du fichier (< 10 Mo recommandé)

### Problème : Politiques de stockage bloquent l'upload
**Cause** : RLS activé avec politiques restrictives
**Solution** :
1. Désactiver temporairement RLS :
```sql
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```
2. Ou configurer les bonnes politiques (voir ÉTAPE 5)

---

## 📋 INFORMATIONS SUPPLÉMENTAIRES

### Limites Supabase Storage (Plan Gratuit)

- **Stockage total** : 1 GB
- **Taille max fichier** : 50 MB
- **Bande passante** : 2 GB/mois

### Formats de fichiers recommandés

| Type de document | Formats acceptés |
|------------------|------------------|
| Pièce d'identité | PDF, JPG, PNG |
| Justificatifs revenus | PDF |
| RIB | PDF, JPG, PNG |
| Contrat de travail | PDF |
| Avis d'imposition | PDF |

### Structure recommandée des fichiers

L'application uploade les fichiers avec ce format de chemin :
```
candidate-documents/
  └── [entity_id]/
      └── [candidate_id]/
          ├── id_card_[timestamp].pdf
          ├── proof_income_[timestamp].pdf
          ├── rib_[timestamp].pdf
          └── ...
```

Cela permet :
- ✅ Organisation par entité
- ✅ Isolation par candidat
- ✅ Pas de conflit de noms (timestamp)
- ✅ Facilité de suppression (tout un dossier candidat)

---

## 🎉 VALIDATION FINALE

Si toutes les étapes sont validées, le bucket Storage est prêt ! ✅

Vous pouvez maintenant :
1. Exécuter la migration SQL `20260102_create_candidates.sql`
2. Tester le formulaire public de candidature
3. Uploader des documents via l'application
4. Consulter les candidatures côté bailleur

---

**Date de vérification** : __________________
**Bucket créé** : ✅ OUI / ❌ NON
**Bucket public** : ✅ OUI / ❌ NON
**Test upload réussi** : ✅ OUI / ❌ NON
**Commentaires** : _________________________________________________
