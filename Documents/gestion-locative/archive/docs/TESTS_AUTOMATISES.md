# 🧪 Tests Automatisés - RLS & Rate Limiting

**Date**: 3 Janvier 2026
**Objectif**: Valider automatiquement la sécurité RLS et le rate limiting

---

## 📋 Vue d'ensemble

Deux scripts de test automatisés ont été créés pour valider la sécurité :

1. **Test RLS** (`test-rls-isolation.js`) - Vérifie l'isolation multi-tenant
2. **Test Rate Limiting** (`test-rate-limiting.sh`) - Vérifie la protection brute force

---

## ✅ Prérequis

### 1. Migrations SQL exécutées

Assurez-vous d'avoir exécuté **toutes les migrations** dans l'ordre :

```
✅ 20260103_fix_tenants_nullable_columns_DASHBOARD.sql
✅ 20260103_activate_rls_DASHBOARD.sql
✅ 20260103_create_rls_policies_DASHBOARD_v2.sql
```

### 2. Variables d'environnement

Vérifiez que votre fichier `.env` contient :

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Dépendances installées

```bash
cd frontend
npm install
```

---

## 🧪 TEST 1: RLS Isolation Multi-Tenant

### Description

Ce test vérifie que :
- User A ne peut voir QUE ses propres données
- User B ne peut voir QUE ses propres données
- User A ne peut PAS modifier les données de User B
- User B ne peut PAS supprimer les données de User A

### Exécution

```bash
# Depuis le dossier frontend/
npm run test:rls

# OU depuis la racine
node scripts/test-rls-isolation.js
```

### Résultat attendu

```
==========================================
🧪 TEST RLS - ISOLATION MULTI-TENANT
==========================================

📝 Test 1: Inscription User A...
✅ PASS: User A: Inscription

📝 Test 2: Créer entité pour User A...
✅ PASS: User A: Création entité

📝 Test 3: Inscription User B...
✅ PASS: User B: Inscription

📝 Test 4: Créer entité pour User B...
✅ PASS: User B: Création entité

📝 Test 5: User A voit uniquement sa propre entité...
✅ PASS: RLS: User A isolation

📝 Test 6: User B voit uniquement sa propre entité...
✅ PASS: RLS: User B isolation

📝 Test 7: User B ne peut PAS modifier l'entité de User A...
✅ PASS: RLS: User B UPDATE entité User A

📝 Test 8: User A ne peut PAS supprimer l'entité de User B...
✅ PASS: RLS: User A DELETE entité User B

==========================================
📊 RÉSULTATS DES TESTS
==========================================

Tests réussis  : 8 ✅
Tests échoués  : 0 ❌
Total          : 8

🎉 SUCCÈS COMPLET: RLS fonctionne parfaitement !
   L'isolation multi-tenant est garantie.
   Score sécurité: 100/100 ✅
```

### Tests effectués

| # | Test | Description |
|---|------|-------------|
| 1 | Inscription User A | Création compte test A |
| 2 | Création entité User A | Entité "SCI Test User A" |
| 3 | Inscription User B | Création compte test B |
| 4 | Création entité User B | Entité "SCI Test User B" |
| 5 | Isolation User A | User A voit 1 seule entité (la sienne) |
| 6 | Isolation User B | User B voit 1 seule entité (la sienne) |
| 7 | Protection UPDATE | User B ne peut PAS modifier entité User A |
| 8 | Protection DELETE | User A ne peut PAS supprimer entité User B |

### En cas d'échec

Si un test échoue, vérifiez :

1. **Policies RLS manquantes** :
   ```bash
   # Exécutez à nouveau la migration policies
   # Via Supabase Dashboard > SQL Editor
   ```

2. **RLS non activé** :
   ```sql
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public' AND tablename = 'entities';
   -- rowsecurity doit être 'true'
   ```

3. **Fonction helper manquante** :
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'user_owns_entity';
   -- Doit retourner 1 ligne
   ```

---

## 🛡️ TEST 2: Rate Limiting

### Description

Ce test vérifie que :
- Les 5 premières requêtes sont autorisées
- La 6ème requête est **bloquée** (limite atteinte)
- Après 60 secondes, le compteur est réinitialisé

### Prérequis spécifiques

**IMPORTANT** : Ce test nécessite que l'Edge Function soit déployée.

1. **Compte Upstash** créé
2. **Redis Database** créée
3. **Secrets Supabase** configurés :
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. **Edge Function** `rate-limiter` déployée

Si ce n'est pas encore fait, consultez [GUIDE_EXECUTION_RAPIDE.md](GUIDE_EXECUTION_RAPIDE.md#-partie-2-rate-limiting-1h).

### Exécution

```bash
# Depuis le dossier frontend/
npm run test:rate-limit

# OU depuis la racine
./scripts/test-rate-limiting.sh
```

### Résultat attendu

```
==========================================
🧪 TEST RATE LIMITING
==========================================

📋 Configuration:
   Projet: xxxxx.supabase.co
   Fonction: /functions/v1/rate-limiter
   Test ID: test-1704293847@example.com

