import { View, Text, Image } from '@react-pdf/renderer'
import { baseStyles, COLORS } from './PDFStyles'

/**
 * En-tête PDF avec informations du bailleur
 *
 * @param {Object} props
 * @param {Object} props.bailleur - Informations du bailleur
 * @param {string} props.bailleur.nom - Nom ou raison sociale
 * @param {string} props.bailleur.adresse - Adresse complète
 * @param {string} props.bailleur.ville - Ville
 * @param {string} props.bailleur.codePostal - Code postal
 * @param {string} [props.bailleur.email] - Email
 * @param {string} [props.bailleur.telephone] - Téléphone
 * @param {string} [props.bailleur.siret] - Numéro SIRET
 * @param {string} [props.bailleur.logo] - URL du logo
 * @param {string} [props.documentDate] - Date du document
 * @param {string} [props.documentNumber] - Numéro du document
 */
const PDFHeader = ({ bailleur, documentDate, documentNumber }) => {
  const formatDate = (date) => {
    if (!date) return new Date().toLocaleDateString('fr-FR')
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <View style={baseStyles.header}>
      <View style={baseStyles.headerRow}>
        {/* Informations bailleur */}
        <View style={baseStyles.headerLeft}>
          {bailleur.logo && (
            <Image src={bailleur.logo} style={baseStyles.logo} />
          )}
          <Text style={baseStyles.companyName}>{bailleur.nom}</Text>
          <Text style={baseStyles.companyInfo}>
            {bailleur.adresse}
            {'\n'}
            {bailleur.codePostal} {bailleur.ville}
            {bailleur.email && `\n${bailleur.email}`}
            {bailleur.telephone && `\nTél : ${bailleur.telephone}`}
            {bailleur.siret && `\nSIRET : ${bailleur.siret}`}
          </Text>
        </View>

        {/* Date et numéro de document */}
        <View style={baseStyles.headerRight}>
          <Text style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 4 }}>
            Date : {formatDate(documentDate)}
          </Text>
          {documentNumber && (
            <Text style={{ fontSize: 9, color: COLORS.textMuted }}>
              Réf : {documentNumber}
            </Text>
          )}
        </View>
      </View>
    </View>
  )
}

export default PDFHeader
