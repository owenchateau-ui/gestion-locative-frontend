# CLAUDE.md - SaaS Gestion Locative

> Ce fichier sert de référence pour tout assistant IA travaillant sur ce projet.
> Dernière mise à jour : Décembre 2024

---

## 🎯 VISION DU PROJET

### Description
Application web SaaS de gestion locative destinée aux propriétaires bailleurs français.
Permet de gérer les biens immobiliers, les locataires, les baux et le suivi des loyers.

### Proposition de valeur
- Simplifier la gestion locative pour les particuliers propriétaires
- Conformité automatique avec la législation française (loi ALUR, RGPD)
- Interface intuitive accessible aux non-techniciens

### Modèle économique
| Plan | Prix | Limites |
|------|------|---------|
| Gratuit | 0€ | 2 biens maximum |
| Premium | À définir | Biens illimités + fonctionnalités avancées |
| Locataire | Toujours gratuit | Accès consultation uniquement |

---

## 👥 UTILISATEURS ET RÔLES

### Bailleur (propriétaire)
- Peut créer et gérer des biens immobiliers
- Peut ajouter des locataires et créer des baux
- Peut enregistrer les paiements et générer des quittances
- Peut inviter des locataires à rejoindre la plateforme
- Accès au tableau de bord et aux statistiques

### Locataire
- Compte créé via invitation du bailleur uniquement
- Peut consulter son bail actif
- Peut télécharger ses quittances de loyer
- Peut voir l'historique de ses paiements
- Peut signaler des incidents (future fonctionnalité)

---

## 🛠️ STACK TECHNIQUE

### Frontend
```
Framework      : React 18+
Build tool     : Vite
Styling        : TailwindCSS
Routing        : React Router v6
State          : React Query (TanStack Query) + Context API
HTTP Client    : Axios
Forms          : React Hook Form + Zod (validation)
PDF Viewer     : react-pdf
Hébergement    : Vercel
```

### Backend
```
Framework      : NestJS
Runtime        : Node.js 18+
Language       : TypeScript (strict mode)
ORM            : Prisma
Validation     : class-validator + class-transformer
PDF Generation : PDFKit ou Puppeteer
Hébergement    : Railway
```

### Base de données & Services
```
Database       : PostgreSQL (via Supabase)
Auth           : Supabase Auth
File Storage   : Supabase Storage
```

### Repositories
```
Frontend       : github.com/[username]/gestion-locative-frontend
Backend        : github.com/[username]/gestion-locative-backend
```

---

## 📁 ARCHITECTURE DES DOSSIERS

