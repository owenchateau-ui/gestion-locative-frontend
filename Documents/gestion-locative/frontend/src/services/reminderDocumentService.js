import jsPDF from 'jspdf'

/**
 * Service de génération de lettres de relance pour impayés
 * Conformes à la législation française
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
  if (!amount) return '0,00 €'
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
 * Ajoute l'en-tête de lettre
 */
const addLetterHeader = (doc, landlord, entity, tenant, property, lot) => {
  let y = 20

  // Expéditeur (haut gauche)
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
  doc.text(`${tenant.first_name} ${tenant.last_name}`, 120, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(property.address, 120, y)
  y += 5
  doc.text(`${property.postal_code} ${property.city}`, 120, y)

  return 85
}

/**
 * Génère une relance amiable (J+3 après échéance)
 */
export const generateRelanceAmiablePDF = async (payment, lease, tenant, lot, property, entity, landlord) => {
  const doc = new jsPDF()

  // En-tête
  let y = addLetterHeader(doc, landlord, entity, tenant, property, lot)

  // Lieu et date
  doc.setFontSize(10)
  doc.text(`${property.city}, le ${formatDate(new Date().toISOString())}`, 120, y)
  y += 15

  // Objet
  doc.setFont('helvetica', 'bold')
  doc.text('Objet : Rappel de loyer impayé', 20, y)
  doc.setFont('helvetica', 'normal')
  y += 15

  // Corps de la lettre
  doc.text(`${tenant.civility === 'female' ? 'Madame' : 'Monsieur'} ${tenant.last_name},`, 20, y)
  y += 10

  y = addWrappedText(doc,
    `Nous nous permettons de vous rappeler que le loyer du mois de ${getMonthName(payment.due_date)} ${new Date(payment.due_date).getFullYear()}, d'un montant de ${formatCurrency(payment.amount)}, aurait dû être réglé le ${formatDate(payment.due_date)}.`,
    20, y, 170)
  y += 8

  y = addWrappedText(doc,
    `À ce jour, nous n'avons pas constaté le versement de cette somme sur notre compte.`,
    20, y, 170)
  y += 8

  y = addWrappedText(doc,
    `Nous pensons qu'il s'agit d'un simple oubli de votre part et vous prions de bien vouloir régulariser cette situation dans les meilleurs délais.`,
    20, y, 170)
  y += 8

  y = addWrappedText(doc,
    `Si toutefois votre règlement était intervenu entre-temps, nous vous prions de ne pas tenir compte de ce courrier.`,
    20, y, 170)
  y += 8

  y = addWrappedText(doc,
    `En cas de difficultés de paiement, nous vous invitons à prendre contact avec nous afin de trouver ensemble une solution.`,
    20, y, 170)
  y += 15

  // Formule de politesse
  y = addWrappedText(doc,
    `Dans l'attente de votre règlement, nous vous prions d'agréer, ${tenant.civility === 'female' ? 'Madame' : 'Monsieur'}, l'expression de nos salutations distinguées.`,
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
  const filename = `relance_amiable_${tenant.last_name}_${formatDateForFilename(payment.due_date)}.pdf`
  doc.save(filename)

  return filename
}

/**
 * Génère un premier rappel formel (J+7)
 */
export const generateRappelFormelPDF = async (payment, lease, tenant, lot, property, entity, landlord, totalDue = null) => {
  const doc = new jsPDF()

  // En-tête
  let y = addLetterHeader(doc, landlord, entity, tenant, property, lot)

  // Lieu et date
  doc.setFontSize(10)
  doc.text(`${property.city}, le ${formatDate(new Date().toISOString())}`, 120, y)
  y += 10

  // Envoi recommandé
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('Lettre recommandée avec accusé de réception', 20, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  y += 10

  // Objet
  doc.setFont('helvetica', 'bold')
  doc.text('Objet : Premier rappel - Loyer impayé', 20, y)
  doc.setFont('helvetica', 'normal')
  y += 15

  // Corps de la lettre
  doc.text(`${tenant.civility === 'female' ? 'Madame' : 'Monsieur'} ${tenant.last_name},`, 20, y)
  y += 10

  y = addWrappedText(doc,
    `Par la présente, nous vous rappelons que vous êtes redevable du loyer et des charges pour votre logement situé au ${property.address}, ${property.postal_code} ${property.city}.`,
    20, y, 170)
  y += 8

  // Détail des sommes dues
  doc.setFont('helvetica', 'bold')
  doc.text('Détail des sommes dues :', 20, y)
  doc.setFont('helvetica', 'normal')
  y += 8

  const amount = totalDue || payment.amount
  doc.text(`• Loyer et charges du ${getMonthName(payment.due_date)} ${new Date(payment.due_date).getFullYear()} : ${formatCurrency(amount)}`, 25, y)
  y += 6
  doc.text(`• Date d'échéance : ${formatDate(payment.due_date)}`, 25, y)
  y += 6

  const daysLate = Math.floor((new Date() - new Date(payment.due_date)) / (1000 * 60 * 60 * 24))
  doc.text(`• Retard : ${daysLate} jours`, 25, y)
  y += 10

  y = addWrappedText(doc,
    `Malgré notre précédent rappel, nous n'avons toujours pas reçu votre règlement. Nous vous demandons instamment de procéder au paiement de la somme de ${formatCurrency(amount)} dans un délai de 8 jours à compter de la réception de ce courrier.`,
    20, y, 170)
  y += 8

  y = addWrappedText(doc,
    `À défaut de régularisation dans ce délai, nous nous verrons dans l'obligation d'engager une procédure de recouvrement qui pourrait entraîner des frais supplémentaires à votre charge.`,
    20, y, 170)
  y += 8

  y = addWrappedText(doc,
    `Nous restons à votre disposition pour toute explication ou pour étudier des modalités de paiement adaptées à votre situation.`,
    20, y, 170)
  y += 15

  // Formule de politesse
  y = addWrappedText(doc,
    `Veuillez agréer, ${tenant.civility === 'female' ? 'Madame' : 'Monsieur'}, l'expression de nos salutations distinguées.`,
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
  const filename = `rappel_formel_${tenant.last_name}_${formatDateForFilename(payment.due_date)}.pdf`
  doc.save(filename)

  return filename
}

/**
 * Génère une mise en demeure (J+15)
 */
export const generateMiseEnDemeurePDF = async (payment, lease, tenant, lot, property, entity, landlord, totalDue = null) => {
  const doc = new jsPDF()

  // En-tête
  let y = addLetterHeader(doc, landlord, entity, tenant, property, lot)

  // Lieu et date
  doc.setFontSize(10)
  doc.text(`${property.city}, le ${formatDate(new Date().toISOString())}`, 120, y)
  y += 10

  // Envoi recommandé avec AR
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('LETTRE RECOMMANDÉE AVEC ACCUSÉ DE RÉCEPTION', 20, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  y += 10

  // Objet
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('MISE EN DEMEURE DE PAYER', 20, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  y += 15

  // Corps de la lettre
  doc.text(`${tenant.civility === 'female' ? 'Madame' : 'Monsieur'} ${tenant.last_name},`, 20, y)
  y += 10

  y = addWrappedText(doc,
    `Par la présente, nous vous mettons en demeure de régler sous huitaine les sommes que vous nous devez au titre du bail d'habitation consenti pour le logement situé :`,
    20, y, 170)
  y += 6

  doc.setFont('helvetica', 'bold')
  doc.text(`${property.address}, ${property.postal_code} ${property.city}`, 25, y)
  doc.setFont('helvetica', 'normal')
  y += 10

  // Détail des sommes dues
  doc.setFont('helvetica', 'bold')
  doc.text('Décompte des sommes dues :', 20, y)
  doc.setFont('helvetica', 'normal')
  y += 8

  const amount = totalDue || payment.amount
  doc.text(`• Loyer et charges impayés : ${formatCurrency(amount)}`, 25, y)
  y += 6
  doc.text(`• Période concernée : ${getMonthName(payment.due_date)} ${new Date(payment.due_date).getFullYear()}`, 25, y)
  y += 6
  doc.text(`• Date d'échéance initiale : ${formatDate(payment.due_date)}`, 25, y)
  y += 10

  doc.setFont('helvetica', 'bold')
  doc.text(`TOTAL DÛ : ${formatCurrency(amount)}`, 25, y)
  doc.setFont('helvetica', 'normal')
  y += 12

  y = addWrappedText(doc,
    `Malgré nos précédentes relances restées sans effet, vous n'avez pas procédé au règlement des sommes dues. Par conséquent, nous vous mettons en demeure de nous régler la somme de ${formatCurrency(amount)} dans un délai de 8 jours à compter de la réception de la présente.`,
    20, y, 170)
  y += 8

  y = addWrappedText(doc,
    `À défaut de paiement dans ce délai, nous serons contraints de :`,
    20, y, 170)
  y += 6

  doc.text('• Faire délivrer un commandement de payer par voie d\'huissier', 25, y)
  y += 5
  doc.text('• Activer la clause résolutoire du bail', 25, y)
  y += 5
  doc.text('• Engager une procédure judiciaire en recouvrement', 25, y)
  y += 5
  doc.text('• Réclamer des dommages et intérêts', 25, y)
  y += 10

  y = addWrappedText(doc,
    `Ces procédures entraîneront des frais supplémentaires qui resteront à votre charge.`,
    20, y, 170)
  y += 8

  y = addWrappedText(doc,
    `Nous vous rappelons qu'en application de l'article 24 de la loi du 6 juillet 1989, le défaut de paiement du loyer constitue un motif de résiliation du bail.`,
    20, y, 170)
  y += 8

  y = addWrappedText(doc,
    `La présente mise en demeure vaut dernier avis avant poursuites.`,
    20, y, 170)
  y += 15

  // Formule de politesse
  y = addWrappedText(doc,
    `Veuillez agréer, ${tenant.civility === 'female' ? 'Madame' : 'Monsieur'}, l'expression de nos salutations.`,
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

  // Mention légale
  y = 270
  doc.setFontSize(7)
  doc.setFont('helvetica', 'italic')
  doc.text('Cette mise en demeure constitue un acte interruptif de prescription conformément à l\'article 2240 du Code civil.', 20, y)

  // Télécharger
  const filename = `mise_en_demeure_${tenant.last_name}_${formatDateForFilename(payment.due_date)}.pdf`
  doc.save(filename)

  return filename
}

// Utilitaires
const getMonthName = (dateString) => {
  const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
  return months[new Date(dateString).getMonth()]
}

const formatDateForFilename = (dateString) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export default {
  generateRelanceAmiablePDF,
  generateRappelFormelPDF,
  generateMiseEnDemeurePDF
}
