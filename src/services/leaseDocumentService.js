import jsPDF from 'jspdf'

/**
 * Service de génération de documents PDF pour les baux
 * Conformes à la loi ALUR (loi du 24 mars 2014)
 */

/**
 * Formate une date en français
 */
const formatDate = (dateString) => {
  if (!dateString) return 'Non définie'
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
 * Convertit un nombre en lettres (pour les montants)
 */
const numberToWords = (num) => {
  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf']
  const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt']

  if (num === 0) return 'zéro'
  if (num < 20) return units[num]
  if (num < 100) {
    const ten = Math.floor(num / 10)
    const unit = num % 10
    if (ten === 7 || ten === 9) {
      return tens[ten] + '-' + units[10 + unit]
    }
    if (unit === 0) return tens[ten]
    if (unit === 1 && ten !== 8) return tens[ten] + ' et un'
    return tens[ten] + '-' + units[unit]
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100)
    const rest = num % 100
    const prefix = hundred === 1 ? 'cent' : units[hundred] + ' cent'
    if (rest === 0) return prefix + (hundred > 1 ? 's' : '')
    return prefix + ' ' + numberToWords(rest)
  }
  if (num < 1000000) {
    const thousand = Math.floor(num / 1000)
    const rest = num % 1000
    const prefix = thousand === 1 ? 'mille' : numberToWords(thousand) + ' mille'
    if (rest === 0) return prefix
    return prefix + ' ' + numberToWords(rest)
  }
  return num.toString()
}

/**
 * Ajoute du texte avec retour à la ligne automatique
 */
const addWrappedText = (doc, text, x, y, maxWidth, lineHeight = 5) => {
  const lines = doc.splitTextToSize(text, maxWidth)
  lines.forEach((line, index) => {
    doc.text(line, x, y + (index * lineHeight))
  })
  return y + (lines.length * lineHeight)
}

/**
 * Ajoute une section avec titre
 */
