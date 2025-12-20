import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Properties from './pages/Properties'
import PropertyForm from './pages/PropertyForm'
import Tenants from './pages/Tenants'
import TenantForm from './pages/TenantForm'
import Leases from './pages/Leases'
import LeaseForm from './pages/LeaseForm'

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
      <Route path="/" element={<Navigate to="/login" replace />} />
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
        path="/properties/:id/edit"
        element={
          <PrivateRoute>
            <PropertyForm />
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
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App