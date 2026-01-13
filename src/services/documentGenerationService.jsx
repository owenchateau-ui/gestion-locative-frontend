import { supabase } from '../lib/supabase'

/**
 * CODE SPLITTING: Le PDF renderer ET les templates sont chargés dynamiquement
 * pour réduire la taille du bundle initial (1.75MB → chargé uniquement à la demande)
 */

// Cache du module PDF pour éviter de le recharger à chaque appel
let pdfModule = null

/**
 * Import dynamique de @react-pdf/renderer
 * Le module est mis en cache après le premier chargement
 */
const getPdf = async () => {
  if (!pdfModule) {
    pdfModule = await import('@react-pdf/renderer')
  }
  return pdfModule.pdf
}

/**
 * Service de génération de documents PDF
 *
 * Ce service permet de générer et télécharger des documents PDF légaux
 * conformes à la législation française.
 */

// =====================================================
// QUITTANCE DE LOYER
// =====================================================

/**
 * Génère une quittance de loyer au format PDF
 *
 * @param {string} paymentId - ID du paiement pour lequel générer la quittance
 * @returns {Promise<{blob: Blob, filename: string, data: Object}>}
 */
export const generateQuittance = async (paymentId) => {
  try {
    // Dynamic import pour code splitting
    const { default: QuittanceLoyer, prepareQuittanceData } = await import('../components/pdf/templates/QuittanceLoyer')

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        *,
        lease:leases(
          *,
          lot:lots(
            *,
            property:properties_new(
              *,
              entity:entities(*)
            )
          ),
          tenant:tenants(
            *,
            tenant_groups:tenant_groups!group_id(*)
          )
        )
      `)
      .eq('id', paymentId)
      .single()

    if (paymentError) throw paymentError
    if (!payment) throw new Error('Paiement non trouvé')

    const lease = payment.lease
    const lot = lease.lot
    const property = lot.property
    const entity = property.entity
    const tenant = lease.tenant

    const quittanceData = prepareQuittanceData(
      payment,
      lease,
      entity,
      tenant,
      lot,
      property
    )

    const pdf = await getPdf()
    const pdfBlob = await pdf(<QuittanceLoyer data={quittanceData} />).toBlob()

    return {
      blob: pdfBlob,
      filename: generateFilename('quittance', quittanceData.paiement.periode),
      data: quittanceData
    }
  } catch (error) {
    console.error('Erreur génération quittance:', error)
    throw new Error(`Impossible de générer la quittance : ${error.message}`)
  }
}

/**
 * Génère et télécharge directement une quittance
 */
export const downloadQuittance = async (paymentId) => {
  const result = await generateQuittance(paymentId)
  downloadPDF(result.blob, result.filename)
  return result
}

/**
 * Génère une quittance et l'ouvre en prévisualisation
 */
export const previewQuittance = async (paymentId) => {
  const result = await generateQuittance(paymentId)
  previewPDF(result.blob)
  return result
}

// =====================================================
// ATTESTATION CAF
// =====================================================

/**
 * Génère une attestation de loyer pour la CAF
 *
 * @param {string} leaseId - ID du bail
 * @returns {Promise<{blob: Blob, filename: string, data: Object}>}
 */
export const generateAttestationCAF = async (leaseId) => {
  try {
    // Dynamic import pour code splitting
    const { default: AttestationCAF, prepareAttestationCAFData } = await import('../components/pdf/templates/AttestationCAF')

    const { data: lease, error: leaseError } = await supabase
      .from('leases')
      .select(`
        *,
        lot:lots(
          *,
          property:properties_new(
            *,
            entity:entities(*)
          )
        ),
        tenant_group:tenant_groups(*)
      `)
      .eq('id', leaseId)
      .single()

    if (leaseError) throw leaseError
    if (!lease) throw new Error('Bail non trouvé')

    const lot = lease.lot
    const property = lot.property
    const entity = property.entity
    const tenantGroup = lease.tenant_group

    const attestationData = prepareAttestationCAFData(
      lease,
      entity,
      tenantGroup,
      lot,
      property
    )

    const pdf = await getPdf()
    const pdfBlob = await pdf(<AttestationCAF data={attestationData} />).toBlob()

    return {
      blob: pdfBlob,
      filename: generateFilename('attestation_caf', tenantGroup.name),
      data: attestationData
    }
  } catch (error) {
    console.error('Erreur génération attestation CAF:', error)
    throw new Error(`Impossible de générer l'attestation CAF : ${error.message}`)
  }
}

