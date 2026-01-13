import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import {
  COLORS,
  formatMontant,
  formatDate,
  generateDocumentNumber
} from '../shared/PDFStyles'

// Styles pour la lettre d'indexation
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: COLORS.text,
    backgroundColor: COLORS.white
  },
  // En-tête expéditeur
  expediteur: {
    marginBottom: 30
  },
  expediteurName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2
  },
  expediteurInfo: {
    fontSize: 9,
    color: COLORS.textMuted,
    lineHeight: 1.4
  },
  // Destinataire
  destinataire: {
    marginLeft: 'auto',
    width: '50%',
    marginBottom: 25
  },
  destinataireLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginBottom: 4
  },
  destinataireName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2
  },
  destinataireAddress: {
    fontSize: 9,
    lineHeight: 1.4
  },
  // Références et date
  references: {
    marginBottom: 25
  },
  referenceRow: {
    flexDirection: 'row',
    marginBottom: 3
  },
  referenceLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    width: '30%'
  },
  referenceValue: {
    fontSize: 9
  },
  // Objet
  objet: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  objetLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginBottom: 2
  },
  objetText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold'
  },
  // Corps de lettre
  body: {
    marginBottom: 20
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
  // Tableau calcul
  calculBox: {
    backgroundColor: COLORS.background,
    padding: 15,
    borderRadius: 4,
    marginBottom: 20
  },
  calculTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    marginBottom: 12,
    textAlign: 'center'
  },
  calculRow: {
    flexDirection: 'row',
    marginBottom: 6
  },
  calculLabel: {
    width: '60%',
    fontSize: 9
  },
  calculValue: {
    width: '40%',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right'
  },
  calculFormule: {
    marginTop: 10,
    padding: 10,
    backgroundColor: COLORS.white,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  formuleText: {
    fontSize: 9,
    textAlign: 'center',
    fontFamily: 'Helvetica-Oblique',
    color: COLORS.textMuted
  },
  // Résultat
  resultBox: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 4,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  resultLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white
  },
  resultValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white
  },
  // Comparaison
  comparisonBox: {
    flexDirection: 'row',
    marginBottom: 20
  },
  comparisonItem: {
    flex: 1,
    padding: 10,
    borderRadius: 3
  },
  comparisonOld: {
    backgroundColor: '#FEF2F2',
    marginRight: 5
  },
  comparisonNew: {
    backgroundColor: '#ECFDF5',
    marginLeft: 5
  },
  comparisonLabel: {
    fontSize: 8,
    color: COLORS.textMuted,
    marginBottom: 4
  },
  comparisonValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold'
  },
  comparisonValueOld: {
    color: COLORS.danger
  },
  comparisonValueNew: {
    color: COLORS.success
  },
  // Date d'effet
  dateEffetBox: {
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 4,
    marginBottom: 20
  },
  dateEffetText: {
    fontSize: 10,
    textAlign: 'center'
  },
  // Mentions légales
  legalNotice: {
    fontSize: 7,
    color: COLORS.textMuted,
    fontFamily: 'Helvetica-Oblique',
    padding: 10,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    marginBottom: 20,
    lineHeight: 1.5
  },
  // Signature
  signature: {
    marginTop: 20
  },
  signatureFormule: {
    fontSize: 9,
    marginBottom: 10
  },
  signatureBox: {
    width: '45%',
    marginLeft: 'auto'
  },
  signatureLabel: {
    fontSize: 8,
    color: COLORS.textMuted,
    marginBottom: 3
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.text,
    height: 40,
    marginBottom: 2
  },
  signatureDate: {
    fontSize: 7,
    color: COLORS.textMuted
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
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
 * Lettre d'indexation IRL
 * Notification de révision du loyer selon l'Indice de Référence des Loyers
 */
const LettreIndexation = ({ data }) => {
  const {
    bailleur,
    locataire,
    bien,
    indexation
  } = data

  const docNumber = generateDocumentNumber('indexation', new Date())
  const dateEmission = formatDate(new Date().toISOString())

  // Calcul de la variation
  const variation = indexation.nouveauLoyer - indexation.ancienLoyer
  const variationPourcent = ((variation / indexation.ancienLoyer) * 100).toFixed(2)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Expéditeur */}
        <View style={styles.expediteur}>
          <Text style={styles.expediteurName}>{bailleur.nom}</Text>
          <Text style={styles.expediteurInfo}>
            {bailleur.adresse}{'\n'}
            {bailleur.codePostal} {bailleur.ville}
            {bailleur.telephone && `\nTél : ${bailleur.telephone}`}
            {bailleur.email && `\n${bailleur.email}`}
          </Text>
        </View>

        {/* Destinataire */}
        <View style={styles.destinataire}>
          <Text style={styles.destinataireLabel}>À l'attention de :</Text>
          <Text style={styles.destinataireName}>{locataire.nom}</Text>
          <Text style={styles.destinataireAddress}>
            {bien.adresse}{'\n'}
            {bien.codePostal} {bien.ville}
          </Text>
        </View>

        {/* Références */}
        <View style={styles.references}>
          <View style={styles.referenceRow}>
            <Text style={styles.referenceLabel}>Lieu et date :</Text>
            <Text style={styles.referenceValue}>
              {bailleur.ville}, le {dateEmission}
            </Text>
          </View>
          <View style={styles.referenceRow}>
            <Text style={styles.referenceLabel}>Référence :</Text>
            <Text style={styles.referenceValue}>{docNumber}</Text>
          </View>
        </View>

        {/* Objet */}
        <View style={styles.objet}>
          <Text style={styles.objetLabel}>Objet :</Text>
          <Text style={styles.objetText}>
            Révision annuelle du loyer - Application de l'IRL
          </Text>
        </View>

        {/* Corps de la lettre */}
        <View style={styles.body}>
          <Text style={styles.paragraph}>
            Madame, Monsieur,
          </Text>

          <Text style={styles.paragraph}>
            Conformément aux dispositions de l'article 17-1 de la loi n° 89-462 du 6 juillet 1989
            et aux termes de votre contrat de bail, je vous informe que le loyer du logement
            que vous occupez au <Text style={styles.bold}>{bien.adresse}, {bien.codePostal} {bien.ville}</Text>{' '}
            est révisé à compter du <Text style={styles.bold}>{formatDate(indexation.dateEffet)}</Text>.
          </Text>

          <Text style={styles.paragraph}>
            Cette révision est calculée sur la base de la variation de l'Indice de Référence
            des Loyers (IRL) publié par l'INSEE.
          </Text>
        </View>

        {/* Calcul détaillé */}
        <View style={styles.calculBox}>
          <Text style={styles.calculTitle}>DÉTAIL DU CALCUL</Text>

          <View style={styles.calculRow}>
            <Text style={styles.calculLabel}>Loyer actuel (hors charges) :</Text>
            <Text style={styles.calculValue}>{formatMontant(indexation.ancienLoyer)}</Text>
          </View>

          <View style={styles.calculRow}>
            <Text style={styles.calculLabel}>IRL de référence du bail ({indexation.ancienTrimestre}) :</Text>
            <Text style={styles.calculValue}>{indexation.ancienIRL}</Text>
          </View>

          <View style={styles.calculRow}>
            <Text style={styles.calculLabel}>Nouvel IRL ({indexation.nouveauTrimestre}) :</Text>
            <Text style={styles.calculValue}>{indexation.nouveauIRL}</Text>
          </View>

          <View style={styles.calculFormule}>
            <Text style={styles.formuleText}>
              Nouveau loyer = Ancien loyer × (Nouvel IRL / Ancien IRL)
            </Text>
            <Text style={[styles.formuleText, { marginTop: 4 }]}>
              {formatMontant(indexation.ancienLoyer)} × ({indexation.nouveauIRL} / {indexation.ancienIRL}) = {formatMontant(indexation.nouveauLoyer)}
            </Text>
          </View>
        </View>

        {/* Résultat */}
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>Nouveau loyer mensuel :</Text>
          <Text style={styles.resultValue}>{formatMontant(indexation.nouveauLoyer)}</Text>
        </View>

        {/* Comparaison ancien/nouveau */}
        <View style={styles.comparisonBox}>
          <View style={[styles.comparisonItem, styles.comparisonOld]}>
            <Text style={styles.comparisonLabel}>Ancien loyer</Text>
            <Text style={[styles.comparisonValue, styles.comparisonValueOld]}>
              {formatMontant(indexation.ancienLoyer)}
            </Text>
          </View>
          <View style={[styles.comparisonItem, styles.comparisonNew]}>
            <Text style={styles.comparisonLabel}>Nouveau loyer (+{variationPourcent}%)</Text>
            <Text style={[styles.comparisonValue, styles.comparisonValueNew]}>
              {formatMontant(indexation.nouveauLoyer)}
            </Text>
          </View>
        </View>

        {/* Date d'effet */}
        <View style={styles.dateEffetBox}>
          <Text style={styles.dateEffetText}>
            <Text style={styles.bold}>Date d'effet :</Text> {formatDate(indexation.dateEffet)}
          </Text>
        </View>

        {/* Mentions légales */}
        <View style={styles.legalNotice}>
          <Text>
            Conformément à l'article 17-1 de la loi du 6 juillet 1989, la révision du loyer
            prend effet à la date convenue entre les parties ou, à défaut, à la date anniversaire
            du contrat. Le montant des charges reste inchangé et fera l'objet d'une régularisation
            annuelle distincte. Les indices IRL sont publiés trimestriellement par l'INSEE
            (Institut National de la Statistique et des Études Économiques).
          </Text>
        </View>

        {/* Signature */}
        <View style={styles.signature}>
          <Text style={styles.signatureFormule}>
            Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.
          </Text>

          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>
              Fait à {bailleur.ville || '...'}, le {dateEmission}
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

export default LettreIndexation

/**
 * Prépare les données pour la génération de lettre d'indexation
 */
export const prepareLettreIndexationData = (lease, entity, tenantGroup, lot, property, indexationData) => {
  return {
    bailleur: {
      nom: entity.name,
      adresse: entity.address || '',
      ville: entity.city || '',
      codePostal: entity.postal_code || '',
      email: entity.email || '',
      telephone: entity.phone || ''
    },
    locataire: {
      nom: tenantGroup.name
    },
    bien: {
      adresse: property.address,
      ville: property.city,
      codePostal: property.postal_code
    },
    indexation: {
      ancienLoyer: parseFloat(indexationData.old_rent) || parseFloat(lease.rent_amount) || 0,
      nouveauLoyer: parseFloat(indexationData.new_rent) || 0,
      ancienIRL: indexationData.old_irl_value || 0,
      nouveauIRL: indexationData.new_irl_value || 0,
      ancienTrimestre: indexationData.old_irl_quarter || '',
      nouveauTrimestre: indexationData.new_irl_quarter || '',
      dateEffet: indexationData.effective_date || lease.start_date
    }
  }
}
