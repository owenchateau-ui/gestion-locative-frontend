import jsPDF from 'jspdf'
import { supabase } from '../lib/supabase'

/**
 * Génère une lettre PDF d'indexation de loyer conforme à la loi
 * @param {Object} lease - Le bail avec les informations d'indexation
 * @param {Object} user - L'utilisateur connecté
 */
export const generateIndexationLetter = async (lease, user) => {
  try {
    // Récupérer les informations complètes du bail
    const { data: leaseData, error: leaseError } = await supabase
      .from('leases')
      .select(`
        *,
        lot:lots!inner(
          *,
          properties_new!inner(
            *,
            entities!inner(*)
          )
        ),
        tenant:tenants!inner(*)
      `)
      .eq('id', lease.id)
      .single()

    if (leaseError) throw leaseError

    // Récupérer les informations du bailleur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('supabase_uid', user.id)
      .single()

    if (userError) throw userError

    // Récupérer l'entité pour les coordonnées du bailleur
    const entity = leaseData.lot.properties_new.entities

    // Créer le PDF
    const doc = new jsPDF()

    // En-tête bailleur
    doc.setFontSize(10)
    doc.setFont(undefined, 'bold')
    doc.text(entity.name, 20, 20)
    doc.setFont(undefined, 'normal')

    if (entity.address) {
      doc.text(entity.address, 20, 26)
    }
    if (entity.postal_code && entity.city) {
      doc.text(`${entity.postal_code} ${entity.city}`, 20, 32)
    }
    if (entity.email) {
      doc.text(`Email: ${entity.email}`, 20, 38)
    }
    if (entity.phone) {
      doc.text(`Tel: ${entity.phone}`, 20, 44)
    }

    // Destinataire (locataire)
    doc.text(`${leaseData.tenant.first_name} ${leaseData.tenant.last_name}`, 120, 20)
    if (leaseData.lot.properties_new.address) {
      doc.text(leaseData.lot.properties_new.address, 120, 26)
    }
    if (leaseData.lot.properties_new.postal_code && leaseData.lot.properties_new.city) {
      doc.text(`${leaseData.lot.properties_new.postal_code} ${leaseData.lot.properties_new.city}`, 120, 32)
    }

    // Date et lieu
    const today = new Date()
    const dateStr = today.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    doc.text(`${entity.city || ''}, le ${dateStr}`, 120, 50)

    // Objet
    doc.setFontSize(11)
    doc.setFont(undefined, 'bold')
    doc.text('Objet : Révision annuelle de votre loyer', 20, 70)
    doc.setFont(undefined, 'normal')

    // Référence légale
    doc.setFontSize(10)
    doc.text('Référence : Article 17-1 de la loi du 6 juillet 1989', 20, 76)

    // Corps de la lettre
    let y = 90
    const lineHeight = 6
    const maxWidth = 170

    // Formule de politesse
    doc.text(`${leaseData.tenant.first_name === leaseData.tenant.last_name.charAt(0).toUpperCase() + leaseData.tenant.last_name.slice(1).toLowerCase() ? 'Madame' : 'Monsieur'},`, 20, y)
    y += lineHeight * 2

    // Paragraphe 1 - Rappel du bail
    const para1 = `Conformément aux dispositions de l'article 17-1 de la loi du 6 juillet 1989, je vous informe par la présente de la révision annuelle du loyer du logement que vous occupez situé au ${leaseData.lot.properties_new.address}, ${leaseData.lot.properties_new.postal_code} ${leaseData.lot.properties_new.city}.`
    const para1Lines = doc.splitTextToSize(para1, maxWidth)
    doc.text(para1Lines, 20, y)
    y += para1Lines.length * lineHeight + lineHeight

    // Paragraphe 2 - Montants actuels
    doc.setFont(undefined, 'bold')
    doc.text('Montants actuels :', 20, y)
    doc.setFont(undefined, 'normal')
    y += lineHeight
    doc.text(`• Loyer mensuel hors charges : ${parseFloat(lease.indexationCalculation.oldRent).toFixed(2)} €`, 25, y)
    y += lineHeight
    const chargesAmount = parseFloat(leaseData.charges_amount) || 0
    doc.text(`• Charges mensuelles : ${chargesAmount.toFixed(2)} €`, 25, y)
    y += lineHeight
    doc.text(`• Total mensuel : ${(parseFloat(lease.indexationCalculation.oldRent) + chargesAmount).toFixed(2)} €`, 25, y)
    y += lineHeight * 2

    // Paragraphe 3 - Calcul de la révision
    doc.setFont(undefined, 'bold')
    doc.text('Calcul de la révision :', 20, y)
    doc.setFont(undefined, 'normal')
    y += lineHeight

    const para3 = `La révision du loyer est calculée en application de la variation de l'indice de référence des loyers (IRL) publié par l'INSEE.`
    const para3Lines = doc.splitTextToSize(para3, maxWidth)
    doc.text(para3Lines, 20, y)
    y += para3Lines.length * lineHeight + lineHeight

    doc.text(`• Indice de référence : ${lease.indexationCalculation.oldIRLQuarter} = ${lease.indexationCalculation.oldIRLValue}`, 25, y)
    y += lineHeight
    doc.text(`• Nouvel indice : ${lease.indexationCalculation.newIRLQuarter} = ${lease.indexationCalculation.newIRLValue}`, 25, y)
    y += lineHeight
    doc.text(`• Variation : +${lease.indexationCalculation.increasePercentage.toFixed(2)}%`, 25, y)
    y += lineHeight * 2

    // Formule de calcul
    doc.setFontSize(9)
    doc.setFont(undefined, 'italic')
    const formula = `Formule : ${lease.indexationCalculation.oldRent.toFixed(2)} € × (${lease.indexationCalculation.newIRLValue} / ${lease.indexationCalculation.oldIRLValue}) = ${lease.indexationCalculation.newRent.toFixed(2)} €`
    doc.text(formula, 25, y)
    y += lineHeight * 2
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')

    // Paragraphe 4 - Nouveaux montants
    doc.setFont(undefined, 'bold')
    doc.text('Nouveaux montants à compter du ' + new Date(lease.anniversaryDate).toLocaleDateString('fr-FR') + ' :', 20, y)
    doc.setFont(undefined, 'normal')
    y += lineHeight
    doc.setFontSize(11)
    doc.setFont(undefined, 'bold')
    doc.text(`• Nouveau loyer mensuel hors charges : ${lease.indexationCalculation.newRent.toFixed(2)} €`, 25, y)
    y += lineHeight
    doc.setFont(undefined, 'normal')
    doc.setFontSize(10)
    doc.text(`• Charges mensuelles (inchangées) : ${chargesAmount.toFixed(2)} €`, 25, y)
    y += lineHeight
    doc.setFontSize(11)
    doc.setFont(undefined, 'bold')
    doc.text(`• Nouvelle mensualité totale : ${(parseFloat(lease.indexationCalculation.newRent) + chargesAmount).toFixed(2)} €`, 25, y)
    y += lineHeight * 2
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')

    // Paragraphe 5 - Date d'effet
    const para5 = `Cette révision prendra effet à compter du ${new Date(lease.anniversaryDate).toLocaleDateString('fr-FR')}, date anniversaire de la prise d'effet du bail ou de sa dernière révision.`
    const para5Lines = doc.splitTextToSize(para5, maxWidth)
    doc.text(para5Lines, 20, y)
    y += para5Lines.length * lineHeight + lineHeight

    // Paragraphe 6 - Formule de politesse
    const para6 = `Je vous prie d'agréer, ${leaseData.tenant.first_name === leaseData.tenant.last_name.charAt(0).toUpperCase() + leaseData.tenant.last_name.slice(1).toLowerCase() ? 'Madame' : 'Monsieur'}, l'expression de mes salutations distinguées.`
    const para6Lines = doc.splitTextToSize(para6, maxWidth)
    doc.text(para6Lines, 20, y)
    y += para6Lines.length * lineHeight + lineHeight * 2

    // Signature
    doc.setFont(undefined, 'bold')
    doc.text(entity.name, 120, y)
    doc.setFont(undefined, 'normal')
    y += lineHeight
    doc.setFontSize(9)
    doc.text('(Signature)', 120, y)

    // Footer - Mentions légales
    doc.setFontSize(7)
    doc.setTextColor(100)
    doc.text('Cette lettre fait foi de la révision du loyer conformément à l\'article 17-1 de la loi n°89-462 du 6 juillet 1989.', 20, 280)
    doc.text(`Source des indices IRL : INSEE - ${lease.indexationCalculation.newIRLQuarter}`, 20, 285)

    // Télécharger le PDF
    const filename = `lettre_indexation_${leaseData.tenant.last_name}_${new Date().getFullYear()}.pdf`
    doc.save(filename)

    return true
  } catch (error) {
    console.error('Error generating indexation letter:', error)
    throw error
  }
}
