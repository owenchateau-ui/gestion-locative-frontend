# 🔍 DIAGNOSTIC - Erreur "relation lots_new does not exist"

## Problème identifié

L'erreur indique que les tables de la **nouvelle architecture multi-entités** n'existent pas encore dans Supabase :
- ❌ `entities` (table des entités juridiques)
- ❌ `properties_new` (nouvelle table des propriétés)
- ❌ `lots_new` (nouvelle table des lots)

Le code frontend (candidateService.js) utilise ces nouvelles tables, mais elles n'ont pas encore été créées dans Supabase.

## 🎯 Solutions possibles

### Option A : Utiliser l'ancienne architecture (RAPIDE - temporaire)

Si tu veux juste tester le système de candidatures rapidement sans migrer toute la base :

1. **Exécute ce diagnostic** dans Supabase SQL Editor :
   ```sql
   -- Fichier: 00_diagnostic_tables.sql
   ```
   Cela te montrera quelles tables existent vraiment.

2. Je créerai une **version simplifiée des politiques RLS** qui utilise les anciennes tables (`lots` au lieu de `lots_new`).

3. Je modifierai `candidateService.js` pour utiliser les anciennes tables.

⚠️ **Inconvénient** : Tu n'auras pas les fonctionnalités multi-entités (SCI, SARL, etc.)

### Option B : Migrer vers la nouvelle architecture (RECOMMANDÉ - complet)

C'est la solution recommandée pour avoir toutes les fonctionnalités.

#### Étape 1 : Créer les nouvelles tables

Exécute **dans l'ordre** ces migrations SQL dans Supabase :

```bash
1. sql/01_create_multi_entity_tables.sql
2. 02_migration_link_entities_to_existing_tables.sql
3. 03_migration_data_to_new_architecture.sql
4. 04_add_apl_caf_support.sql
```

#### Étape 2 : Créer les tables candidatures

Ensuite, crée les tables pour les candidatures (si pas déjà fait) :

```sql
-- Tables : candidates, candidate_invitation_links, candidate_documents
-- (Migration à créer si elle n'existe pas)
```

#### Étape 3 : Appliquer les politiques RLS

Une fois les tables créées, tu pourras exécuter :
```sql
-- supabase/migrations/20241229_add_rls_policies_candidates.sql
```

✅ **Avantages** :
- Architecture complète multi-entités
- Gestion par SCI, SARL, LMNP, etc.
- Code frontend cohérent
- Évolutif

## 🤔 Quelle option choisis-tu ?

**Réponds-moi avec :**
- **A** = Version rapide avec anciennes tables (juste pour tester)
- **B** = Migration complète vers nouvelle architecture (recommandé)

Je t'aiderai en fonction de ton choix !

---

## 📊 Diagnostic rapide

Exécute ce SQL dans Supabase pour voir l'état actuel :

\`\`\`sql
-- Voir toutes les tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Vérifier si les nouvelles tables existent
SELECT
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'entities')
    THEN '✅ entities existe'
    ELSE '❌ entities manquante'
  END as status_entities,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'properties_new')
    THEN '✅ properties_new existe'
    ELSE '❌ properties_new manquante'
  END as status_properties,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lots_new')
    THEN '✅ lots_new existe'
    ELSE '❌ lots_new manquante'
  END as status_lots,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'candidates')
    THEN '✅ candidates existe'
    ELSE '❌ candidates manquante'
  END as status_candidates;
\`\`\`
