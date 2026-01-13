import { StyleSheet, Font } from '@react-pdf/renderer'

// Couleurs de l'application
export const COLORS = {
  primary: '#2563EB',
  secondary: '#475569',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  text: '#111827',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  background: '#F9FAFB',
  white: '#FFFFFF'
}

// Styles de base partagés
export const baseStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: COLORS.text,
    backgroundColor: COLORS.white
  },
  header: {
    marginBottom: 30
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  headerLeft: {
    width: '45%'
  },
  headerRight: {
    width: '45%',
    textAlign: 'right'
  },
  logo: {
    width: 120,
    height: 40,
    marginBottom: 10
  },
  companyName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    color: COLORS.primary
  },
  companyInfo: {
    fontSize: 9,
    color: COLORS.textMuted,
    lineHeight: 1.4
  },
  title: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 8,
    color: COLORS.primary
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    color: COLORS.textMuted
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 10,
    color: COLORS.secondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 4
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6
  },
  label: {
    width: '40%',
    color: COLORS.textMuted
  },
  value: {
    width: '60%',
    fontFamily: 'Helvetica-Bold'
  },
  text: {
    lineHeight: 1.6,
    textAlign: 'justify'
  },
  bold: {
    fontFamily: 'Helvetica-Bold'
  },
  italic: {
    fontFamily: 'Helvetica-Oblique'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: COLORS.textMuted,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10
  },
  pageNumber: {
    fontSize: 9,
    color: COLORS.textMuted
  },
  signatureSection: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  signatureBox: {
    width: '45%'
  },
  signatureLabel: {
    fontSize: 10,
    marginBottom: 8,
    color: COLORS.textMuted
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.text,
    height: 60,
    marginBottom: 4
  },
  signatureDate: {
    fontSize: 9,
    color: COLORS.textMuted
  },
  table: {
    marginTop: 10,
    marginBottom: 10
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 8
  },
  tableHeader: {
    backgroundColor: COLORS.background,
    fontFamily: 'Helvetica-Bold'
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 8
  },
  tableCellRight: {
    textAlign: 'right'
  },
  totalRow: {
    backgroundColor: COLORS.primary,
    color: COLORS.white
  },
  highlight: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 4,
    marginVertical: 10
  },
  highlightText: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary
  },
  legalNotice: {
    fontSize: 8,
    color: COLORS.textMuted,
    fontFamily: 'Helvetica-Oblique',
    marginTop: 20,
    padding: 10,
    backgroundColor: COLORS.background,
    borderRadius: 4
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginVertical: 15
  }
})

// Styles spécifiques pour la quittance
export const quittanceStyles = StyleSheet.create({
  ...baseStyles,
  documentTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 4,
    color: COLORS.text
  },
  periodBadge: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    padding: '6 16',
    borderRadius: 4,
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    alignSelf: 'center',
    marginBottom: 25
  },
  partyBox: {
    width: '48%',
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 4
  },
  partyTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  partyName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4
  },
  partyAddress: {
    fontSize: 10,
    color: COLORS.textMuted,
    lineHeight: 1.4
  },
  declarationBox: {
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    marginBottom: 20
  },
  amountTable: {
    marginTop: 15,
    marginBottom: 15
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  amountLabel: {
    fontSize: 11,
    color: COLORS.text
  },
  amountValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold'
  },
  totalAmount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    marginTop: -1,
    paddingHorizontal: 10,
    borderRadius: 4
  },
  totalLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white
  },
  totalValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white
  },
  paymentInfo: {
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 4,
    marginTop: 15
  },
  paymentInfoTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.success,
    marginBottom: 6
  },
  paymentInfoText: {
    fontSize: 10,
    color: COLORS.text
  },
  quittanceNumber: {
    fontSize: 9,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginBottom: 20
  }
})

// Styles pour la mise en demeure
export const miseEnDemeureStyles = StyleSheet.create({
  ...baseStyles,
  urgentBanner: {
    backgroundColor: COLORS.danger,
    color: COLORS.white,
    padding: 10,
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    marginBottom: 20
  },
  debtTable: {
    marginVertical: 15,
    borderWidth: 1,
    borderColor: COLORS.danger
  },
  debtRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 8,
    paddingHorizontal: 10
  },
  debtHeader: {
    backgroundColor: '#FEE2E2'
  },
  deadline: {
    backgroundColor: '#FEF2F2',
    padding: 15,
    borderWidth: 2,
    borderColor: COLORS.danger,
    borderRadius: 4,
    marginVertical: 15
  },
  deadlineText: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.danger,
    textAlign: 'center'
  }
})

// Styles pour l'attestation CAF
export const attestationCAFStyles = StyleSheet.create({
  ...baseStyles,
  cerfaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary
  },
  cerfaNumber: {
    fontSize: 9,
    color: COLORS.textMuted
  },
  cerfaTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center'
  },
  formSection: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4
  },
  formSectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    marginBottom: 10,
    backgroundColor: COLORS.background,
    padding: 6,
    marginTop: -16,
    marginLeft: -6,
    marginRight: -6
  },
  checkbox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: COLORS.text,
    marginRight: 8
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  }
})

// Utilitaires de formatage
export const formatMontant = (montant) => {
  if (typeof montant !== 'number') {
    montant = parseFloat(montant) || 0
  }
  return montant.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + ' €'
}

export const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

export const formatDateShort = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export const formatMonth = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric'
  })
}

// Génère un numéro de document unique
export const generateDocumentNumber = (type, date = new Date()) => {
  const prefix = {
    quittance: 'QUI',
    recu: 'REC',
    mise_en_demeure: 'MED',
    avis_echeance: 'AVE',
    attestation_caf: 'CAF',
    indexation: 'IND'
  }
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()

  return `${prefix[type] || 'DOC'}-${year}${month}${day}-${random}`
}