/**
 * Génère et télécharge directement une attestation CAF
 */
export const downloadAttestationCAF = async (leaseId) => {
  const result = await generateAttestationCAF(leaseId)
  downloadPDF(result.blob, result.filename)
  return result
}

/**
 * Génère une attestation CAF et l'ouvre en prévisualisation
 */
export const previewAttestationCAF = async (leaseId) => {
  const result = await generateAttestationCAF(leaseId)
  previewPDF(result.blob)
  return result
}

// =====================================================
// LETTRE D'INDEXATION IRL
// =====================================================

/**
 * Génère une lettre d'indexation IRL
 *
 * @param {string} leaseId - ID du bail
 * @param {Object} indexationData - Données de l'indexation
 * @param {number} indexationData.old_rent - Ancien loyer
 * @param {number} indexationData.new_rent - Nouveau loyer
 * @param {number} indexationData.old_irl_value - Ancienne valeur IRL
 * @param {number} indexationData.new_irl_value - Nouvelle valeur IRL
 * @param {string} indexationData.old_irl_quarter - Ancien trimestre IRL (ex: "T2 2024")
 * @param {string} indexationData.new_irl_quarter - Nouveau trimestre IRL (ex: "T2 2025")
 * @param {string} indexationData.effective_date - Date d'effet
 * @returns {Promise<{blob: Blob, filename: string, data: Object}>}
 */
export const generateLettreIndexation = async (leaseId, indexationData) => {
  try {
    // Dynamic import pour code splitting
    const { default: LettreIndexation, prepareLettreIndexationData } = await import('../components/pdf/templates/LettreIndexation')

    const { data: lease, error: leaseError } = await supabase
      .from('leases')
      .select(`
        *,
        lot:lots(
          *,
          property:properties_new(
            *,
            entity:entities(*)
          )
        ),
        tenant_group:tenant_groups(*)
      `)
      .eq('id', leaseId)
      .single()

    if (leaseError) throw leaseError
    if (!lease) throw new Error('Bail non trouvé')

    const lot = lease.lot
    const property = lot.property
    const entity = property.entity
    const tenantGroup = lease.tenant_group

    const lettreData = prepareLettreIndexationData(
      lease,
      entity,
      tenantGroup,
      lot,
      property,
      indexationData
    )

    const pdf = await getPdf()
    const pdfBlob = await pdf(<LettreIndexation data={lettreData} />).toBlob()

    const periodLabel = `${indexationData.new_irl_quarter || 'indexation'}`

    return {
      blob: pdfBlob,
      filename: generateFilename('lettre_indexation', periodLabel),
      data: lettreData
    }
  } catch (error) {
    console.error('Erreur génération lettre indexation:', error)
    throw new Error(`Impossible de générer la lettre d'indexation : ${error.message}`)
  }
}

/**
 * Génère et télécharge directement une lettre d'indexation
 */
export const downloadLettreIndexation = async (leaseId, indexationData) => {
  const result = await generateLettreIndexation(leaseId, indexationData)
  downloadPDF(result.blob, result.filename)
  return result
}

/**
 * Génère une lettre d'indexation et l'ouvre en prévisualisation
 */
export const previewLettreIndexation = async (leaseId, indexationData) => {
  const result = await generateLettreIndexation(leaseId, indexationData)
  previewPDF(result.blob)
  return result
}

// =====================================================
// AVIS D'ÉCHÉANCE (APPEL DE LOYER)
// =====================================================

/**
 * Génère un avis d'échéance (appel de loyer)
 *
 * @param {string} leaseId - ID du bail
 * @param {string|null} month - Mois cible (format ISO), null = mois suivant
 * @returns {Promise<{blob: Blob, filename: string, data: Object}>}
 */
