# Améliorations Système de Candidatures

> Date : 2 Janvier 2026
> Objectif : Gérer les couples et colocations dans les candidatures

---

## 🚨 PROBLÈME IDENTIFIÉ

Le système actuel ne permet pas de gérer correctement les **couples** ou **colocations** qui candidatent ensemble :

### Scénarios non gérés

**Scénario 1 : Couple**
- Paul et Marie veulent louer ensemble un appartement
- Paul gagne 2000€/mois, Marie gagne 1800€/mois
- Revenus cumulés : 3800€/mois
- **Problème actuel** : Le formulaire ne peut enregistrer qu'1 seul candidat

**Scénario 2 : Colocation**
- 3 amis (Lucas, Emma, Thomas) veulent louer ensemble
- Revenus : 1500€ + 1600€ + 1400€ = 4500€/mois
- Chacun a son propre garant
- **Problème actuel** : Impossible de créer une candidature groupée

**Scénario 3 : Couple avec 1 garant commun**
- Couple avec revenus cumulés 3500€
- 1 seul garant pour les 2 (parent)
- **Problème actuel** : Le scoring ne prend en compte que les revenus d'1 personne

---

## 💡 SOLUTIONS PROPOSÉES

### **Option A : Amélioration Simple** ⭐ RECOMMANDÉ

