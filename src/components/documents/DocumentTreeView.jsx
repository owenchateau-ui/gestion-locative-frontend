import { useState, useEffect } from 'react'
import {
  ChevronRight,
  ChevronDown,
  Building2,
  Home,
  DoorOpen,
  FileText,
  Folder,
  FolderOpen,
  Eye,
  Download,
  Trash2,
  Users,
  User,
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Archive
} from 'lucide-react'
import Badge from '../ui/Badge'
import Modal from '../ui/Modal'
import { useToast } from '../../context/ToastContext'
import { supabase } from '../../lib/supabase'
import {
  getDocuments,
  deleteDocument,
  getDocumentUrl,
  downloadDocument,
  formatFileSize,
  DOCUMENT_CATEGORIES
} from '../../services/documentService'

/**
 * Solution 1 : Navigation hiérarchique TreeView
 * Entités → Propriétés → Lots → Groupes de locataires → Locataires → Documents
 */
function DocumentTreeView({ entityId = null }) {
  const [treeData, setTreeData] = useState([])
  const [expandedNodes, setExpandedNodes] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const { success, error: showError } = useToast()

  useEffect(() => {
    fetchTreeData()
  }, [entityId])

  const fetchTreeData = async () => {
    try {
      setLoading(true)

      // Récupérer les entités
      let entitiesQuery = supabase
        .from('entities')
        .select('id, name, entity_type')
        .order('name')

      if (entityId) {
        entitiesQuery = entitiesQuery.eq('id', entityId)
      }

      const { data: entities, error: entitiesError } = await entitiesQuery
      if (entitiesError) throw entitiesError

      // Pour chaque entité, récupérer propriétés, lots et documents
      const tree = await Promise.all(
        entities.map(async (entity) => {
          // Propriétés
          const { data: properties } = await supabase
            .from('properties_new')
            .select('id, name')
            .eq('entity_id', entity.id)
            .order('name')

          const propertiesWithLots = await Promise.all(
            (properties || []).map(async (property) => {
              // Lots
              const { data: lots } = await supabase
                .from('lots')
                .select('id, name, lot_type, status')
                .eq('property_id', property.id)
                .order('name')

              const lotsWithTenantGroups = await Promise.all(
                (lots || []).map(async (lot) => {
                  // Récupérer TOUS les documents du lot
                  const { data: allLotDocs } = await getDocuments({ lotId: lot.id })

                  // Récupérer les GROUPES DE LOCATAIRES ayant un bail actif sur ce lot
                  const { data: leases } = await supabase
                    .from('leases')
                    .select('tenant_group_id, status')
                    .eq('lot_id', lot.id)

                  console.log(`📋 Lot ${lot.name}:`, {
                    totalDocs: allLotDocs?.length || 0,
                    leases: leases?.length || 0,
                    activesLeases: leases?.filter(l => l.status === 'active').length || 0
                  })

                  // Filtrer uniquement les baux actifs
                  const activeLeases = leases?.filter(l => l.status === 'active') || []

                  // DEBUG: Afficher les détails des baux actifs
                  if (activeLeases.length > 0) {
                    console.log(`🔍 Détails baux actifs pour ${lot.name}:`, activeLeases.map(l => ({
                      tenant_group_id: l.tenant_group_id,
                      status: l.status
                    })))
                  }

                  const tenantGroupIds = [...new Set(activeLeases.map(l => l.tenant_group_id).filter(Boolean))] || []

                  console.log(`👥 Groupes de locataires trouvés pour ${lot.name}:`, tenantGroupIds)

                  const tenantGroupsWithData = await Promise.all(
                    tenantGroupIds.map(async (groupId) => {
                      // Récupérer les infos du groupe
                      const { data: group, error: groupError } = await supabase
                        .from('tenant_groups')
                        .select('id, group_type')
                        .eq('id', groupId)
                        .single()

                      if (groupError) {
                        console.error(`❌ Erreur récupération groupe ${groupId}:`, groupError)
                        return null
                      }

                      if (!group) {
                        console.warn(`⚠️ Groupe ${groupId} non trouvé`)
                        return null
                      }

                      console.log(`✅ Groupe trouvé:`, group)

                      // Documents du GROUPE
                      const { data: groupDocuments } = await getDocuments({ tenantGroupId: group.id })
                      console.log(`📄 Documents du groupe ${group.id}:`, groupDocuments?.length || 0)

                      // Récupérer les LOCATAIRES du groupe
                      const { data: tenants } = await supabase
                        .from('tenants')
                        .select('id, first_name, last_name')
                        .eq('tenant_group_id', group.id)
                        .order('first_name')

                      console.log(`👤 Locataires du groupe ${group.id}:`, tenants?.length || 0)

                      const tenantsWithDocuments = await Promise.all(
                        (tenants || []).map(async (tenant) => {
                          // Documents du LOCATAIRE individuel
                          const { data: tenantDocuments } = await getDocuments({ tenantId: tenant.id })

                          return {
                            ...tenant,
                            documents: tenantDocuments || [],
                            documentCount: (tenantDocuments || []).length
                          }
                        })
                      )

                      const totalDocCount =
                        (groupDocuments || []).length +
                        tenantsWithDocuments.reduce((sum, t) => sum + t.documentCount, 0)

                      console.log(`📊 Total documents groupe ${group.id}:`, totalDocCount)

                      return {
                        ...group,
                        tenants: tenantsWithDocuments,
                        groupDocuments: groupDocuments || [],
                        documentCount: totalDocCount
                      }
                    })
                  )

                  // Filtrer les null
                  const validTenantGroups = tenantGroupsWithData.filter(Boolean)

                  // Séparer les documents par catégorie
                  // 1. Documents du LOT uniquement (sans tenant_group_id ni candidate_id)
                  const lotDocuments = (allLotDocs || []).filter(
                    doc => !doc.tenant_group_id && !doc.candidate_id
                  )

                  // 2. Documents des CANDIDATS - Récupérer les candidats avec leurs informations
                  const { data: candidatesData } = await supabase
                    .from('candidates')
                    .select('id, first_name, last_name, email, status, created_at')
                    .eq('lot_id', lot.id)
                    .order('created_at', { ascending: false })

                  // Pour chaque candidat, récupérer ses documents
                  const candidatesWithDocuments = await Promise.all(
                    (candidatesData || []).map(async (candidate) => {
                      const { data: candidateDocs } = await supabase
                        .from('documents')
                        .select('*')
                        .eq('candidate_id', candidate.id)

                      return {
                        ...candidate,
                        documents: candidateDocs || [],
                        documentCount: (candidateDocs || []).length
                      }
                    })
                  )

                  // Calculer le total des documents candidats
                  const totalCandidateDocuments = candidatesWithDocuments.reduce(
                    (sum, c) => sum + c.documentCount, 0
                  )

                  console.log(`📄 Répartition documents pour ${lot.name}:`, {
                    lotDocuments: lotDocuments.length,
                    candidateDocuments: totalCandidateDocuments,
                    candidatesCount: candidatesWithDocuments.length,
                    tenantGroupDocuments: (allLotDocs || []).filter(doc => doc.tenant_group_id !== null).length
                  })

                  const totalDocCount =
                    lotDocuments.length +
                    totalCandidateDocuments +
                    validTenantGroups.reduce((sum, tg) => sum + tg.documentCount, 0)

                  return {
                    ...lot,
                    tenantGroups: validTenantGroups,
                    lotDocuments,
                    candidates: candidatesWithDocuments,
                    candidateCount: candidatesWithDocuments.length,
                    documentCount: totalDocCount
                  }
                })
              )

              return {
                ...property,
                lots: lotsWithTenantGroups,
                lotCount: lotsWithTenantGroups.length,
                documentCount: lotsWithTenantGroups.reduce((sum, lot) => sum + lot.documentCount, 0)
              }
            })
          )

          return {
            ...entity,
            properties: propertiesWithLots,
            propertyCount: propertiesWithLots.length,
            documentCount: propertiesWithLots.reduce((sum, prop) => sum + prop.documentCount, 0)
          }
        })
      )

      setTreeData(tree)
    } catch (err) {
      console.error('Erreur chargement arborescence:', err)
      showError('Erreur lors du chargement de l\'arborescence')
    } finally {
      setLoading(false)
    }
  }

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const handleDelete = async (doc, e) => {
    e.stopPropagation()
    if (!window.confirm(`Supprimer le document "${doc.file_name}" ?`)) return

    try {
      const { error } = await deleteDocument(doc.id)
      if (error) throw error

      success('Document supprimé')
      fetchTreeData()
    } catch (err) {
      showError('Erreur lors de la suppression')
    }
  }

  const handlePreview = (doc, e) => {
    e.stopPropagation()
    setSelectedDocument(doc)
    setPreviewModalOpen(true)
  }

  const handleDownload = async (doc, e) => {
    e.stopPropagation()
    try {
      const { error } = await downloadDocument(doc.file_path, doc.file_name)
      if (error) throw error
      success('Téléchargement démarré')
    } catch (err) {
      showError('Erreur lors du téléchargement')
    }
  }

  const renderPreview = () => {
    if (!selectedDocument) return null

    const url = getDocumentUrl(selectedDocument.file_path)
    const isImage = selectedDocument.file_type?.startsWith('image/')
    const isPdf = selectedDocument.file_type === 'application/pdf'

    return (
      <div className="space-y-4">
        <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
          <h4 className="font-semibold font-display text-[var(--text)] mb-2">
            {selectedDocument.title || selectedDocument.file_name}
          </h4>
          <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
            <Badge variant="info">{DOCUMENT_CATEGORIES[selectedDocument.category]}</Badge>
            <span>{formatFileSize(selectedDocument.file_size)}</span>
            <span>
              {new Date(selectedDocument.uploaded_at).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>

        <div className="bg-[var(--surface-elevated)] rounded-xl p-4 flex items-center justify-center min-h-[400px]">
          {isImage && (
            <img
              src={url}
              alt={selectedDocument.file_name}
              className="max-w-full max-h-[600px] object-contain rounded-xl"
            />
          )}
          {isPdf && (
            <iframe
              src={url}
              className="w-full h-[600px] rounded-xl"
              title={selectedDocument.file_name}
            />
          )}
          {!isImage && !isPdf && (
            <div className="text-center">
              <FileText className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
              <p className="text-[var(--text-secondary)]">Aperçu non disponible</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-12 bg-[var(--surface-elevated)] rounded-xl"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {treeData.map(entity => (
        <EntityNode
          key={entity.id}
          entity={entity}
          expanded={expandedNodes}
          onToggle={toggleNode}
          onPreview={handlePreview}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      ))}

      {treeData.length === 0 && (
        <div className="text-center py-12 text-[var(--text-muted)]">
          <Folder className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
          <p>Aucune entité avec des documents</p>
        </div>
      )}

      <Modal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title="Aperçu du document"
        size="xl"
      >
        {renderPreview()}
      </Modal>
    </div>
  )
}

// Noeud Entité
function EntityNode({ entity, expanded, onToggle, onPreview, onDownload, onDelete }) {
  const nodeId = `entity-${entity.id}`
  const isExpanded = expanded.has(nodeId)

  return (
    <div>
      <button
        onClick={() => onToggle(nodeId)}
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-[var(--surface-elevated)] rounded-xl transition-colors text-left"
      >
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
        ) : (
          <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
        )}
        {isExpanded ? (
          <FolderOpen className="w-5 h-5 text-[var(--color-electric-blue)]" />
        ) : (
          <Folder className="w-5 h-5 text-[var(--color-electric-blue)]" />
        )}
        <span className="font-medium font-display text-[var(--text)]">{entity.name}</span>
        <Badge variant="default" className="ml-auto">
          {entity.documentCount} doc{entity.documentCount > 1 ? 's' : ''}
        </Badge>
      </button>

      {isExpanded && (
        <div className="ml-6 pl-4 border-l-2 border-[var(--border)] space-y-1">
          {entity.properties.map(property => (
            <PropertyNode
              key={property.id}
              property={property}
              expanded={expanded}
              onToggle={onToggle}
              onPreview={onPreview}
              onDownload={onDownload}
              onDelete={onDelete}
            />
          ))}
          {entity.properties.length === 0 && (
            <p className="text-sm text-[var(--text-muted)] italic px-4 py-2">Aucune propriété</p>
          )}
        </div>
      )}
    </div>
  )
}

