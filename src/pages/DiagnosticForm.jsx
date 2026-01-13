/**
 * Formulaire de création/édition d'un diagnostic immobilier
 */

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Save, ArrowLeft, Calendar, Building2, User, FileText,
  Upload, AlertTriangle, Info
} from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'
import Breadcrumb from '../components/ui/Breadcrumb'
import { EnergyClassSelector, DPEWidget } from '../components/diagnostics'
import { useAuth } from '../context/AuthContext'
import { useEntity } from '../context/EntityContext'
import { useToast } from '../context/ToastContext'
import {
  getDiagnosticById,
  createDiagnostic,
  updateDiagnostic
} from '../services/diagnosticService'
import { fetchLots } from '../services/lotService'
import {
  DIAGNOSTIC_TYPES,
  calculateExpirationDate,
  isDiagnosticRequired
} from '../constants/diagnosticConstants'

function DiagnosticForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { user } = useAuth()
  const { selectedEntity } = useEntity()
  const { success, error: showError } = useToast()

  // États
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [lots, setLots] = useState([])
  const [selectedLot, setSelectedLot] = useState(null)

  // Données du formulaire
  const [formData, setFormData] = useState({
    lot_id: '',
    type: 'dpe',
    performed_date: new Date().toISOString().split('T')[0],
    expiration_date: '',
    // DPE spécifique
    dpe_rating: '',
    dpe_value: '',
    ges_rating: '',
    ges_value: '',
    // Résultat générique
    is_positive: null,
    result_details: '',
    // Surface
    measured_surface: '',
    // Diagnostiqueur
    diagnostician_name: '',
    diagnostician_company: '',
    diagnostician_certification: '',
    report_number: '',
    // Notes
    notes: '',
    recommendations: ''
  })

  // Chargement initial
  useEffect(() => {
    loadLots()
    if (isEdit) {
      loadDiagnostic()
    }
  }, [id, selectedEntity])

  // Calcul automatique de la date d'expiration
  useEffect(() => {
    if (formData.performed_date && formData.type) {
      const expDate = calculateExpirationDate(
        formData.type,
        formData.performed_date,
        formData.is_positive
      )
      if (expDate) {
        setFormData(prev => ({ ...prev, expiration_date: expDate }))
      }
    }
  }, [formData.type, formData.performed_date, formData.is_positive])

  // Mise à jour du lot sélectionné
  useEffect(() => {
    if (formData.lot_id) {
      const lot = lots.find(l => l.id === formData.lot_id)
      setSelectedLot(lot)
    } else {
      setSelectedLot(null)
    }
  }, [formData.lot_id, lots])

  const loadLots = async () => {
    if (!user) return
    try {
      const data = await fetchLots(user.id, selectedEntity)
      setLots(data)
    } catch (err) {
      console.error('Erreur chargement lots:', err)
    }
  }

  const loadDiagnostic = async () => {
    try {
      setLoading(true)
      const data = await getDiagnosticById(id)
      setFormData({
        lot_id: data.lot_id || '',
        type: data.type || 'dpe',
        performed_date: data.performed_date || '',
        expiration_date: data.expiration_date || '',
        dpe_rating: data.dpe_rating || '',
        dpe_value: data.dpe_value?.toString() || '',
        ges_rating: data.ges_rating || '',
        ges_value: data.ges_value?.toString() || '',
        is_positive: data.is_positive,
        result_details: data.result_details || '',
        measured_surface: data.measured_surface?.toString() || '',
        diagnostician_name: data.diagnostician_name || '',
        diagnostician_company: data.diagnostician_company || '',
        diagnostician_certification: data.diagnostician_certification || '',
        report_number: data.report_number || '',
        notes: data.notes || '',
        recommendations: data.recommendations || ''
      })
    } catch (err) {
      showError('Erreur lors du chargement du diagnostic')
      navigate('/diagnostics')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.lot_id) {
      showError('Veuillez sélectionner un lot')
      return
    }
    if (!formData.performed_date) {
      showError('Veuillez indiquer la date de réalisation')
      return
    }
    if (formData.type === 'dpe' && !formData.dpe_rating) {
      showError('Veuillez sélectionner la classe énergétique DPE')
      return
    }
    if (formData.type === 'surface' && !formData.measured_surface) {
      showError('Veuillez indiquer la surface mesurée')
      return
    }

    try {
      setSaving(true)

      const dataToSave = {
        ...formData,
        dpe_value: formData.dpe_value ? parseInt(formData.dpe_value) : null,
        ges_value: formData.ges_value ? parseInt(formData.ges_value) : null,
        measured_surface: formData.measured_surface ? parseFloat(formData.measured_surface) : null
      }

      if (isEdit) {
        await updateDiagnostic(id, dataToSave)
        success('Diagnostic mis à jour')
      } else {
        await createDiagnostic(dataToSave)
        success('Diagnostic créé')
      }

      navigate('/diagnostics')
    } catch (err) {
      console.error('Erreur sauvegarde:', err)
      showError('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const typeInfo = DIAGNOSTIC_TYPES[formData.type] || {}

  // Formulaire de chargement
  if (loading) {
    return (
      <DashboardLayout title="Chargement...">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--surface-elevated)] rounded-xl w-1/4"></div>
          <div className="h-64 bg-[var(--surface-elevated)] rounded-xl"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={isEdit ? 'Modifier le diagnostic' : 'Nouveau diagnostic'}>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Diagnostics', href: '/diagnostics' },
            { label: isEdit ? 'Modifier' : 'Nouveau' }
          ]}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations principales */}
          <Card title="Informations du diagnostic">
            <div className="p-6 space-y-6">
              {/* Type et Lot */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    Type de diagnostic *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                    required
                  >
                    {Object.entries(DIAGNOSTIC_TYPES).map(([key, info]) => (
                      <option key={key} value={key}>
                        {info.label} - {info.fullLabel}
                      </option>
                    ))}
                  </select>
                  {typeInfo.description && (
                    <p className="text-sm text-[var(--text-muted)] mt-1">{typeInfo.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    Lot concerné *
                  </label>
                  <select
                    value={formData.lot_id}
                    onChange={(e) => handleChange('lot_id', e.target.value)}
                    className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                    required
                  >
                    <option value="">Sélectionnez un lot</option>
                    {lots.map(lot => (
                      <option key={lot.id} value={lot.id}>
                        {lot.name} - {lot.property?.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    Date de réalisation *
                  </label>
                  <input
                    type="date"
                    value={formData.performed_date}
                    onChange={(e) => handleChange('performed_date', e.target.value)}
                    className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    Date d'expiration
                  </label>
                  <input
                    type="date"
                    value={formData.expiration_date}
                    onChange={(e) => handleChange('expiration_date', e.target.value)}
                    className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                  />
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    {typeInfo.validityMonths
                      ? `Calculée automatiquement (${typeInfo.validityMonths / 12} ans)`
                      : 'Validité illimitée pour ce type de diagnostic'
                    }
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Section spécifique DPE */}
          {formData.type === 'dpe' && (
            <Card title="Résultats DPE">
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Classe énergétique */}
                  <div>
                    <EnergyClassSelector
                      value={formData.dpe_rating}
                      onChange={(v) => handleChange('dpe_rating', v)}
                      type="energy"
                      label="Classe énergétique (DPE) *"
                    />
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-[var(--text)] mb-2">
                        Valeur (kWh/m2/an)
                      </label>
                      <input
                        type="number"
                        value={formData.dpe_value}
                        onChange={(e) => handleChange('dpe_value', e.target.value)}
                        placeholder="Ex: 185"
                        min="0"
                        max="999"
                        className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                      />
                    </div>
                  </div>

                  {/* Classe GES */}
                  <div>
                    <EnergyClassSelector
                      value={formData.ges_rating}
                      onChange={(v) => handleChange('ges_rating', v)}
                      type="ges"
                      label="Classe GES (émissions CO2)"
                    />
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-[var(--text)] mb-2">
                        Valeur (kg CO2/m2/an)
                      </label>
                      <input
                        type="number"
                        value={formData.ges_value}
                        onChange={(e) => handleChange('ges_value', e.target.value)}
                        placeholder="Ex: 35"
                        min="0"
                        max="999"
                        className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Aperçu DPE */}
                {formData.dpe_rating && (
                  <div className="mt-6 p-4 bg-[var(--surface-elevated)] rounded-xl">
                    <h4 className="text-sm font-display font-medium text-[var(--text)] mb-3">Aperçu</h4>
                    <DPEWidget
                      dpeRating={formData.dpe_rating}
                      dpeValue={formData.dpe_value ? parseInt(formData.dpe_value) : null}
                      gesRating={formData.ges_rating}
                      gesValue={formData.ges_value ? parseInt(formData.ges_value) : null}
                      compact={true}
                    />
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Section surface */}
          {formData.type === 'surface' && (
            <Card title="Résultat mesurage">
              <div className="p-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    Surface mesurée (m2) *
                  </label>
                  <input
                    type="number"
                    value={formData.measured_surface}
                    onChange={(e) => handleChange('measured_surface', e.target.value)}
                    placeholder="Ex: 65.50"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                    required={formData.type === 'surface'}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Section amiante/plomb/etc. */}
          {['amiante', 'plomb', 'termites'].includes(formData.type) && (
            <Card title="Résultat du diagnostic">
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    Résultat
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 p-3 border border-[var(--border)] rounded-xl cursor-pointer hover:bg-[var(--surface-elevated)] transition-colors">
                      <input
                        type="radio"
                        name="is_positive"
                        checked={formData.is_positive === false}
                        onChange={() => handleChange('is_positive', false)}
                        className="text-[var(--color-electric-blue)]"
                      />
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">Négatif (absence)</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 border border-[var(--border)] rounded-xl cursor-pointer hover:bg-[var(--surface-elevated)] transition-colors">
                      <input
                        type="radio"
                        name="is_positive"
                        checked={formData.is_positive === true}
                        onChange={() => handleChange('is_positive', true)}
                        className="text-[var(--color-electric-blue)]"
                      />
                      <span className="text-[var(--color-vivid-coral)] font-medium">Positif (présence détectée)</span>
                    </label>
                  </div>
                </div>

                {formData.is_positive === true && (
                  <Alert variant="warning" title="Attention">
                    Un résultat positif peut nécessiter des travaux ou un renouvellement plus fréquent du diagnostic.
                  </Alert>
                )}

                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    Détails du résultat
                  </label>
                  <textarea
                    value={formData.result_details}
                    onChange={(e) => handleChange('result_details', e.target.value)}
                    rows={3}
                    placeholder="Précisions sur les résultats..."
                    className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Diagnostiqueur */}
          <Card title="Informations du diagnostiqueur">
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    Nom du diagnostiqueur
                  </label>
                  <input
                    type="text"
                    value={formData.diagnostician_name}
                    onChange={(e) => handleChange('diagnostician_name', e.target.value)}
                    placeholder="Jean Dupont"
                    className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    Société
                  </label>
                  <input
                    type="text"
                    value={formData.diagnostician_company}
                    onChange={(e) => handleChange('diagnostician_company', e.target.value)}
                    placeholder="Diag Immo SARL"
                    className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    N certification
                  </label>
                  <input
                    type="text"
                    value={formData.diagnostician_certification}
                    onChange={(e) => handleChange('diagnostician_certification', e.target.value)}
                    placeholder="CERT-123456"
                    className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    N rapport
                  </label>
                  <input
                    type="text"
                    value={formData.report_number}
                    onChange={(e) => handleChange('report_number', e.target.value)}
                    placeholder="RAP-2024-001"
                    className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Notes et recommandations */}
          <Card title="Notes et recommandations">
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={3}
                  placeholder="Notes internes..."
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Recommandations du diagnostiqueur
                </label>
                <textarea
                  value={formData.recommendations}
                  onChange={(e) => handleChange('recommendations', e.target.value)}
                  rows={3}
                  placeholder="Recommandations issues du rapport..."
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent transition-colors"
                />
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/diagnostics')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Enregistrer'}
            </Button>
          </div>
        </form>

        {/* Info légale */}
        <Alert variant="info" title="Information légale">
          Les diagnostics immobiliers obligatoires sont régis par les articles L. 271-4 à L. 271-6
          du Code de la construction et de l'habitation. Leur validité varie selon le type de diagnostic.
        </Alert>
      </div>
    </DashboardLayout>
  )
}

export default DiagnosticForm
