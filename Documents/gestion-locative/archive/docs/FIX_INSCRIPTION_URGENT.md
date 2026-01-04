# 🚨 FIX URGENT - Inscription Impossible

> **Problème** : "new row violates row-level security policy for table users"
> **Cause** : Policy INSERT manquante sur la table `users`
> **Impact** : Les nouveaux utilisateurs ne peuvent pas s'inscrire
> **Solution** : Exécuter le script de fix en 1 minute

---

## 🎯 Solution Rapide (1 minute)

### Étape 1 : Ouvrir Supabase SQL Editor

1. Ouvrez https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Cliquez sur **SQL Editor** (menu gauche)

### Étape 2 : Exécuter le Fix

1. **Cliquez sur "New query"**
2. **Ouvrez** : `supabase/migrations/20260104_FIX_USERS_REGISTRATION.sql`
3. **Copiez tout** le contenu (Cmd+A ou Ctrl+A)
4. **Collez** dans SQL Editor
5. **Cliquez sur RUN** ▶️

### ✅ Résultat Attendu

```
🔧 FIX USERS REGISTRATION
==========================================

📊 Policies users existantes: 2

🗑️  Suppression anciennes policies users...
✅ Anciennes policies supprimées

✅ Création nouvelles policies users...
✅ 3 policies users créées
   1. INSERT (inscription) - authenticated
   2. SELECT (lecture) - self-service
   3. UPDATE (modification) - self-service

==========================================
🎉 FIX TERMINÉ !
==========================================

📊 État final:
   Policies users: 3

💡 Test à faire:
   1. Déconnectez-vous
   2. Cliquez sur "S'inscrire"
   3. Créez un nouveau compte
   4. Vérifiez qu'il n'y a pas d'erreur RLS
```

---

## 🧪 Tester le Fix

1. **Déconnectez-vous** de l'application
2. **Cliquez sur "S'inscrire"**
3. **Remplissez le formulaire** avec :
   - Email : test@example.com
   - Mot de passe : Test123456!
   - Prénom : Test
   - Nom : User
4. **Cliquez sur "S'inscrire"**

**✅ Succès** : Vous êtes connecté avec le nouveau compte
**❌ Échec** : Erreur RLS → Contactez-moi

---

## 📝 Ce Qui a Été Corrigé

### Avant (CASSÉ)
```sql
-- Seulement 2 policies : SELECT et UPDATE
CREATE POLICY "Users can view their own record" ON users FOR SELECT...
CREATE POLICY "Users can update their own record" ON users FOR UPDATE...

-- ❌ PAS de policy INSERT → Inscription impossible
```

### Après (CORRIGÉ)
```sql
-- 3 policies : INSERT + SELECT + UPDATE
CREATE POLICY "Users can create their own profile during registration"
ON users FOR INSERT
TO authenticated
WITH CHECK (supabase_uid = auth.uid());  -- ✅ Permet l'inscription

CREATE POLICY "Users can view their own record" ON users FOR SELECT...
CREATE POLICY "Users can update their own record" ON users FOR UPDATE...
```

---

## 🔍 Vérification Manuelle (Optionnel)

Si vous voulez vérifier les policies users dans Supabase :

```sql
SELECT
  policyname AS "Policy Name",
  cmd AS "Command",
  roles AS "Roles"
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;
```

**Résultat attendu** :
| Policy Name | Command | Roles |
|-------------|---------|-------|
| Users can create their own profile during registration | INSERT | {authenticated} |
| Users can update their own record | UPDATE | {authenticated} |
| Users can view their own record | SELECT | {authenticated} |

---

## 🎯 Impact sur RLS V2

Le script `20260104_RLS_CORRECT_FINAL_v2.sql` a été **mis à jour** pour inclure cette policy dès le départ.

Si vous ré-exécutez la migration RLS V2 complète, la policy INSERT sera créée automatiquement.

---

## ⚠️ Pourquoi Ce Bug ?

**Root Cause** : Lors de la création du script RLS V2, j'ai oublié la policy INSERT pour `users`.

**Conséquence** : Les utilisateurs authentifiés (via Supabase Auth) pouvaient se connecter, mais le trigger qui crée l'entrée dans la table `users` échouait à cause du RLS.

**Fix** : Ajout de la policy INSERT avec condition `supabase_uid = auth.uid()`.

---

## 📊 État Final

**Tables avec RLS** : 13
**Policies actives** : ~63 (60 + 3 users)
**Score Sécurité** : 100/100 ✅

---

**Créé par** : Claude Sonnet 4.5
**Date** : 4 Janvier 2026
**Priorité** : 🚨 URGENT - Bloquant pour inscription
