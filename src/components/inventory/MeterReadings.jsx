/**
 * Composant pour les relevés de compteurs
 * Conforme aux mentions obligatoires du Décret 2016-382
 */

import { METER_TYPES } from '../../constants/inventoryConstants'

function MeterReadings({
  values = {},
  onChange,
  entryValues = null, // Pour comparaison lors d'un EDL de sortie
  readonly = false
}) {
  const handleChange = (meterId, value) => {
    onChange({
      ...values,
      [meterId]: value === '' ? null : parseInt(value, 10)
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {METER_TYPES.map(meter => {
          const currentValue = values[meter.id]
          const entryValue = entryValues?.[meter.id]
          const consumption = entryValue !== null && currentValue !== null
            ? currentValue - entryValue
            : null

          return (
            <div
              key={meter.id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{meter.icon}</span>
                <div>
                  <h4 className="font-medium text-gray-900">{meter.label}</h4>
                  <p className="text-xs text-gray-500">Unité : {meter.unit}</p>
                </div>
              </div>

              <div className="space-y-2">
                {/* Valeur à l'entrée (lecture seule si EDL sortie) */}
                {entryValue !== null && entryValue !== undefined && (
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Entrée</span>
                    <span className="font-medium text-gray-900">
                      {entryValue.toLocaleString('fr-FR')} {meter.unit}
                    </span>
                  </div>
                )}

                {/* Valeur actuelle */}
                <div className="flex items-center gap-2">
                  {entryValue !== null && entryValue !== undefined && (
                    <span className="text-sm text-gray-600 w-16">Sortie</span>
                  )}
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={currentValue ?? ''}
                      onChange={(e) => handleChange(meter.id, e.target.value)}
                      disabled={readonly}
                      placeholder="Index..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 pr-14"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                      {meter.unit}
                    </span>
                  </div>
                </div>

                {/* Consommation calculée */}
                {consumption !== null && (
                  <div className={`
                    flex items-center justify-between p-2 rounded
                    ${consumption > 0 ? 'bg-blue-50' : 'bg-amber-50'}
                  `}>
                    <span className="text-sm text-gray-600">Consommation</span>
                    <span className={`font-medium ${consumption > 0 ? 'text-blue-700' : 'text-amber-700'}`}>
                      {consumption > 0 ? '+' : ''}{consumption.toLocaleString('fr-FR')} {meter.unit}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Note explicative */}
      <p className="text-xs text-gray-500 italic">
        Les relevés de compteurs sont obligatoires selon le Décret n°2016-382 du 30 mars 2016.
        Notez les index affichés sur chaque compteur au moment de l'état des lieux.
      </p>
    </div>
  )
}

export default MeterReadings
