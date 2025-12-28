# Migration Indexation IRL - Guide d'installation

## 📋 Vue d'ensemble

Cette migration ajoute la fonctionnalité complète d'indexation automatique des loyers (IRL) à l'application de gestion locative.

## 🗄️ Tables créées

1. **irl_indices** : Stocke les indices IRL publiés par l'INSEE
2. **indexation_history** : Historique de toutes les révisions de loyers effectuées

## 📊 Colonnes ajoutées à la table `leases`

- `irl_reference_quarter` : Trimestre de référence (1-4)
- `irl_reference_year` : Année de référence
- `last_indexation_date` : Date de la dernière indexation
- `indexation_enabled` : Active/désactive l'indexation pour ce bail
- `initial_rent` : Loyer initial à la signature du bail

## 🚀 Instructions d'installation

### 1. Appliquer la migration SQL

Connectez-vous à votre projet Supabase et exécutez le script :

```bash
# Depuis le SQL Editor de Supabase
# Copiez-collez le contenu du fichier :
supabase/migrations/20241222_add_irl_indexation.sql
```

Ou via la CLI Supabase :

```bash
cd /Users/owenchateau/Documents/gestion-locative
npx supabase db push
```

### 2. Vérifier la migration

Vérifiez que les tables ont été créées correctement :

```sql
-- Vérifier la table irl_indices
SELECT * FROM irl_indices ORDER BY year DESC, quarter DESC LIMIT 5;

-- Vérifier que les colonnes ont été ajoutées à leases
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'leases'
AND column_name IN ('irl_reference_quarter', 'irl_reference_year', 'last_indexation_date', 'indexation_enabled', 'initial_rent');

-- Vérifier la table indexation_history
SELECT * FROM indexation_history LIMIT 1;
```

### 3. Mettre à jour les baux existants (optionnel)

Si vous avez des baux existants, vous pouvez initialiser le loyer initial :

```sql
-- Copier rent_amount vers initial_rent pour les baux existants
UPDATE leases
SET initial_rent = rent_amount
WHERE initial_rent IS NULL;
```

## 📝 Données pré-remplies

Le script insère automatiquement les indices IRL de 2022 à 2024 (source INSEE) :

| Période | Valeur IRL |
|---------|------------|
| T1 2022 | 133.93 |
| T2 2022 | 135.84 |
| T3 2022 | 136.27 |
| T4 2022 | 137.26 |
| T1 2023 | 138.61 |
| T2 2023 | 140.59 |
| T3 2023 | 141.03 |
| T4 2023 | 142.06 |
| T1 2024 | 143.46 |
| T2 2024 | 145.17 |
| T3 2024 | 146.12 |
| T4 2024 | 147.41 |

## 🎯 Fonctionnalités disponibles après migration

### 1. Configuration des baux
- Activer/désactiver l'indexation par bail
- Sélectionner le trimestre et l'année de référence IRL
- Affichage automatique de la valeur IRL sélectionnée

### 2. Page Indexation (/indexation)
- **Section Alertes** : Liste des baux à indexer dans les 60 prochains jours
  - Calcul automatique du nouveau loyer
  - Affichage de l'augmentation en pourcentage
  - Bouton "Générer la lettre PDF"
  - Bouton "Appliquer l'indexation"

- **Section Historique** : Toutes les révisions passées
  - Date d'application
  - Ancien et nouveau loyer
  - Pourcentage d'augmentation
  - Statut de la lettre (générée ou non)

### 3. Dashboard
- Alerte automatique pour les indexations à venir dans les 30 prochains jours
- Lien direct vers la page d'indexation

### 4. Génération de lettres PDF
- Lettres conformes à l'article 17-1 de la loi du 6 juillet 1989
- Calcul détaillé avec références IRL
- En-têtes personnalisés avec coordonnées de l'entité
- Téléchargement automatique au format PDF

## 📐 Formule de calcul

```
Nouveau loyer = Loyer actuel × (Nouvel IRL / Ancien IRL)
```

Exemple :
- Loyer actuel : 950 €
- IRL T2 2023 : 140.59
- IRL T2 2024 : 145.17
- Nouveau loyer = 950 × (145.17 / 140.59) = **981.01 €**
- Augmentation : **+3.26%**

## 🔄 Mise à jour future des indices IRL

Pour ajouter de nouveaux indices IRL (publiés trimestriellement par l'INSEE) :

```sql
INSERT INTO irl_indices (year, quarter, value, published_at)
VALUES (2025, 1, 148.50, '2025-04-15')
ON CONFLICT (year, quarter) DO NOTHING;
```

Source officielle : [INSEE - IRL](https://www.insee.fr/fr/statistiques/serie/001515333)

## ⚠️ Points d'attention

1. **Sauvegarde** : Faites une sauvegarde de votre base de données avant d'appliquer la migration
2. **Baux existants** : Pensez à configurer le trimestre de référence IRL pour vos baux actifs
3. **Indices IRL** : Mettez à jour les indices IRL chaque trimestre pour garantir des calculs corrects
4. **Test** : Testez la fonctionnalité sur un bail de test avant utilisation en production

## 🐛 Rollback (en cas de problème)

Si vous devez annuler la migration :

```sql
-- Supprimer les tables créées
DROP TABLE IF EXISTS indexation_history;
DROP TABLE IF EXISTS irl_indices;

-- Supprimer les colonnes ajoutées
ALTER TABLE leases
  DROP COLUMN IF EXISTS irl_reference_quarter,
  DROP COLUMN IF EXISTS irl_reference_year,
  DROP COLUMN IF EXISTS last_indexation_date,
  DROP COLUMN IF EXISTS indexation_enabled,
  DROP COLUMN IF EXISTS initial_rent;

-- Supprimer les types enum (si nécessaire)
-- DROP TYPE IF EXISTS ...
```

## 📞 Support

En cas de problème lors de la migration :
1. Vérifiez les logs d'erreur Supabase
2. Assurez-vous d'avoir les permissions nécessaires
3. Consultez la documentation : [CLAUDE.md](../../CLAUDE.md)

## ✅ Checklist post-migration

- [ ] Migration SQL exécutée sans erreur
- [ ] Tables `irl_indices` et `indexation_history` créées
- [ ] Colonnes ajoutées à la table `leases`
- [ ] Données IRL pré-remplies (12 trimestres)
- [ ] Page `/indexation` accessible
- [ ] Menu "Indexation" visible dans la sidebar
- [ ] Test de création d'un bail avec indexation activée
- [ ] Test de génération d'une lettre d'indexation PDF
- [ ] Test d'application d'une indexation
- [ ] Alerte visible sur le dashboard (si baux éligibles)

---

**Date de migration** : 2024-12-22
**Version** : 1.0.0
**Auteur** : Claude (Assistant IA)
