import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import {
  COLORS,
  formatDate,
  formatMontant,
  generateDocumentNumber
} from '../shared/PDFStyles'

// Styles pour la régularisation des charges
const styles = StyleSheet.create({
  page: {
    padding: 35,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: COLORS.text,
    backgroundColor: COLORS.white
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
    marginBottom: 15
  },
  recipientBox: {
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    width: '55%',
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
  // Titre
  titleSection: {
    marginBottom: 20,
    textAlign: 'center'
  },
  documentTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.text,
    textTransform: 'uppercase',
    marginBottom: 5
  },
  documentSubtitle: {
    fontSize: 10,
    color: COLORS.secondary
  },
  periodeBadge: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 4,
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    alignSelf: 'center',
    marginTop: 10
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
    marginBottom: 12
  },
  bold: {
    fontFamily: 'Helvetica-Bold'
  },
  // Tableau récapitulatif
  table: {
    marginVertical: 15,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  tableHeaderText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.secondary
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  tableRowAlt: {
    backgroundColor: '#FAFAFA'
  },
  tableCell: {
    flex: 2,
    fontSize: 9
  },
  tableCellAmount: {
    flex: 1,
    fontSize: 9,
    textAlign: 'right'
  },
  tableCellBold: {
    fontFamily: 'Helvetica-Bold'
  },
  // Ligne de total
  totalRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: COLORS.primary
  },
  totalCell: {
    flex: 2,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white
  },
  totalCellAmount: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    textAlign: 'right'
  },
  // Encadré résultat
  resultBox: {
    padding: 15,
    borderRadius: 3,
    marginVertical: 15,
    textAlign: 'center'
  },
  resultBoxPositive: {
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
    borderColor: COLORS.success
  },
  resultBoxNegative: {
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: COLORS.danger
  },
  resultLabel: {
    fontSize: 10,
    marginBottom: 4
  },
  resultLabelPositive: {
    color: COLORS.success
  },
  resultLabelNegative: {
    color: COLORS.danger
  },
  resultValue: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold'
  },
  resultValuePositive: {
    color: COLORS.success
  },
  resultValueNegative: {
    color: COLORS.danger
  },
  resultSubtext: {
    fontSize: 8,
    marginTop: 6
  },
  resultSubtextPositive: {
    color: COLORS.success
  },
  resultSubtextNegative: {
    color: COLORS.danger
  },
  // Détail des charges
  chargesSection: {
    marginVertical: 15,
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 3
  },
  chargesTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.secondary,
    marginBottom: 10
  },
  chargesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  chargesLabel: {
    fontSize: 9,
    color: COLORS.text
  },
  chargesValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold'
  },
  // Mentions légales
  legalSection: {
    marginBottom: 15
  },
  legalText: {
    fontSize: 7,
    color: COLORS.textMuted,
    lineHeight: 1.4,
    fontFamily: 'Helvetica-Oblique',
    backgroundColor: COLORS.background,
    padding: 10,
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
 * Template PDF pour la Régularisation Annuelle des Charges
 *
 * Document envoyé au locataire pour la régularisation annuelle des charges.
 * Compare les provisions versées aux charges réelles.
 * Conforme aux articles 23 et 23-1 de la loi n° 89-462 du 6 juillet 1989.
 */
const RegularisationCharges = ({ data }) => {
  const {
    bailleur,
    locataire,
    bien,
    regularisation,
    detailCharges,
    numeroDocument
  } = data

  // Générer le numéro de document si non fourni
  const docNumber = numeroDocument || generateDocumentNumber(
    'regularisation',
    new Date()
  )

  // Date du document
  const dateDocument = formatDate(new Date().toISOString())

  // Calcul du solde
  const solde = regularisation.provisionsVersees - regularisation.chargesReelles
  const isRemboursement = solde > 0

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
            <Text style={styles.recipientName}>{locataire.nom}</Text>
            <Text style={styles.recipientAddress}>
              {bien.adresse}{'\n'}
              {bien.codePostal} {bien.ville}
            </Text>
          </View>
        </View>

        {/* Titre */}
        <View style={styles.titleSection}>
          <Text style={styles.documentTitle}>Régularisation des charges</Text>
          <Text style={styles.documentSubtitle}>
            Articles 23 et 23-1 de la loi n° 89-462 du 6 juillet 1989
          </Text>
          <Text style={styles.periodeBadge}>Période : {regularisation.periode}</Text>
        </View>

        {/* Corps de lettre */}
        <View style={styles.letterBody}>
          <Text style={styles.letterDate}>
            {bailleur.ville}, le {dateDocument}
          </Text>

          <Text style={styles.objet}>
            <Text style={styles.objetLabel}>Objet : </Text>
            Décompte de régularisation des charges locatives {regularisation.periode}
          </Text>

          <Text style={styles.paragraph}>
            Madame, Monsieur,
          </Text>

          <Text style={styles.paragraph}>
            Conformément aux dispositions légales, nous vous adressons le décompte de
            régularisation des charges locatives pour le bien situé au{' '}
            <Text style={styles.bold}>{bien.adresse}, {bien.codePostal} {bien.ville}</Text>,
            pour la période du <Text style={styles.bold}>{regularisation.periode}</Text>.
          </Text>
        </View>

        {/* Tableau récapitulatif */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.tableHeaderText]}>Désignation</Text>
            <Text style={[styles.tableCellAmount, styles.tableHeaderText]}>Montant</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Provisions pour charges versées</Text>
            <Text style={[styles.tableCellAmount, styles.tableCellBold]}>
              {formatMontant(regularisation.provisionsVersees)}
            </Text>
          </View>

          <View style={[styles.tableRow, styles.tableRowAlt]}>
            <Text style={styles.tableCell}>Charges réelles (détail ci-dessous)</Text>
            <Text style={[styles.tableCellAmount, styles.tableCellBold]}>
              {formatMontant(regularisation.chargesReelles)}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalCell}>
              {isRemboursement ? 'Solde en faveur du locataire' : 'Solde dû par le locataire'}
            </Text>
            <Text style={styles.totalCellAmount}>{formatMontant(Math.abs(solde))}</Text>
          </View>
        </View>

        {/* Encadré résultat */}
        <View style={[
          styles.resultBox,
          isRemboursement ? styles.resultBoxPositive : styles.resultBoxNegative
        ]}>
          <Text style={[
            styles.resultLabel,
            isRemboursement ? styles.resultLabelPositive : styles.resultLabelNegative
          ]}>
            {isRemboursement ? 'Montant à vous rembourser' : 'Montant à régulariser'}
          </Text>
          <Text style={[
            styles.resultValue,
            isRemboursement ? styles.resultValuePositive : styles.resultValueNegative
          ]}>
            {formatMontant(Math.abs(solde))}
          </Text>
          <Text style={[
            styles.resultSubtext,
            isRemboursement ? styles.resultSubtextPositive : styles.resultSubtextNegative
          ]}>
            {isRemboursement
              ? 'Ce montant sera déduit de votre prochain loyer ou remboursé par virement.'
              : 'Ce montant sera ajouté à votre prochain loyer ou peut être réglé séparément.'}
          </Text>
        </View>

        {/* Détail des charges */}
        {detailCharges && detailCharges.length > 0 && (
          <View style={styles.chargesSection}>
            <Text style={styles.chargesTitle}>Détail des charges réelles</Text>
            {detailCharges.map((charge, index) => (
              <View key={index} style={styles.chargesRow}>
                <Text style={styles.chargesLabel}>{charge.libelle}</Text>
                <Text style={styles.chargesValue}>{formatMontant(charge.montant)}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.paragraph}>
          Les justificatifs des charges récupérables sont à votre disposition et peuvent
          être consultés sur simple demande, conformément à l'article 23 de la loi du
          6 juillet 1989.
        </Text>

        <Text style={styles.paragraph}>
          {isRemboursement
            ? `Le remboursement de ${formatMontant(Math.abs(solde))} sera effectué ${regularisation.modeRemboursement || 'par déduction sur le prochain loyer'}.`
            : `Le complément de ${formatMontant(Math.abs(solde))} ${regularisation.modeReglement || 'sera ajouté à votre prochain appel de loyer'}.`}
        </Text>

        <Text style={styles.paragraph}>
          Je reste à votre disposition pour toute information complémentaire.
        </Text>

        <Text style={styles.paragraph}>
          Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations
          distinguées.
        </Text>

        {/* Mentions légales */}
        <View style={styles.legalSection}>
          <Text style={styles.legalText}>
            Conformément aux articles 23 et 23-1 de la loi n° 89-462 du 6 juillet 1989,
            le bailleur doit procéder annuellement à la régularisation des charges.
            Seules les charges récupérables limitativement énumérées par le décret
            n° 87-713 du 26 août 1987 peuvent être répercutées sur le locataire.
            Le locataire dispose d'un délai d'un mois pour contester cette régularisation.
            Les pièces justificatives sont tenues à disposition pendant 6 mois suivant
            l'envoi du décompte.
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

export default RegularisationCharges

/**
 * Prépare les données pour la génération de la régularisation des charges
 */
export const prepareRegularisationChargesData = (
  lease,
  entity,
  tenantGroup,
  lot,
  property,
  chargesData
) => {
  // Période concernée
  const periode = chargesData.periode || `${chargesData.annee || new Date().getFullYear()}`

  // Provisions versées (charges mensuelles * nombre de mois)
  const provisionsVersees = chargesData.provisionsVersees ||
    (lease.charges_amount * (chargesData.nombreMois || 12))

  // Charges réelles
  const chargesReelles = chargesData.chargesReelles || 0

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
    regularisation: {
      periode,
      provisionsVersees,
      chargesReelles,
      modeRemboursement: chargesData.modeRemboursement || null,
      modeReglement: chargesData.modeReglement || null
    },
    detailCharges: chargesData.detailCharges || [
      { libelle: 'Eau froide', montant: chargesReelles * 0.25 },
      { libelle: 'Chauffage collectif', montant: chargesReelles * 0.35 },
      { libelle: 'Entretien parties communes', montant: chargesReelles * 0.15 },
      { libelle: 'Ordures ménagères', montant: chargesReelles * 0.15 },
      { libelle: 'Électricité parties communes', montant: chargesReelles * 0.10 }
    ]
  }
}
