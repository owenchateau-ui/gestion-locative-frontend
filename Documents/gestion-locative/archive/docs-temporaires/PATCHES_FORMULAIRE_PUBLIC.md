# Patches à appliquer - PublicCandidateForm.jsx

> Les modifications suivantes doivent être appliquées manuellement au fichier
> `frontend/src/pages/PublicCandidateForm.jsx`

---

## ✅ DÉJÀ FAIT

1. ✅ État initial modifié (ligne 120-198)
2. ✅ Étape 0 créée (ligne 557-758)

---

## 🔧 MODIFICATIONS RESTANTES

### 1. Modifier l'Étape 1 - Ajouter candidats 2-4

**Localisation** : Après le titre "Informations personnelles" (ligne ~760)

**Ajouter APRÈS les champs du candidat 1** (après `current_address`), **AVANT les boutons de navigation** :

```jsx
{/* CANDIDAT 2 - Si couple ou colocation */}
{(formData.application_type === 'couple' || formData.application_type === 'colocation') && (
  <div className="mt-8 pt-8 border-t-4 border-pink-500">
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
      <User className="w-5 h-5 text-pink-600" />
      {formData.application_type === 'couple' ? 'Votre conjoint(e)' : 'Candidat 2'}
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-pink-50 p-6 rounded-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Prénom *
        </label>
        <input
          type="text"
          name="applicant2_first_name"
          value={formData.applicant2_first_name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          required={formData.application_type !== 'individual'}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nom *
        </label>
        <input
          type="text"
          name="applicant2_last_name"
          value={formData.applicant2_last_name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          required={formData.application_type !== 'individual'}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email *
        </label>
        <input
          type="email"
          name="applicant2_email"
          value={formData.applicant2_email}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          required={formData.application_type !== 'individual'}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Téléphone *
        </label>
        <input
          type="tel"
          name="applicant2_phone"
          value={formData.applicant2_phone}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          required={formData.application_type !== 'individual'}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date de naissance *
        </label>
        <input
          type="date"
          name="applicant2_birth_date"
          value={formData.applicant2_birth_date}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lieu de naissance
        </label>
        <input
          type="text"
          name="applicant2_birth_place"
          value={formData.applicant2_birth_place}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>
    </div>
  </div>
)}

{/* CANDIDAT 3 - Si colocation 3+ */}
{formData.application_type === 'colocation' && formData.nb_applicants >= 3 && (
  <div className="mt-6 pt-6 border-t-4 border-purple-500">
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
      <User className="w-5 h-5 text-purple-600" />
      Candidat 3
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-purple-50 p-6 rounded-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
        <input
          type="text"
          name="applicant3_first_name"
          value={formData.applicant3_first_name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
        <input
          type="text"
          name="applicant3_last_name"
          value={formData.applicant3_last_name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
        <input
          type="email"
          name="applicant3_email"
          value={formData.applicant3_email}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
        <input
          type="tel"
          name="applicant3_phone"
          value={formData.applicant3_phone}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          required
        />
      </div>
    </div>
  </div>
)}

{/* CANDIDAT 4 - Si colocation 4 */}
{formData.application_type === 'colocation' && formData.nb_applicants === 4 && (
  <div className="mt-6 pt-6 border-t-4 border-indigo-500">
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
      <User className="w-5 h-5 text-indigo-600" />
      Candidat 4
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-indigo-50 p-6 rounded-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
        <input
          type="text"
          name="applicant4_first_name"
          value={formData.applicant4_first_name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
        <input
          type="text"
          name="applicant4_last_name"
          value={formData.applicant4_last_name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
        <input
          type="email"
          name="applicant4_email"
          value={formData.applicant4_email}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
        <input
          type="tel"
          name="applicant4_phone"
          value={formData.applicant4_phone}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          required
        />
      </div>
    </div>
  </div>
)}
```

**Modifier aussi le bouton "Retour" de l'étape 1** :
```jsx
// Remplacer :
<Button variant="secondary" onClick={() => navigate(-1)}>

// Par :
<Button variant="secondary" onClick={() => setCurrentStep(0)}>
```

---

### 2. Modifier l'Étape 2 - Ajouter revenus candidats 2-4

**Localisation** : Dans l'étape 2 (currentStep === 2)

