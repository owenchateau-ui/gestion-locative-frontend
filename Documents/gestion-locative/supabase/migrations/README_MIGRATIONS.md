# 🗄️ Guide des Migrations Supabase

## 📋 Migrations à exécuter

### 1. Migration Index Performance (HAUTE PRIORITÉ)

**Fichier**: `20260103_add_missing_indexes.sql`

**Impact**: Amélioration performance -50% temps chargement

**Instructions**:
1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Ouvrez **SQL Editor** (icône </> dans le menu gauche)
4. Créez une nouvelle requête
5. Copiez-collez le contenu de `20260103_add_missing_indexes.sql`
6. Cliquez sur **Run** (ou Ctrl+Enter)
7. Vérifiez les messages de confirmation dans l'output

**Vérification**:
```sql
-- Vérifier que les index sont créés
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

**Rollback** (si problème):
```sql
-- Supprimer tous les index créés par cette migration
DROP INDEX IF EXISTS idx_leases_status_end_date;
DROP INDEX IF EXISTS idx_payments_date;
DROP INDEX IF EXISTS idx_leases_tenant_status;
DROP INDEX IF EXISTS idx_properties_entity;
DROP INDEX IF EXISTS idx_lots_property_status;
DROP INDEX IF EXISTS idx_candidate_docs_candidate;
DROP INDEX IF EXISTS idx_guarantees_tenant;
DROP INDEX IF EXISTS idx_payments_lease;
DROP INDEX IF EXISTS idx_candidates_lot_status;
DROP INDEX IF EXISTS idx_tenants_search;
DROP INDEX IF EXISTS idx_properties_search;
DROP INDEX IF EXISTS idx_lots_search;
DROP INDEX IF EXISTS idx_payments_month;
DROP INDEX IF EXISTS idx_leases_active_amounts;
DROP INDEX IF EXISTS idx_payments_entity_status_date;
```

---

### 2. Migration Colonnes Candidates (DÉJÀ FAITE ?)

**Fichier**: `20260102_add_all_missing_columns.sql`

**Statut**: Vérifier si déjà exécutée

**Vérification**:
```sql
-- Vérifier si la colonne guarantor_professional_status existe
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'candidates'
  AND column_name = 'guarantor_professional_status';

-- Si retourne une ligne → migration déjà faite ✅
-- Si retourne vide → migration à exécuter
```

---

## 🛠️ Bonnes pratiques

### Avant chaque migration

1. **Backup de la BDD**:
   - Allez dans Settings > Database > Backups
   - Créez un backup manuel

2. **Testez en local** (si possible):
   ```bash
   npx supabase db reset
   npx supabase db push
   ```

3. **Exécutez aux heures creuses** (si possible)

### Après chaque migration

1. **Vérifiez les logs**:
   - Allez dans Database > Logs
   - Cherchez les erreurs éventuelles

2. **Testez l'application**:
   - Chargez le dashboard
   - Testez les listes (tenants, properties, leases)
   - Vérifiez les temps de réponse

3. **Documentez**:
   - Mettez à jour ce README avec la date d'exécution
   - Notez les problèmes rencontrés

---

## 📊 Historique des migrations

| Date | Migration | Statut | Exécutée par | Notes |
|------|-----------|--------|--------------|-------|
| 2026-01-02 | add_all_missing_columns | ❓ À vérifier | - | Colonnes candidates |
| 2026-01-03 | add_missing_indexes | ⏳ En attente | - | Performance +50% |

---

## 🆘 En cas de problème

### "ERROR: relation does not exist"
→ La table n'existe pas. Vérifiez que les migrations précédentes sont exécutées.

### "ERROR: index already exists"
→ L'index existe déjà. Pas de problème, migration idempotente.

### "ERROR: permission denied"
→ Utilisez un utilisateur avec droits suffisants (postgres user).

### Application lente après migration
→ Exécutez ANALYZE pour mettre à jour les statistiques:
```sql
ANALYZE tenants;
ANALYZE leases;
ANALYZE payments;
ANALYZE properties_new;
ANALYZE lots;
ANALYZE candidates;
```

---

## 📞 Support

- Documentation Supabase: https://supabase.com/docs/guides/database/migrations
- Discord Supabase: https://discord.supabase.com
- Audit complet: Voir `AUDIT_COMPLET.md` à la racine du projet
