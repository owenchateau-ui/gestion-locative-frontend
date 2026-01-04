import { FileText, Download, Upload, Shield, Home, Calendar, Euro } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import Alert from '../ui/Alert'
import { DOCUMENT_TYPES } from '../../constants/tenantConstants'

// Section Documents
export function DocumentsSection({ documents = [], onUpload, onDownload, onDelete }) {
  const getDocumentLabel = (type) => {
    return DOCUMENT_TYPES[type]?.label || type
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B'
    const mb = bytes / (1024 * 1024)
    return mb > 1 ? `${mb.toFixed(2)} Mo` : `${(bytes / 1024).toFixed(2)} Ko`
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  return (
    <Card title="Documents" padding>
      {documents.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">Aucun document</p>
          <Button variant="primary" size="sm" onClick={onUpload}>
            <Upload className="w-4 h-4 mr-2" />
            Ajouter un document
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <FileText className="w-8 h-8 text-blue-500 flex-shrink-0" />
                  <button
                    onClick={() => onDownload?.(doc)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {getDocumentLabel(doc.document_type)}
                </p>
                <p className="text-xs text-gray-500 truncate mb-1">{doc.file_name}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{formatDate(doc.uploaded_at)}</span>
                  <span>{formatFileSize(doc.file_size)}</span>
                </div>
                {doc.is_shared && (
                  <Badge variant="info" className="mt-2 text-xs">Partagé</Badge>
                )}
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={onUpload}>
            <Upload className="w-4 h-4 mr-2" />
            Ajouter un document
          </Button>
        </>
      )}
    </Card>
  )
}

// Section Garanties
export function GuaranteesSection({ guarantees = [], onAdd, onEdit, onDelete }) {
  const calculateLevel = (guarantees) => {
    if (!guarantees || guarantees.length === 0) {
      return { level: 'none', label: 'Aucune garantie', color: 'red' }
    }

    const hasVisale = guarantees.some(g => g.guarantee_type === 'visale')
    const hasGLI = guarantees.some(g => g.guarantee_type === 'gli')
    const hasOrganism = guarantees.some(g =>
      ['garantme', 'cautioneo', 'smartgarant', 'unkle'].includes(g.guarantee_type)
    )

    if (hasVisale || hasGLI) {
      return { level: 'excellent', label: 'Garantie excellente', color: 'green' }
    }
    if (hasOrganism) {
      return { level: 'very_good', label: 'Très bonne garantie', color: 'green' }
    }
    return { level: 'good', label: 'Garantie présente', color: 'blue' }
  }

  const level = calculateLevel(guarantees)

  return (
    <Card title="Garanties" padding>
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-600">Niveau de garantie :</span>
          <Badge variant={level.color === 'green' ? 'success' : level.color === 'red' ? 'danger' : 'info'}>
            {level.label}
          </Badge>
        </div>
      </div>

      {guarantees.length === 0 ? (
        <Alert variant="warning" title="Attention">
          Aucune garantie enregistrée pour ce locataire.
        </Alert>
      ) : (
        <div className="space-y-3 mb-4">
          {guarantees.map((guarantee) => (
            <div
              key={guarantee.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {guarantee.guarantee_type === 'physical_person' && 'Garant physique'}
                    {guarantee.guarantee_type === 'visale' && 'Garantie Visale'}
                    {guarantee.guarantee_type === 'gli' && 'GLI'}
                    {['garantme', 'cautioneo', 'smartgarant', 'unkle'].includes(guarantee.guarantee_type) &&
                      guarantee.guarantee_type.charAt(0).toUpperCase() + guarantee.guarantee_type.slice(1)}
                  </p>
                  {guarantee.guarantee_type === 'physical_person' && (
                    <p className="text-sm text-gray-600 mt-1">
                      {guarantee.guarantor_first_name} {guarantee.guarantor_last_name}
                      {guarantee.guarantor_monthly_income > 0 && (
                        <span className="text-gray-500 ml-2">
                          ({new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(guarantee.guarantor_monthly_income)}/mois)
                        </span>
                      )}
                    </p>
                  )}
                  {guarantee.certificate_number && (
                    <p className="text-xs text-gray-500 mt-1">
                      N° {guarantee.certificate_number}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit?.(guarantee)}>
                    Modifier
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => onDelete?.(guarantee)}>
                    Supprimer
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button variant="primary" size="sm" onClick={onAdd}>
        <Shield className="w-4 h-4 mr-2" />
        Ajouter une garantie
      </Button>
    </Card>
  )
}

// Section Bail associé
export function LeaseSection({ lease }) {
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const formatCurrency = (amount) => {
    if (!amount) return '0 €'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  if (!lease) {
    return (
      <Card title="Bail" padding>
        <Alert variant="info">
          Aucun bail actif pour ce locataire
        </Alert>
      </Card>
    )
  }

  const isActive = lease.status === 'active'
  const totalRent = (parseFloat(lease.rent_amount) || 0) + (parseFloat(lease.charges_amount) || 0)

  return (
    <Card title="Bail associé" padding>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-gray-500" />
            <div>
              <p className="font-medium text-gray-900">{lease.lot?.name}</p>
              <p className="text-sm text-gray-500">{lease.lot?.properties_new?.name}</p>
            </div>
          </div>
          <Badge variant={isActive ? 'success' : 'default'}>
            {isActive ? 'Actif' : lease.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t pt-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Début du bail</p>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <p className="text-sm font-medium text-gray-900">
                {formatDate(lease.start_date)}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Fin du bail</p>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <p className="text-sm font-medium text-gray-900">
                {formatDate(lease.end_date)}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-gray-500 mb-2">Loyer mensuel</p>
          <div className="flex items-center gap-2">
            <Euro className="w-5 h-5 text-gray-400" />
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(totalRent)}
            </p>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
            <span>Loyer : {formatCurrency(lease.rent_amount)}</span>
            <span>Charges : {formatCurrency(lease.charges_amount)}</span>
          </div>
        </div>

        <Link to={`/leases/${lease.id}`}>
          <Button variant="outline" size="sm" className="w-full">
            Voir le bail complet
          </Button>
        </Link>
      </div>
    </Card>
  )
}

export default {
  DocumentsSection,
  GuaranteesSection,
  LeaseSection
}