### Frontend (React + Vite)
```
gestion-locative-frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/                     # Images, fonts, fichiers statiques
│   │   └── images/
│   ├── components/                 # Composants réutilisables
│   │   ├── ui/                     # Composants UI génériques
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Alert.jsx
│   │   │   └── Loader.jsx
│   │   ├── forms/                  # Composants de formulaire
│   │   │   ├── PropertyForm.jsx
│   │   │   ├── TenantForm.jsx
│   │   │   ├── LeaseForm.jsx
│   │   │   └── PaymentForm.jsx
│   │   └── layout/                 # Composants de mise en page
│   │       ├── Header.jsx
│   │       ├── Sidebar.jsx
│   │       ├── Footer.jsx
│   │       └── DashboardLayout.jsx
│   ├── pages/                      # Pages de l'application
│   │   ├── auth/                   # Pages authentification
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   └── AcceptInvitation.jsx
│   │   ├── landlord/               # Pages bailleur
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Properties.jsx
│   │   │   ├── PropertyDetail.jsx
│   │   │   ├── Tenants.jsx
│   │   │   ├── TenantDetail.jsx
│   │   │   ├── Leases.jsx
│   │   │   ├── LeaseDetail.jsx
│   │   │   ├── Payments.jsx
│   │   │   └── Settings.jsx
│   │   ├── tenant/                 # Pages locataire
│   │   │   ├── TenantDashboard.jsx
│   │   │   ├── MyLease.jsx
│   │   │   ├── MyReceipts.jsx
│   │   │   └── MyPayments.jsx
│   │   └── public/                 # Pages publiques
│   │       ├── Home.jsx
│   │       ├── Pricing.jsx
│   │       └── NotFound.jsx
│   ├── hooks/                      # Custom hooks
│   │   ├── useAuth.js
│   │   ├── useProperties.js
│   │   ├── useTenants.js
│   │   ├── useLeases.js
│   │   └── usePayments.js
│   ├── services/                   # Appels API
│   │   ├── api.js                  # Configuration Axios
│   │   ├── authService.js
│   │   ├── propertyService.js
│   │   ├── tenantService.js
│   │   ├── leaseService.js
│   │   ├── paymentService.js
│   │   └── documentService.js
│   ├── context/                    # React Context
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── utils/                      # Fonctions utilitaires
│   │   ├── formatters.js           # Formatage dates, montants
│   │   ├── validators.js           # Validation côté client
│   │   └── constants.js            # Constantes de l'app
│   ├── routes/                     # Configuration des routes
│   │   ├── index.jsx
│   │   ├── PrivateRoute.jsx
│   │   └── RoleRoute.jsx
│   ├── App.jsx                     # Composant racine
│   ├── main.jsx                    # Point d'entrée
│   └── index.css                   # Styles globaux + Tailwind
├── .env.example                    # Variables d'environnement exemple
├── .gitignore
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

### Backend (NestJS)
```
gestion-locative-backend/
├── prisma/
│   ├── schema.prisma               # Schéma de la base de données
│   ├── migrations/                 # Historique des migrations
│   └── seed.ts                     # Données de test
├── src/
│   ├── auth/                       # Module authentification
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── dto/
│   │   │   ├── register.dto.ts
│   │   │   ├── login.dto.ts
│   │   │   └── invite-tenant.dto.ts
│   │   ├── guards/
│   │   │   ├── jwt.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   └── strategies/
│   │       └── jwt.strategy.ts
│   ├── users/                      # Module utilisateurs
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   ├── dto/
│   │   │   └── update-user.dto.ts
│   │   └── entities/
│   │       └── user.entity.ts
│   ├── properties/                 # Module biens immobiliers
│   │   ├── properties.controller.ts
│   │   ├── properties.service.ts
│   │   ├── properties.module.ts
│   │   ├── dto/
│   │   │   ├── create-property.dto.ts
│   │   │   └── update-property.dto.ts
│   │   └── entities/
│   │       └── property.entity.ts
│   ├── tenants/                    # Module locataires
│   │   ├── tenants.controller.ts
│   │   ├── tenants.service.ts
│   │   ├── tenants.module.ts
│   │   ├── dto/
│   │   │   ├── create-tenant.dto.ts
│   │   │   └── update-tenant.dto.ts
│   │   └── entities/
│   │       └── tenant.entity.ts
│   ├── leases/                     # Module baux
│   │   ├── leases.controller.ts
│   │   ├── leases.service.ts
│   │   ├── leases.module.ts
│   │   ├── dto/
│   │   │   ├── create-lease.dto.ts
│   │   │   └── update-lease.dto.ts
│   │   └── entities/
│   │       └── lease.entity.ts
│   ├── payments/                   # Module paiements
│   │   ├── payments.controller.ts
│   │   ├── payments.service.ts
│   │   ├── payments.module.ts
│   │   ├── dto/
│   │   │   ├── create-payment.dto.ts
│   │   │   └── update-payment.dto.ts
│   │   └── entities/
│   │       └── payment.entity.ts
│   ├── documents/                  # Module documents (PDF)
│   │   ├── documents.controller.ts
│   │   ├── documents.service.ts
│   │   ├── documents.module.ts
│   │   ├── templates/              # Templates PDF
│   │   │   ├── lease-template.ts
│   │   │   └── receipt-template.ts
│   │   └── entities/
│   │       └── document.entity.ts
│   ├── dashboard/                  # Module tableau de bord
│   │   ├── dashboard.controller.ts
│   │   ├── dashboard.service.ts
│   │   └── dashboard.module.ts
│   ├── common/                     # Éléments partagés
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   └── transform.interceptor.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   └── utils/
│   │       ├── pagination.ts
│   │       └── date-helpers.ts
│   ├── config/                     # Configuration
│   │   ├── database.config.ts
│   │   ├── supabase.config.ts
│   │   └── app.config.ts
│   ├── app.module.ts               # Module racine
│   └── main.ts                     # Point d'entrée
├── test/                           # Tests
│   ├── unit/
│   └── e2e/
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── nest-cli.json
└── README.md
```

---

## 🗄️ SCHÉMA DE BASE DE DONNÉES

### Diagramme relationnel
```
┌──────────────────┐
│      users       │
├──────────────────┤
│ id (PK)          │
│ email            │
│ encrypted_password│
│ first_name       │
│ last_name        │
│ phone            │
│ role             │──────────────────────────────────────┐
│ plan             │                                      │
│ supabase_uid     │                                      │
│ created_at       │                                      │
│ updated_at       │                                      │
└────────┬─────────┘                                      │
         │                                                │
         │ 1:N (owner)                                    │
         ▼                                                │
