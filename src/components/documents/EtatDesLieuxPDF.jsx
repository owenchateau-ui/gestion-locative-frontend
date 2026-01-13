/**
 * Générateur PDF d'État des Lieux
 * Conforme au Décret n°2016-382 du 30 mars 2016
 */

import jsPDF from 'jspdf'
import {
  ROOM_TYPES,
  ELEMENT_CATEGORIES,
  KEY_TYPES,
  RATING_SCALE
} from '../../constants/inventoryConstants'

// Symboles textuels pour remplacer les emojis (non supportés par jsPDF)
const PDF_SYMBOLS = {
  room: '[P]',
  key: '[C]',
  element: '[E]',
  warning: '!',
  check: 'OK',
  cross: 'X'
}

/**
 * Charge une image depuis une URL et la convertit en Base64
 * @param {string} url - URL de l'image
 * @returns {Promise<string|null>} - Data URL ou null en cas d'erreur
 */
async function loadImageAsBase64(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch (e) {
    console.warn('Erreur chargement image:', e)
    return null
  }
}

/**
 * Précharge toutes les images d'un inventaire
 * @param {Object} inventory - Données de l'inventaire
 * @returns {Promise<Map<string, string>>} - Map URL -> Base64
 */
async function preloadAllImages(inventory) {
  const imageMap = new Map()
  const urls = []

  // Collecter toutes les URLs de photos
  const rooms = inventory.rooms || []
  rooms.forEach(room => {
    // Photos de la pièce
    if (room.photos && Array.isArray(room.photos)) {
      room.photos.forEach(photo => {
        if (photo.url) urls.push(photo.url)
      })
    }
    // Photos des éléments
    const items = room.items || []
    items.forEach(item => {
      if (item.photos && Array.isArray(item.photos)) {
        item.photos.forEach(photo => {
          if (photo.url) urls.push(photo.url)
        })
      }
    })
  })

  // Charger toutes les images en parallèle (max 10 à la fois)
  const batchSize = 10
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize)
    const results = await Promise.all(batch.map(url => loadImageAsBase64(url)))
    batch.forEach((url, idx) => {
      if (results[idx]) {
        imageMap.set(url, results[idx])
      }
    })
  }

  return imageMap
}

/**
 * Génère un PDF d'état des lieux conforme à la législation
 * @param {Object} inventory - Données de l'état des lieux
 * @param {Object} options - Options de génération
 * @param {Map} imageMap - Map des images préchargées (optionnel)
 * @returns {jsPDF} Document PDF
 */
