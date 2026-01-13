import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import {
  COLORS,
  formatMontant,
  formatDate,
  generateDocumentNumber
} from '../shared/PDFStyles'

// Styles pour le congé pour vente
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
    padding: 10,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    width: '55%',
    alignSelf: 'flex-end'
  },
  envoi: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.danger,
    marginBottom: 4
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
    textAlign: 'center',
    backgroundColor: COLORS.warning,
    padding: 10,
    borderRadius: 3
  },
  documentTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    textTransform: 'uppercase'
  },
  documentSubtitle: {
    fontSize: 9,
    color: COLORS.white,
    marginTop: 3
  },
  // Corps de lettre
  letterBody: {
    marginBottom: 10
  },
  letterDate: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginBottom: 12,
    textAlign: 'right'
  },
  objet: {
    fontSize: 10,
    marginBottom: 12
  },
  objetLabel: {
    fontFamily: 'Helvetica-Bold'
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.5,
    textAlign: 'justify',
    marginBottom: 8
  },
  bold: {
    fontFamily: 'Helvetica-Bold'
  },
  // Encadré prix
  priceBox: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 3,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.warning
  },
  priceTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#92400E',
    marginBottom: 8,
    textAlign: 'center'
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  priceLabel: {
    fontSize: 10,
    color: COLORS.text
  },
  priceValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#92400E'
  },
  // Droit de préemption
  preemptionBox: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 3,
    marginBottom: 12
  },
  preemptionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    marginBottom: 8,
    textAlign: 'center'
  },
  preemptionText: {
    fontSize: 9,
    color: COLORS.white,
    lineHeight: 1.4
  },
  preemptionDeadline: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 6,
    borderRadius: 3
  },
  // Conditions de vente
  conditionsSection: {
    marginBottom: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 3
  },
  conditionsTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.secondary,
    marginBottom: 8
  },
  conditionItem: {
    flexDirection: 'row',
    marginBottom: 4
  },
  bullet: {
    fontSize: 10,
    marginRight: 6,
    color: COLORS.secondary
  },
  conditionText: {
    fontSize: 9,
    flex: 1,
    lineHeight: 1.4
  },
  // Date d'effet
  dateEffetBox: {
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 3,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dateEffetLabel: {
    fontSize: 10,
    color: COLORS.text
  },
  dateEffetValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary
  },
  // Mentions légales
  legalText: {
    fontSize: 7,
    color: COLORS.textMuted,
    lineHeight: 1.4,
    fontFamily: 'Helvetica-Oblique',
    backgroundColor: COLORS.background,
    padding: 8,
    borderRadius: 3,
    marginBottom: 12
  },
  // Signature
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8
  },
  signatureBox: {
    width: '45%'
  },
  signatureLabel: {
    fontSize: 8,
    color: COLORS.textMuted,
    marginBottom: 2
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.text,
    height: 25,
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
    paddingTop: 6,
    textAlign: 'center'
  },
  footerText: {
    fontSize: 7,
    color: COLORS.textMuted
  }
})

/**
 * Template PDF pour Congé pour Vente
 *
 * Document envoyé par le bailleur pour mettre fin au bail
 * en vue de vendre le logement. Le locataire bénéficie d'un
 * droit de préemption (priorité d'achat).
 *
 * Conforme à l'article 15-II de la loi n° 89-462 du 6 juillet 1989.
 */
