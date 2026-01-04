// Types de groupes (doit correspondre à l'ENUM SQL)
export const GROUP_TYPES = {
  individual: { value: 'individual', label: 'Individuel' },
  couple: { value: 'couple', label: 'En couple' },
  colocation: { value: 'colocation', label: 'Colocation' }
}

// Statuts de couple (doit correspondre à l'ENUM SQL)
export const COUPLE_STATUS = {
  married: { value: 'married', label: 'Mariés' },
  pacs: { value: 'pacs', label: 'Pacsés' },
  concubinage: { value: 'concubinage', label: 'Concubinage' }
}

// Statuts professionnels
export const PROFESSIONAL_STATUS = {
  employed: { value: 'employed', label: 'Salarié(e)' },
  self_employed: { value: 'self_employed', label: 'Indépendant(e) / Auto-entrepreneur' },
  civil_servant: { value: 'civil_servant', label: 'Fonctionnaire' },
  student: { value: 'student', label: 'Étudiant(e)' },
  retired: { value: 'retired', label: 'Retraité(e)' },
  unemployed: { value: 'unemployed', label: 'Sans emploi' },
  other: { value: 'other', label: 'Autre' }
}

// Types de contrat
export const CONTRACT_TYPES = {
  cdi: { value: 'cdi', label: 'CDI' },
  cdd: { value: 'cdd', label: 'CDD' },
  interim: { value: 'interim', label: 'Intérim' },
  freelance: { value: 'freelance', label: 'Freelance' },
  civil_servant: { value: 'civil_servant', label: 'Fonction publique' },
  internship: { value: 'internship', label: 'Stage' },
  apprenticeship: { value: 'apprenticeship', label: 'Apprentissage / Alternance' },
  other: { value: 'other', label: 'Autre' }
}

// Relations dans le couple
export const RELATIONSHIPS = {
  main: { value: 'main', label: 'Titulaire principal' },
  spouse: { value: 'spouse', label: 'Conjoint(e)' },
  partner: { value: 'partner', label: 'Partenaire' }
}

// Types de documents
export const DOCUMENT_TYPES = {
  identity: { value: 'identity', label: 'Pièce d\'identité' },
  payslip_1: { value: 'payslip_1', label: 'Bulletin de salaire 1' },
  payslip_2: { value: 'payslip_2', label: 'Bulletin de salaire 2' },
  payslip_3: { value: 'payslip_3', label: 'Bulletin de salaire 3' },
  tax_notice: { value: 'tax_notice', label: 'Avis d\'imposition' },
  proof_of_address: { value: 'proof_of_address', label: 'Justificatif de domicile' },
  employment_contract: { value: 'employment_contract', label: 'Contrat de travail' },
  other: { value: 'other', label: 'Autre document' }
}

// Types de garanties
export const GUARANTEE_TYPES = {
  physical_person: {
    value: 'physical_person',
    label: 'Garant physique',
    description: 'Une personne (parent, ami, employeur) se porte caution',
    icon: 'User',
    cost: 'Gratuit'
  },
  visale: {
    value: 'visale',
    label: 'Garantie Visale',
    description: 'Garantie gratuite Action Logement (< 30 ans ou conditions)',
    icon: 'Shield',
    cost: 'Gratuit',
    website: 'https://www.visale.fr'
  },
  garantme: {
    value: 'garantme',
    label: 'GarantMe',
    description: 'Organisme de cautionnement privé',
    icon: 'Building',
    cost: '~3-4% loyer/an',
    website: 'https://garantme.fr'
  },
  cautioneo: {
    value: 'cautioneo',
    label: 'Cautioneo',
    description: 'Organisme de cautionnement privé',
    icon: 'Building',
    cost: '~2.9% loyer/an',
    website: 'https://www.cautioneo.com'
  },
  smartgarant: {
    value: 'smartgarant',
    label: 'SmartGarant',
    description: 'Organisme de cautionnement privé',
    icon: 'Building',
    cost: '~3.5% loyer/an',
    website: 'https://www.smartgarant.com'
  },
  unkle: {
    value: 'unkle',
    label: 'Unkle',
    description: 'Organisme de cautionnement privé',
    icon: 'Building',
    cost: '~3.5% loyer/an',
    website: 'https://www.unkle.fr'
  },
  gli: {
    value: 'gli',
    label: 'GLI (Assurance propriétaire)',
    description: 'Garantie Loyers Impayés souscrite par le propriétaire',
    icon: 'FileCheck',
    cost: 'Payé par le propriétaire'
  },
  bank_guarantee: {
    value: 'bank_guarantee',
    label: 'Caution bancaire',
    description: 'Somme bloquée en banque (6-12 mois de loyer)',
    icon: 'Landmark',
    cost: 'Variable'
  },
  other: {
    value: 'other',
    label: 'Autre',
    description: 'Autre type de garantie',
    icon: 'HelpCircle',
    cost: 'Variable'
  }
}

// Relations avec le garant
export const GUARANTOR_RELATIONSHIPS = {
  parent: { value: 'parent', label: 'Parent' },
  family: { value: 'family', label: 'Autre membre de la famille' },
  employer: { value: 'employer', label: 'Employeur' },
  friend: { value: 'friend', label: 'Ami(e)' },
  other: { value: 'other', label: 'Autre' }
}
