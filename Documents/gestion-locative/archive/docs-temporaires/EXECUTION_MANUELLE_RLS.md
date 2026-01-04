# 🚀 Exécution Manuelle des Migrations RLS

**Durée estimée**: 10 minutes
**Impact**: CRITIQUE - Sécurité multi-tenant

---

## 📋 Prérequis

- Accès au Dashboard Supabase
- Droits admin sur le projet
- **IMPORTANT**: Faire un backup de la BDD avant (recommandé)

---

## 🔧 Méthode: SQL Editor Supabase

### Étape 1: Accéder au SQL Editor

1. Aller sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionner votre projet: **gestion-locative**
3. Dans le menu latéral, cliquer sur **SQL Editor**

---

### Étape 2: Exécuter la Migration d'Activation RLS

1. Cliquer sur **New Query** (en haut à droite)

2. Copier-coller le contenu complet du fichier:
   ```
   supabase/migrations/20260103_activate_rls.sql
   ```

3. Cliquer sur **Run** (Ctrl+Enter ou Cmd+Enter)

4. **Vérifier l'output**:
   ```
   ==========================================
   🔐 ACTIVATION RLS - PHASE 1
   ==========================================

   👤 Activation RLS: users...
   ✅ ALTER TABLE
   🏢 Activation RLS: entities...
   ✅ ALTER TABLE
   ...

   📊 État RLS après activation:
     - Total tables: 15
     - Tables avec RLS: 15 ✅
     - Tables SANS RLS: 0

   🎉 SUCCÈS: RLS activé sur TOUTES les tables !

   ⚠️  ATTENTION - ACTION REQUISE
   ❌ CONSÉQUENCE: Toutes les requêtes vont ÉCHOUER
   ✅ SOLUTION: Exécutez IMMÉDIATEMENT:
      → 20260103_create_rls_policies.sql
   ```

5. **Si erreur**: Vérifier que les tables existent
   - Si une table n'existe pas (ex: `tenant_groups`), c'est normal
   - L'instruction `IF EXISTS` permet d'ignorer ces tables

---

### Étape 3: Exécuter la Migration des Policies

**⚠️ ATTENTION**: Cette étape est CRITIQUE et doit être faite IMMÉDIATEMENT après l'Étape 2

1. Créer une nouvelle query: **New Query**

2. Copier-coller le contenu complet du fichier:
   ```
   supabase/migrations/20260103_create_rls_policies.sql
   ```

3. Cliquer sur **Run**

4. **Vérifier l'output**:
   ```
   ==========================================
   🔐 CRÉATION POLICIES RLS - PHASE 2
   ==========================================

   🛠️  Création fonction helper user_owns_entity...
   ✅ CREATE FUNCTION

   👤 Création policies: users...
   ✅ CREATE POLICY (2 policies)

   🏢 Création policies: entities...
   ✅ CREATE POLICY (4 policies)

   🏠 Création policies: properties_new...
   ✅ CREATE POLICY (4 policies)

   ...

   📊 RÉSULTATS:
     - Total tables: 15
     - Tables avec RLS: 15 ✅
     - Tables avec policies: 15 ✅
     - Total policies créées: 60 🔐

   🎯 Score de sécurité: 100/100

   🎉 PARFAIT! RLS est complètement configuré.
   ```

5. **Si erreur "policy already exists"**:
   - C'est que les policies ont déjà été créées
   - Pas grave, passer à l'étape suivante

---

### Étape 4: Vérification avec Diagnostic

1. Créer une nouvelle query: **New Query**

2. Copier-coller le contenu complet du fichier:
   ```
   supabase/migrations/DIAGNOSTIC_RLS_COMPLET.sql
   ```

3. Cliquer sur **Run**

4. **Vérifier l'output**:

   **Section 1: Statut RLS**
   ```
   Table                | RLS
   ---------------------|---------------
   users                | ✅ ACTIVÉ
   entities             | ✅ ACTIVÉ
   properties_new       | ✅ ACTIVÉ
   lots                 | ✅ ACTIVÉ
   tenants              | ✅ ACTIVÉ
   ...
   ```
   → **Toutes les tables critiques doivent avoir "✅ ACTIVÉ"**

   **Section 2: Policies par table**
   ```
   Table                | Policies
   ---------------------|----------
   users                | 2
   entities             | 4
   properties_new       | 4
   lots                 | 4
   tenants              | 4
   ...
   ```
   → **Chaque table doit avoir au moins 2-4 policies**

   **Section 3: Score de sécurité**
   ```
   🎯 Score de sécurité: 100/100

   ✅ EXCELLENT! Votre base de données est parfaitement sécurisée.
   ```
   → **Objectif: 100/100**

---

## ✅ Tests Manuels (OBLIGATOIRE)

### Test 1: Isolation Multi-Tenant

**Objectif**: Vérifier que User A ne voit pas les données de User B

1. **Créer User A**:
   - Se connecter avec un premier compte (ex: test1@example.com)
   - Créer une entité "Entité A"
   - Créer un bien, un lot, un locataire
   - Noter l'ID de l'entité: `entity_id_A`

2. **Créer User B**:
   - Se déconnecter
   - Se connecter avec un second compte (ex: test2@example.com)
   - Créer une entité "Entité B"
   - Créer un bien, un lot, un locataire

