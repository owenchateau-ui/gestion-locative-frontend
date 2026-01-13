import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import {
  COLORS,
  formatDate,
  formatMontant,
  generateDocumentNumber
} from '../shared/PDFStyles'

// Styles pour l'accord d'échéancier
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
  // Parties
  partiesSection: {
    marginBottom: 20
  },
  partiesTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.secondary,
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  partyBox: {
    padding: 10,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    marginBottom: 10
  },
  partyLabel: {
    fontSize: 8,
    color: COLORS.textMuted,
    marginBottom: 4
  },
  partyName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold'
  },
  partyAddress: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2
  },
  // Corps
  paragraph: {
    fontSize: 10,
    lineHeight: 1.6,
    textAlign: 'justify',
    marginBottom: 12
  },
  bold: {
    fontFamily: 'Helvetica-Bold'
  },
  // Encadré dette
  detteBox: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 3,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.danger
  },
  detteTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.danger,
    marginBottom: 6
  },
  detteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  detteLabel: {
    fontSize: 9,
    color: '#7F1D1D'
  },
  detteValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#7F1D1D'
  },
  detteTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.danger
  },
  detteTotalLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.danger
  },
  detteTotalValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.danger
  },
  // Tableau échéancier
  table: {
    marginVertical: 15,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 10
  },
  tableHeaderText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white
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
    flex: 1,
    fontSize: 9
  },
  tableCellCenter: {
    textAlign: 'center'
  },
  tableCellRight: {
    textAlign: 'right'
  },
  tableCellBold: {
    fontFamily: 'Helvetica-Bold'
  },
  // Encadré conditions
  conditionsBox: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 3,
    marginBottom: 15
  },
  conditionsTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.secondary,
    marginBottom: 8
  },
  conditionItem: {
    flexDirection: 'row',
    marginBottom: 6
  },
  conditionBullet: {
    width: 15,
    fontSize: 9
  },
  conditionText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.4
  },
  // Encadré avertissement
  warningBox: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 3,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning
  },
  warningTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#92400E',
    marginBottom: 6
  },
  warningText: {
    fontSize: 9,
    color: '#92400E',
    lineHeight: 1.4
  },
  // Signatures
  signaturesSection: {
    marginTop: 20,
    marginBottom: 15
  },
  signaturesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  signatureBox: {
    width: '45%'
  },
  signatureTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.secondary,
    marginBottom: 8
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
  luApprouve: {
    fontSize: 8,
    fontFamily: 'Helvetica-Oblique',
    color: COLORS.textMuted,
    marginTop: 4
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
 * Template PDF pour Accord d'Échéancier de Paiement
 *
 * Document formalisant un accord amiable de remboursement de dette locative
 * entre le bailleur et le locataire, échelonné sur plusieurs mensualités.
 */
const AccordEcheancier = ({ data }) => {
  const {
    bailleur,
    locataire,
    bien,
    dette,
    echeancier,
    conditions,
    numeroDocument
  } = data

  // Générer le numéro de document si non fourni
  const docNumber = numeroDocument || generateDocumentNumber(
    'echeancier',
    new Date()
  )

  // Date du document
  const dateDocument = formatDate(new Date().toISOString())

  // Calcul du total des échéances
  const totalEcheances = echeancier.reduce((sum, e) => sum + e.montant, 0)

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

        {/* Titre */}
        <View style={styles.titleSection}>
          <Text style={styles.documentTitle}>Accord d'échéancier de paiement</Text>
          <Text style={styles.documentSubtitle}>
            Protocole d'accord amiable pour le remboursement de la dette locative
          </Text>
        </View>

        {/* Parties */}
        <View style={styles.partiesSection}>
          <Text style={styles.partiesTitle}>Entre les parties</Text>

          <View style={styles.partyBox}>
            <Text style={styles.partyLabel}>LE BAILLEUR</Text>
            <Text style={styles.partyName}>{bailleur.nom}</Text>
            <Text style={styles.partyAddress}>
              {bailleur.adresse}, {bailleur.codePostal} {bailleur.ville}
            </Text>
          </View>

          <View style={styles.partyBox}>
            <Text style={styles.partyLabel}>LE LOCATAIRE</Text>
            <Text style={styles.partyName}>{locataire.nom}</Text>
            <Text style={styles.partyAddress}>
              {bien.adresse}, {bien.codePostal} {bien.ville}
            </Text>
          </View>
        </View>

        {/* Introduction */}
        <Text style={styles.paragraph}>
          Les parties conviennent d'un commun accord de mettre en place un échéancier
          de paiement pour le règlement de la dette locative arrêtée au{' '}
          <Text style={styles.bold}>{formatDate(dette.dateArrete)}</Text>.
        </Text>

        {/* Encadré dette */}
        <View style={styles.detteBox}>
          <Text style={styles.detteTitle}>Récapitulatif de la dette</Text>

          {dette.details && dette.details.map((item, index) => (
            <View key={index} style={styles.detteRow}>
              <Text style={styles.detteLabel}>{item.libelle}</Text>
              <Text style={styles.detteValue}>{formatMontant(item.montant)}</Text>
            </View>
          ))}

          <View style={styles.detteTotalRow}>
            <Text style={styles.detteTotalLabel}>Total de la dette</Text>
            <Text style={styles.detteTotalValue}>{formatMontant(dette.total)}</Text>
          </View>
        </View>

        <Text style={styles.paragraph}>
          Le locataire s'engage à rembourser cette dette selon l'échéancier suivant,
          <Text style={styles.bold}> en plus du loyer courant</Text>, qui devra
          continuer à être payé normalement à chaque échéance.
        </Text>

        {/* Tableau échéancier */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.tableHeaderText]}>N°</Text>
            <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 2 }]}>Date d'échéance</Text>
            <Text style={[styles.tableCell, styles.tableHeaderText, styles.tableCellRight]}>Montant</Text>
            <Text style={[styles.tableCell, styles.tableHeaderText, styles.tableCellRight]}>Reste dû</Text>
          </View>

          {echeancier.map((echeance, index) => {
            const resteDu = dette.total - echeancier.slice(0, index + 1).reduce((sum, e) => sum + e.montant, 0)
            return (
              <View key={index} style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}>
                <Text style={[styles.tableCell, styles.tableCellCenter]}>{index + 1}</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>{formatDate(echeance.date)}</Text>
                <Text style={[styles.tableCell, styles.tableCellRight, styles.tableCellBold]}>
                  {formatMontant(echeance.montant)}
                </Text>
                <Text style={[styles.tableCell, styles.tableCellRight]}>
                  {formatMontant(Math.max(0, resteDu))}
                </Text>
              </View>
            )
          })}
        </View>

        {/* Conditions */}
        <View style={styles.conditionsBox}>
          <Text style={styles.conditionsTitle}>Conditions de l'accord</Text>

          <View style={styles.conditionItem}>
            <Text style={styles.conditionBullet}>1.</Text>
            <Text style={styles.conditionText}>
              Le locataire s'engage à respecter scrupuleusement les dates et montants
              de l'échéancier ci-dessus.
            </Text>
          </View>

          <View style={styles.conditionItem}>
            <Text style={styles.conditionBullet}>2.</Text>
            <Text style={styles.conditionText}>
              Le loyer courant doit être payé à sa date d'exigibilité normale,
              indépendamment de l'échéancier.
            </Text>
          </View>

          <View style={styles.conditionItem}>
            <Text style={styles.conditionBullet}>3.</Text>
            <Text style={styles.conditionText}>
              Tout retard de paiement de plus de {conditions?.delaiRetard || '15'} jours
              entraînera la caducité de plein droit du présent accord.
            </Text>
          </View>

          <View style={styles.conditionItem}>
            <Text style={styles.conditionBullet}>4.</Text>
            <Text style={styles.conditionText}>
              En cas de caducité, l'intégralité de la dette restante deviendra
              immédiatement exigible.
            </Text>
          </View>

          {conditions?.autres && (
            <View style={styles.conditionItem}>
              <Text style={styles.conditionBullet}>5.</Text>
              <Text style={styles.conditionText}>{conditions.autres}</Text>
            </View>
          )}
        </View>

        {/* Avertissement */}
        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>Important</Text>
          <Text style={styles.warningText}>
            Le présent accord ne constitue pas une renonciation du bailleur à ses droits.
            En cas de non-respect de l'échéancier, le bailleur se réserve le droit d'engager
            ou de poursuivre toute procédure de recouvrement, y compris la résiliation
            du bail pour défaut de paiement.
          </Text>
        </View>

        {/* Signatures */}
        <View style={styles.signaturesSection}>
          <View style={styles.signaturesRow}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureTitle}>LE BAILLEUR</Text>
              <Text style={styles.signatureLabel}>
                Fait à {bailleur.ville}, le {dateDocument}
              </Text>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureDate}>{bailleur.nom}</Text>
              <Text style={styles.luApprouve}>Lu et approuvé</Text>
            </View>

            <View style={styles.signatureBox}>
              <Text style={styles.signatureTitle}>LE LOCATAIRE</Text>
              <Text style={styles.signatureLabel}>
                Fait à {bien.ville}, le {dateDocument}
              </Text>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureDate}>{locataire.nom}</Text>
              <Text style={styles.luApprouve}>Lu et approuvé, bon pour accord</Text>
            </View>
          </View>
        </View>

        {/* Mentions légales */}
        <View style={styles.legalSection}>
          <Text style={styles.legalText}>
            Le présent accord est établi en deux exemplaires originaux, chacune des parties
            reconnaissant avoir reçu le sien. Cet accord est conclu à titre amiable et
            ne peut être interprété comme une reconnaissance de dette au sens de l'article
            1376 du Code civil. Le bailleur conserve tous ses droits concernant la créance
            en cas de non-respect de l'échéancier par le locataire.
          </Text>
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