export const generateAvisEcheance = async (leaseId, month = null) => {
  try {
    // Dynamic import pour code splitting
    const { default: AvisEcheance, prepareAvisEcheanceData } = await import('../components/pdf/templates/AvisEcheance')

    const { data: lease, error: leaseError } = await supabase
      .from('leases')
      .select(`
        *,
        lot:lots(
          *,
          property:properties_new(
            *,
            entity:entities(*)
          )
        ),
        tenant_group:tenant_groups(*)
      `)
      .eq('id', leaseId)
      .single()

    if (leaseError) throw leaseError
    if (!lease) throw new Error('Bail non trouvé')

    const lot = lease.lot
    const property = lot.property
    const entity = property.entity
    const tenantGroup = lease.tenant_group

    const avisData = prepareAvisEcheanceData(
      lease,
      entity,
      tenantGroup,
      lot,
      property,
      month
    )

    const pdf = await getPdf()
    const pdfBlob = await pdf(<AvisEcheance data={avisData} />).toBlob()

    return {
      blob: pdfBlob,
      filename: generateFilename('avis_echeance', avisData.echeance.periode),
      data: avisData
    }
  } catch (error) {
    console.error('Erreur génération avis échéance:', error)
    throw new Error(`Impossible de générer l'avis d'échéance : ${error.message}`)
  }
}

/**
 * Génère et télécharge directement un avis d'échéance
 */
export const downloadAvisEcheance = async (leaseId, month = null) => {
  const result = await generateAvisEcheance(leaseId, month)
  downloadPDF(result.blob, result.filename)
  return result
}

/**
 * Génère un avis d'échéance et l'ouvre en prévisualisation
 */
export const previewAvisEcheance = async (leaseId, month = null) => {
  const result = await generateAvisEcheance(leaseId, month)
  previewPDF(result.blob)
  return result
}

// =====================================================
// MISE EN DEMEURE
// =====================================================

/**
 * Génère une mise en demeure de payer
 *
 * @param {string} leaseId - ID du bail
 * @param {Array} unpaidPaymentIds - IDs des paiements impayés à inclure
 * @param {Object} options - Options personnalisables
 * @param {number} options.joursDelai - Délai de régularisation en jours (défaut: 8, minimum légal: 8)
 * @returns {Promise<{blob: Blob, filename: string, data: Object}>}
 */
export const generateMiseEnDemeure = async (leaseId, unpaidPaymentIds = [], options = {}) => {
  try {
    // Dynamic import pour code splitting
    const { default: MiseEnDemeure, prepareMiseEnDemeureData } = await import('../components/pdf/templates/MiseEnDemeure')

    // Récupérer le bail et ses relations
    const { data: lease, error: leaseError } = await supabase
      .from('leases')
      .select(`
        *,
        lot:lots(
          *,
          property:properties_new(
            *,
            entity:entities(*)
          )
        ),
        tenant_group:tenant_groups(*)
      `)
      .eq('id', leaseId)
      .single()

    if (leaseError) throw leaseError
    if (!lease) throw new Error('Bail non trouvé')

    // Récupérer les paiements impayés
    let query = supabase
      .from('payments')
      .select('*')
      .eq('lease_id', leaseId)
      .in('status', ['pending', 'partial', 'late'])

    if (unpaidPaymentIds.length > 0) {
      query = query.in('id', unpaidPaymentIds)
    }

    const { data: unpaidPayments, error: paymentsError } = await query

    if (paymentsError) throw paymentsError
    if (!unpaidPayments || unpaidPayments.length === 0) {
      throw new Error('Aucun paiement impayé trouvé pour ce bail')
    }

    const lot = lease.lot
    const property = lot.property
    const entity = property.entity
    const tenantGroup = lease.tenant_group

    const miseEnDemeureData = prepareMiseEnDemeureData(
      lease,
      entity,
      tenantGroup,
      lot,
      property,
      unpaidPayments,
      options
    )

    const pdf = await getPdf()
    const pdfBlob = await pdf(<MiseEnDemeure data={miseEnDemeureData} />).toBlob()

    return {
      blob: pdfBlob,
      filename: generateFilename('mise_en_demeure', tenantGroup.name),
      data: miseEnDemeureData
    }
  } catch (error) {
    console.error('Erreur génération mise en demeure:', error)
    throw new Error(`Impossible de générer la mise en demeure : ${error.message}`)
  }
}

/**
 * Génère et télécharge directement une mise en demeure
 *
 * @param {string} leaseId - ID du bail
 * @param {Array} unpaidPaymentIds - IDs des paiements impayés à inclure
 * @param {Object} options - Options personnalisables (joursDelai, etc.)
 */
