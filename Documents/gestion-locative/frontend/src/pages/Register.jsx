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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-green-600 mb-4">Inscription reussie</h1>
          <p className="text-gray-600 mb-4">Votre compte a ete cree avec succes.</p>
          <Link to="/login" className="inline-block bg-blue-500 text-white px-6 py-3 rounded font-semibold hover:bg-blue-600">Se connecter</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Creer un compte</h1>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleRegister}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="register-firstname" className="block text-gray-700 mb-2">Prenom</label>
              <input id="register-firstname" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Jean" required />
            </div>
            <div>
              <label htmlFor="register-lastname" className="block text-gray-700 mb-2">Nom</label>
              <input id="register-lastname" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Dupont" required />
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="register-phone" className="block text-gray-700 mb-2">Telephone</label>
            <input id="register-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="06 12 34 56 78" />
          </div>
          <div className="mb-4">
            <label htmlFor="register-email" className="block text-gray-700 mb-2">Email</label>
            <input id="register-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="votre@email.com" required />
          </div>
          <div className="mb-6">
            <label htmlFor="register-password" className="block text-gray-700 mb-2">Mot de passe</label>
            <input id="register-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="********" minLength={6} required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white p-3 rounded font-semibold hover:bg-blue-600 disabled:opacity-50">{loading ? 'Inscription...' : "S'inscrire"}</button>
        </form>
        <p className="text-center mt-4 text-gray-600">Deja un compte ? <Link to="/login" className="text-blue-500 hover:underline">Se connecter</Link></p>
      </div>
    </div>
  )
}

export default Register