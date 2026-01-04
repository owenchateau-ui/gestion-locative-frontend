# 🧪 Guide des Tests - Gestion Locative

## 🎯 Objectifs

- **Couverture minimale**: 70% (lignes, fonctions, branches, statements)
- **Tests unitaires**: Composants UI et utils
- **Tests intégration**: Pages et services
- **Tests E2E**: Parcours utilisateur critiques

---

## 📦 Stack de Test

| Outil | Rôle | Pourquoi |
|-------|------|----------|
| **Vitest** | Test runner | Rapide, compatible Vite, API compatible Jest |
| **React Testing Library** | Tests composants React | Best practices, user-centric |
| **@testing-library/user-event** | Simulation interactions | Plus réaliste que fireEvent |
| **jsdom/happy-dom** | DOM virtuel | Exécution tests sans navigateur |
| **@vitest/ui** | Interface web tests | Debugging visuel |

---

## 🚀 Installation (FAIT ✅)

```bash
cd frontend
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event happy-dom
```

---

## ⚙️ Configuration

### vitest.config.js ✅

```javascript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.js'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### src/tests/setup.js ✅

Mock global Supabase + React Router + Window APIs

---

## 📝 Commandes NPM

```json
{
  "scripts": {
    "test": "vitest",                          // Mode watch
    "test:ui": "vitest --ui",                  // Interface web
    "test:run": "vitest run",                  // Run once
    "test:coverage": "vitest run --coverage"   // Avec couverture
  }
}
```

### Usage

```bash
# Mode watch (dev)
npm run test

# Une seule exécution (CI)
npm run test:run

# Avec couverture
npm run test:coverage

# Interface web
npm run test:ui
# → http://localhost:51204/__vitest__/
```

---

## 📂 Structure des Tests

```
frontend/src/
├── components/
│   └── ui/
│       ├── Button.jsx
│       ├── Card.jsx
│       ├── Badge.jsx
│       └── __tests__/
│           ├── Button.test.jsx
│           ├── Card.test.jsx
│           └── Badge.test.jsx
├── pages/
│   ├── Dashboard.jsx
│   └── __tests__/
│       └── Dashboard.test.jsx
├── services/
│   ├── candidateService.js
│   └── __tests__/
│       └── candidateService.test.js
├── utils/
│   ├── logger.js
│   └── __tests__/
│       └── logger.test.js
└── tests/
    ├── setup.js              # Configuration globale
    ├── helpers.js            # Fonctions utilitaires tests
    └── fixtures/             # Données de test réutilisables
        ├── tenants.js
        ├── leases.js
        └── payments.js
