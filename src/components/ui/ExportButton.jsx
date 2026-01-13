import { useState } from 'react'
import { Download } from 'lucide-react'
import Button from './Button'
import { downloadCSV, exportConfigs } from '../../utils/exportCSV'

/**
 * Bouton d'export CSV réutilisable
 *
 * @param {Array} data - Données à exporter
 * @param {string} type - Type de données (entities, properties, lots, tenants, leases, payments)
 * @param {string} filename - Nom du fichier (sans extension)
 * @param {Array} columns - Configuration personnalisée des colonnes (optionnel)
 * @param {Function} onExport - Callback après export (optionnel)
 * @param {string} variant - Variant du bouton (default: secondary)
 * @param {string} size - Taille du bouton (default: md)
 * @param {boolean} disabled - Désactiver le bouton
 * @param {string} className - Classes CSS additionnelles
 */
function ExportButton({
  data,
  type,
  filename,
  columns,
  onExport,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  className = ''
}) {
  const [exporting, setExporting] = useState(false)

  const handleExport = () => {
    if (!data || data.length === 0) {
      return
    }

    setExporting(true)

    try {
      // Utiliser les colonnes personnalisées ou la config prédéfinie
      const exportColumns = columns || exportConfigs[type]

      if (!exportColumns) {
        console.error(`No export config found for type: ${type}`)
        return
      }

      downloadCSV(data, exportColumns, filename)

      if (onExport) {
        onExport()
      }
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setExporting(false)
    }
  }

  const isDisabled = disabled || !data || data.length === 0 || exporting

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={isDisabled}
      className={className}
    >
      <Download className={`w-4 h-4 mr-2 ${exporting ? 'animate-bounce' : ''}`} />
      {exporting ? 'Export...' : 'Exporter CSV'}
    </Button>
  )
}

export default ExportButton