**Ajouter APRÈS les champs du candidat 1**, **AVANT les boutons** :

```jsx
{/* CANDIDAT 2 - Revenus */}
{(formData.application_type === 'couple' || formData.application_type === 'colocation') && (
  <div className="mt-8 pt-8 border-t-4 border-pink-500">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">
      {formData.application_type === 'couple' ? 'Conjoint(e)' : 'Candidat 2'} - Situation professionnelle
    </h3>

    <div className="bg-pink-50 p-6 rounded-lg space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Statut professionnel *
          </label>
          <select
            name="applicant2_professional_status"
            value={formData.applicant2_professional_status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
          >
            <option value="">Sélectionner</option>
            <option value="cdi">CDI</option>
            <option value="cdd">CDD</option>
            <option value="interim">Intérim</option>
            <option value="freelance">Indépendant/Freelance</option>
            <option value="student">Étudiant</option>
            <option value="retired">Retraité</option>
            <option value="unemployed">Sans emploi</option>
            <option value="other">Autre</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom de l'employeur
          </label>
          <input
            type="text"
            name="applicant2_employer_name"
            value={formData.applicant2_employer_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Revenus mensuels nets *
          </label>
          <input
            type="number"
            name="applicant2_monthly_income"
            value={formData.applicant2_monthly_income}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Ex: 2000"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Autres revenus mensuels (optionnel)
          </label>
          <input
            type="number"
            name="applicant2_other_income"
            value={formData.applicant2_other_income}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Ex: 500"
          />
        </div>
      </div>
    </div>
  </div>
)}

{/* CANDIDAT 3 - Revenus uniquement */}
{formData.application_type === 'colocation' && formData.nb_applicants >= 3 && (
  <div className="mt-6 pt-6 border-t-4 border-purple-500">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">
      Candidat 3 - Revenus
    </h3>

    <div className="bg-purple-50 p-6 rounded-lg">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Revenus mensuels nets *
      </label>
      <input
        type="number"
        name="applicant3_monthly_income"
        value={formData.applicant3_monthly_income}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        placeholder="Ex: 1500"
        required
      />
    </div>
  </div>
)}

{/* CANDIDAT 4 - Revenus uniquement */}
{formData.application_type === 'colocation' && formData.nb_applicants === 4 && (
  <div className="mt-6 pt-6 border-t-4 border-indigo-500">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">
      Candidat 4 - Revenus
    </h3>

    <div className="bg-indigo-50 p-6 rounded-lg">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Revenus mensuels nets *
      </label>
      <input
        type="number"
        name="applicant4_monthly_income"
        value={formData.applicant4_monthly_income}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        placeholder="Ex: 1400"
        required
      />
    </div>
  </div>
)}

{/* REVENUS CUMULÉS - Si multi-candidats */}
{formData.application_type !== 'individual' && (
  <div className="mt-8 bg-emerald-50 border-2 border-emerald-200 rounded-lg p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-emerald-700 font-medium mb-1">
          Revenus mensuels cumulés
        </p>
        <p className="text-4xl font-bold text-emerald-900">
          {(
            parseFloat(formData.monthly_income || 0) +
            parseFloat(formData.other_income || 0) +
            parseFloat(formData.applicant2_monthly_income || 0) +
            parseFloat(formData.applicant2_other_income || 0) +
            parseFloat(formData.applicant3_monthly_income || 0) +
            parseFloat(formData.applicant4_monthly_income || 0)
          ).toLocaleString('fr-FR')} €
        </p>
      </div>
      <Euro className="w-16 h-16 text-emerald-600" />
    </div>
  </div>
)}
```

---

### 3. Modifier l'Étape 4 - Ajouter garant 2 (optionnel)

**Localisation** : Dans l'étape 4 (currentStep === 4)

**Ajouter APRÈS la section garant 1**, **AVANT les boutons** :

