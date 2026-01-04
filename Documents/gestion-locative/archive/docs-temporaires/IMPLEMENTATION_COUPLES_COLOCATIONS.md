# Guide d'Implémentation - Couples et Colocations

> Date : 2 Janvier 2026
> Fichiers modifiés : 6 fichiers
> Temps estimé : 2-3 heures

---

## ✅ ÉTAPE 1 : Migration SQL (TERMINÉ)

**Fichier** : `supabase/migrations/20260102_create_candidates_v2.sql`

**Action** : Exécuter dans Supabase SQL Editor

**Statut** : ✅ Créé et prêt

---

## ✅ ÉTAPE 2 : Schéma Yup (TERMINÉ)

**Fichier** : `frontend/src/schemas/candidateSchema.js`

**Modifications effectuées** :
- ✅ Ajout `application_type` : 'individual' | 'couple' | 'colocation'
- ✅ Ajout `nb_applicants` : 1-4
- ✅ Ajout champs candidat 2, 3, 4
- ✅ Ajout champs garant 2
- ✅ Validation conditionnelle selon `application_type`

**Statut** : ✅ Modifié

---

## ✅ ÉTAPE 3 : Service Backend (TERMINÉ)

**Fichier** : `frontend/src/services/candidateService.js`

**Modifications effectuées** :
- ✅ `cleanData()` : Gère les nouveaux champs (candidats 2-4, garant 2)
- ✅ `uploadDocument()` : Ajout paramètre `applicantNumber`

**Statut** : ✅ Modifié

---

## 🔜 ÉTAPE 4 : Formulaire Public (À FAIRE)

**Fichier** : `frontend/src/pages/PublicCandidateForm.jsx` (1174 lignes)

### Modifications requises

#### 4.1 - Ajouter l'état pour le type de candidature

**Localisation** : Début du composant, avec les autres `useState`

```jsx
function PublicCandidateForm() {
  const { token } = useParams()
  const navigate = useNavigate()

  // États existants...
  const [step, setStep] = useState(0)  // MODIFIER : était 1, maintenant 0
  const [formData, setFormData] = useState({
    // AJOUTER ces champs
    application_type: 'individual',
    nb_applicants: 1,

    // Candidat 1 (existants)
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    birth_date: '',
    birth_place: '',
    nationality: '',
    professional_status: '',
    employer_name: '',
    job_title: '',
    contract_type: '',
    employment_start_date: '',
    monthly_income: '',
    other_income: '',

    // AJOUTER Candidat 2
    applicant2_first_name: '',
    applicant2_last_name: '',
    applicant2_email: '',
    applicant2_phone: '',
    applicant2_birth_date: '',
    applicant2_birth_place: '',
    applicant2_nationality: '',
    applicant2_professional_status: '',
    applicant2_employer_name: '',
    applicant2_job_title: '',
    applicant2_contract_type: '',
    applicant2_employment_start_date: '',
    applicant2_monthly_income: '',
    applicant2_other_income: '',

    // AJOUTER Candidat 3 (champs simplifiés)
    applicant3_first_name: '',
    applicant3_last_name: '',
    applicant3_email: '',
    applicant3_phone: '',
    applicant3_monthly_income: '',

    // AJOUTER Candidat 4
    applicant4_first_name: '',
    applicant4_last_name: '',
    applicant4_email: '',
    applicant4_phone: '',
    applicant4_monthly_income: '',

    // Garant 1 (existants)
    has_guarantor: false,
    guarantor_first_name: '',
    guarantor_last_name: '',
    guarantor_email: '',
    guarantor_phone: '',
    guarantor_relationship: '',
    guarantor_professional_status: '',
    guarantor_monthly_income: '',

    // AJOUTER Garant 2
    has_guarantor2: false,
    guarantor2_first_name: '',
    guarantor2_last_name: '',
    guarantor2_email: '',
    guarantor2_phone: '',
    guarantor2_relationship: '',
    guarantor2_monthly_income: ''
  })

  // Reste du code...
}
```