export const downloadMiseEnDemeure = async (leaseId, unpaidPaymentIds = [], options = {}) => {
  const result = await generateMiseEnDemeure(leaseId, unpaidPaymentIds, options)
  downloadPDF(result.blob, result.filename)
  return result
}

/**
 * Génère une mise en demeure et l'ouvre en prévisualisation
 *
 * @param {string} leaseId - ID du bail
 * @param {Array} unpaidPaymentIds - IDs des paiements impayés à inclure
 * @param {Object} options - Options personnalisables (joursDelai, etc.)
 */
export const previewMiseEnDemeure = async (leaseId, unpaidPaymentIds = [], options = {}) => {
  const result = await generateMiseEnDemeure(leaseId, unpaidPaymentIds, options)
  previewPDF(result.blob)
  return result
}

// =====================================================
// ATTESTATION DE LOYER ANNUELLE
// =====================================================

/**
 * Génère une attestation de loyer annuelle
 *
 * @param {string} leaseId - ID du bail
 * @param {number} year - Année concernée
 * @returns {Promise<{blob: Blob, filename: string, data: Object}>}
 */
export const generateAttestationLoyer = async (leaseId, year) => {
  try {
    // Dynamic import pour code splitting
    const { default: AttestationLoyer, prepareAttestationLoyerData } = await import('../components/pdf/templates/AttestationLoyer')

    // Récupérer le bail et ses relations
    const { data: lease, error: leaseError } = await supabase
      .from('leases')
      .select(`
        *,
        lot:lots(
          *,
          property:properties_new(
            *,
            entity:entities(*)
          )
        ),
        tenant_group:tenant_groups(*)
      `)
      .eq('id', leaseId)
      .single()

    if (leaseError) throw leaseError
    if (!lease) throw new Error('Bail non trouvé')

    // Récupérer les paiements de l'année
    const startDate = `${year}-01-01`
    const endDate = `${year}-12-31`

    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('lease_id', leaseId)
      .eq('status', 'paid')
      .gte('payment_date', startDate)
      .lte('payment_date', endDate)
      .order('payment_date', { ascending: true })

    if (paymentsError) throw paymentsError

    const lot = lease.lot
    const property = lot.property
    const entity = property.entity
    const tenantGroup = lease.tenant_group

    const attestationData = prepareAttestationLoyerData(
      lease,
      entity,
      tenantGroup,
      lot,
      property,
      payments || [],
      year
    )

    const pdf = await getPdf()
    const pdfBlob = await pdf(<AttestationLoyer data={attestationData} />).toBlob()

    return {
      blob: pdfBlob,
      filename: generateFilename('attestation_loyer', `${tenantGroup.name}_${year}`),
      data: attestationData
    }
  } catch (error) {
    console.error('Erreur génération attestation loyer:', error)
    throw new Error(`Impossible de générer l'attestation de loyer : ${error.message}`)
  }
}

/**
 * Génère et télécharge directement une attestation de loyer
 */
export const downloadAttestationLoyer = async (leaseId, year) => {
  const result = await generateAttestationLoyer(leaseId, year)
  downloadPDF(result.blob, result.filename)
  return result
}

/**
 * Génère une attestation de loyer et l'ouvre en prévisualisation
 */
export const previewAttestationLoyer = async (leaseId, year) => {
  const result = await generateAttestationLoyer(leaseId, year)
  previewPDF(result.blob)
  return result
}

// =====================================================
// LETTRE DE RÉSILIATION (CONGÉ BAILLEUR)
// =====================================================

/**
 * Génère une lettre de résiliation (congé du bailleur)
 *
 * @param {string} leaseId - ID du bail
 * @param {string} motif - Motif du congé (reprise, vente, motif_legitime)
 * @param {Object} options - Options supplémentaires
 * @param {string} options.dateEffet - Date d'effet du congé
 * @param {string} options.motifDetail - Détail du motif
 * @param {Object} options.beneficiaire - Pour congé reprise : {nom, lien}
 * @returns {Promise<{blob: Blob, filename: string, data: Object}>}
 */
