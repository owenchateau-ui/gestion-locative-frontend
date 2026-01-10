import { useNavigate } from 'react-router-dom'
import { Construction, ArrowLeft } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

function ComingSoon() {
  const navigate = useNavigate()

  return (
    <DashboardLayout title="Fonctionnalité à venir">
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full text-center">
          <div className="flex flex-col items-center gap-6 p-8">
            {/* Icône */}
            <div className="w-20 h-20 bg-[var(--color-electric-blue)]/10 rounded-full flex items-center justify-center">
              <Construction className="w-10 h-10 text-[var(--color-electric-blue)]" />
            </div>

            {/* Titre */}
            <div>
              <h2 className="text-2xl font-display font-bold text-[var(--text)] mb-2">
                Fonctionnalité à venir
              </h2>
              <p className="text-[var(--text-secondary)]">
                Cette fonctionnalité sera bientôt disponible.
              </p>
            </div>

            {/* Message */}
            <div className="bg-[var(--color-electric-blue)]/10 dark:bg-[var(--color-electric-blue)]/20 border border-[var(--color-electric-blue)]/30 rounded-xl p-4 w-full">
              <p className="text-sm text-[var(--color-electric-blue)]">
                🚀 Nous travaillons activement sur cette fonctionnalité pour vous offrir la meilleure expérience possible.
              </p>
            </div>

            {/* Liste des prochaines fonctionnalités */}
            <div className="w-full text-left bg-[var(--surface-elevated)] rounded-xl p-4">
              <h3 className="font-display font-semibold text-[var(--text)] mb-3 text-sm">
                Prochainement disponible :
              </h3>
              <ul className="space-y-2 text-sm text-[var(--text)]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[var(--color-electric-blue)] rounded-full"></span>
                  Documents et modèles légaux
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[var(--color-electric-blue)] rounded-full"></span>
                  États des lieux numériques
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[var(--color-electric-blue)] rounded-full"></span>
                  Gestion des interventions
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[var(--color-electric-blue)] rounded-full"></span>
                  Portail locataire
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[var(--color-electric-blue)] rounded-full"></span>
                  Communication automatisée
                </li>
              </ul>
            </div>

            {/* Boutons */}
            <div className="flex gap-3 w-full">
              <Button
                variant="primary"
                onClick={() => navigate('/dashboard')}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au tableau de bord
              </Button>
            </div>

            {/* Suggestion */}
            <p className="text-xs text-[var(--text-muted)]">
              Une question ou une suggestion ?{' '}
              <button
                onClick={() => navigate('/profile')}
                className="text-[var(--color-electric-blue)] hover:underline transition-colors"
              >
                Contactez-nous
              </button>
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default ComingSoon
