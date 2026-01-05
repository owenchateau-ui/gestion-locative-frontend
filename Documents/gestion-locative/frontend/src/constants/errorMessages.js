/**
 * Dictionnaire centralisé des messages d'erreur
 * Permet d'avoir des messages cohérents dans toute l'application
 */

// Erreurs d'authentification
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
  EMAIL_NOT_CONFIRMED: 'Veuillez confirmer votre email avant de vous connecter',
  EMAIL_ALREADY_EXISTS: 'Un compte existe déjà avec cet email',
  WEAK_PASSWORD: 'Le mot de passe doit contenir au moins 6 caractères',
  INVALID_EMAIL: 'Veuillez entrer une adresse email valide',
  SESSION_EXPIRED: 'Votre session a expiré, veuillez vous reconnecter',
  UNAUTHORIZED: 'Vous devez être connecté pour accéder à cette page',
  RATE_LIMITED: 'Trop de tentatives. Veuillez patienter avant de réessayer',
}

// Erreurs de validation de formulaire
export const VALIDATION_ERRORS = {
  REQUIRED_FIELD: 'Ce champ est obligatoire',
  INVALID_FORMAT: 'Format invalide',
  MIN_LENGTH: (min) => `Minimum ${min} caractères requis`,
  MAX_LENGTH: (max) => `Maximum ${max} caractères autorisés`,
  INVALID_PHONE: 'Numéro de téléphone invalide',
  INVALID_POSTAL_CODE: 'Code postal invalide (5 chiffres)',
  INVALID_SIREN: 'Numéro SIREN invalide (9 chiffres)',
  INVALID_SIRET: 'Numéro SIRET invalide (14 chiffres)',
  POSITIVE_NUMBER: 'La valeur doit être positive',
  INVALID_DATE: 'Date invalide',
  DATE_IN_PAST: 'La date ne peut pas être dans le passé',
  DATE_IN_FUTURE: 'La date ne peut pas être dans le futur',
  END_DATE_BEFORE_START: 'La date de fin doit être après la date de début',
  INVALID_PERCENTAGE: 'Le pourcentage doit être entre 0 et 100',
}

// Erreurs liées aux entités
export const ENTITY_ERRORS = {
  NOT_FOUND: 'Entité non trouvée',
  CREATE_FAILED: "Erreur lors de la création de l'entité",
  UPDATE_FAILED: "Erreur lors de la mise à jour de l'entité",
  DELETE_FAILED: "Erreur lors de la suppression de l'entité",
  NO_ENTITY_SELECTED: 'Veuillez sélectionner une entité',
  DUPLICATE_NAME: 'Une entité avec ce nom existe déjà',
}

// Erreurs liées aux propriétés
export const PROPERTY_ERRORS = {
  NOT_FOUND: 'Propriété non trouvée',
  CREATE_FAILED: 'Erreur lors de la création de la propriété',
  UPDATE_FAILED: 'Erreur lors de la mise à jour de la propriété',
  DELETE_FAILED: 'Erreur lors de la suppression de la propriété',
  HAS_LOTS: 'Impossible de supprimer une propriété qui contient des lots',
}

// Erreurs liées aux lots
export const LOT_ERRORS = {
  NOT_FOUND: 'Lot non trouvé',
  CREATE_FAILED: 'Erreur lors de la création du lot',
  UPDATE_FAILED: 'Erreur lors de la mise à jour du lot',
  DELETE_FAILED: 'Erreur lors de la suppression du lot',
  HAS_ACTIVE_LEASE: 'Impossible de supprimer un lot avec un bail actif',
  ALREADY_OCCUPIED: 'Ce lot est déjà occupé',
}

// Erreurs liées aux locataires
export const TENANT_ERRORS = {
  NOT_FOUND: 'Locataire non trouvé',
  CREATE_FAILED: 'Erreur lors de la création du locataire',
  UPDATE_FAILED: 'Erreur lors de la mise à jour du locataire',
  DELETE_FAILED: 'Erreur lors de la suppression du locataire',
  HAS_ACTIVE_LEASE: 'Impossible de supprimer un locataire avec un bail actif',
  MIN_ONE_TENANT: 'Il doit y avoir au moins un locataire',
  NEED_MAIN_TENANT: 'Il doit y avoir un locataire principal',
  INCOMPLETE_INFO: 'Tous les locataires doivent avoir un prénom, nom et email',
}

// Erreurs liées aux baux
export const LEASE_ERRORS = {
  NOT_FOUND: 'Bail non trouvé',
  CREATE_FAILED: 'Erreur lors de la création du bail',
  UPDATE_FAILED: 'Erreur lors de la mise à jour du bail',
  DELETE_FAILED: 'Erreur lors de la suppression du bail',
  HAS_PAYMENTS: 'Impossible de supprimer un bail avec des paiements enregistrés',
  OVERLAPPING_LEASE: 'Un bail actif existe déjà pour ce lot sur cette période',
  INVALID_DATES: 'Les dates du bail sont invalides',
}

// Erreurs liées aux paiements
export const PAYMENT_ERRORS = {
  NOT_FOUND: 'Paiement non trouvé',
  CREATE_FAILED: "Erreur lors de l'enregistrement du paiement",
  UPDATE_FAILED: 'Erreur lors de la mise à jour du paiement',
  DELETE_FAILED: 'Erreur lors de la suppression du paiement',
  INVALID_AMOUNT: 'Le montant doit être supérieur à 0',
  RECEIPT_GENERATION_FAILED: 'Erreur lors de la génération de la quittance',
}

