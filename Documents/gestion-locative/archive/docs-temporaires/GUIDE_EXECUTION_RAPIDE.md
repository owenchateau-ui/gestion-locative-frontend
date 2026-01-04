# ⚡ Guide d'Exécution Rapide - Phase 1 Sécurité

**Durée totale**: 1h30
**Impact**: CRITIQUE - Sécurité production-ready

---

## 🎯 Vue d'Ensemble

Vous allez exécuter 2 tâches critiques dans l'ordre:

1. **RLS Supabase** (30 min) - Isolation multi-tenant
2. **Rate Limiting** (1h) - Protection brute force

---

## 📋 Checklist Préalable

- [ ] Compte Supabase actif
- [ ] Accès Dashboard Supabase
- [ ] Navigateur moderne (Chrome/Firefox/Safari)
- [ ] 1h30 de temps disponible
- [ ] **IMPORTANT**: Faire un backup BDD (recommandé)

---

## 🔐 PARTIE 1: RLS Supabase (30 min)

### Étape 1: SQL Editor Supabase

1. **Accéder au SQL Editor**:
   - Aller sur https://supabase.com/dashboard
   - Projet: **gestion-locative**
   - Menu latéral → **SQL Editor**

2. **⚠️ IMPORTANT: Corriger colonnes NULLABLE (SÉCURITÉ CRITIQUE)**:
   - Cliquer sur **New Query**
   - Copier-coller le fichier complet:
     ```
     supabase/migrations/20260103_fix_tenants_nullable_columns_DASHBOARD.sql
     ```
   - Cliquer sur **Run** (Cmd+Enter)
   - ✅ Vérifier: "🎉 SUCCÈS: Toutes les colonnes sont NOT NULL !"

3. **Exécuter Migration 2 - Activation RLS**:
   - **New Query**
   - Copier-coller le fichier complet:
     ```
     supabase/migrations/20260103_activate_rls_DASHBOARD.sql
     ```
   - **Run**
   - ✅ Vérifier: "🎉 SUCCÈS: RLS activé sur TOUTES les tables !"

4. **Exécuter Migration 3 - Policies** (IMMÉDIATEMENT APRÈS):
   - **New Query**
   - Copier-coller le fichier complet:
     ```
     supabase/migrations/20260103_create_rls_policies_DASHBOARD_v2.sql
     ```
   - **Run**
   - ✅ Vérifier: "🎉 PARFAIT! RLS est complètement configuré."

5. **Vérification avec Diagnostic**:
   - **New Query**
   - Copier-coller:
     ```
     supabase/migrations/DIAGNOSTIC_RLS_COMPLET_DASHBOARD.sql
     ```
   - **Run**
   - ✅ Objectif: **Score 100/100**

### Test Rapide (5 min)

Créer 2 utilisateurs et vérifier l'isolation:

1. User A: Se connecter, créer une entité
2. User B: Se connecter, créer une entité
3. Vérifier que User B ne voit AUCUNE donnée de User A

✅ **RLS TERMINÉ** - Passez à la Partie 2

---

## 🛡️ PARTIE 2: Rate Limiting (1h)

### Étape 1: Créer Compte Upstash (10 min)

1. Aller sur https://upstash.com
2. **Sign Up** avec GitHub
3. **Create Database**:
   - Name: `gestion-locative-ratelimit`
   - Type: **Global**
   - Region: **Europe (Ireland)**
   - Eviction: **No eviction**
   - Cliquer **Create**

4. **Copier Credentials** (onglet REST API):
   ```
   UPSTASH_REDIS_REST_URL
   https://xxx.upstash.io

   UPSTASH_REDIS_REST_TOKEN
   AXXXxxxx...
   ```

### Étape 2: Configurer Supabase (5 min)

1. Supabase Dashboard → **Settings** → **Edge Functions**
2. Section **Secrets** → **Add secret**

3. Ajouter 2 secrets:
   - `UPSTASH_REDIS_REST_URL` = (votre URL)
   - `UPSTASH_REDIS_REST_TOKEN` = (votre token)

### Étape 3: Déployer Edge Function (15 min)

1. Menu **Edge Functions** → **Deploy new function**
2. Name: `rate-limiter`
3. Code: Copier-coller le fichier complet:
   ```
   supabase/functions/rate-limiter/index.ts
   ```
4. **Deploy**
5. Attendre 30 secondes

### Étape 4: Test cURL (10 min)

```bash
# Remplacer YOUR_PROJECT_URL et YOUR_ANON_KEY
# (Dashboard → Settings → API)

# Test 1: Première requête (devrait réussir)
curl -i -X POST 'https://YOUR_PROJECT_URL/functions/v1/rate-limiter' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'x-rate-limit-action: auth:login' \
  -H 'x-rate-limit-identifier: test@example.com'

# Résultat attendu: {"allowed":true,"remaining":4}
```