export function generateEtatDesLieuxPDF(inventory, options = {}, imageMap = new Map()) {
  const {
    entryInventory = null,
    showComparison = false,
    includePhotos = true
  } = options

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const contentWidth = pageWidth - (margin * 2)
  let y = margin

  // Couleurs
  const colors = {
    primary: [37, 99, 235],      // blue-600
    secondary: [100, 116, 139],  // slate-500
    success: [16, 185, 129],     // emerald-500
    warning: [245, 158, 11],     // amber-500
    danger: [239, 68, 68],       // red-500
    light: [248, 250, 252],      // slate-50
    dark: [15, 23, 42]           // slate-900
  }

  // Données du bail
  const lease = inventory.lease || {}
  const lot = lease.lot || {}
  const property = lot.property || {}
  const entity = property.entity || {}
  const tenant = lease.tenant || {}
  const tenantGroup = tenant.tenant_group || {}
  const tenantName = tenantGroup.name ||
    `${tenant.first_name || ''} ${tenant.last_name || ''}`.trim() || 'Non renseigné'

  // Helpers
  const checkNewPage = (neededHeight = 20) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage()
      y = margin
      return true
    }
    return false
  }

  const drawLine = (startX, startY, endX, endY, color = colors.secondary) => {
    doc.setDrawColor(...color)
    doc.line(startX, startY, endX, endY)
  }

  const drawRect = (x, rectY, width, height, color, filled = false) => {
    if (filled) {
      doc.setFillColor(...color)
      doc.rect(x, rectY, width, height, 'F')
    } else {
      doc.setDrawColor(...color)
      doc.rect(x, rectY, width, height, 'S')
    }
  }

  // ===== EN-TÊTE =====
  const renderHeader = () => {
    // Fond coloré en-tête
    const headerColor = inventory.type === 'entry' ? colors.success : colors.warning
    drawRect(0, 0, pageWidth, 40, headerColor, true)

    // Titre principal
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    const title = `ÉTAT DES LIEUX ${inventory.type === 'entry' ? "D'ENTRÉE" : 'DE SORTIE'}`
    doc.text(title, pageWidth / 2, 18, { align: 'center' })

    // Sous-titre légal
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Établi conformément au Décret n°2016-382 du 30 mars 2016', pageWidth / 2, 28, { align: 'center' })

    // Date
    doc.setFontSize(11)
    const dateStr = new Date(inventory.inventory_date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    doc.text(dateStr, pageWidth / 2, 36, { align: 'center' })

    doc.setTextColor(0, 0, 0)
    y = 50
  }

  // ===== PARTIES PRENANTES =====
  const renderParties = () => {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.primary)
    doc.text('PARTIES PRENANTES', margin, y)
    y += 8

    // Tableau des parties
    const boxWidth = (contentWidth - 10) / 2
    const boxHeight = 50

    // Bailleur
    drawRect(margin, y, boxWidth, boxHeight, colors.light, true)
    drawRect(margin, y, boxWidth, boxHeight, colors.secondary)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.dark)
    doc.text('LE BAILLEUR', margin + 5, y + 8)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(entity.name || 'Non renseigné', margin + 5, y + 18)
    doc.text(entity.address || '', margin + 5, y + 25)
    doc.text(`${entity.postal_code || ''} ${entity.city || ''}`, margin + 5, y + 32)
    if (entity.siren) {
      doc.text(`SIREN : ${entity.siren}`, margin + 5, y + 39)
    }
    if (entity.email) {
      doc.text(`Email : ${entity.email}`, margin + 5, y + 46)
    }

    // Locataire
    const locataireX = margin + boxWidth + 10
    drawRect(locataireX, y, boxWidth, boxHeight, colors.light, true)
    drawRect(locataireX, y, boxWidth, boxHeight, colors.secondary)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('LE LOCATAIRE', locataireX + 5, y + 8)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(tenantName, locataireX + 5, y + 18)
    if (tenant.email) {
      doc.text(`Email : ${tenant.email}`, locataireX + 5, y + 25)
    }
    if (tenant.phone) {
      doc.text(`Tél : ${tenant.phone}`, locataireX + 5, y + 32)
    }

    y += boxHeight + 10
  }

  // ===== DÉSIGNATION DU LOGEMENT =====
  const renderLogement = () => {
    checkNewPage(60)

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.primary)
    doc.text('DÉSIGNATION DU LOGEMENT', margin, y)
    y += 8

    drawRect(margin, y, contentWidth, 45, colors.light, true)
    drawRect(margin, y, contentWidth, 45, colors.secondary)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...colors.dark)

    const logementInfo = [
      [`Propriété : ${property.name || 'Non renseigné'}`, `Lot : ${lot.name || 'Non renseigné'}`],
      [`Adresse : ${property.address || ''}, ${property.postal_code || ''} ${property.city || ''}`],
      [`Type : ${lot.lot_type || 'Non renseigné'}`, `Surface : ${lot.surface_area ? `${lot.surface_area} m²` : 'Non renseignée'}`],
      [`Étage : ${lot.floor !== undefined ? lot.floor : 'NC'}`, `Pièces : ${lot.nb_rooms || 'NC'}`, `Chambres : ${lot.nb_bedrooms || 'NC'}`],
      [`Meublé : ${lot.furnished ? 'Oui' : 'Non'}`, lot.dpe_rating ? `DPE : ${lot.dpe_rating}` : '', lot.ges_rating ? `GES : ${lot.ges_rating}` : '']
    ]

    let infoY = y + 8
    logementInfo.forEach(line => {
      if (Array.isArray(line)) {
        const colWidth = contentWidth / line.length
        line.forEach((text, idx) => {
          if (text) {
            doc.text(text, margin + 5 + (idx * colWidth), infoY)
          }
        })
      } else {
        doc.text(line, margin + 5, infoY)
      }
      infoY += 8
    })

    y += 55
  }

  // ===== RELEVÉS DE COMPTEURS =====
  const renderCompteurs = () => {
    checkNewPage(50)

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.primary)
    doc.text('RELEVÉS DE COMPTEURS', margin, y)
    y += 8

    const meters = [
      { label: 'Eau froide', value: inventory.meter_water_cold, entry: entryInventory?.meter_water_cold, unit: 'm³' },
      { label: 'Eau chaude', value: inventory.meter_water_hot, entry: entryInventory?.meter_water_hot, unit: 'm³' },
      { label: 'Électricité HP', value: inventory.meter_electricity_hp, entry: entryInventory?.meter_electricity_hp, unit: 'kWh' },
      { label: 'Électricité HC', value: inventory.meter_electricity_hc, entry: entryInventory?.meter_electricity_hc, unit: 'kWh' },
      { label: 'Gaz', value: inventory.meter_gas, entry: entryInventory?.meter_gas, unit: 'm³' }
    ]

    const hasAnyMeter = meters.some(m => m.value !== null && m.value !== undefined)

    if (hasAnyMeter) {
      // En-tête tableau
      const colWidths = showComparison ? [50, 40, 40, 40] : [80, 60]
      const headers = showComparison
        ? ['Compteur', 'Sortie', 'Entrée', 'Consommation']
        : ['Compteur', 'Relevé']

      drawRect(margin, y, contentWidth, 8, colors.primary, true)
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')

      let headerX = margin + 3
      headers.forEach((header, idx) => {
        doc.text(header, headerX, y + 6)
        headerX += colWidths[idx]
      })
      y += 8
      doc.setTextColor(...colors.dark)

      // Données
      meters.forEach((meter, idx) => {
        if (meter.value !== null && meter.value !== undefined) {
          const rowColor = idx % 2 === 0 ? colors.light : [255, 255, 255]
          drawRect(margin, y, contentWidth, 7, rowColor, true)

          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8)

          let colX = margin + 3
          doc.text(meter.label, colX, y + 5)
          colX += colWidths[0]
          doc.text(`${meter.value.toLocaleString('fr-FR')} ${meter.unit}`, colX, y + 5)

          if (showComparison && entryInventory) {
            colX += colWidths[1]
            doc.text(meter.entry ? `${meter.entry.toLocaleString('fr-FR')} ${meter.unit}` : '-', colX, y + 5)
            colX += colWidths[2]
            if (meter.entry) {
              const conso = meter.value - meter.entry
              doc.setTextColor(conso > 0 ? colors.warning[0] : colors.success[0], conso > 0 ? colors.warning[1] : colors.success[1], conso > 0 ? colors.warning[2] : colors.success[2])
              doc.text(`${conso > 0 ? '+' : ''}${conso.toLocaleString('fr-FR')} ${meter.unit}`, colX, y + 5)
              doc.setTextColor(...colors.dark)
            }
          }

          y += 7
        }
      })
    } else {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(...colors.secondary)
      doc.text('Aucun relevé de compteur enregistré', margin, y + 5)
      y += 10
    }

    y += 10
  }

  // ===== INVENTAIRE DES CLÉS =====
  const renderCles = () => {
    checkNewPage(40)

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.primary)
    doc.text('INVENTAIRE DES CLÉS ET ACCÈS', margin, y)
    y += 8

    const keys = inventory.keys_details?.filter(k => k.quantity > 0) || []

    if (keys.length > 0) {
      // En-tête tableau
      const colWidths = showComparison ? [60, 30, 30, 30, 30] : [80, 30, 60]
      const headers = showComparison
        ? ['Type', 'Sortie', 'Entrée', 'Diff.', 'Notes']
        : ['Type', 'Quantité', 'Notes']

      drawRect(margin, y, contentWidth, 8, colors.primary, true)
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')

      let headerX = margin + 3
      headers.forEach((header, idx) => {
        doc.text(header, headerX, y + 6)
        headerX += colWidths[idx]
      })
      y += 8
      doc.setTextColor(...colors.dark)

      // Données
      keys.forEach((key, idx) => {
        const keyInfo = KEY_TYPES[key.type] || { label: key.type }
        const entryKey = entryInventory?.keys_details?.find(k => k.type === key.type)
        const diff = entryKey ? key.quantity - entryKey.quantity : 0

        const rowColor = idx % 2 === 0 ? colors.light : [255, 255, 255]
        drawRect(margin, y, contentWidth, 7, rowColor, true)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)

        let colX = margin + 3
        // Label de clé sans emoji
        doc.text(keyInfo.label || key.type, colX, y + 5)
        colX += colWidths[0]
        doc.text(String(key.quantity), colX, y + 5)

        if (showComparison && entryInventory) {
          colX += colWidths[1]
          doc.text(entryKey ? String(entryKey.quantity) : '-', colX, y + 5)
          colX += colWidths[2]
          if (diff !== 0) {
            doc.setTextColor(diff < 0 ? colors.danger[0] : colors.success[0], diff < 0 ? colors.danger[1] : colors.success[1], diff < 0 ? colors.danger[2] : colors.success[2])
            doc.text(`${diff > 0 ? '+' : ''}${diff}`, colX, y + 5)
            doc.setTextColor(...colors.dark)
          }
          colX += colWidths[3]
        } else {
          colX += colWidths[1]
        }
        doc.text(key.notes?.substring(0, 30) || '', colX, y + 5)

        y += 7
      })
    } else {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(...colors.secondary)
      doc.text('Aucune clé enregistrée', margin, y + 5)
      y += 10
    }

    y += 10
  }

  // ===== INSPECTION PIÈCE PAR PIÈCE =====
  const renderRooms = () => {
    const rooms = inventory.rooms || []

    rooms.forEach((room, roomIndex) => {
      checkNewPage(40)

      const roomInfo = ROOM_TYPES[room.room_type] || { label: room.room_type }
      const entryRoom = entryInventory?.rooms?.find(r =>
        r.room_type === room.room_type && r.room_name === room.room_name
      )

      // Titre de la pièce (sans emoji)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...colors.primary)
      doc.text(`${PDF_SYMBOLS.room} ${room.room_name || roomInfo.label}`, margin, y)
      y += 6

      // Éléments de la pièce
      const items = room.items || []

      if (items.length > 0) {
        // En-tête
        const colWidths = showComparison ? [50, 35, 25, 25, 45] : [60, 50, 25, 45]
        const headers = showComparison
          ? ['Élément', 'Catégorie', 'Sortie', 'Entrée', 'Observations']
          : ['Élément', 'Catégorie', 'État', 'Observations']

        drawRect(margin, y, contentWidth, 6, [230, 230, 230], true)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...colors.dark)

        let headerX = margin + 2
        headers.forEach((header, idx) => {
          doc.text(header, headerX, y + 4)
          headerX += colWidths[idx]
        })
        y += 6

        // Éléments
        items.forEach((item, itemIdx) => {
          checkNewPage(8)

          const categoryInfo = ELEMENT_CATEGORIES[item.category] || { label: item.category }
          const ratingInfo = RATING_SCALE[item.rating] || { label: 'NC', color: '#6B7280' }
          const entryItem = entryRoom?.items?.find(i =>
            i.element_type === item.element_type && i.element_name === item.element_name
          )
          const entryRatingInfo = entryItem ? (RATING_SCALE[entryItem.rating] || { label: 'NC' }) : null

          doc.setFont('helvetica', 'normal')
          doc.setFontSize(7)

          let colX = margin + 2
          doc.text(item.element_name?.substring(0, 25) || '', colX, y + 4)
          colX += colWidths[0]
          // Catégorie sans emoji
          doc.text(categoryInfo.label?.substring(0, 18) || '', colX, y + 4)
          colX += colWidths[1]
          doc.text(ratingInfo.label, colX, y + 4)

          if (showComparison && entryInventory) {
            colX += colWidths[2]
            doc.text(entryRatingInfo?.label || '-', colX, y + 4)
            colX += colWidths[3]
          } else {
            colX += colWidths[2]
          }
          doc.text(item.condition_notes?.substring(0, 25) || '', colX, y + 4)

          // Indicateur dégradation (sans emoji)
          if (item.is_degradation) {
            doc.setTextColor(...colors.danger)
            doc.setFont('helvetica', 'bold')
            doc.text(PDF_SYMBOLS.warning, margin - 3, y + 4)
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(...colors.dark)
          }

          y += 6
        })
      } else {
        doc.setFontSize(8)
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(...colors.secondary)
        doc.text('Aucun élément inspecté', margin + 5, y + 5)
        y += 8
      }

      // Observations de la pièce
      if (room.observations) {
        checkNewPage(15)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(...colors.secondary)
        const obsLines = doc.splitTextToSize(`Observations : ${room.observations}`, contentWidth - 10)
        obsLines.forEach(line => {
          doc.text(line, margin + 5, y + 5)
          y += 4
        })
      }

      // Photos de la pièce (si activées)
      if (includePhotos && room.photos && room.photos.length > 0) {
        checkNewPage(50)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...colors.secondary)
        doc.text('Photos de la pièce :', margin + 5, y + 5)
        y += 8

        // Afficher les photos en grille (3 par ligne)
        const photoWidth = 55
        const photoHeight = 40
        const photosPerRow = 3
        let photoX = margin

        room.photos.forEach((photo, photoIdx) => {
          if (photo.url) {
            const imageData = imageMap.get(photo.url)
            if (imageData) {
              if (photoX + photoWidth > pageWidth - margin) {
                photoX = margin
                y += photoHeight + 5
              }
              checkNewPage(photoHeight + 10)

              try {
                doc.addImage(imageData, 'JPEG', photoX, y, photoWidth, photoHeight)
                // Légende de la photo
                doc.setFontSize(6)
                doc.setFont('helvetica', 'normal')
                doc.setTextColor(...colors.secondary)
                const caption = photo.caption || `Photo ${photoIdx + 1}`
                doc.text(caption.substring(0, 25), photoX, y + photoHeight + 3)
              } catch (e) {
                // En cas d'erreur, afficher un placeholder
                drawRect(photoX, y, photoWidth, photoHeight, colors.light, true)
                doc.setFontSize(7)
                doc.text('Image', photoX + 20, y + 20)
              }

              photoX += photoWidth + 5
              if ((photoIdx + 1) % photosPerRow === 0) {
                photoX = margin
                y += photoHeight + 8
              }
            }
          }
        })

        // Repositionner Y après les photos
        if (room.photos.length % photosPerRow !== 0) {
          y += photoHeight + 8
        }
      }

      y += 8

      // Ligne séparatrice si pas dernier
      if (roomIndex < rooms.length - 1) {
        drawLine(margin, y, pageWidth - margin, y, [200, 200, 200])
        y += 5
      }
    })
  }

  // ===== OBSERVATIONS GÉNÉRALES =====
  const renderObservations = () => {
    checkNewPage(30)

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.primary)
    doc.text('OBSERVATIONS GÉNÉRALES', margin, y)
    y += 8

    if (inventory.general_observations) {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...colors.dark)
      const obsLines = doc.splitTextToSize(inventory.general_observations, contentWidth - 10)
      obsLines.forEach(line => {
        checkNewPage(5)
        doc.text(line, margin, y)
        y += 5
      })
    } else {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(...colors.secondary)
      doc.text('Aucune observation générale', margin, y)
      y += 5
    }

    y += 10
  }

  // ===== COMPARAISON ET RETENUES (pour sortie) =====
  const renderComparison = () => {
    if (inventory.type !== 'exit' || !showComparison || !entryInventory) return

    checkNewPage(50)

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.primary)
    doc.text('SYNTHÈSE ET RETENUES SUR DÉPÔT DE GARANTIE', margin, y)
    y += 10

    // Calculer les retenues
    const deductions = inventory.deposit_deductions || {}
    const totalDeductions = deductions.total || 0
    const depositAmount = lease.deposit_amount || 0
    const toReturn = depositAmount - totalDeductions

    // Tableau récapitulatif
    drawRect(margin, y, contentWidth, 35, colors.light, true)
    drawRect(margin, y, contentWidth, 35, colors.secondary)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')

    doc.text('Dépôt de garantie versé :', margin + 5, y + 10)
    doc.setFont('helvetica', 'bold')
    doc.text(`${depositAmount.toLocaleString('fr-FR')} €`, margin + contentWidth - 40, y + 10)

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...colors.danger)
    doc.text('Retenues pour réparations :', margin + 5, y + 20)
    doc.setFont('helvetica', 'bold')
    doc.text(`- ${totalDeductions.toLocaleString('fr-FR')} €`, margin + contentWidth - 40, y + 20)

    doc.setTextColor(...colors.success)
    doc.setFontSize(10)
    doc.text('Montant à restituer :', margin + 5, y + 30)
    doc.setFont('helvetica', 'bold')
    doc.text(`${toReturn.toLocaleString('fr-FR')} €`, margin + contentWidth - 40, y + 30)

    doc.setTextColor(...colors.dark)
    y += 45
  }

  // ===== SIGNATURES =====
  const renderSignatures = () => {
    checkNewPage(80)

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.primary)
    doc.text('SIGNATURES', margin, y)
    y += 5

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...colors.secondary)
    doc.text('Les soussignés reconnaissent l\'exactitude du présent état des lieux.', margin, y)
    y += 10

    const signatureWidth = (contentWidth - 20) / 2
    const signatureHeight = 50

    // Zone signature bailleur
    drawRect(margin, y, signatureWidth, signatureHeight, colors.light, true)
    drawRect(margin, y, signatureWidth, signatureHeight, colors.secondary)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.dark)
    doc.text('Le Bailleur', margin + 5, y + 8)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(entity.name || '', margin + 5, y + 15)

    if (inventory.landlord_signature && inventory.status === 'signed') {
      try {
        doc.addImage(inventory.landlord_signature, 'PNG', margin + 10, y + 20, signatureWidth - 20, 25)
      } catch (e) {
        doc.text('Signature enregistrée', margin + 5, y + 35)
      }
      if (inventory.landlord_signed_at) {
        doc.setFontSize(7)
        doc.text(`Signé le ${new Date(inventory.landlord_signed_at).toLocaleDateString('fr-FR')}`, margin + 5, y + 47)
      }
    } else {
      doc.setFontSize(8)
      doc.setTextColor(...colors.secondary)
      doc.text('Signature :', margin + 5, y + 25)
    }

    // Zone signature locataire
    const locataireX = margin + signatureWidth + 20
    drawRect(locataireX, y, signatureWidth, signatureHeight, colors.light, true)
    drawRect(locataireX, y, signatureWidth, signatureHeight, colors.secondary)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.dark)
    doc.text('Le Locataire', locataireX + 5, y + 8)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(tenantName, locataireX + 5, y + 15)

    if (inventory.tenant_signature && inventory.status === 'signed') {
      try {
        doc.addImage(inventory.tenant_signature, 'PNG', locataireX + 10, y + 20, signatureWidth - 20, 25)
      } catch (e) {
        doc.text('Signature enregistrée', locataireX + 5, y + 35)
      }
      if (inventory.tenant_signed_at) {
        doc.setFontSize(7)
        doc.text(`Signé le ${new Date(inventory.tenant_signed_at).toLocaleDateString('fr-FR')}`, locataireX + 5, y + 47)
      }
    } else {
      doc.setFontSize(8)
      doc.setTextColor(...colors.secondary)
      doc.text('Signature :', locataireX + 5, y + 25)
    }

    y += signatureHeight + 10
  }

  // ===== PIED DE PAGE =====
  const renderFooter = () => {
    const totalPages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)

      // Ligne séparatrice
      drawLine(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15, [200, 200, 200])

      // Texte du pied de page
      doc.setFontSize(7)
      doc.setTextColor(...colors.secondary)
      doc.text(
        `État des lieux ${inventory.type === 'entry' ? "d'entrée" : 'de sortie'} - ${property.name} - ${lot.name}`,
        margin,
        pageHeight - 8
      )
      doc.text(
        `Page ${i} / ${totalPages}`,
        pageWidth - margin,
        pageHeight - 8,
        { align: 'right' }
      )
    }
  }

  // ===== MENTIONS LÉGALES =====
  const renderMentionsLegales = () => {
    checkNewPage(30)

    doc.setFontSize(7)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(...colors.secondary)

    const mentions = [
      'Ce document est établi conformément au Décret n°2016-382 du 30 mars 2016 fixant les modalités d\'établissement',
      'de l\'état des lieux et de prise en compte de la vétusté des logements loués à usage de résidence principale.',
      '',
      'L\'état des lieux est établi contradictoirement par les parties lors de la remise et de la restitution des clés.',
      'Il est versé au dossier de chacune des parties. Tout désaccord devra être résolu à l\'amiable ou par voie judiciaire.',
      '',
      `Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`
    ]

    mentions.forEach(line => {
      doc.text(line, margin, y)
      y += 4
    })
  }

  // ===== GÉNÉRATION DU DOCUMENT =====
  renderHeader()
  renderParties()
  renderLogement()
  renderCompteurs()
  renderCles()
  renderRooms()
  renderObservations()
  renderComparison()
  renderSignatures()
  renderMentionsLegales()
  renderFooter()

  return doc
}

