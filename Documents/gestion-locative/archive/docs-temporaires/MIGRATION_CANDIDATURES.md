# Migration SQL - Système de Candidatures

> Date : 2 Janvier 2026
> Fichier : supabase/migrations/20260102_create_candidates.sql

## 🎯 Objectif

Créer les tables nécessaires au système de candidatures dans Supabase.

## ⚠️ Important

Cette migration doit être exécutée **AVANT** d'utiliser le système de candidatures.

## 📝 Étapes d'installation

### 1. Accéder à Supabase

1. Aller sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionner votre projet
3. Cliquer sur **SQL Editor** dans le menu de gauche

### 2. Exécuter la migration

1. Cliquer sur **"New query"**
2. Copier tout le contenu du fichier `supabase/migrations/20260102_create_candidates.sql`
3. Coller dans l'éditeur SQL
4. Cliquer sur **"Run"** (ou Ctrl+Enter)

### 3. Vérifier la création

Après exécution, vérifier que les tables sont créées :

```sql
-- Vérifier la table candidates
SELECT COUNT(*) FROM candidates;

-- Vérifier la table candidate_documents
SELECT COUNT(*) FROM candidate_documents;

-- Vérifier la table candidate_invitation_links (si elle existe)
SELECT COUNT(*) FROM candidate_invitation_links;
```

### 4. Créer le bucket Storage

1. Aller sur **Storage** dans le menu Supabase
2. Cliquer sur **"New bucket"**
3. Nom : `candidate-documents`
4. **Public bucket** : ✅ OUI (cocher)
5. Cliquer sur **"Create bucket"**

### 5. (Optionnel) Activer RLS

Pour plus de sécurité, activer Row Level Security :

```sql
-- Activer RLS sur les tables
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_documents ENABLE ROW LEVEL SECURITY;

-- Politique : Les bailleurs peuvent voir les candidatures de leurs entités
CREATE POLICY "Bailleurs can view their candidates"
  ON candidates
  FOR SELECT
  USING (
    entity_id IN (
      SELECT id FROM entities WHERE user_id = auth.uid()
    )
  );

-- Politique : Les bailleurs peuvent modifier leurs candidatures
CREATE POLICY "Bailleurs can update their candidates"
  ON candidates
  FOR UPDATE
  USING (
    entity_id IN (
      SELECT id FROM entities WHERE user_id = auth.uid()
    )
  );

-- Politique : Tout le monde peut créer une candidature (formulaire public)
CREATE POLICY "Anyone can create candidates"
  ON candidates
  FOR INSERT
  WITH CHECK (true);

-- Politique : Documents visibles par le bailleur de l'entité
CREATE POLICY "Bailleurs can view documents"
  ON candidate_documents
  FOR SELECT
  USING (
    candidate_id IN (
      SELECT id FROM candidates WHERE entity_id IN (
        SELECT id FROM entities WHERE user_id = auth.uid()
      )
    )
  );

-- Politique : Tout le monde peut uploader des documents (formulaire public)
CREATE POLICY "Anyone can upload documents"
  ON candidate_documents
  FOR INSERT
  WITH CHECK (true);
```

## ✅ Vérification finale

Tester que tout fonctionne :

```sql
-- Test 1 : Insérer une candidature de test
INSERT INTO candidates (
  lot_id,
  entity_id,
  first_name,
  last_name,
  email,
  monthly_income,
  status
) VALUES (
  'UUID_DUN_LOT_EXISTANT',
  'UUID_DUNE_ENTITE_EXISTANTE',
  'Jean',
  'Dupont',
  'jean.dupont@example.com',
  3000,
  'pending'
) RETURNING *;

-- Test 2 : Vérifier le calcul automatique (si triggers activés)
SELECT id, first_name, last_name, solvency_score FROM candidates
WHERE email = 'jean.dupont@example.com';

-- Test 3 : Supprimer la candidature de test
DELETE FROM candidates WHERE email = 'jean.dupont@example.com';
```

## 🔧 Dépannage

### Erreur "relation already exists"
Les tables existent déjà. Aucune action nécessaire.

### Erreur "permission denied"
Vérifier que vous êtes bien connecté comme owner du projet.

### Erreur lors de la création du bucket
Le bucket existe peut-être déjà. Vérifier dans Storage.

### Les candidatures ne s'affichent pas
1. Vérifier que les tables sont créées
2. Vérifier que le bucket Storage existe
3. Vérifier les logs dans le navigateur (F12 → Console)

## 📊 Tables créées

### 1. candidates
Stocke les candidatures avec :
- Informations personnelles
- Situation professionnelle
- Informations garant
- Scoring automatique
- Workflow statut

### 2. candidate_documents
Stocke les documents uploadés :
- Type de document
- Chemin fichier
- URL publique
- Métadonnées

### 3. candidate_invitation_links (à créer séparément si nécessaire)
Gère les liens d'invitation :
- Token unique
- Lot concerné
- Statut actif/inactif

## 🚀 Prochaine étape

Une fois la migration exécutée :

1. Tester le formulaire public : `/apply/:token`
2. Créer une candidature de test
3. Consulter la liste : `/candidates`
4. Tester le scoring automatique

---

**En cas de problème**, consulter le fichier `CANDIDATURES_GUIDE.md` pour plus de détails.
