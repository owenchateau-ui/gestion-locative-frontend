import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import {
  COLORS,
  formatMontant,
  formatDate,
  generateDocumentNumber
} from '../shared/PDFStyles'

// Styles compacts pour l'attestation de loyer (1 page)
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
    textAlign: 'center',
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 3
  },
  documentTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    marginBottom: 4
  },
  documentPeriod: {
    fontSize: 11,
    color: COLORS.white
  },
  // Parties
  partiesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  partyBox: {
    width: '48%',
    padding: 10,
    backgroundColor: COLORS.background,
    borderRadius: 3
  },
  partyTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    marginBottom: 6,
    textTransform: 'uppercase'
  },
  partyName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2
  },
  partyInfo: {
    fontSize: 8,
    color: COLORS.textMuted,
    lineHeight: 1.3
  },
  // Corps
  declarationBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 3,
    marginBottom: 15
  },
  declarationText: {
    fontSize: 10,
    lineHeight: 1.6,
    textAlign: 'justify'
  },
  bold: {
    fontFamily: 'Helvetica-Bold'
  },
  // Tableau récapitulatif
  summarySection: {
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.secondary,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 4
  },
  table: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 3
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 8,
    paddingHorizontal: 6
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.secondary
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 6,
    paddingHorizontal: 6
  },
  tableCell: {
    fontSize: 8
  },
  colPeriode: {
    width: '25%'
  },
  colMontant: {
    width: '25%',
    textAlign: 'right'
  },
  totalRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3
  },
  totalLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    width: '50%'
  },
  totalValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    width: '50%',
    textAlign: 'right'
  },
  // Encadré récapitulatif
  highlightBox: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 3,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary
  },
  highlightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  highlightLabel: {
    fontSize: 10,
    color: COLORS.text
  },
  highlightValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary
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
 * Template PDF pour Attestation de Loyer
 *
 * Document attestant des loyers payés par le locataire
 * sur une période donnée. Utile pour les impôts, aides sociales,
 * ou demandes administratives.
 */
