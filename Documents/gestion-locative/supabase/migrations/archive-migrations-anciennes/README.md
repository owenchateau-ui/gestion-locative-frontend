# 📦 Archive - Anciennes Migrations SQL

> **Date d'archivage** : 4 Janvier 2026
> **Raison** : Migration RLS V2 finale appliquée avec succès

---

## ⚠️ IMPORTANT

**Ces migrations sont DÉJÀ APPLIQUÉES** en base de données et ne doivent PAS être ré-exécutées.

---

## 📋 Migrations Archivées

### Phase Décembre 2024 - Candidatures et RLS Initial

**Candidatures** :
- `20241229_candidates_minimal.sql`
- `20241229_create_candidates_simple.sql`
- `20241229_create_candidates_tables.sql`
- `20260102_create_candidates.sql`
- `20260102_create_candidates_v2.sql`
- `20260102_migrate_candidates_to_v2.sql`
- `20260102_migrate_candidates_to_v2_fixed.sql`

**RLS Initial (incomplet)** :
- `20241229_add_rls_policies_candidates.sql`
- `20241229_fix_rls_policies.sql`
- `20241229_rls_simple.sql`

### Phase 2 Janvier 2026 - Groupes de Locataires

- `20260102_create_tenant_groups.sql`
- `20260102_fix_guarantor_columns.sql`

### Phase 3 Janvier 2026 - RLS Dashboard et Corrections

**RLS Dashboard** (versions progressives) :
- `20260103_activate_rls.sql`
- `20260103_activate_rls_DASHBOARD.sql`
- `20260103_create_rls_policies.sql`
- `20260103_create_rls_policies_DASHBOARD.sql`
- `20260103_create_rls_policies_DASHBOARD_v2.sql`

**Corrections Tenants** :
- `20260103_fix_tenants_nullable_columns.sql`
- `20260103_fix_tenants_nullable_columns_DASHBOARD.sql`

### Phase 4 Janvier 2026 - Ajouts Fonctionnels

- `20260101_fix_candidate_documents.sql`
- `20260102_add_all_missing_columns.sql`
- `20260103_add_missing_indexes.sql`
- `20241222_add_irl_indexation.sql`

### Diagnostics et Corrections d'Urgence

**Diagnostics** :
- `00_diagnostic_tables.sql`
- `DIAGNOSTIC_RLS.sql`
- `DIAGNOSTIC_RLS_COMPLET.sql`
- `DIAGNOSTIC_RLS_COMPLET_DASHBOARD.sql`

**Fixes d'urgence** :
- `FIX_OWEN_DATA.sql`
- `FIX_USER_DATA_EMERGENCY.sql`
- `FIX_add_caf_fields.sql`
- `FIX_add_entity_id.sql`
- `FIX_add_housing_assistance.sql`
- `FIX_landlord_id_nullable.sql`
- `FIX_tenants_columns.sql`

**Rollback** :
- `ROLLBACK_NEW_RLS.sql`

**Vérifications** :
- `VERIFY_CANDIDATURES.sql`

---

## ✅ État Actuel (4 Janvier 2026)

### Migrations Actives (dans supabase/migrations/)

**RLS V2 Production-Ready** :
1. `20260104_CLEANUP_OLD_RLS.sql` - Nettoyage complet ancien RLS
2. `20260104_RLS_CORRECT_FINAL_v2.sql` - RLS V2 avec 60+ policies sur 13 tables
3. `20260104_RESTORE_DATA_FINAL.sql` - Restauration données multi-entités
4. `20260104_FIX_TENANTS_URGENT.sql` - Fix user_id nullable + trigger auto-fill

**Debug** :
- `20260104_DEBUG_DATA.sql` - Requêtes diagnostic (si besoin)

---

## 🔍 Historique des Problèmes Résolus

### Problème 1 : RLS Incomplet
**Fichiers** : Toutes les migrations RLS 2024-2025
**Problème** : RLS ne couvrait que 7 tables, manquait policies publiques candidatures
**Solution finale** : `20260104_RLS_CORRECT_FINAL_v2.sql` (60+ policies, 13 tables)

### Problème 2 : Mapping auth.uid() Incorrect
**Fichiers** : Anciennes policies RLS Dashboard
**Problème** : `auth.uid() = entities.user_id` incorrect (devrait être `users.supabase_uid`)
**Solution finale** : Helper function `get_app_user_id()` dans RLS V2

### Problème 3 : Tenants user_id NOT NULL
**Fichiers** : Fix tenants nullable columns
**Problème** : Frontend ne remplissait pas user_id, constraint NOT NULL bloquait création
**Solution finale** : `20260104_FIX_TENANTS_URGENT.sql` (nullable + trigger)

### Problème 4 : Candidatures Inaccessibles
**Fichiers** : Multiples migrations candidatures 2024-2025
**Problème** : Schéma candidatures incomplet, documents mal liés
**Solution finale** : Schéma complet dans RLS V2 avec policies publiques

---

## 📝 Pourquoi Ne Pas Supprimer Cette Archive

1. **Traçabilité** : Comprendre l'historique du projet
2. **Debug futur** : Si problème similaire, voir comment on l'a résolu
3. **Apprentissage** : Voir l'évolution du schéma DB et des policies
4. **Rollback d'urgence** : En cas de catastrophe (très improbable)

---

## ⚠️ Si Vous Devez Ré-exécuter une Migration

**NE LE FAITES PAS** sans :
1. Lire `METHODO_MODIFICATIONS.md` (racine du projet)
2. Analyser l'impact complet (DB + RLS + Frontend)
3. Créer un backup complet de la base de données
4. Tester sur environnement de développement d'abord

**Rappel** : Les migrations V2 du 4 janvier 2026 sont production-ready et complètes.

---

**Archivé par** : Claude Sonnet 4.5
**Date** : 4 Janvier 2026