```jsx
{/* GARANT 2 - Optionnel pour colocation */}
{formData.application_type === 'colocation' && (
  <div className="mt-8 pt-8 border-t-2 border-gray-200">
    <div className="flex items-center gap-3 mb-4">
      <input
        type="checkbox"
        name="has_guarantor2"
        checked={formData.has_guarantor2}
        onChange={handleChange}
        className="w-5 h-5 text-blue-600 rounded"
      />
      <label className="text-lg font-semibold text-gray-900">
        Ajouter un second garant (optionnel)
      </label>
    </div>

    {formData.has_guarantor2 && (
      <div className="bg-blue-50 p-6 rounded-lg space-y-4">
        <h4 className="font-medium text-gray-900">Informations du garant 2</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prénom *
            </label>
            <input
              type="text"
              name="guarantor2_first_name"
              value={formData.guarantor2_first_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required={formData.has_guarantor2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom *
            </label>
            <input
              type="text"
              name="guarantor2_last_name"
              value={formData.guarantor2_last_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required={formData.has_guarantor2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lien de parenté
            </label>
            <input
              type="text"
              name="guarantor2_relationship"
              value={formData.guarantor2_relationship}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Ex: Parent, Ami..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="guarantor2_email"
              value={formData.guarantor2_email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required={formData.has_guarantor2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone *
            </label>
            <input
              type="tel"
              name="guarantor2_phone"
              value={formData.guarantor2_phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required={formData.has_guarantor2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Revenus mensuels nets *
            </label>
            <input
              type="number"
              name="guarantor2_monthly_income"
              value={formData.guarantor2_monthly_income}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Ex: 3000"
              required={formData.has_guarantor2}
            />
          </div>
        </div>
      </div>
    )}
  </div>
)}
```

---

### 4. Modifier la fonction d'upload de documents

**Localisation** : Chercher la fonction `handleFileUpload` (probablement vers ligne 400-500)

**Remplacer** :
```jsx
const handleFileUpload = async (file, documentType) => {
  try {
    setUploading(true)
    const { data, error } = await uploadDocument(candidateId, file, documentType)
    // ...
  }
}
```

**Par** :
```jsx
const handleFileUpload = async (file, documentType, applicantNumber = 1) => {
  try {
    setUploading(true)
    const { data, error } = await uploadDocument(candidateId, file, documentType, applicantNumber)

    if (error) throw error

    console.log('✅ Document uploadé:', documentType, 'pour candidat', applicantNumber)
    // Toast ou message de succès

  } catch (err) {
    console.error('❌ Erreur upload:', err)
    setError(formatError(err))
  } finally {
    setUploading(false)
  }
}
```

---

### 5. Modifier l'étape 5 (Documents) - Upload par candidat

**Localisation** : Dans l'étape 5 (currentStep === 5)

**Structure à créer** :

```jsx
{/* Documents Candidat 1 */}
<div className="border-l-4 border-blue-500 pl-6 py-4">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">
    Documents - Candidat principal
  </h3>

  <div className="space-y-4">
    {/* Upload pièce d'identité candidat 1 */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Pièce d'identité *
      </label>
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => handleFileUpload(e.target.files[0], 'id_card', 1)}
        className="w-full"
      />
    </div>

    {/* Autres documents candidat 1... */}
  </div>
</div>

{/* Documents Candidat 2 */}
{(formData.application_type === 'couple' || formData.application_type === 'colocation') && (
  <div className="mt-6 border-l-4 border-pink-500 pl-6 py-4 bg-pink-50">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">
      Documents - {formData.applicant2_first_name} {formData.applicant2_last_name}
    </h3>

    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pièce d'identité *
        </label>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => handleFileUpload(e.target.files[0], 'id_card', 2)}
          className="w-full"
        />
      </div>

      {/* Autres documents candidat 2... */}
    </div>
  </div>
)}

{/* Documents Candidat 3 et 4 similaires... */}
```

---

## ✅ RÉSUMÉ DES MODIFICATIONS

- [x] État initial avec tous les champs
- [x] Étape 0 : Choix du type
- [ ] Étape 1 : Ajouter candidats 2-4
- [ ] Étape 2 : Ajouter revenus candidats 2-4 + Total cumulé
- [ ] Étape 4 : Ajouter garant 2 (optionnel)
- [ ] Étape 5 : Upload documents par candidat
- [ ] Fonction `handleFileUpload` : Ajouter paramètre `applicantNumber`

---

**Note** : Ces modifications sont volumineuses car le fichier fait 1400+ lignes. Il est recommandé de procéder étape par étape en testant chaque modification.

**Alternative** : Copier/coller tout le fichier depuis un template complet (mais risque de perdre d'autres personnalisations).