// Erreurs liées à l'indexation IRL
export const IRL_ERRORS = {
  NOT_FOUND: 'Indice IRL non trouvé pour cette période',
  CREATE_FAILED: "Erreur lors de l'ajout de l'indice IRL",
  DELETE_FAILED: "Erreur lors de la suppression de l'indice IRL",
  APPLY_FAILED: "Erreur lors de l'application de l'indexation",
  LETTER_FAILED: "Erreur lors de la génération de la lettre d'indexation",
  INVALID_QUARTER: 'Trimestre invalide (doit être entre 1 et 4)',
  INVALID_YEAR: 'Année invalide',
  INVALID_VALUE: "La valeur de l'IRL doit être supérieure à 0",
}

// Erreurs liées aux candidatures
export const CANDIDATE_ERRORS = {
  NOT_FOUND: 'Candidature non trouvée',
  CREATE_FAILED: 'Erreur lors de la création de la candidature',
  UPDATE_FAILED: 'Erreur lors de la mise à jour de la candidature',
  DELETE_FAILED: 'Erreur lors de la suppression de la candidature',
  INVALID_LINK: 'Lien de candidature invalide ou expiré',
  LINK_EXPIRED: 'Ce lien de candidature a expiré',
  UPLOAD_FAILED: 'Erreur lors du téléchargement du document',
}

// Erreurs liées aux documents
export const DOCUMENT_ERRORS = {
  NOT_FOUND: 'Document non trouvé',
  UPLOAD_FAILED: 'Erreur lors du téléchargement du fichier',
  DELETE_FAILED: 'Erreur lors de la suppression du document',
  INVALID_TYPE: 'Type de fichier non autorisé',
  FILE_TOO_LARGE: 'Le fichier est trop volumineux (max 10 Mo)',
  DOWNLOAD_FAILED: 'Erreur lors du téléchargement du document',
}

// Erreurs génériques
export const GENERIC_ERRORS = {
  UNKNOWN: 'Une erreur inattendue est survenue',
  NETWORK: 'Erreur de connexion. Vérifiez votre connexion internet',
  SERVER: 'Erreur serveur. Veuillez réessayer plus tard',
  NOT_FOUND: 'Ressource non trouvée',
  FORBIDDEN: "Vous n'avez pas les droits pour effectuer cette action",
  LOADING_FAILED: 'Erreur lors du chargement des données',
  SAVE_FAILED: 'Erreur lors de la sauvegarde',
  DELETE_FAILED: 'Erreur lors de la suppression',
}

/**
 * Convertit une erreur Supabase en message utilisateur
 * @param {Error|string} error - Erreur Supabase ou message
 * @returns {string} Message d'erreur traduit
 */
export function translateSupabaseError(error) {
  const message = typeof error === 'string' ? error : error?.message || ''

  // Erreurs d'authentification Supabase
  if (message.includes('Invalid login credentials')) {
    return AUTH_ERRORS.INVALID_CREDENTIALS
  }
  if (message.includes('Email not confirmed')) {
    return AUTH_ERRORS.EMAIL_NOT_CONFIRMED
  }
  if (message.includes('User already registered')) {
    return AUTH_ERRORS.EMAIL_ALREADY_EXISTS
  }
  if (message.includes('Password should be at least')) {
    return AUTH_ERRORS.WEAK_PASSWORD
  }
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return AUTH_ERRORS.RATE_LIMITED
  }

  // Erreurs de base de données
  if (message.includes('duplicate key') || message.includes('unique constraint')) {
    return 'Cet enregistrement existe déjà'
  }
  if (message.includes('foreign key constraint')) {
    return 'Impossible de supprimer : des données liées existent'
  }
  if (message.includes('not found') || message.includes('no rows')) {
    return GENERIC_ERRORS.NOT_FOUND
  }

  // Erreurs réseau
  if (message.includes('network') || message.includes('fetch')) {
    return GENERIC_ERRORS.NETWORK
  }

  // Retourner le message original si non reconnu
  return message || GENERIC_ERRORS.UNKNOWN
}

/**
 * Obtient un message d'erreur formaté avec contexte
 * @param {string} action - L'action effectuée (création, mise à jour, suppression)
 * @param {string} entity - L'entité concernée (entité, propriété, lot, etc.)
 * @param {Error|string} error - L'erreur originale
 * @returns {string} Message d'erreur formaté
 */
export function getErrorMessage(action, entity, error) {
  const translatedError = translateSupabaseError(error)
  const entityLabels = {
    entity: "l'entité",
    property: 'la propriété',
    lot: 'le lot',
    tenant: 'le locataire',
    lease: 'le bail',
    payment: 'le paiement',
    candidate: 'la candidature',
    document: 'le document',
  }

  const actionLabels = {
    create: 'la création',
    update: 'la mise à jour',
    delete: 'la suppression',
    load: 'le chargement',
  }

  const entityLabel = entityLabels[entity] || entity
  const actionLabel = actionLabels[action] || action

  return `Erreur lors de ${actionLabel} de ${entityLabel} : ${translatedError}`
}
