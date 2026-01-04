# Améliorations du formulaire de candidature

## ✅ Améliorations UX appliquées

### 1. Composant ErrorMessage réutilisable
- Affiche les erreurs avec une icône `AlertCircle`
- Style cohérent sur tout le formulaire
- Meilleure visibilité des erreurs

### 2. Gestion intelligente des erreurs
- **Effacement automatique** : L'erreur d'un champ disparaît dès que l'utilisateur tape
- **Fonction `clearFieldError()`** : Nettoie les erreurs individuellement
- **Effacement complet** : Toutes les erreurs sont effacées quand l'utilisateur passe à l'étape suivante avec succès

### 3. Alerte globale en cas d'erreurs
- Bandeau rouge en haut du formulaire si des erreurs sont présentes
- Message clair : "Veuillez corriger les erreurs ci-dessous avant de continuer"
- Icône d'alerte pour plus de visibilité
- S'affiche uniquement s'il y a des erreurs de validation (pas d'erreur globale)

### 4. Messages d'erreur en français
- Tous les messages Zod sont déjà en français
- Schéma de validation amélioré pour l'étape 4 (Garant)
- Validation conditionnelle : si `has_guarantor` est coché, tous les champs garant sont obligatoires

### 5. Améliorations visuelles

#### Étape 1 (Informations personnelles)
- Placeholder ajouté à l'email : `nom@exemple.fr`
- Placeholder ajouté à l'adresse : `1 rue de la Paix, 75001 Paris`
- Date de naissance : limite `max` à aujourd'hui (pas de date future)

#### Étape 3 (Revenus)
- Symbole `€` affiché à droite des champs de revenus
- Placeholder `0.00` pour clarifier le format attendu

#### Étape 4 (Garant)
- **Info-box bleue** : Avertit que tous les champs sont obligatoires si garant coché
- Placeholders ajoutés sur tous les champs
- Symbole `€` pour le revenu du garant
- Erreur globale affichée si garant coché mais champs incomplets

### 6. Validation améliorée
- **Étape 4** : Schéma Zod personnalisé avec validation conditionnelle
- Vérifie que si `has_guarantor` est true :
  - `guarantor_first_name` >= 2 caractères
  - `guarantor_last_name` >= 2 caractères
  - `guarantor_email` contient un `@`
  - `guarantor_phone` >= 10 caractères
  - `guarantor_monthly_income` > 0

## 📋 Fichiers modifiés

1. **`src/schemas/candidateSchema.js`**
   - Amélioration du `candidateStep4Schema` avec validation conditionnelle

2. **`src/pages/PublicCandidateForm.jsx`**
   - Ajout du composant `ErrorMessage`
   - Ajout de la fonction `clearFieldError()`
   - Ajout de l'alerte globale d'erreurs
   - Remplacement de tous les affichages d'erreur par `<ErrorMessage />`
   - Ajout de placeholders pertinents
   - Ajout de symboles `€` pour les montants
   - Ajout d'une info-box pour le garant
   - Amélioration de `handleNext()` pour effacer les erreurs

## 🎯 Résultat

- **Meilleure UX** : Les erreurs disparaissent dès que l'utilisateur corrige
- **Clarté** : Messages d'erreur en français, cohérents et compréhensibles
- **Guidage** : Alerte globale + info-boxes pour guider l'utilisateur
- **Accessibilité** : Icônes visuelles pour renforcer les messages
- **Validation robuste** : Validation conditionnelle selon les choix de l'utilisateur

## 🧪 Test suggéré

1. Remplir le formulaire sans rien saisir → Voir les erreurs s'afficher
2. Commencer à taper dans un champ → L'erreur de ce champ disparaît
3. Passer à l'étape suivante avec succès → Toutes les erreurs disparaissent
4. Cocher "J'ai un garant" sans remplir les champs → Voir l'erreur globale
5. Remplir les champs du garant → Les erreurs disparaissent au fur et à mesure
