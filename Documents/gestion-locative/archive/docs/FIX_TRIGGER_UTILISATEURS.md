# 🚨 FIX CRITIQUE - Trigger Création Utilisateurs

> **Problème** : "Utilisateur non trouvé" + "Cannot coerce to single JSON object"
> **Cause** : Trigger `handle_new_user()` manquant ou cassé
> **Impact** : Après inscription, pas d'entrée dans table `users`
> **Solution** : Recréer le trigger + backfill utilisateurs manquants

---

## 🎯 Ordre d'Exécution des Scripts

**IMPORTANT** : Exécutez les 2 scripts dans cet ordre précis :

### 1️⃣ Script 1 : Fix Policy INSERT Users (si pas déjà fait)
**Fichier** : `20260104_FIX_USERS_REGISTRATION.sql`
**But** : Autoriser l'insertion dans table `users`

### 2️⃣ Script 2 : Fix Trigger Création Auto (CRITIQUE)
**Fichier** : `20260104_FIX_USER_CREATION_TRIGGER.sql`
**But** : Créer trigger + remplir utilisateurs manquants

---

## 📋 Exécution Pas à Pas

### Étape 1 : Ouvrir Supabase Dashboard

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Cliquez sur **SQL Editor**

---

### Étape 2 : Exécuter le Script Trigger

1. **Cliquez sur "New query"**
2. **Ouvrez** : `supabase/migrations/20260104_FIX_USER_CREATION_TRIGGER.sql`
3. **Sélectionnez tout** (Cmd+A ou Ctrl+A)
4. **Copiez** (Cmd+C ou Ctrl+C)
5. **Collez** dans SQL Editor
6. **Cliquez sur RUN** ▶️

---

### ✅ Résultat Attendu

```
🚨 FIX CRITIQUE - USER CREATION TRIGGER
==========================================

📊 État actuel:
   Comptes Supabase Auth: 2
   Entrées table users: 1
   Utilisateurs manquants: 1

⚠️  PROBLÈME DÉTECTÉ : 1 utilisateurs sans entrée users

🔧 Création fonction handle_new_user()...
✅ Fonction handle_new_user() créée

🔧 Création trigger on_auth_user_created...
✅ Trigger on_auth_user_created créé

🔄 Remplissage des utilisateurs manquants...
   ✓ Créé entrée pour: nouveau@example.com

✅ Utilisateurs créés: 1

🏢 Création entités par défaut pour nouveaux utilisateurs...
   ✓ Entité créée pour: nouveau@example.com

✅ Entités créées: 1

==========================================
🎉 FIX TERMINÉ !
==========================================

📊 État final:
   Comptes Auth: 2
   Entrées users: 2
   Users avec entité: 2

✅ SYNCHRONISATION PARFAITE !

💡 PROCHAINES ÉTAPES:
   1. Déconnectez-vous de l'application
   2. Reconnectez-vous
   3. Vérifiez que l'erreur "Utilisateur non trouvé" a disparu
   4. Testez la création d'un nouveau compte
```

---

## 🧪 Tests à Effectuer

### Test 1 : Vérifier Utilisateur Existant

1. **Déconnectez-vous** de l'application
2. **Reconnectez-vous** avec votre compte existant
3. **Naviguez** dans l'application (Dashboard, Entités, Propriétés)
4. **Résultat attendu** : ✅ Plus d'erreur "Utilisateur non trouvé"

---

### Test 2 : Créer Nouveau Compte

1. **Déconnectez-vous**
2. **Cliquez sur "S'inscrire"**
3. **Créez un nouveau compte** :
   - Email : test2@example.com
   - Prénom : Test
   - Nom : User
   - Mot de passe : Test123456!
4. **Cliquez sur "S'inscrire"**
5. **Résultat attendu** :
   - ✅ Inscription réussie
   - ✅ Connexion automatique
   - ✅ Redirection vers Dashboard
   - ✅ Une entité par défaut est créée automatiquement

---

### Test 3 : Vérifier Isolation Multi-Tenant

