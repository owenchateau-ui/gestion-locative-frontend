import { View, Text } from '@react-pdf/renderer'
import { baseStyles, COLORS } from './PDFStyles'

/**
 * Pied de page PDF avec numéro de page et mentions légales
 *
 * @param {Object} props
 * @param {boolean} [props.showPageNumber=true] - Afficher le numéro de page
 * @param {string} [props.legalText] - Texte légal personnalisé
 * @param {string} [props.companyInfo] - Informations complémentaires entreprise
 */
const PDFFooter = ({
  showPageNumber = true,
  legalText,
  companyInfo
}) => {
  return (
    <View style={baseStyles.footer} fixed>
      {companyInfo && (
        <Text style={{ marginBottom: 4 }}>
          {companyInfo}
        </Text>
      )}

      {legalText && (
        <Text style={{ marginBottom: 4, fontStyle: 'italic' }}>
          {legalText}
        </Text>
      )}

      {showPageNumber && (
        <Text
          style={baseStyles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} / ${totalPages}`
          }
        />
      )}

      <Text style={{ marginTop: 4, fontSize: 7 }}>
        Document généré automatiquement par Gestion Locative SaaS
      </Text>
    </View>
  )
}

export default PDFFooter
