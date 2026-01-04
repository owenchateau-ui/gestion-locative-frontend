# CLAUDE.md - SaaS Gestion Locative

> Ce fichier sert de référence pour tout assistant IA travaillant sur ce projet.
> Dernière mise à jour : 4 Janvier 2026 - Sécurité RLS V2 Complète

---

## ⚠️ RÈGLE ABSOLUE - MÉTHODOLOGIE DE MODIFICATION

**AVANT TOUTE MODIFICATION** dans ce projet, **vous DEVEZ** :

1. 📖 **Lire** [`METHODO_MODIFICATIONS.md`](./METHODO_MODIFICATIONS.md)
2. ✅ **Créer** un fichier `ANALYSE_IMPACT_[FEATURE].md`
3. 🔍 **Analyser** l'impact sur DB + RLS + Frontend
4. 📝 **Planifier** TOUS les scripts et modifications nécessaires
5. 🎯 **Exécuter** dans l'ordre : DB → RLS → Services → Formulaires → Tests

**JAMAIS de modification partielle. Toujours une approche systémique complète.**

➡️ Voir [`METHODO_MODIFICATIONS.md`](./METHODO_MODIFICATIONS.md) pour le détail complet.

---

## 📋 TABLE DES MATIÈRES

1. [Vision du projet](#-vision-du-projet)
2. [État actuel du projet](#-état-actuel-du-projet)
3. [Structure de menu](#-structure-de-menu)
4. [Architecture multi-entités](#-architecture-multi-entités)
5. [Stack technique](#️-stack-technique)
6. [Design System](#-design-system)
7. [Routes](#-routes)
8. [Composants UI](#-composants-ui)
9. [Sécurité et RLS](#-sécurité-et-rls)
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
| **Loading.jsx** | Indicateur de chargement | `message`: texte affiché<br>`fullScreen`: boolean pour plein écran |
| **Toast.jsx** ✨ | Notification toast animée | `id`, `message`, `type`: success/error/warning/info<br>`duration`, `onClose` |
| **ToastContainer.jsx** ✨ | Conteneur de toasts (top-right) | Aucune prop (utilise ToastContext) |
| **Modal.jsx** ✨ | Modale réutilisable avec overlay | `isOpen`, `onClose`, `title`, `children`<br>`size`: sm/md/lg/xl/full<br>`showCloseButton`, `closeOnOverlayClick` |
| **Dropdown.jsx** ✨ | Menu déroulant actions | `trigger`: élément déclencheur<br>`items`: array d'objets {label, icon, onClick, danger, disabled, divider}<br>`align`: left/right |
| **Breadcrumb.jsx** ✨ | Fil d'Ariane hiérarchique | `items`: array d'objets {label, href} |
| **Tabs.jsx** ✨ | Onglets de navigation | `tabs`: array d'objets {id, label, icon, badge, content, disabled}<br>`defaultTab`, `onChange` |
| **Skeleton.jsx** ✨ | Placeholders de chargement | `type`: text/title/avatar/card/button/image/table-row<br>`count`: nombre d'éléments<br>`className` |

### ✅ Composants métier créés

#### Composants entities (src/components/entities/)

| Composant | Description | Props principales |
|-----------|-------------|-------------------|
| **EntitySelect.jsx** ✨ | Sélecteur d'entité avec chargement auto | `value`: ID entité sélectionnée<br>`onChange`: callback<br>`required`: boolean<br>`label`: libellé<br>`placeholder`: texte placeholder |

#### Composants tenants (src/components/tenants/)

| Composant | Description | Props principales |
|-----------|-------------|-------------------|
| **TenantCard.jsx** ✨ | Carte d'affichage d'un locataire | `tenant`: objet locataire<br>`onEdit`, `onDelete` callbacks |
| **TenantGroupInfo.jsx** ✨ | Informations du groupe de locataires | `group`: objet groupe<br>`tenants`: array de locataires |
| **TenantDetailSections.jsx** ✨ | Sections pour page détail locataire | `Documents`, `Lease` composants exportés |
| **GuaranteeForm.jsx** ✨ | Formulaire garant/cautionnaire | `guarantee`: objet garant<br>`onSubmit`, `onCancel` callbacks |
| **GuaranteeCard.jsx** ✨ | Carte d'affichage d'un garant | `guarantee`: objet garant<br>`onEdit`, `onDelete` callbacks |
| **FinancialSummary.jsx** ✨ | Résumé financier locataire | `tenants`: array<br>`lease`: objet bail |

#### Composants candidates (src/components/candidates/)

| Composant | Description | Statut |
|-----------|-------------|--------|
| Composants candidatures | Formulaires et cartes candidats | ✅ Créés |

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

#### Pages publiques (5)
- `Home.jsx` - Page d'accueil
- `Login.jsx` - Connexion
- `Register.jsx` - Inscription
- `PublicCandidateForm.jsx` ✨ - Formulaire candidature public (accessible via token)
- `CandidateStatus.jsx` ✨ - Suivi statut candidature

#### Pages principales (16)
| Page | Statut | Composants utilisés | Fonctionnalités |
|------|--------|---------------------|-----------------|
| `Dashboard.jsx` | ✅ | DashboardLayout, StatCard, Alert, Card | Stats globales, alertes échéances/impayés, actions rapides |
| `Entities.jsx` | ✅ | DashboardLayout, Button, Card | Liste entités juridiques, stats par entité |
| `EntityDetail.jsx` | ✅ | DashboardLayout, StatCard | Détail entité avec stats propriétés/lots/revenus |
| `Properties.jsx` | ✅ | DashboardLayout, Button, Badge, Card | Liste propriétés, filtres par entité |
| `PropertyDetail.jsx` | ✅ | DashboardLayout, Card | Détail propriété avec liste lots |
| `Lots.jsx` | ✅ | DashboardLayout, Button, Badge, Card | Liste lots, filtres entité/propriété, statuts |
| `LotDetail.jsx` | ✅ | DashboardLayout, Card, Badge | Détail lot avec bail actif et historique |
| `Tenants.jsx` | ✅ | DashboardLayout, Button, Card | Liste groupes locataires avec bail actif |
| `TenantDetail.jsx` | ✅ ✨ | DashboardLayout, Card, Badge, Alert | Détail groupe avec bail actif, taux effort, revenus membres |
| `Leases.jsx` | ✅ | DashboardLayout, Button, Badge, Card | Liste baux, statuts, périodes, montants |
| `LeaseDetail.jsx` | ✅ ✨ | DashboardLayout, Card, Badge, Alert | Détail bail avec loyer net (aides CAF), breadcrumb navigation |
| `Payments.jsx` | ✅ | DashboardLayout, Button, Badge, Card | Liste paiements, filtres statut, génération quittances PDF |
| `Indexation.jsx` | ✅ | DashboardLayout, Card, Alert | Révision loyers IRL, historique IRL, simulation |
| `Candidates.jsx` | ✅ | DashboardLayout, Button, Badge, Card | Liste candidatures, filtres statut |
| `CandidateDetail.jsx` | ✅ | DashboardLayout, Card | Détail candidature avec documents et scoring |
| `Profile.jsx` | ✅ | DashboardLayout, Button, Card | Modification profil utilisateur |
| `ComingSoon.jsx` | ✅ | DashboardLayout, Alert | Page placeholder fonctionnalités à venir |

#### Formulaires (8)
| Formulaire | Statut | Fonctionnalités |
|------------|--------|-----------------|
| `EntityForm.jsx` | ✅ | Création/édition entité juridique, infos légales |
| `PropertyForm.jsx` | ✅ | Création/édition propriété, sélecteur entité |
| `LotForm.jsx` | ✅ | Création/édition lot, sélecteur propriété, DPE |
| `TenantForm.jsx` | ✅ ✨ | Création/édition groupe locataires (individuel/couple/colocation)<br>**NOUVEAU** : Sélecteur EntitySelect intégré |
| `LeaseForm.jsx` | ✅ ✨ | Création/édition bail, sélecteur lot/locataire<br>**NOUVEAU** : Pré-remplissage CAF automatique + validation taux d'effort temps réel |
| `PaymentForm.jsx` | ✅ | Création/édition paiement, pré-remplissage montant |

**Note ✨** : Les éléments marqués ✨ sont nouveaux depuis la dernière mise à jour

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
Styling        : TailwindCSS V3
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

## 🔐 SÉCURITÉ ET RLS

### État Actuel (4 Janvier 2026)

**Score Sécurité** : ✅ **100/100** (Production-Ready)

| Critère | Score | Statut |
|---------|-------|--------|
| **RLS** | 100/100 | ✅ V2 Complète (60+ policies, 13 tables) |
| **Rate Limiting** | 100/100 | ✅ Activé sur routes sensibles |
| **Architecture** | 100/100 | ✅ Mapping correct auth → users |
| **Documentation** | 100/100 | ✅ Complète |

### RLS V2 - Architecture Complète

**Mapping d'authentification** :
```
auth.uid() (Supabase Auth)
    ↓
users.supabase_uid
    ↓
users.id
    ↓
entities.user_id
```

**Helper Functions** :
- `get_app_user_id()` : Convertit auth.uid() → users.id
- `user_owns_entity(entity_uuid)` : Vérifie ownership entité
- `user_owns_property(property_uuid)` : Vérifie ownership propriété
- `user_owns_lot(lot_uuid)` : Vérifie ownership lot
- `user_owns_tenant(tenant_uuid)` : Vérifie ownership locataire

**Tables Protégées** (13 tables) :
1. ✅ `entities` - 4 policies (propriétaire uniquement)
2. ✅ `properties_new` - 4 policies (via entity ownership)
3. ✅ `lots` - 4 policies (via property ownership)
4. ✅ `tenants` - 4 policies + trigger auto user_id
5. ✅ `leases` - 4 policies (via lot ownership)
6. ✅ `payments` - 4 policies (via lease ownership)
7. ✅ `candidates` - 5 policies (4 propriétaire + 1 publique via lien invitation)
8. ✅ `candidate_documents` - 3 policies (2 propriétaire + 1 publique upload)
9. ✅ `candidate_invitation_links` - 2 policies (1 propriétaire + 1 publique lecture)
10. ✅ `tenant_documents` - 3 policies (propriétaire uniquement)
11. ✅ `irl_history` - 1 policy (lecture publique authentifiée - données INSEE)
12. ✅ `indexation_history` - 4 policies (propriétaire via lease)
13. ✅ `tenant_groups` - 4 policies (via entity ownership)
14. ✅ `guarantees` - 4 policies (via tenant ownership)
15. ✅ `users` - 2 policies (self-service)

**Total** : **60+ policies** actives

### Fonctionnalités Sécurisées

#### 1. Formulaire Public Candidature ✅
- Accès public sécurisé via lien d'invitation
- Validation automatique lien actif et non expiré
- Upload documents candidature autorisé
- Isolation totale entre propriétaires

#### 2. Multi-Tenant Strict ✅
- Isolation complète des données par utilisateur
- Impossible de voir/modifier données d'un autre utilisateur
- Vérification ownership à chaque niveau hiérarchique

#### 3. Rate Limiting ✅
- Protection contre attaques par force brute
- Limites configurées sur routes sensibles
- Headers `X-RateLimit-*` dans les réponses

### Scripts de Migration

**Fichiers Clés** :
- `supabase/migrations/20260104_CLEANUP_OLD_RLS.sql` - Nettoyage ancien RLS
- `supabase/migrations/20260104_RLS_CORRECT_FINAL_v2.sql` - RLS V2 complet
- `supabase/migrations/20260104_RESTORE_DATA_FINAL.sql` - Restauration données
- `supabase/migrations/20260104_FIX_TENANTS_URGENT.sql` - Fix user_id tenants

**Documentation** :
- `EXECUTION_RLS_ETAPE_PAR_ETAPE.md` - Guide exécution migration
- `RLS_V2_CHANGELOG.md` - Différences V1 vs V2
- `GUIDE_RLS_FINAL.md` - Guide complet RLS

### Triggers Automatiques

```sql
-- Trigger : Remplissage automatique user_id dans tenants
CREATE TRIGGER set_tenant_user_id_trigger
  BEFORE INSERT OR UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION set_tenant_user_id();
```

**Fonction** : Remplit automatiquement `user_id` avec l'utilisateur connecté si non fourni.

### Tests de Validation

Pour vérifier l'isolation multi-tenant :

1. Créer un 2ème compte utilisateur
2. Se connecter avec ce nouveau compte
3. Vérifier : **Aucune donnée** du 1er utilisateur visible ✅

### Conformité RGPD

- ✅ Isolation données par utilisateur
- ✅ RLS empêche accès non autorisé
- ✅ Pas de fuite de données entre utilisateurs
- ✅ Triggers automatiques pour intégrité

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

#### Toast (Notifications) ✨ NOUVEAU
```jsx
import { useToast } from '../context/ToastContext'

function MyComponent() {
  const { showToast, success, error, warning, info } = useToast()

  const handleSave = async () => {
    try {
      await saveData()
      success('Données sauvegardées avec succès')
      // ou showToast({ message: 'Données sauvegardées', type: 'success', duration: 3000 })
    } catch (err) {
      error('Erreur lors de la sauvegarde')
    }
  }

  return <Button onClick={handleSave}>Sauvegarder</Button>
}

// Méthodes disponibles :
// - success(message, duration = 5000)
// - error(message, duration = 5000)
// - warning(message, duration = 5000)
// - info(message, duration = 5000)
// - showToast({ message, type, duration })
```

#### Modal ✨ NOUVEAU
```jsx
import { useState } from 'react'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Ouvrir</Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirmer la suppression"
        size="md"
      >
        <p>Êtes-vous sûr de vouloir supprimer cet élément ?</p>
        <div className="flex gap-3 mt-4">
          <Button variant="danger" onClick={handleDelete}>Supprimer</Button>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>Annuler</Button>
        </div>
      </Modal>
    </>
  )
}

// Sizes: sm, md, lg, xl, full
```

#### Dropdown ✨ NOUVEAU
```jsx
import Dropdown from '../components/ui/Dropdown'
import { Edit, Trash2, Eye } from 'lucide-react'
import Button from '../components/ui/Button'

<Dropdown
  trigger={<Button>Actions</Button>}
  items={[
    {
      label: 'Voir détail',
      icon: <Eye className="w-4 h-4" />,
      onClick: () => navigate('/detail')
    },
    {
      label: 'Modifier',
      icon: <Edit className="w-4 h-4" />,
      onClick: handleEdit
    },
    { divider: true },
    {
      label: 'Supprimer',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: handleDelete,
      danger: true
    }
  ]}
  align="right"
/>

// align: left ou right
```

#### Breadcrumb ✨ NOUVEAU
```jsx
import Breadcrumb from '../components/ui/Breadcrumb'

<Breadcrumb
  items={[
    { label: 'Entités', href: '/entities' },
    { label: 'SCI Famille', href: '/entities/123' },
    { label: 'Immeuble Paris', href: '/properties/456' },
    { label: 'Lot A3' } // Dernier élément sans href
  ]}
/>
```

#### Tabs ✨ NOUVEAU
```jsx
import Tabs from '../components/ui/Tabs'

<Tabs
  defaultTab="details"
  tabs={[
    {
      id: 'details',
      label: 'Détails',
      icon: <InfoIcon />,
      badge: '3',
      content: <DetailsContent />
    },
    {
      id: 'payments',
      label: 'Paiements',
      content: <PaymentsContent />
    },
    {
      id: 'documents',
      label: 'Documents',
      disabled: true,
      content: <DocumentsContent />
    }
  ]}
  onChange={(tabId) => console.log('Active tab:', tabId)}
/>
```

#### Skeleton ✨ NOUVEAU
```jsx
import Skeleton from '../components/ui/Skeleton'

// Chargement de texte
<Skeleton type="text" count={3} />

// Chargement de titre
<Skeleton type="title" />

// Chargement de carte
<Skeleton type="card" count={2} />

// Chargement de table
<Skeleton type="table-row" count={5} />

// Chargement d'avatar
<Skeleton type="avatar" />

// Types: text, title, avatar, card, button, image, table-row
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

### ✅ Phase 2.5 : Système de Candidatures et Tenant Groups (TERMINÉ)

**Date : Décembre 2024 - Janvier 2026**

#### ✅ Architecture Tenant Groups
- [x] **Table `tenant_groups`** : Support couples et colocations
- [x] **Refonte table `tenants`** : Colonnes professionnelles, revenus, relations
- [x] **Composants tenants/** : TenantCard, GuaranteeForm, FinancialSummary, etc.
- [x] **TenantForm refactorisé** : Support individuel/couple/colocation
- [x] **EntitySelect** ✨ : Composant réutilisable de sélection d'entité

#### ✅ Module Candidatures
- [x] **Formulaire public** : PublicCandidateForm avec token d'accès
- [x] **Gestion candidatures** : Page Candidates avec filtres
- [x] **Détail candidature** : CandidateDetail avec documents
- [x] **Suivi statut** : CandidateStatus pour les candidats
- [x] **Tables SQL** : `candidate_groups`, `candidates`, `candidate_documents`
- [x] **Scoring automatique** : Taux d'effort, validation revenus

#### ✅ Améliorations UX
- [x] **EntitySelect intégré** : Plus besoin de sélectionner l'entité avant
- [x] **Sélection automatique** : Si une seule entité disponible
- [x] **Messages d'aide** : Alertes si aucune entité
- [x] **Validation améliorée** : Messages d'erreur clairs

#### ✅ Scripts de maintenance
- [x] **Migration tenant_groups** : 20260102_create_tenant_groups.sql
- [x] **Script de rafraîchissement** : 20260102_refresh_schema.sql (correction cache Supabase)
- [x] **Script de vérification** : VERIFY_TENANT_GROUPS.sql

#### 📁 Fichiers créés
- ✨ `components/entities/EntitySelect.jsx`
- ✨ `components/tenants/TenantCard.jsx`
- ✨ `components/tenants/TenantGroupInfo.jsx`
- ✨ `components/tenants/GuaranteeForm.jsx`
- ✨ `components/tenants/GuaranteeCard.jsx`
- ✨ `components/tenants/FinancialSummary.jsx`
- ✨ `pages/Candidates.jsx`
- ✨ `pages/CandidateDetail.jsx`
- ✨ `pages/CandidateStatus.jsx`
- ✨ `pages/PublicCandidateForm.jsx`
- ✨ `services/tenantGroupService.js`
- ✨ `services/candidateService.js`
- ✨ `services/guaranteeService.js`
- ✨ `constants/tenantConstants.js`

### ✅ Phase 2.6 : Aides au logement et Amélioration des baux (TERMINÉ)

**Date : 2 Janvier 2026**

#### ✅ Gestion des aides au logement (CAF/APL)
- [x] **Champ `housing_assistance`** : Ajouté à `tenant_groups` pour le montant mensuel des aides
- [x] **Migration SQL** : `FIX_add_housing_assistance.sql` et `FIX_add_caf_fields.sql`
- [x] **Champs CAF additionnels** :
  - `caf_file_number` : Numéro de dossier CAF
  - `last_caf_attestation_date` : Date dernière attestation
- [x] **Formulaire locataire** : ~~Input aides dans TenantForm~~ (retiré, utiliser "revenus complémentaires")

#### ✅ Calculs financiers avec aides
- [x] **Loyer net** : Affichage du loyer après déduction des aides
  - TenantDetail.jsx : Affichage "Loyer + Charges" → "Aides CAF" → "Loyer net"
  - LeaseDetail.jsx : Même affichage avec mise en avant visuelle (vert)
  - Tenants.jsx : Calcul corrigé du taux d'effort
- [x] **Taux d'effort corrigé** : Calcul sur le loyer net (après aides)
  - Formula: `(loyer_total - housing_assistance) / revenus_groupe * 100`
  - Implémenté dans : TenantDetail, LeaseDetail, Tenants, FinancialSummary
- [x] **Service tenantGroupService** : Query `getAllTenantGroups` récupère `housing_assistance`

#### ✅ Améliorations LeaseForm
- [x] **Pré-remplissage automatique CAF** :
  - Quand un locataire est sélectionné, les champs CAF se remplissent automatiquement
  - Récupération de `housing_assistance` depuis `tenant_groups`
  - Activation auto de `caf_direct_payment` si aides > 0
- [x] **Validation taux d'effort en temps réel** :
  - Calcul automatique du taux d'effort pendant la saisie
  - Alertes contextuelles avec 3 niveaux :
    - 🟢 Taux ≤ 33% : Aucune alerte (solvabilité excellente)
    - 🔵 33% < Taux ≤ 40% : Info (légèrement élevé)
    - 🟠 40% < Taux ≤ 50% : Warning (risque élevé, garantie recommandée)
    - 🔴 Taux > 50% : Danger (risque très élevé, garantie solide nécessaire)
  - Affichage des revenus et loyer net dans l'alerte
- [x] **Import Alert component** : Ajouté dans LeaseForm.jsx

#### ✅ Pages détail créées
- [x] **TenantDetail.jsx** (450 lignes) :
  - Affichage complet du groupe de locataires
  - Bail actif avec calcul aides et taux d'effort
  - Liste des membres du groupe avec infos pro/revenus
  - Icons selon type de groupe (👤👫👥)
- [x] **LeaseDetail.jsx** (450 lignes) :
  - Détail complet du bail
  - Calcul loyer net avec aides CAF/APL
  - Breadcrumb navigation (Entité > Propriété > Lot > Bail)
  - Liens vers locataire/groupe, lot, paiements

#### ✅ Corrections et intégrations
- [x] **LotDetail.jsx** : Correction bug `property_id` → `lot_id` (CRITIQUE)
- [x] **LeaseForm.jsx** : Correction `landlord_id` → `entity_id` via tenant_groups
- [x] **Dashboard.jsx** : Count `tenant_groups` au lieu de `tenants` individuels
- [x] **Leases.jsx** : Affichage noms de groupes avec icônes
- [x] **Payments.jsx** : Affichage noms de groupes avec icônes
- [x] **tenantService.js** : Nettoyage code obsolète (230 → 111 lignes)
- [x] **tenantConstants.js** : Correction `cohabiting` → `concubinage` (sync SQL)
- [x] **FinancialSummary.jsx** :
  - Prop `housingAssistance` ajoutée
  - Calcul taux d'effort et ratio sur loyer net
  - Affichage visuel des aides (vert)

#### 📁 Fichiers modifiés
- ✨ `pages/TenantDetail.jsx` - CRÉÉ
- ✨ `pages/LeaseDetail.jsx` - CRÉÉ
- ⚡ `pages/LeaseForm.jsx` - Pré-remplissage CAF + validation taux effort
- ⚡ `pages/TenantForm.jsx` - Input housing_assistance
- ⚡ `pages/Tenants.jsx` - Calcul taux effort corrigé
- ⚡ `pages/LotDetail.jsx` - Fix property_id → lot_id
- ⚡ `pages/Dashboard.jsx` - Count tenant_groups
- ⚡ `pages/Leases.jsx` - Display groups
- ⚡ `pages/Payments.jsx` - Display groups
- ⚡ `services/tenantGroupService.js` - Fetch housing_assistance
- ⚡ `services/tenantService.js` - Nettoyage
- ⚡ `components/tenants/FinancialSummary.jsx` - Support aides
- ⚡ `constants/tenantConstants.js` - Fix concubinage
- ✨ `supabase/migrations/FIX_add_housing_assistance.sql`
- ✨ `supabase/migrations/FIX_add_caf_fields.sql`

#### 🎯 Impact
- **Conformité CAF** : Suivi complet des aides au logement
- **Prévention impayés** : Validation temps réel du taux d'effort
- **Gain de temps** : Pré-remplissage automatique des données CAF
- **Précision financière** : Tous les calculs utilisent le loyer net (après aides)
- **UX améliorée** : Alertes contextuelles pendant la création de bail

### ✅ Phase Consolidation : Fondations UX/UI - Semaine 1 (TERMINÉ)

**Date : 2 Janvier 2026**

#### ✅ Système de notifications Toast
- [x] **ToastContext** : Context React pour gérer les notifications globales
- [x] **useToast hook** : Hook personnalisé avec méthodes `success`, `error`, `warning`, `info`
- [x] **Toast.jsx** : Composant notification avec animations et auto-dismiss
- [x] **ToastContainer.jsx** : Conteneur de toasts en top-right
- [x] **Animations CSS** : `slide-in-right` et `progress` pour barre de progression
- [x] **Intégration App.jsx** : ToastProvider wrapping l'application complète

#### ✅ Composants UI essentiels créés
- [x] **Modal.jsx** : Modale réutilisable avec overlay, tailles (sm/md/lg/xl/full), fermeture Escape
- [x] **Dropdown.jsx** : Menu déroulant pour actions avec support icônes, dividers, danger variant
- [x] **Breadcrumb.jsx** : Fil d'Ariane hiérarchique avec icône Home et navigation
- [x] **Tabs.jsx** : Système d'onglets avec support badges, icônes, disabled state
- [x] **Skeleton.jsx** : Placeholders de chargement (text, title, avatar, card, table-row, button, image)

#### ✅ Animations et styles
- [x] **index.css mis à jour** : Animations fade-in, scale-in, slide-in-right, progress
- [x] **Animations fluides** : Transitions 0.2-0.3s pour UX professionnelle
- [x] **Responsive** : Tous les composants adaptés mobile/tablet/desktop

#### 📁 Fichiers créés
- ✨ `context/ToastContext.jsx`
- ✨ `components/ui/Toast.jsx`
- ✨ `components/ui/ToastContainer.jsx`
- ✨ `components/ui/Modal.jsx`
- ✨ `components/ui/Dropdown.jsx`
- ✨ `components/ui/Breadcrumb.jsx`
- ✨ `components/ui/Tabs.jsx`
- ✨ `components/ui/Skeleton.jsx`
- ⚡ `App.jsx` - Intégration ToastProvider
- ⚡ `index.css` - Animations CSS

#### 🎯 Impact
- **Cohérence UX** : Système de notifications uniforme dans toute l'app
- **Productivité dev** : Composants réutilisables prêts à l'emploi
- **Professionnalisme** : Animations fluides et feedback utilisateur clair
- **Maintenabilité** : Code centralisé et documenté dans CLAUDE.md
- **Performance** : Composants optimisés avec Context API

#### 🚀 Prochaines étapes (Semaine 2)
- [ ] Remplacer tous les `alert()` par `useToast` dans l'application
- [ ] Créer PropertyDetail.jsx avec Breadcrumb
- [ ] Créer EntityDetail.jsx avec Tabs pour différentes sections
- [ ] Vérification responsive sur toutes les pages existantes

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
│   │   ├── AuthContext.jsx         ✅
│   │   ├── EntityContext.jsx       ✅
│   │   └── ToastContext.jsx        ✨ NOUVEAU
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
> **Dernière mise à jour** : 2 Janvier 2026
> **Statut actuel** :
> - Phase 0 (MVP Initial) : ✅ TERMINÉ
> - Phase 1 (Architecture Multi-Entités) : ✅ TERMINÉ
> - Phase 2 (Indexation IRL) : ✅ TERMINÉ
> - Phase 2.5 (Candidatures et Tenant Groups) : ✅ TERMINÉ ✨ NOUVEAU
> - Phase 3 (Documents et États des Lieux) : 🔜 À VENIR
> - Phase 4 (Automatisation Communication) : 🔜 À VENIR
> - Phase 5 (Monétisation et Fiscalité) : 🔜 À VENIR
> - Phase 6 (Portail Locataire) : 🔜 À VENIR