export const generateLettreResiliation = async (leaseId, motif = 'motif_legitime', options = {}) => {
  try {
    // Dynamic import pour code splitting
    const { default: LettreResiliation, prepareLettreResiliationData } = await import('../components/pdf/templates/LettreResiliation')

    const { data: lease, error: leaseError } = await supabase
      .from('leases')
      .select(`
        *,
        lot:lots(
          *,
          property:properties_new(
            *,
            entity:entities(*)
          )
        ),
        tenant_group:tenant_groups(*)
      `)
      .eq('id', leaseId)
      .single()

    if (leaseError) throw leaseError
    if (!lease) throw new Error('Bail non trouvé')

    const lot = lease.lot
    const property = lot.property
    const entity = property.entity
    const tenantGroup = lease.tenant_group

    const resiliationData = prepareLettreResiliationData(
      lease,
      entity,
      tenantGroup,
      lot,
      property,
      motif,
      options
    )

    const pdf = await getPdf()
    const pdfBlob = await pdf(<LettreResiliation data={resiliationData} />).toBlob()

    return {
      blob: pdfBlob,
      filename: generateFilename('lettre_resiliation', tenantGroup.name),
      data: resiliationData
    }
  } catch (error) {
    console.error('Erreur génération lettre résiliation:', error)
    throw new Error(`Impossible de générer la lettre de résiliation : ${error.message}`)
  }
}

/**
 * Génère et télécharge directement une lettre de résiliation
 */
export const downloadLettreResiliation = async (leaseId, motif = 'motif_legitime', options = {}) => {
  const result = await generateLettreResiliation(leaseId, motif, options)
  downloadPDF(result.blob, result.filename)
  return result
}

/**
 * Génère une lettre de résiliation et l'ouvre en prévisualisation
 */
export const previewLettreResiliation = async (leaseId, motif = 'motif_legitime', options = {}) => {
  const result = await generateLettreResiliation(leaseId, motif, options)
  previewPDF(result.blob)
  return result
}

// =====================================================
// CONGÉ POUR VENTE
// =====================================================

/**
 * Génère un congé pour vente
 *
 * @param {string} leaseId - ID du bail
 * @param {Object} venteDetails - Détails de la vente
 * @param {number} venteDetails.prixVente - Prix de vente proposé
 * @param {number} venteDetails.fraisAgence - Frais d'agence (optionnel)
 * @param {string} venteDetails.modePaiement - Mode de paiement (optionnel)
 * @param {string} venteDetails.delaiRealisation - Délai de réalisation (optionnel)
 * @param {string} venteDetails.conditionsParticulieres - Conditions particulières (optionnel)
 * @returns {Promise<{blob: Blob, filename: string, data: Object}>}
 */
export const generateCongeVente = async (leaseId, venteDetails) => {
  try {
    // Dynamic import pour code splitting
    const { default: CongeVente, prepareCongeVenteData } = await import('../components/pdf/templates/CongeVente')

    if (!venteDetails || !venteDetails.prixVente) {
      throw new Error('Le prix de vente est obligatoire pour un congé pour vente')
    }

    const { data: lease, error: leaseError } = await supabase
      .from('leases')
      .select(`
        *,
        lot:lots(
          *,
          property:properties_new(
            *,
            entity:entities(*)
          )
        ),
        tenant_group:tenant_groups(*)
      `)
      .eq('id', leaseId)
      .single()

    if (leaseError) throw leaseError
    if (!lease) throw new Error('Bail non trouvé')

    const lot = lease.lot
    const property = lot.property
    const entity = property.entity
    const tenantGroup = lease.tenant_group

    const congeVenteData = prepareCongeVenteData(
      lease,
      entity,
      tenantGroup,
      lot,
      property,
      venteDetails
    )

    const pdf = await getPdf()
    const pdfBlob = await pdf(<CongeVente data={congeVenteData} />).toBlob()

    return {
      blob: pdfBlob,
      filename: generateFilename('conge_vente', tenantGroup.name),
      data: congeVenteData
    }
  } catch (error) {
    console.error('Erreur génération congé pour vente:', error)
    throw new Error(`Impossible de générer le congé pour vente : ${error.message}`)
  }
}

/**
 * Génère et télécharge directement un congé pour vente
 */
export const downloadCongeVente = async (leaseId, venteDetails) => {
  const result = await generateCongeVente(leaseId, venteDetails)
  downloadPDF(result.blob, result.filename)
  return result
}

/**
 * Génère un congé pour vente et l'ouvre en prévisualisation
 */
