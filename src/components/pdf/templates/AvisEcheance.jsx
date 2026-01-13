import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import {
  COLORS,
  formatMontant,
  formatDate,
  formatMonth,
  generateDocumentNumber
} from '../shared/PDFStyles'

// Styles compacts pour l'avis d'échéance (1 page)
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: COLORS.text,
    backgroundColor: COLORS.white
  },
  // En-tête
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
  // Destinataire
  recipientSection: {
    marginBottom: 15
  },
  recipientBox: {
    padding: 10,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    width: '50%',
    alignSelf: 'flex-end'
  },
  recipientName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2
  },
  recipientAddress: {
    fontSize: 9,
    color: COLORS.textMuted,
    lineHeight: 1.3
  },
  // Corps de lettre
  letterBody: {
    marginBottom: 15
  },
  letterDate: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginBottom: 15,
    textAlign: 'right'
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.5,
    textAlign: 'justify',
    marginBottom: 10
  },
  bold: {
    fontFamily: 'Helvetica-Bold'
  },
  // Tableau des montants
  amountSection: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 3
  },
  amountHeader: {
    backgroundColor: COLORS.background,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  amountHeaderText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.secondary
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
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
    padding: 10,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3
  },
  totalLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white
  },
  totalValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white
  },
  // Informations de paiement
  paymentSection: {
    marginBottom: 15
  },
  paymentTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.secondary,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 4
  },
  paymentInfo: {
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 3
  },
  paymentRow: {
    flexDirection: 'row',
    marginBottom: 4
  },
  paymentLabel: {
    width: '40%',
    fontSize: 9,
    color: COLORS.textMuted
  },
  paymentValue: {
    width: '60%',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold'
  },
  // Avertissement
  warningBox: {
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 3,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning
  },
  warningText: {
    fontSize: 8,
    color: '#92400E',
    lineHeight: 1.4
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
  // Signature
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
    height: 30,
    marginBottom: 2
  },
  signatureDate: {
    fontSize: 7,
    color: COLORS.textMuted
  },
  // Footer
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
 * Template PDF pour Avis d'Échéance (Appel de Loyer)
 *
 * Document envoyé au locataire avant la date d'échéance
 * pour rappeler le montant et les modalités de paiement.
 */
