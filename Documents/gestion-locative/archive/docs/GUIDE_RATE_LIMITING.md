# 🛡️ Guide Rate Limiting

## 🎯 Objectif

Protéger l'application contre les abus et attaques:
- ✅ **Brute force** sur login (5 tentatives/minute)
- ✅ **Spam API** (100 requêtes/minute/user)
- ✅ **Abus upload** (10 fichiers/minute)
- ✅ **Spam candidatures** (5 candidatures/heure par IP)
- ✅ **Abus génération PDF** (50 PDFs/minute)

## 📦 Stack Technique

| Composant | Technologie | Pourquoi |
|-----------|------------|----------|
| **Backend** | Supabase Edge Function | Serverless, déjà utilisé |
| **Cache** | Upstash Redis | Gratuit (10K req/jour), rapide, REST API |
| **Frontend** | Wrapper JS | Intégration simple |

---

## 🚀 Installation

### Étape 1: Créer un compte Upstash (GRATUIT)

1. Aller sur [https://upstash.com/](https://upstash.com/)
2. Créer un compte (GitHub OAuth ou email)
3. Créer une base Redis:
   - Nom: `gestion-locative-ratelimit`
   - Type: **Global** (multi-région)
   - Region: **Europe (Ireland)** ou proche de vos users
   - Eviction: **No eviction** (on gère le TTL nous-mêmes)

4. Copier les credentials REST API:
   ```
   UPSTASH_REDIS_REST_URL=https://xxx-xxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN=AXXXxxxx...
   ```

### Étape 2: Configurer Supabase Edge Function

1. **Installer Supabase CLI** (si pas déjà fait):
```bash
npm install -g supabase
```

2. **Login Supabase**:
```bash
npx supabase login
```

3. **Lier le projet**:
```bash
npx supabase link --project-ref YOUR_PROJECT_ID
```

4. **Ajouter les variables d'environnement**:
```bash
npx supabase secrets set UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
npx supabase secrets set UPSTASH_REDIS_REST_TOKEN=AXXXxxxx...
```

5. **Déployer la fonction**:
```bash
npx supabase functions deploy rate-limiter
```

6. **Vérifier le déploiement**:
```bash
npx supabase functions list
```

Vous devriez voir:
```
rate-limiter | https://xxx.supabase.co/functions/v1/rate-limiter
```

### Étape 3: Tester la fonction

```bash
curl -i --location --request POST 'https://YOUR_PROJECT.supabase.co/functions/v1/rate-limiter' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'x-rate-limit-action: auth:login' \
  --header 'x-rate-limit-identifier: test@example.com'
```

Résultat attendu (200 OK):
```json
{
  "allowed": true,
  "remaining": 4,
  "resetAt": 1704297600000
}
```

Après 5 appels, vous obtiendrez (429 Too Many Requests):
```json
{
  "error": "Rate limit exceeded",
  "message": "Trop de tentatives de connexion. Réessayez dans 1 minute.",
  "retryAfter": 53
}
```

---

## 🔧 Intégration Frontend

### Exemple 1: Login avec Rate Limiting

```jsx
import { checkRateLimitDetailed, formatRetryTime } from '../utils/rateLimiter'

const handleLogin = async (e) => {
  e.preventDefault()
  setLoading(true)
  setError(null)

  try {
    // ✅ Vérifier le rate limit AVANT la tentative
    const result = await checkRateLimitDetailed('auth:login', email)

    if (!result.allowed) {
      setError(`${result.message} Réessayez ${formatRetryTime(result.resetAt)}.`)
      setLoading(false)
      return
    }

    // Connexion
    await signIn(email, password)
    navigate('/dashboard')
  } catch (error) {
    setError(error.message)
    setLoading(false)
  }
}
```

### Exemple 2: Upload de fichiers

```jsx
import { checkRateLimit } from '../utils/rateLimiter'

const handleFileUpload = async (file) => {
  // Vérifier le rate limit (simple)
  const allowed = await checkRateLimit('upload:file', user.id)

  if (!allowed) {
    toast.error('Trop d\'uploads. Ralentissez un peu.')
    return
  }

  // Upload
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(fileName, file)

  if (error) throw error
  toast.success('Fichier uploadé avec succès')
}
```

### Exemple 3: Génération PDF (quittance)

```jsx
import { rateLimitGuard } from '../utils/rateLimiter'

const generateReceipt = async (paymentId) => {
  // Wrapper complet avec auto-identification
  const allowed = await rateLimitGuard('pdf:generate')

  if (!allowed) {
    toast.warning('Génération trop rapide. Attendez quelques secondes.')
    return
  }

  // Générer le PDF
  const pdf = await generatePDF(paymentId)
  downloadPDF(pdf)
}
```

### Exemple 4: Candidature publique (sans auth)

```jsx
import { checkRateLimit } from '../utils/rateLimiter'

const submitCandidature = async (formData) => {
  // Utiliser l'IP comme identifiant (public)
  const clientIP = 'client-ip-placeholder' // En prod, obtenu via header

  const allowed = await checkRateLimit('public:candidate', clientIP)

  if (!allowed) {
    toast.error('Trop de candidatures soumises. Réessayez dans 1 heure.')
    return
  }

  // Soumettre la candidature
  const { data, error } = await supabase
    .from('candidates')
    .insert(formData)

  if (error) throw error
  toast.success('Candidature soumise avec succès')
}
```

---

## ⚙️ Configuration des Limites

Les limites sont définies dans `supabase/functions/rate-limiter/index.ts`:

```typescript
const RATE_LIMITS = {
  'auth:login': {
    maxRequests: 5,
    windowSeconds: 60, // 5 tentatives par minute
    message: 'Trop de tentatives de connexion. Réessayez dans 1 minute.',
  },
  'auth:register': {
    maxRequests: 3,
    windowSeconds: 3600, // 3 inscriptions par heure
    message: 'Trop d\'inscriptions. Réessayez dans 1 heure.',
  },
  'api:general': {
    maxRequests: 100,
    windowSeconds: 60,
    message: 'Limite de requêtes atteinte. Ralentissez.',
  },
  'upload:file': {
    maxRequests: 10,
    windowSeconds: 60,
    message: 'Trop d\'uploads. Réessayez dans 1 minute.',
  },
  'public:candidate': {
    maxRequests: 5,
    windowSeconds: 3600, // 5 candidatures par heure
    message: 'Trop de candidatures soumises. Réessayez dans 1 heure.',
  },
  'pdf:generate': {
    maxRequests: 50,
    windowSeconds: 60,
    message: 'Trop de générations de PDF. Ralentissez.',
  },
}
```

### Modifier les limites

1. Éditer `supabase/functions/rate-limiter/index.ts`
2. Modifier les valeurs `maxRequests` et `windowSeconds`
3. Redéployer:
```bash
npx supabase functions deploy rate-limiter
```

### Ajouter une nouvelle limite

```typescript
// 1. Ajouter dans RATE_LIMITS (backend)
'export:csv': {
  maxRequests: 20,
  windowSeconds: 60,
  message: 'Trop d\'exports. Ralentissez.',
}

// 2. Ajouter dans RATE_LIMIT_CONFIG (frontend)
export const RATE_LIMIT_CONFIG = {
  // ...
  'export:csv': {
    max: 20,
    window: 60,
    label: '20 exports par minute',
  },
}

// 3. Utiliser dans le code
const allowed = await checkRateLimit('export:csv', user.id)
```

---

## 🧪 Tests

### Test 1: Limites login

```bash
# Script de test (bash)
for i in {1..7}; do
  echo "Tentative $i:"
  curl -s -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/rate-limiter' \
    -H 'Authorization: Bearer YOUR_ANON_KEY' \
    -H 'x-rate-limit-action: auth:login' \
    -H 'x-rate-limit-identifier: test@example.com' | jq '.allowed, .remaining'
  sleep 1
done
```

Résultat attendu:
```
Tentative 1: true, 4
Tentative 2: true, 3
Tentative 3: true, 2
Tentative 4: true, 1
Tentative 5: true, 0
Tentative 6: false, 0
Tentative 7: false, 0
```

### Test 2: Reset automatique

```bash
# Atteindre la limite
for i in {1..6}; do
  curl -s -X POST 'https://xxx.supabase.co/functions/v1/rate-limiter' \
    -H 'Authorization: Bearer xxx' \
    -H 'x-rate-limit-action: auth:login' \
    -H 'x-rate-limit-identifier: test2@example.com' > /dev/null
done

# Attendre 61 secondes
echo "Attente 61 secondes..."
sleep 61

# Retenter
curl -s -X POST 'https://xxx.supabase.co/functions/v1/rate-limiter' \
  -H 'Authorization: Bearer xxx' \
  -H 'x-rate-limit-action: auth:login' \
  -H 'x-rate-limit-identifier: test2@example.com' | jq '.allowed'

# Résultat: true (compteur réinitialisé)
```

### Test 3: Isolation par identifiant

```bash
# User A atteint la limite
for i in {1..6}; do
  curl -s -X POST 'https://xxx.supabase.co/functions/v1/rate-limiter' \
    -H 'Authorization: Bearer xxx' \
    -H 'x-rate-limit-action: auth:login' \
    -H 'x-rate-limit-identifier: userA@example.com' > /dev/null
done

# User B peut toujours se connecter (compteur indépendant)
curl -s -X POST 'https://xxx.supabase.co/functions/v1/rate-limiter' \
  -H 'Authorization: Bearer xxx' \
  -H 'x-rate-limit-action: auth:login' \
  -H 'x-rate-limit-identifier: userB@example.com' | jq '.allowed'

# Résultat: true
```

---

## 📊 Monitoring

### Dashboard Upstash

1. Aller sur [https://console.upstash.com/](https://console.upstash.com/)
2. Sélectionner votre base Redis
3. Onglet **Metrics** → voir:
   - Requêtes par seconde
   - Utilisation stockage
   - Latence moyenne

### Logs Supabase

```bash
# Voir les logs de la fonction
npx supabase functions logs rate-limiter --tail
```

### Métriques clés à surveiller

| Métrique | Seuil alerte | Action |
|----------|--------------|--------|
| Requêtes/seconde | > 100 | Vérifier abus, augmenter limites |
| Taux d'erreur 429 | > 10% | Ajuster limites ou identifier attaque |
| Latence | > 500ms | Vérifier Upstash, passer à un plan supérieur |

---

## 🔐 Sécurité

### Bonnes pratiques

✅ **Identifier correctement**:
- Actions authentifiées → `user.id` (UUID)
- Actions publiques → IP (via `X-Forwarded-For`)
- Login → `email` (avant authentification)

❌ **Éviter**:
- Identifiants prédictibles (compteurs séquentiels)
- Headers user-agent (facilement spoofés)
- Cookies non sécurisés

### Bypass attacks

**Attaque**: Changer d'email à chaque tentative de login
```javascript
// ❌ Vulnérable
await checkRateLimit('auth:login', email) // email change à chaque fois
```

**Solution**: Combiner plusieurs identifiants
```javascript
// ✅ Sécurisé
const identifier = `${email}:${clientIP}`
await checkRateLimit('auth:login', identifier)
```

**Attaque**: Utiliser des proxies pour changer d'IP
```javascript
// ❌ Vulnérable pour actions publiques
await checkRateLimit('public:candidate', clientIP) // IP change
```

**Solution**: Ajouter fingerprinting
```javascript
// ✅ Meilleur (utiliser fingerprint.js)
const fingerprint = await getDeviceFingerprint()
await checkRateLimit('public:candidate', fingerprint)
```

---

## 💰 Coûts

### Plan Upstash Gratuit

- **10 000 requêtes/jour** (333/heure, 5.5/minute)
- **256 MB** stockage
- **Global replication**

### Estimation usage

| Action | Requêtes/jour estimées | % du quota |
|--------|------------------------|------------|
| Login checks | 500 | 5% |
| API general | 2000 | 20% |
| Upload | 100 | 1% |
| PDF generation | 300 | 3% |
| Public candidates | 50 | 0.5% |
| **TOTAL** | **2950** | **29.5%** |

→ **Largement en dessous** du quota gratuit (10K)

### Si dépassement (peu probable)

**Plan Pay-as-you-go**:
- 0.2$ par 100K requêtes
- Ex: 50K requêtes/jour = 3$ / mois

---

## 🚀 Migration Progressive

### Phase 1: Protection critique (1h)
- ✅ Login
- ✅ Register

### Phase 2: Protection modérée (2h)
- ✅ Upload fichiers
- ✅ Génération PDF
- ✅ Candidatures publiques

### Phase 3: Protection complète (1h)
- API générale (toutes les routes)
- Exports CSV
- Envois emails

### Phase 4: Optimisations (optionnel)
- Device fingerprinting
- Whitelist IPs internes
- Limites dynamiques selon plan utilisateur

---

## 🛠️ Troubleshooting

### Erreur: "Missing Upstash credentials"

**Cause**: Variables d'environnement non définies

**Solution**:
```bash
npx supabase secrets set UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
npx supabase secrets set UPSTASH_REDIS_REST_TOKEN=AXXXxxxx
npx supabase functions deploy rate-limiter
```

### Erreur: "CORS error"

**Cause**: Headers CORS mal configurés

**Solution**: Vérifier que la fonction retourne bien:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-rate-limit-action, x-rate-limit-identifier',
}
```

### Rate limit toujours "allowed: true"

**Cause**: Redis ne se connecte pas correctement

**Debug**:
1. Tester la connexion Redis:
```bash
curl https://YOUR_UPSTASH.upstash.io/get/test \
  -H "Authorization: Bearer YOUR_TOKEN"
```

2. Vérifier les logs:
```bash
npx supabase functions logs rate-limiter
```

### Headers X-RateLimit-* manquants

**Cause**: Fonction retourne pas les headers custom

**Solution**: La fonction retourne automatiquement:
- `X-RateLimit-Limit`: Limite max
- `X-RateLimit-Remaining`: Requêtes restantes
- `X-RateLimit-Reset`: Timestamp reset
- `Retry-After`: Secondes à attendre (si 429)

---

## 📚 Ressources

- [Upstash Redis Docs](https://upstash.com/docs/redis)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Rate Limiting Best Practices](https://blog.logrocket.com/rate-limiting-node-js/)

---

*Temps d'installation: 1h*
*Temps d'intégration: 2h*
*Coût: Gratuit (plan Upstash free)*
