#!/bin/bash

# ============================================================================
# Script d'installation automatique du Rate Limiting
# ============================================================================

set -e

echo ""
echo "=========================================="
echo "🛡️  INSTALLATION RATE LIMITING"
echo "=========================================="
echo ""

# ============================================================================
# STEP 1: Vérifier les prérequis
# ============================================================================

echo "🔍 Vérification des prérequis..."
echo ""

# Vérifier Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI non installé"
    echo ""
    echo "Installation:"
    echo "  npm install -g supabase"
    echo ""
    exit 1
fi

echo "✅ Supabase CLI installé: $(supabase --version)"

# Vérifier connexion Supabase
if ! supabase projects list &> /dev/null; then
    echo "❌ Non connecté à Supabase"
    echo ""
    echo "Connectez-vous avec:"
    echo "  supabase login"
    echo ""
    exit 1
fi

echo "✅ Connecté à Supabase"
echo ""

# ============================================================================
# STEP 2: Demander les credentials Upstash
# ============================================================================

echo "=========================================="
echo "📝 CONFIGURATION UPSTASH"
echo "=========================================="
echo ""
echo "Vous devez créer un compte Upstash Redis GRATUIT:"
echo "  1. Aller sur https://upstash.com"
echo "  2. Créer un compte (GitHub OAuth ou email)"
echo "  3. Créer une base Redis:"
echo "     - Nom: gestion-locative-ratelimit"
echo "     - Type: Global"
echo "     - Region: Europe (Ireland)"
echo "  4. Copier les credentials REST API"
echo ""
echo "Appuyez sur Entrée quand vous êtes prêt..."
read -r

echo ""
echo "Collez vos credentials Upstash:"
echo ""

# Demander UPSTASH_REDIS_REST_URL
read -p "UPSTASH_REDIS_REST_URL (https://xxx.upstash.io): " UPSTASH_URL

if [[ ! "$UPSTASH_URL" =~ ^https://.+\.upstash\.io$ ]]; then
    echo "❌ URL invalide. Format attendu: https://xxx.upstash.io"
    exit 1
fi

# Demander UPSTASH_REDIS_REST_TOKEN
read -p "UPSTASH_REDIS_REST_TOKEN (AXXXxxxx...): " UPSTASH_TOKEN

if [[ -z "$UPSTASH_TOKEN" ]]; then
    echo "❌ Token vide"
    exit 1
fi

echo ""
echo "✅ Credentials récupérés"
echo ""

# ============================================================================
# STEP 3: Configurer les secrets Supabase
# ============================================================================

echo "=========================================="
echo "🔐 CONFIGURATION SECRETS SUPABASE"
echo "=========================================="
echo ""

echo "Configuration UPSTASH_REDIS_REST_URL..."
supabase secrets set UPSTASH_REDIS_REST_URL="$UPSTASH_URL"

echo "Configuration UPSTASH_REDIS_REST_TOKEN..."
supabase secrets set UPSTASH_REDIS_REST_TOKEN="$UPSTASH_TOKEN"

echo ""
echo "✅ Secrets configurés"
echo ""

# ============================================================================
# STEP 4: Déployer la fonction Edge
# ============================================================================

echo "=========================================="
echo "🚀 DÉPLOIEMENT EDGE FUNCTION"
echo "=========================================="
echo ""

echo "Déploiement de la fonction rate-limiter..."
supabase functions deploy rate-limiter

echo ""
echo "✅ Fonction déployée"
echo ""

# ============================================================================
# STEP 5: Tester la fonction
# ============================================================================

echo "=========================================="
echo "🧪 TEST DE LA FONCTION"
echo "=========================================="
echo ""

# Récupérer l'URL du projet
PROJECT_URL=$(supabase projects list | grep -o 'https://[a-z0-9-]*\.supabase\.co' | head -1)

if [[ -z "$PROJECT_URL" ]]; then
    echo "⚠️  Impossible de récupérer l'URL du projet automatiquement"
    echo "Testez manuellement avec:"
    echo "  curl -i --location --request POST 'https://YOUR_PROJECT.supabase.co/functions/v1/rate-limiter' \\"
    echo "    --header 'Authorization: Bearer YOUR_ANON_KEY' \\"
    echo "    --header 'x-rate-limit-action: auth:login' \\"
    echo "    --header 'x-rate-limit-identifier: test@example.com'"
    echo ""
else
    echo "URL du projet: $PROJECT_URL"
    echo ""
    echo "Test de la fonction (5 requêtes)..."
    echo ""

    # Récupérer l'anon key
    read -p "Collez votre SUPABASE_ANON_KEY: " ANON_KEY

    for i in {1..5}; do
        echo -n "Requête $i: "
        RESPONSE=$(curl -s -X POST "$PROJECT_URL/functions/v1/rate-limiter" \
            -H "Authorization: Bearer $ANON_KEY" \
            -H "x-rate-limit-action: auth:login" \
            -H "x-rate-limit-identifier: test@example.com")

        ALLOWED=$(echo "$RESPONSE" | jq -r '.allowed')
        REMAINING=$(echo "$RESPONSE" | jq -r '.remaining')

        if [[ "$ALLOWED" == "true" ]]; then
            echo "✅ Autorisé (restant: $REMAINING)"
        else
            echo "⛔ Bloqué"
        fi

        sleep 1
    done

    echo ""
    echo "Test de blocage (6ème requête)..."
    RESPONSE=$(curl -s -X POST "$PROJECT_URL/functions/v1/rate-limiter" \
        -H "Authorization: Bearer $ANON_KEY" \
        -H "x-rate-limit-action: auth:login" \
        -H "x-rate-limit-identifier: test@example.com")

    ALLOWED=$(echo "$RESPONSE" | jq -r '.allowed')

    if [[ "$ALLOWED" == "false" ]]; then
        echo "✅ Blocage fonctionne correctement"
    else
        echo "⚠️  Attendu: false, Reçu: $ALLOWED"
    fi
fi

echo ""
echo "=========================================="
echo "✅ INSTALLATION TERMINÉE"
echo "=========================================="
echo ""
echo "📚 Prochaines étapes:"
echo ""
echo "1. Intégrer dans Login.jsx (voir Login.example-with-ratelimit.jsx)"
echo "2. Intégrer dans Register.jsx"
echo "3. Intégrer dans PublicCandidateForm.jsx"
echo "4. Intégrer dans upload de fichiers"
echo "5. Intégrer dans génération PDF"
echo ""
echo "📖 Documentation complète: GUIDE_RATE_LIMITING.md"
echo ""
echo "🔍 Monitoring:"
echo "  - Dashboard Upstash: https://console.upstash.com"
echo "  - Logs Supabase: npx supabase functions logs rate-limiter --tail"
echo ""
echo "=========================================="
