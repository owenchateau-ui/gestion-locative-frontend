import { Link } from 'react-router-dom'
import { STAT_ICON_STYLES } from '../constants/designSystem'

function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <nav className="bg-[var(--surface)] shadow-sm border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-display font-bold text-[var(--color-electric-blue)]">Gestion Locative</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-[var(--text)] hover:text-[var(--color-electric-blue)] font-medium transition-colors"
            >
              Se connecter
            </Link>
            <Link
              to="/register"
              className="bg-[var(--color-electric-blue)] text-white px-6 py-2 rounded-xl hover:bg-[var(--color-electric-blue)]/90 font-medium transition-colors"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-display font-bold text-[var(--text)] mb-6">
            Simplifiez la gestion de vos biens locatifs
          </h2>
          <p className="text-xl text-[var(--text-secondary)] mb-8 max-w-3xl mx-auto">
            Une solution complète pour gérer vos propriétés, locataires, baux et paiements en toute simplicité.
            Conforme à la loi ALUR et au RGPD.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/register"
              className="bg-[var(--color-electric-blue)] text-white px-8 py-4 rounded-xl hover:bg-[var(--color-electric-blue)]/90 font-semibold text-lg transition-colors"
            >
              Essayer gratuitement
            </Link>
            <Link
              to="/login"
              className="bg-[var(--surface)] text-[var(--color-electric-blue)] px-8 py-4 rounded-xl hover:bg-[var(--surface-elevated)] font-semibold text-lg border-2 border-[var(--color-electric-blue)] transition-colors"
            >
              Se connecter
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
          <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-md border border-[var(--border)]">
            <div className="w-12 h-12 bg-[var(--color-electric-blue)]/10 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[var(--color-electric-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-display font-semibold text-[var(--text)] mb-2">Gestion des biens</h3>
            <p className="text-[var(--text-secondary)]">
              Centralisez toutes les informations de vos propriétés en un seul endroit.
            </p>
          </div>

          <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-md border border-[var(--border)]">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${STAT_ICON_STYLES.emerald.container}`}>
              <svg className={`w-6 h-6 ${STAT_ICON_STYLES.emerald.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-display font-semibold text-[var(--text)] mb-2">Suivi des locataires</h3>
            <p className="text-[var(--text-secondary)]">
              Gérez vos locataires et leurs informations de manière sécurisée.
            </p>
          </div>

          <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-md border border-[var(--border)]">
            <div className="w-12 h-12 bg-[var(--color-purple)]/10 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[var(--color-purple)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-display font-semibold text-[var(--text)] mb-2">Baux conformes</h3>
            <p className="text-[var(--text-secondary)]">
              Générez des baux conformes à la loi ALUR en quelques clics.
            </p>
          </div>

          <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-md border border-[var(--border)]">
            <div className="w-12 h-12 bg-[var(--color-coral)]/10 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[var(--color-coral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-display font-semibold text-[var(--text)] mb-2">Quittances automatiques</h3>
            <p className="text-[var(--text-secondary)]">
              Générez et envoyez des quittances de loyer automatiquement.
            </p>
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-20">
          <h2 className="text-3xl font-display font-bold text-center text-[var(--text)] mb-12">
            Tarification simple et transparente
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-[var(--surface)] p-8 rounded-2xl shadow-md border-2 border-[var(--border)]">
              <h3 className="text-2xl font-display font-bold text-[var(--text)] mb-2">Gratuit</h3>
              <p className="text-4xl font-display font-bold text-[var(--color-electric-blue)] mb-4">0€<span className="text-lg text-[var(--text-secondary)]">/mois</span></p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-emerald-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[var(--text)]">Jusqu'à 2 biens immobiliers</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-emerald-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[var(--text)]">Gestion des locataires</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-emerald-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[var(--text)]">Génération de quittances</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-emerald-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[var(--text)]">Suivi des paiements</span>
                </li>
              </ul>
              <Link
                to="/register"
                className="block w-full bg-[var(--surface-elevated)] text-[var(--text)] py-3 rounded-xl hover:bg-[var(--border)] font-semibold text-center transition-colors"
              >
                Commencer gratuitement
              </Link>
            </div>

            <div className="bg-[var(--surface)] p-8 rounded-2xl shadow-md border-2 border-[var(--color-electric-blue)] relative">
              <div className="absolute top-0 right-0 bg-[var(--color-electric-blue)] text-white px-4 py-1 rounded-bl-xl rounded-tr-2xl text-sm font-semibold">
                Bientôt disponible
              </div>
              <h3 className="text-2xl font-display font-bold text-[var(--text)] mb-2">Premium</h3>
              <p className="text-4xl font-display font-bold text-[var(--color-electric-blue)] mb-4">À définir<span className="text-lg text-[var(--text-secondary)]">/mois</span></p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-emerald-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[var(--text)]">Biens illimités</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-emerald-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[var(--text)]">Portail locataire</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-emerald-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[var(--text)]">Génération automatique de baux</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-emerald-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[var(--text)]">Support prioritaire</span>
                </li>
              </ul>
              <button
                disabled
                className="block w-full bg-[var(--surface-elevated)] text-[var(--text-muted)] py-3 rounded-xl font-semibold text-center cursor-not-allowed"
              >
                Prochainement
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[var(--surface)] border-t border-[var(--border)] mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-[var(--text-secondary)]">
            <p>© 2024 Gestion Locative. Conforme à la loi ALUR et au RGPD.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