export default AccordEcheancier

/**
 * Prépare les données pour la génération de l'accord d'échéancier
 */
export const prepareAccordEcheancierData = (
  lease,
  entity,
  tenantGroup,
  lot,
  property,
  detteData,
  echeancierData
) => {
  // Date d'arrêté de la dette
  const dateArrete = detteData.dateArrete || new Date().toISOString().split('T')[0]

  // Total de la dette
  const totalDette = detteData.total || detteData.details?.reduce((sum, d) => sum + d.montant, 0) || 0

  // Génération de l'échéancier si non fourni
  let echeancier = echeancierData
  if (!echeancier || echeancier.length === 0) {
    // Par défaut, étaler sur 6 mois
    const nombreMensualites = detteData.nombreMensualites || 6
    const mensualite = Math.ceil(totalDette / nombreMensualites)
    echeancier = []

    const dateDebut = new Date(detteData.dateDebut || new Date())
    for (let i = 0; i < nombreMensualites; i++) {
      const dateEcheance = new Date(dateDebut)
      dateEcheance.setMonth(dateEcheance.getMonth() + i + 1)

      // Dernière échéance = solde restant
      const montant = i === nombreMensualites - 1
        ? totalDette - (mensualite * (nombreMensualites - 1))
        : mensualite

      echeancier.push({
        date: dateEcheance.toISOString().split('T')[0],
        montant
      })
    }
  }

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
      dateArrete,
      total: totalDette,
      details: detteData.details || [
        { libelle: 'Arriérés de loyers', montant: totalDette }
      ]
    },
    echeancier,
    conditions: detteData.conditions || {
      delaiRetard: 15,
      autres: null
    }
  }
}