1. **Avec le compte test2**, créez une propriété
2. **Déconnectez-vous**
3. **Reconnectez-vous** avec votre compte principal
4. **Vérifiez** que vous ne voyez **PAS** les données du compte test2
5. **Résultat attendu** : ✅ Isolation parfaite

---

## 🔍 Ce Qui a Été Corrigé

### Avant (CASSÉ)

**Flow Inscription** :
```
1. Utilisateur remplit formulaire inscription
2. ✅ Supabase Auth crée compte (table auth.users)
3. ❌ RIEN ne crée l'entrée dans table users
4. ❌ Connexion réussie mais application casse
5. ❌ Erreur "Utilisateur non trouvé" partout
```

**Conséquence** :
- ❌ Table `auth.users` a 2 utilisateurs
- ❌ Table `users` a 1 utilisateur
- ❌ Désynchronisation → application casse

---

### Après (CORRIGÉ)

**Flow Inscription** :
```
1. Utilisateur remplit formulaire inscription
2. ✅ Supabase Auth crée compte (table auth.users)
3. ✅ TRIGGER handle_new_user() s'exécute automatiquement
4. ✅ Entrée créée dans table users (supabase_uid, email, first_name, last_name)
5. ✅ Connexion réussie + application fonctionne
6. ✅ Entité par défaut créée automatiquement
```

**Résultat** :
- ✅ Synchronisation automatique auth.users ↔ users
- ✅ Chaque utilisateur a une entité par défaut
- ✅ Application fonctionne immédiatement après inscription

---

## 🛠️ Détails Techniques

### Fonction handle_new_user()

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer automatiquement dans users
  INSERT INTO public.users (supabase_uid, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Ce qu'elle fait** :
- S'exécute automatiquement après `INSERT` dans `auth.users`
- Récupère `id`, `email` et métadonnées (prénom/nom) du nouveau compte
- Crée l'entrée correspondante dans `users`

---

### Trigger on_auth_user_created

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**Ce qu'il fait** :
- S'active automatiquement après chaque inscription
- Appelle la fonction `handle_new_user()`
- Garantit la synchronisation `auth.users` ↔ `users`

---

## 📊 Vérification Manuelle (Optionnel)

Si vous voulez vérifier manuellement la synchronisation :

```sql
-- Comparer auth.users et users
SELECT
  'Auth Users' AS "Source",
  COUNT(*) AS "Nombre"
FROM auth.users

UNION ALL

SELECT
  'App Users',
  COUNT(*)
FROM users;

-- Résultat attendu : Même nombre
```

---

## ⚠️ Si le Problème Persiste

Si après l'exécution du script vous avez toujours des erreurs :

### Vérifier le Trigger

```sql
-- Vérifier que le trigger existe
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Résultat attendu : 1 ligne avec le trigger
```

### Vérifier la Fonction

```sql
-- Vérifier que la fonction existe
SELECT proname, prosrc
FROM pg_proc
WHERE proname = 'handle_new_user';

-- Résultat attendu : 1 ligne avec la fonction
```

### Tester Manuellement

```sql
-- Simuler l'insertion (NE PAS EXÉCUTER EN PRODUCTION)
-- Remplacez les valeurs par celles du compte manquant
INSERT INTO users (supabase_uid, email, first_name, last_name)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'first_name', ''),
  COALESCE(raw_user_meta_data->>'last_name', '')
FROM auth.users
WHERE email = 'nouveau@example.com';
```

---

## 🎯 Impact Final

**Avant le fix** :
- ❌ Inscription casse l'application
- ❌ Utilisateurs manquent dans table `users`
- ❌ "Utilisateur non trouvé" partout

**Après le fix** :
- ✅ Inscription fonctionne parfaitement
- ✅ Trigger automatique auth.users → users
- ✅ Entité par défaut créée automatiquement
- ✅ Application prête pour production

---

**Créé par** : Claude Sonnet 4.5
**Date** : 4 Janvier 2026
**Priorité** : 🚨 CRITIQUE - Bloquant pour inscription