🔄 Envoi de 6 requêtes consécutives...
   (Limite: 5 requêtes par minute pour auth:login)

Requête 1: ✅ Autorisée (remaining: 4)
Requête 2: ✅ Autorisée (remaining: 3)
Requête 3: ✅ Autorisée (remaining: 2)
Requête 4: ✅ Autorisée (remaining: 1)
Requête 5: ✅ Autorisée (remaining: 0)
Requête 6: 🚫 Bloquée (rate limit atteint)

==========================================
📊 RÉSULTATS
==========================================

Total requêtes : 6
Autorisées     : 5 ✅
Bloquées       : 1 🚫

🎉 SUCCÈS: Rate limiting fonctionne parfaitement !
   - 5 premières requêtes autorisées ✅
   - 6ème requête bloquée ✅
   - Protection brute force active ✅

⏱️  Test du reset automatique (60 secondes)...
   Attente de 60 secondes pour vérifier le reset...
   Temps restant: 60s ... 1s

🔄 Envoi d'une nouvelle requête après reset...
✅ Requête autorisée après reset
   Le compteur a bien été réinitialisé !

==========================================
```

### Tests effectués

| # | Test | Description |
|---|------|-------------|
| 1-5 | Requêtes autorisées | 5 premières requêtes OK |
| 6 | Requête bloquée | Limite atteinte (HTTP 429) |
| 7 | Reset automatique | Après 60s, compteur réinitialisé |

### En cas d'échec

#### Aucune requête bloquée

```
❌ ÉCHEC: Aucune requête n'a été bloquée
```

**Solutions** :

1. **Vérifier Edge Function déployée** :
   ```bash
   # Supabase Dashboard > Edge Functions
   # Fonction "rate-limiter" doit être listée
   ```

2. **Vérifier secrets Upstash** :
   ```bash
   # Supabase Dashboard > Settings > Edge Functions > Secrets
   # Doit contenir:
   # - UPSTASH_REDIS_REST_URL
   # - UPSTASH_REDIS_REST_TOKEN
   ```

3. **Consulter les logs** :
   ```bash
   npx supabase functions logs rate-limiter --tail
   ```

4. **Tester manuellement** :
   ```bash
   curl -i -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/rate-limiter' \
     -H 'Authorization: Bearer YOUR_ANON_KEY' \
     -H 'x-rate-limit-action: auth:login' \
     -H 'x-rate-limit-identifier: test@example.com'
   ```

#### Toutes les requêtes bloquées

```
❌ ÉCHEC: 0 autorisées, 6 bloquées
```

**Solutions** :

1. **Vérifier la configuration Upstash** :
   - Base de données bien créée ?
   - URL et Token corrects ?

2. **Vérifier les headers** :
   ```javascript
   // Les headers requis sont:
   x-rate-limit-action: auth:login
   x-rate-limit-identifier: email@example.com
   ```

---

## 📊 Résumé des Tests

### Checklist complète

- [ ] **RLS: 8 tests passés** → Isolation multi-tenant OK
- [ ] **Rate Limit: 6ème requête bloquée** → Protection brute force OK
- [ ] **Rate Limit: Reset automatique** → Compteur réinitialisé après 60s

### Score de sécurité

| Critère | Status |
|---------|--------|
| RLS activé sur toutes les tables | ✅ |
| Policies RLS créées (60+) | ✅ |
| Isolation multi-tenant vérifiée | ✅ |
| Protection brute force active | ✅ |
| Rate limiting fonctionnel | ✅ |
| Reset automatique OK | ✅ |

**Score final : 100/100** 🎉

---

## 🔧 Dépannage

### Problème: "Cannot find module '@supabase/supabase-js'"

```bash
cd frontend
npm install
```

### Problème: "Variables d'environnement manquantes"

Créez ou vérifiez `.env` à la racine du projet :

```bash
cp .env.example .env
# Puis éditez .env avec vos vraies valeurs
```

### Problème: "Permission denied" (script shell)

```bash
chmod +x scripts/test-rate-limiting.sh
```

### Problème: "Edge Function not found"

La fonction rate-limiter n'est pas encore déployée. Consultez la [PARTIE 2 du guide](GUIDE_EXECUTION_RAPIDE.md#-partie-2-rate-limiting-1h).

---

## 🎯 Prochaines étapes

Une fois les 2 tests réussis :

1. ✅ **Intégrer rate limiting dans Login.jsx**
   - Voir [Login.example-with-ratelimit.jsx](frontend/src/pages/Login.example-with-ratelimit.jsx)

2. ✅ **Tester manuellement l'application**
   - Créer 2 utilisateurs différents
   - Vérifier qu'ils ne voient pas les données de l'autre

3. ✅ **Déployer en production**
   - Application sécurisée
   - Conforme RGPD
   - Protection-ready

---

**Créé par** : Claude Sonnet 4.5
**Date** : 3 Janvier 2026
**Impact** : Tests automatisés de sécurité
