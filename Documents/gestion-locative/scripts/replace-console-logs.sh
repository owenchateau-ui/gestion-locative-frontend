#!/bin/bash

# Script pour remplacer console.log par logger
# Usage: chmod +x scripts/replace-console-logs.sh && ./scripts/replace-console-logs.sh

set -e

echo "🔍 Recherche de tous les console.log/console.error dans src/..."
echo ""

# Compter les occurrences
TOTAL=$(grep -r "console\.\(log\|error\|warn\|debug\)" frontend/src --include="*.js" --include="*.jsx" | wc -l | tr -d ' ')

echo "📊 Trouvé $TOTAL occurrences de console.log/error/warn/debug"
echo ""

if [ "$TOTAL" -eq "0" ]; then
  echo "✅ Aucun console.log trouvé ! Tout est propre."
  exit 0
fi

echo "🔄 Remplacement en cours..."
echo ""

# Remplacer dans tous les fichiers
find frontend/src -type f \( -name "*.js" -o -name "*.jsx" \) -print0 | while IFS= read -r -d '' file; do
  # Ignorer logger.js lui-même
  if [[ "$file" == *"logger.js"* ]]; then
    continue
  fi

  # Vérifier si le fichier contient des console.log
  if grep -q "console\.\(log\|error\|warn\|debug\)" "$file"; then
    echo "  📝 Traitement: $file"

    # Sauvegarder une copie
    cp "$file" "$file.bak.$$"

    # Ajouter l'import logger si pas présent
    if ! grep -q "import.*logger" "$file"; then
      # Chercher la dernière ligne d'import
      last_import_line=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)

      if [ -n "$last_import_line" ]; then
        # Insérer après le dernier import
        sed -i '' "${last_import_line}a\\
import { logger } from '../utils/logger'\\
" "$file"
      else
        # Insérer au début du fichier
        sed -i '' "1i\\
import { logger } from '../utils/logger'\\
\\
" "$file"
      fi
    fi

    # Remplacer console.log → logger.debug
    sed -i '' 's/console\.log/logger.debug/g' "$file"

    # Remplacer console.error → logger.error (mais garder console.error dans ErrorBoundary)
    if [[ "$file" != *"ErrorBoundary"* ]]; then
      sed -i '' 's/console\.error/logger.error/g' "$file"
    fi

    # Remplacer console.warn → logger.warn
    sed -i '' 's/console\.warn/logger.warn/g' "$file"

    # Remplacer console.debug → logger.debug
    sed -i '' 's/console\.debug/logger.debug/g' "$file"

    # Supprimer la backup si succès
    rm "$file.bak.$$"
  fi
done

echo ""
echo "✅ Remplacement terminé !"
echo ""

# Vérifier le résultat
REMAINING=$(grep -r "console\.\(log\|warn\|debug\)" frontend/src --include="*.js" --include="*.jsx" --exclude="logger.js" --exclude="ErrorBoundary.jsx" | wc -l | tr -d ' ')

echo "📊 Résultat:"
echo "  Avant: $TOTAL occurrences"
echo "  Après: $REMAINING occurrences (console.error gardés dans ErrorBoundary)"
echo ""

if [ "$REMAINING" -eq "0" ]; then
  echo "🎉 Tous les logs ont été remplacés avec succès !"
else
  echo "⚠️  Il reste $REMAINING occurrences (vérifiez manuellement)"
fi

echo ""
echo "📝 Note: Les fichiers .bak ont été nettoyés automatiquement"
echo "💡 Tip: Activez VITE_DEBUG=true dans .env pour voir les logs en dev"