export const previewCongeVente = async (leaseId, venteDetails) => {
  const result = await generateCongeVente(leaseId, venteDetails)
  previewPDF(result.blob)
  return result
}

// =====================================================
// LETTRE DE RÉSILIATION DU LOCATAIRE
// =====================================================

/**
 * Génère une lettre de résiliation du locataire
 *
 * @param {string} leaseId - ID du bail
 * @param {string} motif - Motif du congé (convenance, mutation, perte_emploi, etc.)
 * @param {Object} options - Options supplémentaires
 * @param {string} options.dateDepart - Date de départ souhaitée
 * @param {string} options.motifDetail - Détail du motif
 * @param {boolean} options.preavisReduit - Préavis réduit à 1 mois
 * @returns {Promise<{blob: Blob, filename: string, data: Object}>}
 */
export const generateLettreResiliationLocataire = async (leaseId, motif = 'convenance', options = {}) => {
  try {
    // Dynamic import pour code splitting
    const { default: LettreResiliationLocataire, prepareLettreResiliationLocataireData } = await import('../components/pdf/templates/LettreResiliationLocataire')

    const { data: lease, error: leaseError } = await supabase
      .from('leases')
      .select(`
        *,
        lot:lots(
          *,
          property:properties_new(
            *,
            entity:entities(*)
          )
        ),
        tenant_group:tenant_groups(*)
      `)
      .eq('id', leaseId)
      .single()

    if (leaseError) throw leaseError
    if (!lease) throw new Error('Bail non trouvé')

    const lot = lease.lot
    const property = lot.property
    const entity = property.entity
    const tenantGroup = lease.tenant_group

    const resiliationData = prepareLettreResiliationLocataireData(
      lease,
      entity,
      tenantGroup,
      lot,
      property,
      motif,
      options
    )

    const pdf = await getPdf()
    const pdfBlob = await pdf(<LettreResiliationLocataire data={resiliationData} />).toBlob()

    return {
      blob: pdfBlob,
      filename: generateFilename('resiliation_locataire', tenantGroup.name),
      data: resiliationData
    }
  } catch (error) {
    console.error('Erreur génération lettre résiliation locataire:', error)
    throw new Error(`Impossible de générer la lettre de résiliation : ${error.message}`)
  }
}

/**
 * Génère et télécharge directement une lettre de résiliation locataire
 */
export const downloadLettreResiliationLocataire = async (leaseId, motif = 'convenance', options = {}) => {
  const result = await generateLettreResiliationLocataire(leaseId, motif, options)
  downloadPDF(result.blob, result.filename)
  return result
}

/**
 * Génère une lettre de résiliation locataire et l'ouvre en prévisualisation
 */
export const previewLettreResiliationLocataire = async (leaseId, motif = 'convenance', options = {}) => {
  const result = await generateLettreResiliationLocataire(leaseId, motif, options)
  previewPDF(result.blob)
  return result
}

// =====================================================
// RÉGULARISATION DES CHARGES
// =====================================================

/**
 * Génère un décompte de régularisation des charges
 *
 * @param {string} leaseId - ID du bail
 * @param {Object} chargesData - Données des charges
 * @param {string} chargesData.periode - Période concernée (ex: "2025")
 * @param {number} chargesData.provisionsVersees - Total des provisions versées
 * @param {number} chargesData.chargesReelles - Total des charges réelles
 * @param {Array} chargesData.detailCharges - Détail des charges [{libelle, montant}]
 * @returns {Promise<{blob: Blob, filename: string, data: Object}>}
 */
