/**
 * Page de détail d'un état des lieux
 * Affiche toutes les informations et permet la comparaison entrée/sortie
 */

import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Alert from '../components/ui/Alert'
import Breadcrumb from '../components/ui/Breadcrumb'
import Tabs from '../components/ui/Tabs'
import Skeleton from '../components/ui/Skeleton'
import Modal from '../components/ui/Modal'
import { useToast } from '../context/ToastContext'
import { RatingBadge, RatingComparison } from '../components/inventory/ElementRating'
import {
  getInventoryById,
  deleteInventory,
  compareInventories,
  saveDepositDeductions
} from '../services/inventoryService'
import DepositDeductionsModal from '../components/inventory/DepositDeductionsModal'
import {
  downloadEtatDesLieuxPDF,
  downloadEtatDesLieuxPDFWithPhotos,
  countPhotosInInventory
} from '../components/documents/EtatDesLieuxPDF'
import {
  INVENTORY_TYPES,
  INVENTORY_STATUS,
  ROOM_TYPES,
  ELEMENT_CATEGORIES,
  KEY_TYPES,
  calculateVetusteRate,
  calculateTenantShare
} from '../constants/inventoryConstants'
import {
  ClipboardList,
  Calendar,
  Home,
  Users,
  Edit,
  Trash2,
  Download,
  FileText,
  Gauge,
  Key,
  DoorOpen,
  MessageSquare,
  Camera,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ArrowDown,
  Euro,
  Clock,
  PenTool,
  Calculator,
  Check
} from 'lucide-react'

