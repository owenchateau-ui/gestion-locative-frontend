/**
 * Modal de calcul et validation des retenues sur dépôt de garantie
 * Permet de visualiser, ajuster et valider les retenues calculées automatiquement
 */

import { useState, useEffect, useMemo } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Alert from '../ui/Alert'
import Badge from '../ui/Badge'
import { RatingBadge } from './ElementRating'
import {
  Euro,
  Calculator,
  Check,
  AlertTriangle,
  Edit,
  Save,
  Undo,
  FileText,
  Info
} from 'lucide-react'

/**
 * Formate un montant en euros
 */
const formatEuro = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount || 0)
}

/**
 * Ligne éditable pour une retenue
 */
function DeductionRow({ deduction, index, isEditing, onUpdate }) {
  const [editAmount, setEditAmount] = useState(deduction.tenantShare || 0)

  useEffect(() => {
    setEditAmount(deduction.tenantShare || 0)
  }, [deduction.tenantShare])

  const handleAmountChange = (e) => {
    const value = parseFloat(e.target.value) || 0
    setEditAmount(value)
    onUpdate(index, value)
  }

  return (
    <tr className={`border-b ${deduction.isDegradation ? 'bg-red-50' : ''}`}>
      <td className="py-3 px-2">
        <div className="font-medium text-sm">{deduction.room}</div>
        <div className="text-xs text-gray-500">{deduction.element}</div>
      </td>
      <td className="py-3 px-2 text-center">
        <RatingBadge rating={deduction.entryRating} size="sm" />
      </td>
      <td className="py-3 px-2 text-center">
        <RatingBadge rating={deduction.exitRating} size="sm" />
      </td>
      <td className="py-3 px-2 text-right text-sm">
        {formatEuro(deduction.repairCost)}
      </td>
      <td className="py-3 px-2 text-right text-sm text-orange-600">
        {deduction.vetusteRate > 0 ? `${Math.round(deduction.vetusteRate)}%` : '-'}
      </td>
      <td className="py-3 px-2 text-right">
        {isEditing ? (
          <input
            type="number"
            min="0"
            step="0.01"
            value={editAmount}
            onChange={handleAmountChange}
            className="w-24 px-2 py-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        ) : (
          <span className="font-medium">{formatEuro(deduction.tenantShare)}</span>
        )}
      </td>
    </tr>
  )
}

/**
 * Modal principale de gestion des retenues
 */
