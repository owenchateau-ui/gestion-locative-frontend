/**
 * Export centralisé des services
 *
 * Usage:
 * import { fetchEntities, createEntity } from '../services'
 * ou
 * import * as entityService from '../services/entityService'
 */

// Services de gestion du patrimoine
export * from './entityService'
export * from './propertyService'
export * from './lotService'

// Services de gestion locative
export * from './tenantGroupService'
export * from './leaseService'
export * from './guaranteeService'

// Services financiers
export * from './paymentService'
export * from './irlService'
export * from './chargeReconciliationService'

// Services de documents
export * from './documentService'
export * from './leaseDocumentService'
export * from './inventoryService'
export * from './diagnosticService'

// Services de candidatures
export * from './candidateService'