#### 4.2 - NOUVELLE ÉTAPE 0 : Choix du type de candidature

**Localisation** : Avant l'étape 1 actuelle

```jsx
{/* ÉTAPE 0 : Type de candidature */}
{step === 0 && (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Type de candidature
      </h2>
      <p className="text-gray-600">
        Combien de personnes souhaitent louer ce logement ?
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Option 1 : Individuel */}
      <button
        type="button"
        onClick={() => {
          setFormData({
            ...formData,
            application_type: 'individual',
            nb_applicants: 1
          })
        }}
        className={`relative p-6 border-2 rounded-xl transition-all duration-200 ${
          formData.application_type === 'individual'
            ? 'border-blue-600 bg-blue-50 shadow-lg'
            : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
        }`}
      >
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Icône personne seule */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
            formData.application_type === 'individual'
              ? 'bg-blue-600'
              : 'bg-gray-300'
          }`}>
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">Individuel</h3>
            <p className="text-sm text-gray-600 mt-1">
              Je candidate seul(e)
            </p>
          </div>

          {formData.application_type === 'individual' && (
            <div className="absolute top-3 right-3">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      </button>

      {/* Option 2 : Couple */}
      <button
        type="button"
        onClick={() => {
          setFormData({
            ...formData,
            application_type: 'couple',
            nb_applicants: 2
          })
        }}
        className={`relative p-6 border-2 rounded-xl transition-all duration-200 ${
          formData.application_type === 'couple'
            ? 'border-pink-600 bg-pink-50 shadow-lg'
            : 'border-gray-200 hover:border-pink-300 hover:shadow-md'
        }`}
      >
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Icône couple */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
            formData.application_type === 'couple'
              ? 'bg-pink-600'
              : 'bg-gray-300'
          }`}>
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">Couple</h3>
            <p className="text-sm text-gray-600 mt-1">
              Nous candidatons à deux
            </p>
          </div>

          {formData.application_type === 'couple' && (
            <div className="absolute top-3 right-3">
              <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      </button>

      {/* Option 3 : Colocation */}
      <button
        type="button"
        onClick={() => {
          setFormData({
            ...formData,
            application_type: 'colocation',
            nb_applicants: 3
          })
        }}
        className={`relative p-6 border-2 rounded-xl transition-all duration-200 ${
          formData.application_type === 'colocation'
            ? 'border-purple-600 bg-purple-50 shadow-lg'
            : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
        }`}
      >
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Icône groupe */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
            formData.application_type === 'colocation'
              ? 'bg-purple-600'
              : 'bg-gray-300'
          }`}>
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">Colocation</h3>
            <p className="text-sm text-gray-600 mt-1">
              Nous candidatons à plusieurs
            </p>
          </div>

          {/* Si colocation, afficher select nombre */}
          {formData.application_type === 'colocation' && (
            <div className="w-full mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de colocataires
              </label>
              <select
                value={formData.nb_applicants}
                onChange={(e) => {
                  e.stopPropagation()
                  setFormData({
                    ...formData,
                    nb_applicants: parseInt(e.target.value)
                  })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value={2}>2 personnes</option>
                <option value={3}>3 personnes</option>
                <option value={4}>4 personnes</option>
              </select>
            </div>
          )}

          {formData.application_type === 'colocation' && (
            <div className="absolute top-3 right-3">
              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      </button>
    </div>

    {/* Bouton Suivant */}
    <div className="flex justify-end mt-8">
      <Button
        onClick={() => setStep(1)}
        disabled={!formData.application_type}
        className="px-8 py-3"
      >
        Suivant
        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Button>
    </div>
  </div>
)}
```

#### 4.3 - Modifier l'ÉTAPE 1 : Informations personnelles

**Localisation** : Après l'étape 0

**Important** : Changer la condition de `{step === 1 && ...}` à `{step === 1 && ...}`

```jsx
{/* ÉTAPE 1 : Informations personnelles */}
{step === 1 && (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">
        {formData.application_type === 'individual' && 'Vos informations personnelles'}
        {formData.application_type === 'couple' && 'Informations du couple'}
        {formData.application_type === 'colocation' && `Informations des ${formData.nb_applicants} colocataires`}
      </h2>
      <p className="text-gray-600 mt-1">Étape 1 sur 5</p>
    </div>

    {/* Candidat 1 (code existant) */}
    <div className="border-l-4 border-blue-500 pl-6 py-4 bg-blue-50 rounded-r-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {formData.application_type === 'individual' ? 'Vos informations' : 'Candidat principal'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Champs existants pour candidat 1... */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prénom *
          </label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* ... Autres champs candidat 1 ... */}
      </div>
    </div>

    {/* CANDIDAT 2 (si couple ou colocation) */}
    {(formData.application_type === 'couple' || formData.application_type === 'colocation') && (
      <div className="border-l-4 border-pink-500 pl-6 py-4 bg-pink-50 rounded-r-lg mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {formData.application_type === 'couple' ? 'Votre conjoint(e)' : 'Candidat 2'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prénom *
            </label>
            <input
              type="text"
              value={formData.applicant2_first_name}
              onChange={(e) => setFormData({ ...formData, applicant2_first_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom *
            </label>
            <input
              type="text"
              value={formData.applicant2_last_name}
              onChange={(e) => setFormData({ ...formData, applicant2_last_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.applicant2_email}
              onChange={(e) => setFormData({ ...formData, applicant2_email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone *
            </label>
            <input
              type="tel"
              value={formData.applicant2_phone}
              onChange={(e) => setFormData({ ...formData, applicant2_phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de naissance *
            </label>
            <input
              type="date"
              value={formData.applicant2_birth_date}
              onChange={(e) => setFormData({ ...formData, applicant2_birth_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          {/* Autres champs optionnels pour candidat 2 : birth_place, nationality */}
        </div>
      </div>
    )}

    {/* CANDIDAT 3 (si colocation 3+) */}
    {formData.application_type === 'colocation' && formData.nb_applicants >= 3 && (
      <div className="border-l-4 border-purple-500 pl-6 py-4 bg-purple-50 rounded-r-lg mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Candidat 3</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Champs simplifiés : prénom, nom, email, phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
            <input
              type="text"
              value={formData.applicant3_first_name}
              onChange={(e) => setFormData({ ...formData, applicant3_first_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          {/* Nom, email, phone... */}
        </div>
      </div>
    )}

    {/* CANDIDAT 4 (si colocation 4) */}
    {formData.application_type === 'colocation' && formData.nb_applicants === 4 && (
      <div className="border-l-4 border-indigo-500 pl-6 py-4 bg-indigo-50 rounded-r-lg mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Candidat 4</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Champs simplifiés */}
        </div>
      </div>
    )}

    {/* Boutons navigation */}
    <div className="flex justify-between mt-8">
      <Button
        variant="secondary"
        onClick={() => setStep(0)}
      >
        Retour
      </Button>
      <Button onClick={() => setStep(2)}>
        Suivant
      </Button>
    </div>
  </div>
)}
```

#### 4.4 - Modifier l'ÉTAPE 2 : Situation professionnelle

**Ajouter les revenus de chaque candidat** + **Afficher le total cumulé**

```jsx
{/* ÉTAPE 2 : Situation professionnelle */}
{step === 2 && (
  <div className="space-y-6">
    <h2>Situation professionnelle</h2>

    {/* Candidat 1 - Code existant */}
    <div className="border-l-4 border-blue-500 pl-6 py-4">
      <h3>Candidat principal - Situation professionnelle</h3>
      {/* Champs existants : professional_status, employer_name, job_title, monthly_income, other_income */}
    </div>

    {/* Candidat 2 */}
    {(formData.application_type === 'couple' || formData.application_type === 'colocation') && (
      <div className="border-l-4 border-pink-500 pl-6 py-4 bg-pink-50">
        <h3>
          {formData.application_type === 'couple' ? 'Conjoint(e)' : 'Candidat 2'} - Situation professionnelle
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label>Statut professionnel *</label>
            <select
              value={formData.applicant2_professional_status}
              onChange={(e) => setFormData({ ...formData, applicant2_professional_status: e.target.value })}
            >
              <option value="">Sélectionner</option>
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="Indépendant">Indépendant/Freelance</option>
              <option value="Étudiant">Étudiant</option>
              <option value="Retraité">Retraité</option>
            </select>
          </div>

          <div>
            <label>Revenus mensuels nets *</label>
            <input
              type="number"
              value={formData.applicant2_monthly_income}
              onChange={(e) => setFormData({ ...formData, applicant2_monthly_income: e.target.value })}
              placeholder="Ex: 2000"
              required
            />
          </div>

          {/* Autres revenus (optionnel) */}
        </div>
      </div>
    )}

    {/* Candidat 3 (uniquement revenus) */}
    {formData.application_type === 'colocation' && formData.nb_applicants >= 3 && (
      <div className="border-l-4 border-purple-500 pl-6 py-4">
        <h3>Candidat 3 - Revenus</h3>
        <div>
          <label>Revenus mensuels nets *</label>
          <input
            type="number"
            value={formData.applicant3_monthly_income}
            onChange={(e) => setFormData({ ...formData, applicant3_monthly_income: e.target.value })}
            required
          />
        </div>
      </div>
    )}

    {/* Candidat 4 */}
    {formData.application_type === 'colocation' && formData.nb_applicants === 4 && (
      <div className="border-l-4 border-indigo-500 pl-6 py-4">
        <h3>Candidat 4 - Revenus</h3>
        <div>
          <label>Revenus mensuels nets *</label>
          <input
            type="number"
            value={formData.applicant4_monthly_income}
            onChange={(e) => setFormData({ ...formData, applicant4_monthly_income: e.target.value })}
            required
          />
        </div>
      </div>
    )}

    {/* TOTAL REVENUS CUMULÉS */}
    {formData.application_type !== 'individual' && (
      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-6 mt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-emerald-700 font-medium">Revenus mensuels cumulés</p>
            <p className="text-3xl font-bold text-emerald-900 mt-1">
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
          <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    )}

    <div className="flex justify-between mt-8">
      <Button variant="secondary" onClick={() => setStep(1)}>Retour</Button>
      <Button onClick={() => setStep(3)}>Suivant</Button>
    </div>
  </div>
)}
```

#### 4.5 - Modifier l'ÉTAPE 4 : Upload documents

**Ajouter upload par candidat**

```jsx
{/* ÉTAPE 4 : Upload documents */}
{step === 4 && (
  <div className="space-y-6">
    <h2>Documents justificatifs</h2>

    {/* Documents Candidat 1 */}
    <div className="border-l-4 border-blue-500 pl-6 py-4">
      <h3>Documents - Candidat principal</h3>

      <div className="space-y-4">
        <FileUploadInput
          label="Pièce d'identité *"
          onFileSelect={(file) => handleFileUpload(file, 'id_card', 1)}
        />
        <FileUploadInput
          label="Justificatif de revenus *"
          onFileSelect={(file) => handleFileUpload(file, 'proof_income', 1)}
        />
        {/* Autres documents... */}
      </div>
    </div>

    {/* Documents Candidat 2 */}
    {(formData.application_type === 'couple' || formData.application_type === 'colocation') && (
      <div className="border-l-4 border-pink-500 pl-6 py-4 bg-pink-50 mt-6">
        <h3>Documents - {formData.applicant2_first_name} {formData.applicant2_last_name}</h3>

        <div className="space-y-4">
          <FileUploadInput
            label="Pièce d'identité *"
            onFileSelect={(file) => handleFileUpload(file, 'id_card', 2)}
          />
          {/* Autres documents candidat 2... */}
        </div>
      </div>
    )}

    {/* Documents Candidat 3 et 4 similaires */}
  </div>
)}
```

**Modifier la fonction `handleFileUpload`** :

```jsx
const handleFileUpload = async (file, documentType, applicantNumber = 1) => {
  try {
    setUploading(true)

    const { data, error } = await uploadDocument(
      candidateId,
      file,
      documentType,
      applicantNumber  // NOUVEAU PARAMÈTRE
    )

    if (error) throw error

    toast.success(`Document uploadé avec succès`)
  } catch (err) {
    console.error('Upload error:', err)
    toast.error('Erreur lors de l\'upload')
  } finally {
    setUploading(false)
  }
}
```

---

## 🔜 ÉTAPE 5 : Page CandidateDetail.jsx (À FAIRE)

**Fichier** : `frontend/src/pages/CandidateDetail.jsx`

### Modifications requises

#### 5.1 - Afficher le type de candidature

```jsx
{/* Badge type de candidature */}
<div className="mb-6">
  {candidate.application_type === 'individual' && (
    <Badge variant="info">📄 Candidature individuelle</Badge>
  )}
  {candidate.application_type === 'couple' && (
    <Badge variant="info">💑 Candidature en couple</Badge>
  )}
  {candidate.application_type === 'colocation' && (
    <Badge variant="info">👥 Colocation ({candidate.nb_applicants} personnes)</Badge>
  )}
</div>
```

#### 5.2 - Afficher tous les candidats

```jsx
<Card title="Informations candidats">
  {/* Candidat 1 */}
  <div className="border-l-4 border-blue-500 pl-4 mb-6">
    <h4 className="font-semibold text-lg mb-2">Candidat principal</h4>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-gray-600">Nom complet</p>
        <p className="font-medium">{candidate.first_name} {candidate.last_name}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Email</p>
        <p className="font-medium">{candidate.email}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Revenus mensuels</p>
        <p className="font-medium">{candidate.monthly_income?.toLocaleString('fr-FR')} €</p>
      </div>
    </div>
  </div>

  {/* Candidat 2 si présent */}
  {(candidate.application_type === 'couple' || candidate.application_type === 'colocation') && candidate.applicant2_first_name && (
    <div className="border-l-4 border-pink-500 pl-4 mb-6">
      <h4 className="font-semibold text-lg mb-2">
        {candidate.application_type === 'couple' ? 'Conjoint(e)' : 'Candidat 2'}
      </h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Nom complet</p>
          <p className="font-medium">{candidate.applicant2_first_name} {candidate.applicant2_last_name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Email</p>
          <p className="font-medium">{candidate.applicant2_email}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Revenus mensuels</p>
          <p className="font-medium">{candidate.applicant2_monthly_income?.toLocaleString('fr-FR')} €</p>
        </div>
      </div>
    </div>
  )}

  {/* Candidats 3 et 4 similaires */}

  {/* TOTAL REVENUS CUMULÉS */}
  {candidate.application_type !== 'individual' && (
    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-4">
      <p className="text-sm text-emerald-700 font-medium">Revenus cumulés</p>
      <p className="text-2xl font-bold text-emerald-900">
        {candidate.total_monthly_income?.toLocaleString('fr-FR')} €/mois
      </p>
    </div>
  )}
</Card>
```

#### 5.3 - Modifier l'affichage du scoring

```jsx
<Card title="Scoring automatique">
  {/* Score total */}
  <div className="text-center mb-6">
    <div className="text-6xl font-bold text-blue-600">{candidate.score}/100</div>
  </div>

  {/* Critère 1 : Ratio revenus/loyer - UTILISER total_monthly_income */}
  <div className="border-l-4 border-blue-500 pl-4 mb-4">
    <h4 className="font-semibold">Ratio revenus/loyer (40 pts max)</h4>
    <p className="text-sm text-gray-600 mt-1">
      Revenus {candidate.application_type !== 'individual' ? 'cumulés' : 'mensuels'} : {candidate.total_monthly_income?.toLocaleString('fr-FR')} €
    </p>
    <p className="text-sm text-gray-600">
      Loyer : {lot.rent_amount?.toLocaleString('fr-FR')} €
    </p>
    <p className="text-sm font-medium text-blue-600 mt-2">
      Ratio : {(candidate.total_monthly_income / lot.rent_amount).toFixed(2)}
    </p>
  </div>

  {/* Critère 2 : Stabilité emploi - Prendre le MEILLEUR statut */}
  <div className="border-l-4 border-emerald-500 pl-4 mb-4">
    <h4 className="font-semibold">Stabilité emploi (20 pts max)</h4>
    <p className="text-sm text-gray-600 mt-1">
      {candidate.professional_status}
      {candidate.applicant2_professional_status && ` + ${candidate.applicant2_professional_status}`}
    </p>
  </div>

  {/* Autres critères... */}
</Card>
```

---

## 🔜 ÉTAPE 6 : Page Candidates.jsx (À FAIRE)

**Fichier** : `frontend/src/pages/Candidates.jsx`

### Modifications requises

#### 6.1 - Afficher le type de candidature dans les cartes

```jsx
{candidates.map((candidate) => (
  <Card key={candidate.id}>
    {/* Badge type */}
    <div className="flex items-center gap-2 mb-2">
      {candidate.application_type === 'couple' && <span>💑</span>}
      {candidate.application_type === 'colocation' && <span>👥 x{candidate.nb_applicants}</span>}

      <h3 className="text-lg font-semibold">
        {candidate.first_name} {candidate.last_name}
        {candidate.application_type !== 'individual' && (
          <span className="text-sm text-gray-600 ml-2">
            + {candidate.nb_applicants - 1} autre{candidate.nb_applicants > 2 ? 's' : ''}
          </span>
        )}
      </h3>
    </div>

    {/* Revenus */}
    <p className="text-sm text-gray-600">
      Revenus {candidate.application_type !== 'individual' ? 'cumulés' : ''} : {candidate.total_monthly_income?.toLocaleString('fr-FR')} €/mois
    </p>

    {/* Score */}
    <div className="mt-2">
      <span className="text-2xl font-bold text-blue-600">{candidate.score}/100</span>
    </div>
  </Card>
))}
```

---

## ✅ RÉSUMÉ DES MODIFICATIONS

| Fichier | Statut | Modifications |
|---------|--------|---------------|
| `20260102_create_candidates_v2.sql` | ✅ Créé | Tables avec support couples/colocations |
| `candidateSchema.js` | ✅ Modifié | Validation Zod complète |
| `candidateService.js` | ✅ Modifié | cleanData() + uploadDocument() |
| `PublicCandidateForm.jsx` | 🔜 À faire | Étape 0 + candidats 2-4 |
| `CandidateDetail.jsx` | 🔜 À faire | Affichage multi-candidats |
| `Candidates.jsx` | 🔜 À faire | Liste avec badges type |

---

## 🧪 TESTS À EFFECTUER

1. **Test individuel** : 1 personne
2. **Test couple** : 2 personnes
3. **Test colocation 3** : 3 personnes
4. **Test colocation 4** : 4 personnes
5. **Vérifier scoring** : Revenus cumulés correctement pris en compte

---

## 💡 NOTES IMPORTANTES

- La migration SQL V2 doit être exécutée **AU LIEU DE** la V1
- Le bucket Storage reste inchangé (`candidate-documents`)
- Le calcul du score utilise automatiquement `total_monthly_income` (colonne générée)
- Les fichiers sont nommés avec `applicant{N}` pour identifier le candidat

---

**Besoin d'aide ?** Référez-vous à [AMELIORATIONS_CANDIDATURES.md](AMELIORATIONS_CANDIDATURES.md) pour plus de détails.