function DepositDeductionsModal({
  isOpen,
  onClose,
  comparison,
  depositAmount,
  onSave,
  saving = false,
  existingDeductions = null
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [deductions, setDeductions] = useState([])
  const [additionalDeductions, setAdditionalDeductions] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newDeduction, setNewDeduction] = useState({
    description: '',
    amount: 0
  })

  // Initialiser les retenues depuis la comparaison ou les données existantes
  useEffect(() => {
    if (existingDeductions?.details) {
      // Charger les retenues déjà sauvegardées
      const saved = existingDeductions.details
      setDeductions(saved.filter(d => !d.isManual))
      setAdditionalDeductions(saved.filter(d => d.isManual))
    } else if (comparison?.differences) {
      // Utiliser les retenues calculées automatiquement
      setDeductions(comparison.differences.map(diff => ({
        ...diff,
        tenantShare: diff.tenantShare || 0
      })))
      setAdditionalDeductions([])
    }
  }, [comparison, existingDeductions])

  // Calculer le total des retenues
  const totalDeductions = useMemo(() => {
    const fromComparison = deductions.reduce((sum, d) => sum + (d.tenantShare || 0), 0)
    const fromAdditional = additionalDeductions.reduce((sum, d) => sum + (d.amount || 0), 0)
    return Math.round((fromComparison + fromAdditional) * 100) / 100
  }, [deductions, additionalDeductions])

  // Montant à restituer
  const amountToReturn = useMemo(() => {
    return Math.max(0, (depositAmount || 0) - totalDeductions)
  }, [depositAmount, totalDeductions])

  // Mettre à jour une retenue
  const handleUpdateDeduction = (index, newAmount) => {
    setDeductions(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], tenantShare: newAmount }
      return updated
    })
  }

  // Ajouter une retenue manuelle
  const handleAddDeduction = () => {
    if (newDeduction.description && newDeduction.amount > 0) {
      setAdditionalDeductions(prev => [...prev, {
        ...newDeduction,
        isManual: true,
        id: Date.now()
      }])
      setNewDeduction({ description: '', amount: 0 })
      setShowAddForm(false)
    }
  }

  // Supprimer une retenue manuelle
  const handleRemoveAdditional = (index) => {
    setAdditionalDeductions(prev => prev.filter((_, i) => i !== index))
  }

  // Réinitialiser aux valeurs calculées
  const handleReset = () => {
    if (comparison?.differences) {
      setDeductions(comparison.differences.map(diff => ({
        ...diff,
        tenantShare: diff.tenantShare || 0
      })))
      setAdditionalDeductions([])
      setIsEditing(false)
    }
  }

  // Sauvegarder les retenues
  const handleSave = () => {
    const allDeductions = [
      ...deductions.map(d => ({
        room: d.room,
        element: d.element,
        elementType: d.elementType,
        entryRating: d.entryRating,
        exitRating: d.exitRating,
        repairCost: d.repairCost,
        vetusteRate: d.vetusteRate,
        amount: d.tenantShare,
        isManual: false
      })),
      ...additionalDeductions.map(d => ({
        description: d.description,
        amount: d.amount,
        isManual: true
      }))
    ]

    onSave(allDeductions)
  }

  const hasChanges = isEditing || additionalDeductions.length > 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Calcul des retenues sur dépôt de garantie"
      size="xl"
    >
      <div className="space-y-6">
        {/* En-tête avec résumé */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-500 mb-1">Dépôt versé</p>
            <p className="text-xl font-bold text-gray-900">{formatEuro(depositAmount)}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg text-center">
            <p className="text-sm text-gray-500 mb-1">Total retenues</p>
            <p className="text-xl font-bold text-red-600">{formatEuro(totalDeductions)}</p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg text-center">
            <p className="text-sm text-gray-500 mb-1">À restituer</p>
            <p className="text-xl font-bold text-emerald-600">{formatEuro(amountToReturn)}</p>
          </div>
        </div>

        {/* Info sur le calcul automatique */}
        <Alert variant="info">
          <Info className="w-4 h-4 inline mr-2" />
          Les retenues sont calculées automatiquement en tenant compte de la vétusté
          selon le barème légal. Vous pouvez ajuster les montants si nécessaire.
        </Alert>

        {/* Tableau des retenues */}
        {deductions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-2">Élément</th>
                  <th className="text-center py-2 px-2">Entrée</th>
                  <th className="text-center py-2 px-2">Sortie</th>
                  <th className="text-right py-2 px-2">Coût répar.</th>
                  <th className="text-right py-2 px-2">Vétusté</th>
                  <th className="text-right py-2 px-2">À charge</th>
                </tr>
              </thead>
              <tbody>
                {deductions.map((deduction, index) => (
                  <DeductionRow
                    key={`${deduction.room}-${deduction.element}-${index}`}
                    deduction={deduction}
                    index={index}
                    isEditing={isEditing}
                    onUpdate={handleUpdateDeduction}
                  />
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-medium">
                <tr>
                  <td colSpan={5} className="py-2 px-2 text-right">
                    Sous-total dégradations
                  </td>
                  <td className="py-2 px-2 text-right">
                    {formatEuro(deductions.reduce((sum, d) => sum + (d.tenantShare || 0), 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Check className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="text-gray-600">Aucune dégradation détectée</p>
            <p className="text-sm text-gray-500">
              Le dépôt de garantie peut être restitué intégralement
            </p>
          </div>
        )}

        {/* Retenues manuelles */}
        {additionalDeductions.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Retenues supplémentaires</h4>
            <div className="space-y-2">
              {additionalDeductions.map((item, index) => (
                <div
                  key={item.id || index}
                  className="flex items-center justify-between p-3 bg-amber-50 rounded-lg"
                >
                  <div>
                    <span className="font-medium">{item.description}</span>
                    <Badge variant="warning" className="ml-2">Manuel</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{formatEuro(item.amount)}</span>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveAdditional(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formulaire ajout retenue manuelle */}
        {showAddForm && (
          <div className="border p-4 rounded-lg bg-gray-50">
            <h4 className="font-medium text-gray-900 mb-3">Ajouter une retenue</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newDeduction.description}
                  onChange={(e) => setNewDeduction(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ex: Ménage non effectué"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant (€)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newDeduction.amount}
                  onChange={(e) => setNewDeduction(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowAddForm(false)
                  setNewDeduction({ description: '', amount: 0 })
                }}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddDeduction}
                disabled={!newDeduction.description || newDeduction.amount <= 0}
              >
                Ajouter
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="border-t pt-4 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex gap-2">
            {!isEditing ? (
              <Button
                variant="secondary"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier les montants
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={handleReset}
              >
                <Undo className="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>
            )}
            {!showAddForm && (
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAddForm(true)
                  setIsEditing(true)
                }}
              >
                <Euro className="w-4 h-4 mr-2" />
                Ajouter une retenue
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Valider les retenues
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Mention légale */}
        <div className="text-xs text-gray-500 border-t pt-4">
          <strong>Base légale :</strong> La vétusté est calculée selon le barème annexé
          au décret n° 2016-382 du 30 mars 2016. Le bailleur dispose d'un délai d'un mois
          (si EDL de sortie conforme) ou deux mois (si différences constatées) pour
          restituer le dépôt de garantie.
        </div>
      </div>
    </Modal>
  )
}

export default DepositDeductionsModal
