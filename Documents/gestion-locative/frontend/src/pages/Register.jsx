import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await signUp(email, password, {
        firstName,
        lastName,
        phone,
      })
      setSuccess(true)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="bg-[var(--surface)] p-8 rounded-2xl shadow-card border border-[var(--border)] w-full max-w-md text-center animate-fade-in">
          <h1 className="text-2xl font-display font-bold text-emerald-600 dark:text-emerald-400 mb-4">Inscription réussie</h1>
          <p className="text-[var(--text-secondary)] mb-4">Votre compte a été créé avec succès.</p>
          <Link to="/login" className="inline-block bg-gradient-to-r from-[var(--color-electric-blue)] to-[#0066FF] text-white px-6 py-3 rounded-xl font-display font-semibold hover:brightness-110 hover:shadow-glow-blue transition-all duration-200">Se connecter</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center py-8">
      <div className="bg-[var(--surface)] p-8 rounded-2xl shadow-card border border-[var(--border)] w-full max-w-md animate-fade-in">
        <h1 className="text-2xl font-display font-bold text-center text-[var(--text)] mb-6">Créer un compte</h1>
        {error && <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-xl mb-4">{error}</div>}
        <form onSubmit={handleRegister}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="register-firstname" className="block text-sm font-display font-medium text-[var(--text)] mb-2">Prénom</label>
              <input id="register-firstname" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full p-3 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors" placeholder="Jean" required />
            </div>
            <div>
              <label htmlFor="register-lastname" className="block text-sm font-display font-medium text-[var(--text)] mb-2">Nom</label>
              <input id="register-lastname" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full p-3 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors" placeholder="Dupont" required />
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="register-phone" className="block text-sm font-display font-medium text-[var(--text)] mb-2">Téléphone</label>
            <input id="register-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors" placeholder="06 12 34 56 78" />
          </div>
          <div className="mb-4">
            <label htmlFor="register-email" className="block text-sm font-display font-medium text-[var(--text)] mb-2">Email</label>
            <input id="register-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors" placeholder="votre@email.com" required />
          </div>
          <div className="mb-6">
            <label htmlFor="register-password" className="block text-sm font-display font-medium text-[var(--text)] mb-2">Mot de passe</label>
            <input id="register-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors" placeholder="********" minLength={6} required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[var(--color-electric-blue)] to-[#0066FF] text-white p-3 rounded-xl font-display font-semibold hover:brightness-110 hover:shadow-glow-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">{loading ? 'Inscription...' : "S'inscrire"}</button>
        </form>
        <p className="text-center mt-4 text-[var(--text-secondary)]">Déjà un compte ? <Link to="/login" className="text-[var(--color-electric-blue)] hover:underline">Se connecter</Link></p>
      </div>
    </div>
  )
}

export default Register