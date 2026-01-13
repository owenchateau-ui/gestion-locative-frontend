import { memo } from 'react'
import PropTypes from 'prop-types'
import { User, UserPlus } from 'lucide-react'

const DocumentsStep = memo(function DocumentsStep({
  formData,
  documents,
  onFileChange
}) {
  const applicationType = formData.application_type
  const isCouple = applicationType === 'couple'
  const isColocation = applicationType === 'colocation'
  const showApplicant2 = isCouple || isColocation
  const showApplicant3 = isColocation && formData.nb_applicants >= 3
  const showApplicant4 = isColocation && formData.nb_applicants >= 4

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Documents</h2>
        <p className="text-sm text-gray-600">
          Veuillez télécharger les documents suivants (formats acceptés : PDF, JPEG, PNG - max 10 Mo par fichier)
        </p>
      </div>

      {/* Candidat 1 - Documents */}
      <DocumentSection
        title={applicationType === 'individual' ? 'Vos documents' : 'Documents - Candidat 1'}
        applicantNumber={1}
        documents={documents}
        onFileChange={onFileChange}
        colorScheme="blue"
      />

      {/* Candidat 2 - Documents */}
      {showApplicant2 && (
        <DocumentSection
          title={`Documents - ${isCouple ? 'Conjoint(e)' : 'Candidat 2'}`}
          applicantNumber={2}
          documents={documents}
          onFileChange={onFileChange}
          colorScheme={isCouple ? 'green' : 'purple'}
        />
      )}

      {/* Candidat 3 - Documents */}
      {showApplicant3 && (
        <DocumentSection
          title="Documents - Candidat 3"
          applicantNumber={3}
          documents={documents}
          onFileChange={onFileChange}
          colorScheme="purple"
        />
      )}

      {/* Candidat 4 - Documents */}
      {showApplicant4 && (
        <DocumentSection
          title="Documents - Candidat 4"
          applicantNumber={4}
          documents={documents}
          onFileChange={onFileChange}
          colorScheme="purple"
        />
      )}

      {/* Garant 1 - Documents */}
      {formData.has_guarantor && (
        <GuarantorDocumentSection
          title="Documents - Garant 1"
          prefix="guarantor"
          documents={documents}
          onFileChange={onFileChange}
          colorScheme="emerald"
        />
      )}

      {/* Garant 2 - Documents */}
      {formData.has_guarantor2 && (
        <GuarantorDocumentSection
          title="Documents - Garant 2"
          prefix="guarantor2"
          documents={documents}
          onFileChange={onFileChange}
          colorScheme="teal"
        />
      )}
    </div>
  )
})

const DocumentSection = memo(function DocumentSection({
  title,
  applicantNumber,
  documents,
  onFileChange,
  colorScheme
}) {
  const colors = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', ring: 'focus:ring-blue-500' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', ring: 'focus:ring-green-500' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900', ring: 'focus:ring-purple-500' }
  }
  const c = colors[colorScheme] || colors.blue

  const suffix = applicantNumber > 1 ? `_applicant${applicantNumber}` : ''
  const idCardKey = `id_card${suffix}`
  const proofIncomeKey = `proof_income${suffix}`
  const taxNoticeKey = `tax_notice${suffix}`

  const renderFileList = (files) => {
    if (!files) return null
    const fileArray = Array.isArray(files) ? files : [files]
    return (
      <div className="mt-2 space-y-1">
        {fileArray.map((file, index) => (
          <p key={index} className="text-xs text-green-600">✓ {file.name}</p>
        ))}
      </div>
    )
  }

  return (
    <div className={`space-y-4 p-6 ${c.bg} rounded-lg border-2 ${c.border}`}>
      <h3 className={`text-lg font-semibold ${c.text} mb-4 flex items-center gap-2`}>
        <User className="w-5 h-5" />
        {title}
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pièce d'identité * (recto-verso)
        </label>
        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => onFileChange(e, 'id_card', applicantNumber)}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${c.ring}`}
        />
        {renderFileList(documents[idCardKey])}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Justificatifs de revenus * (3 derniers bulletins de salaire)
        </label>
        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => onFileChange(e, 'proof_income', applicantNumber)}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${c.ring}`}
        />
        {renderFileList(documents[proofIncomeKey])}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Avis d'imposition
        </label>
        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => onFileChange(e, 'tax_notice', applicantNumber)}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${c.ring}`}
        />
        {renderFileList(documents[taxNoticeKey])}
      </div>
    </div>
  )
})

const GuarantorDocumentSection = memo(function GuarantorDocumentSection({
  title,
  prefix,
  documents,
  onFileChange,
  colorScheme
}) {
  const colors = {
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', ring: 'focus:ring-emerald-500' },
    teal: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-900', ring: 'focus:ring-teal-500' }
  }
  const c = colors[colorScheme] || colors.emerald

  const idKey = `${prefix}_id`
  const incomeKey = `${prefix}_income`

  const renderFileList = (files) => {
    if (!files) return null
    const fileArray = Array.isArray(files) ? files : [files]
    return (
      <div className="mt-2 space-y-1">
        {fileArray.map((file, index) => (
          <p key={index} className="text-xs text-green-600">✓ {file.name}</p>
        ))}
      </div>
    )
  }

  return (
    <div className={`space-y-4 p-6 ${c.bg} rounded-lg border-2 ${c.border}`}>
      <h3 className={`text-lg font-semibold ${c.text} mb-4 flex items-center gap-2`}>
        <UserPlus className="w-5 h-5" />
        {title}
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pièce d'identité garant *
        </label>
        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => onFileChange(e, idKey, 1)}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${c.ring}`}
        />
        {renderFileList(documents[idKey])}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Justificatifs revenus garant *
        </label>
        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => onFileChange(e, incomeKey, 1)}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${c.ring}`}
        />
        {renderFileList(documents[incomeKey])}
      </div>
    </div>
  )
})

DocumentSection.propTypes = {
  title: PropTypes.string.isRequired,
  applicantNumber: PropTypes.number.isRequired,
  documents: PropTypes.object.isRequired,
  onFileChange: PropTypes.func.isRequired,
  colorScheme: PropTypes.string.isRequired
}

GuarantorDocumentSection.propTypes = {
  title: PropTypes.string.isRequired,
  prefix: PropTypes.string.isRequired,
  documents: PropTypes.object.isRequired,
  onFileChange: PropTypes.func.isRequired,
  colorScheme: PropTypes.string.isRequired
}

DocumentsStep.propTypes = {
  formData: PropTypes.object.isRequired,
  documents: PropTypes.object.isRequired,
  onFileChange: PropTypes.func.isRequired
}

export default DocumentsStep