┌──────────────────┐       ┌──────────────────┐          │
│   properties     │       │     tenants      │          │
├──────────────────┤       ├──────────────────┤          │
│ id (PK)          │       │ id (PK)          │          │
│ owner_id (FK)────┼───────│ landlord_id (FK)─┼──────────┘
│ name             │       │ user_id (FK)     │◄── Lien vers compte locataire
│ address          │       │ first_name       │
│ city             │       │ last_name        │
│ postal_code      │       │ email            │
│ property_type    │       │ phone            │
│ surface_area     │       │ created_at       │
│ nb_rooms         │       │ updated_at       │
│ rent_amount      │       └────────┬─────────┘
│ charges_amount   │                │
│ deposit_amount   │                │
│ status           │                │
│ created_at       │                │
│ updated_at       │                │
└────────┬─────────┘                │
         │                          │
         │ 1:N                      │ 1:N
         ▼                          ▼
┌─────────────────────────────────────────────┐
│                   leases                     │
├─────────────────────────────────────────────┤
│ id (PK)                                      │
│ property_id (FK)                             │
│ tenant_id (FK)                               │
│ start_date                                   │
│ end_date                                     │
│ rent_amount                                  │
│ charges_amount                               │
│ deposit_amount                               │
│ payment_day                                  │
│ lease_type                                   │
│ status                                       │
│ special_clauses                              │
│ created_at                                   │
│ updated_at                                   │
└──────────────────┬──────────────────────────┘
                   │
         ┌─────────┴─────────┐
         │ 1:N               │ 1:N
         ▼                   ▼
┌──────────────────┐ ┌──────────────────┐
│    payments      │ │    documents     │
├──────────────────┤ ├──────────────────┤
│ id (PK)          │ │ id (PK)          │
│ lease_id (FK)    │ │ lease_id (FK)    │
│ amount           │ │ document_type    │
│ payment_date     │ │ file_name        │
│ due_date         │ │ file_url         │
│ payment_method   │ │ generated_at     │
│ status           │ │ created_at       │
│ receipt_generated│ └──────────────────┘
│ created_at       │
│ updated_at       │
└──────────────────┘

┌──────────────────┐
│   invitations    │
├──────────────────┤
│ id (PK)          │
│ landlord_id (FK) │
│ tenant_id (FK)   │
│ email            │
│ token            │
│ status           │
│ expires_at       │
│ created_at       │
└──────────────────┘
```

### Script SQL (PostgreSQL)
```sql
-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types
CREATE TYPE user_role AS ENUM ('landlord', 'tenant');
CREATE TYPE user_plan AS ENUM ('free', 'premium');
CREATE TYPE property_type AS ENUM ('apartment', 'house', 'studio', 'commercial', 'parking', 'other');
CREATE TYPE property_status AS ENUM ('vacant', 'occupied', 'unavailable');
CREATE TYPE lease_type AS ENUM ('empty', 'furnished');  -- vide ou meublé
CREATE TYPE lease_status AS ENUM ('draft', 'active', 'terminated', 'archived');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'late', 'partial');
CREATE TYPE payment_method AS ENUM ('bank_transfer', 'check', 'cash', 'direct_debit', 'other');
CREATE TYPE document_type AS ENUM ('lease', 'receipt', 'inventory', 'amendment', 'other');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired', 'cancelled');

-- Table users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    encrypted_password VARCHAR(255),  -- Géré par Supabase Auth
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL DEFAULT 'landlord',
    plan user_plan NOT NULL DEFAULT 'free',
    supabase_uid UUID UNIQUE,  -- Lien avec Supabase Auth
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table properties (biens immobiliers)
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,  -- Nom pour identifier le bien
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    property_type property_type NOT NULL DEFAULT 'apartment',
    surface_area DECIMAL(10, 2),  -- en m²
    nb_rooms INTEGER,
    rent_amount DECIMAL(10, 2) NOT NULL,  -- Loyer hors charges
    charges_amount DECIMAL(10, 2) DEFAULT 0,  -- Charges
    deposit_amount DECIMAL(10, 2),  -- Dépôt de garantie
    description TEXT,
    status property_status NOT NULL DEFAULT 'vacant',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table tenants (locataires)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    landlord_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,  -- Compte utilisateur du locataire (optionnel)
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    place_of_birth VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(landlord_id, email)  -- Un bailleur ne peut pas avoir 2 locataires avec le même email
);

