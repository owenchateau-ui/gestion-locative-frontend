import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import {
  COLORS,
  formatDate,
  generateDocumentNumber
} from '../shared/PDFStyles'

// Styles pour la lettre de résiliation locataire
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
  senderName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.text,
    marginBottom: 2
  },
  senderInfo: {
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
    color: COLORS.primary,
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
  // Encadré date effet
  dateEffetBox: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 3,
    marginBottom: 15,
    textAlign: 'center'
  },
  dateEffetLabel: {
    fontSize: 10,
    color: COLORS.white,
    marginBottom: 4
  },
  dateEffetValue: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white
  },
  // Encadré préavis
  preavisBox: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 3,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning
  },
  preavisTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#92400E',
    marginBottom: 6
  },
  preavisText: {
    fontSize: 9,
    color: '#92400E',
    lineHeight: 1.4
  },
  // Motif (optionnel)
  motifSection: {
    marginBottom: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 3
  },
  motifTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.secondary,
    marginBottom: 8
  },
  motifText: {
    fontSize: 10,
    lineHeight: 1.5
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

// Motifs de congé du locataire
const MOTIFS_LOCATAIRE = {
  convenance: {
    titre: 'Congé pour convenance personnelle',
    description: 'Le locataire souhaite quitter le logement pour des raisons personnelles.'
  },
  mutation: {
    titre: 'Mutation professionnelle',
    description: 'Le locataire quitte le logement suite à une mutation professionnelle.',
    preavisReduit: true
  },
  perte_emploi: {
    titre: 'Perte d\'emploi',
    description: 'Le locataire quitte le logement suite à une perte d\'emploi.',
    preavisReduit: true
  },
  nouvel_emploi: {
    titre: 'Nouvel emploi suite à perte d\'emploi',
    description: 'Le locataire a trouvé un nouvel emploi suite à une période de chômage.',
    preavisReduit: true
  },
  sante: {
    titre: 'Raison de santé',
    description: 'Le locataire quitte le logement pour des raisons de santé justifiées.',
    preavisReduit: true
  },
  rsa: {
    titre: 'Bénéficiaire RSA ou AAH',
    description: 'Le locataire est bénéficiaire du Revenu de Solidarité Active ou de l\'Allocation aux Adultes Handicapés.',
    preavisReduit: true
  },
  attribution_logement_social: {
    titre: 'Attribution d\'un logement social',
    description: 'Le locataire a obtenu l\'attribution d\'un logement social.',
    preavisReduit: true
  },
  zone_tendue: {
    titre: 'Logement en zone tendue',
    description: 'Le logement est situé dans une zone tendue (décret du 10 mai 2013).',
    preavisReduit: true
  }
}

/**
 * Template PDF pour Lettre de Résiliation du Locataire
 *
 * Document envoyé par le locataire pour mettre fin au bail.
 * Préavis standard : 3 mois (non meublé) ou 1 mois (meublé)
 * Préavis réduit à 1 mois dans certains cas (zone tendue, mutation, perte d'emploi, etc.)
 * Conforme à l'article 15 de la loi n° 89-462 du 6 juillet 1989.
 */
const LettreResiliationLocataire = ({ data }) => {
  const {
    locataire,
    bailleur,
    bien,
    resiliation,
    numeroDocument
  } = data

  // Générer le numéro de document si non fourni
  const docNumber = numeroDocument || generateDocumentNumber(
    'resiliation',
    new Date()
  )

  // Date du document
  const dateDocument = formatDate(new Date().toISOString())

  // Récupérer les infos du motif
  const motifInfo = MOTIFS_LOCATAIRE[resiliation.motif] || MOTIFS_LOCATAIRE.convenance

  // Déterminer le préavis
  let dureePrevis = resiliation.typeBail === 'meuble' ? '1 mois' : '3 mois'
  let preavisReduit = resiliation.typeBail === 'meuble'

  // Préavis réduit à 1 mois dans certains cas
  if (motifInfo.preavisReduit || resiliation.preavisReduit) {
    dureePrevis = '1 mois'
    preavisReduit = true
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.senderName}>{locataire.nom}</Text>
            <Text style={styles.senderInfo}>
              {bien.adresse}{'\n'}
              {bien.codePostal} {bien.ville}
              {locataire.telephone && `\nTél : ${locataire.telephone}`}
              {locataire.email && `\nEmail : ${locataire.email}`}
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
            <Text style={styles.recipientName}>{bailleur.nom}</Text>
            <Text style={styles.recipientAddress}>
              {bailleur.adresse}{'\n'}
              {bailleur.codePostal} {bailleur.ville}
            </Text>
          </View>
        </View>

        {/* Titre */}
        <View style={styles.titleSection}>
          <Text style={styles.documentTitle}>Congé du locataire</Text>
          <Text style={styles.documentSubtitle}>
            Article 15 de la loi n° 89-462 du 6 juillet 1989
          </Text>
        </View>

        {/* Corps de lettre */}
        <View style={styles.letterBody}>
          <Text style={styles.letterDate}>
            {bien.ville}, le {dateDocument}
          </Text>

          <Text style={styles.objet}>
            <Text style={styles.objetLabel}>Objet : </Text>
            Résiliation du bail - Préavis de {dureePrevis}
          </Text>

          <Text style={styles.paragraph}>
            Madame, Monsieur,
          </Text>

          <Text style={styles.paragraph}>
            Par la présente, je vous informe de ma décision de résilier le contrat de
            location du logement situé au{' '}
            <Text style={styles.bold}>{bien.adresse}, {bien.codePostal} {bien.ville}</Text>,
            conformément à l'article 15 de la loi n° 89-462 du 6 juillet 1989.
          </Text>
        </View>

        {/* Encadré date d'effet */}
        <View style={styles.dateEffetBox}>
          <Text style={styles.dateEffetLabel}>Date de départ prévue</Text>
          <Text style={styles.dateEffetValue}>{formatDate(resiliation.dateDepart)}</Text>
        </View>

        {/* Motif (si spécifié et préavis réduit) */}
        {preavisReduit && resiliation.motif !== 'convenance' && (
          <View style={styles.motifSection}>
            <Text style={styles.motifTitle}>Motif justifiant le préavis réduit</Text>
            <Text style={styles.motifText}>
              {motifInfo.description}
              {resiliation.motifDetail && `\n\nPrécisions : ${resiliation.motifDetail}`}
            </Text>
          </View>
        )}

        {/* Encadré préavis */}
        <View style={styles.preavisBox}>
          <Text style={styles.preavisTitle}>Durée du préavis : {dureePrevis}</Text>
          <Text style={styles.preavisText}>
            {preavisReduit && resiliation.typeBail !== 'meuble'
              ? `Le préavis est réduit à 1 mois en application de l'article 15 de la loi du 6 juillet 1989 (${motifInfo.titre.toLowerCase()}).`
              : resiliation.typeBail === 'meuble'
                ? 'Le préavis est de 1 mois pour les locations meublées.'
                : 'Le préavis légal est de 3 mois pour les locations non meublées.'}
            {'\n\n'}Je me tiens à votre disposition pour convenir d'un rendez-vous
            afin d'effectuer l'état des lieux de sortie.
          </Text>
        </View>

        <Text style={styles.paragraph}>
          Conformément à la législation en vigueur, le loyer sera dû jusqu'à la date
          effective de départ ou jusqu'à ce qu'un nouveau locataire prenne possession
          des lieux, selon la date la plus proche.
        </Text>

        <Text style={styles.paragraph}>
          Je sollicite la restitution de mon dépôt de garantie dans les délais légaux
          prévus par la loi (un mois si l'état des lieux de sortie est conforme à celui
          d'entrée, deux mois dans le cas contraire).
        </Text>

        <Text style={styles.paragraph}>
          Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations
          distinguées.
        </Text>

        {/* Mentions légales */}
        <View style={styles.legalSection}>
          <Text style={styles.legalText}>
            Conformément à l'article 15 de la loi n° 89-462 du 6 juillet 1989, le locataire
            peut résilier le contrat de location à tout moment, sous réserve du respect
            d'un préavis de trois mois (réduit à un mois pour les locations meublées ou
            dans certains cas prévus par la loi : zone tendue, mutation professionnelle,
            perte d'emploi, premier emploi, nouvel emploi suite à perte d'emploi, raison
            de santé justifiant un changement de domicile, bénéficiaire RSA ou AAH,
            attribution d'un logement social).
          </Text>
        </View>

        {/* Signature */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>
              Fait à {bien.ville}, le {dateDocument}
            </Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureDate}>Le locataire : {locataire.nom}</Text>
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

export default LettreResiliationLocataire

/**
 * Prépare les données pour la génération de la lettre de résiliation locataire
 */
export const prepareLettreResiliationLocataireData = (
  lease,
  entity,
  tenantGroup,
  lot,
  property,
  motif = 'convenance',
  options = {}
) => {
  // Calculer la date de départ (fin du préavis)
  const dateDepart = options.dateDepart || new Date(new Date().setMonth(new Date().getMonth() +
    (options.preavisReduit || lot.furnished ? 1 : 3))).toISOString().split('T')[0]

  // Déterminer le type de bail
  const typeBail = lease.lease_type || (lot.furnished ? 'meuble' : 'non_meuble')

  return {
    locataire: {
      nom: tenantGroup.name,
      email: tenantGroup.email || '',
      telephone: tenantGroup.phone || ''
    },
    bailleur: {
      nom: entity.name,
      adresse: entity.address || '',
      ville: entity.city || '',
      codePostal: entity.postal_code || '',
      email: entity.email || '',
      telephone: entity.phone || ''
    },
    bien: {
      adresse: property.address,
      ville: property.city,
      codePostal: property.postal_code,
      designation: `${lot.name}${lot.reference ? ` (${lot.reference})` : ''}`
    },
    resiliation: {
      motif,
      motifDetail: options.motifDetail || null,
      dateDepart,
      typeBail,
      preavisReduit: options.preavisReduit || false
    }
  }
}