export const generateRegularisationCharges = async (leaseId, chargesData) => {
  try {
    // Dynamic import pour code splitting
    const { default: RegularisationCharges, prepareRegularisationChargesData } = await import('../components/pdf/templates/RegularisationCharges')

    const { data: lease, error: leaseError } = await supabase
      .from('leases')
      .select(`
        *,
        lot:lots(
          *,
          property:properties_new(
            *,
            entity:entities(*)
          )
        ),
        tenant_group:tenant_groups(*)
      `)
      .eq('id', leaseId)
      .single()

    if (leaseError) throw leaseError
    if (!lease) throw new Error('Bail non trouvé')

    const lot = lease.lot
    const property = lot.property
    const entity = property.entity
    const tenantGroup = lease.tenant_group

    const regularisationData = prepareRegularisationChargesData(
      lease,
      entity,
      tenantGroup,
      lot,
      property,
      chargesData
    )

    const pdf = await getPdf()
    const pdfBlob = await pdf(<RegularisationCharges data={regularisationData} />).toBlob()

    const periode = chargesData.periode || new Date().getFullYear().toString()

    return {
      blob: pdfBlob,
      filename: generateFilename('regularisation_charges', `${tenantGroup.name}_${periode}`),
      data: regularisationData
    }
  } catch (error) {
    console.error('Erreur génération régularisation charges:', error)
    throw new Error(`Impossible de générer la régularisation des charges : ${error.message}`)
  }
}

/**
 * Génère et télécharge directement une régularisation des charges
 */
export const downloadRegularisationCharges = async (leaseId, chargesData) => {
  const result = await generateRegularisationCharges(leaseId, chargesData)
  downloadPDF(result.blob, result.filename)
  return result
}

/**
 * Génère une régularisation des charges et l'ouvre en prévisualisation
 */
export const previewRegularisationCharges = async (leaseId, chargesData) => {
  const result = await generateRegularisationCharges(leaseId, chargesData)
  previewPDF(result.blob)
  return result
}

// =====================================================
// ACCORD D'ÉCHÉANCIER DE PAIEMENT
// =====================================================

/**
 * Génère un accord d'échéancier de paiement
 *
 * @param {string} leaseId - ID du bail
 * @param {Object} detteData - Données de la dette
 * @param {number} detteData.total - Montant total de la dette
 * @param {Array} detteData.details - Détail de la dette [{libelle, montant}]
 * @param {string} detteData.dateArrete - Date d'arrêté de la dette
 * @param {number} detteData.nombreMensualites - Nombre de mensualités (si pas d'échéancier fourni)
 * @param {Array} echeancierData - Échéancier [{date, montant}] (optionnel, généré automatiquement sinon)
 * @returns {Promise<{blob: Blob, filename: string, data: Object}>}
 */
export const generateAccordEcheancier = async (leaseId, detteData, echeancierData = null) => {
  try {
    // Dynamic import pour code splitting
    const { default: AccordEcheancier, prepareAccordEcheancierData } = await import('../components/pdf/templates/AccordEcheancier')

    const { data: lease, error: leaseError } = await supabase
      .from('leases')
      .select(`
        *,
        lot:lots(
          *,
          property:properties_new(
            *,
            entity:entities(*)
          )
        ),
        tenant_group:tenant_groups(*)
      `)
      .eq('id', leaseId)
      .single()

    if (leaseError) throw leaseError
    if (!lease) throw new Error('Bail non trouvé')

    const lot = lease.lot
    const property = lot.property
    const entity = property.entity
    const tenantGroup = lease.tenant_group

    const accordData = prepareAccordEcheancierData(
      lease,
      entity,
      tenantGroup,
      lot,
      property,
      detteData,
      echeancierData
    )

    const pdf = await getPdf()
    const pdfBlob = await pdf(<AccordEcheancier data={accordData} />).toBlob()

    return {
      blob: pdfBlob,
      filename: generateFilename('accord_echeancier', tenantGroup.name),
      data: accordData
    }
  } catch (error) {
    console.error('Erreur génération accord échéancier:', error)
    throw new Error(`Impossible de générer l'accord d'échéancier : ${error.message}`)
  }
}

/**
 * Génère et télécharge directement un accord d'échéancier
 */
export const downloadAccordEcheancier = async (leaseId, detteData, echeancierData = null) => {
  const result = await generateAccordEcheancier(leaseId, detteData, echeancierData)
  downloadPDF(result.blob, result.filename)
  return result
}

/**
 * Génère un accord d'échéancier et l'ouvre en prévisualisation
 */
export const previewAccordEcheancier = async (leaseId, detteData, echeancierData = null) => {
  const result = await generateAccordEcheancier(leaseId, detteData, echeancierData)
  previewPDF(result.blob)
  return result
}

// =====================================================
// UTILITAIRES
// =====================================================

/**
 * Télécharge un PDF généré
 *
 * @param {Blob} blob - Blob du PDF
 * @param {string} filename - Nom du fichier
 */
