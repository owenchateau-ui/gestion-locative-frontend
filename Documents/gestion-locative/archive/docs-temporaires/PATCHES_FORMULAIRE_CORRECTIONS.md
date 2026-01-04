# Corrections formulaire public - Candidatures

## Problèmes identifiés

1. ❌ **Validation documents** : Vérifie `documents.identity` au lieu de `documents.id_card`
2. ❌ **Couleurs roses** : Utilise du rose pour les couples alors que demandé de ne pas utiliser
3. ❌ **Upload simple** : Permet seulement 1 fichier par type au lieu de plusieurs

## Solutions

### ✅ 1. Validation documents (DÉJÀ APPLIQUÉ)

**Fichier** : `frontend/src/pages/PublicCandidateForm.jsx` lignes 302-324

```javascript
} else if (step === 5) {
  // Vérifier les documents obligatoires pour candidat 1
  if (!documents.id_card) throw new Error('La pièce d\'identité du candidat 1 est obligatoire')
  if (!documents.proof_income) throw new Error('Les justificatifs de revenus du candidat 1 sont obligatoires')

  // Vérifier documents candidat 2 si couple ou colocation
  if (formData.application_type === 'couple' || formData.application_type === 'colocation') {
    if (!documents.id_card_applicant2) throw new Error('La pièce d\'identité du candidat 2 est obligatoire')
    if (!documents.proof_income_applicant2) throw new Error('Les justificatifs de revenus du candidat 2 sont obligatoires')
  }

  // Vérifier documents candidat 3 si colocation 3+
  if (formData.application_type === 'colocation' && formData.nb_applicants >= 3) {
    if (!documents.id_card_applicant3) throw new Error('La pièce d\'identité du candidat 3 est obligatoire')
    if (!documents.proof_income_applicant3) throw new Error('Les justificatifs de revenus du candidat 3 sont obligatoires')
  }

  // Vérifier documents candidat 4 si colocation 4
  if (formData.application_type === 'colocation' && formData.nb_applicants >= 4) {
    if (!documents.id_card_applicant4) throw new Error('La pièce d\'identité du candidat 4 est obligatoire')
    if (!documents.proof_income_applicant4) throw new Error('Les justificatifs de revenus du candidat 4 sont obligatoires')
  }
}
```

### ✅ 2. Fonction handleFileChange pour multi-fichiers (DÉJÀ APPLIQUÉ)

**Fichier** : `frontend/src/pages/PublicCandidateForm.jsx` lignes 259-275

```javascript
const handleFileChange = (e, docType, applicantNumber = 1) => {
  const files = Array.from(e.target.files) // Convertir FileList en Array
  if (files.length > 0) {
    // Store files with applicant number information
    const key = applicantNumber > 1 ? `${docType}_applicant${applicantNumber}` : docType

    // Si on a déjà des fichiers pour ce type, les ajouter au lieu de les remplacer
    setDocuments((prev) => {
      const existingFiles = prev[key] ? (Array.isArray(prev[key]) ? prev[key] : [prev[key]]) : []
      return {
        ...prev,
        [key]: [...existingFiles, ...files],
        [`${key}_applicantNumber`]: applicantNumber
      }
    })
  }
}
```

### 🔧 3. Remplacer TOUTES les couleurs roses par du bleu

**A FAIRE** : Rechercher et remplacer dans tout le fichier `PublicCandidateForm.jsx`

#### Remplacements à effectuer :

```bash
# Couleurs de fond
bg-pink-50    →  bg-blue-50
bg-pink-100   →  bg-blue-100

# Couleurs de bordure
border-pink-200   →  border-blue-200
border-pink-300   →  border-blue-300
border-pink-500   →  border-blue-500

# Couleurs de texte
text-pink-600     →  text-blue-600
text-pink-700     →  text-blue-700
text-pink-800     →  text-blue-800
text-pink-900     →  text-blue-900

# Focus ring
focus:ring-pink-500  →  focus:ring-blue-500
```

**Nombre d'occurrences** :
- `pink` apparaît environ 30-40 fois dans le fichier
- Toutes doivent être remplacées par `blue`

#### Exemples de lignes à modifier :

**Ligne ~1938** :
```javascript
// AVANT
<div className="space-y-4 p-6 bg-pink-50 rounded-lg border-2 border-pink-200">

// APRÈS
<div className="space-y-4 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
```

**Ligne ~1940** :
```javascript
// AVANT
<h3 className="text-lg font-semibold text-pink-900 mb-4 flex items-center gap-2">

// APRÈS
<h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
```

