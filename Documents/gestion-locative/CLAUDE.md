# CLAUDE.md - SaaS Gestion Locative

> Ce fichier sert de référence pour tout assistant IA travaillant sur ce projet.
> Dernière mise à jour : Décembre 2024

---

## 📋 TABLE DES MATIÈRES

1. [Vision du projet](#-vision-du-projet)
2. [État actuel du projet](#-état-actuel-du-projet)
3. [Architecture multi-entités (NOUVELLE)](#-architecture-multi-entités-nouvelle)
4. [Stack technique](#️-stack-technique)
5. [Design System](#-design-system)
6. [Roadmap](#-roadmap)
7. [Architecture des dossiers](#-architecture-des-dossiers)
8. [Schéma de base de données](#️-schéma-de-base-de-données)
9. [Variables d'environnement](#-variables-denvironnement)
10. [Commandes utiles](#-commandes-utiles)

---

## 🎯 VISION DU PROJET

### Description
Application web SaaS de gestion locative destinée aux propriétaires bailleurs français.
Permet de gérer les biens immobiliers, les locataires, les baux et le suivi des loyers.

### Proposition de valeur
- Simplifier la gestion locative pour les particuliers et investisseurs immobiliers
- Support multi-entités (SCI, SARL, LMNP, nom propre)
- Gestion granulaire : Entité → Propriété → Lot → Bail
- Conformité automatique avec la législation française (loi ALUR, RGPD)
- Interface intuitive accessible aux non-techniciens

### Modèle économique
| Plan | Prix | Limites |
|------|------|---------|
| Gratuit | 0€ | 1 entité, 2 lots maximum |
| Premium | 15€/mois | Entités illimitées, lots illimités, fonctionnalités avancées |
| Locataire | Toujours gratuit | Accès consultation uniquement |

---

## 📦 ÉTAT ACTUEL DU PROJET

### ✅ Composants UI créés (src/components/ui/)

| Composant | Description | Props principales |
|-----------|-------------|-------------------|
| **Button.jsx** | Bouton réutilisable avec variants | `variant`: primary, secondary, danger, success<br>`size`: sm, md, lg<br>`disabled`, `onClick` |
| **Card.jsx** | Carte conteneur avec titre optionnel | `title`, `subtitle`<br>`padding`: true/false<br>`children` |
| **Badge.jsx** | Badge de statut coloré | `variant`: success, danger, warning, info, default<br>`children` |
| **StatCard.jsx** | Carte de statistique avec icône | `title`, `value`, `subtitle`<br>`variant`: blue, emerald, indigo, red<br>`icon`, `href` |
| **Alert.jsx** | Message d'alerte | `variant`: info, success, warning, error<br>`title`, `children` |
| **Table.jsx** | Tableau responsive (non utilisé actuellement) | `columns`, `data` |

### ✅ Layout créé (src/components/layout/)

**DashboardLayout.jsx** - Layout principal de l'application
- **Fonctionnalités** :
  - Sidebar fixe avec navigation
  - Header avec titre de page et bouton profil/déconnexion
  - Zone de contenu responsive
  - Navigation active automatique (basée sur l'URL)
- **Props** :
  - `title` : Titre de la page affiché dans le header
  - `children` : Contenu de la page

### ✅ Pages implémentées (src/pages/)

#### Pages publiques (3)
- `Home.jsx` - Page d'accueil
- `Login.jsx` - Connexion
- `Register.jsx` - Inscription

#### Pages principales refactorisées (6)
| Page | Statut | Composants utilisés | Fonctionnalités |
|------|--------|---------------------|-----------------|
| `Dashboard.jsx` | ✅ | DashboardLayout, StatCard, Alert, Card | Stats globales, alertes échéances/impayés, actions rapides |
| `Properties.jsx` | ✅ | DashboardLayout, Button, Badge, Card | Liste biens, statuts (vacant/occupé), limite plan gratuit |
| `Tenants.jsx` | ✅ | DashboardLayout, Button, Card | Liste locataires, informations contact |
| `Leases.jsx` | ✅ | DashboardLayout, Button, Badge, Card | Liste baux, statuts, périodes, montants |
| `Payments.jsx` | ✅ | DashboardLayout, Button, Badge, Card | Liste paiements, filtres statut, génération quittances PDF |
| `Profile.jsx` | ✅ | DashboardLayout, Button, Card | Modification profil utilisateur |

#### Formulaires refactorisés (4)
| Formulaire | Statut | Fonctionnalités |
|------------|--------|-----------------|
| `PropertyForm.jsx` | ✅ | Création/édition bien, validation, grilles responsive |
| `TenantForm.jsx` | ✅ | Création/édition locataire, informations complètes |
| `LeaseForm.jsx` | ✅ | Création/édition bail, sélecteurs bien/locataire |
| `PaymentForm.jsx` | ✅ | Création/édition paiement, pré-remplissage montant |

### 🎨 Design System actuel

#### Palette de couleurs
```css
Primary     : blue-600 (#2563EB)
Secondary   : slate-600 (#475569)
Success     : emerald-500 (#10B981)
Warning     : amber-500 (#F59E0B)
Danger      : red-500 (#EF4444)
Info        : blue-500 (#3B82F6)
Background  : gray-50 (#F9FAFB)
Sidebar     : slate-900 (#0F172A)
Text        : gray-900 (#111827)
Muted       : gray-500 (#6B7280)
```

#### Typographie
```css
Titres H1   : text-3xl font-bold (30px)
Titres H2   : text-2xl font-bold (24px)
Titres H3   : text-xl font-semibold (20px)
Body        : text-base (16px)
Small       : text-sm (14px)
Tiny        : text-xs (12px)
```

#### Espacements
```css
Layout      : space-y-6 (gap vertical 24px)
Cards       : p-6 (padding 24px)
Forms       : space-y-6 (gap vertical 24px)
Grilles     : gap-6 (24px entre colonnes)
```

#### Composants standards
- **Inputs** : `px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500`
- **Selects** : Mêmes classes que inputs
- **Boutons** : Variants via composant Button
- **Cards** : `bg-white rounded-lg shadow-sm`

---

## 🏗️ ARCHITECTURE MULTI-ENTITÉS (NOUVELLE)

### Vue d'ensemble

```
┌──────────────────────────────────────────────────────────────────┐
│                      UTILISATEUR (Bailleur)                       │
└────────────────────┬─────────────────────────────────────────────┘
                     │ 1:N
                     ▼
┌──────────────────────────────────────────────────────────────────┐
│              ENTITÉ JURIDIQUE (SCI, SARL, Nom propre...)         │
│  Gestion centralisée : comptabilité, TVA, documents légaux       │
└────────────────────┬─────────────────────────────────────────────┘
                     │ 1:N
                     ▼
┌──────────────────────────────────────────────────────────────────┐
│         PROPRIÉTÉ / IMMEUBLE (Bâtiment, Maison, Terrain...)      │
│  Immeuble entier, copropriété, syndic, valeur patrimoine         │
└────────────────────┬─────────────────────────────────────────────┘
                     │ 1:N
                     ▼
┌──────────────────────────────────────────────────────────────────┐
│           LOT / UNITÉ LOCATIVE (Appt, Parking, Cave...)          │
│  Unité louable : loyer, charges, DPE, équipements                │
└────────────────────┬─────────────────────────────────────────────┘
                     │ 1:N
                     ▼
┌──────────────────────────────────────────────────────────────────┐
│                   BAIL (Contrat de location)                      │
│  Lie un lot à un locataire, durée, montants, clauses             │
└────────────────────┬─────────────────────────────────────────────┘
                     │ 1:N
                     ▼
┌──────────────────────────────────────────────────────────────────┐
│                    PAIEMENTS (Loyers mensuels)                    │
│  Quittances, relances, historique des règlements                 │
└──────────────────────────────────────────────────────────────────┘
```

### Nouvelles tables SQL à créer

#### 1. Table `entities` (entités juridiques)
```sql
CREATE TYPE entity_type AS ENUM (
  'individual',        -- Nom propre
  'sci',              -- Société Civile Immobilière
  'sarl',             -- Société À Responsabilité Limitée
  'sas',              -- Société par Actions Simplifiée
  'sasu',             -- SAS Unipersonnelle
  'eurl',             -- SARL Unipersonnelle
  'lmnp',             -- Loueur Meublé Non Professionnel
  'lmp',              -- Loueur Meublé Professionnel
  'other'             -- Autre
);

CREATE TABLE entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Informations générales
  name VARCHAR(255) NOT NULL,
  entity_type entity_type NOT NULL DEFAULT 'individual',

  -- Informations légales
  siren VARCHAR(9),
  siret VARCHAR(14),
  vat_number VARCHAR(20),
  rcs_city VARCHAR(100),
  capital DECIMAL(15,2),

  -- Coordonnées
  address VARCHAR(500),
  city VARCHAR(100),
  postal_code VARCHAR(10),
  country VARCHAR(100) DEFAULT 'France',
  email VARCHAR(255),
  phone VARCHAR(20),

  -- Paramètres
  logo_url VARCHAR(500),
  color VARCHAR(7) DEFAULT '#2563EB',
  vat_applicable BOOLEAN DEFAULT FALSE,
  default_entity BOOLEAN DEFAULT FALSE,

  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Contraintes
  UNIQUE(user_id, name)
);

CREATE INDEX idx_entities_user ON entities(user_id);
CREATE INDEX idx_entities_default ON entities(user_id, default_entity);
```

#### 2. Table `properties` (propriétés/immeubles) - REFONTE
```sql
CREATE TYPE property_category AS ENUM (
  'building',         -- Immeuble entier
  'house',            -- Maison individuelle
  'apartment',        -- Appartement (si propriété = 1 seul lot)
  'commercial',       -- Local commercial
  'office',           -- Bureau
  'land',             -- Terrain
  'parking',          -- Parking (si propriété = 1 seul lot)
  'other'             -- Autre
);

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,

  -- Informations générales
  name VARCHAR(255) NOT NULL,
  category property_category NOT NULL DEFAULT 'building',

  -- Localisation
  address VARCHAR(500) NOT NULL,
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  country VARCHAR(100) DEFAULT 'France',

  -- Caractéristiques
  construction_year INTEGER,
  acquisition_date DATE,
  acquisition_price DECIMAL(15,2),
  current_value DECIMAL(15,2),

  -- Copropriété
  is_coproperty BOOLEAN DEFAULT FALSE,
  coproperty_lots INTEGER,
  syndic_name VARCHAR(255),
  syndic_email VARCHAR(255),
  syndic_phone VARCHAR(20),
  syndic_fees DECIMAL(10,2),

  -- Informations additionnelles
  description TEXT,
  notes TEXT,

  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(entity_id, name)
);

CREATE INDEX idx_properties_entity ON properties(entity_id);
```

#### 3. Table `lots` (unités locatives) - NOUVELLE
```sql
CREATE TYPE lot_type AS ENUM (
  'apartment',        -- Appartement
  'studio',           -- Studio
  'house',            -- Maison
  'commercial',       -- Local commercial
  'office',           -- Bureau
  'parking',          -- Parking
  'cellar',           -- Cave
  'storage',          -- Débarras/Box
  'land',             -- Terrain
  'other'             -- Autre
);

CREATE TYPE lot_status AS ENUM (
  'vacant',           -- Vacant
  'occupied',         -- Occupé
  'unavailable',      -- Indisponible (travaux, vente...)
  'for_sale'          -- En vente
);

CREATE TABLE lots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,

  -- Informations générales
  name VARCHAR(255) NOT NULL,
  reference VARCHAR(50),
  lot_type lot_type NOT NULL DEFAULT 'apartment',
  status lot_status NOT NULL DEFAULT 'vacant',

  -- Localisation dans la propriété
  floor INTEGER,
  door_number VARCHAR(20),

  -- Caractéristiques
  surface_area DECIMAL(10,2),
  nb_rooms INTEGER,
  nb_bedrooms INTEGER,
  nb_bathrooms INTEGER,

  -- Montants
  rent_amount DECIMAL(10,2) NOT NULL,
  charges_amount DECIMAL(10,2) DEFAULT 0,
  deposit_amount DECIMAL(10,2),

  -- Équipements
  furnished BOOLEAN DEFAULT FALSE,
  has_parking BOOLEAN DEFAULT FALSE,
  has_cellar BOOLEAN DEFAULT FALSE,
  has_balcony BOOLEAN DEFAULT FALSE,
  has_terrace BOOLEAN DEFAULT FALSE,
  has_garden BOOLEAN DEFAULT FALSE,
  has_elevator BOOLEAN DEFAULT FALSE,

  -- Énergie
  heating_type VARCHAR(100),
  dpe_rating VARCHAR(1),
  dpe_value INTEGER,
  dpe_date DATE,
  ges_rating VARCHAR(1),
  ges_value INTEGER,

  -- Copropriété (si applicable)
  coproperty_lot_number VARCHAR(50),
  coproperty_tantieme INTEGER,

  -- Informations additionnelles
  description TEXT,
  notes TEXT,

  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(property_id, reference)
);

CREATE INDEX idx_lots_property ON lots(property_id);
CREATE INDEX idx_lots_status ON lots(status);
```

#### 4. Modifications des tables existantes

```sql
-- Table tenants : ajouter la relation avec l'entité
ALTER TABLE tenants ADD COLUMN entity_id UUID REFERENCES entities(id) ON DELETE CASCADE;
CREATE INDEX idx_tenants_entity ON tenants(entity_id);

-- Table leases : remplacer property_id par lot_id
ALTER TABLE leases DROP COLUMN property_id;
ALTER TABLE leases ADD COLUMN lot_id UUID NOT NULL REFERENCES lots(id) ON DELETE CASCADE;
CREATE INDEX idx_leases_lot ON leases(lot_id);

-- Table documents : ajouter les relations multi-niveaux
ALTER TABLE documents ADD COLUMN entity_id UUID REFERENCES entities(id);
ALTER TABLE documents ADD COLUMN property_id UUID REFERENCES properties(id);
ALTER TABLE documents ADD COLUMN lot_id UUID REFERENCES lots(id);
CREATE INDEX idx_documents_entity ON documents(entity_id);
CREATE INDEX idx_documents_property ON documents(property_id);
CREATE INDEX idx_documents_lot ON documents(lot_id);
```

### Nouvelles routes frontend à créer

#### Routes Entités
```
/entities              → Liste des entités juridiques
/entities/new          → Créer une nouvelle entité
/entities/:id          → Détail entité avec stats (revenus, taux occupation, rendement)
/entities/:id/edit     → Modifier une entité
/entities/:id/settings → Paramètres avancés (TVA, logo, couleur)
```

#### Routes Propriétés (refonte)
```
/properties            → Liste des propriétés (filtrable par entité)
/properties/new        → Créer une propriété
/properties/:id        → Détail propriété avec liste des lots
/properties/:id/edit   → Modifier une propriété
/properties/:id/lots   → Gérer les lots de la propriété
```

#### Routes Lots (nouvelles)
```
/lots                  → Liste de tous les lots (filtrable par entité/propriété)
/lots/new              → Créer un nouveau lot
/lots/:id              → Détail lot avec bail actif, historique, documents
/lots/:id/edit         → Modifier un lot
```

### Fonctionnalités à implémenter

#### 1. Sélecteur d'entité global
- Dans la sidebar du DashboardLayout
- Dropdown avec liste des entités + option "Toutes les entités"
- Filtre automatique toutes les vues (dashboard, biens, baux, paiements)
- Stockage de la sélection dans le localStorage

#### 2. Statistiques par entité
- **Revenus mensuels** : Somme des loyers des baux actifs
- **Taux d'occupation** : (Lots occupés / Total lots) × 100
- **Rendement brut** : (Revenus annuels / Valeur patrimoine) × 100
- **Impayés** : Total des paiements en retard
- **Nombre de propriétés**
- **Nombre de lots**
- **Nombre de locataires**

#### 3. Dashboard multi-entités
- **Vue globale** : Toutes entités confondues
- **Vue filtrée** : Une entité spécifique
- **Comparaison** : Tableau comparatif entre entités
- **Graphiques** :
  - Répartition revenus par entité (pie chart)
  - Évolution revenus mensuels (line chart)
  - Taux occupation par entité (bar chart)

#### 4. Gestion hiérarchique
- Fil d'Ariane : Entité > Propriété > Lot > Bail
- Navigation contextuelle avec retour au niveau supérieur
- Icônes et couleurs par niveau hiérarchique

---

## 🛠️ STACK TECHNIQUE

### Frontend
```
Framework      : React 18+
Build tool     : Vite 7.3
Styling        : TailwindCSS 4
Routing        : React Router v6
State          : Context API + useState
HTTP Client    : Supabase Client
PDF Generation : jsPDF
Hébergement    : Vercel
```

### Backend
```
Backend-as-a-Service : Supabase
Database             : PostgreSQL (via Supabase)
Auth                 : Supabase Auth
Storage              : Supabase Storage
Real-time            : Supabase Realtime (à utiliser)
Edge Functions       : Supabase Functions (à utiliser)
```

### Services futurs
```
Email          : Resend ou SendGrid
Paiements      : Stripe
Signature élec : Yousign
Connexion banc : Bridge ou Plaid
```

---

## 🎨 DESIGN SYSTEM

### Composants UI disponibles

#### Button
```jsx
import Button from '../components/ui/Button'

<Button variant="primary" size="lg" onClick={handleClick}>
  Créer un bien
</Button>

// Variants: primary, secondary, danger, success, outline
// Sizes: sm, md, lg
```

#### Card
```jsx
import Card from '../components/ui/Card'

<Card title="Titre" subtitle="Sous-titre">
  Contenu de la carte
</Card>

// Props: title, subtitle, padding (true/false), className
```

#### Badge
```jsx
import Badge from '../components/ui/Badge'

<Badge variant="success">Actif</Badge>

// Variants: success, danger, warning, info, default
```

#### StatCard
```jsx
import StatCard from '../components/ui/StatCard'

<StatCard
  title="Revenus mensuels"
  value="3 450 €"
  subtitle="Voir détails →"
  variant="indigo"
  href="/payments"
  icon={<svg>...</svg>}
/>

// Variants: blue, emerald, indigo, red
```

#### Alert
```jsx
import Alert from '../components/ui/Alert'

<Alert variant="warning" title="Attention">
  3 baux arrivent à échéance dans les 30 prochains jours
</Alert>

// Variants: info, success, warning, error
```

#### DashboardLayout
```jsx
import DashboardLayout from '../components/layout/DashboardLayout'

function MyPage() {
  return (
    <DashboardLayout title="Ma page">
      {/* Contenu */}
    </DashboardLayout>
  )
}
```

### Conventions de code

#### Nomenclature
- **Composants React** : PascalCase (Button.jsx, StatCard.jsx)
- **Hooks** : camelCase avec préfixe use (useAuth.js, useEntities.js)
- **Services** : camelCase (entityService.js, propertyService.js)
- **Pages** : PascalCase (Dashboard.jsx, Properties.jsx)
- **Utilitaires** : camelCase (formatDate.js, calculateRate.js)

#### Structure des composants
```jsx
// 1. Imports
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'

// 2. Composant
function MyComponent() {
  // 3. Hooks
  const navigate = useNavigate()
  const [data, setData] = useState([])

  // 4. useEffect
  useEffect(() => {
    fetchData()
  }, [])

  // 5. Fonctions
  const fetchData = async () => {
    // ...
  }

  // 6. Render
  return (
    <DashboardLayout title="Mon composant">
      {/* JSX */}
    </DashboardLayout>
  )
}

// 7. Export
export default MyComponent
```

#### Classes Tailwind
- Utiliser uniquement les utility classes
- Ordre : layout → spacing → sizing → typography → colors → effects
- Responsive : mobile-first (sm:, md:, lg:, xl:)
- Hover et focus : hover:, focus:

```jsx
// Exemple d'input
<input
  type="text"
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
/>
```

---

## 🗺️ ROADMAP

### ✅ Phase 0 : MVP Initial (TERMINÉ)
- [x] Authentification (Supabase Auth)
- [x] Gestion des biens
- [x] Gestion des locataires
- [x] Gestion des baux
- [x] Gestion des paiements
- [x] Génération quittances PDF
- [x] Design system et composants UI
- [x] DashboardLayout avec navigation

### 🚧 Phase 1 : Architecture Multi-Entités (2-3 semaines)

#### Semaine 1 : Base de données et migration
- [ ] **Jour 1-2** : Créer les tables entities, properties, lots dans Supabase
- [ ] **Jour 3-4** : Script de migration des données existantes
  - Créer une entité par défaut "Mon patrimoine" pour chaque utilisateur
  - Migrer properties → properties (avec entity_id)
  - Créer 1 lot par propriété existante
  - Mettre à jour les baux (property_id → lot_id)
- [ ] **Jour 5** : Tests de la migration, rollback si nécessaire

#### Semaine 2 : Pages Entités et Propriétés
- [ ] **Jour 1-2** : Pages Entités
  - Liste des entités avec stats (revenus, nb propriétés, nb lots)
  - Formulaire création entité (EntityForm.jsx)
  - Page détail entité avec dashboard dédié
- [ ] **Jour 3-4** : Pages Propriétés (refonte)
  - Liste propriétés avec filtre par entité
  - Formulaire création/édition propriété (PropertyForm.jsx refonte)
  - Page détail propriété avec liste des lots
- [ ] **Jour 5** : Sélecteur d'entité dans la sidebar

#### Semaine 3 : Pages Lots et mise à jour globale
- [ ] **Jour 1-2** : Pages Lots
  - Liste lots avec filtres (entité, propriété, statut)
  - Formulaire création/édition lot (LotForm.jsx)
  - Page détail lot avec bail actif
- [ ] **Jour 3-4** : Mise à jour pages existantes
  - Dashboard : stats par entité sélectionnée
  - Baux : utiliser lot_id au lieu de property_id
  - Paiements : afficher entité et propriété
  - Locataires : lier à entity_id
- [ ] **Jour 5** : Tests, corrections bugs, documentation

### 📅 Phase 2 : Fonctionnalités Légales (2-3 semaines)

#### Semaine 1 : Indexation loyers IRL
- [ ] **IRL automatique** : Récupération API INSEE
- [ ] **Calcul automatique** : Nouveau loyer révisé
- [ ] **Générateur PDF** : Lettre d'indexation conforme
- [ ] **Historique** : Suivi des révisions par bail

#### Semaine 2 : Bibliothèque de documents
- [ ] **Modèles PDF** :
  - Bail vide conforme loi ALUR
  - Bail meublé conforme loi ALUR
  - État des lieux entrée
  - État des lieux sortie
  - Quittance de loyer
  - Attestation de loyer
  - Lettre résiliation bailleur
  - Lettre résiliation locataire
  - Congé pour vente
  - Augmentation de loyer
  - Lettre indexation IRL
  - Demande régularisation charges
  - Appel de loyer
  - Mise en demeure
  - Attestation assurance
- [ ] **Générateur dynamique** : Remplissage auto avec données
- [ ] **Stockage** : Supabase Storage par bail/locataire

#### Semaine 3 : États des lieux numériques
- [ ] **Formulaire structuré** : Pièce par pièce
- [ ] **Upload photos** : Multiple par pièce/élément
- [ ] **Signature électronique** : Bailleur + locataire
- [ ] **Génération PDF** : État des lieux complet avec photos
- [ ] **Comparaison** : Entrée vs Sortie

### 📧 Phase 3 : Automatisation (2-3 semaines)

#### Semaine 1 : Envoi emails automatiques
- [ ] **Intégration Resend/SendGrid**
- [ ] **Templates emails** :
  - Quittance mensuelle
  - Avis d'échéance
  - Rappel de paiement
  - Relance impayé
- [ ] **Envoi automatique** : Quittances au paiement
- [ ] **Planification** : Avis d'échéance 5 jours avant

#### Semaine 2 : Rappels et relances
- [ ] **Système de rappels** : Cron job quotidien
- [ ] **Relances automatiques** :
  - J+3 : Rappel amical
  - J+7 : Premier rappel formel
  - J+15 : Mise en demeure
- [ ] **Notifications** : Email + in-app

#### Semaine 3 : Signature électronique
- [ ] **Intégration Yousign**
- [ ] **Signature baux** : Dématérialisation complète
- [ ] **Signature EDL** : États des lieux
- [ ] **Archivage** : Documents signés dans Supabase

### 💰 Phase 4 : Monétisation (3-4 semaines)

#### Semaine 1 : Paiements Stripe
- [ ] **Intégration Stripe**
- [ ] **Plans** :
  - Gratuit : 1 entité, 2 lots
  - Premium : 15€/mois, illimité
- [ ] **Checkout** : Abonnement mensuel
- [ ] **Webhooks** : Gestion statut abonnement
- [ ] **Limites** : Blocage si dépassement plan gratuit

#### Semaine 2 : Aide déclaration fiscale
- [ ] **Export 2044** : Synthèse revenus fonciers
- [ ] **Calcul charges déductibles**
- [ ] **Calcul amortissements** (LMNP/LMP)
- [ ] **Génération PDF** : Récapitulatif fiscal

#### Semaine 3 : Export comptable
- [ ] **Export CSV** : Revenus, charges, paiements
- [ ] **Export Excel** : Tableaux formatés
- [ ] **Exports par entité** : Comptabilité séparée
- [ ] **Imports** : Import paiements CSV

#### Semaine 4 : Connexion bancaire (optionnel)
- [ ] **Intégration Bridge/Plaid**
- [ ] **Réconciliation automatique** : Paiements
- [ ] **Détection impayés** : Alerte auto
- [ ] **Synchronisation** : Daily sync

---

## 📁 ARCHITECTURE DES DOSSIERS

### Frontend (React + Vite)
```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/                     # Images, fonts, fichiers statiques
│   │   └── images/
│   ├── components/                 # Composants réutilisables
│   │   ├── layout/                 # Composants de mise en page
│   │   │   └── DashboardLayout.jsx ✅
│   │   └── ui/                     # Composants UI génériques
│   │       ├── Alert.jsx           ✅
│   │       ├── Badge.jsx           ✅
│   │       ├── Button.jsx          ✅
│   │       ├── Card.jsx            ✅
│   │       ├── StatCard.jsx        ✅
│   │       └── Table.jsx           ✅
│   ├── pages/                      # Pages de l'application
│   │   ├── auth/                   # Pages authentification
│   │   │   ├── Login.jsx           ✅
│   │   │   └── Register.jsx        ✅
│   │   ├── entities/               # Pages entités (À CRÉER)
│   │   │   ├── Entities.jsx        ❌
│   │   │   ├── EntityForm.jsx      ❌
│   │   │   └── EntityDetail.jsx    ❌
│   │   ├── properties/             # Pages propriétés
│   │   │   ├── Properties.jsx      ✅ (À REFONDRE)
│   │   │   ├── PropertyForm.jsx    ✅ (À REFONDRE)
│   │   │   └── PropertyDetail.jsx  ❌
│   │   ├── lots/                   # Pages lots (À CRÉER)
│   │   │   ├── Lots.jsx            ❌
│   │   │   ├── LotForm.jsx         ❌
│   │   │   └── LotDetail.jsx       ❌
│   │   ├── tenants/                # Pages locataires
│   │   │   ├── Tenants.jsx         ✅
│   │   │   └── TenantForm.jsx      ✅
│   │   ├── leases/                 # Pages baux
│   │   │   ├── Leases.jsx          ✅
│   │   │   └── LeaseForm.jsx       ✅ (À METTRE À JOUR)
│   │   ├── payments/               # Pages paiements
│   │   │   ├── Payments.jsx        ✅
│   │   │   └── PaymentForm.jsx     ✅
│   │   ├── Dashboard.jsx           ✅
│   │   ├── Home.jsx                ✅
│   │   └── Profile.jsx             ✅
│   ├── hooks/                      # Custom hooks
│   │   └── useAuth.js              ✅
│   ├── services/                   # Appels API
│   │   └── (À CRÉER selon besoins)
│   ├── context/                    # React Context
│   │   └── AuthContext.jsx         ✅
│   ├── utils/                      # Fonctions utilitaires
│   │   └── constants.js
│   ├── lib/                        # Configuration librairies
│   │   └── supabase.js             ✅
│   ├── App.jsx                     # Composant racine
│   ├── main.jsx                    # Point d'entrée
│   └── index.css                   # Styles globaux + Tailwind
├── .env                            # Variables d'environnement
├── .gitignore
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

## 🗄️ SCHÉMA DE BASE DE DONNÉES

### Vue d'ensemble actuelle (À MIGRER)

```
users (bailleurs)
  ├── properties (biens)
  ├── tenants (locataires)
  │
  └── leases (baux)
        ├── property_id → properties
        ├── tenant_id → tenants
        └── payments (paiements)
```

### Vue d'ensemble cible (NOUVELLE ARCHITECTURE)

```
users (bailleurs)
  └── entities (entités juridiques)
        ├── properties (propriétés/immeubles)
        │     └── lots (unités locatives)
        │           └── leases (baux)
        │                 ├── tenant → tenants
        │                 └── payments (paiements)
        └── tenants (locataires)
```

### Schéma détaillé (voir section Architecture Multi-Entités)

Les schémas SQL complets des tables sont détaillés dans la section **Architecture Multi-Entités** ci-dessus.

---

## 🔧 VARIABLES D'ENVIRONNEMENT

### Frontend (.env)
```bash
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Environnement
VITE_APP_ENV=development
VITE_APP_NAME="Gestion Locative"
```

### Backend/Supabase (.env) - À configurer selon besoins futurs
```bash
# Node.js (si backend NestJS utilisé)
NODE_ENV=development
PORT=3000

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret

# Email (Resend/SendGrid)
RESEND_API_KEY=re_xxx
SENDGRID_API_KEY=SG.xxx

# Paiements (Stripe)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Signature électronique (Yousign)
YOUSIGN_API_KEY=ys_xxx

# Connexion bancaire (Bridge)
BRIDGE_CLIENT_ID=xxx
BRIDGE_CLIENT_SECRET=xxx
```

---

## ⚡ COMMANDES UTILES

### Frontend
```bash
# Navigation
cd frontend

# Installation dépendances
npm install

# Développement
npm run dev
# → http://localhost:5173

# Build production
npm run build

# Preview build
npm run preview

# Lint
npm run lint

# Format
npm run format
```

### Backend/Supabase
```bash
# Supabase CLI
npx supabase login
npx supabase init
npx supabase start
npx supabase db reset
npx supabase db push
npx supabase gen types typescript

# Accès Supabase Dashboard
# https://supabase.com/dashboard

# SQL Editor
# https://supabase.com/dashboard/project/xxxxx/sql
```

### Git
```bash
# Status
git status

# Commit rapide
git add .
git commit -m "feat: description"
git push origin main

# Branches
git checkout -b feature/nouvelle-fonctionnalite
git merge feature/nouvelle-fonctionnalite
git branch -d feature/nouvelle-fonctionnalite

# Convention commits
# feat: nouvelle fonctionnalité
# fix: correction bug
# refactor: refactorisation
# style: design/CSS
# docs: documentation
# chore: tâches diverses
```

### Déploiement

#### Frontend (Vercel)
```bash
# Connecter le repo GitHub à Vercel
# Build Command: npm run build
# Output Directory: dist
# Install Command: npm install

# Variables d'environnement à configurer sur Vercel:
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY
```

#### Base de données (Supabase)
```bash
# Backups automatiques activés
# Point-in-time recovery disponible
# Migrations versionnées dans /supabase/migrations
```

---

## 📚 RESSOURCES UTILES

### Documentation
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/docs)
- [Supabase](https://supabase.com/docs)
- [React Router](https://reactrouter.com/)

### Législation française
- [Loi ALUR](https://www.legifrance.gouv.fr/loda/id/JORFTEXT000028772256/)
- [Modèle de bail officiel](https://www.service-public.fr/particuliers/vosdroits/R31600)
- [CNIL - RGPD](https://www.cnil.fr/fr/rgpd-de-quoi-parle-t-on)
- [IRL - Indice de référence des loyers](https://www.insee.fr/fr/statistiques/serie/001515333)

### Outils
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Stripe Dashboard](https://dashboard.stripe.com/)

---

## ✅ CHECKLIST DÉVELOPPEMENT

### Avant de commencer une feature
- [ ] Lire la documentation de la feature dans ce fichier
- [ ] Vérifier que les dépendances sont installées
- [ ] Vérifier que l'environnement local fonctionne
- [ ] Créer une branche Git dédiée

### Pendant le développement
- [ ] Utiliser les composants UI existants (Button, Card, Badge...)
- [ ] Respecter le design system (couleurs, espacements)
- [ ] Tester sur mobile et desktop
- [ ] Gérer les états de chargement et d'erreur
- [ ] Ajouter des messages utilisateur clairs

### Avant de commit
- [ ] Tester toutes les fonctionnalités
- [ ] Vérifier qu'il n'y a pas d'erreurs console
- [ ] Vérifier le responsive
- [ ] Linter le code
- [ ] Écrire un message de commit clair

### Avant de déployer
- [ ] Build fonctionne sans erreurs
- [ ] Variables d'environnement configurées
- [ ] Tests manuels complets
- [ ] Backup de la base de données si migration

---

> **Note finale** : Ce fichier est la source de vérité pour ce projet.
> Référez-vous toujours à ce document avant de faire des modifications importantes.
> Mettez-le à jour dès qu'une décision architecturale est prise.
>
> **Dernière mise à jour** : Décembre 2024 - Phase 1 en préparation
