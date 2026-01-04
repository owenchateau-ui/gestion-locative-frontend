#!/bin/bash

###############################################################################
# Test Rate Limiting - Edge Function Supabase
#
# Ce script teste que le rate limiting fonctionne correctement
# en envoyant plusieurs requêtes et en vérifiant le blocage.
#
# Prérequis:
# - Edge Function rate-limiter déployée sur Supabase
# - Variables d'environnement configurées
#
# Usage:
#   chmod +x scripts/test-rate-limiting.sh
#   ./scripts/test-rate-limiting.sh
###############################################################################

set -e

echo ""
echo "=========================================="
echo "🧪 TEST RATE LIMITING"
echo "=========================================="
echo ""

# Vérifier que les variables d'environnement existent
if [ ! -f .env ]; then
  echo "❌ ERREUR: Fichier .env non trouvé"
  echo "   Créez un fichier .env avec VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY"
  exit 1
fi

# Charger les variables d'environnement
export $(grep -v '^#' .env | xargs)

if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
  echo "❌ ERREUR: Variables d'environnement manquantes"
  echo "   Vérifiez que VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont définies dans .env"
  exit 1
fi

# Extraire l'URL du projet (enlever https://)
PROJECT_URL="${VITE_SUPABASE_URL#https://}"
ANON_KEY="$VITE_SUPABASE_ANON_KEY"

# URL de la fonction
FUNCTION_URL="https://$PROJECT_URL/functions/v1/rate-limiter"

# Identifiant unique pour ce test
TEST_ID="test-$(date +%s)@example.com"

echo "📋 Configuration:"
echo "   Projet: $PROJECT_URL"
echo "   Fonction: /functions/v1/rate-limiter"
echo "   Test ID: $TEST_ID"
echo ""

# Compteurs
TOTAL_REQUESTS=0
SUCCESS_COUNT=0
BLOCKED_COUNT=0

echo "🔄 Envoi de 6 requêtes consécutives..."
echo "   (Limite: 5 requêtes par minute pour auth:login)"
echo ""

for i in {1..6}; do
  TOTAL_REQUESTS=$((TOTAL_REQUESTS + 1))

  echo -n "Requête $i: "

  # Envoyer la requête
  RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST "$FUNCTION_URL" \
    -H "Authorization: Bearer $ANON_KEY" \
    -H "Content-Type: application/json" \
    -H "x-rate-limit-action: auth:login" \
    -H "x-rate-limit-identifier: $TEST_ID")

  # Extraire le code HTTP et le corps
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | head -n-1)

  # Vérifier si la requête est autorisée
  if echo "$BODY" | grep -q '"allowed":true'; then
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    REMAINING=$(echo "$BODY" | grep -o '"remaining":[0-9]*' | grep -o '[0-9]*')
    echo "✅ Autorisée (remaining: $REMAINING)"
  elif echo "$BODY" | grep -q '"allowed":false'; then
    BLOCKED_COUNT=$((BLOCKED_COUNT + 1))
    echo "🚫 Bloquée (rate limit atteint)"
  else
    echo "⚠️  Réponse inattendue: HTTP $HTTP_CODE"
    echo "   $BODY"
  fi

  # Attendre 1 seconde entre les requêtes
  if [ $i -lt 6 ]; then
    sleep 1
  fi
done

echo ""
echo "=========================================="
echo "📊 RÉSULTATS"
echo "=========================================="
echo ""
echo "Total requêtes : $TOTAL_REQUESTS"
echo "Autorisées     : $SUCCESS_COUNT ✅"
echo "Bloquées       : $BLOCKED_COUNT 🚫"
echo ""

# Vérifier le résultat attendu
if [ $SUCCESS_COUNT -eq 5 ] && [ $BLOCKED_COUNT -eq 1 ]; then
  echo "🎉 SUCCÈS: Rate limiting fonctionne parfaitement !"
  echo "   - 5 premières requêtes autorisées ✅"
  echo "   - 6ème requête bloquée ✅"
  echo "   - Protection brute force active ✅"
  echo ""
  EXIT_CODE=0
elif [ $BLOCKED_COUNT -eq 0 ]; then
  echo "❌ ÉCHEC: Aucune requête n'a été bloquée"
  echo "   Le rate limiting ne semble pas fonctionner."
  echo ""
  echo "🔍 Vérifications à faire:"
  echo "   1. L'Edge Function est-elle déployée ?"
  echo "   2. Les secrets Upstash sont-ils configurés ?"
  echo "   3. Consultez les logs: npx supabase functions logs rate-limiter"
  echo ""
  EXIT_CODE=1
else
  echo "⚠️  RÉSULTAT INATTENDU"
  echo "   Attendu: 5 autorisées, 1 bloquée"
  echo "   Obtenu: $SUCCESS_COUNT autorisées, $BLOCKED_COUNT bloquées"
  echo ""
  EXIT_CODE=1
fi

# Test du reset automatique (optionnel)
if [ $EXIT_CODE -eq 0 ]; then
  echo "⏱️  Test du reset automatique (60 secondes)..."
  echo "   Attente de 60 secondes pour vérifier le reset..."

  for i in {60..1}; do
    printf "\r   Temps restant: %2ds" $i
    sleep 1
  done
  echo ""
  echo ""

  echo "🔄 Envoi d'une nouvelle requête après reset..."
  RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST "$FUNCTION_URL" \
    -H "Authorization: Bearer $ANON_KEY" \
    -H "Content-Type: application/json" \
    -H "x-rate-limit-action: auth:login" \
    -H "x-rate-limit-identifier: $TEST_ID")

  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | head -n-1)

  if echo "$BODY" | grep -q '"allowed":true'; then
    echo "✅ Requête autorisée après reset"
    echo "   Le compteur a bien été réinitialisé !"
  else
    echo "⚠️  Requête toujours bloquée"
    echo "   Le reset pourrait prendre plus de 60 secondes"
  fi
  echo ""
fi

echo "=========================================="
exit $EXIT_CODE