const AttestationLoyer = ({ data }) => {
  const {
    bailleur,
    locataire,
    bien,
    periode,
    paiements,
    numeroAttestation
  } = data

  // Générer le numéro d'attestation si non fourni
  const docNumber = numeroAttestation || generateDocumentNumber(
    'attestation_loyer',
    new Date()
  )

  // Date du document
  const dateDocument = formatDate(new Date().toISOString())

  // Calculer les totaux
  const totalLoyers = paiements.reduce((sum, p) => sum + (p.loyer || 0), 0)
  const totalCharges = paiements.reduce((sum, p) => sum + (p.charges || 0), 0)
  const totalPaye = paiements.reduce((sum, p) => sum + (p.montantPaye || 0), 0)

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
          <Text style={styles.documentTitle}>ATTESTATION DE LOYER</Text>
          <Text style={styles.documentPeriod}>
            Période : {periode.debut} - {periode.fin}
          </Text>
        </View>

        {/* Parties : Bailleur et Locataire */}
        <View style={styles.partiesRow}>
          <View style={styles.partyBox}>
            <Text style={styles.partyTitle}>Bailleur</Text>
            <Text style={styles.partyName}>{bailleur.nom}</Text>
            <Text style={styles.partyInfo}>
              {bailleur.adresse}{'\n'}
              {bailleur.codePostal} {bailleur.ville}
            </Text>
          </View>

          <View style={styles.partyBox}>
            <Text style={styles.partyTitle}>Locataire</Text>
            <Text style={styles.partyName}>{locataire.nom}</Text>
            <Text style={styles.partyInfo}>
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
            atteste que <Text style={styles.bold}>{locataire.nom}</Text>, locataire dudit logement,
            a acquitté les loyers et charges correspondant à la période du{' '}
            <Text style={styles.bold}>{periode.debut}</Text> au{' '}
            <Text style={styles.bold}>{periode.fin}</Text>, selon le détail ci-après.
          </Text>
        </View>

        {/* Tableau récapitulatif */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Récapitulatif des paiements</Text>

          <View style={styles.table}>
            {/* En-tête du tableau */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colPeriode]}>Période</Text>
              <Text style={[styles.tableHeaderCell, styles.colMontant]}>Loyer</Text>
              <Text style={[styles.tableHeaderCell, styles.colMontant]}>Charges</Text>
              <Text style={[styles.tableHeaderCell, styles.colMontant]}>Payé</Text>
            </View>

            {/* Lignes du tableau */}
            {paiements.map((paiement, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.colPeriode]}>{paiement.periode}</Text>
                <Text style={[styles.tableCell, styles.colMontant]}>{formatMontant(paiement.loyer)}</Text>
                <Text style={[styles.tableCell, styles.colMontant]}>{formatMontant(paiement.charges)}</Text>
                <Text style={[styles.tableCell, styles.colMontant]}>{formatMontant(paiement.montantPaye)}</Text>
              </View>
            ))}

            {/* Total */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>{formatMontant(totalPaye)}</Text>
            </View>
          </View>
        </View>

        {/* Encadré récapitulatif */}
        <View style={styles.highlightBox}>
          <View style={styles.highlightRow}>
            <Text style={styles.highlightLabel}>Total des loyers :</Text>
            <Text style={styles.highlightValue}>{formatMontant(totalLoyers)}</Text>
          </View>
          <View style={styles.highlightRow}>
            <Text style={styles.highlightLabel}>Total des charges :</Text>
            <Text style={styles.highlightValue}>{formatMontant(totalCharges)}</Text>
          </View>
          <View style={styles.highlightRow}>
            <Text style={styles.highlightLabel}>Total réglé sur la période :</Text>
            <Text style={styles.highlightValue}>{formatMontant(totalPaye)}</Text>
          </View>
        </View>

        {/* Mentions légales */}
        <View style={styles.legalNotice}>
          <Text>
            Cette attestation est établie pour servir et valoir ce que de droit.
            Elle ne constitue pas une quittance de loyer au sens de l'article 21
            de la loi n° 89-462 du 6 juillet 1989. Le bailleur certifie sur l'honneur
            l'exactitude des informations mentionnées dans ce document.
          </Text>
        </View>

        {/* Signature */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>
              Fait à {bailleur.ville || '...'}, le {dateDocument}
            </Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureDate}>Signature du bailleur</Text>
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

export default AttestationLoyer

/**
 * Prépare les données pour la génération de l'attestation de loyer
 * depuis les données brutes de l'application
 */
export const prepareAttestationLoyerData = (lease, entity, tenantGroup, lot, property, payments, year) => {
  // Déterminer la période
  const periodeDebut = `1er janvier ${year}`
  const periodeFin = `31 décembre ${year}`

  // Construire la liste des paiements par mois
  const paiementsMensuels = payments
    .filter(p => {
      const paymentYear = new Date(p.payment_date).getFullYear()
      return paymentYear === year && p.status === 'paid'
    })
    .map(p => {
      const date = new Date(p.payment_date)
      const periode = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      return {
        periode,
        loyer: parseFloat(lease.rent_amount) || 0,
        charges: parseFloat(lease.charges_amount) || 0,
        montantPaye: parseFloat(p.amount) || 0
      }
    })
    .sort((a, b) => {
      // Trier par mois
      const moisA = new Date(Date.parse(a.periode + ' 1')).getMonth()
      const moisB = new Date(Date.parse(b.periode + ' 1')).getMonth()
      return moisA - moisB
    })

  return {
    bailleur: {
      nom: entity.name,
      adresse: entity.address || '',
      ville: entity.city || '',
      codePostal: entity.postal_code || '',
      email: entity.email || '',
      telephone: entity.phone || '',
      siret: entity.siret || ''
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
    periode: {
      debut: periodeDebut,
      fin: periodeFin,
      annee: year
    },
    paiements: paiementsMensuels
  }
}
