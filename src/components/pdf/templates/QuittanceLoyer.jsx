import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import {
  COLORS,
  formatMontant,
  formatDate,
  formatMonth,
  generateDocumentNumber
} from '../shared/PDFStyles'

// Styles compacts spécifiques à la quittance (1 page)
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: COLORS.text,
    backgroundColor: COLORS.white
  },
  // En-tête compact
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  headerLeft: {
    width: '55%'
  },
  headerRight: {
    width: '40%',
    textAlign: 'right'
  },
  companyName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    marginBottom: 2
  },
  companyInfo: {
    fontSize: 8,
    color: COLORS.textMuted,
    lineHeight: 1.3
  },
  docInfo: {
    fontSize: 8,
    color: COLORS.textMuted
  },
  // Titre
  titleSection: {
    marginBottom: 15,
    textAlign: 'center'
  },
  documentTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.text,
    marginBottom: 6
  },
  periodBadge: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    padding: '4 12',
    borderRadius: 3,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    alignSelf: 'center'
  },
  // Parties
  partiesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  partyBox: {
    width: '48%',
    padding: 8,
    backgroundColor: COLORS.background,
    borderRadius: 3
  },
  partyTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    marginBottom: 4,
    textTransform: 'uppercase'
  },
  partyName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2
  },
  partyAddress: {
    fontSize: 8,
    color: COLORS.textMuted,
    lineHeight: 1.3
  },
  // Déclaration
  declarationBox: {
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 3,
    marginBottom: 12
  },
  declarationText: {
    fontSize: 9,
    lineHeight: 1.5,
    textAlign: 'justify'
  },
  bold: {
    fontFamily: 'Helvetica-Bold'
  },
  // Tableau montants
  amountSection: {
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.secondary,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  amountLabel: {
    fontSize: 9,
    color: COLORS.text
  },
  amountValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 3,
    marginTop: -1
  },
  totalLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white
  },
  totalValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white
  },
  // Infos paiement
  paymentInfo: {
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 3,
    marginBottom: 12
  },
  paymentInfoTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.success,
    marginBottom: 4
  },
  paymentInfoText: {
    fontSize: 8,
    color: COLORS.text,
    lineHeight: 1.4
  },
  warningText: {
    marginTop: 4,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.warning
  },
  // Mentions légales
  legalNotice: {
    fontSize: 7,
    color: COLORS.textMuted,
    fontFamily: 'Helvetica-Oblique',
    padding: 8,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    marginBottom: 15,
    lineHeight: 1.4
  },
  // Signature compacte
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10
  },
  signatureBox: {
    width: '45%'
  },
  signatureLabel: {
    fontSize: 8,
    color: COLORS.textMuted,
    marginBottom: 3
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.text,
    height: 35,
    marginBottom: 2
  },
  signatureDate: {
    fontSize: 7,
    color: COLORS.textMuted
  },
  // Footer inline (pas en position absolue)
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    textAlign: 'center'
  },
  footerText: {
    fontSize: 7,
    color: COLORS.textMuted
  }
})

/**
 * Template PDF compact pour Quittance de Loyer (1 page)
 *
 * Conforme à l'Article 21 de la loi n° 89-462 du 6 juillet 1989
 */