// Noeud Propriété
function PropertyNode({ property, expanded, onToggle, onPreview, onDownload, onDelete }) {
  const nodeId = `property-${property.id}`
  const isExpanded = expanded.has(nodeId)

  return (
    <div>
      <button
        onClick={() => onToggle(nodeId)}
        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-[var(--surface-elevated)] rounded-xl transition-colors text-left"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
        ) : (
          <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
        )}
        <Home className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
        <span className="text-[var(--text)]">{property.name}</span>
        <Badge variant="default" className="ml-auto text-xs">
          {property.documentCount} doc{property.documentCount > 1 ? 's' : ''}
        </Badge>
      </button>

      {isExpanded && (
        <div className="ml-6 pl-4 border-l-2 border-[var(--border)] space-y-1">
          {property.lots.map(lot => (
            <LotNode
              key={lot.id}
              lot={lot}
              expanded={expanded}
              onToggle={onToggle}
              onPreview={onPreview}
              onDownload={onDownload}
              onDelete={onDelete}
            />
          ))}
          {property.lots.length === 0 && (
            <p className="text-sm text-[var(--text-muted)] italic px-4 py-2">Aucun lot</p>
          )}
        </div>
      )}
    </div>
  )
}

// Noeud Lot
function LotNode({ lot, expanded, onToggle, onPreview, onDownload, onDelete }) {
  const nodeId = `lot-${lot.id}`
  const isExpanded = expanded.has(nodeId)

  return (
    <div>
      <button
        onClick={() => onToggle(nodeId)}
        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-[var(--surface-elevated)] rounded-xl transition-colors text-left"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
        ) : (
          <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
        )}
        <DoorOpen className="w-4 h-4 text-[var(--color-purple)]" />
        <span className="text-[var(--text-secondary)] text-sm">{lot.name}</span>
        <Badge variant="default" className="ml-auto text-xs">
          {lot.documentCount} doc{lot.documentCount > 1 ? 's' : ''}
        </Badge>
      </button>

      {isExpanded && (
        <div className="ml-6 pl-4 border-l-2 border-[var(--border)] space-y-1">
          {/* Documents du lot (sans locataire) */}
          {lot.lotDocuments && lot.lotDocuments.map(doc => (
            <DocumentNode
              key={doc.id}
              document={doc}
              onPreview={onPreview}
              onDownload={onDownload}
              onDelete={onDelete}
              label="Document du lot"
            />
          ))}

          {/* Groupes de locataires */}
          {lot.tenantGroups && lot.tenantGroups.map(group => (
            <TenantGroupNode
              key={group.id}
              group={group}
              expanded={expanded}
              onToggle={onToggle}
              onPreview={onPreview}
              onDownload={onDownload}
              onDelete={onDelete}
            />
          ))}

          {/* Candidats avec leurs documents */}
          {lot.candidates && lot.candidates.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center gap-2 px-4 py-1 text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wide">
                <UserPlus className="w-3 h-3" />
                Candidatures ({lot.candidateCount})
              </div>
              {lot.candidates.map(candidate => (
                <CandidateNode
                  key={candidate.id}
                  candidate={candidate}
                  expanded={expanded}
                  onToggle={onToggle}
                  onPreview={onPreview}
                  onDownload={onDownload}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}

          {lot.documentCount === 0 && (
            <p className="text-sm text-[var(--text-muted)] italic px-4 py-2">Aucun document</p>
          )}
        </div>
      )}
    </div>
  )
}

// Noeud Groupe de locataires
function TenantGroupNode({ group, expanded, onToggle, onPreview, onDownload, onDelete }) {
  const nodeId = `tenant-group-${group.id}`
  const isExpanded = expanded.has(nodeId)

  const groupIcon = {
    individual: <User className="w-4 h-4 text-[var(--color-purple)]" />,
    couple: <Users className="w-4 h-4 text-[var(--color-purple)]" />,
    colocation: <Users className="w-4 h-4 text-[var(--color-purple)]" />
  }

  return (
    <div>
      <button
        onClick={() => onToggle(nodeId)}
        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-[var(--surface-elevated)] rounded-xl transition-colors text-left"
      >
        {isExpanded ? (
          <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
        ) : (
          <ChevronRight className="w-3 h-3 text-[var(--text-muted)]" />
        )}
        {groupIcon[group.group_type] || <Users className="w-4 h-4 text-[var(--color-purple)]" />}
        <span className="text-[var(--text-secondary)] text-sm font-medium">
          {group.group_type === 'individual' ? 'Locataire' : group.group_type === 'couple' ? 'Couple' : 'Colocation'}
        </span>
        <Badge variant="default" className="ml-auto text-xs">
          {group.documentCount} doc{group.documentCount > 1 ? 's' : ''}
        </Badge>
      </button>

      {isExpanded && (
        <div className="ml-6 pl-4 border-l-2 border-[var(--border)] space-y-1">
          {/* Documents du groupe */}
          {group.groupDocuments && group.groupDocuments.map(doc => (
            <DocumentNode
              key={doc.id}
              document={doc}
              onPreview={onPreview}
              onDownload={onDownload}
              onDelete={onDelete}
              label="Document du groupe"
            />
          ))}

          {/* Locataires individuels */}
          {group.tenants && group.tenants.map(tenant => (
            <TenantNode
              key={tenant.id}
              tenant={tenant}
              expanded={expanded}
              onToggle={onToggle}
              onPreview={onPreview}
              onDownload={onDownload}
              onDelete={onDelete}
            />
          ))}

          {group.documentCount === 0 && (
            <p className="text-sm text-[var(--text-muted)] italic px-4 py-2">Aucun document</p>
          )}
        </div>
      )}
    </div>
  )
}

// Noeud Locataire individuel
function TenantNode({ tenant, expanded, onToggle, onPreview, onDownload, onDelete }) {
  const nodeId = `tenant-${tenant.id}`
  const isExpanded = expanded.has(nodeId)

  return (
    <div>
      <button
        onClick={() => onToggle(nodeId)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[var(--surface-elevated)] rounded-xl transition-colors text-left"
      >
        {isExpanded ? (
          <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
        ) : (
          <ChevronRight className="w-3 h-3 text-[var(--text-muted)]" />
        )}
        <User className="w-3 h-3 text-[var(--text-muted)]" />
        <span className="text-[var(--text-secondary)] text-sm">
          {tenant.first_name} {tenant.last_name}
        </span>
        <Badge variant="default" className="ml-auto text-xs">
          {tenant.documentCount} doc{tenant.documentCount > 1 ? 's' : ''}
        </Badge>
      </button>

      {isExpanded && (
        <div className="ml-6 pl-4 border-l-2 border-[var(--border)] space-y-1">
          {tenant.documents.map(doc => (
            <DocumentNode
              key={doc.id}
              document={doc}
              onPreview={onPreview}
              onDownload={onDownload}
              onDelete={onDelete}
            />
          ))}
          {tenant.documents.length === 0 && (
            <p className="text-sm text-[var(--text-muted)] italic px-3 py-2">Aucun document</p>
          )}
        </div>
      )}
    </div>
  )
}

// Noeud Candidat
function CandidateNode({ candidate, expanded, onToggle, onPreview, onDownload, onDelete }) {
  const nodeId = `candidate-${candidate.id}`
  const isExpanded = expanded.has(nodeId)

  // Icône et couleur selon le statut
  const getStatusConfig = (status) => {
    switch (status) {
      case 'submitted':
        return { icon: <Clock className="w-3 h-3" />, variant: 'info', label: 'En attente' }
      case 'reviewing':
        return { icon: <AlertCircle className="w-3 h-3" />, variant: 'warning', label: 'En cours' }
      case 'accepted':
        return { icon: <CheckCircle className="w-3 h-3" />, variant: 'success', label: 'Accepté' }
      case 'rejected':
        return { icon: <XCircle className="w-3 h-3" />, variant: 'danger', label: 'Refusé' }
      case 'archived':
        return { icon: <Archive className="w-3 h-3" />, variant: 'default', label: 'Archivé' }
      default:
        return { icon: <UserPlus className="w-3 h-3" />, variant: 'default', label: 'Candidat' }
    }
  }

  const statusConfig = getStatusConfig(candidate.status)
  const candidateName = `${candidate.first_name} ${candidate.last_name}`
  const createdDate = new Date(candidate.created_at).toLocaleDateString('fr-FR')

  return (
    <div>
      <button
        onClick={() => onToggle(nodeId)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-amber-500/10 rounded-xl transition-colors text-left"
      >
        {isExpanded ? (
          <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
        ) : (
          <ChevronRight className="w-3 h-3 text-[var(--text-muted)]" />
        )}
        <UserPlus className="w-4 h-4 text-amber-500 dark:text-amber-400" />
        <div className="flex-1 min-w-0">
          <span className="text-[var(--text-secondary)] text-sm font-medium truncate">
            {candidateName}
          </span>
          <span className="text-[var(--text-muted)] text-xs ml-2">
            ({createdDate})
          </span>
        </div>
        <Badge variant={statusConfig.variant} className="text-xs flex items-center gap-1">
          {statusConfig.icon}
          <span>{statusConfig.label}</span>
        </Badge>
        <Badge variant="default" className="ml-1 text-xs">
          {candidate.documentCount} doc{candidate.documentCount > 1 ? 's' : ''}
        </Badge>
      </button>

      {isExpanded && (
        <div className="ml-6 pl-4 border-l-2 border-amber-500/30 space-y-1">
          {candidate.documents.map(doc => (
            <DocumentNode
              key={doc.id}
              document={doc}
              onPreview={onPreview}
              onDownload={onDownload}
              onDelete={onDelete}
              label="Pièce candidature"
            />
          ))}
          {candidate.documents.length === 0 && (
            <p className="text-sm text-[var(--text-muted)] italic px-3 py-2">Aucun document</p>
          )}
        </div>
      )}
    </div>
  )
}

// Noeud Document
function DocumentNode({ document, onPreview, onDownload, onDelete, label = null }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--color-electric-blue)]/10 rounded-xl transition-colors group">
      <FileText className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--text-secondary)] truncate">
          {document.title || document.file_name}
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          {label && <span className="text-[var(--color-purple)] font-medium">{label} • </span>}
          {DOCUMENT_CATEGORIES[document.category]} • {formatFileSize(document.file_size)}
        </p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => onPreview(document, e)}
          className="p-1 text-[var(--color-electric-blue)] hover:bg-[var(--color-electric-blue)]/20 rounded-xl"
          title="Voir"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => onDownload(document, e)}
          className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-xl"
          title="Télécharger"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => onDelete(document, e)}
          className="p-1 text-red-600 dark:text-red-400 hover:bg-red-500/20 rounded-xl"
          title="Supprimer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default DocumentTreeView