/**
 * Télécharge le PDF d'état des lieux (synchrone, sans photos)
 * @param {Object} inventory - Données de l'état des lieux
 * @param {Object} options - Options de génération
 */
export function downloadEtatDesLieuxPDF(inventory, options = {}) {
  const doc = generateEtatDesLieuxPDF(inventory, { ...options, includePhotos: false })

  const lease = inventory.lease || {}
  const lot = lease.lot || {}
  const property = lot.property || {}
  const dateStr = new Date(inventory.inventory_date).toISOString().split('T')[0]
  const typeLabel = inventory.type === 'entry' ? 'entree' : 'sortie'

  const fileName = `EDL_${typeLabel}_${property.name?.replace(/\s+/g, '_') || 'propriete'}_${lot.name?.replace(/\s+/g, '_') || 'lot'}_${dateStr}.pdf`

  doc.save(fileName)
}

/**
 * Télécharge le PDF d'état des lieux avec photos (asynchrone)
 * @param {Object} inventory - Données de l'état des lieux
 * @param {Object} options - Options de génération
 * @param {Function} onProgress - Callback de progression (optionnel)
 * @returns {Promise<void>}
 */
export async function downloadEtatDesLieuxPDFWithPhotos(inventory, options = {}, onProgress = null) {
  // Précharger toutes les images
  if (onProgress) onProgress({ stage: 'loading', message: 'Chargement des photos...' })
  const imageMap = await preloadAllImages(inventory)

  // Générer le PDF avec les images
  if (onProgress) onProgress({ stage: 'generating', message: 'Génération du PDF...' })
  const doc = generateEtatDesLieuxPDF(inventory, { ...options, includePhotos: true }, imageMap)

  const lease = inventory.lease || {}
  const lot = lease.lot || {}
  const property = lot.property || {}
  const dateStr = new Date(inventory.inventory_date).toISOString().split('T')[0]
  const typeLabel = inventory.type === 'entry' ? 'entree' : 'sortie'

  const fileName = `EDL_${typeLabel}_${property.name?.replace(/\s+/g, '_') || 'propriete'}_${lot.name?.replace(/\s+/g, '_') || 'lot'}_${dateStr}_complet.pdf`

  if (onProgress) onProgress({ stage: 'complete', message: 'Téléchargement...' })
  doc.save(fileName)
}

/**
 * Compte le nombre de photos dans un inventaire
 * @param {Object} inventory - Données de l'inventaire
 * @returns {number} - Nombre total de photos
 */
export function countPhotosInInventory(inventory) {
  let count = 0
  const rooms = inventory.rooms || []
  rooms.forEach(room => {
    if (room.photos) count += room.photos.length
    const items = room.items || []
    items.forEach(item => {
      if (item.photos) count += item.photos.length
    })
  })
  return count
}

export default {
  generateEtatDesLieuxPDF,
  downloadEtatDesLieuxPDF,
  downloadEtatDesLieuxPDFWithPhotos,
  countPhotosInInventory
}
