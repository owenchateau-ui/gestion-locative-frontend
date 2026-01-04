# 🔒 Guide de Sécurité - Gestion Locative

## 🛡️ Headers de Sécurité Configurés

### Content-Security-Policy (CSP)
Protège contre les attaques XSS en contrôlant les ressources autorisées.

**Configuration actuelle** (`vercel.json`):
```
default-src 'self'
  → Seules les ressources du même domaine sont autorisées par défaut

script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.supabase.co
  → Scripts: même domaine + Supabase CDN
  → ⚠️ 'unsafe-inline' et 'unsafe-eval' nécessaires pour React/Vite en dev

style-src 'self' 'unsafe-inline'
  → Styles: même domaine + inline (Tailwind)

img-src 'self' data: https: blob:
  → Images: même domaine + data URIs + HTTPS + blobs (previews upload)

connect-src 'self' https://*.supabase.co wss://*.supabase.co
  → Connexions API: même domaine + Supabase (HTTP + WebSocket)

frame-ancestors 'none'
  → Interdit l'embedding dans des iframes (protection clickjacking)
```

### X-Frame-Options: DENY
Empêche l'application d'être affichée dans un iframe.
→ Protection contre le clickjacking

### X-Content-Type-Options: nosniff
Force le navigateur à respecter le type MIME déclaré.
→ Protection contre les attaques de type MIME-sniffing

### X-XSS-Protection: 1; mode=block
Active la protection XSS du navigateur (navigateurs anciens).
→ Bloque la page si une attaque XSS est détectée

### Referrer-Policy: strict-origin-when-cross-origin
Contrôle les informations envoyées dans l'en-tête Referer.
→ Ne transmet l'origine qu'en HTTPS vers HTTPS

### Permissions-Policy
Désactive les APIs sensibles du navigateur.
```
camera=()        → Caméra désactivée
microphone=()    → Microphone désactivé
geolocation=()   → Géolocalisation désactivée
interest-cohort=() → Opt-out FLoC Google
```

### Strict-Transport-Security (HSTS)
Force l'utilisation de HTTPS pendant 1 an.
```
max-age=31536000       → 1 an
includeSubDomains      → Sous-domaines inclus
```

---

## 🔐 Checklist Sécurité

### ✅ FAIT

- [x] Headers sécurité configurés (CSP, X-Frame-Options, etc.)
- [x] Validation Zod côté client
- [x] Authentification Supabase
- [x] Variables d'environnement sécurisées
- [x] Fichiers .bak exclus du Git
- [x] HTTPS forcé (HSTS)

### ⏳ À FAIRE (Critique - Voir AUDIT_COMPLET.md)

- [ ] **Vérifier RLS Supabase** (2 jours)
  - Activer RLS sur toutes les tables
  - Créer policies restrictives par utilisateur
  - Tester isolation données multi-entités

- [ ] **Implémenter rate limiting** (3 jours)
  - Rate limit login (5 tentatives/minute)
  - Rate limit API (100 requêtes/minute/user)
  - Rate limit upload (10 fichiers/minute)

- [ ] **Validation serveur** (5 jours)
  - Edge Functions avec validation Zod
  - Double validation client + serveur
  - Protection bypass validation client

- [ ] **Validation fichiers uploadés** (1 jour)
  - Vérifier type MIME réel
  - Limiter taille fichiers (10 MB)
  - Whitelist extensions autorisées
  - Scan antivirus (optionnel)

- [ ] **Monitoring erreurs** (1 jour)
  - Intégrer Sentry
  - Logger erreurs critiques
  - Alertes en temps réel

### 🟢 RECOMMANDÉ (Basse priorité)