const CongeVente = ({ data }) => {
  const {
    bailleur,
    locataire,
    bien,
    vente,
    numeroDocument
  } = data

  // Générer le numéro de document si non fourni
  const docNumber = numeroDocument || generateDocumentNumber(
    'conge_vente',
    new Date()
  )

  // Date du document
  const dateDocument = formatDate(new Date().toISOString())

  // Calculer la date limite de réponse (2 mois)
  const dateLimiteReponse = new Date()
  dateLimiteReponse.setMonth(dateLimiteReponse.getMonth() + 2)

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

        {/* Titre */}
        <View style={styles.titleSection}>
          <Text style={styles.documentTitle}>Congé pour Vente</Text>
          <Text style={styles.documentSubtitle}>
            Article 15-II de la loi n° 89-462 du 6 juillet 1989
          </Text>
        </View>

        {/* Corps de lettre */}
        <View style={styles.letterBody}>
          <Text style={styles.letterDate}>
            {bailleur.ville}, le {dateDocument}
          </Text>

          <Text style={styles.objet}>
            <Text style={styles.objetLabel}>Objet : </Text>
            Congé pour vente avec offre de vente
          </Text>

          <Text style={styles.paragraph}>
            Madame, Monsieur,
          </Text>

          <Text style={styles.paragraph}>
            Je soussigné(e) <Text style={styles.bold}>{bailleur.nom}</Text>, propriétaire
            du logement situé au <Text style={styles.bold}>{bien.adresse}, {bien.codePostal} {bien.ville}</Text>,
            vous notifie par la présente mon intention de vendre ce logement.
          </Text>

          <Text style={styles.paragraph}>
            Ce congé prendra effet à la date d'échéance de votre bail.
            Conformément à la loi, vous bénéficiez d'un <Text style={styles.bold}>droit de préemption</Text> vous
            permettant d'acquérir le logement en priorité aux conditions décrites ci-après.
          </Text>
        </View>

        {/* Encadré prix */}
        <View style={styles.priceBox}>
          <Text style={styles.priceTitle}>CONDITIONS DE VENTE</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Prix de vente proposé :</Text>
            <Text style={styles.priceValue}>{formatMontant(vente.prixVente)}</Text>
          </View>
          {vente.fraisAgence > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Frais d'agence (à la charge de l'acquéreur) :</Text>
              <Text style={styles.priceValue}>{formatMontant(vente.fraisAgence)}</Text>
            </View>
          )}
          <View style={[styles.priceRow, { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#D97706' }]}>
            <Text style={[styles.priceLabel, { fontFamily: 'Helvetica-Bold' }]}>Total acquisition :</Text>
            <Text style={styles.priceValue}>
              {formatMontant(vente.prixVente + (vente.fraisAgence || 0))}
            </Text>
          </View>
        </View>

        {/* Droit de préemption */}
        <View style={styles.preemptionBox}>
          <Text style={styles.preemptionTitle}>VOTRE DROIT DE PRÉEMPTION</Text>
          <Text style={styles.preemptionText}>
            En application de l'article 15-II de la loi du 6 juillet 1989, vous bénéficiez
            d'un droit de préemption. Cette offre de vente est valable pendant les deux
            premiers mois du délai de préavis. Passé ce délai, l'offre sera caduque.
          </Text>
          <Text style={styles.preemptionDeadline}>
            Date limite de réponse : {formatDate(dateLimiteReponse.toISOString())}
          </Text>
        </View>

        {/* Conditions de vente */}
        <View style={styles.conditionsSection}>
          <Text style={styles.conditionsTitle}>Conditions de la vente</Text>

          <View style={styles.conditionItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.conditionText}>
              <Text style={styles.bold}>Mode de paiement :</Text> {vente.modePaiement || 'Comptant à la signature de l\'acte authentique'}
            </Text>
          </View>

          <View style={styles.conditionItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.conditionText}>
              <Text style={styles.bold}>Délai de réalisation :</Text> {vente.delaiRealisation || '4 mois maximum après acceptation'}
            </Text>
          </View>

          {vente.conditionsParticulieres && (
            <View style={styles.conditionItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.conditionText}>
                <Text style={styles.bold}>Conditions particulières :</Text> {vente.conditionsParticulieres}
              </Text>
            </View>
          )}

          <View style={styles.conditionItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.conditionText}>
              Le bien est vendu {vente.avecOuSansMobilier || 'sans mobilier'}, dans l'état où il se trouve.
            </Text>
          </View>
        </View>

        {/* Date d'effet */}
        <View style={styles.dateEffetBox}>
          <Text style={styles.dateEffetLabel}>
            À défaut d'exercice du droit de préemption, le bail prendra fin le :
          </Text>
          <Text style={styles.dateEffetValue}>{formatDate(vente.dateEffet)}</Text>
        </View>

        <Text style={styles.paragraph}>
          Si vous souhaitez acquérir le logement, vous devez m'en informer par lettre
          recommandée avec accusé de réception dans le délai de deux mois.
          L'acceptation de l'offre entraîne l'obligation de réaliser la vente dans les
          conditions proposées.
        </Text>

        <Text style={styles.paragraph}>
          Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.
        </Text>

        {/* Mentions légales */}
        <View style={styles.legalText}>
          <Text>
            Mentions obligatoires (article 15-II loi 89-462) : Ce congé vaut offre de vente au profit du locataire.
            L'offre est valable pendant les deux premiers mois du délai de préavis.
            À défaut de réponse dans ce délai, le locataire sera déchu de son droit de préemption.
            Si le propriétaire décide de vendre à des conditions plus avantageuses pour l'acquéreur,
            il devra notifier une nouvelle offre au locataire.
            Les locataires âgés de plus de 65 ans et dont les ressources sont inférieures au plafond
            en vigueur bénéficient d'une protection renforcée.
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

export default CongeVente

/**
 * Prépare les données pour la génération du congé pour vente
 * depuis les données brutes de l'application
 */
export const prepareCongeVenteData = (
  lease,
  entity,
  tenantGroup,
  lot,
  property,
  venteDetails
) => {
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
      designation: `${lot.name}${lot.reference ? ` (${lot.reference})` : ''}`,
      surface: lot.surface_area,
      nbPieces: lot.nb_rooms
    },
    vente: {
      prixVente: venteDetails.prixVente,
      fraisAgence: venteDetails.fraisAgence || 0,
      modePaiement: venteDetails.modePaiement || 'Comptant à la signature de l\'acte authentique',
      delaiRealisation: venteDetails.delaiRealisation || '4 mois maximum après acceptation',
      conditionsParticulieres: venteDetails.conditionsParticulieres || null,
      avecOuSansMobilier: lot.furnished ? 'avec mobilier' : 'sans mobilier',
      dateEffet: lease.end_date
    }
  }
}
