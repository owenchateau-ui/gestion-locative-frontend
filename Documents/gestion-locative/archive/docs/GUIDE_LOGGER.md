# 📝 Guide de Migration vers Logger

## 🎯 Objectif

Remplacer tous les `console.log` par un système de logging professionnel qui:
- ✅ Désactive les logs en production
- ✅ Permet le debugging granulaire en dev
- ✅ Prépare l'intégration Sentry
- ✅ Améliore la lisibilité des logs

## 📦 Le Logger

Fichier créé: `frontend/src/utils/logger.js`

**Méthodes disponibles**:
- `logger.debug()` - Logs très verbeux (dev + VITE_DEBUG=true uniquement)
- `logger.log()` / `logger.info()` - Logs standards (dev uniquement)
- `logger.warn()` - Warnings (toujours)
- `logger.error()` - Erreurs critiques (toujours + Sentry en prod)
- `logger.success()` - Succès (dev uniquement, coloré vert)
- `logger.time()` / `logger.timeEnd()` - Mesure de performance
- `logger.table()` - Affichage tableau

## 🔄 Migration Manuelle

### Étape 1: Exemples de remplacement

#### AVANT (console.log)
```javascript
// candidateService.js
export const uploadDocument = async (candidateId, file, docType) => {
  console.log('🔍 Adding upload promise for', docType, 'file:', file.name)

  try {
    const result = await supabase.storage.upload(fileName, file)
    console.log('Upload successful:', result)
    return result
  } catch (error) {
    console.error('Upload failed:', error)
    throw error
  }
}
```

#### APRÈS (logger)
```javascript
// candidateService.js
import { logger } from '../utils/logger'

export const uploadDocument = async (candidateId, file, docType) => {
  logger.debug('Adding upload promise', { docType, fileName: file.name })

  try {
    const result = await supabase.storage.upload(fileName, file)
    logger.success('Upload successful', { docType, fileName: file.name })
    return result
  } catch (error) {
    logger.error('Upload failed', { docType, fileName: file.name, error })
    throw error
  }
}
```

### Étape 2: Règles de conversion

| console | logger | Quand l'utiliser |
|---------|--------|------------------|
| `console.log()` | `logger.debug()` | Logs de debug très verbeux |
| `console.log()` | `logger.info()` | Logs informatifs importants |
| `console.warn()` | `logger.warn()` | Situations anormales non critiques |
| `console.error()` | `logger.error()` | Erreurs critiques |
| ❌ Pas d'équivalent | `logger.success()` | Confirmation d'opération réussie |

### Étape 3: Logger avec contexte

Pour les services, créez un logger dédié:

```javascript
// services/tenantService.js
import { createLogger } from '../utils/logger'

const log = createLogger('TenantService')

export const getTenantWithDetails = async (id) => {
  log.debug('Fetching tenant details', { id })

  try {
    const tenant = await supabase.from('tenants').select('*').eq('id', id).single()
    log.success('Tenant fetched', { id, name: tenant.name })
    return tenant
  } catch (error) {
    log.error('Failed to fetch tenant', { id, error })
    throw error
  }
}

// Output en dev:
// [2026-01-03T10:30:45.123Z] [TenantService] [DEBUG] Fetching tenant details { id: '123' }
// ✓ SUCCESS Tenant fetched { id: '123', name: 'John Doe' }
```

### Étape 4: Mesurer les performances

```javascript
// AVANT
const start = Date.now()
const tenants = await fetchTenants()
console.log('Fetch took', Date.now() - start, 'ms')

// APRÈS
logger.time('fetchTenants')
const tenants = await fetchTenants()
logger.timeEnd('fetchTenants')

// Output: fetchTenants: 234ms
```

### Étape 5: Logger des tableaux

```javascript
// AVANT
console.log('Tenants:', tenants)

// APRÈS
logger.table(tenants)

// Output: Tableau formaté avec colonnes
```

## 🛠️ Migration Semi-Automatique

### Option 1: Remplacer fichier par fichier

1. Ouvrir un fichier (ex: `candidateService.js`)
2. Ajouter l'import en haut:
```javascript
import { logger } from '../utils/logger'
```
3. Chercher/Remplacer (Cmd+H ou Ctrl+H):
   - `console.log` → `logger.debug`
   - `console.error` → `logger.error`
   - `console.warn` → `logger.warn`
4. Sauvegarder et tester

### Option 2: Sed en masse (rapide mais moins précis)