```

---

## 🧪 Patterns de Test

### 1. Test Composant UI Simple

```jsx
/**
 * Tests unitaires: Badge Component
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Badge from '../Badge'

describe('Badge Component', () => {
  it('renders children correctly', () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('applies success variant classes', () => {
    const { container } = render(<Badge variant="success">Success</Badge>)
    const badge = container.firstChild
    expect(badge).toHaveClass('bg-emerald-100', 'text-emerald-800')
  })
})
```

### 2. Test avec Interactions Utilisateur

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from '../Button'

describe('Button Component', () => {
  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)
    const button = screen.getByRole('button')

    await user.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button disabled onClick={handleClick}>Disabled</Button>)
    const button = screen.getByRole('button')

    await user.click(button)

    expect(handleClick).not.toHaveBeenCalled()
  })
})
```

### 3. Test Composant avec Context

```jsx
import { render, screen } from '@testing-library/react'
import { AuthContext } from '@/context/AuthContext'
import Dashboard from '../Dashboard'

describe('Dashboard Page', () => {
  it('displays user name when authenticated', () => {
    const mockUser = { id: '123', email: 'test@example.com', name: 'John Doe' }

    render(
      <AuthContext.Provider value={{ user: mockUser, signOut: vi.fn() }}>
        <Dashboard />
      </AuthContext.Provider>
    )

    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })
})
```

### 4. Test avec Router

```jsx
import { BrowserRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Navigation from '../Navigation'

describe('Navigation Component', () => {
  it('navigates to properties page on click', async () => {
    const user = userEvent.setup()

    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    )

    const propertiesLink = screen.getByRole('link', { name: /propriétés/i })
    await user.click(propertiesLink)

    expect(window.location.pathname).toBe('/properties')
  })
})
```

### 5. Test Asynchrone (Service)

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from '@/lib/supabase'
import { getTenants, createTenant } from '../tenantService'

// Mock Supabase déjà fait dans setup.js, mais on peut override
vi.mock('@/lib/supabase')

describe('tenantService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getTenants returns tenant list', async () => {
    const mockTenants = [
      { id: '1', first_name: 'John', last_name: 'Doe' },
      { id: '2', first_name: 'Jane', last_name: 'Smith' },
    ]

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockTenants, error: null }),
      }),
    })

    const result = await getTenants()

    expect(result).toEqual(mockTenants)
    expect(supabase.from).toHaveBeenCalledWith('tenants')
  })

  it('createTenant calls Supabase insert', async () => {
    const newTenant = { first_name: 'Bob', last_name: 'Martin' }

    supabase.from.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ data: newTenant, error: null }),
    })

    await createTenant(newTenant)

    expect(supabase.from).toHaveBeenCalledWith('tenants')
    expect(supabase.from().insert).toHaveBeenCalledWith(newTenant)
  })

  it('getTenants throws error on Supabase error', async () => {
    const mockError = { message: 'Database error' }

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }),
    })

    await expect(getTenants()).rejects.toThrow('Database error')
  })
})
```

### 6. Test Formulaire Complexe

```jsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TenantForm from '../TenantForm'

describe('TenantForm', () => {
  it('submits form with valid data', async () => {
    const handleSubmit = vi.fn()
    const user = userEvent.setup()

    render(<TenantForm onSubmit={handleSubmit} />)

    // Remplir les champs
    await user.type(screen.getByLabelText(/prénom/i), 'John')
    await user.type(screen.getByLabelText(/nom/i), 'Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/téléphone/i), '0612345678')

    // Soumettre
    await user.click(screen.getByRole('button', { name: /enregistrer/i }))

    // Vérifier l'appel
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '0612345678',
      })
    })
  })

  it('displays validation errors on invalid data', async () => {
    const user = userEvent.setup()

    render(<TenantForm onSubmit={vi.fn()} />)

    // Soumettre formulaire vide
    await user.click(screen.getByRole('button', { name: /enregistrer/i }))

    // Vérifier messages d'erreur
    await waitFor(() => {
      expect(screen.getByText(/le prénom est requis/i)).toBeInTheDocument()
      expect(screen.getByText(/l'email est requis/i)).toBeInTheDocument()
    })
  })
})
```

### 7. Test Upload Fichier

```jsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DocumentUpload from '../DocumentUpload'

describe('DocumentUpload', () => {
  it('uploads file successfully', async () => {
    const handleUpload = vi.fn()
    const user = userEvent.setup()

    render(<DocumentUpload onUpload={handleUpload} />)

    // Créer un fichier mock
    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' })

    // Upload
    const input = screen.getByLabelText(/choisir un fichier/i)
    await user.upload(input, file)

    // Vérifier
    await waitFor(() => {
      expect(handleUpload).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'test.pdf',
          type: 'application/pdf',
        })
      )
    })
  })

  it('rejects files exceeding size limit', async () => {
    const user = userEvent.setup()

    render(<DocumentUpload maxSize={1} />) // 1 MB max

    // Fichier 5 MB
    const file = new File(['x'.repeat(5 * 1024 * 1024)], 'large.pdf', {
      type: 'application/pdf',
    })

    const input = screen.getByLabelText(/choisir un fichier/i)
    await user.upload(input, file)

    // Vérifier message d'erreur
    await waitFor(() => {
      expect(screen.getByText(/fichier trop volumineux/i)).toBeInTheDocument()
    })
  })
})
```

---

## 🎯 Tests Fixtures (Données Réutilisables)

### src/tests/fixtures/tenants.js

```javascript
export const mockTenant = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  entity_id: '123e4567-e89b-12d3-a456-426614174001',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  phone: '0612345678',
  birth_date: '1990-01-15',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

export const mockTenants = [
  mockTenant,
  {
    id: '223e4567-e89b-12d3-a456-426614174000',
    entity_id: '123e4567-e89b-12d3-a456-426614174001',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@example.com',
    phone: '0698765432',
    birth_date: '1985-06-20',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
]
```

### src/tests/fixtures/leases.js

```javascript
export const mockLease = {
  id: '323e4567-e89b-12d3-a456-426614174000',
  lot_id: '423e4567-e89b-12d3-a456-426614174000',
  tenant_id: '123e4567-e89b-12d3-a456-426614174000',
  status: 'active',
  start_date: '2024-01-01',
  end_date: '2027-12-31',
  rent_amount: 1200.0,
  charges_amount: 150.0,
  deposit_amount: 1200.0,
  created_at: '2023-12-01T00:00:00Z',
  updated_at: '2023-12-01T00:00:00Z',
}
```

### Usage

```jsx
import { mockTenant, mockTenants } from '@/tests/fixtures/tenants'
import { mockLease } from '@/tests/fixtures/leases'

describe('TenantDetail', () => {
  it('displays tenant information', () => {
    render(<TenantDetail tenant={mockTenant} lease={mockLease} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('1 200 €')).toBeInTheDocument()
  })
})
```

---

## 🧩 Helpers de Test

### src/tests/helpers.js

```javascript
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthContext } from '@/context/AuthContext'

/**
 * Render avec Router et Auth Context
 */
