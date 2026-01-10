import jsPDF from 'jspdf'

/**
 * Service de régularisation des charges annuelles
 * Conformes à la législation française (loi du 6 juillet 1989)
 */

/**
 * Formate une date en français
 */
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

/**
 * Formate un montant en euros
 */
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '0,00 €'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

/**
 * Ajoute du texte avec retour à la ligne automatique
 */
const addWrappedText = (doc, text, x, y, maxWidth, lineHeight = 6) => {
  const lines = doc.splitTextToSize(text, maxWidth)
  lines.forEach((line, index) => {
    doc.text(line, x, y + (index * lineHeight))
  })
  return y + (lines.length * lineHeight)
}

/**
 * Catégories de charges récupérables (décret du 26 août 1987)
 */
export const CHARGE_CATEGORIES = [
  {
    id: 'water',
    name: 'Eau froide et chaude',
    description: 'Consommation d\'eau, entretien des compteurs'
  },
  {
    id: 'heating',
    name: 'Chauffage collectif',
    description: 'Combustible, entretien chaudière, ramonage'
  },
  {
    id: 'elevator',
    name: 'Ascenseur',
    description: 'Électricité, maintenance, contrat d\'entretien'
  },
  {
    id: 'cleaning',
    name: 'Entretien parties communes',
    description: 'Nettoyage, produits d\'entretien, fournitures'
  },
  {
    id: 'gardening',
    name: 'Espaces verts',
    description: 'Entretien jardins, taille, arrosage'
  },
  {
    id: 'waste',
    name: 'Ordures ménagères',
    description: 'Taxe d\'enlèvement des ordures ménagères'
  },
  {
    id: 'lighting',
    name: 'Éclairage parties communes',
    description: 'Électricité des communs, ampoules'
  },
  {
    id: 'insurance',
    name: 'Assurance immeuble (quote-part)',
    description: 'Part locative de l\'assurance multirisque'
  },
  {
    id: 'concierge',
    name: 'Gardien/Concierge',
    description: '75% du salaire et charges si logé, 40% sinon'
  },
  {
    id: 'other',
    name: 'Autres charges récupérables',
    description: 'Autres charges prévues par le décret'
  }
]

/**
 * Calcule la régularisation des charges pour une période donnée
 * @param {number} totalProvisions - Total des provisions versées par le locataire
 * @param {Array} actualCharges - Liste des charges réelles avec {category, amount, description}
 * @returns {Object} - Résultat du calcul avec balance et détails
 */
export const calculateReconciliation = (totalProvisions, actualCharges) => {
  const totalActualCharges = actualCharges.reduce((sum, charge) => sum + (charge.amount || 0), 0)
  const balance = totalProvisions - totalActualCharges

  return {
    totalProvisions,
    totalActualCharges,
    balance,
    isRefund: balance > 0, // Le locataire a trop payé
    isAdditionalPayment: balance < 0, // Le locataire doit un complément
    absoluteBalance: Math.abs(balance),
    charges: actualCharges
  }
}

/**
 * Génère le PDF de régularisation des charges
 */
