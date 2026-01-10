import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Alert from '../components/ui/Alert'
import { getReferenceQuarterAndYear, formatQuarter } from '../utils/irlUtils'
import { getIRLIndex } from '../services/irlService'

function LeaseForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEditMode = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lots, setLots] = useState([])
  const [tenants, setTenants] = useState([])
  const [formData, setFormData] = useState({
    lot_id: '',
    tenant_id: '',
    start_date: '',
    end_date: '',
    rent_amount: '',
    charges_amount: '',
    deposit_amount: '',
    payment_day: '1',
    lease_type: 'empty',
    status: 'draft',
    special_clauses: '',
    caf_direct_payment: false,
    caf_amount: '',
    caf_payment_day: '5',
    indexation_enabled: true
  })

  // États pour la gestion de l'IRL
  const [irlReferenceQuarter, setIrlReferenceQuarter] = useState('')
  const [irlReferenceYear, setIrlReferenceYear] = useState('')
  const [currentIRL, setCurrentIRL] = useState(null)
  const [irlLoading, setIrlLoading] = useState(false)

  // États pour la validation du taux d'effort
  const [effortRate, setEffortRate] = useState(null)
  const [effortWarning, setEffortWarning] = useState(null)
  const [totalIncome, setTotalIncome] = useState(0)

  useEffect(() => {
    fetchLotsAndTenants()
    if (isEditMode) {
      fetchLease()
    }
  }, [id, user])

  // Pré-remplir le trimestre et l'année quand la date de début change (en création uniquement)
  useEffect(() => {
    if (formData.start_date && !isEditMode) {
      const { quarter, year } = getReferenceQuarterAndYear(formData.start_date)
      setIrlReferenceQuarter(quarter.toString())
      setIrlReferenceYear(year.toString())
    }
  }, [formData.start_date, isEditMode])

  // Récupérer l'IRL quand le trimestre ou l'année change
  useEffect(() => {
    const fetchIRL = async () => {
      if (irlReferenceQuarter && irlReferenceYear) {
        setIrlLoading(true)
        try {
          const irl = await getIRLIndex(parseInt(irlReferenceYear), parseInt(irlReferenceQuarter))
          setCurrentIRL(irl)
        } catch (error) {
          console.error('Error fetching IRL:', error)
          setCurrentIRL(null)
        } finally {
          setIrlLoading(false)
        }
      }
    }

    fetchIRL()
  }, [irlReferenceQuarter, irlReferenceYear])

  // Pré-remplir les informations CAF quand un locataire est sélectionné
  useEffect(() => {
    const fetchTenantGroupAssistance = async () => {
      if (formData.tenant_id && !isEditMode) {
        try {
          const { data, error } = await supabase
            .from('tenants')
            .select(`
              tenant_groups!group_id(
                housing_assistance,
                tenants!group_id(monthly_income, other_income)
              )
            `)
            .eq('id', formData.tenant_id)
            .single()

          if (error) throw error

          const group = data?.tenant_groups
          if (group && group.housing_assistance > 0) {
            setFormData(prev => ({
              ...prev,
              caf_direct_payment: true,
              caf_amount: group.housing_assistance.toString()
            }))
          }

          // Calculer le revenu total du groupe
          const income = group?.tenants?.reduce((sum, t) =>
            sum + (parseFloat(t.monthly_income) || 0) + (parseFloat(t.other_income) || 0),
            0
          ) || 0
          setTotalIncome(income)
        } catch (error) {
          console.error('Error fetching tenant group assistance:', error)
        }
      }
    }

    fetchTenantGroupAssistance()
  }, [formData.tenant_id, isEditMode])

  // Calculer le taux d'effort en temps réel
  useEffect(() => {
    if (formData.tenant_id && (formData.rent_amount || formData.charges_amount) && totalIncome > 0) {
      const rentAmount = parseFloat(formData.rent_amount) || 0
      const chargesAmount = parseFloat(formData.charges_amount) || 0
      const totalRent = rentAmount + chargesAmount

      const cafAmount = formData.caf_direct_payment ? (parseFloat(formData.caf_amount) || 0) : 0
      const netRent = totalRent - cafAmount

      const rate = totalIncome > 0 ? (netRent / totalIncome) * 100 : 0
      setEffortRate(rate)

      if (rate > 50) {
        setEffortWarning('danger')
      } else if (rate > 40) {
        setEffortWarning('warning')
      } else if (rate > 33) {
        setEffortWarning('info')
      } else {
        setEffortWarning(null)
      }
    } else {
      setEffortRate(null)
      setEffortWarning(null)
    }
  }, [formData.tenant_id, formData.rent_amount, formData.charges_amount, formData.caf_direct_payment, formData.caf_amount, totalIncome])

  const fetchLotsAndTenants = async () => {
    if (!user) return

    try {
      // Récupérer l'ID de l'utilisateur
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('supabase_uid', user.id)
        .single()

      if (userError) throw userError

      // Récupérer les lots disponibles du bailleur
      const { data: lotsData, error: lotsError } = await supabase
        .from('lots')
        .select(`
          *,
          properties_new!inner(id, name, entities!inner(user_id))
        `)
        .eq('properties_new.entities.user_id', userData.id)
        .order('name')

      if (lotsError) throw lotsError
      setLots(lotsData || [])

      // Récupérer les groupes de locataires de l'utilisateur via ses entités
      const { data: entitiesData, error: entitiesError } = await supabase
        .from('entities')
        .select('id')
        .eq('user_id', userData.id)

      if (entitiesError) throw entitiesError

      const entityIds = entitiesData.map(e => e.id)

      // Récupérer tous les locataires principaux des groupes liés aux entités de l'utilisateur
      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenants')
        .select(`
          *,
          tenant_groups!inner(id, name, entity_id)
        `)
        .in('tenant_groups.entity_id', entityIds)
        .eq('is_main_tenant', true)
        .order('last_name')

      if (tenantsError) throw tenantsError
      setTenants(tenantsData || [])
    } catch (error) {
      setError(error.message)
    }
  }

  const fetchLease = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('leases')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      setFormData({
        lot_id: data.lot_id || '',
        tenant_id: data.tenant_id || '',
        start_date: data.start_date || '',
        end_date: data.end_date || '',
        rent_amount: data.rent_amount || '',
        charges_amount: data.charges_amount || '',
        deposit_amount: data.deposit_amount || '',
        payment_day: data.payment_day || '1',
        lease_type: data.lease_type || 'empty',
        status: data.status || 'draft',
        special_clauses: data.special_clauses || '',
        caf_direct_payment: data.caf_direct_payment || false,
        caf_amount: data.caf_amount || '',
        caf_payment_day: data.caf_payment_day || '5',
        indexation_enabled: data.indexation_enabled !== false
      })

      // Charger les valeurs IRL existantes
      if (data.irl_reference_quarter) {
        setIrlReferenceQuarter(data.irl_reference_quarter.toString())
      }
      if (data.irl_reference_year) {
        setIrlReferenceYear(data.irl_reference_year.toString())
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Utiliser les valeurs IRL sélectionnées par l'utilisateur
      const quarter = irlReferenceQuarter ? parseInt(irlReferenceQuarter) : null
      const year = irlReferenceYear ? parseInt(irlReferenceYear) : null

      // Préparer les données pour l'insertion/mise à jour
      const leaseData = {
        lot_id: formData.lot_id,
        tenant_id: formData.tenant_id,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        rent_amount: parseFloat(formData.rent_amount),
        charges_amount: formData.charges_amount ? parseFloat(formData.charges_amount) : 0,
        deposit_amount: formData.deposit_amount ? parseFloat(formData.deposit_amount) : null,
        payment_day: parseInt(formData.payment_day),
        lease_type: formData.lease_type,
        status: formData.status,
        special_clauses: formData.special_clauses || null,
        caf_direct_payment: formData.caf_direct_payment,
        caf_amount: formData.caf_amount ? parseFloat(formData.caf_amount) : 0,
        caf_payment_day: formData.caf_direct_payment ? parseInt(formData.caf_payment_day) : 5,
        indexation_enabled: formData.indexation_enabled,
        irl_reference_quarter: quarter,
        irl_reference_year: year,
        initial_rent: !isEditMode ? parseFloat(formData.rent_amount) : undefined
      }

      if (isEditMode) {
        // Mise à jour
        const { error } = await supabase
          .from('leases')
          .update(leaseData)
          .eq('id', id)

        if (error) throw error
      } else {
        // Création
        const { error } = await supabase
          .from('leases')
          .insert([leaseData])

        if (error) throw error
      }

      // Si le bail est créé avec statut "actif", mettre à jour le lot en "occupied"
      if (formData.status === 'active') {
        const { error: lotError } = await supabase
          .from('lots')
          .update({ status: 'occupied' })
          .eq('id', formData.lot_id)

        if (lotError) console.error('Error updating lot status:', lotError)
      }

      // Rediriger vers la liste des baux
      navigate('/leases')
    } catch (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title={isEditMode ? 'Modifier le bail' : 'Créer un bail'}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-display font-bold text-[var(--text)]">
            {isEditMode ? 'Modifier le bail' : 'Créer un bail'}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Renseignez les informations du bail
          </p>
        </div>

        <Card>
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sélection du lot */}
            <div>
              <label htmlFor="lease-lot_id" className="block text-sm font-medium text-[var(--text)] mb-2">
                Lot à louer *
              </label>
              <select
                id="lease-lot_id"
                name="lot_id"
                value={formData.lot_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                required
              >
                <option value="">Sélectionnez un lot</option>
                {lots.map((lot) => (
                  <option key={lot.id} value={lot.id}>
                    {lot.properties_new.name} - {lot.name}
                    {lot.status === 'occupied' ? ' (Occupé)' : ''}
                    {lot.status === 'unavailable' ? ' (Indisponible)' : ''}
                  </option>
                ))}
              </select>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Format : Propriété - Lot
              </p>
            </div>

            {/* Sélection du locataire */}
            <div>
              <label htmlFor="lease-tenant_id" className="block text-sm font-medium text-[var(--text)] mb-2">
                Locataire *
              </label>
              <select
                id="lease-tenant_id"
                name="tenant_id"
                value={formData.tenant_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                required
              >
                <option value="">Sélectionnez un locataire</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.tenant_groups?.name || `${tenant.first_name} ${tenant.last_name}`} - {tenant.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="lease-start_date" className="block text-sm font-medium text-[var(--text)] mb-2">
                  Date de début *
                </label>
                <input
                  id="lease-start_date"
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                  required
                />
              </div>
              <div>
                <label htmlFor="lease-end_date" className="block text-sm font-medium text-[var(--text)] mb-2">
                  Date de fin (optionnel)
                </label>
                <input
                  id="lease-end_date"
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">Laissez vide pour reconduction tacite</p>
              </div>
            </div>

            {/* Loyer, charges et dépôt */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="lease-rent_amount" className="block text-sm font-medium text-[var(--text)] mb-2">
                  Loyer (€) *
                </label>
                <input
                  id="lease-rent_amount"
                  type="number"
                  name="rent_amount"
                  value={formData.rent_amount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                  placeholder="950.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div>
                <label htmlFor="lease-charges_amount" className="block text-sm font-medium text-[var(--text)] mb-2">
                  Charges (€)
                </label>
                <input
                  id="lease-charges_amount"
                  type="number"
                  name="charges_amount"
                  value={formData.charges_amount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                  placeholder="80.00"
                  step="0.01"
                  min="0"
                />
              </div>
              <div>
                <label htmlFor="lease-deposit_amount" className="block text-sm font-medium text-[var(--text)] mb-2">
                  Dépôt de garantie (€)
                </label>
                <input
                  id="lease-deposit_amount"
                  type="number"
                  name="deposit_amount"
                  value={formData.deposit_amount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                  placeholder="950.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            {/* Jour de paiement, type et statut */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="lease-payment_day" className="block text-sm font-medium text-[var(--text)] mb-2">
                  Jour de paiement *
                </label>
                <input
                  id="lease-payment_day"
                  type="number"
                  name="payment_day"
                  value={formData.payment_day}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                  min="1"
                  max="28"
                  required
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">Entre 1 et 28</p>
              </div>
              <div>
                <label htmlFor="lease-lease_type" className="block text-sm font-medium text-[var(--text)] mb-2">
                  Type de bail *
                </label>
                <select
                  id="lease-lease_type"
                  name="lease_type"
                  value={formData.lease_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                  required
                >
                  <option value="empty">Vide</option>
                  <option value="furnished">Meublé</option>
                </select>
              </div>
              <div>
                <label htmlFor="lease-status" className="block text-sm font-medium text-[var(--text)] mb-2">
                  Statut *
                </label>
                <select
                  id="lease-status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                  required
                >
                  <option value="draft">Brouillon</option>
                  <option value="active">Actif</option>
                  <option value="terminated">Résilié</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>
            </div>

            {/* Section APL/CAF */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-lg font-display font-semibold text-[var(--text)] mb-4">APL / CAF</h3>

              {/* Versement direct CAF */}
              <div className="mb-4">
                <label htmlFor="lease-caf_direct_payment" className="flex items-center space-x-3 cursor-pointer">
                  <input
                    id="lease-caf_direct_payment"
                    type="checkbox"
                    name="caf_direct_payment"
                    checked={formData.caf_direct_payment}
                    onChange={handleChange}
                    className="w-4 h-4 text-[var(--color-electric-blue)] border-[var(--border)] rounded focus:ring-2 focus:ring-[var(--color-electric-blue)]"
                  />
                  <span className="text-sm font-medium text-[var(--text)]">
                    Les APL sont versées directement au bailleur
                  </span>
                </label>
                <p className="text-xs text-[var(--text-muted)] mt-1 ml-7">
                  Cochez cette case si vous recevez les APL directement de la CAF
                </p>
              </div>

              {/* Montant et jour de versement CAF (conditionnels) */}
              {formData.caf_direct_payment && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-7">
                  <div>
                    <label htmlFor="lease-caf_amount" className="block text-sm font-medium text-[var(--text)] mb-2">
                      Montant mensuel APL (€)
                    </label>
                    <input
                      id="lease-caf_amount"
                      type="number"
                      name="caf_amount"
                      value={formData.caf_amount}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                      placeholder="200.00"
                      step="0.01"
                      min="0"
                    />
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Montant versé par la CAF chaque mois
                    </p>
                  </div>
                  <div>
                    <label htmlFor="lease-caf_payment_day" className="block text-sm font-medium text-[var(--text)] mb-2">
                      Jour de versement CAF
                    </label>
                    <input
                      id="lease-caf_payment_day"
                      type="number"
                      name="caf_payment_day"
                      value={formData.caf_payment_day}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                      min="1"
                      max="28"
                    />
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Généralement le 5 du mois
                    </p>
                  </div>
                </div>
              )}

              {/* Calcul du reste à charge */}
              {formData.caf_direct_payment && formData.caf_amount && (
                <div className="mt-4 p-4 bg-[var(--color-electric-blue)]/10 dark:bg-[var(--color-electric-blue)]/20 rounded-xl ml-7">
                  <div className="text-sm text-[var(--text)]">
                    <div className="flex justify-between mb-1">
                      <span>Loyer + charges :</span>
                      <span className="font-medium">
                        {(parseFloat(formData.rent_amount || 0) + parseFloat(formData.charges_amount || 0)).toFixed(2)} €
                      </span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>APL versées :</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        - {parseFloat(formData.caf_amount || 0).toFixed(2)} €
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-[var(--color-electric-blue)]/30 font-semibold">
                      <span>Reste à charge locataire :</span>
                      <span className="text-[var(--color-electric-blue)]">
                        {(
                          parseFloat(formData.rent_amount || 0) +
                          parseFloat(formData.charges_amount || 0) -
                          parseFloat(formData.caf_amount || 0)
                        ).toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Alerte taux d'effort */}
              {effortWarning && effortRate !== null && (
                <Alert
                  variant={effortWarning === 'danger' ? 'error' : effortWarning}
                  title={`Taux d'effort : ${effortRate.toFixed(1)} %`}
                  className="mt-4"
                >
                  {effortWarning === 'danger' && (
                    <>
                      <p className="font-semibold mb-1">⚠️ Risque très élevé</p>
                      <p className="text-sm">Le taux d'effort dépasse 50%. Une garantie solide est fortement recommandée (Visale, organisme de cautionnement, ou garant avec revenus 3× supérieurs au loyer).</p>
                    </>
                  )}
                  {effortWarning === 'warning' && (
                    <>
                      <p className="font-semibold mb-1">⚠️ Risque élevé</p>
                      <p className="text-sm">Le taux d'effort dépasse 40%. Une garantie est recommandée pour sécuriser ce bail.</p>
                    </>
                  )}
                  {effortWarning === 'info' && (
                    <>
                      <p className="font-semibold mb-1">ℹ️ Taux légèrement élevé</p>
                      <p className="text-sm">Le taux d'effort dépasse 33% (maximum recommandé). Vérifiez la solvabilité du locataire.</p>
                    </>
                  )}
                  <div className="mt-2 text-sm">
                    <p>Revenus mensuels du groupe : <span className="font-medium">{totalIncome.toLocaleString('fr-FR')} €</span></p>
                    <p>Loyer net après aides : <span className="font-medium">
                      {(
                        parseFloat(formData.rent_amount || 0) +
                        parseFloat(formData.charges_amount || 0) -
                        (formData.caf_direct_payment ? parseFloat(formData.caf_amount || 0) : 0)
                      ).toLocaleString('fr-FR')} €
                    </span></p>
                  </div>
                </Alert>
              )}
            </div>

            {/* Section Indexation des loyers */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-lg font-display font-semibold text-[var(--text)] mb-4">Indexation des loyers (IRL)</h3>

              {/* Activer l'indexation */}
              <div className="space-y-4">
                <label htmlFor="lease-indexation_enabled" className="flex items-center space-x-3 cursor-pointer">
                  <input
                    id="lease-indexation_enabled"
                    type="checkbox"
                    name="indexation_enabled"
                    checked={formData.indexation_enabled}
                    onChange={handleChange}
                    className="w-4 h-4 text-[var(--color-electric-blue)] border-[var(--border)] rounded focus:ring-2 focus:ring-[var(--color-electric-blue)]"
                  />
                  <span className="text-sm font-medium text-[var(--text)]">
                    Activer l'indexation annuelle du loyer
                  </span>
                </label>

                {/* Sélection du trimestre et de l'année */}
                {formData.indexation_enabled && (
                  <div className="ml-7 space-y-4">
                    {/* Message d'aide */}
                    <div className="p-3 bg-[var(--color-electric-blue)]/10 dark:bg-[var(--color-electric-blue)]/20 rounded-xl">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-[var(--color-electric-blue)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-[var(--text)]">
                          Le trimestre de référence est généralement celui indiqué dans votre contrat de bail. Par défaut, il correspond à la date de signature.
                        </p>
                      </div>
                    </div>

                    {/* Selects trimestre et année */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="lease-irl_reference_quarter" className="block text-sm font-medium text-[var(--text)] mb-2">
                          Trimestre de référence IRL *
                        </label>
                        <select
                          id="lease-irl_reference_quarter"
                          value={irlReferenceQuarter}
                          onChange={(e) => setIrlReferenceQuarter(e.target.value)}
                          className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                          required={formData.indexation_enabled}
                        >
                          <option value="">Sélectionner un trimestre</option>
                          <option value="1">T1 (Janvier - Mars)</option>
                          <option value="2">T2 (Avril - Juin)</option>
                          <option value="3">T3 (Juillet - Septembre)</option>
                          <option value="4">T4 (Octobre - Décembre)</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="lease-irl_reference_year" className="block text-sm font-medium text-[var(--text)] mb-2">
                          Année de référence *
                        </label>
                        <select
                          id="lease-irl_reference_year"
                          value={irlReferenceYear}
                          onChange={(e) => setIrlReferenceYear(e.target.value)}
                          className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                          required={formData.indexation_enabled}
                        >
                          <option value="">Sélectionner une année</option>
                          {[2020, 2021, 2022, 2023, 2024, 2025].map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Affichage de l'IRL sélectionné */}
                    {irlReferenceQuarter && irlReferenceYear && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        {irlLoading ? (
                          <p className="text-sm text-[var(--text-secondary)]">
                            Chargement de l'IRL...
                          </p>
                        ) : currentIRL ? (
                          <p className="text-sm text-[var(--text)]">
                            <span className="font-medium">IRL T{irlReferenceQuarter} {irlReferenceYear} :</span>{' '}
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">{parseFloat(currentIRL.value).toFixed(2)}</span>
                          </p>
                        ) : (
                          <p className="text-sm text-orange-600 dark:text-orange-400">
                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            IRL non disponible pour cette période
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Clauses particulières */}
            <div>
              <label htmlFor="lease-special_clauses" className="block text-sm font-medium text-[var(--text)] mb-2">
                Clauses particulières
              </label>
              <textarea
                id="lease-special_clauses"
                name="special_clauses"
                value={formData.special_clauses}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                rows="6"
                placeholder="Le locataire s'engage à..."
              />
            </div>

            {/* Boutons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                loading={loading}
                className="flex-1"
              >
                {isEditMode ? 'Mettre à jour' : 'Créer le bail'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/leases')}
                className="flex-1"
              >
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default LeaseForm