**Avantages** :
- ✅ Rapide à implémenter (1-2h)
- ✅ Pas de refonte majeure du code existant
- ✅ Couvre 90% des cas (couples + colocations jusqu'à 4 personnes)
- ✅ Compatible avec le scoring actuel

**Inconvénients** :
- ❌ Limité à 4 candidats max (suffisant pour la plupart des cas)
- ❌ Structure de table plus large (mais acceptable)

**Fichier de migration** : `20260102_create_candidates_v2.sql`

#### Changements principaux

1. **Nouveau champ `application_type`** :
   ```sql
   application_type: 'individual' | 'couple' | 'colocation'
   ```

2. **Ajout de candidats supplémentaires** :
   - Candidat 2 : Champs complets (nom, prénom, revenus, emploi)
   - Candidat 3 : Champs simplifiés (nom, prénom, revenus)
   - Candidat 4 : Champs simplifiés

3. **Revenus cumulés automatiques** :
   ```sql
   total_monthly_income =
     candidat1_revenus + candidat2_revenus + candidat3_revenus + candidat4_revenus
   ```

4. **Garant 2 optionnel** :
   - Pour colocations où chaque personne a son garant

5. **Documents par candidat** :
   - Nouveau champ `applicant_number` (1, 2, 3, 4)
   - Permet d'identifier quel document appartient à quel candidat

#### Scoring adapté

**Nouveau calcul du ratio revenus/loyer** :
```javascript
// Avant (individuel uniquement)
ratio = monthly_income / rent_amount

// Après (revenus cumulés)
ratio = total_monthly_income / rent_amount
```

**Exemple concret** :
```
Couple Paul + Marie
- Loyer : 1200 €
- Paul : 2000 €/mois
- Marie : 1800 €/mois
- Total : 3800 €/mois
- Ratio : 3800 / 1200 = 3.16 → 30 points ✅

Au lieu de :
- Ratio Paul seul : 2000 / 1200 = 1.66 → 10 points ❌
```

---

### **Option B : Architecture Avancée** (Pour plus tard)

**Concept** : Candidature = Groupe → Membres

```
candidate_groups (id, lot_id, status, score)
  └── candidate_members (id, group_id, first_name, last_name, income)
  └── candidate_guarantors (id, group_id, member_id, income)
  └── candidate_documents (id, group_id, member_id, type, file)
```

**Avantages** :
- ✅ Nombre illimité de candidats
- ✅ Structure très flexible
- ✅ Chaque membre peut avoir plusieurs garants
- ✅ Plus propre techniquement

**Inconvénients** :
- ❌ Refonte complète du code frontend
- ❌ Refonte du service backend
- ❌ Migration complexe des données existantes
- ❌ Temps de développement : 1-2 jours

**Recommandation** : À envisager seulement si vous avez régulièrement des colocations de 5+ personnes.

---

## 🎯 RECOMMANDATION FINALE

### ⭐ Choisir l'Option A (Amélioration Simple)

**Pourquoi ?**
1. **90% des cas sont couverts** : Couples + colocations jusqu'à 4 personnes
2. **Rapide** : 1-2h d'implémentation
3. **Compatible** : Pas besoin de refondre tout le code
4. **MVP** : Permet de tester le besoin réel avant de complexifier

**Si besoin d'évoluer plus tard** :
- Passer à l'Option B seulement si vous constatez de vraies demandes pour 5+ colocataires
- La migration Option A → Option B est faisable plus tard

---

## 📋 PLAN D'IMPLÉMENTATION (Option A)

### Étape 1 : Migration SQL (10 min)

**Action** : Exécuter `20260102_create_candidates_v2.sql` au lieu de la V1

**Vérification** :
```sql
-- Vérifier les nouveaux champs
SELECT
  application_type,
  nb_applicants,
  total_monthly_income,
  applicant2_first_name
FROM candidates LIMIT 1;
```

---

### Étape 2 : Modifier le schéma Yup (15 min)

**Fichier** : `frontend/src/schemas/candidateSchema.js`

**Ajouts** :
```javascript
// Nouveau champ type de candidature
applicationType: yup.string()
  .oneOf(['individual', 'couple', 'colocation'])
  .default('individual')
  .required('Type de candidature requis'),

nbApplicants: yup.number()
  .min(1).max(4)
  .default(1),

// Candidat 2 (conditionnel si couple ou colocation)
applicant2FirstName: yup.string()
  .when('applicationType', {
    is: (val) => val === 'couple' || val === 'colocation',
    then: yup.string().required('Prénom du candidat 2 requis'),
    otherwise: yup.string().nullable()
  }),

applicant2LastName: yup.string()
  .when('applicationType', {
    is: (val) => val === 'couple' || val === 'colocation',
    then: yup.string().required('Nom du candidat 2 requis'),
    otherwise: yup.string().nullable()
  }),

applicant2MonthlyIncome: yup.number()
  .when('applicationType', {
    is: (val) => val === 'couple' || val === 'colocation',
    then: yup.number().min(0).required('Revenus du candidat 2 requis'),
    otherwise: yup.number().nullable()
  }),

// Idem pour candidat 3 et 4 si colocation
```

---

### Étape 3 : Modifier le formulaire public (30 min)

**Fichier** : `frontend/src/pages/PublicCandidateForm.jsx`

**Ajout AVANT l'étape 1** : Nouvelle étape 0 - Choix du type

```jsx
// Étape 0 : Type de candidature
{currentStep === 0 && (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold">Type de candidature</h3>

    {/* Cards avec choix */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

      {/* Option 1 : Individuel */}
      <div
        onClick={() => {
          setFormData({ ...formData, applicationType: 'individual', nbApplicants: 1 })
        }}
        className={`border-2 rounded-lg p-6 cursor-pointer transition ${
          formData.applicationType === 'individual'
            ? 'border-blue-600 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-blue-600" /* Icon personne seule */>
          <h4 className="font-semibold text-lg">Individuel</h4>
          <p className="text-sm text-gray-600 mt-2">
            Je candidate seul(e)
          </p>
        </div>
      </div>

      {/* Option 2 : Couple */}
      <div
        onClick={() => {
          setFormData({ ...formData, applicationType: 'couple', nbApplicants: 2 })
        }}
        className={`border-2 rounded-lg p-6 cursor-pointer transition ${
          formData.applicationType === 'couple'
            ? 'border-blue-600 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-pink-600" /* Icon couple */>
          <h4 className="font-semibold text-lg">Couple</h4>
          <p className="text-sm text-gray-600 mt-2">
            Nous candidatons à 2
          </p>
        </div>
      </div>

      {/* Option 3 : Colocation */}
      <div
        onClick={() => {
          setFormData({ ...formData, applicationType: 'colocation', nbApplicants: 3 })
        }}
        className={`border-2 rounded-lg p-6 cursor-pointer transition ${
          formData.applicationType === 'colocation'
            ? 'border-blue-600 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-purple-600" /* Icon groupe */>
          <h4 className="font-semibold text-lg">Colocation</h4>
          <p className="text-sm text-gray-600 mt-2">
            Nous candidatons à plusieurs
          </p>

          {/* Si colocation, afficher sélecteur nombre */}
          {formData.applicationType === 'colocation' && (
            <select
              value={formData.nbApplicants}
              onChange={(e) => setFormData({ ...formData, nbApplicants: parseInt(e.target.value) })}
              className="mt-4 w-full px-3 py-2 border border-gray-300 rounded-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <option value={2}>2 personnes</option>
              <option value={3}>3 personnes</option>
              <option value={4}>4 personnes</option>
            </select>
          )}
        </div>
      </div>
    </div>

    <Button onClick={() => setCurrentStep(1)} disabled={!formData.applicationType}>
      Suivant
    </Button>
  </div>
)}
```

**Modification de l'étape 1** : Informations personnelles

```jsx
{/* Étape 1 : Informations personnelles */}
{currentStep === 1 && (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold">
      {formData.applicationType === 'individual'
        ? 'Vos informations personnelles'
        : 'Informations du candidat principal'}
    </h3>

    {/* Candidat 1 (existant) */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Champs existants... */}
    </div>

    {/* NOUVEAU : Candidat 2 si couple ou colocation */}
    {(formData.applicationType === 'couple' || formData.applicationType === 'colocation') && (
      <>
        <hr className="my-6" />
        <h3 className="text-xl font-semibold">
          {formData.applicationType === 'couple' ? 'Votre conjoint(e)' : 'Candidat 2'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prénom *
            </label>
            <input
              type="text"
              value={formData.applicant2FirstName || ''}
              onChange={(e) => setFormData({ ...formData, applicant2FirstName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom *
            </label>
            <input
              type="text"
              value={formData.applicant2LastName || ''}
              onChange={(e) => setFormData({ ...formData, applicant2LastName: e.target.value })}
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
              value={formData.applicant2Email || ''}
              onChange={(e) => setFormData({ ...formData, applicant2Email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          {/* Téléphone, date naissance, etc. */}
        </div>
      </>
    )}

    {/* NOUVEAU : Candidat 3 et 4 si colocation 3+ */}
    {formData.applicationType === 'colocation' && formData.nbApplicants >= 3 && (
      <>
        <hr className="my-6" />
        <h3 className="text-xl font-semibold">Candidat 3</h3>
        {/* Champs simplifiés : nom, prénom, email, revenus */}
      </>
    )}

    {formData.applicationType === 'colocation' && formData.nbApplicants === 4 && (
      <>
        <hr className="my-6" />
        <h3 className="text-xl font-semibold">Candidat 4</h3>
        {/* Champs simplifiés */}
      </>
    )}

    <div className="flex gap-3">
      <Button variant="secondary" onClick={() => setCurrentStep(0)}>Retour</Button>
      <Button onClick={() => setCurrentStep(2)}>Suivant</Button>
    </div>
  </div>
)}
```

**Modification de l'étape 2** : Situation professionnelle

```jsx
{/* Ajouter les revenus de chaque candidat */}
{/* Pour candidat 1 : champs existants */}

{/* Pour candidat 2 si couple/colocation */}
{(formData.applicationType === 'couple' || formData.applicationType === 'colocation') && (
  <>
    <hr className="my-6" />
    <h3 className="text-xl font-semibold">
      Situation professionnelle - {formData.applicant2FirstName}
    </h3>

    {/* Champs revenus candidat 2 */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label>Statut professionnel</label>
        <select
          value={formData.applicant2ProfessionalStatus || ''}
          onChange={(e) => setFormData({ ...formData, applicant2ProfessionalStatus: e.target.value })}
        >
          <option value="">Sélectionner</option>
          <option value="CDI">CDI</option>
          <option value="CDD">CDD</option>
          <option value="Indépendant">Indépendant</option>
          {/* ... */}
        </select>
      </div>

      <div>
        <label>Revenus mensuels nets *</label>
        <input
          type="number"
          value={formData.applicant2MonthlyIncome || ''}
          onChange={(e) => setFormData({ ...formData, applicant2MonthlyIncome: parseFloat(e.target.value) })}
          required
        />
      </div>
    </div>

    {/* Affichage du total des revenus du couple/colocation */}
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
      <p className="font-semibold text-blue-900">
        Revenus cumulés : {
          (formData.monthlyIncome || 0) +
          (formData.otherIncome || 0) +
          (formData.applicant2MonthlyIncome || 0) +
          (formData.applicant2OtherIncome || 0)
        } €/mois
      </p>
    </div>
  </>
)}
```

---

### Étape 4 : Modifier l'upload documents (20 min)

**Permettre d'uploader des documents pour chaque candidat**

```jsx
{/* Upload documents */}
<div className="space-y-4">
  <h3 className="text-xl font-semibold">Documents - Candidat principal</h3>

  {/* Documents candidat 1 */}
  <FileUpload
    label="Pièce d'identité"
    onUpload={(file) => handleUpload(file, 'id_card', 1)}
  />

  {/* ... autres documents candidat 1 */}

  {/* Si couple ou colocation, documents candidat 2 */}
  {(formData.applicationType === 'couple' || formData.applicationType === 'colocation') && (
    <>
      <hr className="my-6" />
      <h3 className="text-xl font-semibold">
        Documents - {formData.applicant2FirstName} {formData.applicant2LastName}
      </h3>

      <FileUpload
        label="Pièce d'identité"
        onUpload={(file) => handleUpload(file, 'id_card', 2)}
      />

      {/* ... autres documents candidat 2 */}
    </>
  )}
</div>
```

**Fonction d'upload modifiée** :
```javascript
const handleUpload = async (file, documentType, applicantNumber = 1) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('document_type', documentType)
  formData.append('applicant_number', applicantNumber) // NOUVEAU

  const { data, error } = await uploadDocument(candidateId, formData)
  // ...
}
```

---

### Étape 5 : Modifier le service backend (15 min)

**Fichier** : `frontend/src/services/candidateService.js`

**Fonction `createCandidate`** - Ajouter les nouveaux champs :
```javascript
export const createCandidate = async (candidateData) => {
  const { data, error } = await supabase
    .from('candidates')
    .insert([{
      lot_id: candidateData.lotId,
      entity_id: candidateData.entityId,

      // Type de candidature (NOUVEAU)
      application_type: candidateData.applicationType || 'individual',
      nb_applicants: candidateData.nbApplicants || 1,

      // Candidat 1 (existant)
      first_name: candidateData.firstName,
      last_name: candidateData.lastName,
      // ...

      // Candidat 2 (NOUVEAU)
      applicant2_first_name: candidateData.applicant2FirstName,
      applicant2_last_name: candidateData.applicant2LastName,
      applicant2_email: candidateData.applicant2Email,
      applicant2_monthly_income: candidateData.applicant2MonthlyIncome,
      // ...

      // Candidats 3 et 4 (NOUVEAU)
      applicant3_first_name: candidateData.applicant3FirstName,
      applicant3_monthly_income: candidateData.applicant3MonthlyIncome,
      applicant4_first_name: candidateData.applicant4FirstName,
      applicant4_monthly_income: candidateData.applicant4MonthlyIncome,
    }])
    .select()
    .single()

  return { data, error }
}
```

**Fonction `uploadDocument`** - Ajouter le numéro de candidat :
```javascript
export const uploadDocument = async (candidateId, formData) => {
  const file = formData.get('file')
  const documentType = formData.get('document_type')
  const applicantNumber = formData.get('applicant_number') || 1 // NOUVEAU

  // Upload fichier dans Storage
  const filePath = `${entityId}/${candidateId}/${documentType}_applicant${applicantNumber}_${Date.now()}.pdf`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('candidate-documents')
    .upload(filePath, file)

  if (uploadError) return { data: null, error: uploadError }

  // Insérer dans candidate_documents
  const { data, error } = await supabase
    .from('candidate_documents')
    .insert([{
      candidate_id: candidateId,
      document_type: documentType,
      applicant_number: applicantNumber, // NOUVEAU
      file_name: file.name,
      file_path: filePath,
      file_url: uploadData.path,
      // ...
    }])

  return { data, error }
}
```

**Fonction de calcul du score** - Utiliser `total_monthly_income` :
```javascript
const calculateScore = (candidate, lot) => {
  let score = 0

  // 1. Ratio revenus/loyer (40 points) - UTILISER REVENUS CUMULÉS
  const ratio = candidate.total_monthly_income / lot.rent_amount

  if (ratio >= 4) score += 40
  else if (ratio >= 3.5) score += 35
  else if (ratio >= 3) score += 30
  else if (ratio >= 2.5) score += 20
  else if (ratio >= 2) score += 10

  // 2. Stabilité emploi (20 points) - Prendre le MEILLEUR statut entre les candidats
  const statuses = [
    candidate.professional_status,
    candidate.applicant2_professional_status,
  ].filter(Boolean)

  if (statuses.includes('CDI') || statuses.includes('Fonctionnaire')) {
    score += 20
  } else if (statuses.includes('CDD')) {
    score += 10
  } else if (statuses.includes('Indépendant')) {
    score += 5
  }

  // 3. Garant (20 points)
  // ... (inchangé)

  // 4. Documents (20 points)
  // ... (inchangé)

  return score
}
```

---

### Étape 6 : Modifier l'affichage détail (10 min)

**Fichier** : `frontend/src/pages/CandidateDetail.jsx`

**Afficher tous les candidats** :
```jsx
{/* Section Informations personnelles */}
<Card title="Informations personnelles">
  <div className="space-y-4">

    {/* Type de candidature */}
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <p className="font-semibold text-blue-900">
        {candidate.application_type === 'individual' && '📄 Candidature individuelle'}
        {candidate.application_type === 'couple' && '💑 Candidature en couple'}
        {candidate.application_type === 'colocation' && `👥 Colocation (${candidate.nb_applicants} personnes)`}
      </p>
    </div>

    {/* Candidat 1 */}
    <div className="border-l-4 border-blue-500 pl-4">
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
          <p className="font-medium">{candidate.monthly_income} €</p>
        </div>
      </div>
    </div>

    {/* Candidat 2 si couple/colocation */}
    {(candidate.application_type === 'couple' || candidate.application_type === 'colocation') && candidate.applicant2_first_name && (
      <div className="border-l-4 border-pink-500 pl-4">
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
            <p className="font-medium">{candidate.applicant2_monthly_income} €</p>
          </div>
        </div>
      </div>
    )}

    {/* Total revenus cumulés */}
    {candidate.application_type !== 'individual' && (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-4">
        <p className="font-semibold text-emerald-900">
          💰 Revenus cumulés : {candidate.total_monthly_income} €/mois
        </p>
      </div>
    )}
  </div>
</Card>
```

**Modifier l'affichage du scoring** :
```jsx
<Card title="Scoring automatique">
  <div className="space-y-4">
    {/* Score total */}
    <div className="text-center">
      <div className="text-5xl font-bold text-blue-600">{candidate.score}/100</div>
    </div>

    {/* Détail critère 1 : Ratio revenus/loyer */}
    <div className="border-l-4 border-blue-500 pl-4">
      <h4 className="font-semibold">Ratio revenus/loyer (40 pts max)</h4>
      <p className="text-sm text-gray-600 mt-1">
        Revenus {candidate.application_type !== 'individual' ? 'cumulés' : 'mensuels'} : {candidate.total_monthly_income} €
      </p>
      <p className="text-sm text-gray-600">
        Loyer : {lot.rent_amount} €
      </p>
      <p className="text-sm font-medium mt-2">
        Ratio : {(candidate.total_monthly_income / lot.rent_amount).toFixed(2)} → {ratioPoints} points
      </p>
    </div>

    {/* ... autres critères */}
  </div>
</Card>
```

---

## 🧮 NOUVEAU SYSTÈME DE SCORING

### Formule adaptée aux couples/colocations

#### 1. Ratio Revenus/Loyer (40 points)
**Utiliser `total_monthly_income` au lieu de `monthly_income`**

```
Ratio = total_monthly_income / rent_amount

Ratio ≥ 4   → 40 points
Ratio ≥ 3.5 → 35 points
Ratio ≥ 3   → 30 points
Ratio ≥ 2.5 → 20 points
Ratio ≥ 2   → 10 points
```

**Exemple couple** :
```
Couple Paul (2000€) + Marie (1800€)
Loyer : 1200€
Total revenus : 3800€
Ratio : 3800 / 1200 = 3.16 → 30 points ✅
```

#### 2. Stabilité Emploi (20 points)
**Prendre le MEILLEUR statut parmi tous les candidats**

```
Si au moins 1 candidat a un CDI ou est Fonctionnaire → 20 points
Sinon si au moins 1 candidat a un CDD → 10 points
Sinon si au moins 1 candidat est Indépendant → 5 points
```

**Justification** : Un couple où 1 personne a un CDI est plus stable qu'un individuel en CDD.

#### 3. Garant (20 points)
**Inchangé** (le garant peut être commun)

```
Revenus garant ≥ 3× loyer → 20 points
Revenus garant ≥ 2× loyer → 15 points
Garant présent → 10 points
```

#### 4. Documents (20 points)
**Adapter selon le nombre de candidats**

```
Individuel : 5 documents requis × 4 points = 20 points max
Couple : 8 documents requis (4 par personne) × 2.5 points = 20 points max
Colocation 3 : 12 documents requis × 1.66 points = 20 points max
```

**Alternative plus simple** :
```
Score documents = (nb_documents_uploadés / nb_documents_requis) × 20
```

---

## 📊 EXEMPLES DE SCORING

### Exemple 1 : Couple
```
Paul + Marie
Loyer : 1200 €
Paul : CDI, 2000 €/mois
Marie : CDD, 1800 €/mois
Total : 3800 €/mois
Garant : Parent avec 5000 €/mois
Documents : 8/8 uploadés

Score :
- Ratio 3800/1200 = 3.16 → 30 points
- Au moins 1 CDI → 20 points
- Garant 5000€ > 3×1200€ → 20 points
- 8/8 documents → 20 points
TOTAL : 90/100 ✅ Excellent dossier
```

### Exemple 2 : Colocation 3 personnes
```
Lucas + Emma + Thomas
Loyer : 1500 €
Lucas : 1600 € (Indépendant)
Emma : 1800 € (CDI)
Thomas : 1400 € (CDD)
Total : 4800 €/mois
Garant : Chacun a son garant (≥ 2× loyer)
Documents : 12/12 uploadés

Score :
- Ratio 4800/1500 = 3.2 → 30 points
- Au moins 1 CDI (Emma) → 20 points
- Garants présents → 15 points
- 12/12 documents → 20 points
TOTAL : 85/100 ✅ Très bon dossier
```

### Exemple 3 : Individuel (pour comparaison)
```
Jean (seul)
Loyer : 1200 €
Jean : CDI, 2000 €/mois
Garant : Parent avec 5000 €/mois
Documents : 5/5

Score :
- Ratio 2000/1200 = 1.66 → 10 points
- CDI → 20 points
- Garant → 20 points
- 5/5 documents → 20 points
TOTAL : 70/100 ⚠️ Dossier acceptable mais juste
```

**Constat** : Le couple Paul+Marie (90/100) a un meilleur score que Jean seul (70/100) car les revenus cumulés améliorent significativement le ratio.

---

## ✅ CHECKLIST D'IMPLÉMENTATION

### Étape 1 : Base de données
- [ ] Exécuter `20260102_create_candidates_v2.sql`
- [ ] Vérifier les nouveaux champs avec une requête SELECT
- [ ] Tester l'insertion d'une candidature couple/colocation

### Étape 2 : Schéma Yup
- [ ] Ajouter `applicationType`, `nbApplicants`
- [ ] Ajouter champs candidat 2, 3, 4 (conditionnels)
- [ ] Tester la validation

### Étape 3 : Formulaire public
- [ ] Ajouter étape 0 : Choix type de candidature
- [ ] Modifier étape 1 : Ajouter candidats 2, 3, 4
- [ ] Modifier étape 2 : Revenus de chaque candidat
- [ ] Afficher total revenus cumulés
- [ ] Tester le parcours complet

### Étape 4 : Upload documents
- [ ] Permettre upload pour chaque candidat
- [ ] Ajouter `applicant_number` aux documents
- [ ] Tester upload multi-candidats

### Étape 5 : Service backend
- [ ] Modifier `createCandidate()` avec nouveaux champs
- [ ] Modifier `uploadDocument()` avec `applicant_number`
- [ ] Adapter calcul du score (utiliser `total_monthly_income`)
- [ ] Tester création candidature couple

### Étape 6 : Affichage détail
- [ ] Afficher type de candidature
- [ ] Afficher tous les candidats (1, 2, 3, 4)
- [ ] Afficher revenus cumulés
- [ ] Adapter affichage scoring
- [ ] Tester affichage détail

### Étape 7 : Tests end-to-end
- [ ] Test individuel : 1 personne
- [ ] Test couple : 2 personnes
- [ ] Test colocation : 3 personnes
- [ ] Test colocation : 4 personnes
- [ ] Vérifier scoring pour chaque cas

---

## 🎉 CONCLUSION

L'**Option A** permet de gérer :
- ✅ Candidatures individuelles (inchangé)
- ✅ Candidatures en couple (2 personnes)
- ✅ Colocations jusqu'à 4 personnes
- ✅ Revenus cumulés automatiques
- ✅ Scoring adapté

**Temps d'implémentation estimé** : 2-3 heures

**Alternative** : Si vous voulez tester rapidement sans toucher au frontend, commencez juste par la migration SQL V2. Vous pourrez adapter le frontend progressivement.

---

**Questions ?** N'hésitez pas si vous voulez que je génère le code complet pour l'une des étapes !
