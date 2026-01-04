# 🚀 Déploiement Manuel Rate Limiting

**Durée estimée**: 1 heure
**Impact**: Protection brute force, DDoS, abus

---

## 📋 Prérequis

- Compte Supabase (déjà fait)
- Compte Upstash (gratuit - à créer)
- Accès Dashboard Supabase

---

## Étape 1: Créer un Compte Upstash Redis (GRATUIT)

### 1.1 Inscription

1. Aller sur [https://upstash.com](https://upstash.com)
2. Cliquer sur **Sign Up** ou **Get Started**
3. Se connecter avec **GitHub** (recommandé) ou email
4. Confirmer l'email si nécessaire

### 1.2 Créer une Base Redis

1. Une fois connecté, cliquer sur **Create Database**
2. Configuration:
   - **Name**: `gestion-locative-ratelimit`
   - **Type**: **Global** (multi-région, gratuit)
   - **Primary Region**: **Europe (Ireland)** `eu-west-1`
   - **Read Regions**: (laisser vide ou ajouter Paris si disponible)
   - **Eviction**: **No eviction** (important !)
   - **TLS**: Enabled (par défaut)

3. Cliquer sur **Create**

### 1.3 Récupérer les Credentials REST API

1. Après création, vous êtes redirigé vers la page de la base
2. Cliquer sur l'onglet **REST API** (en haut)
3. Copier les 2 valeurs suivantes:

   ```
   UPSTASH_REDIS_REST_URL
   https://us1-xxx-xxx.upstash.io

   UPSTASH_REDIS_REST_TOKEN
   AXXXxxxx_long_token_here_xxxx
   ```

4. **IMPORTANT**: Garder ces valeurs pour l'étape 2

---

## Étape 2: Configurer les Secrets Supabase

### 2.1 Accéder aux Settings

1. Aller sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionner votre projet: **gestion-locative**
3. Dans le menu latéral, cliquer sur **Settings** (icône engrenage)
4. Cliquer sur **Edge Functions** dans le sous-menu

### 2.2 Ajouter les Secrets

1. Dans la section **Secrets**, cliquer sur **Add secret**

2. **Premier secret**:
   - Name: `UPSTASH_REDIS_REST_URL`
   - Value: (coller l'URL copiée depuis Upstash)
   - Exemple: `https://us1-xxx-xxx.upstash.io`
   - Cliquer sur **Save**

3. **Second secret**:
   - Name: `UPSTASH_REDIS_REST_TOKEN`
   - Value: (coller le token copié depuis Upstash)
   - Exemple: `AXXXxxxx_long_token_here_xxxx`
   - Cliquer sur **Save**

4. **Vérifier**: Vous devriez voir 2 secrets dans la liste

---

## Étape 3: Déployer l'Edge Function

### Méthode A: Via Supabase Dashboard (RECOMMANDÉ)

1. Dans le menu latéral, cliquer sur **Edge Functions**
2. Cliquer sur **Deploy new function** (ou **Create a new function**)

3. **Configuration**:
   - Function name: `rate-limiter`
   - Template: **Blank function** (vide)

4. **Code**: Copier-coller le contenu complet du fichier:
   ```
   supabase/functions/rate-limiter/index.ts
   ```

5. Cliquer sur **Deploy**

6. **Attendre** ~30 secondes (déploiement en cours)

7. **Vérifier**: La fonction apparaît dans la liste avec un point vert ✅

---

### Méthode B: Via CLI (Alternative)

**Si vous préférez utiliser la CLI**:

```bash
# 1. Installer Supabase CLI globalement
npm install -g supabase

# 2. Login
npx supabase login

# 3. Lier le projet (remplacer YOUR_PROJECT_ID)
npx supabase link --project-ref YOUR_PROJECT_ID

# 4. Configurer les secrets
npx supabase secrets set UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
npx supabase secrets set UPSTASH_REDIS_REST_TOKEN=AXXXxxxx

# 5. Déployer la fonction
npx supabase functions deploy rate-limiter

# 6. Vérifier
npx supabase functions list
```

---

## Étape 4: Tester la Fonction

### 4.1 Récupérer les Credentials

1. Aller sur Supabase Dashboard → **Settings** → **API**
2. Copier:
   - **Project URL**: `https://hbacqcyspfylrlwgpbfp.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 4.2 Test avec cURL (Terminal)

```bash
# Remplacer YOUR_PROJECT_URL et YOUR_ANON_KEY
curl -i --location --request POST 'https://YOUR_PROJECT_URL/functions/v1/rate-limiter' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'x-rate-limit-action: auth:login' \
  --header 'x-rate-limit-identifier: test@example.com'
```

**Résultat attendu** (200 OK):
```json
{
  "allowed": true,
  "remaining": 4,
  "resetAt": 1704297600000
}
```

**Headers de réponse attendus**:
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 2024-01-03T10:00:00.000Z
```

### 4.3 Test de Limite (6 requêtes)

```bash
# Script bash pour tester 6 fois
for i in {1..6}; do
  echo "Requête $i:"
  curl -s -X POST 'https://YOUR_PROJECT_URL/functions/v1/rate-limiter' \
    -H 'Authorization: Bearer YOUR_ANON_KEY' \
    -H 'x-rate-limit-action: auth:login' \
    -H 'x-rate-limit-identifier: test@example.com' | jq '.allowed, .remaining'
  sleep 1
done
```

**Résultat attendu**:
```
Requête 1: true, 4
Requête 2: true, 3
Requête 3: true, 2
Requête 4: true, 1
Requête 5: true, 0
Requête 6: false, 0  ✅ BLOQUÉ
```

### 4.4 Test via Supabase Dashboard

1. Aller sur **Edge Functions** → `rate-limiter`
2. Cliquer sur **Invoke Function**
3. Headers:
   ```json
   {
     "x-rate-limit-action": "auth:login",
     "x-rate-limit-identifier": "test@example.com"
   }
   ```
4. Cliquer sur **Invoke**
5. Vérifier la réponse JSON

---

## Étape 5: Intégrer dans Login.jsx

### 5.1 Copier le Wrapper

Le fichier `frontend/src/utils/rateLimiter.js` est déjà créé ✅

Vérifier qu'il existe:
```bash
ls -la frontend/src/utils/rateLimiter.js
```

### 5.2 Modifier Login.jsx

**Ouvrir** `frontend/src/pages/Login.jsx`

**Ajouter l'import** (ligne 4):
```javascript
import { checkRateLimitDetailed, formatRetryTime } from '../utils/rateLimiter'
```

**Ajouter state** (ligne 10):
```javascript
const [rateLimitError, setRateLimitError] = useState(null)
```

**Modifier handleLogin** (ligne 13):
```javascript
const handleLogin = async (e) => {
  e.preventDefault()
  setLoading(true)
  setError(null)
  setRateLimitError(null) // ✅ AJOUT

  try {
    // ✅ AJOUT: Vérifier le rate limit AVANT la connexion
    const rateLimitResult = await checkRateLimitDetailed('auth:login', email)

    if (!rateLimitResult.allowed) {
      setRateLimitError(
        `${rateLimitResult.message} Réessayez ${formatRetryTime(rateLimitResult.resetAt)}.`
      )
      setLoading(false)
      return
    }

    // Connexion (code existant)
    await signIn(email, password)
    navigate('/dashboard')
  } catch (error) {
    setError(error.message)
    setLoading(false)
  }
}
```

**Afficher l'erreur** (après ligne 33):
```jsx
{rateLimitError && (
  <div className="bg-orange-100 border border-orange-400 text-orange-700 p-3 rounded mb-4 flex items-start">
    <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
    <div>
      <p className="font-semibold">Trop de tentatives</p>
      <p className="text-sm">{rateLimitError}</p>
    </div>
  </div>
)}
```

**Référence complète**: Voir `frontend/src/pages/Login.example-with-ratelimit.jsx`

---

## Étape 6: Tests Manuels Application

### Test 1: Login avec Rate Limit

1. Ouvrir l'application: `npm run dev`
2. Aller sur `/login`
3. Essayer de se connecter 6 fois de suite (avec mauvais mot de passe)

**Résultat attendu**:
- Tentatives 1-5: Erreur "Invalid credentials" ✅
- Tentative 6: Message orange "Trop de tentatives. Réessayez dans 1 minute." ✅
- Bouton "Se connecter" toujours cliquable mais ne fait rien ✅

### Test 2: Reset Automatique

1. Après avoir été bloqué (6ème tentative)
2. Attendre **61 secondes**
3. Réessayer de se connecter

**Résultat attendu**:
- Connexion fonctionne à nouveau ✅
- Compteur reset à 0 ✅

### Test 3: Isolation par Email

1. Se faire bloquer avec `test1@example.com` (6 tentatives)
2. Essayer avec `test2@example.com`

**Résultat attendu**:
- `test2@example.com` peut se connecter normalement ✅
- Chaque email a son propre compteur ✅

---

## Étape 7: Intégrations Additionnelles (Optionnel)

### PublicCandidateForm.jsx

**Ajouter dans `handleSubmit`**:
```javascript
// Avant la soumission
const allowed = await checkRateLimit('public:candidate', 'client-ip')
if (!allowed) {
  toast.error('Trop de candidatures soumises. Réessayez dans 1 heure.')
  return
}
```

### Upload Fichiers

**Ajouter dans `handleFileUpload`**:
```javascript
const allowed = await rateLimitGuard('upload:file')
if (!allowed) {
  toast.warning('Trop d\'uploads. Ralentissez un peu.')
  return
}
```

### Génération PDF (Quittances)

**Ajouter dans `generateReceipt`**:
```javascript
const allowed = await rateLimitGuard('pdf:generate')
if (!allowed) {
  toast.warning('Génération trop rapide. Attendez quelques secondes.')
  return
}
```

---

## 📊 Monitoring

### Dashboard Upstash

1. Aller sur [https://console.upstash.com](https://console.upstash.com)
2. Sélectionner votre base Redis
3. Onglet **Metrics**:
   - Requêtes par seconde
   - Latence moyenne
   - Utilisation stockage
   - Quota gratuit restant (10K req/jour)

**Alertes à surveiller**:
- Requêtes/seconde > 10 → Possible attaque
- Taux d'erreur 429 > 10% → Ajuster limites
- Quota > 90% → Passer à un plan payant

### Logs Supabase

1. Aller sur Supabase Dashboard → **Edge Functions**
2. Cliquer sur `rate-limiter`
3. Onglet **Logs**:
   - Voir toutes les invocations
   - Erreurs éventuelles
   - Temps d'exécution

**Via CLI**:
```bash
npx supabase functions logs rate-limiter --tail
```

---

## 🔥 Troubleshooting

### Erreur: "Missing Upstash credentials"

**Cause**: Secrets non configurés

**Solution**:
1. Vérifier les secrets dans Dashboard → Settings → Edge Functions → Secrets
2. Re-déployer la fonction si nécessaire

---

### Erreur: "CORS error" dans le navigateur

**Cause**: Headers CORS mal configurés

**Solution**:
La fonction retourne déjà les bons headers CORS. Vérifier que:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-rate-limit-action, x-rate-limit-identifier',
}
```

---

### Rate limit toujours "allowed: true"

**Cause**: Redis ne se connecte pas

**Debug**:
1. Tester Redis directement:
   ```bash
   curl https://YOUR_UPSTASH_URL/get/test \
     -H "Authorization: Bearer YOUR_UPSTASH_TOKEN"
   ```
2. Vérifier les logs Edge Function
3. Vérifier que les secrets sont bien configurés

---

### Fonction ne se déploie pas

**Cause**: Erreur TypeScript ou timeout

**Solution**:
1. Vérifier la syntaxe dans `index.ts`
2. Augmenter le timeout (Settings → Edge Functions)
3. Regarder les logs de déploiement

---

## 📋 Checklist Post-Déploiement

- [ ] Compte Upstash créé
- [ ] Base Redis créée (type Global)
- [ ] Credentials REST copiés
- [ ] Secrets Supabase configurés (URL + Token)
- [ ] Edge Function déployée avec succès
- [ ] Test cURL: 1ère requête retourne `allowed: true`
- [ ] Test cURL: 6ème requête retourne `allowed: false` (429)
- [ ] Login.jsx modifié et testé
- [ ] Message orange s'affiche après 6 tentatives
- [ ] Reset automatique après 60 secondes fonctionne
- [ ] Pas d'erreur CORS dans la console navigateur
- [ ] Logs Upstash montrent les requêtes

---

## 🎯 Résultat Attendu

**Avant Rate Limiting**:
- Protection brute force: Aucune ❌
- Protection DDoS: Aucune ❌
- Limite uploads: Aucune ❌

**Après Rate Limiting**:
- Protection brute force: 5 tentatives/minute ✅
- Protection DDoS: 100 req/min/user ✅
- Limite uploads: 10 fichiers/minute ✅
- Limite PDF: 50 générations/minute ✅
- Limite candidatures publiques: 5/heure ✅

---

## 💰 Coûts

**Plan Gratuit Upstash**:
- ✅ 10 000 requêtes/jour
- ✅ 256 MB stockage
- ✅ Global replication
- ✅ TLS encryption
- ✅ 99.99% uptime

**Estimation usage quotidien**:
- Login checks: 500 req
- API general: 2000 req
- Uploads: 100 req
- PDF: 300 req
- Candidatures: 50 req
- **Total**: ~3000 req/jour (30% du quota) ✅

**Si dépassement** (peu probable):
- Plan Pay-as-you-go: 0.2$ / 100K req
- Exemple: 50K req/jour = 3$/mois

---

## 📞 Support

**Documentation**:
- Upstash: https://upstash.com/docs/redis
- Supabase Edge Functions: https://supabase.com/docs/guides/functions

**Si problème**:
1. Vérifier les logs Upstash
2. Vérifier les logs Supabase Edge Function
3. Tester avec cURL directement
4. Vérifier les secrets (URL + Token)

---

*Dernière mise à jour: 3 Janvier 2026*
*Référence: GUIDE_RATE_LIMITING.md*