**Test blocage** (6 requêtes):
```bash
for i in {1..6}; do
  echo "Requête $i:"
  curl -s -X POST 'https://YOUR_PROJECT_URL/functions/v1/rate-limiter' \
    -H 'Authorization: Bearer YOUR_ANON_KEY' \
    -H 'x-rate-limit-action: auth:login' \
    -H 'x-rate-limit-identifier: test@example.com' | grep allowed
  sleep 1
done
```

Résultat attendu:
- Requêtes 1-5: `"allowed":true`
- Requête 6: `"allowed":false` ✅ BLOQUÉ

### Étape 5: Intégrer dans Login.jsx (20 min)

**Fichier**: `frontend/src/pages/Login.jsx`

**Modifications**:

1. **Import** (ligne 4):
```javascript
import { checkRateLimitDetailed, formatRetryTime } from '../utils/rateLimiter'
```

2. **State** (ligne 10):
```javascript
const [rateLimitError, setRateLimitError] = useState(null)
```

3. **handleLogin** (ligne 13):
```javascript
const handleLogin = async (e) => {
  e.preventDefault()
  setLoading(true)
  setError(null)
  setRateLimitError(null) // ✅ NOUVEAU

  try {
    // ✅ NOUVEAU: Rate limit check
    const result = await checkRateLimitDetailed('auth:login', email)
    if (!result.allowed) {
      setRateLimitError(`${result.message} Réessayez ${formatRetryTime(result.resetAt)}.`)
      setLoading(false)
      return
    }

    // Code existant
    await signIn(email, password)
    navigate('/dashboard')
  } catch (error) {
    setError(error.message)
    setLoading(false)
  }
}
```

4. **Affichage erreur** (après ligne 33, avant le formulaire):
```jsx
{rateLimitError && (
  <div className="bg-orange-100 border border-orange-400 text-orange-700 p-3 rounded mb-4 flex items-start">
    <svg className="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
    <div>
      <p className="font-semibold">Trop de tentatives</p>
      <p className="text-sm">{rateLimitError}</p>
    </div>
  </div>
)}
```

**Référence complète**: Voir `Login.example-with-ratelimit.jsx`

### Étape 6: Test Application (10 min)

1. Lancer l'app: `npm run dev`
2. Aller sur `/login`
3. Essayer 6 connexions avec mauvais mot de passe

**Résultat attendu**:
- Tentatives 1-5: Message "Invalid credentials"
- Tentative 6: Message orange "Trop de tentatives. Réessayez dans 1 minute." ✅

✅ **RATE LIMITING TERMINÉ**

---

## ✅ Checklist Finale

### RLS Supabase
- [ ] Migration activation exécutée sans erreur
- [ ] Migration policies exécutée sans erreur
- [ ] Diagnostic affiche score 100/100
- [ ] Test isolation: User B ne voit pas données User A
- [ ] Application fonctionne normalement

### Rate Limiting
- [ ] Compte Upstash créé
- [ ] Base Redis créée (Global, Europe)
- [ ] Secrets Supabase configurés (2 secrets)
- [ ] Edge Function déployée avec succès
- [ ] Test cURL: 6ème requête bloquée (429)
- [ ] Login.jsx modifié
- [ ] Test app: Message orange après 6 tentatives
- [ ] Reset automatique après 60s fonctionne

---

## 🎯 Résultats Attendus

| Métrique | Avant | Après |
|----------|-------|-------|
| **Score sécurité RLS** | 0/100 ❌ | 100/100 ✅ |
| **Protection brute force** | Aucune ❌ | 5 tent./min ✅ |
| **Isolation multi-tenant** | Non ❌ | Oui ✅ |
| **Protection DDoS** | Non ❌ | 100 req/min ✅ |
| **Conformité RGPD** | Non ❌ | Oui ✅ |

---

## 🔥 En Cas de Problème

### RLS: "permission denied for table"

**Cause**: Policies manquantes

**Solution**: Exécuter à nouveau `20260103_create_rls_policies.sql`

---

### Rate Limit: "Missing Upstash credentials"

**Cause**: Secrets non configurés

**Solution**:
1. Vérifier Settings → Edge Functions → Secrets
2. Re-déployer la fonction

---

### Application ne fonctionne plus

**Cause**: RLS activé sans policies

**Solution**: Exécuter IMMÉDIATEMENT `20260103_create_rls_policies.sql`

---

## 📚 Documentation Complète

Pour plus de détails:

- **RLS**: Voir `EXECUTION_MANUELLE_RLS.md`
- **Rate Limiting**: Voir `EXECUTION_MANUELLE_RATE_LIMITING.md`
- **Guide complet**: Voir `PHASE1_STABILISATION_RESUME.md`

---

## 🎉 Félicitations !

Une fois les 2 checklists validées, votre application est:

✅ **Sécurisée** (RLS + Rate Limiting)
✅ **Conforme RGPD** (Isolation données)
✅ **Protégée** (Brute force, DDoS, abus)
✅ **Production-ready** (Niveau sécurité)

**Prochaine étape**: Performance React + Tests complets

---

*Durée totale: 1h30*
*Date: 3 Janvier 2026*
*Par: Claude Sonnet 4.5*
