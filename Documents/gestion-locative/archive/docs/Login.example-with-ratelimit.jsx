/**
 * EXEMPLE: Login.jsx avec Rate Limiting intégré
 *
 * Ce fichier montre comment intégrer le rate limiting dans Login.jsx
 * NE PAS REMPLACER Login.jsx directement - c'est un exemple de référence
 *
 * Modifications à faire dans le vrai Login.jsx:
 * 1. Importer checkRateLimit et formatRetryTime
 * 2. Ajouter la vérification AVANT le signIn
 * 3. Gérer le message d'erreur rate limit
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { checkRateLimitDetailed, formatRetryTime } from '../utils/rateLimiter' // ✅ AJOUT

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [rateLimitError, setRateLimitError] = useState(null) // ✅ AJOUT
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setRateLimitError(null) // ✅ AJOUT

    try {
      // ✅ AJOUT: Vérifier le rate limit AVANT la tentative de connexion
      const rateLimitResult = await checkRateLimitDetailed('auth:login', email)

      if (!rateLimitResult.allowed) {
        setRateLimitError(
          `${rateLimitResult.message} Réessayez ${formatRetryTime(rateLimitResult.resetAt)}.`
        )
        setLoading(false)
        return
      }

      // Tentative de connexion
      await signIn(email, password)
      navigate('/dashboard')
    } catch (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Connexion</h1>

        {/* ✅ AJOUT: Affichage erreur rate limit (style distinct) */}
        {rateLimitError && (
          <div className="bg-orange-100 border border-orange-400 text-orange-700 p-3 rounded mb-4 flex items-start">
            <svg
              className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-semibold">Trop de tentatives</p>
              <p className="text-sm">{rateLimitError}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="votre@email.com"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            S'inscrire
          </Link>
        </p>

        {/* ✅ AJOUT: Indication limite visible (optionnel) */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Protection active : 5 tentatives maximum par minute
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