export const generateChargeReconciliationPDF = async (
  lease,
  tenant,
  lot,
  property,
  entity,
  landlord,
  reconciliationYear,
  reconciliationData
) => {
  const doc = new jsPDF()
  let y = 20

  // En-tête expéditeur (haut gauche)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')

  if (entity) {
    doc.text(entity.name, 20, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    if (entity.address) {
      doc.text(entity.address, 20, y)
      y += 5
      doc.text(`${entity.postal_code} ${entity.city}`, 20, y)
      y += 5
    }
    if (entity.phone) {
      doc.text(`Tél : ${entity.phone}`, 20, y)
      y += 5
    }
    if (entity.email) {
      doc.text(`Email : ${entity.email}`, 20, y)
      y += 5
    }
  } else if (landlord) {
    doc.text(`${landlord.first_name} ${landlord.last_name}`, 20, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    if (landlord.address) {
      doc.text(landlord.address, 20, y)
      y += 5
    }
    if (landlord.phone) {
      doc.text(`Tél : ${landlord.phone}`, 20, y)
      y += 5
    }
  }

  // Destinataire (haut droite)
  y = 45
  doc.setFont('helvetica', 'bold')

  // Gestion du groupe de locataires ou locataire individuel
  const tenantName = tenant.tenant_groups?.name || `${tenant.first_name} ${tenant.last_name}`
  doc.text(tenantName, 120, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(property.address, 120, y)
  y += 5
  doc.text(`${property.postal_code} ${property.city}`, 120, y)

  // Lieu et date
  y = 85
  doc.setFontSize(10)
  doc.text(`${property.city}, le ${formatDate(new Date().toISOString())}`, 120, y)
  y += 15

  // Titre
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(`RÉGULARISATION DES CHARGES - ANNÉE ${reconciliationYear}`, 20, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  y += 15

  // Introduction
  const civilite = tenant.civility === 'female' ? 'Madame' : 'Monsieur'
  doc.text(`${civilite} ${tenant.last_name},`, 20, y)
  y += 10

  y = addWrappedText(doc,
    `Conformément à l'article 23 de la loi du 6 juillet 1989, nous procédons à la régularisation annuelle des charges locatives pour l'année ${reconciliationYear} concernant le logement situé :`,
    20, y, 170)
  y += 6

  doc.setFont('helvetica', 'bold')
  doc.text(`${property.address}, ${property.postal_code} ${property.city}`, 25, y)
  if (lot.name && lot.name !== property.name) {
    y += 5
    doc.text(`Lot : ${lot.name}`, 25, y)
  }
  doc.setFont('helvetica', 'normal')
  y += 12

  // Tableau récapitulatif
  doc.setFont('helvetica', 'bold')
  doc.text('DÉCOMPTE DES CHARGES', 20, y)
  doc.setFont('helvetica', 'normal')
  y += 8

  // Provisions versées
  doc.text(`Provisions versées sur l'année ${reconciliationYear} :`, 25, y)
  doc.text(formatCurrency(reconciliationData.totalProvisions), 160, y, { align: 'right' })
  y += 8

  // Détail des charges réelles
  doc.setFont('helvetica', 'bold')
  doc.text('Charges réelles :', 25, y)
  doc.setFont('helvetica', 'normal')
  y += 6

  reconciliationData.charges.forEach(charge => {
    if (charge.amount > 0) {
      const categoryInfo = CHARGE_CATEGORIES.find(c => c.id === charge.category)
      const categoryName = categoryInfo?.name || charge.category || 'Autres charges'
      doc.text(`• ${categoryName}`, 30, y)
      doc.text(formatCurrency(charge.amount), 160, y, { align: 'right' })
      y += 5
    }
  })

  y += 3
  doc.setDrawColor(0)
  doc.line(25, y, 175, y)
  y += 6

  // Total charges réelles
  doc.setFont('helvetica', 'bold')
  doc.text('Total des charges réelles :', 25, y)
  doc.text(formatCurrency(reconciliationData.totalActualCharges), 160, y, { align: 'right' })
  y += 8

  // Solde
  doc.setFontSize(11)
  if (reconciliationData.isRefund) {
    doc.text(`SOLDE EN VOTRE FAVEUR :`, 25, y)
    doc.setTextColor(0, 128, 0) // Vert
    doc.text(formatCurrency(reconciliationData.absoluteBalance), 160, y, { align: 'right' })
    doc.setTextColor(0, 0, 0)
  } else if (reconciliationData.isAdditionalPayment) {
    doc.text(`SOLDE À RÉGLER :`, 25, y)
    doc.setTextColor(255, 0, 0) // Rouge
    doc.text(formatCurrency(reconciliationData.absoluteBalance), 160, y, { align: 'right' })
    doc.setTextColor(0, 0, 0)
  } else {
    doc.text(`SOLDE :`, 25, y)
    doc.text('0,00 € (aucun ajustement)', 160, y, { align: 'right' })
  }
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  y += 15

  // Message selon le solde
  if (reconciliationData.isRefund) {
    y = addWrappedText(doc,
      `Les provisions versées excèdent les charges réelles de ${formatCurrency(reconciliationData.absoluteBalance)}. Ce trop-perçu vous sera remboursé par déduction sur votre prochain loyer, sauf si vous souhaitez un virement bancaire.`,
      20, y, 170)
  } else if (reconciliationData.isAdditionalPayment) {
    y = addWrappedText(doc,
      `Les charges réelles excèdent les provisions versées de ${formatCurrency(reconciliationData.absoluteBalance)}. Nous vous prions de bien vouloir régler ce complément dans les meilleurs délais. Ce montant peut être réglé en une fois ou être ajouté à votre prochain loyer.`,
      20, y, 170)
  } else {
    y = addWrappedText(doc,
      `Les provisions versées correspondent exactement aux charges réelles. Aucun ajustement n'est nécessaire.`,
      20, y, 170)
  }
  y += 10

  // Information légale
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  y = addWrappedText(doc,
    `Conformément à l'article 23 de la loi du 6 juillet 1989, les justificatifs des charges sont tenus à votre disposition pendant un délai de six mois à compter de l'envoi du présent décompte. Vous pouvez les consulter sur simple demande.`,
    20, y, 170)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  y += 15

  // Formule de politesse
  y = addWrappedText(doc,
    `Nous vous prions d'agréer, ${civilite}, l'expression de nos salutations distinguées.`,
    20, y, 170)
  y += 20

  // Signature
  doc.text('Le bailleur,', 120, y)
  y += 15
  if (entity) {
    doc.text(entity.name, 120, y)
  } else if (landlord) {
    doc.text(`${landlord.first_name} ${landlord.last_name}`, 120, y)
  }

  // Télécharger
  const filename = `regularisation_charges_${tenant.last_name}_${reconciliationYear}.pdf`
  doc.save(filename)

  return filename
}

/**
 * Calcule les provisions totales pour une année donnée
 * @param {Array} payments - Liste des paiements
 * @param {number} monthlyCharges - Montant mensuel des charges
 * @param {number} year - Année de régularisation
 * @returns {number} - Total des provisions
 */
export const calculateYearlyProvisions = (payments, monthlyCharges, year) => {
  // Filtrer les paiements de l'année qui sont payés
  const yearPayments = payments.filter(p => {
    const paymentYear = new Date(p.due_date).getFullYear()
    return paymentYear === year && p.status === 'paid'
  })

  // Si on a des paiements, on compte le nombre de mois payés
  const monthsPaid = yearPayments.length

  // Total des provisions = nombre de mois payés × charges mensuelles
  return monthsPaid * monthlyCharges
}

export default {
  CHARGE_CATEGORIES,
  calculateReconciliation,
  generateChargeReconciliationPDF,
  calculateYearlyProvisions
}
