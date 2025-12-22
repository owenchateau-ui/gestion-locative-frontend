import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { EntityProvider } from './context/EntityContext'
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
import Profile from './pages/Profile'

// Composant pour protéger les routes
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Chargement...</div>
      </div>
    )
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
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EntityProvider>
          <AppRoutes />
        </EntityProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App