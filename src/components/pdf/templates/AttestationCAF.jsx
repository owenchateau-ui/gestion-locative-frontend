import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import {
  COLORS,
  formatMontant,
  formatDate,
  generateDocumentNumber
} from '../shared/PDFStyles'

// Styles pour l'attestation CAF (format officiel)
const styles = StyleSheet.create({
  page: {
    padding: 35,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: COLORS.text,
    backgroundColor: COLORS.white
  },
  // En-tête officiel
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary
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
    marginBottom: 20,
    textAlign: 'center'
  },
  documentTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.text,
    marginBottom: 4
  },
  documentSubtitle: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: 'Helvetica-Oblique'
  },
  // Sections
  section: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 3
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    marginBottom: 8,
    backgroundColor: COLORS.background,
    padding: '4 8',
    marginTop: -16,
    marginLeft: -6,
    marginRight: -6,
    borderRadius: 2
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4
  },
  label: {
    width: '40%',
    fontSize: 9,
    color: COLORS.textMuted
  },
  value: {
    width: '60%',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold'
  },
  // Déclaration
  declarationBox: {
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    marginBottom: 15
  },
  declarationText: {
    fontSize: 9,
    lineHeight: 1.6,
    textAlign: 'justify'
  },
  bold: {
    fontFamily: 'Helvetica-Bold'
  },
  // Checkbox section
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  checkbox: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: COLORS.text,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  checkMark: {
    color: COLORS.white,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold'
  },
  checkboxLabel: {
    fontSize: 9,
    flex: 1
  },
  // Montants
  amountBox: {
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 3,
    marginBottom: 15
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  amountLabel: {
    fontSize: 9
  },
  amountValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 6,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.primary
  },
  totalLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary
  },
  totalValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary
  },
  // Coordonnées bancaires
  bankSection: {
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 3,
    marginBottom: 15
  },
  bankTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.success,
    marginBottom: 6
  },
  bankRow: {
    flexDirection: 'row',
    marginBottom: 3
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
    justifyContent: 'flex-end'
  },
  signatureBox: {
    width: '50%'
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
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    textAlign: 'center',
    marginTop: 'auto'
  },
  footerText: {
    fontSize: 7,
    color: COLORS.textMuted
  }
})

/**
 * Attestation de loyer pour la CAF
 * Document permettant au locataire de justifier son logement auprès de la CAF
 */