const AvisEcheance = ({ data }) => {
  const {
    bailleur,
    locataire,
    bien,
    echeance,
    numeroAvis
  } = data

  // Générer le numéro d'avis si non fourni
  const docNumber = numeroAvis || generateDocumentNumber(
    'avis_echeance',
    new Date()
  )

  // Date du document
  const dateDocument = formatDate(new Date().toISOString())

  // Calculer le total
  const totalMensuel = echeance.loyer + echeance.charges - (echeance.aides || 0)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.companyName}>{bailleur.nom}</Text>
            <Text style={styles.companyInfo}>
              {bailleur.adresse}{'\n'}
              {bailleur.codePostal} {bailleur.ville}
              {bailleur.telephone && `\nTél : ${bailleur.telephone}`}
              {bailleur.siret && `\nSIRET : ${bailleur.siret}`}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.docInfo}>Date : {dateDocument}</Text>
            <Text style={styles.docInfo}>Réf : {docNumber}</Text>
          </View>
        </View>

        {/* Titre */}
        <View style={styles.titleSection}>
          <Text style={styles.documentTitle}>AVIS D'ÉCHÉANCE</Text>
          <View style={styles.periodBadge}>
            <Text>{echeance.periode}</Text>
          </View>
        </View>

        {/* Destinataire */}
        <View style={styles.recipientSection}>
          <View style={styles.recipientBox}>
            <Text style={styles.recipientName}>{locataire.nom}</Text>
            <Text style={styles.recipientAddress}>
              {bien.adresse}{'\n'}
              {bien.codePostal} {bien.ville}
            </Text>
          </View>
        </View>

        {/* Corps de lettre */}
        <View style={styles.letterBody}>
          <Text style={styles.letterDate}>
            {bailleur.ville}, le {dateDocument}
          </Text>

          <Text style={styles.paragraph}>
            Madame, Monsieur,
          </Text>

          <Text style={styles.paragraph}>
            Nous vous rappelons que le loyer du mois de{' '}
            <Text style={styles.bold}>{echeance.periode}</Text> est exigible
            le <Text style={styles.bold}>{formatDate(echeance.dateEcheance)}</Text>.
          </Text>

          <Text style={styles.paragraph}>
            Vous trouverez ci-dessous le détail des sommes à régler pour le logement
            situé au <Text style={styles.bold}>{bien.adresse}, {bien.codePostal} {bien.ville}</Text>.
          </Text>
        </View>

        {/* Tableau des montants */}
        <View style={styles.amountSection}>
          <View style={styles.amountHeader}>
            <Text style={styles.amountHeaderText}>Détail de l'échéance</Text>
          </View>

          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Loyer (hors charges)</Text>
            <Text style={styles.amountValue}>{formatMontant(echeance.loyer)}</Text>
          </View>

          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Provision pour charges</Text>
            <Text style={styles.amountValue}>{formatMontant(echeance.charges)}</Text>
          </View>

          {echeance.aides > 0 && (
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Aides au logement (CAF/APL)</Text>
              <Text style={{ ...styles.amountValue, color: COLORS.success }}>
                - {formatMontant(echeance.aides)}
              </Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              {echeance.aides > 0 ? 'Net à payer' : 'Total à payer'}
            </Text>
            <Text style={styles.totalValue}>{formatMontant(totalMensuel)}</Text>
          </View>
        </View>

        {/* Informations de paiement */}
        <View style={styles.paymentSection}>
          <Text style={styles.paymentTitle}>Modalités de paiement</Text>
          <View style={styles.paymentInfo}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Date limite :</Text>
              <Text style={styles.paymentValue}>{formatDate(echeance.dateEcheance)}</Text>
            </View>
            {bailleur.iban && (
              <>
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>IBAN :</Text>
                  <Text style={styles.paymentValue}>{bailleur.iban}</Text>
                </View>
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>BIC :</Text>
                  <Text style={styles.paymentValue}>{bailleur.bic || '-'}</Text>
                </View>
              </>
            )}
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Référence :</Text>
              <Text style={styles.paymentValue}>{docNumber}</Text>
            </View>
          </View>
        </View>

        {/* Avertissement */}
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            En cas de difficulté de paiement, nous vous invitons à nous contacter
            dans les plus brefs délais afin de trouver ensemble une solution adaptée.
            Tout retard de paiement peut entraîner des frais supplémentaires et des
            procédures de recouvrement.
          </Text>
        </View>

        {/* Mentions légales */}
        <View style={styles.legalNotice}>
          <Text>
            Cet avis d'échéance ne constitue pas une quittance de loyer.
            Une quittance vous sera délivrée gratuitement après réception intégrale
            du paiement, conformément à l'article 21 de la loi n° 89-462 du 6 juillet 1989.
          </Text>
        </View>

        {/* Signature */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>
              Le bailleur,
            </Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureDate}>{bailleur.nom}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Document généré automatiquement - Gestion Locative SaaS
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export default AvisEcheance

/**
 * Prépare les données pour la génération de l'avis d'échéance
 * depuis les données brutes de l'application
 */
export const prepareAvisEcheanceData = (lease, entity, tenantGroup, lot, property, month = null) => {
  // Si pas de mois spécifié, utiliser le mois suivant
  const targetDate = month ? new Date(month) : new Date()
  if (!month) {
    targetDate.setMonth(targetDate.getMonth() + 1)
    targetDate.setDate(1)
  }

  const periodeText = targetDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  // Date d'échéance (5 du mois par défaut ou selon configuration)
  const dateEcheance = new Date(targetDate)
  dateEcheance.setDate(lease.payment_day || 5)

  return {
    bailleur: {
      nom: entity.name,
      adresse: entity.address || '',
      ville: entity.city || '',
      codePostal: entity.postal_code || '',
      email: entity.email || '',
      telephone: entity.phone || '',
      siret: entity.siret || '',
      iban: entity.iban || null,
      bic: entity.bic || null
    },
    locataire: {
      nom: tenantGroup.name,
      email: tenantGroup.email || ''
    },
    bien: {
      adresse: property.address,
      ville: property.city,
      codePostal: property.postal_code,
      designation: `${lot.name}${lot.reference ? ` (${lot.reference})` : ''}`
    },
    echeance: {
      periode: periodeText,
      dateEcheance: dateEcheance.toISOString(),
      loyer: parseFloat(lease.rent_amount) || 0,
      charges: parseFloat(lease.charges_amount) || 0,
      aides: lease.caf_direct_payment ? (parseFloat(lease.caf_amount) || 0) : 0
    }
  }
}