```bash
# Dans frontend/
find src/ -name "*.js" -o -name "*.jsx" | \
  xargs sed -i '' 's/console\.log/logger.debug/g'
```

**⚠️ Attention**: Vous devrez ensuite ajouter les imports manuellement.

## 📊 État Actuel

D'après l'audit: **83 occurrences** de console.log/error dans le code.

### Fichiers prioritaires à migrer

1. **Services** (12 fichiers):
   - `candidateService.js` (~20 logs)
   - `tenantGroupService.js` (~15 logs)
   - `irlService.js` (~10 logs)
   - Autres services

2. **Pages volumineuses**:
   - `PublicCandidateForm.jsx` (~15 logs)
   - `Dashboard.jsx` (~5 logs)
   - `CandidateDetail.jsx` (~8 logs)

3. **Composants**:
   - `DashboardLayout.jsx`
   - `Sidebar.jsx`

## ✅ Vérification

Après migration, vérifier:

```bash
# Compter les console.log restants
grep -r "console\.log" frontend/src --include="*.js" --include="*.jsx" | wc -l

# Devrait afficher 0 (sauf ErrorBoundary.jsx)
```

## 🧪 Tester

### En développement

1. Par défaut (VITE_DEBUG non défini):
```bash
npm run dev
```
→ Seuls `logger.info()` et `logger.warn/error()` s'affichent

2. Mode debug activé:
```bash
# Ajouter dans .env
VITE_DEBUG=true

npm run dev
```
→ Tous les logs s'affichent (y compris `logger.debug()`)

### En production

```bash
npm run build
npm run preview
```
→ Seuls `logger.warn()` et `logger.error()` s'affichent
→ Les logs sont envoyés à Sentry (quand configuré)

## 🎨 Exemple Complet

### Fichier: services/paymentService.js

```javascript
import { supabase } from '../lib/supabase'
import { createLogger } from '../utils/logger'

const log = createLogger('PaymentService')

export const generateReceipt = async (paymentId) => {
  log.time('generateReceipt')
  log.debug('Starting receipt generation', { paymentId })

  try {
    // Récupérer le paiement
    log.debug('Fetching payment data')
    const payment = await fetchPayment(paymentId)

    // Récupérer les données associées
    log.debug('Fetching related data')
    const [lease, tenant, property] = await Promise.all([
      fetchLease(payment.lease_id),
      fetchTenant(payment.tenant_id),
      fetchProperty(payment.property_id)
    ])

    // Générer le PDF
    log.debug('Generating PDF', { tenant: tenant.name })
    const pdf = await generatePDF({ payment, lease, tenant, property })

    log.success('Receipt generated successfully', {
      paymentId,
      fileName: pdf.fileName
    })
    log.timeEnd('generateReceipt')

    return pdf
  } catch (error) {
    log.error('Failed to generate receipt', {
      paymentId,
      error: error.message,
      stack: error.stack
    })
    log.timeEnd('generateReceipt')
    throw error
  }
}
```

### Output Console (dev avec DEBUG=true)

```
[2026-01-03T10:45:12.456Z] [PaymentService] [DEBUG] Starting receipt generation { paymentId: '123' }
[2026-01-03T10:45:12.460Z] [PaymentService] [DEBUG] Fetching payment data
[2026-01-03T10:45:12.678Z] [PaymentService] [DEBUG] Fetching related data
[2026-01-03T10:45:12.923Z] [PaymentService] [DEBUG] Generating PDF { tenant: 'John Doe' }
✓ SUCCESS Receipt generated successfully { paymentId: '123', fileName: 'receipt_123.pdf' }
generateReceipt: 567ms
```

## 🚀 Prochaines Étapes

Après migration complète:

1. **Intégrer Sentry** (voir `AUDIT_COMPLET.md`):
```javascript
// logger.js
_sendToSentry(level, data) {
  if (window.Sentry) {
    window.Sentry.captureMessage(JSON.stringify(data), level)
  }
}
```

2. **Configurer niveaux de log par environnement**:
```javascript
// .env.production
VITE_LOG_LEVEL=error  # Seulement erreurs en prod

// .env.development
VITE_LOG_LEVEL=debug  # Tous les logs en dev
```

3. **Ajouter logs structurés** (JSON):
```javascript
logger.json({ event: 'payment_created', amount: 1500, tenant_id: '123' })
```

---

*Temps estimé: 4h pour migrer les 83 occurrences*
*Bénéfice: Logs propres + Préparation monitoring production*
