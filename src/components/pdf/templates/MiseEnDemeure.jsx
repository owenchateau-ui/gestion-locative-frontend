import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import {
  COLORS,
  formatMontant,
  formatDate,
  generateDocumentNumber
} from '../shared/PDFStyles'

// Styles pour la mise en demeure (document formel)
const styles = StyleSheet.create({
  page: {
    padding: 35,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: COLORS.text,
    backgroundColor: COLORS.white
  },
  // Bandeau urgent
  urgentBanner: {
    backgroundColor: COLORS.danger,
    color: COLORS.white,
    padding: 10,
    textAlign: 'center',
    marginBottom: 20
  },
  urgentText: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1
  },
  // En-tête
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  headerLeft: {
    width: '50%'
  },
  headerRight: {
    width: '45%',
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
  // Destinataire
  recipientSection: {
    marginBottom: 20
  },
  recipientBox: {
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    width: '55%',
    alignSelf: 'flex-end'
  },
  envoi: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.danger,
    marginBottom: 5
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
  // Titre
  titleSection: {
    marginBottom: 15,
    textAlign: 'center'
  },
  documentTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.danger,
    marginBottom: 5,
    textTransform: 'uppercase'
  },
  documentSubtitle: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: 'Helvetica-Oblique'
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
  objet: {
    fontSize: 10,
    marginBottom: 15
  },
  objetLabel: {
    fontFamily: 'Helvetica-Bold'
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.6,
    textAlign: 'justify',
    marginBottom: 10
  },
  bold: {
    fontFamily: 'Helvetica-Bold'
  },
  // Tableau de la dette
  debtSection: {
    marginBottom: 15,
    borderWidth: 2,
    borderColor: COLORS.danger,
    borderRadius: 3
  },
  debtHeader: {
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.danger
  },
  debtHeaderText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.danger,
    textAlign: 'center'
  },
  debtRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FEE2E2'
  },
  debtLabel: {
    fontSize: 9,
    color: COLORS.text,
    width: '60%'
  },
  debtValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    width: '40%',
    textAlign: 'right'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: COLORS.danger
  },
  totalLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white
  },
  totalValue: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white
  },
  // Encadré délai
  deadlineBox: {
    backgroundColor: '#FEF2F2',
    padding: 15,
    borderWidth: 2,
    borderColor: COLORS.danger,
    borderRadius: 3,
    marginBottom: 15
  },
  deadlineTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: 8
  },
  deadlineText: {
    fontSize: 10,
    textAlign: 'center',
    color: '#7F1D1D'
  },
  deadlineDate: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.danger,
    textAlign: 'center',
    marginTop: 5
  },
  // Conséquences
  consequencesSection: {
    marginBottom: 15
  },
  consequencesTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.secondary,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 4
  },
  consequenceItem: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 10
  },
  bullet: {
    fontSize: 9,
    marginRight: 6,
    color: COLORS.danger
  },
  consequenceText: {
    fontSize: 9,
    lineHeight: 1.4,
    flex: 1
  },
  // Mentions légales
  legalSection: {
    marginBottom: 15
  },
  legalTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.textMuted,
    marginBottom: 5
  },
  legalText: {
    fontSize: 7,
    color: COLORS.textMuted,
    lineHeight: 1.4,
    fontFamily: 'Helvetica-Oblique',
    backgroundColor: COLORS.background,
    padding: 8,
    borderRadius: 3
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
    height: 35,
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
 * Template PDF pour Mise en Demeure de payer
 *
 * Document formel envoyé au locataire en cas d'impayés.
 * Constitue une étape préalable obligatoire avant action judiciaire.
 */
const MiseEnDemeure = ({ data }) => {
  const {
    bailleur,
    locataire,
    bien,
    dette,
    delai,
    numeroDocument
  } = data

  // Générer le numéro de document si non fourni
  const docNumber = numeroDocument || generateDocumentNumber(
    'mise_en_demeure',
    new Date()
  )

  // Date du document
  const dateDocument = formatDate(new Date().toISOString())

  // Calculer le délai de régularisation
  const dateLimite = new Date()
  dateLimite.setDate(dateLimite.getDate() + (delai.joursDelai || 8))

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Bandeau urgent */}
        <View style={styles.urgentBanner}>
          <Text style={styles.urgentText}>MISE EN DEMEURE DE PAYER</Text>
        </View>

        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.companyName}>{bailleur.nom}</Text>
            <Text style={styles.companyInfo}>
              {bailleur.adresse}{'\n'}
              {bailleur.codePostal} {bailleur.ville}
              {bailleur.telephone && `\nTél : ${bailleur.telephone}`}
              {bailleur.email && `\nEmail : ${bailleur.email}`}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.docInfo}>Date : {dateDocument}</Text>
            <Text style={styles.docInfo}>Réf : {docNumber}</Text>
          </View>
        </View>

        {/* Destinataire */}
        <View style={styles.recipientSection}>
          <View style={styles.recipientBox}>
            <Text style={styles.envoi}>LETTRE RECOMMANDÉE AVEC A.R.</Text>
            <Text style={styles.recipientName}>{locataire.nom}</Text>
            <Text style={styles.recipientAddress}>
              {bien.adresse}{'\n'}
              {bien.codePostal} {bien.ville}
            </Text>
          </View>
        </View>

        {/* Objet */}
        <View style={styles.letterBody}>
          <Text style={styles.letterDate}>
            {bailleur.ville}, le {dateDocument}
          </Text>

          <Text style={styles.objet}>
            <Text style={styles.objetLabel}>Objet : </Text>
            Mise en demeure de payer les loyers et charges impayés
          </Text>

          <Text style={styles.paragraph}>
            Madame, Monsieur,
          </Text>

          <Text style={styles.paragraph}>
            Malgré nos précédentes relances, nous constatons que vous n'avez toujours
            pas procédé au règlement des loyers et charges dus au titre de votre
            location située au <Text style={styles.bold}>{bien.adresse}, {bien.codePostal} {bien.ville}</Text>.
          </Text>

          <Text style={styles.paragraph}>
            Par la présente, nous vous mettons en demeure de régler sous{' '}
            <Text style={styles.bold}>{delai.joursDelai || 8} jours</Text> à compter
            de la réception de ce courrier, les sommes détaillées ci-après.
          </Text>
        </View>

        {/* Tableau de la dette */}
        <View style={styles.debtSection}>
          <View style={styles.debtHeader}>
            <Text style={styles.debtHeaderText}>DÉTAIL DE LA DETTE</Text>
          </View>

          {dette.details && dette.details.map((item, index) => (
            <View key={index} style={styles.debtRow}>
              <Text style={styles.debtLabel}>{item.libelle}</Text>
              <Text style={styles.debtValue}>{formatMontant(item.montant)}</Text>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL DÛ</Text>
            <Text style={styles.totalValue}>{formatMontant(dette.totalDu)}</Text>
          </View>
        </View>

        {/* Encadré délai */}
        <View style={styles.deadlineBox}>
          <Text style={styles.deadlineTitle}>DÉLAI DE RÉGULARISATION</Text>
          <Text style={styles.deadlineText}>
            Vous disposez d'un délai de {delai.joursDelai || 8} jours pour régler
            l'intégralité de cette somme, soit jusqu'au :
          </Text>
          <Text style={styles.deadlineDate}>{formatDate(dateLimite.toISOString())}</Text>
        </View>

        {/* Conséquences */}
        <View style={styles.consequencesSection}>
          <Text style={styles.consequencesTitle}>
            À défaut de paiement dans le délai imparti
          </Text>

          <View style={styles.consequenceItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.consequenceText}>
              Nous serons contraints d'engager une procédure judiciaire à votre encontre
              (assignation devant le tribunal) pouvant aboutir à la résiliation du bail
              et à votre expulsion.
            </Text>
          </View>

          <View style={styles.consequenceItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.consequenceText}>
              Des pénalités de retard pourront être appliquées conformément aux
              dispositions de votre contrat de bail.
            </Text>
          </View>

          <View style={styles.consequenceItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.consequenceText}>
              Les frais de procédure et d'huissier seront mis à votre charge.
            </Text>
          </View>

          <View style={styles.consequenceItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.consequenceText}>
              Un signalement pourra être effectué auprès des organismes de fichage
              des mauvais payeurs (ANIL, ADIL).
            </Text>
          </View>
        </View>

        <Text style={styles.paragraph}>
          Nous vous rappelons que le paiement peut être effectué par virement bancaire
          aux coordonnées indiquées dans votre avis d'échéance, ou par tout autre moyen
          de paiement prévu dans votre contrat de bail.
        </Text>

        <Text style={styles.paragraph}>
          En cas de difficultés financières, nous vous invitons à nous contacter
          immédiatement afin d'étudier les possibilités d'un échéancier de paiement.
        </Text>

        {/* Mentions légales */}
        <View style={styles.legalSection}>
          <Text style={styles.legalText}>
            La présente mise en demeure est établie conformément aux articles 1344 et suivants
            du Code civil. Elle constitue le point de départ des intérêts de retard prévus par
            la loi. Cette lettre fait courir les délais légaux et sera produite en justice
            si nécessaire. Nous vous conseillons de conserver ce courrier.
          </Text>
        </View>

        {/* Signature */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>
              Fait à {bailleur.ville}, le {dateDocument}
            </Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureDate}>Le bailleur : {bailleur.nom}</Text>
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

export default MiseEnDemeure

/**
 * Prépare les données pour la génération de la mise en demeure
 * depuis les données brutes de l'application
 *
 * @param {Object} lease - Le bail
 * @param {Object} entity - L'entité juridique
 * @param {Object} tenantGroup - Le groupe de locataires
 * @param {Object} lot - Le lot
 * @param {Object} property - La propriété
 * @param {Array} unpaidPayments - Les paiements impayés
 * @param {Object} options - Options personnalisables
 * @param {number} options.joursDelai - Délai de régularisation en jours (défaut: 8)
 */
export const prepareMiseEnDemeureData = (lease, entity, tenantGroup, lot, property, unpaidPayments, options = {}) => {
  // Construire le détail de la dette à partir des paiements impayés
  const details = unpaidPayments.map(payment => {
    const periodeDate = new Date(payment.due_date || payment.payment_date)
    const periode = periodeDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    const montantDu = parseFloat(payment.amount_due || payment.amount) || 0
    const montantPaye = parseFloat(payment.amount_paid || 0)

    return {
      libelle: `Loyer et charges - ${periode}`,
      montant: montantDu - montantPaye
    }
  })

  // Calculer le total de la dette
  const totalDu = details.reduce((sum, item) => sum + item.montant, 0)

  // Délai personnalisable (minimum 8 jours légalement)
  const joursDelai = Math.max(8, options.joursDelai || 8)

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
    dette: {
      details,
      totalDu
    },
    delai: {
      joursDelai
    }
  }
}