- [ ] Implémenter 2FA (authentification à deux facteurs)
- [ ] Audit logs (qui a fait quoi quand)
- [ ] Chiffrement données sensibles au repos
- [ ] Politique de mots de passe forts
- [ ] Session timeout (30 min d'inactivité)
- [ ] CAPTCHA sur formulaire public candidature

---

## 🚨 Vulnérabilités Connues

### 1. RLS Non Vérifié (CRITIQUE)

**Risque**: Fuite de données entre utilisateurs

**Test**:
1. Connectez-vous avec User A
2. Notez l'ID d'une entité de User A
3. Connectez-vous avec User B
4. Tentez d'accéder aux données de User A via console navigateur:
```javascript
const { data } = await supabase
  .from('tenants')
  .select('*')
  .eq('entity_id', 'ID_ENTITE_USER_A')

// Si data contient des résultats → VULNÉRABILITÉ ❌
// Si data est vide ou erreur → OK ✅
```

**Fix**: Voir migration `20260103_create_rls_policies.sql` (à créer)

### 2. Pas de Rate Limiting (CRITIQUE)

**Risque**: Attaques brute force, DDoS

**Test**:
1. Ouvrez la page login
2. Tentez 100 connexions rapides
3. Si toutes passent → VULNÉRABILITÉ ❌

**Fix**: Voir `utils/rateLimiter.js` + Edge Functions

### 3. Validation Client Uniquement (ÉLEVÉ)

**Risque**: Bypass validation via appels API directs

**Test**:
```javascript
// Bypass validation en appelant directement Supabase
await supabase.from('tenants').insert({
  first_name: 'X'.repeat(1000), // ❌ Devrait être limité à 100
  email: 'invalid-email'        // ❌ Devrait être validé
})
```

**Fix**: Edge Functions avec validation Zod côté serveur

---

## 🛠️ Outils Recommandés

### Tests Sécurité

- **[OWASP ZAP](https://www.zaproxy.org/)**: Scanner vulnérabilités
- **[Mozilla Observatory](https://observatory.mozilla.org/)**: Test headers sécurité
- **[SecurityHeaders.com](https://securityheaders.com/)**: Audit headers HTTP
- **[Snyk](https://snyk.io/)**: Scan dépendances npm

### Monitoring

- **[Sentry](https://sentry.io/)**: Monitoring erreurs (GRATUIT jusqu'à 5K événements/mois)
- **[LogRocket](https://logrocket.com/)**: Session replay + logs
- **[Datadog](https://www.datadoghq.com/)**: APM + logs + métriques

---

## 📞 Incident Response

### En cas de fuite de données

1. **Isoler immédiatement**:
   ```sql
   -- Désactiver RLS temporairement pour investigation
   ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
   ```

2. **Identifier l'ampleur**:
   ```sql
   -- Vérifier les accès logs Supabase
   SELECT * FROM auth.audit_log_entries
   WHERE created_at > NOW() - INTERVAL '24 hours'
   ORDER BY created_at DESC;
   ```

3. **Notifier**:
   - Utilisateurs affectés (RGPD obligatoire sous 72h)
   - CNIL si données sensibles
   - Assurance cyber (si applicable)

4. **Corriger**:
   - Appliquer le fix
   - Tester en profondeur
   - Déployer en production

5. **Post-mortem**:
   - Documenter l'incident
   - Mettre à jour les procédures
   - Former l'équipe

---

## 📋 Conformité RGPD

### Données Personnelles Collectées

| Donnée | Finalité | Base légale | Durée conservation |
|--------|----------|-------------|-------------------|
| Email, Nom, Prénom | Gestion compte utilisateur | Contrat | Durée du compte + 3 ans |
| Données locataires | Gestion locative | Contrat | Durée bail + 5 ans (prescription) |
| Documents identité | Vérification identité candidat | Intérêt légitime | 2 ans max après candidature |
| Paiements | Comptabilité, preuves | Obligation légale | 10 ans (code commerce) |
| Logs connexion | Sécurité | Intérêt légitime | 6 mois |

### Droits Utilisateurs

- **Droit d'accès**: Export données (à implémenter)
- **Droit de rectification**: Modification profil ✅
- **Droit à l'effacement**: Suppression compte (à implémenter)
- **Droit à la portabilité**: Export JSON (à implémenter)
- **Droit d'opposition**: Opt-out emails (à implémenter)

### Mentions Légales

- [ ] Créer page Mentions Légales
- [ ] Créer page Politique de Confidentialité
- [ ] Créer page CGU/CGV
- [ ] Ajouter bandeau cookies (si tracking)

---

## 🔍 Audit Régulier

### Mensuel

- [ ] Vérifier les logs Supabase pour activités suspectes
- [ ] Scanner dépendances npm (`npm audit`)
- [ ] Tester les backups de BDD

### Trimestriel

- [ ] Audit complet sécurité (ZAP scan)
- [ ] Revue des accès utilisateurs
- [ ] Mise à jour dépendances

### Annuel

- [ ] Pentest par société externe (recommandé)
- [ ] Certification ISO 27001 (optionnel, si croissance)
- [ ] Audit RGPD complet

---

*Dernière mise à jour: 3 Janvier 2026*
*Référence: AUDIT_COMPLET.md*
