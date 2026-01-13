import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import {
  COLORS,
  formatDate,
  generateDocumentNumber
} from '../shared/PDFStyles'

// Styles pour la lettre de résiliation
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
  // Encadré important
  importantBox: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 3,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning
  },
  importantTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#92400E',
    marginBottom: 6
  },
  importantText: {
    fontSize: 9,
    color: '#92400E',
    lineHeight: 1.4
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
  // Motif
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
  legalTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.textMuted,
    marginBottom: 6
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

// Motifs de congé selon la loi
const MOTIFS_CONGE = {
  reprise: {
    titre: 'Congé pour reprise',
    description: 'Le bailleur souhaite reprendre le logement pour l\'habiter lui-même ou y loger un proche (ascendant, descendant, conjoint, partenaire ou concubin).'
  },
  vente: {
    titre: 'Congé pour vente',
    description: 'Le bailleur souhaite vendre le logement libre de toute occupation.'
  },
  motif_legitime: {
    titre: 'Congé pour motif légitime et sérieux',
    description: 'Le bailleur invoque un motif légitime et sérieux justifiant la fin du bail.'
  }
}

/**
 * Template PDF pour Lettre de Résiliation (Congé du Bailleur)
 *
 * Document envoyé par le bailleur pour mettre fin au bail.
 * Doit respecter un préavis de 6 mois (non meublé) ou 3 mois (meublé).
 * Conforme à l'article 15 de la loi n° 89-462 du 6 juillet 1989.
 */
const LettreResiliation = ({ data }) => {
  const {
    bailleur,
    locataire,
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
  const motifInfo = MOTIFS_CONGE[resiliation.motif] || MOTIFS_CONGE.motif_legitime

  // Déterminer le préavis selon le type de bail
  const dureePrevis = resiliation.typeBail === 'meuble' ? '3 mois' : '6 mois'

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
          <Text style={styles.documentTitle}>{motifInfo.titre}</Text>
          <Text style={styles.documentSubtitle}>
            Article 15 de la loi n° 89-462 du 6 juillet 1989
          </Text>
        </View>

        {/* Corps de lettre */}
        <View style={styles.letterBody}>
          <Text style={styles.letterDate}>
            {bailleur.ville}, le {dateDocument}
          </Text>

          <Text style={styles.objet}>
            <Text style={styles.objetLabel}>Objet : </Text>
            Congé donné au locataire - {motifInfo.titre}
          </Text>

          <Text style={styles.paragraph}>
            Madame, Monsieur,
          </Text>

          <Text style={styles.paragraph}>
            Je soussigné(e) <Text style={styles.bold}>{bailleur.nom}</Text>, propriétaire
            du logement situé au <Text style={styles.bold}>{bien.adresse}, {bien.codePostal} {bien.ville}</Text>,
            vous informe par la présente de ma décision de mettre fin au contrat de location
            qui nous lie, conformément à l'article 15 de la loi n° 89-462 du 6 juillet 1989.
          </Text>
        </View>

        {/* Encadré date d'effet */}
        <View style={styles.dateEffetBox}>
          <Text style={styles.dateEffetLabel}>Date de fin du bail</Text>
          <Text style={styles.dateEffetValue}>{formatDate(resiliation.dateEffet)}</Text>
        </View>

        {/* Motif */}
        <View style={styles.motifSection}>
          <Text style={styles.motifTitle}>Motif du congé</Text>
          <Text style={styles.motifText}>
            {motifInfo.description}
            {resiliation.motifDetail && `\n\n${resiliation.motifDetail}`}
          </Text>
          {resiliation.motif === 'reprise' && resiliation.beneficiaire && (
            <Text style={[styles.motifText, { marginTop: 8 }]}>
              <Text style={styles.bold}>Bénéficiaire de la reprise : </Text>
              {resiliation.beneficiaire.nom} ({resiliation.beneficiaire.lien})
            </Text>
          )}
        </View>

        <Text style={styles.paragraph}>
          Ce congé vous est notifié dans le respect du délai de préavis légal de{' '}
          <Text style={styles.bold}>{dureePrevis}</Text> avant la date d'échéance du bail.
        </Text>

        <Text style={styles.paragraph}>
          Je vous rappelle que vous devez libérer les lieux et me restituer les clés
          au plus tard le <Text style={styles.bold}>{formatDate(resiliation.dateEffet)}</Text>.
          Un état des lieux de sortie sera effectué à cette occasion.
        </Text>

        {/* Encadré important */}
        <View style={styles.importantBox}>
          <Text style={styles.importantTitle}>Vos droits</Text>
          <Text style={styles.importantText}>
            {resiliation.motif === 'vente'
              ? 'Conformément à la loi, vous bénéficiez d\'un droit de préemption sur le logement. Vous disposez des deux premiers mois du préavis pour vous porter acquéreur aux conditions mentionnées dans cette lettre.'
              : 'Vous disposez d\'un délai de deux mois à compter de la réception de cette lettre pour contester ce congé devant le tribunal judiciaire si vous estimez qu\'il est injustifié.'}
          </Text>
        </View>

        <Text style={styles.paragraph}>
          Je reste à votre disposition pour toute information complémentaire et pour
          convenir d'un rendez-vous afin d'organiser votre départ et l'état des lieux de sortie.
        </Text>

        <Text style={styles.paragraph}>
          Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.
        </Text>

        {/* Mentions légales */}
        <View style={styles.legalSection}>
          <Text style={styles.legalText}>
            Le présent congé est délivré conformément aux dispositions de l'article 15 de la loi
            n° 89-462 du 6 juillet 1989 modifiée. En cas de contestation, le locataire dispose
            d'un délai de deux mois pour saisir le juge des contentieux de la protection.
            {resiliation.motif === 'reprise' && ' Pour le congé pour reprise, le bailleur doit justifier du caractère réel et sérieux de sa décision de reprendre le logement.'}
            {resiliation.motif === 'vente' && ' Pour le congé pour vente, le locataire bénéficie d\'un droit de préemption aux conditions indiquées dans le congé.'}
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

export default LettreResiliation

/**
 * Prépare les données pour la génération de la lettre de résiliation
 * depuis les données brutes de l'application
 */
export const prepareLettreResiliationData = (
  lease,
  entity,
  tenantGroup,
  lot,
  property,
  motif = 'motif_legitime',
  options = {}
) => {
  // Calculer la date d'effet (fin du bail)
  const dateEffet = options.dateEffet || lease.end_date

  // Déterminer le type de bail
  const typeBail = lease.lease_type || (lot.furnished ? 'meuble' : 'non_meuble')

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
    resiliation: {
      motif,
      motifDetail: options.motifDetail || null,
      dateEffet,
      typeBail,
      beneficiaire: options.beneficiaire || null // Pour congé pour reprise
    }
  }
}