const QuittanceLoyer = ({ data }) => {
  const {
    bailleur,
    locataire,
    bien,
    paiement,
    numeroQuittance
  } = data

  // Déterminer si c'est une quittance complète ou un reçu partiel
  const totalDu = paiement.loyer + paiement.charges
  const isFullPayment = paiement.montantRecu >= totalDu
  const documentType = isFullPayment ? 'QUITTANCE DE LOYER' : 'RECU DE PAIEMENT PARTIEL'

  // Générer le numéro de document si non fourni
  const docNumber = numeroQuittance || generateDocumentNumber(
    isFullPayment ? 'quittance' : 'recu',
    new Date(paiement.datePaiement)
  )

  // Calculer le reste à payer si paiement partiel
  const resteAPayer = isFullPayment ? 0 : totalDu - paiement.montantRecu

  // Formater la période
  const periodeText = paiement.periode || formatMonth(paiement.datePaiement)

  // Formater la date du document
  const dateEmission = formatDate(paiement.dateEmission || new Date().toISOString())

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête compact */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.companyName}>{bailleur.nom}</Text>
            <Text style={styles.companyInfo}>
              {bailleur.adresse}{'\n'}
              {bailleur.codePostal} {bailleur.ville}
              {bailleur.telephone && ` - Tél : ${bailleur.telephone}`}
              {bailleur.siret && `\nSIRET : ${bailleur.siret}`}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.docInfo}>Date : {dateEmission}</Text>
            <Text style={styles.docInfo}>Réf : {docNumber}</Text>
          </View>
        </View>

        {/* Titre */}
        <View style={styles.titleSection}>
          <Text style={styles.documentTitle}>{documentType}</Text>
          <View style={styles.periodBadge}>
            <Text>{periodeText}</Text>
          </View>
        </View>

        {/* Parties : Bailleur et Locataire */}
        <View style={styles.partiesRow}>
          <View style={styles.partyBox}>
            <Text style={styles.partyTitle}>Bailleur</Text>
            <Text style={styles.partyName}>{bailleur.nom}</Text>
            <Text style={styles.partyAddress}>
              {bailleur.adresse}{'\n'}
              {bailleur.codePostal} {bailleur.ville}
            </Text>
          </View>

          <View style={styles.partyBox}>
            <Text style={styles.partyTitle}>Locataire</Text>
            <Text style={styles.partyName}>{locataire.nom}</Text>
            <Text style={styles.partyAddress}>
              {bien.adresse}{'\n'}
              {bien.codePostal} {bien.ville}
            </Text>
          </View>
        </View>

        {/* Déclaration */}
        <View style={styles.declarationBox}>
          <Text style={styles.declarationText}>
            Je soussigné(e) <Text style={styles.bold}>{bailleur.nom}</Text>, propriétaire
            du logement situé au <Text style={styles.bold}>{bien.adresse}, {bien.codePostal} {bien.ville}</Text>,
            déclare avoir reçu de <Text style={styles.bold}>{locataire.nom}</Text> la somme
            de <Text style={styles.bold}>{formatMontant(paiement.montantRecu)}</Text>
            {isFullPayment
              ? ` en paiement du loyer et des charges pour la période de ${periodeText}.`
              : ` en paiement partiel du loyer et des charges pour la période de ${periodeText}.`
            }
          </Text>
        </View>

        {/* Détail des montants */}
        <View style={styles.amountSection}>
          <Text style={styles.sectionTitle}>Détail des sommes</Text>

          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Loyer (hors charges)</Text>
            <Text style={styles.amountValue}>{formatMontant(paiement.loyer)}</Text>
          </View>

          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Provision pour charges</Text>
            <Text style={styles.amountValue}>{formatMontant(paiement.charges)}</Text>
          </View>

          {paiement.aides > 0 && (
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Aides au logement (CAF/APL)</Text>
              <Text style={{ ...styles.amountValue, color: COLORS.success }}>
                - {formatMontant(paiement.aides)}
              </Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              {paiement.aides > 0 ? 'Total à la charge du locataire' : 'Total'}
            </Text>
            <Text style={styles.totalValue}>
              {formatMontant(totalDu - (paiement.aides || 0))}
            </Text>
          </View>
        </View>

        {/* Informations de paiement */}
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentInfoTitle}>
            {isFullPayment ? 'Paiement reçu' : 'Paiement partiel reçu'}
          </Text>
          <Text style={styles.paymentInfoText}>
            Montant reçu : <Text style={styles.bold}>{formatMontant(paiement.montantRecu)}</Text>
            {'  |  '}
            Date : <Text style={styles.bold}>{formatDate(paiement.datePaiement)}</Text>
            {paiement.modePaiement && (
              <>
                {'  |  '}
                Mode : <Text style={styles.bold}>{paiement.modePaiement}</Text>
              </>
            )}
          </Text>

          {!isFullPayment && (
            <Text style={styles.warningText}>
              Reste à payer : {formatMontant(resteAPayer)}
            </Text>
          )}
        </View>

        {/* Mention légale */}
        <View style={styles.legalNotice}>
          <Text>
            {isFullPayment
              ? 'Cette quittance annule tous les reçus qui auraient pu être établis précédemment en cas de paiement partiel. Elle ne préjuge pas des sommes restant dues au titre de périodes antérieures.'
              : 'Ce reçu atteste uniquement du paiement partiel mentionné ci-dessus. Le solde reste dû par le locataire.'}
            {' '}Conformément à l'article 21 de la loi n° 89-462 du 6 juillet 1989, le bailleur est tenu de délivrer gratuitement une quittance au locataire qui en fait la demande.
          </Text>
        </View>

        {/* Signature compacte */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>
              Fait à {bailleur.ville || '...'}, le {dateEmission}
            </Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureDate}>Signature du bailleur</Text>
          </View>
        </View>

        {/* Footer inline */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Document généré automatiquement - Gestion Locative SaaS
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export default QuittanceLoyer

/**
 * Prépare les données pour la génération de quittance
 * depuis les données brutes de l'application
 */
export const prepareQuittanceData = (payment, lease, entity, tenant, lot, property) => {
  const paymentDate = new Date(payment.payment_date)
  const periodMonth = paymentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return {
    bailleur: {
      nom: entity.name,
      adresse: entity.address || '',
      ville: entity.city || '',
      codePostal: entity.postal_code || '',
      email: entity.email || '',
      telephone: entity.phone || '',
      siret: entity.siret || '',
      logo: entity.logo_url || null
    },
    locataire: {
      nom: tenant.tenant_groups?.name || `${tenant.first_name} ${tenant.last_name}`,
      email: tenant.email || '',
      telephone: tenant.phone || ''
    },
    bien: {
      adresse: property.address,
      ville: property.city,
      codePostal: property.postal_code,
      designation: `${lot.name}${lot.reference ? ` (${lot.reference})` : ''}`,
      surface: lot.surface_area,
      type: lot.lot_type
    },
    paiement: {
      periode: periodMonth,
      loyer: parseFloat(lease.rent_amount) || 0,
      charges: parseFloat(lease.charges_amount) || 0,
      aides: lease.caf_direct_payment ? (parseFloat(lease.caf_amount) || 0) : 0,
      montantRecu: parseFloat(payment.amount) || 0,
      datePaiement: payment.payment_date,
      dateEmission: new Date().toISOString(),
      modePaiement: payment.payment_method || null
    }
  }
}
