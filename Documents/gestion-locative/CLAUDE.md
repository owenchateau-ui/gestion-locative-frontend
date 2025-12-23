# CLAUDE.md - SaaS Gestion Locative

> Ce fichier sert de référence pour tout assistant IA travaillant sur ce projet.
> Dernière mise à jour : 23 Décembre 2024

---

## 📋 TABLE DES MATIÈRES

1. [Vision du projet](#-vision-du-projet)
2. [État actuel du projet](#-état-actuel-du-projet)
3. [Structure de menu](#-structure-de-menu)
4. [Architecture multi-entités (NOUVELLE)](#-architecture-multi-entités-nouvelle)
5. [Stack technique](#️-stack-technique)
6. [Design System](#-design-system)
7. [Routes à créer](#-routes-à-créer)
8. [Composants UI à créer](#-composants-ui-à-créer)
9. [Futures fonctionnalités détaillées](#-futures-fonctionnalités-détaillées)
10. [Roadmap](#-roadmap)
11. [Architecture des dossiers](#-architecture-des-dossiers)
12. [Schéma de base de données](#️-schéma-de-base-de-données)
13. [Variables d'environnement](#-variables-denvironnement)
14. [Commandes utiles](#-commandes-utiles)

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

## 🧭 STRUCTURE DE MENU

### Navigation principale (Sidebar)

La sidebar de navigation est organisée par catégories fonctionnelles. Chaque item de menu indique son statut d'implémentation.

#### 📊 Tableau de bord
- ✅ **Dashboard** (`/dashboard`) - Vue d'ensemble avec statistiques globales

#### 🏛️ Patrimoine
- ✅ **Entités** (`/entities`) - Gestion des entités juridiques (SCI, SARL, LMNP...)
- ✅ **Propriétés** (`/properties`) - Gestion des immeubles et bâtiments
- ✅ **Lots** (`/lots`) - Gestion des unités locatives
- ✅ **Indexation IRL** (`/indexation`) - Révision automatique des loyers

#### 👥 Locataires
- ✅ **Liste locataires** (`/tenants`) - Gestion des locataires
- ✅ **Baux** (`/leases`) - Gestion des contrats de location
- 🔜 **Candidatures** (`/applications`) - Gestion des dossiers de candidature
- 🔜 **Portail locataire** (`/tenant-portal`) - Accès locataire (consultation, paiement en ligne)

#### 💰 Finances
- ✅ **Paiements** (`/payments`) - Suivi des loyers et quittances
- ✅ **Quittances** (intégré dans Paiements) - Génération PDF
- 🔜 **Charges** (`/charges`) - Gestion et régularisation des charges
- 🔜 **Comptabilité** (`/accounting`) - Exports comptables et fiscaux
- 🔜 **Déclaration fiscale** (`/tax-declaration`) - Aide déclaration 2044

#### 📄 Documents
- 🔜 **Bibliothèque** (`/documents`) - Tous les documents par catégorie
- 🔜 **États des lieux** (`/inventories`) - EDL entrée/sortie numériques
- 🔜 **Modèles** (`/templates`) - Modèles de documents légaux
- 🔜 **Signatures** (`/signatures`) - Suivi des signatures électroniques

#### 🔧 Interventions
- 🔜 **Demandes** (`/maintenance-requests`) - Demandes d'intervention locataires
- 🔜 **Interventions** (`/maintenance`) - Suivi des travaux et réparations
- 🔜 **Prestataires** (`/service-providers`) - Carnet d'adresses prestataires

#### 📨 Communication
- 🔜 **Messages** (`/messages`) - Messagerie interne
- 🔜 **Notifications** (`/notifications`) - Centre de notifications
- 🔜 **Historique emails** (`/email-history`) - Emails envoyés automatiquement
- 🔜 **Historique SMS** (`/sms-history`) - SMS envoyés (relances, alertes)

#### ⚙️ Paramètres
- ✅ **Profil** (`/profile`) - Informations personnelles
- 🔜 **Abonnement** (`/subscription`) - Plan et facturation
- 🔜 **Préférences** (`/preferences`) - Notifications, langue, etc.
- 🔜 **Sécurité** (`/security`) - Mot de passe, 2FA

### Légende
- ✅ **FAIT** : Fonctionnalité implémentée et opérationnelle
- 🔜 **À FAIRE** : Fonctionnalité planifiée dans la roadmap

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

## 🛣️ ROUTES À CRÉER

### Routes existantes ✅ FAIT

#### Authentification
- ✅ `/` - Page d'accueil publique
- ✅ `/login` - Connexion
- ✅ `/register` - Inscription

#### Dashboard
- ✅ `/dashboard` - Tableau de bord principal

#### Patrimoine
- ✅ `/entities` - Liste des entités
- ✅ `/entities/new` - Créer une entité
- ✅ `/entities/:id` - Détail d'une entité
- ✅ `/entities/:id/edit` - Modifier une entité
- ✅ `/properties` - Liste des propriétés
- ✅ `/properties/new` - Créer une propriété
- ✅ `/properties/:id/edit` - Modifier une propriété
- ✅ `/lots` - Liste des lots
- ✅ `/lots/new` - Créer un lot
- ✅ `/lots/:id/edit` - Modifier un lot
- ✅ `/indexation` - Indexation IRL

#### Locataires et baux
- ✅ `/tenants` - Liste des locataires
- ✅ `/tenants/new` - Créer un locataire
- ✅ `/tenants/:id/edit` - Modifier un locataire
- ✅ `/leases` - Liste des baux
- ✅ `/leases/new` - Créer un bail
- ✅ `/leases/:id/edit` - Modifier un bail

#### Finances
- ✅ `/payments` - Liste des paiements
- ✅ `/payments/new` - Enregistrer un paiement
- ✅ `/payments/:id/edit` - Modifier un paiement

#### Paramètres
- ✅ `/profile` - Profil utilisateur

### Routes à créer 🔜 À FAIRE

#### Patrimoine (détails)
- 🔜 `/properties/:id` - Page détail propriété avec liste des lots
- 🔜 `/lots/:id` - Page détail lot avec bail actif et historique

#### Candidatures
- 🔜 `/applications` - Liste des candidatures
- 🔜 `/applications/new` - Nouvelle candidature
- 🔜 `/applications/:id` - Détail candidature avec documents
- 🔜 `/applications/:id/review` - Évaluation candidature

#### Portail locataire
- 🔜 `/tenant-portal` - Dashboard locataire (consultation uniquement)
- 🔜 `/tenant-portal/lease` - Mon bail
- 🔜 `/tenant-portal/payments` - Mes paiements et quittances
- 🔜 `/tenant-portal/documents` - Mes documents
- 🔜 `/tenant-portal/maintenance` - Mes demandes d'intervention
- 🔜 `/tenant-portal/profile` - Mon profil

#### Finances avancées
- 🔜 `/charges` - Gestion des charges
- 🔜 `/charges/new` - Enregistrer une charge
- 🔜 `/charges/:id/edit` - Modifier une charge
- 🔜 `/charges/reconciliation` - Régularisation annuelle des charges
- 🔜 `/accounting` - Comptabilité et exports
- 🔜 `/accounting/export` - Export comptable (CSV, Excel)
- 🔜 `/tax-declaration` - Aide déclaration fiscale 2044
- 🔜 `/tax-declaration/preview` - Aperçu déclaration

#### Documents
- 🔜 `/documents` - Bibliothèque de documents
- 🔜 `/documents/upload` - Upload multiple de documents
- 🔜 `/inventories` - États des lieux
- 🔜 `/inventories/new` - Créer un état des lieux
- 🔜 `/inventories/:id` - Détail état des lieux avec photos
- 🔜 `/inventories/:id/edit` - Modifier état des lieux
- 🔜 `/inventories/:id/compare` - Comparer entrée/sortie
- 🔜 `/templates` - Modèles de documents
- 🔜 `/templates/:type/generate` - Générer un document
- 🔜 `/signatures` - Suivi des signatures électroniques
- 🔜 `/signatures/:id` - Détail signature

#### Interventions
- 🔜 `/maintenance-requests` - Demandes d'intervention
- 🔜 `/maintenance-requests/new` - Nouvelle demande
- 🔜 `/maintenance-requests/:id` - Détail demande
- 🔜 `/maintenance` - Suivi des interventions
- 🔜 `/maintenance/new` - Planifier une intervention
- 🔜 `/maintenance/:id` - Détail intervention
- 🔜 `/maintenance/:id/edit` - Modifier intervention
- 🔜 `/service-providers` - Carnet d'adresses prestataires
- 🔜 `/service-providers/new` - Ajouter un prestataire
- 🔜 `/service-providers/:id/edit` - Modifier un prestataire

#### Communication
- 🔜 `/messages` - Messagerie interne
- 🔜 `/messages/compose` - Nouveau message
- 🔜 `/messages/:id` - Conversation
- 🔜 `/notifications` - Centre de notifications
- 🔜 `/email-history` - Historique emails envoyés
- 🔜 `/sms-history` - Historique SMS envoyés

#### Paramètres
- 🔜 `/subscription` - Plan et facturation
- 🔜 `/subscription/upgrade` - Passer à Premium
- 🔜 `/preferences` - Préférences utilisateur
- 🔜 `/security` - Sécurité et 2FA

#### Diagnostics et conformité
- 🔜 `/diagnostics` - Gestion des diagnostics immobiliers
- 🔜 `/diagnostics/new` - Ajouter un diagnostic
- 🔜 `/diagnostics/:id/edit` - Modifier un diagnostic
- 🔜 `/diagnostics/alerts` - Alertes diagnostics expirés

---

## 🎨 COMPOSANTS UI À CRÉER

### Composants layout

#### Sidebar.jsx 🔜
Navigation latérale avec menu hiérarchique et sélecteur d'entité.
```jsx
<Sidebar
  currentEntity={selectedEntity}
  onEntityChange={handleEntityChange}
  entities={userEntities}
/>
```

**Props** :
- `currentEntity` : Entité actuellement sélectionnée
- `onEntityChange` : Callback changement d'entité
- `entities` : Liste des entités de l'utilisateur
- `activeRoute` : Route active pour highlighting

**Fonctionnalités** :
- Menu hiérarchique avec catégories collapsibles
- Sélecteur d'entité en haut (dropdown)
- Indicateur visuel route active
- Responsive (collapse sur mobile)

#### Breadcrumb.jsx 🔜
Fil d'Ariane pour navigation hiérarchique.
```jsx
<Breadcrumb items={[
  { label: 'Entités', href: '/entities' },
  { label: 'SCI Famille', href: '/entities/123' },
  { label: 'Immeuble Paris 15', href: '/properties/456' },
  { label: 'Appt 3A', href: '/lots/789' }
]} />
```

#### EmptyState.jsx 🔜
État vide avec icône et call-to-action.
```jsx
<EmptyState
  icon={<BuildingIcon />}
  title="Aucune propriété"
  description="Commencez par ajouter votre première propriété"
  action={<Button href="/properties/new">Ajouter une propriété</Button>}
/>
```

#### ComingSoon.jsx 🔜
Page placeholder pour fonctionnalités à venir.
```jsx
<ComingSoon
  feature="Portail locataire"
  description="Accès consultation pour vos locataires"
  estimatedDate="Q2 2025"
/>
```

### Composants de formulaire

#### FileUpload.jsx 🔜
Upload de fichiers avec drag & drop et preview.
```jsx
<FileUpload
  multiple={true}
  accept="image/*,application/pdf"
  maxSize={10} // Mo
  onUpload={handleUpload}
  preview={true}
/>
```

**Fonctionnalités** :
- Drag & drop
- Preview images et PDF
- Barre de progression upload
- Validation taille et type
- Support multiple fichiers

#### DateRangePicker.jsx 🔜
Sélecteur de plage de dates.
```jsx
<DateRangePicker
  startDate={startDate}
  endDate={endDate}
  onChange={handleDateChange}
  minDate={new Date()}
/>
```

#### AutoComplete.jsx 🔜
Input avec autocomplétion.
```jsx
<AutoComplete
  placeholder="Rechercher un locataire..."
  options={tenants}
  onSelect={handleSelect}
  displayKey="full_name"
  searchKeys={['full_name', 'email']}
/>
```

#### RichTextEditor.jsx 🔜
Éditeur de texte enrichi pour notes et descriptions.
```jsx
<RichTextEditor
  value={content}
  onChange={setContent}
  placeholder="Ajouter des notes..."
  toolbar={['bold', 'italic', 'list', 'link']}
/>
```

### Composants de données

#### DataTable.jsx 🔜
Tableau avancé avec tri, filtres, pagination.
```jsx
<DataTable
  columns={columns}
  data={data}
  sortable={true}
  filterable={true}
  pagination={true}
  pageSize={20}
  onRowClick={handleRowClick}
  actions={rowActions}
/>
```

**Fonctionnalités** :
- Tri multi-colonnes
- Filtres par colonne
- Pagination côté client/serveur
- Sélection lignes (checkbox)
- Actions par ligne (dropdown)
- Export CSV/Excel
- Responsive (scroll horizontal sur mobile)

#### StatChart.jsx 🔜
Graphiques statistiques (line, bar, pie).
```jsx
<StatChart
  type="line"
  data={revenueData}
  xKey="month"
  yKey="amount"
  title="Évolution des revenus"
  color="blue"
/>
```

**Types supportés** :
- `line` : Graphique en ligne
- `bar` : Graphique en barres
- `pie` : Camembert
- `area` : Aire

#### Timeline.jsx 🔜
Chronologie d'événements.
```jsx
<Timeline events={[
  { date: '2024-01-15', type: 'lease_start', description: 'Début du bail' },
  { date: '2024-02-01', type: 'payment', description: 'Paiement loyer janvier' },
  { date: '2024-03-01', type: 'indexation', description: 'Révision loyer IRL' }
]} />
```

#### ProgressBar.jsx 🔜
Barre de progression.
```jsx
<ProgressBar
  value={75}
  max={100}
  label="Taux d'occupation"
  color="emerald"
  showPercentage={true}
/>
```

### Composants métier

#### LeaseCard.jsx 🔜
Carte récapitulative d'un bail.
```jsx
<LeaseCard
  lease={lease}
  showTenant={true}
  showProperty={true}
  onViewDetails={() => navigate(`/leases/${lease.id}`)}
/>
```

**Affiche** :
- Locataire avec photo
- Propriété et lot
- Dates bail (début, fin, durée restante)
- Montant loyer + charges
- Statut (actif, terminé, à renouveler)
- Actions rapides (voir détails, générer quittance)

#### PaymentStatusBadge.jsx 🔜
Badge statut paiement avec logique métier.
```jsx
<PaymentStatusBadge
  payment={payment}
  showDaysLate={true}
/>
```

**Statuts** :
- `paid` : Payé (vert)
- `pending` : En attente (orange)
- `late` : En retard (rouge)
- `partial` : Partiel (jaune)

#### TenantAvatar.jsx 🔜
Avatar locataire avec fallback initiales.
```jsx
<TenantAvatar
  tenant={tenant}
  size="lg"
  showName={true}
/>
```

#### PropertyTypeIcon.jsx 🔜
Icône selon type de propriété/lot.
```jsx
<PropertyTypeIcon
  type="apartment"
  size={24}
  color="blue"
/>
```

**Types** :
- `apartment` : Appartement
- `house` : Maison
- `studio` : Studio
- `parking` : Parking
- `commercial` : Local commercial
- `office` : Bureau

### Composants de feedback

#### Modal.jsx 🔜
Modal réutilisable.
```jsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Confirmer la suppression"
  size="md"
>
  <p>Êtes-vous sûr de vouloir supprimer ce bail ?</p>
  <div className="flex gap-3 mt-4">
    <Button variant="danger" onClick={handleDelete}>Supprimer</Button>
    <Button variant="secondary" onClick={handleClose}>Annuler</Button>
  </div>
</Modal>
```

**Sizes** : `sm`, `md`, `lg`, `xl`, `full`

#### Toast.jsx 🔜
Notifications toast (success, error, warning, info).
```jsx
// Usage via hook
const { showToast } = useToast()
showToast({
  type: 'success',
  message: 'Le bail a été créé avec succès',
  duration: 3000
})
```

#### Spinner.jsx 🔜
Indicateur de chargement.
```jsx
<Spinner size="lg" color="blue" />
```

#### Skeleton.jsx 🔜
Placeholder chargement (skeleton screens).
```jsx
<Skeleton type="card" count={3} />
<Skeleton type="text" lines={4} />
<Skeleton type="avatar" size="lg" />
```

### Composants utilitaires

#### Tooltip.jsx 🔜
Info-bulle au survol.
```jsx
<Tooltip content="Le loyer révisé selon l'IRL">
  <InfoIcon />
</Tooltip>
```

#### Dropdown.jsx 🔜
Menu déroulant réutilisable.
```jsx
<Dropdown
  trigger={<Button>Actions</Button>}
  items={[
    { label: 'Modifier', onClick: handleEdit, icon: <EditIcon /> },
    { label: 'Supprimer', onClick: handleDelete, icon: <TrashIcon />, danger: true }
  ]}
/>
```

#### Tabs.jsx 🔜
Onglets de navigation.
```jsx
<Tabs defaultTab="details">
  <Tab id="details" label="Détails">
    <LeaseDetails lease={lease} />
  </Tab>
  <Tab id="payments" label="Paiements">
    <PaymentsList leaseId={lease.id} />
  </Tab>
  <Tab id="documents" label="Documents">
    <DocumentsList leaseId={lease.id} />
  </Tab>
</Tabs>
```

#### Pagination.jsx 🔜
Composant de pagination.
```jsx
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
  showPageNumbers={5}
/>
```

---

## 🚀 FUTURES FONCTIONNALITÉS DÉTAILLÉES

### 1. Candidatures (Espace candidat)

#### Fonctionnalités
- **Formulaire candidature en ligne** : Lien public partageable par le bailleur
- **Upload documents** : Pièce d'identité, justificatifs revenus, garants
- **Calcul automatique taux d'effort** : (Loyer / Revenus nets) × 100
- **Scoring automatique** : Note sur 100 basée sur critères (revenus, stabilité, garants)
- **Workflow validation** : Candidature → En cours → Acceptée/Refusée
- **Historique candidatures** : Archive pour chaque lot

#### Tables SQL à créer
```sql
CREATE TYPE application_status AS ENUM (
  'submitted',      -- Soumise
  'under_review',   -- En cours d'examen
  'accepted',       -- Acceptée
  'rejected',       -- Refusée
  'withdrawn'       -- Retirée par le candidat
);

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lot_id UUID NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,

  -- Informations candidat
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  birth_date DATE,

  -- Situation professionnelle
  employment_type VARCHAR(100),
  employer_name VARCHAR(255),
  job_title VARCHAR(255),
  employment_start_date DATE,
  monthly_income DECIMAL(10,2),

  -- Garants
  has_guarantor BOOLEAN DEFAULT FALSE,
  guarantor_first_name VARCHAR(100),
  guarantor_last_name VARCHAR(100),
  guarantor_email VARCHAR(255),
  guarantor_phone VARCHAR(20),
  guarantor_monthly_income DECIMAL(10,2),

  -- Scoring
  score INTEGER CHECK (score >= 0 AND score <= 100),
  income_to_rent_ratio DECIMAL(5,2),

  -- Statut
  status application_status DEFAULT 'submitted',
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES users(id),
  rejection_reason TEXT,

  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE application_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_applications_lot ON applications(lot_id);
CREATE INDEX idx_applications_entity ON applications(entity_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_application_documents_application ON application_documents(application_id);
```

---

### 2. Portail Locataire

#### Fonctionnalités
- **Dashboard locataire** : Vue consultation uniquement
- **Informations bail** : Dates, loyer, charges, dépôt de garantie
- **Historique paiements** : Liste des quittances téléchargeables
- **Espace documents** : Bail, états des lieux, attestations
- **Demandes d'intervention** : Signaler un problème (formulaire + photos)
- **Messagerie** : Communication avec le bailleur
- **Paiement en ligne** (optionnel) : Via Stripe

#### Tables SQL à créer
```sql
CREATE TABLE tenant_portal_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tenant_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('landlord', 'tenant')),
  sender_id UUID NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tenant_portal_access_tenant ON tenant_portal_access(tenant_id);
CREATE INDEX idx_tenant_portal_access_email ON tenant_portal_access(email);
CREATE INDEX idx_tenant_messages_lease ON tenant_messages(lease_id);
```

---

### 3. Interventions et Maintenance

#### Fonctionnalités
- **Demandes d'intervention** : Formulaire locataire (type, urgence, description, photos)
- **Suivi interventions** : Planifiée → En cours → Terminée
- **Carnet d'adresses prestataires** : Plombier, électricien, syndic, etc.
- **Historique interventions par lot** : Traçabilité complète
- **Calcul coûts maintenance** : Charges déductibles fiscalement
- **Photos avant/après** : Documentation visuelle
- **Notifications automatiques** : Alerte bailleur nouvelle demande

#### Tables SQL à créer
```sql
CREATE TYPE maintenance_status AS ENUM (
  'reported',       -- Signalée
  'scheduled',      -- Planifiée
  'in_progress',    -- En cours
  'completed',      -- Terminée
  'cancelled'       -- Annulée
);

CREATE TYPE maintenance_priority AS ENUM (
  'low',            -- Basse
  'medium',         -- Moyenne
  'high',           -- Haute
  'urgent'          -- Urgente
);

CREATE TABLE maintenance_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
  lot_id UUID NOT NULL REFERENCES lots(id) ON DELETE CASCADE,

  -- Demande
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100),
  priority maintenance_priority DEFAULT 'medium',

  -- Intervention
  status maintenance_status DEFAULT 'reported',
  scheduled_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  service_provider_id UUID REFERENCES service_providers(id),
  cost DECIMAL(10,2),

  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE maintenance_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  maintenance_request_id UUID NOT NULL REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  photo_type VARCHAR(50) CHECK (photo_type IN ('before', 'after')),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE service_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,

  -- Informations
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  address VARCHAR(500),

  -- Notes
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),

  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_maintenance_requests_lease ON maintenance_requests(lease_id);
CREATE INDEX idx_maintenance_requests_lot ON maintenance_requests(lot_id);
CREATE INDEX idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX idx_maintenance_photos_request ON maintenance_photos(maintenance_request_id);
CREATE INDEX idx_service_providers_entity ON service_providers(entity_id);
```

---

### 4. Communication Avancée

#### Fonctionnalités
- **Templates emails** : Quittance, avis échéance, rappel, relance, indexation
- **Envoi automatique** : Quittances dès paiement enregistré
- **Planification emails** : Avis échéance J-5
- **Relances automatiques** : J+3 (amical), J+7 (formel), J+15 (mise en demeure)
- **SMS notifications** : Alertes importantes (impayés, interventions urgentes)
- **Historique** : Tous les emails/SMS envoyés
- **Personnalisation** : Variables dynamiques (nom, montant, date...)

#### Tables SQL à créer
```sql
CREATE TYPE communication_type AS ENUM (
  'email',
  'sms',
  'notification'
);

CREATE TYPE communication_category AS ENUM (
  'receipt',           -- Quittance
  'payment_reminder',  -- Rappel paiement
  'payment_overdue',   -- Relance impayé
  'lease_renewal',     -- Renouvellement bail
  'indexation',        -- Révision loyer
  'maintenance',       -- Intervention
  'general'            -- Général
);

CREATE TABLE communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,

  -- Destinataire
  recipient_type VARCHAR(20) CHECK (recipient_type IN ('tenant', 'owner', 'other')),
  recipient_id UUID,
  recipient_email VARCHAR(255),
  recipient_phone VARCHAR(20),

  -- Communication
  type communication_type NOT NULL,
  category communication_category NOT NULL,
  subject VARCHAR(255),
  content TEXT NOT NULL,

  -- Contexte
  lease_id UUID REFERENCES leases(id),
  payment_id UUID REFERENCES payments(id),
  maintenance_request_id UUID REFERENCES maintenance_requests(id),

  -- Statut
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,

  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE communication_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Template
  name VARCHAR(255) NOT NULL,
  category communication_category NOT NULL,
  type communication_type NOT NULL,
  subject VARCHAR(255),
  content TEXT NOT NULL,

  -- Variables disponibles
  available_variables TEXT[],

  -- Métadonnées
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, name)
);

CREATE INDEX idx_communications_entity ON communications(entity_id);
CREATE INDEX idx_communications_recipient ON communications(recipient_id);
CREATE INDEX idx_communications_lease ON communications(lease_id);
CREATE INDEX idx_communications_payment ON communications(payment_id);
CREATE INDEX idx_communications_category ON communications(category);
CREATE INDEX idx_communication_templates_user ON communication_templates(user_id);
```

---

### 5. Diagnostics et Conformité

#### Fonctionnalités
- **Gestion diagnostics immobiliers** : DPE, amiante, plomb, gaz, électricité, ERP
- **Dates de validité** : Suivi des expirations
- **Alertes automatiques** : Email J-60 avant expiration
- **Stockage documents** : PDFs des diagnostics
- **Conformité légale** : Checklist obligations bailleur
- **Historique** : Évolution DPE dans le temps

#### Tables SQL à créer
```sql
CREATE TYPE diagnostic_type AS ENUM (
  'dpe',            -- Diagnostic Performance Énergétique
  'ges',            -- Gaz à Effet de Serre
  'amiante',        -- Amiante
  'lead',           -- Plomb (CREP)
  'gas',            -- Installation gaz
  'electricity',    -- Installation électrique
  'erp',            -- État Risques Pollution
  'termites',       -- Termites
  'surface'         -- Mesurage loi Carrez/Boutin
);

CREATE TABLE diagnostics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lot_id UUID NOT NULL REFERENCES lots(id) ON DELETE CASCADE,

  -- Diagnostic
  type diagnostic_type NOT NULL,
  performed_date DATE NOT NULL,
  expiration_date DATE,
  is_valid BOOLEAN GENERATED ALWAYS AS (expiration_date IS NULL OR expiration_date >= CURRENT_DATE) STORED,

  -- Résultats (spécifique DPE/GES)
  dpe_rating VARCHAR(1) CHECK (dpe_rating IN ('A', 'B', 'C', 'D', 'E', 'F', 'G')),
  dpe_value INTEGER,
  ges_rating VARCHAR(1) CHECK (ges_rating IN ('A', 'B', 'C', 'D', 'E', 'F', 'G')),
  ges_value INTEGER,

  -- Document
  diagnostician_name VARCHAR(255),
  diagnostician_company VARCHAR(255),
  document_path VARCHAR(500),

  -- Notes
  notes TEXT,

  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_diagnostics_lot ON diagnostics(lot_id);
CREATE INDEX idx_diagnostics_type ON diagnostics(type);
CREATE INDEX idx_diagnostics_expiration ON diagnostics(expiration_date) WHERE expiration_date IS NOT NULL;
```

---

### 6. Comptabilité et Fiscalité

#### Fonctionnalités
- **Journal des opérations** : Tous les mouvements financiers
- **Catégorisation charges** : Charges déductibles, non déductibles, amortissables
- **Export comptable** : CSV/Excel pour expert-comptable
- **Aide déclaration 2044** : Formulaire pré-rempli revenus fonciers
- **Calcul amortissements** : LMNP/LMP automatique
- **Synthèse fiscale annuelle** : Revenus, charges, résultat fiscal
- **Export par entité** : Comptabilité séparée SCI, LMNP, etc.

---

### 7. Quittances Avancées

#### Fonctionnalités
- **Génération automatique** : Dès enregistrement paiement
- **Envoi email automatique** : Option envoi immédiat ou planifié
- **Personnalisation** : Logo, couleurs par entité
- **Multi-format** : PDF, email HTML
- **Quittances groupées** : Plusieurs mois en un PDF
- **Attestation fiscale annuelle** : Récapitulatif loyers payés
- **Conformité légale** : Mentions obligatoires loi ALUR

---

### 8. États des Lieux

#### Fonctionnalités
- **Formulaire structuré** : Pièce par pièce (séjour, chambres, cuisine, SDB, WC)
- **Items par pièce** : Murs, sol, plafond, fenêtres, portes, équipements
- **Notation état** : Neuf, Bon, Moyen, Mauvais, Vétuste
- **Photos multiples** : Upload illimité par item
- **Signature électronique** : Bailleur + locataire (via Yousign)
- **Génération PDF** : État des lieux complet avec photos
- **Comparaison entrée/sortie** : Différences automatiques
- **Export** : PDF envoyable par email

---

### 9. Documents et Modèles

#### Fonctionnalités
- **Bibliothèque modèles légaux** :
  - Bail vide loi ALUR
  - Bail meublé loi ALUR
  - Lettre résiliation bailleur
  - Lettre résiliation locataire
  - Congé pour vente
  - Augmentation de loyer
  - Lettre indexation IRL
  - Régularisation charges
  - Mise en demeure
  - Attestation loyer
  - Attestation assurance
- **Générateur dynamique** : Remplissage automatique avec données bail/locataire
- **Édition avant génération** : Personnalisation du contenu
- **Stockage organisé** : Par entité > propriété > lot > bail > type
- **Versioning** : Historique des versions
- **Tags** : Catégorisation libre

---

### 10. Signatures Électroniques

#### Fonctionnalités
- **Intégration Yousign** : API signature électronique
- **Signature baux** : Dématérialisation complète
- **Signature états des lieux** : Bailleur + locataire
- **Workflow signature** : Envoi → En attente → Signé → Archivé
- **Notifications** : Rappels automatiques si non signé J+3
- **Archivage automatique** : Document signé dans Supabase Storage
- **Validité juridique** : Conformité eIDAS

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

### ✅ Phase 1 : Architecture Multi-Entités (TERMINÉ)

#### ✅ Base de données et migration
- [x] Créer les tables entities, properties, lots dans Supabase
- [x] Script de migration des données existantes
- [x] Tests de la migration

#### ✅ Pages Entités et Propriétés
- [x] Pages Entités
  - Liste des entités avec stats
  - Formulaire création entité (EntityForm.jsx)
  - Page détail entité avec dashboard dédié
- [x] Pages Propriétés (refonte)
  - Liste propriétés avec filtre par entité
  - Formulaire création/édition propriété
  - Page détail propriété avec liste des lots
- [x] Sélecteur d'entité dans la sidebar

#### ✅ Pages Lots et mise à jour globale
- [x] Pages Lots
  - Liste lots avec filtres
  - Formulaire création/édition lot
  - Page détail lot avec bail actif
- [x] Mise à jour pages existantes
  - Dashboard avec stats par entité
  - Baux utilisant lot_id
  - Paiements affichant entité et propriété
  - Locataires liés à entity_id

### ✅ Phase 2 : Indexation IRL (TERMINÉ)

#### ✅ Fonctionnalités IRL
- [x] **Page Indexation** : Interface complète de gestion IRL
- [x] **Historique IRL** : Données depuis 2015 avec graphique
- [x] **Calcul automatique** : Nouveau loyer selon IRL
- [x] **Simulation** : Prévisualisation avant application
- [x] **Application groupée** : Indexer plusieurs baux en masse
- [x] **Historique par bail** : Suivi des révisions
- [x] **Génération PDF** : Lettre d'indexation conforme

#### ✅ Tables créées
- [x] `irl_history` : Historique indices IRL
- [x] `indexation_history` : Historique révisions par bail

### 🚧 Phase 3 : Documents et États des Lieux

#### Semaine 1 : Bibliothèque de documents
- [ ] **Page Documents** : Bibliothèque centralisée
- [ ] **Upload multiple** : Drag & drop fichiers
- [ ] **Organisation** : Par entité > propriété > lot > bail
- [ ] **Catégorisation** : Baux, EDL, Quittances, Diagnostics, Administratif
- [ ] **Tags** : Système de tags personnalisés
- [ ] **Recherche** : Recherche full-text
- [ ] **Preview** : Aperçu PDF et images

#### Semaine 2 : Modèles de documents
- [ ] **Modèles PDF légaux** :
  - Bail vide conforme loi ALUR
  - Bail meublé conforme loi ALUR
  - Lettre résiliation bailleur
  - Lettre résiliation locataire
  - Congé pour vente
  - Augmentation de loyer
  - Lettre indexation IRL (améliorer l'existant)
  - Demande régularisation charges
  - Appel de loyer
  - Mise en demeure
  - Attestation loyer
  - Attestation assurance
- [ ] **Générateur dynamique** : Remplissage auto avec données
- [ ] **Édition pré-génération** : Personnalisation contenu
- [ ] **Versioning** : Historique versions

#### Semaine 3 : États des lieux numériques
- [ ] **Formulaire structuré** : Pièce par pièce
- [ ] **Items par pièce** : Murs, sol, plafond, fenêtres, portes, équipements
- [ ] **Notation état** : Neuf, Bon, Moyen, Mauvais, Vétuste
- [ ] **Upload photos** : Multiple par item
- [ ] **Génération PDF** : État des lieux complet avec photos
- [ ] **Comparaison entrée/sortie** : Différences automatiques
- [ ] **Signature électronique** : Intégration basique

#### Semaine 4 : Diagnostics immobiliers
- [ ] **Gestion diagnostics** : DPE, amiante, plomb, gaz, électricité, ERP
- [ ] **Dates validité** : Suivi expirations
- [ ] **Alertes automatiques** : Email J-60 avant expiration
- [ ] **Stockage documents** : PDFs diagnostics
- [ ] **Conformité légale** : Checklist obligations
- [ ] **Historique DPE** : Évolution dans le temps

### 📧 Phase 4 : Automatisation Communication

#### Semaine 1 : Envoi emails automatiques
- [ ] **Intégration Resend/SendGrid**
- [ ] **Templates emails** :
  - Quittance mensuelle
  - Avis d'échéance
  - Rappel de paiement
  - Relance impayé
  - Indexation loyer
  - Renouvellement bail
- [ ] **Envoi automatique** : Quittances au paiement
- [ ] **Planification** : Avis d'échéance J-5
- [ ] **Personnalisation** : Variables dynamiques

#### Semaine 2 : Relances et rappels
- [ ] **Système de rappels** : Cron job quotidien
- [ ] **Relances automatiques** :
  - J+3 : Rappel amical
  - J+7 : Premier rappel formel
  - J+15 : Mise en demeure
- [ ] **Notifications in-app** : Centre de notifications
- [ ] **Historique communications** : Tous les emails envoyés

#### Semaine 3 : SMS et notifications push
- [ ] **Intégration Twilio** : Envoi SMS
- [ ] **SMS automatiques** :
  - Alerte impayé J+7
  - Intervention urgente
  - Rappel RDV état des lieux
- [ ] **Notifications push** : Via Progressive Web App
- [ ] **Historique SMS** : Tous les SMS envoyés

#### Semaine 4 : Signature électronique avancée
- [ ] **Intégration Yousign**
- [ ] **Signature baux** : Workflow complet
- [ ] **Signature EDL** : Bailleur + locataire
- [ ] **Workflow signature** : Envoi → Rappels → Signé → Archivé
- [ ] **Archivage automatique** : Documents signés dans Supabase
- [ ] **Validité juridique** : Conformité eIDAS

### 💰 Phase 5 : Monétisation et Fiscalité

#### Semaine 1 : Paiements Stripe
- [ ] **Intégration Stripe**
- [ ] **Plans** :
  - Gratuit : 1 entité, 2 lots
  - Premium : 15€/mois, illimité
- [ ] **Checkout** : Abonnement mensuel
- [ ] **Webhooks** : Gestion statut abonnement
- [ ] **Limites** : Blocage si dépassement plan gratuit
- [ ] **Page abonnement** : Upgrade/Downgrade
- [ ] **Facturation** : Historique factures

#### Semaine 2 : Charges et régularisation
- [ ] **Gestion charges** : Enregistrement charges propriétaire
- [ ] **Catégorisation** : Déductibles, non déductibles, amortissables
- [ ] **Provision charges** : Montant mensuel locataire
- [ ] **Régularisation annuelle** : Calcul automatique ajustement
- [ ] **Génération lettre** : Régularisation charges conforme
- [ ] **Paiement régularisation** : Enregistrement complément/remboursement

#### Semaine 3 : Aide déclaration fiscale
- [ ] **Journal des opérations** : Tous mouvements financiers
- [ ] **Export 2044** : Synthèse revenus fonciers
- [ ] **Calcul charges déductibles** : Par entité
- [ ] **Calcul amortissements** : LMNP/LMP automatique
- [ ] **Synthèse fiscale annuelle** : Revenus, charges, résultat
- [ ] **Génération PDF** : Récapitulatif pour expert-comptable

#### Semaine 4 : Export comptable
- [ ] **Export CSV** : Revenus, charges, paiements
- [ ] **Export Excel** : Tableaux formatés avec formules
- [ ] **Exports par entité** : Comptabilité séparée SCI, LMNP
- [ ] **Format FEC** : Fichier Écritures Comptables
- [ ] **Imports** : Import paiements CSV
- [ ] **Connexion bancaire** (optionnel) : Bridge/Plaid

### 👥 Phase 6 : Candidatures et Portail Locataire

#### Semaine 1 : Système de candidatures
- [ ] **Formulaire public** : Lien partageable par lot
- [ ] **Informations candidat** : Identité, situation pro, revenus
- [ ] **Garants** : Informations garants
- [ ] **Upload documents** : Pièce d'identité, justificatifs revenus, garants
- [ ] **Calcul automatique** : Taux d'effort, scoring
- [ ] **Workflow validation** : Soumise → En cours → Acceptée/Refusée
- [ ] **Historique candidatures** : Archive par lot
- [ ] **Comparaison candidats** : Tableau comparatif

#### Semaine 2 : Portail locataire - Base
- [ ] **Authentification locataire** : Système séparé
- [ ] **Dashboard locataire** : Vue consultation
- [ ] **Informations bail** : Dates, montants, documents
- [ ] **Historique paiements** : Liste quittances téléchargeables
- [ ] **Documents** : Bail, EDL, attestations
- [ ] **Messagerie** : Communication avec bailleur
- [ ] **Profil** : Modifier coordonnées

#### Semaine 3 : Portail locataire - Avancé
- [ ] **Demandes intervention** : Formulaire + photos
- [ ] **Suivi interventions** : Statut réparations
- [ ] **Paiement en ligne** (optionnel) : Via Stripe
- [ ] **Notifications** : Alertes importantes
- [ ] **Avis d'échéance** : Rappels automatiques
- [ ] **App mobile responsive** : PWA

#### Semaine 4 : Interventions et maintenance
- [ ] **Demandes intervention** : Depuis portail locataire + bailleur
- [ ] **Catégorisation** : Plomberie, électricité, serrurerie, etc.
- [ ] **Priorité** : Basse, Moyenne, Haute, Urgente
- [ ] **Workflow** : Signalée → Planifiée → En cours → Terminée
- [ ] **Carnet prestataires** : Coordonnées, notes, ratings
- [ ] **Affectation prestataire** : Assigner intervention
- [ ] **Photos avant/après** : Documentation
- [ ] **Coûts maintenance** : Suivi fiscal
- [ ] **Historique par lot** : Traçabilité complète
- [ ] **Notifications auto** : Alerte nouvelle demande

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
> **Dernière mise à jour** : 23 Décembre 2024
> **Statut actuel** :
> - Phase 0 (MVP Initial) : ✅ TERMINÉ
> - Phase 1 (Architecture Multi-Entités) : ✅ TERMINÉ
> - Phase 2 (Indexation IRL) : ✅ TERMINÉ
> - Phase 3 (Documents et États des Lieux) : 🚧 EN COURS
> - Phase 4 (Automatisation Communication) : 🔜 À VENIR
> - Phase 5 (Monétisation et Fiscalité) : 🔜 À VENIR
> - Phase 6 (Candidatures et Portail Locataire) : 🔜 À VENIR