function InventoryDetail() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { success, error: showError } = useToast()

  const shouldDownloadPdf = searchParams.get('pdf') === '1'

  const [inventory, setInventory] = useState(null)
  const [entryInventory, setEntryInventory] = useState(null)
  const [comparison, setComparison] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [pdfProgress, setPdfProgress] = useState('')
  const [deductionsModalOpen, setDeductionsModalOpen] = useState(false)
  const [savingDeductions, setSavingDeductions] = useState(false)

  useEffect(() => {
    loadInventory()
  }, [id])

  const loadInventory = async () => {
    try {
      setLoading(true)
      const data = await getInventoryById(id)
      setInventory(data)

      // Si c'est une sortie, charger l'entrée et la comparaison
      if (data.type === 'exit' && data.entry_inventory_id) {
        const entry = await getInventoryById(data.entry_inventory_id)
        setEntryInventory(entry)

        const comp = await compareInventories(data.entry_inventory_id, id)
        setComparison(comp)
      }

      // Si demande de téléchargement PDF
      if (shouldDownloadPdf && data.status === 'signed') {
        // TODO: Implémenter génération PDF
        console.log('Téléchargement PDF demandé')
      }
    } catch (err) {
      console.error('Erreur chargement inventaire:', err)
      showError('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await deleteInventory(id)
      success('État des lieux supprimé')
      navigate('/inventories')
    } catch (err) {
      console.error('Erreur suppression:', err)
      showError(`Erreur : ${err.message}`)
    } finally {
      setDeleting(false)
      setDeleteModalOpen(false)
    }
  }

  const handleDownloadPdf = async (withPhotos = false) => {
    const photoCount = countPhotosInInventory(inventory)
    const hasPhotos = photoCount > 0

    try {
      if (withPhotos && hasPhotos) {
        // Téléchargement avec photos (asynchrone)
        setDownloadingPdf(true)
        setPdfProgress('Préparation...')

        await downloadEtatDesLieuxPDFWithPhotos(
          inventory,
          {
            entryInventory: entryInventory,
            showComparison: inventory.type === 'exit' && !!entryInventory
          },
          (progress) => setPdfProgress(progress.message)
        )

        success(`PDF complet téléchargé (${photoCount} photos incluses)`)
      } else {
        // Téléchargement simple (synchrone)
        downloadEtatDesLieuxPDF(inventory, {
          entryInventory: entryInventory,
          showComparison: inventory.type === 'exit' && !!entryInventory
        })
        success('PDF téléchargé avec succès')
      }
    } catch (err) {
      console.error('Erreur génération PDF:', err)
      showError('Erreur lors de la génération du PDF')
    } finally {
      setDownloadingPdf(false)
      setPdfProgress('')
    }
  }

  // Sauvegarder les retenues sur dépôt de garantie
  const handleSaveDeductions = async (deductions) => {
    try {
      setSavingDeductions(true)
      await saveDepositDeductions(id, deductions)
      success('Retenues enregistrées avec succès')
      setDeductionsModalOpen(false)
      // Recharger l'inventaire pour avoir les retenues à jour
      await loadInventory()
    } catch (err) {
      console.error('Erreur sauvegarde retenues:', err)
      showError('Erreur lors de l\'enregistrement des retenues')
    } finally {
      setSavingDeductions(false)
    }
  }

  // Nombre de photos dans l'inventaire
  const photoCount = inventory ? countPhotosInInventory(inventory) : 0

  if (loading) {
    return (
      <DashboardLayout title="État des lieux">
        <div className="space-y-4">
          <Skeleton type="card" />
          <Skeleton type="card" />
          <Skeleton type="card" />
        </div>
      </DashboardLayout>
    )
  }

  if (!inventory) {
    return (
      <DashboardLayout title="État des lieux">
        <Alert variant="error">
          État des lieux non trouvé
        </Alert>
      </DashboardLayout>
    )
  }

  const lease = inventory.lease
  const lot = lease?.lot
  const property = lot?.property
  const entity = property?.entity
  const tenant = lease?.tenant
  const tenantName = tenant?.tenant_group?.name ||
    `${tenant?.first_name || ''} ${tenant?.last_name || ''}`.trim()

  const getStatusBadge = (status) => {
    const info = INVENTORY_STATUS[status]
    const variants = {
      draft: 'warning',
      completed: 'info',
      signed: 'success'
    }
    return (
      <Badge variant={variants[status] || 'default'}>
        {info?.icon} {info?.label}
      </Badge>
    )
  }

  // Calcul des statistiques
  const totalItems = inventory.rooms?.reduce((sum, r) => sum + (r.items?.length || 0), 0) || 0
  const degradations = inventory.rooms?.reduce((sum, r) =>
    sum + (r.items?.filter(i => i.is_degradation).length || 0), 0) || 0
  const totalKeys = inventory.keys_details?.reduce((sum, k) => sum + k.quantity, 0) || 0

  // Contenu des onglets
  const tabContent = {
    overview: (
      <div className="space-y-6">
        {/* Informations générales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card padding={true}>
            <h4 className="font-display font-medium text-[var(--text)] mb-4 flex items-center gap-2">
              <Home className="w-5 h-5 text-[var(--color-electric-blue)]" />
              Logement
            </h4>
            <div className="space-y-2">
              <p className="text-sm text-[var(--text)]">
                <span className="text-[var(--text-muted)]">Propriété :</span>{' '}
                <Link to={`/properties/${property?.id}`} className="text-[var(--color-electric-blue)] hover:underline transition-colors">
                  {property?.name}
                </Link>
              </p>
              <p className="text-sm text-[var(--text)]">
                <span className="text-[var(--text-muted)]">Lot :</span>{' '}
                <Link to={`/lots/${lot?.id}`} className="text-[var(--color-electric-blue)] hover:underline transition-colors">
                  {lot?.name}
                </Link>
              </p>
              <p className="text-sm text-[var(--text)]">
                <span className="text-[var(--text-muted)]">Adresse :</span>{' '}
                {property?.address}, {property?.postal_code} {property?.city}
              </p>
              <p className="text-sm text-[var(--text)]">
                <span className="text-[var(--text-muted)]">Surface :</span>{' '}
                {lot?.surface_area} m²
              </p>
            </div>
          </Card>

          <Card padding={true}>
            <h4 className="font-display font-medium text-[var(--text)] mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--color-electric-blue)]" />
              Locataire
            </h4>
            <div className="space-y-2">
              <p className="text-sm text-[var(--text)]">
                <span className="text-[var(--text-muted)]">Nom :</span>{' '}
                <Link to={`/tenants/${tenant?.tenant_group?.id || tenant?.id}`} className="text-[var(--color-electric-blue)] hover:underline transition-colors">
                  {tenantName}
                </Link>
              </p>
              <p className="text-sm text-[var(--text)]">
                <span className="text-[var(--text-muted)]">Bail :</span>{' '}
                <Link to={`/leases/${lease?.id}`} className="text-[var(--color-electric-blue)] hover:underline transition-colors">
                  Du {new Date(lease?.start_date).toLocaleDateString('fr-FR')} au{' '}
                  {new Date(lease?.end_date).toLocaleDateString('fr-FR')}
                </Link>
              </p>
              <p className="text-sm text-[var(--text)]">
                <span className="text-[var(--text-muted)]">Loyer :</span>{' '}
                {lease?.rent_amount?.toLocaleString('fr-FR')} € + {lease?.charges_amount?.toLocaleString('fr-FR')} € charges
              </p>
            </div>
          </Card>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card padding={true}>
            <div className="text-center">
              <DoorOpen className="w-8 h-8 text-[var(--color-electric-blue)] mx-auto mb-2" />
              <p className="text-2xl font-display font-bold text-[var(--text)]">{inventory.rooms?.length || 0}</p>
              <p className="text-sm text-[var(--text-muted)]">Pièces</p>
            </div>
          </Card>
          <Card padding={true}>
            <div className="text-center">
              <ClipboardList className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
              <p className="text-2xl font-display font-bold text-[var(--text)]">{totalItems}</p>
              <p className="text-sm text-[var(--text-muted)]">Éléments</p>
            </div>
          </Card>
          <Card padding={true}>
            <div className="text-center">
              <Key className="w-8 h-8 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
              <p className="text-2xl font-display font-bold text-[var(--text)]">{totalKeys}</p>
              <p className="text-sm text-[var(--text-muted)]">Clés</p>
            </div>
          </Card>
          <Card padding={true}>
            <div className="text-center">
              <AlertTriangle className={`w-8 h-8 mx-auto mb-2 ${degradations > 0 ? 'text-red-600 dark:text-red-400' : 'text-[var(--text-muted)]'}`} />
              <p className="text-2xl font-display font-bold text-[var(--text)]">{degradations}</p>
              <p className="text-sm text-[var(--text-muted)]">Dégradations</p>
            </div>
          </Card>
        </div>

        {/* Observations générales */}
        {inventory.general_observations && (
          <Card padding={true}>
            <h4 className="font-display font-medium text-[var(--text)] mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[var(--color-electric-blue)]" />
              Observations générales
            </h4>
            <p className="text-[var(--text-secondary)] whitespace-pre-wrap">
              {inventory.general_observations}
            </p>
          </Card>
        )}

        {/* Signatures */}
        {inventory.status === 'signed' && (
          <Card padding={true}>
            <h4 className="font-display font-medium text-[var(--text)] mb-4 flex items-center gap-2">
              <PenTool className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Signatures
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-[var(--text-muted)] mb-2">Bailleur</p>
                {inventory.landlord_signature ? (
                  <>
                    <img
                      src={inventory.landlord_signature}
                      alt="Signature bailleur"
                      className="max-h-24 border border-[var(--border)] rounded-xl"
                    />
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Signé le {new Date(inventory.landlord_signed_at).toLocaleString('fr-FR')}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">Non signé</p>
                )}
              </div>
              <div>
                <p className="text-sm text-[var(--text-muted)] mb-2">Locataire</p>
                {inventory.tenant_signature ? (
                  <>
                    <img
                      src={inventory.tenant_signature}
                      alt="Signature locataire"
                      className="max-h-24 border border-[var(--border)] rounded-xl"
                    />
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Signé le {new Date(inventory.tenant_signed_at).toLocaleString('fr-FR')}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">Non signé</p>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    ),

    meters: (
      <Card padding={true}>
        <h4 className="font-display font-medium text-[var(--text)] mb-4 flex items-center gap-2">
          <Gauge className="w-5 h-5 text-[var(--color-electric-blue)]" />
          Relevés des compteurs
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2 text-sm font-medium text-[var(--text-muted)]">Compteur</th>
                <th className="text-right py-2 text-sm font-medium text-[var(--text-muted)]">Relevé</th>
                {inventory.type === 'exit' && entryInventory && (
                  <>
                    <th className="text-right py-2 text-sm font-medium text-[var(--text-muted)]">Entrée</th>
                    <th className="text-right py-2 text-sm font-medium text-[var(--text-muted)]">Consommation</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {[
                { key: 'water_cold', label: 'Eau froide', unit: 'm³', field: 'meter_water_cold' },
                { key: 'water_hot', label: 'Eau chaude', unit: 'm³', field: 'meter_water_hot' },
                { key: 'electricity_hp', label: 'Électricité HP', unit: 'kWh', field: 'meter_electricity_hp' },
                { key: 'electricity_hc', label: 'Électricité HC', unit: 'kWh', field: 'meter_electricity_hc' },
                { key: 'gas', label: 'Gaz', unit: 'm³', field: 'meter_gas' }
              ].map(meter => {
                const currentValue = inventory[meter.field]
                const entryValue = entryInventory?.[meter.field]
                const consumption = currentValue && entryValue ? currentValue - entryValue : null

                if (!currentValue && !entryValue) return null

                return (
                  <tr key={meter.key} className="border-b border-[var(--border)]">
                    <td className="py-3 text-[var(--text)]">{meter.label}</td>
                    <td className="py-3 text-right font-medium text-[var(--text)]">
                      {currentValue ? `${currentValue.toLocaleString('fr-FR')} ${meter.unit}` : '-'}
                    </td>
                    {inventory.type === 'exit' && entryInventory && (
                      <>
                        <td className="py-3 text-right text-[var(--text-muted)]">
                          {entryValue ? `${entryValue.toLocaleString('fr-FR')} ${meter.unit}` : '-'}
                        </td>
                        <td className="py-3 text-right">
                          {consumption !== null ? (
                            <span className={consumption > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400'}>
                              {consumption > 0 ? '+' : ''}{consumption.toLocaleString('fr-FR')} {meter.unit}
                            </span>
                          ) : '-'}
                        </td>
                      </>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    ),

    keys: (
      <Card padding={true}>
        <h4 className="font-display font-medium text-[var(--text)] mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-[var(--color-electric-blue)]" />
          Inventaire des clés et accès
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2 text-sm font-medium text-[var(--text-muted)]">Type</th>
                <th className="text-center py-2 text-sm font-medium text-[var(--text-muted)]">Quantité</th>
                {inventory.type === 'exit' && entryInventory && (
                  <>
                    <th className="text-center py-2 text-sm font-medium text-[var(--text-muted)]">Entrée</th>
                    <th className="text-center py-2 text-sm font-medium text-[var(--text-muted)]">Différence</th>
                  </>
                )}
                <th className="text-left py-2 text-sm font-medium text-[var(--text-muted)]">Notes</th>
              </tr>
            </thead>
            <tbody>
              {inventory.keys_details?.filter(k => k.quantity > 0).map(key => {
                const keyInfo = KEY_TYPES[key.type]
                const entryKey = entryInventory?.keys_details?.find(k => k.type === key.type)
                const diff = entryKey ? key.quantity - entryKey.quantity : 0

                return (
                  <tr key={key.type} className="border-b border-[var(--border)]">
                    <td className="py-3 text-[var(--text)]">
                      <span className="mr-2">{keyInfo?.icon}</span>
                      {keyInfo?.label || key.type}
                    </td>
                    <td className="py-3 text-center font-medium text-[var(--text)]">{key.quantity}</td>
                    {inventory.type === 'exit' && entryInventory && (
                      <>
                        <td className="py-3 text-center text-[var(--text-muted)]">
                          {entryKey?.quantity || 0}
                        </td>
                        <td className="py-3 text-center">
                          {diff !== 0 && (
                            <span className={diff < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}>
                              {diff > 0 ? '+' : ''}{diff}
                            </span>
                          )}
                        </td>
                      </>
                    )}
                    <td className="py-3 text-sm text-[var(--text-muted)]">{key.notes}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    ),

    rooms: (
      <div className="space-y-4">
        {inventory.rooms?.map((room, index) => {
          const roomInfo = ROOM_TYPES[room.room_type]
          const entryRoom = entryInventory?.rooms?.find(r =>
            r.room_type === room.room_type && r.room_name === room.room_name
          )

          return (
            <Card key={room.id} padding={false}>
              {/* En-tête de la pièce */}
              <div className="p-4 border-b border-[var(--border)] bg-[var(--surface-elevated)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{roomInfo?.icon}</span>
                    <div>
                      <h4 className="font-display font-medium text-[var(--text)]">
                        {room.room_name || roomInfo?.label}
                      </h4>
                      <p className="text-sm text-[var(--text-muted)]">
                        {room.items?.length || 0} élément(s) inspecté(s)
                      </p>
                    </div>
                  </div>
                  {room.items?.some(i => i.is_degradation) && (
                    <Badge variant="danger">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Dégradations
                    </Badge>
                  )}
                </div>
              </div>

              {/* Éléments de la pièce */}
              <div className="p-4">
                {room.items?.length > 0 ? (
                  <div className="space-y-3">
                    {room.items.map(item => {
                      const categoryInfo = ELEMENT_CATEGORIES[item.category]
                      const entryItem = entryRoom?.items?.find(i =>
                        i.element_type === item.element_type && i.element_name === item.element_name
                      )

                      return (
                        <div key={item.id} className="flex items-start gap-4 p-3 bg-[var(--surface-elevated)] rounded-xl">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span>{categoryInfo?.icon}</span>
                              <span className="font-medium text-[var(--text)]">{item.element_name}</span>
                              {item.is_degradation && (
                                <Badge variant="danger" className="text-xs">Dégradation</Badge>
                              )}
                            </div>

                            {/* Note et comparaison */}
                            <div className="flex items-center gap-4">
                              {inventory.type === 'exit' && entryItem ? (
                                <RatingComparison
                                  entryRating={entryItem.rating}
                                  exitRating={item.rating}
                                />
                              ) : (
                                <RatingBadge rating={item.rating} />
                              )}

                              {item.material && (
                                <span className="text-sm text-[var(--text-muted)]">{item.material}</span>
                              )}
                            </div>

                            {/* Notes */}
                            {item.condition_notes && (
                              <p className="text-sm text-[var(--text-secondary)] mt-2">
                                {item.condition_notes}
                              </p>
                            )}

                            {/* Vétusté et coût si dégradation */}
                            {item.is_degradation && item.estimated_repair_cost && (
                              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-xl text-sm">
                                <div className="flex justify-between text-[var(--text)]">
                                  <span>Coût réparation estimé :</span>
                                  <span className="font-medium">
                                    {item.estimated_repair_cost?.toLocaleString('fr-FR')} €
                                  </span>
                                </div>
                                {item.vetuste_rate > 0 && (
                                  <div className="flex justify-between text-[var(--text-secondary)]">
                                    <span>Vétusté ({item.vetuste_rate}%) :</span>
                                    <span>
                                      -{(item.estimated_repair_cost * item.vetuste_rate / 100).toLocaleString('fr-FR')} €
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Photos */}
                          {item.photos?.length > 0 && (
                            <div className="flex gap-1">
                              {item.photos.slice(0, 3).map((photo, idx) => (
                                <img
                                  key={idx}
                                  src={photo.url}
                                  alt={photo.caption || `Photo ${idx + 1}`}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                              ))}
                              {item.photos.length > 3 && (
                                <div className="w-12 h-12 bg-[var(--surface-elevated)] rounded-lg flex items-center justify-center text-sm text-[var(--text-secondary)]">
                                  +{item.photos.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-[var(--text-muted)] text-center py-4">
                    Aucun élément inspecté dans cette pièce
                  </p>
                )}

                {/* Observations de la pièce */}
                {room.observations && (
                  <div className="mt-4 p-3 bg-[var(--color-electric-blue)]/10 rounded-xl">
                    <p className="text-sm text-[var(--color-electric-blue)]">
                      <strong>Observations :</strong> {room.observations}
                    </p>
                  </div>
                )}

                {/* Photos de la pièce */}
                {room.photos?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Photos de la pièce
                    </p>
                    <div className="flex gap-2 overflow-x-auto">
                      {room.photos.map((photo, idx) => (
                        <img
                          key={idx}
                          src={photo.url}
                          alt={photo.caption || `Photo ${idx + 1}`}
                          className="w-24 h-24 object-cover rounded-xl"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )
        })}

        {(!inventory.rooms || inventory.rooms.length === 0) && (
          <Card padding={true}>
            <div className="text-center py-8">
              <DoorOpen className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
              <p className="text-[var(--text-muted)]">Aucune pièce inspectée</p>
            </div>
          </Card>
        )}
      </div>
    ),

    comparison: inventory.type === 'exit' && entryInventory ? (
      <div className="space-y-6">
        {/* Résumé des différences */}
        <Card padding={true}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-display font-medium text-[var(--text)] flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-[var(--color-electric-blue)]" />
              Comparaison Entrée / Sortie
            </h4>
            {comparison && inventory.status === 'signed' && (
              <Button
                variant="primary"
                onClick={() => setDeductionsModalOpen(true)}
              >
                <Calculator className="w-4 h-4 mr-2" />
                Calculer les retenues
              </Button>
            )}
          </div>

          {comparison ? (
            <div className="space-y-4">
              {/* Stats globales - utilise les bonnes propriétés de compareInventories */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-[var(--surface-elevated)] rounded-xl">
                  <p className="text-2xl font-display font-bold text-[var(--text)]">
                    {comparison.differences?.length || 0}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Différences</p>
                </div>
                <div className="text-center p-3 bg-[var(--surface-elevated)] rounded-xl">
                  <p className="text-2xl font-display font-bold text-red-600 dark:text-red-400">
                    {comparison.differences?.reduce((sum, d) => sum + (d.repairCost || 0), 0).toLocaleString('fr-FR')} €
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Coût réparations</p>
                </div>
                <div className="text-center p-3 bg-[var(--surface-elevated)] rounded-xl">
                  <p className="text-2xl font-display font-bold text-orange-600 dark:text-orange-400">
                    {comparison.totalDeductions?.toLocaleString('fr-FR') || 0} €
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Retenues (après vétusté)</p>
                </div>
                <div className="text-center p-3 bg-[var(--surface-elevated)] rounded-xl">
                  <p className="text-2xl font-display font-bold text-emerald-600 dark:text-emerald-400">
                    {comparison.amountToReturn?.toLocaleString('fr-FR') || 0} €
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">À restituer</p>
                </div>
              </div>

              {/* Liste des dégradations */}
              {comparison.differences?.length > 0 ? (
                <div>
                  <h5 className="font-display font-medium text-[var(--text)] mb-3">
                    Détail des différences constatées
                  </h5>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[var(--border)] bg-[var(--surface-elevated)]">
                          <th className="text-left py-2 px-2 text-[var(--text-muted)]">Pièce</th>
                          <th className="text-left py-2 px-2 text-[var(--text-muted)]">Élément</th>
                          <th className="text-center py-2 px-2 text-[var(--text-muted)]">Entrée</th>
                          <th className="text-center py-2 px-2 text-[var(--text-muted)]">Sortie</th>
                          <th className="text-right py-2 px-2 text-[var(--text-muted)]">Coût</th>
                          <th className="text-right py-2 px-2 text-[var(--text-muted)]">Vétusté</th>
                          <th className="text-right py-2 px-2 text-[var(--text-muted)]">À charge</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparison.differences.map((diff, idx) => {
                          const vetusteAmount = diff.repairCost ? diff.repairCost * (diff.vetusteRate || 0) / 100 : 0
                          return (
                            <tr key={idx} className={`border-b border-[var(--border)] ${diff.isDegradation ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                              <td className="py-2 px-2 text-[var(--text)]">{diff.room}</td>
                              <td className="py-2 px-2 text-[var(--text)]">
                                {diff.element}
                                {diff.isDegradation && (
                                  <Badge variant="danger" className="ml-2 text-xs">Dégradation</Badge>
                                )}
                              </td>
                              <td className="py-2 px-2 text-center">
                                <RatingBadge rating={diff.entryRating} size="sm" />
                              </td>
                              <td className="py-2 px-2 text-center">
                                <RatingBadge rating={diff.exitRating} size="sm" />
                              </td>
                              <td className="py-2 px-2 text-right text-[var(--text)]">
                                {diff.repairCost?.toLocaleString('fr-FR') || '-'} €
                              </td>
                              <td className="py-2 px-2 text-right text-orange-600 dark:text-orange-400">
                                {diff.vetusteRate > 0 ? (
                                  <>-{vetusteAmount.toLocaleString('fr-FR')} € ({Math.round(diff.vetusteRate)}%)</>
                                ) : '-'}
                              </td>
                              <td className="py-2 px-2 text-right font-medium text-[var(--text)]">
                                {diff.tenantShare?.toLocaleString('fr-FR')} €
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-[var(--surface-elevated)] font-medium">
                          <td colSpan={4} className="py-2 px-2 text-right text-[var(--text)]">Total</td>
                          <td className="py-2 px-2 text-right text-[var(--text)]">
                            {comparison.differences.reduce((sum, d) => sum + (d.repairCost || 0), 0).toLocaleString('fr-FR')} €
                          </td>
                          <td className="py-2 px-2 text-right text-orange-600 dark:text-orange-400">
                            -{comparison.differences.reduce((sum, d) => sum + (d.repairCost || 0) * (d.vetusteRate || 0) / 100, 0).toLocaleString('fr-FR')} €
                          </td>
                          <td className="py-2 px-2 text-right text-red-600 dark:text-red-400">
                            {comparison.totalDeductions?.toLocaleString('fr-FR')} €
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                  <Check className="w-12 h-12 text-emerald-500 dark:text-emerald-400 mx-auto mb-3" />
                  <p className="text-emerald-700 dark:text-emerald-300 font-medium">Aucune différence notable</p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">
                    Le logement est rendu en bon état
                  </p>
                </div>
              )}

              {/* Retenues déjà enregistrées */}
              {inventory.deposit_deductions && (
                <Alert variant="success">
                  <Check className="w-4 h-4 inline mr-2" />
                  Retenues validées le {new Date(inventory.deposit_deductions.calculated_at).toLocaleDateString('fr-FR')} :
                  <strong className="ml-1">{inventory.deposit_deductions.total?.toLocaleString('fr-FR')} €</strong>
                </Alert>
              )}

              {/* Dépôt de garantie */}
              <Card padding={true}>
                <h5 className="font-display font-medium text-[var(--text)] mb-3 flex items-center gap-2">
                  <Euro className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Restitution du dépôt de garantie
                </h5>
                <div className="space-y-2">
                  <div className="flex justify-between text-[var(--text)]">
                    <span>Dépôt de garantie versé</span>
                    <span className="font-medium">
                      {comparison.depositAmount?.toLocaleString('fr-FR')} €
                    </span>
                  </div>
                  <div className="flex justify-between text-red-600 dark:text-red-400">
                    <span>Retenues calculées (après vétusté)</span>
                    <span>-{comparison.totalDeductions?.toLocaleString('fr-FR')} €</span>
                  </div>
                  <div className="border-t border-[var(--border)] pt-2 flex justify-between font-bold text-lg">
                    <span className="text-[var(--text)]">À restituer au locataire</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {comparison.amountToReturn?.toLocaleString('fr-FR')} €
                    </span>
                  </div>
                </div>

                {/* Bouton pour valider/modifier les retenues */}
                {inventory.status === 'signed' && (
                  <div className="mt-4 pt-4 border-t border-[var(--border)]">
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => setDeductionsModalOpen(true)}
                    >
                      <Calculator className="w-4 h-4 mr-2" />
                      {inventory.deposit_deductions ? 'Modifier les retenues' : 'Valider les retenues'}
                    </Button>
                    <p className="text-xs text-[var(--text-muted)] mt-2 text-center">
                      Vous pouvez ajuster les montants avant d'envoyer le décompte au locataire
                    </p>
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <p className="text-[var(--text-muted)]">
              Comparaison non disponible
            </p>
          )}
        </Card>
      </div>
    ) : (
      <Alert variant="info">
        La comparaison n'est disponible que pour les états des lieux de sortie.
      </Alert>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: <Home className="w-4 h-4" />, content: tabContent.overview },
    { id: 'meters', label: 'Compteurs', icon: <Gauge className="w-4 h-4" />, content: tabContent.meters },
    { id: 'keys', label: 'Clés', icon: <Key className="w-4 h-4" />, content: tabContent.keys },
    { id: 'rooms', label: 'Pièces', icon: <DoorOpen className="w-4 h-4" />, badge: String(inventory.rooms?.length || 0), content: tabContent.rooms }
  ]

  // Ajouter l'onglet comparaison si c'est une sortie
  if (inventory.type === 'exit') {
    tabs.push({
      id: 'comparison',
      label: 'Comparaison',
      icon: <ArrowRight className="w-4 h-4" />,
      content: tabContent.comparison
    })
  }

  return (
    <DashboardLayout title="État des lieux">
      <div className="space-y-6">
        {/* Fil d'Ariane */}
        <Breadcrumb
          items={[
            { label: 'Entités', href: '/entities' },
            { label: entity?.name, href: `/entities/${entity?.id}` },
            { label: property?.name, href: `/properties/${property?.id}` },
            { label: lot?.name, href: `/lots/${lot?.id}` },
            { label: 'États des lieux', href: '/inventories' },
            { label: INVENTORY_TYPES[inventory.type]?.label }
          ]}
        />

        {/* En-tête */}
        <Card padding={true}>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`
                p-3 rounded-xl
                ${inventory.type === 'entry' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}
              `}>
                <ClipboardList className={`
                  w-8 h-8
                  ${inventory.type === 'entry' ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400'}
                `} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-xl font-display font-bold text-[var(--text)]">
                    État des lieux {INVENTORY_TYPES[inventory.type]?.label.toLowerCase()}
                  </h1>
                  <Badge variant={inventory.type === 'entry' ? 'success' : 'warning'}>
                    {INVENTORY_TYPES[inventory.type]?.icon} {INVENTORY_TYPES[inventory.type]?.label}
                  </Badge>
                  {getStatusBadge(inventory.status)}
                </div>
                <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(inventory.inventory_date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Créé le {new Date(inventory.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {inventory.status === 'draft' && (
                <Button
                  variant="primary"
                  onClick={() => navigate(`/inventories/${id}/edit`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Continuer
                </Button>
              )}

              {inventory.status === 'signed' && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => handleDownloadPdf(false)}
                    disabled={downloadingPdf}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF simple
                  </Button>
                  {photoCount > 0 && (
                    <Button
                      variant="primary"
                      onClick={() => handleDownloadPdf(true)}
                      disabled={downloadingPdf}
                    >
                      {downloadingPdf ? (
                        <>
                          <span className="animate-spin mr-2">⟳</span>
                          {pdfProgress}
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 mr-2" />
                          PDF + Photos ({photoCount})
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}

              {inventory.status === 'draft' && (
                <Button
                  variant="danger"
                  onClick={() => setDeleteModalOpen(true)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Alerte si brouillon */}
        {inventory.status === 'draft' && (
          <Alert variant="warning">
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            Cet état des lieux est en brouillon. Il doit être complété et signé pour être valide.
          </Alert>
        )}

        {/* Lien vers l'EDL d'entrée si sortie */}
        {inventory.type === 'exit' && inventory.entry_inventory_id && (
          <Alert variant="info">
            <Link
              to={`/inventories/${inventory.entry_inventory_id}`}
              className="text-[var(--color-electric-blue)] hover:underline transition-colors"
            >
              Voir l'état des lieux d'entrée du{' '}
              {entryInventory && new Date(entryInventory.inventory_date).toLocaleDateString('fr-FR')}
            </Link>
          </Alert>
        )}

        {/* Contenu avec onglets */}
        <Tabs tabs={tabs} defaultTab="overview" />

        {/* Info légale */}
        <Alert variant="info">
          <strong>Conformité légale :</strong> Cet état des lieux est établi conformément
          au Décret n°2016-382 du 30 mars 2016 fixant les modalités d'établissement
          de l'état des lieux.
        </Alert>
      </div>

      {/* Modal de suppression */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Supprimer l'état des lieux"
        size="sm"
      >
        <p className="text-[var(--text-secondary)] mb-4">
          Êtes-vous sûr de vouloir supprimer cet état des lieux ?
          Cette action est irréversible.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => setDeleteModalOpen(false)}
          >
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Suppression...' : 'Supprimer'}
          </Button>
        </div>
      </Modal>

      {/* Modal de calcul des retenues sur dépôt */}
      {comparison && (
        <DepositDeductionsModal
          isOpen={deductionsModalOpen}
          onClose={() => setDeductionsModalOpen(false)}
          comparison={comparison}
          depositAmount={comparison.depositAmount}
          onSave={handleSaveDeductions}
          saving={savingDeductions}
          existingDeductions={inventory.deposit_deductions}
        />
      )}
    </DashboardLayout>
  )
}

export default InventoryDetail