-- Table leases (baux)
CREATE TABLE leases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,  -- NULL pour bail reconduit tacitement
    rent_amount DECIMAL(10, 2) NOT NULL,
    charges_amount DECIMAL(10, 2) DEFAULT 0,
    deposit_amount DECIMAL(10, 2) NOT NULL,
    payment_day INTEGER NOT NULL DEFAULT 1 CHECK (payment_day >= 1 AND payment_day <= 28),
    lease_type lease_type NOT NULL DEFAULT 'empty',
    status lease_status NOT NULL DEFAULT 'draft',
    special_clauses TEXT,  -- Clauses particulières
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table payments (paiements)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,  -- Date d'échéance
    payment_date DATE,  -- Date effective du paiement
    payment_method payment_method,
    status payment_status NOT NULL DEFAULT 'pending',
    receipt_generated BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
    document_type document_type NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,  -- URL Supabase Storage
    file_size INTEGER,  -- Taille en bytes
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table invitations (invitations locataires)
CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    landlord_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    status invitation_status NOT NULL DEFAULT 'pending',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX idx_properties_owner ON properties(owner_id);
CREATE INDEX idx_tenants_landlord ON tenants(landlord_id);
CREATE INDEX idx_leases_property ON leases(property_id);
CREATE INDEX idx_leases_tenant ON leases(tenant_id);
CREATE INDEX idx_payments_lease ON payments(lease_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_documents_lease ON documents(lease_id);
CREATE INDEX idx_invitations_token ON invitations(token);

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leases_updated_at BEFORE UPDATE ON leases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 🔌 ENDPOINTS API REST

### Base URL
```
Production : https://api.gestion-locative.com/v1
Development : http://localhost:3000/v1
```

### Format des réponses
```json
// Succès
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}

// Erreur
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Description de l'erreur",
    "details": [ ... ]
  }
}
```

### 🔐 Auth Module

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/auth/register` | Inscription bailleur | Non |
| POST | `/auth/login` | Connexion | Non |
| POST | `/auth/logout` | Déconnexion | Oui |
| POST | `/auth/refresh` | Rafraîchir le token | Oui |
| POST | `/auth/forgot-password` | Mot de passe oublié | Non |
| POST | `/auth/reset-password` | Réinitialiser mot de passe | Non |
| GET | `/auth/me` | Profil utilisateur connecté | Oui |
| POST | `/auth/accept-invitation/:token` | Accepter invitation locataire | Non |

#### POST /auth/register
```json
// Request
{
  "email": "bailleur@email.com",
  "password": "MotDePasse123!",
  "firstName": "Jean",
  "lastName": "Dupont",
  "phone": "0612345678"
}

// Response 201
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "bailleur@email.com",
      "firstName": "Jean",
      "lastName": "Dupont",
      "role": "landlord",
      "plan": "free"
    },
    "accessToken": "jwt_token"
  }
}
```

### 🏠 Properties Module

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| GET | `/properties` | Liste des biens | Oui | Landlord |
| GET | `/properties/:id` | Détail d'un bien | Oui | Landlord |
| POST | `/properties` | Créer un bien | Oui | Landlord |
| PATCH | `/properties/:id` | Modifier un bien | Oui | Landlord |
| DELETE | `/properties/:id` | Supprimer un bien | Oui | Landlord |

#### POST /properties
```json
// Request
{
  "name": "Appartement Paris 11",
  "address": "15 rue de la Roquette",
  "city": "Paris",
  "postalCode": "75011",
  "propertyType": "apartment",
  "surfaceArea": 45.5,
  "nbRooms": 2,
  "rentAmount": 950.00,
  "chargesAmount": 80.00,
  "depositAmount": 950.00,
  "description": "Bel appartement lumineux"
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Appartement Paris 11",
    "address": "15 rue de la Roquette",
    "city": "Paris",
    "postalCode": "75011",
    "propertyType": "apartment",
    "surfaceArea": 45.5,
    "nbRooms": 2,
    "rentAmount": 950.00,
    "chargesAmount": 80.00,
    "depositAmount": 950.00,
    "status": "vacant",
    "createdAt": "2024-12-15T10:00:00Z"
  }
}
```

### 👤 Tenants Module

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| GET | `/tenants` | Liste des locataires | Oui | Landlord |
| GET | `/tenants/:id` | Détail d'un locataire | Oui | Landlord |
| POST | `/tenants` | Créer un locataire | Oui | Landlord |
| PATCH | `/tenants/:id` | Modifier un locataire | Oui | Landlord |
| DELETE | `/tenants/:id` | Supprimer un locataire | Oui | Landlord |
| POST | `/tenants/:id/invite` | Inviter le locataire | Oui | Landlord |

#### POST /tenants
```json
// Request
{
  "firstName": "Marie",
  "lastName": "Martin",
  "email": "marie.martin@email.com",
  "phone": "0698765432",
  "dateOfBirth": "1990-05-15",
  "placeOfBirth": "Lyon"
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "Marie",
    "lastName": "Martin",
    "email": "marie.martin@email.com",
    "phone": "0698765432",
    "hasAccount": false,
    "createdAt": "2024-12-15T10:00:00Z"
  }
}
```

### 📄 Leases Module

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| GET | `/leases` | Liste des baux | Oui | Landlord |
| GET | `/leases/:id` | Détail d'un bail | Oui | Landlord/Tenant |
| POST | `/leases` | Créer un bail | Oui | Landlord |
| PATCH | `/leases/:id` | Modifier un bail | Oui | Landlord |
| DELETE | `/leases/:id` | Supprimer un bail | Oui | Landlord |
| POST | `/leases/:id/generate-pdf` | Générer le PDF du bail | Oui | Landlord |
| PATCH | `/leases/:id/terminate` | Résilier un bail | Oui | Landlord |

#### POST /leases
```json
// Request
{
  "propertyId": "uuid",
  "tenantId": "uuid",
  "startDate": "2024-01-01",
  "endDate": null,
  "rentAmount": 950.00,
  "chargesAmount": 80.00,
  "depositAmount": 950.00,
  "paymentDay": 5,
  "leaseType": "empty",
  "specialClauses": "Le locataire s'engage à..."
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "property": { "id": "uuid", "name": "Appartement Paris 11" },
    "tenant": { "id": "uuid", "firstName": "Marie", "lastName": "Martin" },
    "startDate": "2024-01-01",
    "endDate": null,
    "rentAmount": 950.00,
    "chargesAmount": 80.00,
    "totalAmount": 1030.00,
    "depositAmount": 950.00,
    "paymentDay": 5,
    "leaseType": "empty",
    "status": "draft",
    "createdAt": "2024-12-15T10:00:00Z"
  }
}
```

### 💰 Payments Module

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| GET | `/payments` | Liste des paiements | Oui | Landlord |
| GET | `/payments/lease/:leaseId` | Paiements d'un bail | Oui | Landlord/Tenant |
| POST | `/payments` | Enregistrer un paiement | Oui | Landlord |
| PATCH | `/payments/:id` | Modifier un paiement | Oui | Landlord |
| DELETE | `/payments/:id` | Supprimer un paiement | Oui | Landlord |
| POST | `/payments/:id/generate-receipt` | Générer quittance | Oui | Landlord |

#### POST /payments
```json
// Request
{
  "leaseId": "uuid",
  "amount": 1030.00,
  "dueDate": "2024-12-05",
  "paymentDate": "2024-12-03",
  "paymentMethod": "bank_transfer",
  "notes": "Virement reçu"
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "leaseId": "uuid",
    "amount": 1030.00,
    "dueDate": "2024-12-05",
    "paymentDate": "2024-12-03",
    "paymentMethod": "bank_transfer",
    "status": "paid",
    "receiptGenerated": false,
    "createdAt": "2024-12-15T10:00:00Z"
  }
}
```

### 📑 Documents Module

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| GET | `/documents/lease/:leaseId` | Documents d'un bail | Oui | Landlord/Tenant |
| GET | `/documents/:id/download` | Télécharger un document | Oui | Landlord/Tenant |
| DELETE | `/documents/:id` | Supprimer un document | Oui | Landlord |

### 📊 Dashboard Module

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| GET | `/dashboard/stats` | Statistiques globales | Oui | Landlord |
| GET | `/dashboard/alerts` | Alertes (impayés, échéances) | Oui | Landlord |
| GET | `/dashboard/recent-activity` | Activité récente | Oui | Landlord |

#### GET /dashboard/stats
```json
// Response 200
{
  "success": true,
  "data": {
    "totalProperties": 5,
    "occupiedProperties": 4,
    "vacantProperties": 1,
    "totalTenants": 4,
    "monthlyRentExpected": 4200.00,
    "monthlyRentReceived": 3150.00,
    "unpaidAmount": 1050.00,
    "occupancyRate": 80
  }
}
```

### 👤 Tenant Portal (Portail locataire)

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| GET | `/tenant/my-lease` | Mon bail actif | Oui | Tenant |
| GET | `/tenant/my-payments` | Mes paiements | Oui | Tenant |
| GET | `/tenant/my-receipts` | Mes quittances | Oui | Tenant |

---

## ⚖️ CONFORMITÉ LÉGALE FRANÇAISE

### Bail conforme loi ALUR
Le bail généré doit obligatoirement contenir :
- Identité des parties (bailleur et locataire)
- Date de prise d'effet et durée
- Description du logement (adresse, surface, équipements)
- Montant du loyer et modalités de paiement
- Montant du dépôt de garantie
- Montant du loyer du précédent locataire (si applicable)
- Nature et montant des travaux effectués depuis le dernier bail
- Informations sur les honoraires de location
- Liste des documents annexes obligatoires

### Quittance de loyer
Mentions obligatoires :
- Nom et adresse du bailleur
- Nom et adresse du locataire
- Période concernée
- Adresse du logement
- Détail des sommes versées (loyer, charges)
- Date de paiement

### RGPD
- Consentement explicite au traitement des données
- Droit d'accès, de rectification et de suppression
- Durée de conservation limitée (3 ans après fin de bail)
- Sécurisation des données personnelles

---

## 🔧 VARIABLES D'ENVIRONNEMENT

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/v1
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Backend (.env)
```env
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=v1