**Ligne ~1999** :
```javascript
// AVANT
className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"

// APRÈS
className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
```

### 🔧 4. Ajouter `multiple` aux inputs de fichiers + affichage liste

**A FAIRE** : Modifier les inputs pour `proof_income` des candidats 2, 3, 4

#### Candidat 2 (lignes ~1990-2004) :

```javascript
// AVANT
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Justificatifs de revenus * (3 derniers bulletins)
  </label>
  <input
    type="file"
    accept=".pdf,.jpg,.jpeg,.png"
    onChange={(e) => handleFileChange(e, 'proof_income', 2)}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  {documents.proof_income_applicant2 && (
    <p className="text-xs text-green-600 mt-1">✓ {documents.proof_income_applicant2.name}</p>
  )}
</div>

// APRÈS
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Justificatifs de revenus * (3 derniers bulletins)
  </label>
  <input
    type="file"
    accept=".pdf,.jpg,.jpeg,.png"
    multiple
    onChange={(e) => handleFileChange(e, 'proof_income', 2)}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  {documents.proof_income_applicant2 && (
    <div className="mt-2 space-y-1">
      {(Array.isArray(documents.proof_income_applicant2) ? documents.proof_income_applicant2 : [documents.proof_income_applicant2]).map((file, index) => (
        <p key={index} className="text-xs text-green-600">✓ {file.name}</p>
      ))}
    </div>
  )}
</div>
```

#### Candidat 3 (lignes ~2050-2060) :

Même modification que candidat 2, avec `proof_income_applicant3`

#### Candidat 4 (lignes ~2090-2100) :

Même modification que candidat 2, avec `proof_income_applicant4`

### 🔧 5. Mise à jour de l'upload dans handleSubmit

**Fichier** : `frontend/src/pages/PublicCandidateForm.jsx` dans la fonction `handleSubmit`

Chercher la section d'upload (environ lignes 380-400) et la remplacer :

```javascript
// AVANT
Object.entries(documents).forEach(([key, value]) => {
  if (key.endsWith('_applicantNumber')) return
  if (value && value instanceof File) {
    let docType = key
    let applicantNumber = 1
    if (key.includes('_applicant')) {
      const match = key.match(/(.+)_applicant(\d+)/)
      if (match) {
        docType = match[1]
        applicantNumber = parseInt(match[2])
      }
    }
    uploadPromises.push(uploadDocument(candidate.id, value, docType, applicantNumber))
  }
})

// APRÈS
Object.entries(documents).forEach(([key, value]) => {
  if (key.endsWith('_applicantNumber')) return

  // Gérer les tableaux de fichiers (multi-upload)
  const files = Array.isArray(value) ? value : (value ? [value] : [])

  files.forEach(file => {
    if (file instanceof File) {
      let docType = key
      let applicantNumber = 1
      if (key.includes('_applicant')) {
        const match = key.match(/(.+)_applicant(\d+)/)
        if (match) {
          docType = match[1]
          applicantNumber = parseInt(match[2])
        }
      }
      uploadPromises.push(uploadDocument(candidate.id, file, docType, applicantNumber))
    }
  })
})
```

## Résumé des modifications

| Modification | Statut | Fichier | Lignes |
|--------------|--------|---------|--------|
| ✅ Validation `id_card` au lieu de `identity` | FAIT | PublicCandidateForm.jsx | 302-324 |
| ✅ handleFileChange avec multi-fichiers | FAIT | PublicCandidateForm.jsx | 259-275 |
| ✅ Input multiple candidat 1 | FAIT | PublicCandidateForm.jsx | 1932-1950 |
| 🔜 Supprimer couleurs roses → bleu | À FAIRE | PublicCandidateForm.jsx | ~30-40 occurrences |
| 🔜 Input multiple candidat 2 | À FAIRE | PublicCandidateForm.jsx | ~1990-2004 |
| 🔜 Input multiple candidat 3 | À FAIRE | PublicCandidateForm.jsx | ~2050-2060 |
| 🔜 Input multiple candidat 4 | À FAIRE | PublicCandidateForm.jsx | ~2090-2100 |
| 🔜 Upload multi-fichiers dans handleSubmit | À FAIRE | PublicCandidateForm.jsx | ~380-400 |

---

**Date** : 2 Janvier 2026
**Fichier source** : `frontend/src/pages/PublicCandidateForm.jsx`
