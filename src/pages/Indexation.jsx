import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useEntity } from '../context/EntityContext'
import { useToast } from '../context/ToastContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import Alert from '../components/ui/Alert'
import {
  getLeasesPendingIndexation,
  getAllIndexableLeases,
  getIndexationHistory,
  applyIndexation,
  markLetterGenerated,
  getIRLIndices,
  addIRLIndex,
  deleteIRLIndex
} from '../services/irlService'
import { generateIndexationLetter } from '../utils/generateIndexationLetter'
import { formatDateFR, formatDateShortFR, formatQuarter, getCurrentQuarter, getNextQuarter, getPublicationMonth } from '../utils/irlUtils'

function Indexation() {
  const { user } = useAuth()
  const { selectedEntity, getSelectedEntityData } = useEntity()
  const { success, error: showError, warning } = useToast()
  const [pendingLeases, setPendingLeases] = useState([])
  const [allIndexableLeases, setAllIndexableLeases] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processingLeaseId, setProcessingLeaseId] = useState(null)

  // États pour la gestion des IRL
  const [irlIndices, setIrlIndices] = useState([])
  const [showIRLForm, setShowIRLForm] = useState(false)
  const [newIRL, setNewIRL] = useState({ year: '', quarter: '', value: '' })
  const [missingCurrentIRL, setMissingCurrentIRL] = useState(false)
  const [showAllIndices, setShowAllIndices] = useState(false)

  // Référence pour scroll vers le formulaire
  const irlFormRef = useRef(null)

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, selectedEntity])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Récupérer les baux à indexer dans les 60 prochains jours
      const pending = await getLeasesPendingIndexation(user.id, 60, selectedEntity)
      setPendingLeases(pending)

      // Récupérer tous les baux indexables
      const allLeases = await getAllIndexableLeases(user.id, selectedEntity)
      setAllIndexableLeases(allLeases)

      // Récupérer l'historique
      const hist = await getIndexationHistory(user.id, selectedEntity)
      setHistory(hist)

      // Récupérer les indices IRL
      const irls = await getIRLIndices()
      setIrlIndices(irls)

      // Vérifier si l'IRL du trimestre actuel existe
      const currentQ = getCurrentQuarter()
      const currentIRLExists = irls.some(
        irl => irl.quarter === currentQ.quarter && irl.year === currentQ.year
      )
      setMissingCurrentIRL(!currentIRLExists)

      // Pré-remplir le formulaire avec le prochain trimestre manquant si aucun formulaire n'est ouvert
      if (!showIRLForm && irls.length > 0) {
        const nextMissing = findNextMissingQuarter(irls)
        if (nextMissing) {
          setNewIRL({
            year: nextMissing.year.toString(),
            quarter: nextMissing.quarter.toString(),
            value: ''
          })
        }
      }
    } catch (err) {
      setError(err.message)
      console.error('Error fetching indexation data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Trouver le prochain trimestre manquant
  const findNextMissingQuarter = (irls) => {
    const currentQ = getCurrentQuarter()
    let checkQ = { ...currentQ }

    // Chercher jusqu'à 8 trimestres dans le futur
    for (let i = 0; i < 8; i++) {
      const exists = irls.some(
        irl => irl.quarter === checkQ.quarter && irl.year === checkQ.year
      )
      if (!exists) {
        return checkQ
      }
      checkQ = getNextQuarter(checkQ.quarter, checkQ.year)
    }
    return null
  }

  const handleApplyIndexation = async (lease) => {
    if (!confirm(`Êtes-vous sûr de vouloir appliquer l'indexation pour ${lease.lot.name} ?\n\nNouveau loyer : ${lease.indexationCalculation.newRent} € (au lieu de ${lease.indexationCalculation.oldRent} €)`)) {
      return
    }

    try {
      setProcessingLeaseId(lease.id)
      await applyIndexation(lease.id, lease.indexationCalculation)

      // Rafraîchir les données
      await fetchData()

      success('Indexation appliquée avec succès')
    } catch (err) {
      showError(`Erreur lors de l'application de l'indexation : ${err.message}`)
    } finally {
      setProcessingLeaseId(null)
    }
  }

  const handleGenerateLetter = async (lease) => {
    try {
      setProcessingLeaseId(lease.id)
      await generateIndexationLetter(lease, user)
      await markLetterGenerated(lease.id)

      // Rafraîchir les données
      await fetchData()
      success('Lettre d\'indexation générée avec succès')
    } catch (err) {
      showError(`Erreur lors de la génération de la lettre : ${err.message}`)
    } finally {
      setProcessingLeaseId(null)
    }
  }

  const handleAddIRL = async (e) => {
    e.preventDefault()

    try {
      // Validation
      if (!newIRL.year || !newIRL.quarter || !newIRL.value) {
        warning('Veuillez remplir tous les champs')
        return
      }

      const year = parseInt(newIRL.year)
      const quarter = parseInt(newIRL.quarter)
      const value = parseFloat(newIRL.value)

      if (year < 2000 || year > 2100) {
        warning('Année invalide (doit être entre 2000 et 2100)')
        return
      }

      if (quarter < 1 || quarter > 4) {
        warning('Trimestre invalide (doit être entre 1 et 4)')
        return
      }

      if (value <= 0) {
        warning('La valeur IRL doit être supérieure à 0')
        return
      }

      await addIRLIndex(year, quarter, value)

      // Trouver le prochain trimestre manquant après ajout
      const irls = await getIRLIndices()
      const nextMissing = findNextMissingQuarter(irls)

      if (nextMissing) {
        setNewIRL({
          year: nextMissing.year.toString(),
          quarter: nextMissing.quarter.toString(),
          value: ''
        })
      } else {
        setNewIRL({ year: '', quarter: '', value: '' })
        setShowIRLForm(false)
      }

      await fetchData()

      // Message de succès
      success(`IRL T${quarter} ${year} ajouté avec succès (valeur : ${value.toFixed(2)})`)
    } catch (err) {
      showError(`Erreur lors de l'ajout de l'IRL : ${err.message}`)
    }
  }

  // Scroll vers le formulaire d'ajout d'IRL
  const scrollToIRLForm = () => {
    setShowIRLForm(true)
    setTimeout(() => {
      irlFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const handleDeleteIRL = async (id, quarter, year) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'IRL T${quarter} ${year} ?`)) {
      return
    }

    try {
      await deleteIRLIndex(id)
      await fetchData()
      success(`IRL T${quarter} ${year} supprimé avec succès`)
    } catch (err) {
      showError(`Erreur lors de la suppression de l'IRL : ${err.message}`)
    }
  }

  const selectedEntityData = getSelectedEntityData()
  const pageTitle = selectedEntityData
    ? `Indexation des loyers - ${selectedEntityData.name}`
    : 'Indexation des loyers'

  if (loading) {
    return (
      <DashboardLayout title={pageTitle}>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-[var(--text-secondary)]">Chargement...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={pageTitle}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-display font-bold text-[var(--text)]">Indexation automatique des loyers (IRL)</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Gérez les révisions annuelles de loyers conformément à l'indice de référence des loyers (IRL)
          </p>
        </div>

        {error && (
          <Alert variant="error" title="Erreur">
            {error}
          </Alert>
        )}

        {/* Alerte IRL manquant pour le trimestre actuel */}
        {missingCurrentIRL && (() => {
          const currentQ = getCurrentQuarter()
          return (
            <Alert variant="warning" title={`⚠️ L'IRL du T${currentQ.quarter} ${currentQ.year} n'est pas encore enregistré`}>
              <div className="space-y-3">
                <p className="text-sm">
                  Les nouveaux indices sont publiés par l'INSEE vers le <strong>{getPublicationMonth(currentQ.quarter)}</strong>.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => window.open('https://www.insee.fr/fr/statistiques/serie/001515333', '_blank')}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Consulter l'INSEE
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={scrollToIRLForm}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Ajouter l'IRL
                  </Button>
                </div>
              </div>
            </Alert>
          )
        })()}

        {/* Section 1 : Alertes - Baux à indexer dans les 60 jours */}
        <Card title="Indexations à venir (60 jours)" subtitle={`${pendingLeases.length} bail${pendingLeases.length > 1 ? 'x' : ''} dont la date anniversaire approche`}>
          {pendingLeases.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[var(--text-secondary)]">Aucun bail à indexer pour le moment</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Les baux dont la date anniversaire approche apparaîtront ici
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingLeases.map((lease) => (
                <div key={lease.id} className="border border-[var(--border)] rounded-xl p-4 hover:border-[var(--color-electric-blue)] transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Informations du bail */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-display font-semibold text-[var(--text)]">
                          {lease.lot.properties_new.name} - {lease.lot.name}
                        </h3>
                        {lease.daysUntilAnniversary <= 30 && (
                          <Badge variant="danger">Urgent</Badge>
                        )}
                      </div>
                      <p className="text-sm text-[var(--text-secondary)]">
                        <span className="font-medium">Locataire :</span> {lease.tenant.first_name} {lease.tenant.last_name}
                      </p>
                      <div className="space-y-2 text-sm">
                        {/* Date de début et référence */}
                        <div className="p-3 bg-[var(--surface-hover)] rounded-xl">
                          <p className="text-[var(--text)]">
                            <span className="font-medium">Bail démarré le :</span>{' '}
                            <span className="text-[var(--text)]">{formatDateFR(lease.start_date)}</span>
                            {' '}→ Référence : <span className="font-semibold text-[var(--color-electric-blue)]">
                              {lease.indexationCalculation.oldIRLQuarter} (IRL: {lease.indexationCalculation.oldIRLValue})
                            </span>
                          </p>
                        </div>

                        {/* Date anniversaire */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="p-3 bg-[var(--color-electric-blue)]/10 rounded-xl">
                            <p className="text-xs text-[var(--text-secondary)] mb-1">Date anniversaire</p>
                            <p className="font-semibold text-[var(--color-electric-blue)]">
                              {formatDateFR(lease.anniversaryDate)}
                            </p>
                            <p className="text-xs text-[var(--text-muted)] mt-1">
                              Dans {lease.daysUntilAnniversary} jour{lease.daysUntilAnniversary > 1 ? 's' : ''}
                            </p>
                          </div>

                          <div className="p-3 bg-[var(--color-electric-blue)]/10 rounded-xl">
                            <p className="text-xs text-[var(--text-secondary)] mb-1">Nouvelle référence IRL</p>
                            <p className="font-semibold text-[var(--color-electric-blue)]">
                              {lease.indexationCalculation.newIRLQuarter}
                              {lease.indexationCalculation.newIRLEstimated && (
                                <span className="ml-1 text-orange-600">*</span>
                              )}
                            </p>
                            <p className="text-xs text-[var(--text-muted)] mt-1">
                              Valeur : {lease.indexationCalculation.newIRLValue}
                            </p>
                            {lease.indexationCalculation.newIRLEstimated && (
                              <p className="text-xs text-orange-600 mt-1">
                                * Estimation basée sur {lease.indexationCalculation.newIRLEstimatedFrom}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Calcul du loyer */}
                        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-[var(--text-secondary)]">Loyer actuel</p>
                              <p className="text-lg font-semibold text-[var(--text)]">
                                {lease.indexationCalculation.oldRent.toFixed(2)} €
                              </p>
                            </div>
                            <div className="text-center px-4">
                              <svg className="w-6 h-6 text-[var(--text-muted)] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                              <p className={`text-xs font-semibold mt-1 ${lease.indexationCalculation.increasePercentage > 3 ? 'text-orange-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                +{lease.indexationCalculation.increasePercentage.toFixed(2)}%
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-[var(--text-secondary)]">Nouveau loyer</p>
                              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                {lease.indexationCalculation.newRent.toFixed(2)} €
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:w-48">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleGenerateLetter(lease)}
                        disabled={processingLeaseId === lease.id}
                        className="w-full"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Générer la lettre
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApplyIndexation(lease)}
                        disabled={processingLeaseId === lease.id}
                        className="w-full"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Appliquer l'indexation
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Section 2 : Tous les baux indexables */}
        <Card title="Tous les baux indexables" subtitle={`${allIndexableLeases.length} bail${allIndexableLeases.length > 1 ? 'x' : ''} avec indexation activée`}>
          {allIndexableLeases.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-[var(--text-secondary)]">Aucun bail avec indexation activée</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Activez l'indexation lors de la création d'un bail
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--border)]">
                <thead className="bg-[var(--surface-elevated)]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Bien / Lot
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Locataire
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Début du bail
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Référence IRL
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Loyer actuel
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Anniversaire
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Prochain IRL
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Jours restants
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--surface)] divide-y divide-[var(--border)]">
                  {allIndexableLeases.map((lease) => (
                    <tr key={lease.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[var(--text)]">
                          {lease.lot.properties_new.name}
                        </div>
                        <div className="text-sm text-[var(--text-muted)]">
                          {lease.lot.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--text)]">
                          {lease.tenant.first_name} {lease.tenant.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--text)]">
                          {formatDateShortFR(lease.start_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lease.indexationCalculation ? (
                          <div className="text-sm">
                            <div className="font-medium text-[var(--text)]">
                              {lease.indexationCalculation.oldIRLQuarter}
                            </div>
                            <div className="text-xs text-[var(--text-muted)]">
                              IRL: {lease.indexationCalculation.oldIRLValue}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-[var(--text-muted)]">
                            {formatQuarter(lease.referenceQuarter, lease.referenceYear)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-[var(--text)]">
                          {parseFloat(lease.rent_amount).toFixed(2)} €
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--text)]">
                          {formatDateShortFR(lease.anniversaryDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lease.indexationCalculation ? (
                          <div className="text-sm">
                            <div className={`font-medium ${lease.indexationCalculation.newIRLEstimated ? 'text-orange-600' : 'text-[var(--color-electric-blue)]'}`}>
                              {lease.indexationCalculation.newIRLQuarter}
                              {lease.indexationCalculation.newIRLEstimated && (
                                <span className="ml-1">*</span>
                              )}
                            </div>
                            <div className="text-xs text-[var(--text-muted)]">
                              IRL: {lease.indexationCalculation.newIRLValue}
                            </div>
                            {lease.indexationCalculation.newIRLEstimated && (
                              <div className="text-xs text-orange-600 mt-1">
                                Estimation
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-orange-600">
                            En attente de publication
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          lease.daysUntilAnniversary <= 60
                            ? 'text-orange-600'
                            : lease.daysUntilAnniversary <= 180
                            ? 'text-[var(--color-electric-blue)]'
                            : 'text-[var(--text-secondary)]'
                        }`}>
                          {lease.daysUntilAnniversary} jour{lease.daysUntilAnniversary > 1 ? 's' : ''}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Section 3 : Historique */}
        <Card title="Historique des indexations" subtitle={`${history.length} indexation${history.length > 1 ? 's' : ''} effectuée${history.length > 1 ? 's' : ''}`}>
          {history.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-[var(--text-secondary)]">Aucune indexation effectuée</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                L'historique des révisions de loyers apparaîtra ici
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--border)]">
                <thead className="bg-[var(--surface-elevated)]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Bien / Lot
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Locataire
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Ancien loyer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Nouveau loyer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Augmentation
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      IRL
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Lettre
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--surface)] divide-y divide-[var(--border)]">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--text)]">{formatDateShortFR(item.applied_at)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[var(--text)]">
                          {item.lease.lot.properties_new.name}
                        </div>
                        <div className="text-sm text-[var(--text-muted)]">
                          {item.lease.lot.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--text)]">
                          {item.lease.tenant.first_name} {item.lease.tenant.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--text)]">{parseFloat(item.old_rent).toFixed(2)} €</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{parseFloat(item.new_rent).toFixed(2)} €</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--text)]">
                          +{parseFloat(item.increase_percentage).toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-[var(--text-secondary)]">
                          {item.old_irl_quarter} → {item.new_irl_quarter}
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          {parseFloat(item.old_irl_value).toFixed(2)} → {parseFloat(item.new_irl_value).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.letter_generated ? (
                          <Badge variant="success">Générée</Badge>
                        ) : (
                          <Badge variant="default">Non générée</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Section 4 : Gérer les indices IRL */}
        <div ref={irlFormRef}>
          <Card
            title="Gérer les indices IRL"
            subtitle={
              irlIndices.length > 0
                ? showAllIndices
                  ? `${irlIndices.length} indice${irlIndices.length > 1 ? 's' : ''}`
                  : `${Math.min(10, irlIndices.length)} sur ${irlIndices.length} indice${irlIndices.length > 1 ? 's' : ''}`
                : "Liste des indices de référence des loyers disponibles"
            }
          >
            <div className="space-y-4">
              {/* Calendrier de publication INSEE */}
              <div className="p-4 bg-[var(--color-electric-blue)]/10 rounded-xl border border-[var(--color-electric-blue)]/20">
                <h4 className="text-sm font-display font-semibold text-[var(--text)] mb-2">📅 Calendrier de publication INSEE</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-[var(--text)]">
                  <div><strong>T1 :</strong> mi-avril</div>
                  <div><strong>T2 :</strong> mi-juillet</div>
                  <div><strong>T3 :</strong> mi-octobre</div>
                  <div><strong>T4 :</strong> mi-janvier (année suivante)</div>
                </div>
              </div>

              {/* Bouton pour afficher le formulaire */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-[var(--text-secondary)]">
                  <a
                    href="https://www.insee.fr/fr/statistiques/serie/001515333"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-electric-blue)] hover:text-[var(--color-electric-blue-dark)] underline transition-colors"
                  >
                    Consulter les valeurs officielles sur le site de l'INSEE →
                  </a>
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowIRLForm(!showIRLForm)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Ajouter un IRL
                </Button>
              </div>

            {/* Formulaire d'ajout d'IRL */}
            {showIRLForm && (
              <div className="bg-[var(--color-electric-blue)]/10 p-4 rounded-xl border border-[var(--color-electric-blue)]/20">
                <h3 className="text-sm font-display font-semibold text-[var(--text)] mb-3">Ajouter un nouvel indice IRL</h3>
                <form onSubmit={handleAddIRL} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text)] mb-1">
                      Année *
                    </label>
                    <input
                      type="number"
                      min="2000"
                      max="2100"
                      value={newIRL.year}
                      onChange={(e) => setNewIRL({ ...newIRL, year: e.target.value })}
                      className="w-full px-3 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-all"
                      placeholder="2025"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text)] mb-1">
                      Trimestre *
                    </label>
                    <select
                      value={newIRL.quarter}
                      onChange={(e) => setNewIRL({ ...newIRL, quarter: e.target.value })}
                      className="w-full px-3 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-all"
                      required
                    >
                      <option value="">Sélectionner</option>
                      <option value="1">T1 (Janvier - Mars)</option>
                      <option value="2">T2 (Avril - Juin)</option>
                      <option value="3">T3 (Juillet - Septembre)</option>
                      <option value="4">T4 (Octobre - Décembre)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text)] mb-1">
                      Valeur IRL *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newIRL.value}
                      onChange={(e) => setNewIRL({ ...newIRL, value: e.target.value })}
                      className="w-full px-3 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-all"
                      placeholder="148.50"
                      required
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button type="submit" variant="success" size="sm" className="flex-1">
                      Ajouter
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setShowIRLForm(false)
                        setNewIRL({ year: '', quarter: '', value: '' })
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Tableau des IRL */}
            {irlIndices.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-[var(--text-secondary)]">Aucun indice IRL enregistré</p>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  Commencez par ajouter des indices IRL pour calculer les indexations
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[var(--border)]">
                    <thead className="bg-[var(--surface-elevated)]">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                          Période
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                          Valeur IRL
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                          Variation
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-display font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-[var(--surface)] divide-y divide-[var(--border)]">
                      {(showAllIndices ? irlIndices : irlIndices.slice(0, 10)).map((irl, index) => {
                        const prevIRL = irlIndices[index + 1]
                        const variation = prevIRL
                          ? ((parseFloat(irl.value) - parseFloat(prevIRL.value)) / parseFloat(prevIRL.value) * 100).toFixed(2)
                          : null

                        return (
                          <tr key={irl.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-[var(--text)]">
                                T{irl.quarter} {irl.year}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-[var(--color-electric-blue)]">
                                {parseFloat(irl.value).toFixed(2)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {variation !== null ? (
                                <div className={`text-sm font-medium ${
                                  parseFloat(variation) > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                                }`}>
                                  {parseFloat(variation) > 0 ? '+' : ''}{variation}%
                                </div>
                              ) : (
                                <div className="text-sm text-[var(--text-muted)]">-</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteIRL(irl.id, irl.quarter, irl.year)}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Bouton "Afficher plus/moins" */}
                {irlIndices.length > 10 && (
                  <div className="flex justify-center mt-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowAllIndices(!showAllIndices)}
                    >
                      {showAllIndices ? (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                          Afficher moins
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          Afficher plus
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
        </div>

        {/* Section information légale */}
        <Alert variant="info" title="À propos de l'indexation des loyers">
          <div className="text-sm space-y-2">
            <p>
              L'indexation annuelle des loyers est régie par l'article 17-1 de la loi du 6 juillet 1989.
              Elle permet d'ajuster le loyer en fonction de l'évolution de l'indice de référence des loyers (IRL) publié par l'INSEE.
            </p>
            <p className="font-medium mt-3">Formule de calcul :</p>
            <p className="font-mono text-xs bg-blue-50 p-2 rounded">
              Nouveau loyer = Loyer actuel × (Nouvel IRL / Ancien IRL)
            </p>
            <p className="mt-3">
              <span className="font-medium">Important :</span> L'indexation ne peut être appliquée qu'une fois par an,
              à la date anniversaire du contrat ou à la date convenue dans le bail.
            </p>
          </div>
        </Alert>
      </div>
    </DashboardLayout>
  )
}

export default Indexation