# Database (Supabase)
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRATION=7d

# Frontend URL (pour les emails)
FRONTEND_URL=http://localhost:5173
```

---

## 📋 RÈGLES DE DÉVELOPPEMENT

### Conventions de nommage
- **Fichiers** : kebab-case (`create-property.dto.ts`)
- **Classes** : PascalCase (`CreatePropertyDto`)
- **Variables/Fonctions** : camelCase (`getPropertyById`)
- **Constantes** : UPPER_SNAKE_CASE (`MAX_FREE_PROPERTIES`)
- **Tables SQL** : snake_case pluriel (`properties`, `lease_documents`)
- **Colonnes SQL** : snake_case (`created_at`, `rent_amount`)

### Bonnes pratiques
1. Toujours valider les entrées utilisateur (DTOs avec class-validator)
2. Utiliser des transactions pour les opérations multiples
3. Logger les erreurs avec contexte
4. Gérer les erreurs avec des exceptions HTTP appropriées
5. Paginer les listes (défaut: 10 éléments, max: 100)
6. Documenter les endpoints avec Swagger

### Sécurité
- Vérifier que l'utilisateur est propriétaire des ressources qu'il modifie
- Limiter le nombre de biens pour les comptes gratuits (2 max)
- Hasher les tokens d'invitation
- Expirer les tokens d'invitation après 7 jours
- Rate limiting sur les endpoints sensibles

---

## 🚀 COMMANDES UTILES

### Frontend
```bash
# Installation
npm install

