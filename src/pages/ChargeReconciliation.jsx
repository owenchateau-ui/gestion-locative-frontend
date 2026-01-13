import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useEntity } from '../context/EntityContext'
import { useToast } from '../context/ToastContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Alert from '../components/ui/Alert'
import Skeleton from '../components/ui/Skeleton'
import {
  CHARGE_CATEGORIES,
  calculateReconciliation,
  generateChargeReconciliationPDF,
  calculateYearlyProvisions
} from '../services/chargeReconciliationService'
import { Calculator, FileText, Download, ChevronRight } from 'lucide-react'

function ChargeReconciliation() {
  const [leases, setLeases] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLease, setSelectedLease] = useState(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() - 1)
  const [charges, setCharges] = useState({})
  const [reconciliationResult, setReconciliationResult] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [payments, setPayments] = useState([])

  const { user } = useAuth()
  const { selectedEntity } = useEntity()
  const { success, error: showError } = useToast()

  // Années disponibles (5 dernières années)
  const currentYear = new Date().getFullYear()
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - 1 - i)

  useEffect(() => {
    fetchLeases()
  }, [user, selectedEntity])

  useEffect(() => {
    if (selectedLease && selectedYear) {
      fetchPayments()
      // Reset charges when lease changes
      const initialCharges = {}
      CHARGE_CATEGORIES.forEach(cat => {
        initialCharges[cat.id] = 0
      })
      setCharges(initialCharges)
      setReconciliationResult(null)
    }
  }, [selectedLease, selectedYear])

  const fetchLeases = async () => {
    if (!user) return

    try {
      setLoading(true)

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('supabase_uid', user.id)
        .single()

      if (userError) throw userError

      // Récupérer tous les baux de l'utilisateur
      let query = supabase
        .from('leases')
        .select(`
          *,
          lot:lots!inner(
            id,
            name,
            properties_new!inner(
              id,
              name,
              address,
              postal_code,
              city,
              entity_id,
              entities!inner(id, name, color, user_id, address, postal_code, city, phone, email)
            )
          ),
          tenant:tenants!inner(
            id,
            first_name,
            last_name,
            group_id,
            tenant_groups!group_id(id, name)
          )
        `)
        .eq('lot.properties_new.entities.user_id', userData.id)
        .order('created_at', { ascending: false })

      if (selectedEntity) {
        query = query.eq('lot.properties_new.entity_id', selectedEntity)
      }

      const { data, error } = await query

      if (error) throw error

      // Filtrer côté client pour les baux actifs (plus fiable)
      const activeLeases = (data || []).filter(lease => lease.status === 'active')

      console.log('Tous les baux:', data)
      console.log('Baux actifs:', activeLeases)

      setLeases(activeLeases)
    } catch (err) {
      console.error('Erreur chargement baux:', err)
      showError(`Erreur lors du chargement des baux : ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchPayments = async () => {
    if (!selectedLease) return

    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('lease_id', selectedLease.id)
        .eq('status', 'paid')

      if (error) throw error

      setPayments(data || [])
    } catch (err) {
      console.error('Erreur chargement paiements:', err)
    }
  }

  const handleChargeChange = (categoryId, value) => {
    setCharges(prev => ({
      ...prev,
      [categoryId]: parseFloat(value) || 0
    }))
    setReconciliationResult(null)
  }

  const handleCalculate = () => {
    if (!selectedLease) {
      showError('Veuillez sélectionner un bail')
      return
    }

    // Calculer les provisions de l'année
    const monthlyCharges = parseFloat(selectedLease.charges_amount) || 0
    const totalProvisions = calculateYearlyProvisions(payments, monthlyCharges, selectedYear)

    // Préparer les charges réelles
    const actualCharges = CHARGE_CATEGORIES.map(cat => ({
      category: cat.id,
      amount: charges[cat.id] || 0,
      description: cat.name
    })).filter(c => c.amount > 0)

    // Calculer la régularisation
    const result = calculateReconciliation(totalProvisions, actualCharges)
    setReconciliationResult(result)
  }

  const handleGeneratePDF = async () => {
    if (!selectedLease || !reconciliationResult) {
      showError('Veuillez d\'abord calculer la régularisation')
      return
    }

    try {
      setGenerating(true)

      // Récupérer les informations complètes
      const { data: landlord, error: landlordError } = await supabase
        .from('users')
        .select('*')
        .eq('supabase_uid', user.id)
        .single()

      if (landlordError) throw landlordError

      const lot = selectedLease.lot
      const property = lot.properties_new
      const entity = property.entities
      const tenant = selectedLease.tenant

      await generateChargeReconciliationPDF(
        selectedLease,
        tenant,
        lot,
        property,
        entity,
        landlord,
        selectedYear,
        reconciliationResult
      )

      success('Lettre de régularisation générée avec succès')
    } catch (err) {
      showError(`Erreur lors de la génération : ${err.message}`)
    } finally {
      setGenerating(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0)
  }

  const getTenantName = (lease) => {
    if (lease.tenant.tenant_groups?.name) {
      return lease.tenant.tenant_groups.name
    }
    return `${lease.tenant.first_name} ${lease.tenant.last_name}`
  }

  if (loading) {
    return (
      <DashboardLayout title="Régularisation des charges">
        <div className="space-y-6">
          <Skeleton type="card" count={2} />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Régularisation des charges">
      <div className="space-y-6">
        {/* En-tête */}
        <div>
          <h2 className="text-2xl font-display font-bold text-[var(--text)]">Régularisation des charges</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Calcul annuel des charges locatives conformément à l'article 23 de la loi du 6 juillet 1989
          </p>
        </div>

        {/* Sélection bail et année */}
        <Card title="Sélection du bail et de l'année">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sélection du bail */}
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Bail concerné
              </label>
              {leases.length === 0 ? (
                <Alert variant="warning">
                  Aucun bail actif disponible. Créez un bail pour pouvoir effectuer une régularisation.
                </Alert>
              ) : (
                <select
                  value={selectedLease?.id || ''}
                  onChange={(e) => {
                    const lease = leases.find(l => l.id === e.target.value)
                    setSelectedLease(lease)
                  }}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                >
                  <option value="">Sélectionner un bail</option>
                  {leases.map(lease => (
                    <option key={lease.id} value={lease.id}>
                      {getTenantName(lease)} - {lease.lot.properties_new.name} ({lease.lot.name})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Sélection de l'année */}
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Année de régularisation
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Informations du bail sélectionné */}
          {selectedLease && (
            <div className="mt-6 p-4 bg-[var(--surface-elevated)] rounded-xl">
              <h4 className="font-display font-medium text-[var(--text)] mb-2">Informations du bail</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-[var(--text-muted)]">Locataire</span>
                  <p className="font-medium text-[var(--text)]">{getTenantName(selectedLease)}</p>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Bien</span>
                  <p className="font-medium text-[var(--text)]">{selectedLease.lot.properties_new.name}</p>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Charges mensuelles</span>
                  <p className="font-medium text-[var(--text)]">{formatCurrency(selectedLease.charges_amount)}</p>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Provisions {selectedYear}</span>
                  <p className="font-medium text-[var(--text)]">
                    {formatCurrency(calculateYearlyProvisions(payments, parseFloat(selectedLease.charges_amount) || 0, selectedYear))}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Saisie des charges réelles */}
        {selectedLease && (
          <Card title={`Charges réelles ${selectedYear}`}>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Saisissez les montants des charges réelles pour l'année {selectedYear}.
              Ne remplissez que les catégories applicables à votre bien.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CHARGE_CATEGORIES.map(category => (
                <div key={category.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-[var(--text)]">
                      {category.name}
                    </label>
                    <p className="text-xs text-[var(--text-muted)]">{category.description}</p>
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={charges[category.id] || ''}
                      onChange={(e) => handleChargeChange(category.id, e.target.value)}
                      placeholder="0,00"
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors text-right"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleCalculate} size="lg">
                <Calculator className="w-5 h-5 mr-2" />
                Calculer la régularisation
              </Button>
            </div>
          </Card>
        )}

        {/* Résultat du calcul */}
        {reconciliationResult && (
          <Card title="Résultat de la régularisation">
            <div className="space-y-6">
              {/* Récapitulatif */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[var(--color-electric-blue)]/10 dark:bg-[var(--color-electric-blue)]/20 p-4 rounded-xl">
                  <p className="text-sm text-[var(--color-electric-blue)] font-medium">Provisions versées</p>
                  <p className="text-2xl font-display font-bold text-[var(--color-electric-blue)]">
                    {formatCurrency(reconciliationResult.totalProvisions)}
                  </p>
                </div>
                <div className="bg-[var(--surface-elevated)] p-4 rounded-xl">
                  <p className="text-sm text-[var(--text-secondary)] font-medium">Charges réelles</p>
                  <p className="text-2xl font-display font-bold text-[var(--text)]">
                    {formatCurrency(reconciliationResult.totalActualCharges)}
                  </p>
                </div>
                <div className={`p-4 rounded-xl ${
                  reconciliationResult.isRefund
                    ? 'bg-emerald-100 dark:bg-emerald-900/30'
                    : reconciliationResult.isAdditionalPayment
                      ? 'bg-red-100 dark:bg-red-900/30'
                      : 'bg-[var(--surface-elevated)]'
                }`}>
                  <p className={`text-sm font-medium ${
                    reconciliationResult.isRefund
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : reconciliationResult.isAdditionalPayment
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-[var(--text-secondary)]'
                  }`}>
                    {reconciliationResult.isRefund
                      ? 'À rembourser au locataire'
                      : reconciliationResult.isAdditionalPayment
                        ? 'Complément à demander'
                        : 'Solde'}
                  </p>
                  <p className={`text-2xl font-display font-bold ${
                    reconciliationResult.isRefund
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : reconciliationResult.isAdditionalPayment
                        ? 'text-red-700 dark:text-red-300'
                        : 'text-[var(--text)]'
                  }`}>
                    {formatCurrency(reconciliationResult.absoluteBalance)}
                  </p>
                </div>
              </div>

              {/* Détail des charges */}
              {reconciliationResult.charges.length > 0 && (
                <div>
                  <h4 className="font-display font-medium text-[var(--text)] mb-3">Détail des charges</h4>
                  <div className="border border-[var(--border)] rounded-xl overflow-hidden">
                    <table className="min-w-full divide-y divide-[var(--border)]">
                      <thead className="bg-[var(--surface-elevated)]">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">
                            Catégorie
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">
                            Montant
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-[var(--surface)] divide-y divide-[var(--border)]">
                        {reconciliationResult.charges.map((charge, index) => {
                          const categoryInfo = CHARGE_CATEGORIES.find(c => c.id === charge.category)
                          return (
                            <tr key={index}>
                              <td className="px-4 py-3 text-sm text-[var(--text)]">
                                {categoryInfo?.name || charge.category}
                              </td>
                              <td className="px-4 py-3 text-sm text-[var(--text)] text-right">
                                {formatCurrency(charge.amount)}
                              </td>
                            </tr>
                          )
                        })}
                        <tr className="bg-[var(--surface-elevated)] font-medium">
                          <td className="px-4 py-3 text-sm text-[var(--text)]">Total</td>
                          <td className="px-4 py-3 text-sm text-[var(--text)] text-right">
                            {formatCurrency(reconciliationResult.totalActualCharges)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Message explicatif */}
              {reconciliationResult.isRefund && (
                <Alert variant="success">
                  Le locataire a versé plus de provisions que les charges réelles.
                  Le trop-perçu de {formatCurrency(reconciliationResult.absoluteBalance)} doit lui être remboursé
                  (par déduction sur le prochain loyer ou par virement).
                </Alert>
              )}
              {reconciliationResult.isAdditionalPayment && (
                <Alert variant="warning">
                  Les charges réelles excèdent les provisions versées.
                  Un complément de {formatCurrency(reconciliationResult.absoluteBalance)} est à demander au locataire.
                </Alert>
              )}
              {!reconciliationResult.isRefund && !reconciliationResult.isAdditionalPayment && (
                <Alert variant="info">
                  Les provisions versées correspondent aux charges réelles. Aucun ajustement n'est nécessaire.
                </Alert>
              )}

              {/* Bouton génération PDF */}
              <div className="flex justify-end">
                <Button
                  onClick={handleGeneratePDF}
                  variant="success"
                  size="lg"
                  disabled={generating}
                >
                  {generating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Génération...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Générer la lettre de régularisation
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Information légale */}
        <Alert variant="info" title="Information légale">
          <p className="text-sm">
            Conformément à l'article 23 de la loi du 6 juillet 1989, la régularisation des charges doit être effectuée
            au moins une fois par an. Les justificatifs doivent être tenus à disposition du locataire pendant 6 mois
            après l'envoi du décompte.
          </p>
        </Alert>
      </div>
    </DashboardLayout>
  )
}

export default ChargeReconciliation
