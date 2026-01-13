import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { checkRateLimitDetailed, formatRetryTime } from '../utils/rateLimiter'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [rateLimitError, setRateLimitError] = useState(null)
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setRateLimitError(null)

    try {
     
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
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <div className="bg-[var(--surface)] p-8 rounded-2xl shadow-card w-full max-w-md border border-[var(--border)] animate-fade-in">
        <h1 className="text-2xl font-display font-bold text-center text-[var(--text)] mb-6">Connexion</h1>


        {rateLimitError && (
          <div className="bg-orange-100 dark:bg-orange-900/30 border border-orange-400 dark:border-orange-600 text-orange-700 dark:text-orange-400 p-3 rounded-xl mb-4 flex items-start">
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
          <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-xl mb-4">{error}</div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="login-email" className="block text-sm font-display font-medium text-[var(--text)] mb-2">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
              placeholder="votre@email.com"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="login-password" className="block text-sm font-display font-medium text-[var(--text)] mb-2">Mot de passe</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[var(--color-electric-blue)] to-[#0066FF] text-white py-3 rounded-xl font-display font-semibold hover:brightness-110 hover:shadow-glow-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-[var(--text-secondary)] mt-4">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-[var(--color-electric-blue)] hover:underline">
            S'inscrire
          </Link>
        </p>


        <div className="mt-6 pt-4 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)] text-center">
            Protection active : 5 tentatives maximum par minute
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