const addSection = (doc, title, y, fontSize = 11) => {
  doc.setFontSize(fontSize)
  doc.setFont('helvetica', 'bold')
  doc.text(title, 20, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  return y + 8
}

/**
 * Vérifie si on doit ajouter une nouvelle page
 */
const checkNewPage = (doc, y, margin = 30) => {
  if (y > 270) {
    doc.addPage()
    return 20
  }
  return y
}

/**
 * Génère un bail vide conforme ALUR
 */
export const generateBailVidePDF = async (lease, landlord, tenant, lot, property, entity) => {
  const doc = new jsPDF()
  let y = 20

  // ===== EN-TÊTE =====
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('CONTRAT DE LOCATION', 105, y, { align: 'center' })
  y += 7
  doc.setFontSize(12)
  doc.text('Bail d\'habitation - Logement vide', 105, y, { align: 'center' })
  y += 5
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  doc.text('(Loi n° 89-462 du 6 juillet 1989 modifiée par la loi ALUR du 24 mars 2014)', 105, y, { align: 'center' })
  y += 12

  // ===== ARTICLE 1 : DÉSIGNATION DES PARTIES =====
  y = addSection(doc, 'ARTICLE 1 - DÉSIGNATION DES PARTIES', y, 12)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Le Bailleur :', 20, y)
  doc.setFont('helvetica', 'normal')
  y += 6

  // Informations bailleur
  if (entity) {
    doc.text(`${entity.name}`, 25, y)
    y += 5
    if (entity.entity_type !== 'individual') {
      doc.text(`Forme juridique : ${getEntityTypeLabel(entity.entity_type)}`, 25, y)
      y += 5
      if (entity.siret) {
        doc.text(`SIRET : ${entity.siret}`, 25, y)
        y += 5
      }
    }
    if (entity.address) {
      doc.text(`Adresse : ${entity.address}`, 25, y)
      y += 5
      doc.text(`${entity.postal_code} ${entity.city}`, 25, y)
      y += 5
    }
  } else if (landlord) {
    doc.text(`${landlord.first_name} ${landlord.last_name}`, 25, y)
    y += 5
    if (landlord.address) {
      doc.text(`Adresse : ${landlord.address}`, 25, y)
      y += 5
    }
  }
  y += 5

  doc.setFont('helvetica', 'bold')
  doc.text('Le Locataire :', 20, y)
  doc.setFont('helvetica', 'normal')
  y += 6

  // Informations locataire
  if (tenant) {
    doc.text(`${tenant.first_name} ${tenant.last_name}`, 25, y)
    y += 5
    if (tenant.email) {
      doc.text(`Email : ${tenant.email}`, 25, y)
      y += 5
    }
    if (tenant.phone) {
      doc.text(`Téléphone : ${tenant.phone}`, 25, y)
      y += 5
    }
  }
  y += 8

  // ===== ARTICLE 2 : OBJET DU CONTRAT =====
  y = checkNewPage(doc, y)
  y = addSection(doc, 'ARTICLE 2 - OBJET DU CONTRAT', y, 12)

  doc.text('Le présent contrat a pour objet la location d\'un logement ainsi déterminé :', 20, y)
  y += 8

  // Description du logement
  doc.setFont('helvetica', 'bold')
  doc.text('Localisation du logement :', 20, y)
  doc.setFont('helvetica', 'normal')
  y += 6

  if (property && lot) {
    doc.text(`Adresse : ${property.address}`, 25, y)
    y += 5
    doc.text(`${property.postal_code} ${property.city}`, 25, y)
    y += 5
    if (lot.floor !== null) {
      const floorText = lot.floor === 0 ? 'Rez-de-chaussée' : `${lot.floor}${lot.floor === 1 ? 'er' : 'ème'} étage`
      doc.text(`Étage : ${floorText}`, 25, y)
      y += 5
    }
    if (lot.door_number) {
      doc.text(`Porte : ${lot.door_number}`, 25, y)
      y += 5
    }
  }
  y += 5

  doc.setFont('helvetica', 'bold')
  doc.text('Désignation des locaux :', 20, y)
  doc.setFont('helvetica', 'normal')
  y += 6

  if (lot) {
    doc.text(`Type : ${getLotTypeLabel(lot.lot_type)}`, 25, y)
    y += 5
    if (lot.surface_area) {
      doc.text(`Surface habitable : ${lot.surface_area} m²`, 25, y)
      y += 5
    }
    if (lot.nb_rooms) {
      doc.text(`Nombre de pièces principales : ${lot.nb_rooms}`, 25, y)
      y += 5
    }

    // Équipements
    const equipments = []
    if (lot.has_parking) equipments.push('parking')
    if (lot.has_cellar) equipments.push('cave')
    if (lot.has_balcony) equipments.push('balcon')
    if (lot.has_terrace) equipments.push('terrasse')
    if (lot.has_garden) equipments.push('jardin')

    if (equipments.length > 0) {
      doc.text(`Annexes : ${equipments.join(', ')}`, 25, y)
      y += 5
    }
  }
  y += 8

  // ===== ARTICLE 3 : DURÉE DU CONTRAT =====
  y = checkNewPage(doc, y)
  y = addSection(doc, 'ARTICLE 3 - DURÉE DU CONTRAT', y, 12)

  const startDate = formatDate(lease?.start_date)
  const endDate = lease?.end_date ? formatDate(lease.end_date) : 'Reconduction tacite'

  doc.text(`Le présent bail est consenti et accepté pour une durée de TROIS ANS`, 20, y)
  y += 5
  doc.text(`à compter du ${startDate}`, 20, y)
  y += 5
  if (lease?.end_date) {
    doc.text(`et se terminera le ${endDate}.`, 20, y)
    y += 5
  }
  y += 3
  y = addWrappedText(doc,
    'À défaut de congé donné par l\'une ou l\'autre des parties dans les conditions légales, le bail sera reconduit tacitement pour une durée de trois ans.',
    20, y, 170, 5)
  y += 8

  // ===== ARTICLE 4 : LOYER ET CHARGES =====
  y = checkNewPage(doc, y)
  y = addSection(doc, 'ARTICLE 4 - LOYER ET CHARGES', y, 12)

  const rentAmount = parseFloat(lease?.rent_amount) || 0
  const chargesAmount = parseFloat(lease?.charges_amount) || 0
  const totalAmount = rentAmount + chargesAmount

  doc.setFont('helvetica', 'bold')
  doc.text('4.1 - Loyer :', 20, y)
  doc.setFont('helvetica', 'normal')
  y += 6
  doc.text(`Loyer mensuel hors charges : ${formatCurrency(rentAmount)}`, 25, y)
  y += 5
  doc.text(`(${numberToWords(Math.floor(rentAmount))} euros)`, 25, y)
  y += 8

  doc.setFont('helvetica', 'bold')
  doc.text('4.2 - Charges récupérables :', 20, y)
  doc.setFont('helvetica', 'normal')
  y += 6
  doc.text(`Provision mensuelle pour charges : ${formatCurrency(chargesAmount)}`, 25, y)
  y += 5
  y = addWrappedText(doc,
    'Cette provision fera l\'objet d\'une régularisation annuelle. Les charges récupérables sont exigibles en contrepartie des services rendus liés à l\'usage des différents éléments de la chose louée.',
    25, y, 165, 5)
  y += 8

  doc.setFont('helvetica', 'bold')
  doc.text('4.3 - Total mensuel :', 20, y)
  doc.setFont('helvetica', 'normal')
  y += 6
  doc.text(`Montant total mensuel : ${formatCurrency(totalAmount)}`, 25, y)
  y += 5
  doc.text(`(${numberToWords(Math.floor(totalAmount))} euros)`, 25, y)
  y += 8

  doc.setFont('helvetica', 'bold')
  doc.text('4.4 - Modalités de paiement :', 20, y)
  doc.setFont('helvetica', 'normal')
  y += 6
  doc.text(`Le loyer est payable mensuellement et d'avance, le 1er de chaque mois.`, 25, y)
  y += 10

  // ===== ARTICLE 5 : DÉPÔT DE GARANTIE =====
  y = checkNewPage(doc, y)
  y = addSection(doc, 'ARTICLE 5 - DÉPÔT DE GARANTIE', y, 12)

  const depositAmount = parseFloat(lease?.deposit_amount) || rentAmount

  doc.text(`Un dépôt de garantie de ${formatCurrency(depositAmount)} est versé par le locataire`, 20, y)
  y += 5
  doc.text(`(${numberToWords(Math.floor(depositAmount))} euros)`, 20, y)
  y += 6
  y = addWrappedText(doc,
    'Ce dépôt de garantie ne peut être supérieur à un mois de loyer hors charges. Il sera restitué dans un délai maximal de deux mois à compter de la remise des clés, déduction faite des sommes restant dues au bailleur et des sommes dont celui-ci pourrait être tenu aux lieu et place du locataire.',
    20, y, 170, 5)
  y += 10

  // ===== ARTICLE 6 : CLAUSE RÉSOLUTOIRE =====
  y = checkNewPage(doc, y)
  y = addSection(doc, 'ARTICLE 6 - CLAUSE RÉSOLUTOIRE', y, 12)

  y = addWrappedText(doc,
    'Il est expressément convenu qu\'à défaut de paiement au terme convenu de tout ou partie du loyer ou des charges, ou à défaut de versement du dépôt de garantie, ou en cas de non-souscription d\'une assurance des risques locatifs, le présent bail sera résilié de plein droit, si bon semble au bailleur, un mois après un commandement de payer demeuré infructueux.',
    20, y, 170, 5)
  y += 10

  // ===== ARTICLE 7 : OBLIGATIONS DU LOCATAIRE =====
  y = checkNewPage(doc, y)
  y = addSection(doc, 'ARTICLE 7 - OBLIGATIONS DU LOCATAIRE', y, 12)

  const obligations = [
    'Payer le loyer et les charges aux termes convenus',
    'User paisiblement des locaux loués suivant la destination qui leur a été donnée',
    'Répondre des dégradations et pertes qui surviennent pendant la durée du contrat',
    'Prendre à sa charge l\'entretien courant du logement et des équipements mentionnés au contrat',
    'Laisser exécuter dans les lieux loués les travaux d\'amélioration des parties communes',
    'Ne pas transformer les locaux sans l\'accord écrit du propriétaire',
    'S\'assurer contre les risques locatifs',
    'Permettre l\'accès aux lieux pour les travaux d\'amélioration énergétique'
  ]

  obligations.forEach((obligation, index) => {
    y = checkNewPage(doc, y)
    doc.text(`• ${obligation}`, 25, y)
    y += 5
  })
  y += 5

  // ===== ARTICLE 8 : OBLIGATIONS DU BAILLEUR =====
  y = checkNewPage(doc, y)
  y = addSection(doc, 'ARTICLE 8 - OBLIGATIONS DU BAILLEUR', y, 12)

  const obligationsBailleur = [
    'Remettre au locataire le logement en bon état d\'usage et de réparation',
    'Assurer au locataire la jouissance paisible du logement',
    'Entretenir les locaux en état de servir à l\'usage prévu par le contrat',
    'Effectuer toutes les réparations autres que locatives',
    'Ne pas s\'opposer aux aménagements réalisés par le locataire (sauf transformation)',
    'Remettre gratuitement une quittance au locataire qui en fait la demande'
  ]

  obligationsBailleur.forEach((obligation) => {
    y = checkNewPage(doc, y)
    doc.text(`• ${obligation}`, 25, y)
    y += 5
  })
  y += 5

  // ===== DIAGNOSTICS =====
  y = checkNewPage(doc, y)
  y = addSection(doc, 'ARTICLE 9 - DIAGNOSTICS', y, 12)

  y = addWrappedText(doc,
    'Les diagnostics obligatoires sont annexés au présent contrat : Diagnostic de Performance Énergétique (DPE), Constat de Risque d\'Exposition au Plomb (CREP), État des Risques et Pollutions (ERP), Diagnostic électricité et gaz le cas échéant.',
    20, y, 170, 5)

  if (lot?.dpe_rating) {
    y += 6
    doc.text(`DPE : Classe ${lot.dpe_rating}${lot.dpe_value ? ` (${lot.dpe_value} kWh/m²/an)` : ''}`, 25, y)
  }
  if (lot?.ges_rating) {
    y += 5
    doc.text(`GES : Classe ${lot.ges_rating}${lot.ges_value ? ` (${lot.ges_value} kg CO2/m²/an)` : ''}`, 25, y)
  }
  y += 10

  // ===== CLAUSES PARTICULIÈRES =====
  // Récupérer les clauses personnalisées depuis localStorage
  const savedTemplates = localStorage.getItem('documentTemplates')
  let customClauses = []
  if (savedTemplates) {
    try {
      const templates = JSON.parse(savedTemplates)
      customClauses = templates.bail_vide?.customClauses || []
    } catch (e) {
      console.error('Erreur lecture clauses personnalisées:', e)
    }
  }

  if (customClauses.length > 0) {
    y = checkNewPage(doc, y)
    y = addSection(doc, 'ARTICLE 10 - CLAUSES PARTICULIÈRES', y, 12)

    customClauses.forEach((clause, index) => {
      y = checkNewPage(doc, y)
      if (clause.title) {
        doc.setFont('helvetica', 'bold')
        doc.text(`${index + 1}. ${clause.title}`, 20, y)
        doc.setFont('helvetica', 'normal')
        y += 6
      }
      if (clause.content) {
        y = addWrappedText(doc, clause.content, 25, y, 165, 5)
        y += 8
      }
    })
  }

  // ===== SIGNATURES =====
  doc.addPage()
  y = 20

  y = addSection(doc, 'SIGNATURES', y, 14)

  doc.text(`Fait à ........................, le ${formatDate(new Date().toISOString())}`, 20, y)
  y += 5
  doc.text('En deux exemplaires originaux', 20, y)
  y += 15

  // Colonnes signatures
  doc.setFont('helvetica', 'bold')
  doc.text('Le Bailleur', 50, y, { align: 'center' })
  doc.text('Le Locataire', 150, y, { align: 'center' })
  y += 5
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.text('(signature précédée de la mention', 50, y, { align: 'center' })
  doc.text('(signature précédée de la mention', 150, y, { align: 'center' })
  y += 4
  doc.text('"Lu et approuvé")', 50, y, { align: 'center' })
  doc.text('"Lu et approuvé")', 150, y, { align: 'center' })
  y += 40

  // Zones de signature
  doc.setDrawColor(200)
  doc.rect(20, y - 30, 70, 25)
  doc.rect(120, y - 30, 70, 25)

  // ===== MENTION LÉGALE =====
  y = 250
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  y = addWrappedText(doc,
    'Le présent contrat est établi conformément à la loi n° 89-462 du 6 juillet 1989 tendant à améliorer les rapports locatifs, modifiée par la loi n° 2014-366 du 24 mars 2014 pour l\'accès au logement et un urbanisme rénové (ALUR). Le locataire reconnaît avoir reçu un exemplaire du présent contrat ainsi que l\'état des lieux d\'entrée et les diagnostics obligatoires.',
    20, y, 170, 4)

  // Télécharger
  const filename = `bail_${tenant?.last_name || 'locataire'}_${lot?.name || 'lot'}.pdf`
  doc.save(filename)

  return filename
}

/**
 * Génère un bail meublé conforme ALUR
 */
export const generateBailMeublePDF = async (lease, landlord, tenant, lot, property, entity) => {
  // Structure similaire au bail vide avec les spécificités meublé
  const doc = new jsPDF()
  let y = 20

  // ===== EN-TÊTE =====
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('CONTRAT DE LOCATION', 105, y, { align: 'center' })
  y += 7
  doc.setFontSize(12)
  doc.text('Bail d\'habitation - Logement meublé', 105, y, { align: 'center' })
  y += 5
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  doc.text('(Loi n° 89-462 du 6 juillet 1989 modifiée par la loi ALUR du 24 mars 2014)', 105, y, { align: 'center' })
  y += 12

  // NOTE: Le bail meublé suit la même structure que le bail vide
  // avec des spécificités : durée 1 an (9 mois étudiants), dépôt 2 mois max

  doc.text('Ce bail concerne un logement meublé conformément au décret n° 2015-981', 20, y)
  y += 5
  doc.text('du 31 juillet 2015 fixant la liste des éléments de mobilier minimum.', 20, y)
  y += 8

  doc.setFontSize(10)
  doc.text('La durée du bail est d\'UN AN minimum (ou 9 mois pour un étudiant).', 20, y)
  y += 5
  doc.text('Le dépôt de garantie ne peut excéder DEUX MOIS de loyer hors charges.', 20, y)
  y += 10

  // ===== CLAUSES PARTICULIÈRES =====
  // Récupérer les clauses personnalisées depuis localStorage
  const savedTemplates = localStorage.getItem('documentTemplates')
  let customClauses = []
  if (savedTemplates) {
    try {
      const templates = JSON.parse(savedTemplates)
      customClauses = templates.bail_meuble?.customClauses || []
    } catch (e) {
      console.error('Erreur lecture clauses personnalisées:', e)
    }
  }

  if (customClauses.length > 0) {
    y = checkNewPage(doc, y)
    y = addSection(doc, 'CLAUSES PARTICULIÈRES', y, 12)

    customClauses.forEach((clause, index) => {
      y = checkNewPage(doc, y)
      if (clause.title) {
        doc.setFont('helvetica', 'bold')
        doc.text(`${index + 1}. ${clause.title}`, 20, y)
        doc.setFont('helvetica', 'normal')
        y += 6
      }
      if (clause.content) {
        y = addWrappedText(doc, clause.content, 25, y, 165, 5)
        y += 8
      }
    })
  }

  // Signatures
  doc.addPage()
  y = 20
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('SIGNATURES', 20, y)
  y += 10

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Fait à ........................, le ${formatDate(new Date().toISOString())}`, 20, y)
  y += 5
  doc.text('En deux exemplaires originaux', 20, y)
  y += 15

  doc.setFont('helvetica', 'bold')
  doc.text('Le Bailleur', 50, y, { align: 'center' })
  doc.text('Le Locataire', 150, y, { align: 'center' })
  y += 40

  doc.setDrawColor(200)
  doc.rect(20, y - 30, 70, 25)
  doc.rect(120, y - 30, 70, 25)

  const filename = `bail_meuble_${tenant?.last_name || 'locataire'}_${lot?.name || 'lot'}.pdf`
  doc.save(filename)

  return filename
}

// Labels utilitaires
const getEntityTypeLabel = (type) => {
  const labels = {
    individual: 'Personne physique',
    sci: 'Société Civile Immobilière',
    sarl: 'SARL',
    sas: 'SAS',
    sasu: 'SASU',
    eurl: 'EURL',
    lmnp: 'LMNP',
    lmp: 'LMP',
    other: 'Autre'
  }
  return labels[type] || type
}

const getLotTypeLabel = (type) => {
  const labels = {
    apartment: 'Appartement',
    studio: 'Studio',
    house: 'Maison',
    commercial: 'Local commercial',
    office: 'Bureau',
    parking: 'Parking',
    cellar: 'Cave',
    storage: 'Débarras',
    land: 'Terrain',
    other: 'Autre'
  }
  return labels[type] || type
}

export default {
  generateBailVidePDF,
  generateBailMeublePDF
}