3. **Tester l'isolation via SQL Editor**:
   ```sql
   -- En tant que User B, essayer d'accéder aux données de User A
   SELECT * FROM tenants WHERE entity_id = 'entity_id_A';
   ```

   **Résultat attendu**: `0 rows` (vide) ✅

   **Si résultat non vide**: ❌ PROBLÈME - RLS ne fonctionne pas

4. **Tester dans l'interface**:
   - User B ne doit voir AUCUN bien/lot/locataire de User A
   - Dashboard User B affiche seulement les stats de User B

---

### Test 2: Opérations CRUD

**Objectif**: Vérifier que les opérations fonctionnent pour ses propres données

1. **SELECT**: User A peut voir ses propres locataires ✅
2. **INSERT**: User A peut créer un nouveau locataire ✅
3. **UPDATE**: User A peut modifier son locataire ✅
4. **DELETE**: User A peut supprimer son locataire ✅

**Si une opération échoue**: Vérifier les policies dans SQL Editor

---

### Test 3: Fonction auth.uid()

**Objectif**: Vérifier que Supabase Auth fonctionne avec RLS

```sql
-- En tant que User A connecté
SELECT auth.uid();
```

**Résultat attendu**: UUID de User A (ex: `123e4567-e89b-12d3-a456-426614174000`) ✅

**Si NULL**: ❌ PROBLÈME - User non authentifié ou session expirée

---

## 🔥 En Cas de Problème

### Problème 1: "permission denied for table"

**Cause**: RLS activé mais policies manquantes

**Solution**:
```sql
-- Vérifier les policies
SELECT tablename, COUNT(*)
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename;

-- Si une table a 0 policies, exécuter:
-- 20260103_create_rls_policies.sql
```

---

### Problème 2: "new row violates row-level security policy"

**Cause**: Tentative d'insertion avec un `entity_id` que l'utilisateur ne possède pas

**Solution**:
```javascript
// Frontend: toujours utiliser l'entity_id de l'utilisateur connecté
const { data: entities } = await supabase
  .from('entities')
  .select('id')
  .single()

// Utiliser entities.id pour toutes les insertions
```

---

### Problème 3: "function user_owns_entity does not exist"

**Cause**: La fonction helper n'a pas été créée

**Solution**:
```sql
-- Créer manuellement la fonction
CREATE OR REPLACE FUNCTION user_owns_entity(entity_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM entities
    WHERE id = entity_uuid
      AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
```

---

### Problème 4: Application ne fonctionne plus (toutes requêtes échouent)

**Cause**: RLS activé mais policies pas encore créées

**Solution URGENTE**:
1. Exécuter immédiatement `20260103_create_rls_policies.sql`
2. Ou désactiver temporairement RLS:
   ```sql
   -- TEMPORAIRE UNIQUEMENT (pas sécurisé)
   ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
   -- Puis recréer les policies et réactiver
   ```

---

## 🔄 Rollback (En Cas d'Urgence)

**Si vous devez revenir en arrière** (pas recommandé):

```sql
-- Désactiver RLS sur toutes les tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE entities DISABLE ROW LEVEL SECURITY;
ALTER TABLE properties_new DISABLE ROW LEVEL SECURITY;
ALTER TABLE lots DISABLE ROW LEVEL SECURITY;
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE guarantees DISABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE leases DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE irl_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE indexation_history DISABLE ROW LEVEL SECURITY;

-- Supprimer les policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can view own entities" ON entities;
-- ... (toutes les policies)

-- Supprimer la fonction helper
DROP FUNCTION IF EXISTS user_owns_entity;
```

**⚠️ ATTENTION**: Sans RLS, votre application est VULNÉRABLE aux fuites de données !

---

## 📊 Checklist Post-Migration

- [ ] Migration `20260103_activate_rls.sql` exécutée sans erreur
- [ ] Migration `20260103_create_rls_policies.sql` exécutée sans erreur
- [ ] Diagnostic `DIAGNOSTIC_RLS_COMPLET.sql` affiche 100/100
- [ ] Test isolation: User A ne voit pas données User B
- [ ] Test CRUD: Création/lecture/modification/suppression fonctionnent
- [ ] Test `auth.uid()` retourne UUID utilisateur
- [ ] Application fonctionne normalement (dashboard, pages)
- [ ] Pas d'erreur "permission denied" dans les logs

---

## 🎯 Résultat Attendu

**Avant RLS**:
- Score sécurité: 0/100 ❌
- Isolation: Aucune (tous users voient tout) ❌
- Conformité RGPD: Non ❌

**Après RLS**:
- Score sécurité: 100/100 ✅
- Isolation: Parfaite (chaque user voit uniquement ses données) ✅
- Conformité RGPD: Oui ✅

---

## 📞 Support

**Si problème bloquant**:
1. Vérifier les logs Supabase: Dashboard → Logs
2. Tester via SQL Editor les queries problématiques
3. Utiliser `DIAGNOSTIC_RLS_COMPLET.sql` pour identifier le problème

**Logs utiles**:
```sql
-- Voir les policies d'une table
SELECT * FROM pg_policies WHERE tablename = 'tenants';

-- Voir les tables avec RLS activé
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true;

-- Tester une policy manuellement
SELECT * FROM tenants WHERE user_owns_entity(entity_id);
```

---

*Dernière mise à jour: 3 Janvier 2026*
*Référence: PHASE1_STABILISATION_RESUME.md*
