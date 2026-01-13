import { View, Text } from '@react-pdf/renderer'
import { baseStyles, COLORS, formatDate } from './PDFStyles'

/**
 * Section signature pour documents PDF
 *
 * @param {Object} props
 * @param {string} [props.lieu] - Lieu de signature
 * @param {string} [props.date] - Date de signature
 * @param {boolean} [props.showLocataire=false] - Afficher aussi une zone pour le locataire
 * @param {string} [props.bailleLabel="Le bailleur"] - Label pour le bailleur
 * @param {string} [props.locataireLabel="Le locataire"] - Label pour le locataire
 * @param {string} [props.mentionLu="Lu et approuvé"] - Mention à ajouter
 */
const PDFSignature = ({
  lieu = '',
  date,
  showLocataire = false,
  bailleurLabel = 'Le bailleur',
  locataireLabel = 'Le locataire',
  mentionLu = ''
}) => {
  const formattedDate = date ? formatDate(date) : formatDate(new Date().toISOString())

  return (
    <View style={baseStyles.signatureSection}>
      {/* Signature bailleur */}
      <View style={baseStyles.signatureBox}>
        <Text style={baseStyles.signatureLabel}>{bailleurLabel}</Text>

        {lieu && (
          <Text style={{ fontSize: 9, marginBottom: 4 }}>
            Fait à {lieu}
          </Text>
        )}

        <Text style={{ fontSize: 9, marginBottom: 8 }}>
          Le {formattedDate}
        </Text>

        {mentionLu && (
          <Text style={{ fontSize: 8, fontStyle: 'italic', marginBottom: 4, color: COLORS.textMuted }}>
            {mentionLu}
          </Text>
        )}

        <View style={baseStyles.signatureLine} />

        <Text style={baseStyles.signatureDate}>
          Signature
        </Text>
      </View>

      {/* Signature locataire (optionnel) */}
      {showLocataire && (
        <View style={baseStyles.signatureBox}>
          <Text style={baseStyles.signatureLabel}>{locataireLabel}</Text>

          {lieu && (
            <Text style={{ fontSize: 9, marginBottom: 4 }}>
              Fait à {lieu}
            </Text>
          )}

          <Text style={{ fontSize: 9, marginBottom: 8 }}>
            Le {formattedDate}
          </Text>

          {mentionLu && (
            <Text style={{ fontSize: 8, fontStyle: 'italic', marginBottom: 4, color: COLORS.textMuted }}>
              {mentionLu}
            </Text>
          )}

          <View style={baseStyles.signatureLine} />

          <Text style={baseStyles.signatureDate}>
            Signature
          </Text>
        </View>
      )}
    </View>
  )
}

export default PDFSignature
