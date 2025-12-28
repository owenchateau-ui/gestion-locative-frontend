import { Component } from 'react'
import Button from './ui/Button'
import Card from './ui/Card'

/**
 * ErrorBoundary - Composant pour capturer les erreurs React
 *
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error) {
    // Mise à jour de l'état pour afficher l'UI de secours
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log l'erreur dans la console en développement
    if (import.meta.env.MODE === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Mettre à jour l'état avec les détails de l'erreur
    this.setState({
      error: error,
      errorInfo: errorInfo
    })

    // TODO: Envoyer l'erreur à un service de monitoring (Sentry, etc.)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      // UI de secours en cas d'erreur
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <Card className="max-w-2xl w-full">
            <div className="text-center space-y-6">
              {/* Icône d'erreur */}
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>

              {/* Message d'erreur */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Oups, une erreur est survenue
                </h1>
                <p className="text-gray-600">
                  Une erreur inattendue s'est produite. Nos équipes ont été notifiées.
                </p>
              </div>

              {/* Détails de l'erreur en mode développement */}
              {import.meta.env.MODE === 'development' && this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                  <h3 className="text-sm font-semibold text-red-800 mb-2">
                    Détails de l'erreur (visible en développement uniquement)
                  </h3>
                  <pre className="text-xs text-red-700 overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-center">
                <Button
                  variant="primary"
                  onClick={this.handleReset}
                >
                  Réessayer
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  Retour au tableau de bord
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )
    }

    // Rendu normal si pas d'erreur
    return this.props.children
  }
}

export default ErrorBoundary