export function renderWithProviders(
  ui,
  {
    user = null,
    initialRoute = '/',
    ...renderOptions
  } = {}
) {
  window.history.pushState({}, 'Test page', initialRoute)

  const mockAuthContext = {
    user,
    signIn: vi.fn(),
    signOut: vi.fn(),
    loading: false,
  }

  function Wrapper({ children }) {
    return (
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthContext}>
          {children}
        </AuthContext.Provider>
      </BrowserRouter>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

/**
 * Attendre qu'un élément disparaisse
 */
export async function waitForElementToBeRemoved(element) {
  return waitFor(() => {
    expect(element).not.toBeInTheDocument()
  })
}

/**
 * Simuler delay async
 */
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
```

### Usage

```jsx
import { renderWithProviders } from '@/tests/helpers'

describe('Dashboard', () => {
  it('shows dashboard for authenticated user', () => {
    const mockUser = { id: '123', email: 'test@example.com' }

    renderWithProviders(<Dashboard />, { user: mockUser, initialRoute: '/dashboard' })

    expect(screen.getByText(/tableau de bord/i)).toBeInTheDocument()
  })
})
```

---

## 📊 Couverture de Code

### Objectifs

- **Lignes**: 70%+
- **Fonctions**: 70%+
- **Branches**: 70%+
- **Statements**: 70%+

### Générer le rapport

```bash
npm run test:coverage
```

### Rapport HTML

```bash
open coverage/index.html
```

### Fichiers exclus (vitest.config.js)

```javascript
coverage: {
  exclude: [
    'node_modules/',
    'src/tests/',
    '**/*.config.js',
    '**/dist/',
    'src/main.jsx',  // Point d'entrée
  ],
}
```

---

## ✅ Checklist Tests

### Composants UI (8 composants)

- [x] Button.jsx
- [x] Card.jsx
- [x] Badge.jsx
- [ ] Alert.jsx
- [ ] StatCard.jsx
- [ ] Table.jsx (si utilisé)

### Pages Principales (6 pages)

- [ ] Dashboard.jsx
- [ ] Properties.jsx
- [ ] Tenants.jsx
- [ ] Leases.jsx
- [ ] Payments.jsx
- [ ] Profile.jsx

### Formulaires (4 formulaires)

- [ ] PropertyForm.jsx
- [ ] TenantForm.jsx
- [ ] LeaseForm.jsx
- [ ] PaymentForm.jsx

### Services (3+ services)

- [ ] candidateService.js
- [ ] tenantService.js
- [ ] paymentService.js

### Utils (2+ utils)

- [ ] logger.js
- [ ] rateLimiter.js

---

## 🚀 CI/CD GitHub Actions

### .github/workflows/tests.yml

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        working-directory: frontend
        run: npm ci

      - name: Run tests
        working-directory: frontend
        run: npm run test:run

      - name: Generate coverage
        working-directory: frontend
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: ./frontend/coverage/coverage-final.json
          fail_ci_if_error: true

      - name: Check coverage thresholds
        working-directory: frontend
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 70" | bc -l) )); then
            echo "Coverage $COVERAGE% is below 70% threshold"
            exit 1
          fi
```

---

## 🎓 Best Practices

### ✅ DO

- ✅ Tester le comportement, pas l'implémentation
- ✅ Utiliser `getByRole` plutôt que `getByTestId`
- ✅ Utiliser `userEvent` plutôt que `fireEvent`
- ✅ Tester les cas limites (edge cases)
- ✅ Mocker Supabase et services externes
- ✅ Nommer les tests clairement ("it should...")
- ✅ Organiser avec describe/it
- ✅ Nettoyer après chaque test (afterEach)

### ❌ DON'T

- ❌ Tester les détails d'implémentation (state interne)
- ❌ Tester les librairies tierces (React, Supabase)
- ❌ Faire des tests trop larges (tester tout en un test)
- ❌ Oublier les cas d'erreur
- ❌ Laisser des `console.log` dans les tests
- ❌ Hardcoder des données (utiliser fixtures)

---

## 📚 Ressources

- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Test Accessibility](https://testing-library.com/docs/queries/byrole/)

---

*Temps setup: 1 jour*
*Temps écriture tests: 4 jours*
*Couverture cible: 70%+*