# Développement
npm run dev

# Build production
npm run build

# Lint
npm run lint
```

### Backend
```bash
# Installation
npm install

# Développement
npm run start:dev

# Build production
npm run build
npm run start:prod

# Migrations Prisma
npx prisma migrate dev --name nom_migration
npx prisma generate
npx prisma studio  # Interface visuelle BDD

# Tests
npm run test
npm run test:e2e
```

---

## 📞 CONTACTS & RESSOURCES

### Documentation
- [NestJS](https://docs.nestjs.com/)
- [Prisma](https://www.prisma.io/docs/)
- [Supabase](https://supabase.com/docs)
- [React](https://react.dev/)
- [TailwindCSS](https://tailwindcss.com/docs)

### Législation
- [Loi ALUR](https://www.legifrance.gouv.fr/loda/id/JORFTEXT000028772256/)
- [Modèle de bail officiel](https://www.service-public.fr/particuliers/vosdroits/R31600)
- [CNIL - RGPD](https://www.cnil.fr/fr/rgpd-de-quoi-parle-t-on)

---

> **Note pour l'IA** : Ce fichier est la source de vérité pour ce projet.
> Référez-vous toujours à ce document pour les choix techniques, la structure,
> et les règles métier. Mettez-le à jour si des décisions changent.
