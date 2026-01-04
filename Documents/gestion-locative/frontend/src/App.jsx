import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { EntityProvider } from './context/EntityContext'
import { ToastProvider } from './context/ToastContext'
import ErrorBoundary from './components/ErrorBoundary'
import Loading from './components/ui/Loading'
import ToastContainer from './components/ui/ToastContainer'

// Pages publiques (chargées immédiatement)
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import PublicCandidateForm from './pages/PublicCandidateForm'
import CandidateStatus from './pages/CandidateStatus'

// Pages privées (lazy loading)
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Entities = lazy(() => import('./pages/Entities'))
const EntityForm = lazy(() => import('./pages/EntityForm'))
const EntityDetail = lazy(() => import('./pages/EntityDetail'))
const Properties = lazy(() => import('./pages/Properties'))
const PropertyForm = lazy(() => import('./pages/PropertyForm'))
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'))
const Lots = lazy(() => import('./pages/Lots'))
const LotForm = lazy(() => import('./pages/LotForm'))
const LotDetail = lazy(() => import('./pages/LotDetail'))
const Tenants = lazy(() => import('./pages/Tenants'))
const TenantForm = lazy(() => import('./pages/TenantForm'))
const TenantDetail = lazy(() => import('./pages/TenantDetail'))
const Leases = lazy(() => import('./pages/Leases'))
const LeaseForm = lazy(() => import('./pages/LeaseForm'))
const LeaseDetail = lazy(() => import('./pages/LeaseDetail'))
const Payments = lazy(() => import('./pages/Payments'))
const PaymentForm = lazy(() => import('./pages/PaymentForm'))
const Indexation = lazy(() => import('./pages/Indexation'))
const Candidates = lazy(() => import('./pages/Candidates'))
const CandidateDetail = lazy(() => import('./pages/CandidateDetail'))
const Profile = lazy(() => import('./pages/Profile'))
const ComingSoon = lazy(() => import('./pages/ComingSoon'))

// Composant pour protéger les routes
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <Loading fullScreen message="Vérification de la session..." />
  }

  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Suspense fallback={<Loading fullScreen message="Chargement de la page..." />}>
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Routes publiques pour les candidatures */}
      <Route path="/apply/:token" element={<PublicCandidateForm />} />
      <Route path="/application-status" element={<CandidateStatus />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/entities"
        element={
          <PrivateRoute>
            <Entities />
          </PrivateRoute>
        }
      />
      <Route
        path="/entities/new"
        element={
          <PrivateRoute>
            <EntityForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/entities/:id"
        element={
          <PrivateRoute>
            <EntityDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/entities/:id/edit"
        element={
          <PrivateRoute>
            <EntityForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/properties"
        element={
          <PrivateRoute>
            <Properties />
          </PrivateRoute>
        }
      />
      <Route
        path="/properties/new"
        element={
          <PrivateRoute>
            <PropertyForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/properties/:id"
        element={
          <PrivateRoute>
            <PropertyDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/properties/:id/edit"
        element={
          <PrivateRoute>
            <PropertyForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/lots"
        element={
          <PrivateRoute>
            <Lots />
          </PrivateRoute>
        }
      />
      <Route
        path="/lots/new"
        element={
          <PrivateRoute>
            <LotForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/lots/:id"
        element={
          <PrivateRoute>
            <LotDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/lots/:id/edit"
        element={
          <PrivateRoute>
            <LotForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/tenants"
        element={
          <PrivateRoute>
            <Tenants />
          </PrivateRoute>
        }
      />
      <Route
        path="/tenants/new"
        element={
          <PrivateRoute>
            <TenantForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/tenants/:id"
        element={
          <PrivateRoute>
            <TenantDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/tenants/:id/edit"
        element={
          <PrivateRoute>
            <TenantForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/leases"
        element={
          <PrivateRoute>
            <Leases />
          </PrivateRoute>
        }
      />
      <Route
        path="/leases/new"
        element={
          <PrivateRoute>
            <LeaseForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/leases/:id"
        element={
          <PrivateRoute>
            <LeaseDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/leases/:id/edit"
        element={
          <PrivateRoute>
            <LeaseForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <PrivateRoute>
            <Payments />
          </PrivateRoute>
        }
      />
      <Route
        path="/payments/new"
        element={
          <PrivateRoute>
            <PaymentForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/payments/:id/edit"
        element={
          <PrivateRoute>
            <PaymentForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/indexation"
        element={
          <PrivateRoute>
            <Indexation />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />

      {/* Routes candidatures */}
      <Route
        path="/candidates"
        element={
          <PrivateRoute>
            <Candidates />
          </PrivateRoute>
        }
      />
      <Route
        path="/candidates/:id"
        element={
          <PrivateRoute>
            <CandidateDetail />
          </PrivateRoute>
        }
      />

      {/* Routes "Coming Soon" - Fonctionnalités à venir */}
      <Route
        path="/diagnostics"
        element={
          <PrivateRoute>
            <ComingSoon />
          </PrivateRoute>
        }
      />
      <Route
        path="/inspections"
        element={
          <PrivateRoute>
            <ComingSoon />
          </PrivateRoute>
        }
      />
      <Route
        path="/receipts"
        element={
          <PrivateRoute>
            <ComingSoon />
          </PrivateRoute>
        }
      />
      <Route
        path="/charges"
        element={
          <PrivateRoute>
            <ComingSoon />
          </PrivateRoute>
        }
      />
      <Route
        path="/accounting"
        element={
          <PrivateRoute>
            <ComingSoon />
          </PrivateRoute>
        }
      />
      <Route
        path="/documents"
        element={
          <PrivateRoute>
            <ComingSoon />
          </PrivateRoute>
        }
      />
      <Route
        path="/templates"
        element={
          <PrivateRoute>
            <ComingSoon />
          </PrivateRoute>
        }
      />
      <Route
        path="/signatures"
        element={
          <PrivateRoute>
            <ComingSoon />
          </PrivateRoute>
        }
      />
      <Route
        path="/incidents"
        element={
          <PrivateRoute>
            <ComingSoon />
          </PrivateRoute>
        }
      />
      <Route
        path="/works"
        element={
          <PrivateRoute>
            <ComingSoon />
          </PrivateRoute>
        }
      />
      <Route
        path="/maintenance"
        element={
          <PrivateRoute>
            <ComingSoon />
          </PrivateRoute>
        }
      />
      <Route
        path="/contractors"
        element={
          <PrivateRoute>
            <ComingSoon />
          </PrivateRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <PrivateRoute>
            <ComingSoon />
          </PrivateRoute>
        }
      />
      <Route
        path="/mailings"
        element={
          <PrivateRoute>
            <ComingSoon />
          </PrivateRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <PrivateRoute>
            <ComingSoon />
          </PrivateRoute>
        }
      />
      <Route
        path="/tenant-portal"
        element={
          <PrivateRoute>
            <ComingSoon />
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <ComingSoon />
          </PrivateRoute>
        }
      />
      </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <EntityProvider>
            <ToastProvider>
              <AppRoutes />
              <ToastContainer />
            </ToastProvider>
          </EntityProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App