const AttestationCAF = ({ data }) => {
  const {
    bailleur,
    locataire,
    bien,
    bail,
    cafInfo
  } = data

  const docNumber = generateDocumentNumber('attestation_caf', new Date())
  const dateEmission = formatDate(new Date().toISOString())

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
            <Text style={styles.docInfo}>Date : {dateEmission}</Text>
            <Text style={styles.docInfo}>Réf : {docNumber}</Text>
          </View>
        </View>

        {/* Titre */}
        <View style={styles.titleSection}>
          <Text style={styles.documentTitle}>ATTESTATION DE LOYER</Text>
          <Text style={styles.documentSubtitle}>
            Document destiné à la Caisse d'Allocations Familiales
          </Text>
        </View>

        {/* Informations du bailleur */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>IDENTITÉ DU BAILLEUR</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nom / Raison sociale :</Text>
            <Text style={styles.value}>{bailleur.nom}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Adresse :</Text>
            <Text style={styles.value}>
              {bailleur.adresse}, {bailleur.codePostal} {bailleur.ville}
            </Text>
          </View>
          {bailleur.email && (
            <View style={styles.row}>
              <Text style={styles.label}>Email :</Text>
              <Text style={styles.value}>{bailleur.email}</Text>
            </View>
          )}
        </View>

        {/* Informations du locataire */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>IDENTITÉ DU LOCATAIRE</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nom :</Text>
            <Text style={styles.value}>{locataire.nom}</Text>
          </View>
          {cafInfo.numeroAllocataire && (
            <View style={styles.row}>
              <Text style={styles.label}>N° allocataire CAF :</Text>
              <Text style={styles.value}>{cafInfo.numeroAllocataire}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Date d'entrée :</Text>
            <Text style={styles.value}>{formatDate(bail.dateDebut)}</Text>
          </View>
        </View>

        {/* Informations du logement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CARACTÉRISTIQUES DU LOGEMENT</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Adresse du logement :</Text>
            <Text style={styles.value}>
              {bien.adresse}, {bien.codePostal} {bien.ville}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Type de logement :</Text>
            <Text style={styles.value}>
              {bail.typeBail === 'furnished' ? 'Meublé' : 'Non meublé'}
            </Text>
          </View>
          {bien.surfaceHabitable && (
            <View style={styles.row}>
              <Text style={styles.label}>Surface habitable :</Text>
              <Text style={styles.value}>{bien.surfaceHabitable} m²</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Nombre de pièces :</Text>
            <Text style={styles.value}>{bien.nbPieces || 'Non renseigné'}</Text>
          </View>
        </View>

        {/* Montants */}
        <View style={styles.amountBox}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Loyer mensuel (hors charges) :</Text>
            <Text style={styles.amountValue}>{formatMontant(bail.loyer)}</Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Charges mensuelles :</Text>
            <Text style={styles.amountValue}>{formatMontant(bail.charges)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total mensuel :</Text>
            <Text style={styles.totalValue}>{formatMontant(bail.loyer + bail.charges)}</Text>
          </View>
        </View>

        {/* Mode de versement CAF */}
        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 8 }}>
            Mode de versement des aides au logement :
          </Text>

          <View style={styles.checkboxRow}>
            <View style={[styles.checkbox, cafInfo.tiersPaiement && styles.checkboxChecked]}>
              {cafInfo.tiersPaiement && <Text style={styles.checkMark}>X</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              Versement au bailleur (tiers payant)
            </Text>
          </View>

          <View style={styles.checkboxRow}>
            <View style={[styles.checkbox, !cafInfo.tiersPaiement && styles.checkboxChecked]}>
              {!cafInfo.tiersPaiement && <Text style={styles.checkMark}>X</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              Versement au locataire
            </Text>
          </View>
        </View>

        {/* Coordonnées bancaires (si tiers payant) */}
        {cafInfo.tiersPaiement && bailleur.iban && (
          <View style={styles.bankSection}>
            <Text style={styles.bankTitle}>
              Coordonnées bancaires pour le versement en tiers payant
            </Text>
            <View style={styles.bankRow}>
              <Text style={styles.label}>IBAN :</Text>
              <Text style={styles.value}>{bailleur.iban}</Text>
            </View>
            {bailleur.bic && (
              <View style={styles.bankRow}>
                <Text style={styles.label}>BIC :</Text>
                <Text style={styles.value}>{bailleur.bic}</Text>
              </View>
            )}
          </View>
        )}

        {/* Déclaration */}
        <View style={styles.declarationBox}>
          <Text style={styles.declarationText}>
            Je soussigné(e) <Text style={styles.bold}>{bailleur.nom}</Text>, certifie sur l'honneur
            que les renseignements fournis ci-dessus sont exacts et que{' '}
            <Text style={styles.bold}>{locataire.nom}</Text> occupe effectivement le logement
            décrit ci-dessus depuis le <Text style={styles.bold}>{formatDate(bail.dateDebut)}</Text>{' '}
            en qualité de locataire et qu'il/elle est à jour de ses obligations locatives.
          </Text>
        </View>

        {/* Mentions légales */}
        <View style={styles.legalNotice}>
          <Text>
            Cette attestation est établie pour servir et valoir ce que de droit auprès de la
            Caisse d'Allocations Familiales. Toute fausse déclaration est passible de sanctions
            pénales (article 441-1 du Code pénal). Le bailleur s'engage à informer la CAF de toute
            modification de la situation locative (résiliation du bail, changement de loyer...).
          </Text>
        </View>

        {/* Signature */}
        <View style={styles.signatureSection}>
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

export default AttestationCAF

/**
 * Prépare les données pour la génération d'attestation CAF
 */
export const prepareAttestationCAFData = (lease, entity, tenantGroup, lot, property) => {
  return {
    bailleur: {
      nom: entity.name,
      adresse: entity.address || '',
      ville: entity.city || '',
      codePostal: entity.postal_code || '',
      email: entity.email || '',
      telephone: entity.phone || '',
      siret: entity.siret || '',
      iban: entity.iban || '',
      bic: entity.bic || ''
    },
    locataire: {
      nom: tenantGroup.name,
      email: tenantGroup.email || ''
    },
    bien: {
      adresse: property.address,
      ville: property.city,
      codePostal: property.postal_code,
      surfaceHabitable: lot.surface_habitable || lot.surface_area || null,
      nbPieces: lot.nb_rooms || null,
      type: lot.lot_type
    },
    bail: {
      dateDebut: lease.start_date,
      dateFin: lease.end_date,
      loyer: parseFloat(lease.rent_amount) || 0,
      charges: parseFloat(lease.charges_amount) || 0,
      typeBail: lease.lease_type || 'unfurnished'
    },
    cafInfo: {
      numeroAllocataire: tenantGroup.caf_allocataire_number || '',
      tiersPaiement: lease.caf_direct_payment || false,
      montantAide: parseFloat(lease.caf_amount) || 0
    }
  }
}
