import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { EntityProvider } from './context/EntityContext'
import ErrorBoundary from './components/ErrorBoundary'
import Loading from './components/ui/Loading'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Entities from './pages/Entities'
import EntityForm from './pages/EntityForm'
import EntityDetail from './pages/EntityDetail'
import Properties from './pages/Properties'
import PropertyForm from './pages/PropertyForm'
import PropertyDetail from './pages/PropertyDetail'
import Lots from './pages/Lots'
import LotForm from './pages/LotForm'
import LotDetail from './pages/LotDetail'
import Tenants from './pages/Tenants'
import TenantForm from './pages/TenantForm'
import Leases from './pages/Leases'
import LeaseForm from './pages/LeaseForm'
import Payments from './pages/Payments'
import PaymentForm from './pages/PaymentForm'
import Indexation from './pages/Indexation'
import Profile from './pages/Profile'
import ComingSoon from './pages/ComingSoon'

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
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
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
        path="/candidates"
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
  )
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <EntityProvider>
            <AppRoutes />
          </EntityProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App