export const downloadPDF = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Ouvre un PDF dans un nouvel onglet pour prévisualisation
 *
 * @param {Blob} blob - Blob du PDF
 */
export const previewPDF = (blob) => {
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
}

/**
 * Génère un nom de fichier standardisé
 *
 * @param {string} type - Type de document (quittance, attestation, etc.)
 * @param {string} identifier - Identifiant (période, nom, etc.)
 * @returns {string} Nom de fichier formaté
 */
const generateFilename = (type, identifier) => {
  const sanitized = identifier
    .toLowerCase()
    .replace(/\s+/g, '_')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  const date = new Date().toISOString().split('T')[0]

  return `${type}_${sanitized}_${date}.pdf`
}

/**
 * Récupère les données brutes pour un paiement (utile pour debug)
 */
export const getQuittancePreviewData = async (paymentId) => {
  // Dynamic import pour code splitting
  const { prepareQuittanceData } = await import('../components/pdf/templates/QuittanceLoyer')

  const { data: payment, error } = await supabase
    .from('payments')
    .select(`
      *,
      lease:leases(
        *,
        lot:lots(
          *,
          property:properties_new(
            *,
            entity:entities(*)
          )
        ),
        tenant:tenants(
          *,
          tenant_groups:tenant_groups!group_id(*)
        )
      )
    `)
    .eq('id', paymentId)
    .single()

  if (error) throw error
  if (!payment) throw new Error('Paiement non trouvé')

  const lease = payment.lease
  const lot = lease.lot
  const property = lot.property
  const entity = property.entity
  const tenant = lease.tenant

  return prepareQuittanceData(payment, lease, entity, tenant, lot, property)
}

// =====================================================
// CONSTANTES
// =====================================================

// Types de documents supportés
export const DOCUMENT_TYPES = {
  QUITTANCE: 'quittance',
  RECU_PARTIEL: 'recu_partiel',
  ATTESTATION_CAF: 'attestation_caf',
  LETTRE_INDEXATION: 'lettre_indexation',
  AVIS_ECHEANCE: 'avis_echeance',
  MISE_EN_DEMEURE: 'mise_en_demeure',
  ATTESTATION_LOYER: 'attestation_loyer',
  LETTRE_RESILIATION: 'lettre_resiliation',
  CONGE_VENTE: 'conge_vente',
  RESILIATION_LOCATAIRE: 'resiliation_locataire',
  REGULARISATION_CHARGES: 'regularisation_charges',
  ACCORD_ECHEANCIER: 'accord_echeancier'
}

// Statuts des documents
export const DOCUMENT_STATUS = {
  DRAFT: 'draft',
  GENERATED: 'generated',
  SENT: 'sent',
  SIGNED: 'signed'
}

export default {
  // Quittance
  generateQuittance,
  downloadQuittance,
  previewQuittance,
  getQuittancePreviewData,
  // Attestation CAF
  generateAttestationCAF,
  downloadAttestationCAF,
  previewAttestationCAF,
  // Lettre indexation
  generateLettreIndexation,
  downloadLettreIndexation,
  previewLettreIndexation,
  // Avis d'échéance
  generateAvisEcheance,
  downloadAvisEcheance,
  previewAvisEcheance,
  // Mise en demeure
  generateMiseEnDemeure,
  downloadMiseEnDemeure,
  previewMiseEnDemeure,
  // Attestation de loyer
  generateAttestationLoyer,
  downloadAttestationLoyer,
  previewAttestationLoyer,
  // Lettre de résiliation (bailleur)
  generateLettreResiliation,
  downloadLettreResiliation,
  previewLettreResiliation,
  // Congé pour vente
  generateCongeVente,
  downloadCongeVente,
  previewCongeVente,
  // Lettre de résiliation (locataire)
  generateLettreResiliationLocataire,
  downloadLettreResiliationLocataire,
  previewLettreResiliationLocataire,
  // Régularisation des charges
  generateRegularisationCharges,
  downloadRegularisationCharges,
  previewRegularisationCharges,
  // Accord d'échéancier
  generateAccordEcheancier,
  downloadAccordEcheancier,
  previewAccordEcheancier,
  // Utilitaires
  downloadPDF,
  previewPDF,
  // Constantes
  DOCUMENT_TYPES,
  DOCUMENT_STATUS
}
