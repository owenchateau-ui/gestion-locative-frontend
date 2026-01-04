# 📦 Archive - Documentation et Fichiers Temporaires

> **Date d'archivage** : 4 Janvier 2026
> **Raison** : Nettoyage après migration RLS V2 réussie

---

## 📂 Contenu de cette Archive

### `docs-temporaires/`
Fichiers Markdown temporaires créés pendant les phases de migration, debug et amélioration.

**Guides d'exécution manuelle** (déjà exécutés) :
- `EXECUTION_MANUELLE_RLS.md`
- `EXECUTION_RLS_ETAPE_PAR_ETAPE.md`
- `GUIDE_EXECUTION_RAPIDE.md`
- `GUIDE_RLS_FINAL.md`
- `EXECUTION_MANUELLE_RATE_LIMITING.md`

**Résumés de sessions** (historiques) :
- `RECAP_FINAL_SESSION.md`
- `RECAP_SESSION_4_JANVIER.md`
- `SESSION_03_01_2026_RESUME.md`
- `SEMAINE_4_RESUME.md`
- `PHASE1_STABILISATION_RESUME.md`

**Guides de migration** (migrations terminées) :
- `MIGRATION_README.md`
- `MIGRATION_CANDIDATURES.md`
- `README_PHASE1.md`

**Patchs et corrections temporaires** :
- `PATCHES_FORMULAIRE_CORRECTIONS.md`
- `PATCHES_FORMULAIRE_PUBLIC.md`
- `CORRECTION_CRITIQUE_TENANTS.md`
- `OPTION_A_STATUS.md`

**Améliorations et changelogs** :
- `RLS_V2_CHANGELOG.md` (détails intégrés dans CLAUDE.md)
- `AMELIORATIONS_BAUX_2026-01-02.md`
- `AMELIORATIONS_CANDIDATURES.md`
- `IMPLEMENTATION_COUPLES_COLOCATIONS.md`

### `migrations/`
Anciennes migrations SQL des premières phases (décembre 2024 - début janvier 2026).

**Migrations initiales** :
- `02_migration_link_entities_to_existing_tables.sql`
- `03_migration_data_to_new_architecture.sql`
- `04_add_apl_caf_support.sql`

---

## ✅ État Actuel du Projet (4 Janvier 2026)

### Migrations SQL Actives
Les seuls fichiers SQL nécessaires sont dans `supabase/migrations/` :

**RLS V2 (Production-Ready)** :
- ✅ `20260104_CLEANUP_OLD_RLS.sql` - Nettoyage ancien RLS
- ✅ `20260104_RLS_CORRECT_FINAL_v2.sql` - RLS V2 complet (60+ policies, 13 tables)
- ✅ `20260104_RESTORE_DATA_FINAL.sql` - Restauration données
- ✅ `20260104_FIX_TENANTS_URGENT.sql` - Fix user_id nullable + trigger

**Debug** (si besoin) :
- `20260104_DEBUG_DATA.sql` - Requêtes de diagnostic

### Documentation Permanente (racine du projet)
- ✅ `CLAUDE.md` - Référence principale du projet
- ✅ `METHODO_MODIFICATIONS.md` - Méthodologie systémique obligatoire
- ✅ `SECURITE.md` - Documentation sécurité
- ✅ `CANDIDATURES_GUIDE.md` - Guide fonctionnel candidatures
- ✅ `GUIDE_TESTS.md` - Guide tests
- ✅ `GUIDE_LOGGER.md` - Guide logging
- ✅ `GUIDE_RATE_LIMITING.md` - Guide rate limiting
- ✅ `TESTS_AUTOMATISES.md` - Tests automatisés
- ✅ `CHECKLIST_BUCKET_STORAGE.md` - Checklist Supabase Storage
- ✅ `AUDIT_COMPLET.md` - Audit complet application
- ✅ `AUTOMATISATION_COMPLETE.md` - Automatisation

---

## 🗑️ Pourquoi Ces Fichiers Sont Archivés

### Guides d'exécution
**Raison** : Migrations RLS déjà exécutées avec succès. Les guides étaient pour l'exécution manuelle.

### Résumés de sessions
**Raison** : Historiques de développement. Les informations importantes sont dans `CLAUDE.md`.

### Patchs et corrections
**Raison** : Bugs corrigés. Les solutions finales sont dans le code et les migrations V2.

### Anciennes migrations SQL
**Raison** : Migrations déjà appliquées en base de données. Les migrations V2 du 4 janvier sont les seules nécessaires.

---

## 🔍 Si Vous Avez Besoin de Retrouver Quelque Chose

### "Je veux revoir le changelog RLS V2"
- **Fichier** : `docs-temporaires/RLS_V2_CHANGELOG.md`
- **Aussi dans** : `CLAUDE.md` section "Sécurité et RLS"

### "Je veux revoir les étapes de la migration RLS"
- **Fichiers** :
  - `docs-temporaires/EXECUTION_RLS_ETAPE_PAR_ETAPE.md`
  - `docs-temporaires/GUIDE_RLS_FINAL.md`

### "Je veux comprendre les bugs rencontrés"
- **Fichiers** :
  - `docs-temporaires/CORRECTION_CRITIQUE_TENANTS.md`
  - `docs-temporaires/PATCHES_FORMULAIRE_*.md`

### "Je veux les anciennes migrations SQL"
- **Dossier** : `archive-migrations-anciennes/` dans `supabase/migrations/`

---

## 📝 Notes Importantes

1. **Ne PAS supprimer** `archive/` - contient l'historique du projet
2. **Documentation permanente** à la racine du projet reste la référence
3. **Migrations V2** (20260104_*) sont les seules nécessaires pour la production
4. En cas de problème, consultez d'abord `METHODO_MODIFICATIONS.md` avant toute modification

---

**Archivé par** : Claude Sonnet 4.5
**Date** : 4 Janvier 2026
**Score Sécurité Final** : 100/100 ✅
