/**
 * Constantes pour les États des lieux
 * Conformes au Décret n°2016-382 du 30 mars 2016
 *
 * @see https://www.legifrance.gouv.fr/loda/id/JORFTEXT000032320564/
 */

// =====================================================
// TYPES D'ÉTAT DES LIEUX
// =====================================================

export const INVENTORY_TYPES = {
  entry: { label: 'Entrée', color: 'emerald', icon: '🔑' },
  exit: { label: 'Sortie', color: 'orange', icon: '🚪' }
}

export const INVENTORY_STATUS = {
  draft: { label: 'Brouillon', color: 'gray', icon: '📝' },
  completed: { label: 'Terminé', color: 'blue', icon: '✅' },
  signed: { label: 'Signé', color: 'emerald', icon: '✍️' }
}

// =====================================================
// TYPES DE PIÈCES
// =====================================================

export const ROOM_TYPES = {
  entrance: {
    label: 'Entrée / Couloir',
    icon: '🚪',
    defaultElements: ['floor', 'wall', 'ceiling', 'door', 'electrical']
  },
  living_room: {
    label: 'Séjour / Salon',
    icon: '🛋️',
    defaultElements: ['floor', 'wall', 'ceiling', 'door', 'window', 'shutter', 'electrical', 'heating']
  },
  dining_room: {
    label: 'Salle à manger',
    icon: '🍽️',
    defaultElements: ['floor', 'wall', 'ceiling', 'door', 'window', 'electrical', 'heating']
  },
  kitchen: {
    label: 'Cuisine',
    icon: '🍳',
    defaultElements: ['floor', 'wall', 'ceiling', 'door', 'window', 'electrical', 'plumbing', 'appliance']
  },
  bedroom: {
    label: 'Chambre',
    icon: '🛏️',
    defaultElements: ['floor', 'wall', 'ceiling', 'door', 'window', 'shutter', 'electrical', 'heating']
  },
  bathroom: {
    label: 'Salle de bain',
    icon: '🚿',
    defaultElements: ['floor', 'wall', 'ceiling', 'door', 'window', 'electrical', 'plumbing']
  },
  toilet: {
    label: 'WC',
    icon: '🚽',
    defaultElements: ['floor', 'wall', 'ceiling', 'door', 'electrical', 'plumbing']
  },
  office: {
    label: 'Bureau',
    icon: '💼',
    defaultElements: ['floor', 'wall', 'ceiling', 'door', 'window', 'electrical', 'heating']
  },
  laundry: {
    label: 'Buanderie',
    icon: '🧺',
    defaultElements: ['floor', 'wall', 'ceiling', 'door', 'electrical', 'plumbing']
  },
  storage: {
    label: 'Rangement / Dressing',
    icon: '👕',
    defaultElements: ['floor', 'wall', 'ceiling', 'door', 'electrical']
  },
  balcony: {
    label: 'Balcon',
    icon: '🌿',
    defaultElements: ['floor', 'wall', 'door', 'electrical']
  },
  terrace: {
    label: 'Terrasse',
    icon: '☀️',
    defaultElements: ['floor', 'wall', 'electrical']
  },
  garden: {
    label: 'Jardin',
    icon: '🌳',
    defaultElements: ['other']
  },
  garage: {
    label: 'Garage',
    icon: '🚗',
    defaultElements: ['floor', 'wall', 'ceiling', 'door', 'electrical']
  },
  cellar: {
    label: 'Cave',
    icon: '🍷',
    defaultElements: ['floor', 'wall', 'ceiling', 'door', 'electrical']
  },
  attic: {
    label: 'Grenier / Combles',
    icon: '🏠',
    defaultElements: ['floor', 'wall', 'ceiling', 'door', 'electrical']
  },
  basement: {
    label: 'Sous-sol',
    icon: '⬇️',
    defaultElements: ['floor', 'wall', 'ceiling', 'door', 'electrical']
  },
  technical_room: {
    label: 'Local technique',
    icon: '⚙️',
    defaultElements: ['floor', 'wall', 'ceiling', 'door', 'electrical', 'plumbing', 'heating']
  },
  parking: {
    label: 'Parking',
    icon: '🅿️',
    defaultElements: ['floor', 'other']
  },
  other: {
    label: 'Autre',
    icon: '📦',
    defaultElements: ['floor', 'wall', 'ceiling', 'door', 'electrical']
  }
}

// =====================================================
// CATÉGORIES D'ÉLÉMENTS
// =====================================================

export const ELEMENT_CATEGORIES = {
  floor: {
    label: 'Sol',
    icon: '🟫',
    elements: [
      { id: 'parquet_massif', label: 'Parquet massif' },
      { id: 'parquet_stratifie', label: 'Parquet stratifié' },
      { id: 'parquet_flottant', label: 'Parquet flottant' },
      { id: 'carrelage', label: 'Carrelage' },
      { id: 'moquette', label: 'Moquette' },
      { id: 'lino_pvc', label: 'Lino / PVC' },
      { id: 'beton_cire', label: 'Béton ciré' },
      { id: 'tomettes', label: 'Tomettes' },
      { id: 'jonc_mer', label: 'Jonc de mer / Sisal' },
      { id: 'plancher', label: 'Plancher bois' }
    ]
  },
  wall: {
    label: 'Mur',
    icon: '🧱',
    elements: [
      { id: 'peinture', label: 'Peinture' },
      { id: 'papier_peint', label: 'Papier peint' },
      { id: 'carrelage_mural', label: 'Carrelage mural' },
      { id: 'faience', label: 'Faïence' },
      { id: 'lambris', label: 'Lambris' },
      { id: 'crepi', label: 'Crépi' },
      { id: 'beton_cire_mur', label: 'Béton ciré' },
      { id: 'pierre', label: 'Pierre apparente' },
      { id: 'brique', label: 'Brique' }
    ]
  },
  ceiling: {
    label: 'Plafond',
    icon: '⬜',
    elements: [
      { id: 'peinture_plafond', label: 'Peinture' },
      { id: 'dalles', label: 'Dalles' },
      { id: 'lambris_plafond', label: 'Lambris' },
      { id: 'platre', label: 'Plâtre' },
      { id: 'moulures', label: 'Moulures' },
      { id: 'poutres', label: 'Poutres apparentes' },
      { id: 'faux_plafond', label: 'Faux plafond' }
    ]
  },
  door: {
    label: 'Porte / Menuiserie',
    icon: '🚪',
    elements: [
      { id: 'porte_entree', label: 'Porte d\'entrée' },
      { id: 'porte_interieure', label: 'Porte intérieure' },
      { id: 'porte_coulissante', label: 'Porte coulissante' },
      { id: 'porte_vitree', label: 'Porte vitrée' },
      { id: 'placard', label: 'Placard / Penderie' },
      { id: 'plinthes', label: 'Plinthes' },
      { id: 'encadrements', label: 'Encadrements / Chambranles' }
    ]
  },
  window: {
    label: 'Fenêtre / Vitrage',
    icon: '🪟',
    elements: [
      { id: 'fenetre_pvc', label: 'Fenêtre PVC' },
      { id: 'fenetre_bois', label: 'Fenêtre bois' },
      { id: 'fenetre_alu', label: 'Fenêtre aluminium' },
      { id: 'porte_fenetre', label: 'Porte-fenêtre' },
      { id: 'baie_vitree', label: 'Baie vitrée' },
      { id: 'velux', label: 'Velux / Fenêtre de toit' },
      { id: 'double_vitrage', label: 'Double vitrage' },
      { id: 'simple_vitrage', label: 'Simple vitrage' }
    ]
  },
  shutter: {
    label: 'Volet / Store',
    icon: '🌗',
    elements: [
      { id: 'volet_roulant', label: 'Volet roulant' },
      { id: 'volet_battant', label: 'Volet battant' },
      { id: 'volet_bois', label: 'Volet bois' },
      { id: 'volet_pvc', label: 'Volet PVC' },
      { id: 'volet_alu', label: 'Volet aluminium' },
      { id: 'store_interieur', label: 'Store intérieur' },
      { id: 'store_exterieur', label: 'Store extérieur / Banne' },
      { id: 'rideau', label: 'Rideau / Tringle' }
    ]
  },
  electrical: {
    label: 'Électricité',
    icon: '💡',
    elements: [
      { id: 'prise', label: 'Prise électrique' },
      { id: 'interrupteur', label: 'Interrupteur' },
      { id: 'variateur', label: 'Variateur' },
      { id: 'luminaire', label: 'Luminaire / Plafonnier' },
      { id: 'applique', label: 'Applique murale' },
      { id: 'spot', label: 'Spot encastré' },
      { id: 'prise_tv', label: 'Prise TV / Antenne' },
      { id: 'prise_telephone', label: 'Prise téléphone / RJ45' },
      { id: 'tableau_electrique', label: 'Tableau électrique' },
      { id: 'detecteur_fumee', label: 'Détecteur de fumée' },
      { id: 'interphone', label: 'Interphone / Visiophone' }
    ]
  },
  heating: {
    label: 'Chauffage',
    icon: '🔥',
    elements: [
      { id: 'radiateur_electrique', label: 'Radiateur électrique' },
      { id: 'radiateur_eau', label: 'Radiateur eau chaude' },
      { id: 'convecteur', label: 'Convecteur' },
      { id: 'plancher_chauffant', label: 'Plancher chauffant' },
      { id: 'seche_serviettes', label: 'Sèche-serviettes' },
      { id: 'chaudiere_gaz', label: 'Chaudière gaz' },
      { id: 'chaudiere_fioul', label: 'Chaudière fioul' },
      { id: 'pompe_chaleur', label: 'Pompe à chaleur' },
      { id: 'climatisation', label: 'Climatisation' },
      { id: 'cheminee', label: 'Cheminée / Insert' },
      { id: 'poele', label: 'Poêle à bois / granulés' },
      { id: 'thermostat', label: 'Thermostat' }
    ]
  },
  plumbing: {
    label: 'Plomberie',
    icon: '🚰',
    elements: [
      { id: 'robinetterie', label: 'Robinetterie' },
      { id: 'mitigeur', label: 'Mitigeur' },
      { id: 'evier', label: 'Évier' },
      { id: 'lavabo', label: 'Lavabo' },
      { id: 'vasque', label: 'Vasque' },
      { id: 'douche_bac', label: 'Receveur de douche' },
      { id: 'paroi_douche', label: 'Paroi de douche' },
      { id: 'colonne_douche', label: 'Colonne de douche' },
      { id: 'baignoire', label: 'Baignoire' },
      { id: 'wc', label: 'WC / Cuvette' },
      { id: 'abattant_wc', label: 'Abattant WC' },
      { id: 'chasse_eau', label: 'Chasse d\'eau' },
      { id: 'bidet', label: 'Bidet' },
      { id: 'chauffe_eau', label: 'Chauffe-eau / Cumulus' },
      { id: 'ballon_eau', label: 'Ballon d\'eau chaude' },
      { id: 'vmc', label: 'VMC / Ventilation' },
      { id: 'siphon', label: 'Siphon / Évacuation' },
      { id: 'joints_silicone', label: 'Joints silicone' }
    ]
  },
  appliance: {
    label: 'Électroménager',
    icon: '🍳',
    elements: [
      { id: 'refrigerateur', label: 'Réfrigérateur' },
      { id: 'congelateur', label: 'Congélateur' },
      { id: 'four', label: 'Four' },
      { id: 'micro_ondes', label: 'Micro-ondes' },
      { id: 'plaque_cuisson', label: 'Plaque de cuisson' },
      { id: 'hotte', label: 'Hotte aspirante' },
      { id: 'lave_vaisselle', label: 'Lave-vaisselle' },
      { id: 'lave_linge', label: 'Lave-linge' },
      { id: 'seche_linge', label: 'Sèche-linge' },
      { id: 'cafetiere', label: 'Cafetière' },
      { id: 'grille_pain', label: 'Grille-pain' },
      { id: 'bouilloire', label: 'Bouilloire' }
    ]
  },
  furniture: {
    label: 'Mobilier',
    icon: '🪑',
    elements: [
      { id: 'lit', label: 'Lit (structure)' },
      { id: 'matelas', label: 'Matelas' },
      { id: 'sommier', label: 'Sommier' },
      { id: 'canape', label: 'Canapé' },
      { id: 'fauteuil', label: 'Fauteuil' },
      { id: 'table', label: 'Table' },
      { id: 'chaise', label: 'Chaise' },
      { id: 'bureau', label: 'Bureau' },
      { id: 'commode', label: 'Commode' },
      { id: 'armoire', label: 'Armoire' },
      { id: 'etagere', label: 'Étagère' },
      { id: 'meuble_tv', label: 'Meuble TV' },
      { id: 'table_basse', label: 'Table basse' },
      { id: 'table_chevet', label: 'Table de chevet' },
      { id: 'miroir', label: 'Miroir' }
    ]
  },
  other: {
    label: 'Autre',
    icon: '📦',
    elements: [
      { id: 'garde_corps', label: 'Garde-corps / Balustrade' },
      { id: 'escalier', label: 'Escalier' },
      { id: 'rampe', label: 'Rampe d\'escalier' },
      { id: 'boite_lettres', label: 'Boîte aux lettres' },
      { id: 'cloture', label: 'Clôture' },
      { id: 'portail', label: 'Portail' },
      { id: 'portillon', label: 'Portillon' },
      { id: 'store_banne', label: 'Store banne' },
      { id: 'pergola', label: 'Pergola' },
      { id: 'abri_jardin', label: 'Abri de jardin' }
    ]
  }
}

// =====================================================
// ÉCHELLE DE NOTATION
// =====================================================

export const RATING_SCALE = {
  5: {
    label: 'Neuf',
    shortLabel: 'N',
    description: 'État parfait, aucun défaut visible',
    color: 'emerald',
    bgClass: 'bg-emerald-500',
    textClass: 'text-emerald-700',
    badgeClass: 'bg-emerald-100 text-emerald-800'
  },
  4: {
    label: 'Très bon',
    shortLabel: 'TB',
    description: 'Quelques traces d\'usage négligeables',
    color: 'green',
    bgClass: 'bg-green-500',
    textClass: 'text-green-700',
    badgeClass: 'bg-green-100 text-green-800'
  },
  3: {
    label: 'Bon',
    shortLabel: 'B',
    description: 'Traces d\'usage normales',
    color: 'yellow',
    bgClass: 'bg-yellow-500',
    textClass: 'text-yellow-700',
    badgeClass: 'bg-yellow-100 text-yellow-800'
  },
  2: {
    label: 'Moyen',
    shortLabel: 'M',
    description: 'Usure visible, usage passable',
    color: 'orange',
    bgClass: 'bg-orange-500',
    textClass: 'text-orange-700',
    badgeClass: 'bg-orange-100 text-orange-800'
  },
  1: {
    label: 'Mauvais',
    shortLabel: 'MV',
    description: 'Dégradations, réparations nécessaires',
    color: 'red',
    bgClass: 'bg-red-500',
    textClass: 'text-red-700',
    badgeClass: 'bg-red-100 text-red-800'
  }
}

// =====================================================
// GRILLE DE VÉTUSTÉ
// Source : Grille type FNAIM / Accords collectifs HLM
// =====================================================

export const VETUSTE_GRID = {
  // SOLS
  parquet_massif: { lifespan: 25, franchise: 5, residual: 15, label: 'Parquet massif' },
  parquet_stratifie: { lifespan: 15, franchise: 3, residual: 10, label: 'Parquet stratifié' },
  parquet_flottant: { lifespan: 15, franchise: 3, residual: 10, label: 'Parquet flottant' },
  carrelage: { lifespan: 25, franchise: 5, residual: 15, label: 'Carrelage' },
  moquette: { lifespan: 7, franchise: 1, residual: 0, label: 'Moquette' },
  lino_pvc: { lifespan: 10, franchise: 2, residual: 0, label: 'Lino / PVC' },
  beton_cire: { lifespan: 20, franchise: 3, residual: 10, label: 'Béton ciré' },
  tomettes: { lifespan: 30, franchise: 5, residual: 20, label: 'Tomettes' },

  // MURS
  peinture: { lifespan: 7, franchise: 1, residual: 0, label: 'Peinture murale' },
  papier_peint: { lifespan: 7, franchise: 1, residual: 0, label: 'Papier peint' },
  carrelage_mural: { lifespan: 20, franchise: 3, residual: 15, label: 'Carrelage mural' },
  faience: { lifespan: 20, franchise: 3, residual: 15, label: 'Faïence' },
  lambris: { lifespan: 15, franchise: 2, residual: 10, label: 'Lambris' },

  // PLAFONDS
  peinture_plafond: { lifespan: 10, franchise: 2, residual: 0, label: 'Peinture plafond' },
  dalles: { lifespan: 15, franchise: 2, residual: 0, label: 'Dalles plafond' },
  moulures: { lifespan: 30, franchise: 5, residual: 20, label: 'Moulures' },

  // MENUISERIES
  porte_entree: { lifespan: 25, franchise: 5, residual: 20, label: 'Porte d\'entrée' },
  porte_interieure: { lifespan: 20, franchise: 3, residual: 15, label: 'Porte intérieure' },
  placard: { lifespan: 20, franchise: 3, residual: 10, label: 'Placard' },
  plinthes: { lifespan: 15, franchise: 2, residual: 10, label: 'Plinthes' },

  // FENÊTRES
  fenetre_pvc: { lifespan: 25, franchise: 5, residual: 15, label: 'Fenêtre PVC' },
  fenetre_bois: { lifespan: 30, franchise: 5, residual: 20, label: 'Fenêtre bois' },
  fenetre_alu: { lifespan: 30, franchise: 5, residual: 20, label: 'Fenêtre aluminium' },
  double_vitrage: { lifespan: 25, franchise: 5, residual: 15, label: 'Double vitrage' },

  // VOLETS
  volet_roulant: { lifespan: 15, franchise: 3, residual: 10, label: 'Volet roulant' },
  volet_battant: { lifespan: 20, franchise: 3, residual: 15, label: 'Volet battant' },
  store_interieur: { lifespan: 10, franchise: 2, residual: 0, label: 'Store intérieur' },

  // ÉLECTRICITÉ
  prise: { lifespan: 30, franchise: 5, residual: 20, label: 'Prise électrique' },
  interrupteur: { lifespan: 30, franchise: 5, residual: 20, label: 'Interrupteur' },
  luminaire: { lifespan: 15, franchise: 2, residual: 10, label: 'Luminaire' },
  tableau_electrique: { lifespan: 35, franchise: 5, residual: 25, label: 'Tableau électrique' },

  // CHAUFFAGE
  radiateur_electrique: { lifespan: 15, franchise: 3, residual: 10, label: 'Radiateur électrique' },
  radiateur_eau: { lifespan: 25, franchise: 5, residual: 15, label: 'Radiateur eau' },
  chaudiere_gaz: { lifespan: 20, franchise: 5, residual: 10, label: 'Chaudière gaz' },
  chauffe_eau: { lifespan: 12, franchise: 3, residual: 0, label: 'Chauffe-eau' },
  climatisation: { lifespan: 15, franchise: 3, residual: 10, label: 'Climatisation' },
  thermostat: { lifespan: 15, franchise: 2, residual: 10, label: 'Thermostat' },

  // PLOMBERIE
  robinetterie: { lifespan: 12, franchise: 2, residual: 0, label: 'Robinetterie' },
  evier: { lifespan: 20, franchise: 3, residual: 15, label: 'Évier' },
  lavabo: { lifespan: 20, franchise: 3, residual: 15, label: 'Lavabo' },
  baignoire: { lifespan: 25, franchise: 5, residual: 15, label: 'Baignoire' },
  douche_bac: { lifespan: 20, franchise: 3, residual: 10, label: 'Receveur douche' },
  paroi_douche: { lifespan: 15, franchise: 2, residual: 10, label: 'Paroi douche' },
  wc: { lifespan: 25, franchise: 5, residual: 15, label: 'WC' },
  joints_silicone: { lifespan: 5, franchise: 0, residual: 0, label: 'Joints silicone' },
  vmc: { lifespan: 15, franchise: 3, residual: 10, label: 'VMC' },

  // ÉLECTROMÉNAGER
  refrigerateur: { lifespan: 10, franchise: 2, residual: 0, label: 'Réfrigérateur' },
  congelateur: { lifespan: 10, franchise: 2, residual: 0, label: 'Congélateur' },
  lave_linge: { lifespan: 8, franchise: 1, residual: 0, label: 'Lave-linge' },
  lave_vaisselle: { lifespan: 8, franchise: 1, residual: 0, label: 'Lave-vaisselle' },
  seche_linge: { lifespan: 8, franchise: 1, residual: 0, label: 'Sèche-linge' },
  four: { lifespan: 12, franchise: 2, residual: 0, label: 'Four' },
  micro_ondes: { lifespan: 8, franchise: 1, residual: 0, label: 'Micro-ondes' },
  plaque_cuisson: { lifespan: 12, franchise: 2, residual: 0, label: 'Plaque de cuisson' },
  hotte: { lifespan: 10, franchise: 2, residual: 0, label: 'Hotte' },

  // MOBILIER
  lit: { lifespan: 15, franchise: 2, residual: 10, label: 'Lit' },
  matelas: { lifespan: 10, franchise: 2, residual: 0, label: 'Matelas' },
  canape: { lifespan: 12, franchise: 2, residual: 10, label: 'Canapé' },
  table: { lifespan: 15, franchise: 2, residual: 15, label: 'Table' },
  chaise: { lifespan: 12, franchise: 2, residual: 10, label: 'Chaise' },
  meuble_rangement: { lifespan: 15, franchise: 2, residual: 15, label: 'Meuble de rangement' }
}

// =====================================================
// TYPES DE CLÉS
// =====================================================

export const KEY_TYPES = [
  { id: 'porte_entree', label: 'Porte d\'entrée', icon: '🔑' },
  { id: 'porte_immeuble', label: 'Porte d\'immeuble', icon: '🏢' },
  { id: 'boite_lettres', label: 'Boîte aux lettres', icon: '📬' },
  { id: 'cave', label: 'Cave', icon: '🍷' },
  { id: 'garage', label: 'Garage', icon: '🚗' },
  { id: 'parking', label: 'Parking', icon: '🅿️' },
  { id: 'local_velo', label: 'Local vélo', icon: '🚲' },
  { id: 'portail', label: 'Portail', icon: '🚪' },
  { id: 'badge', label: 'Badge', icon: '🪪' },
  { id: 'telecommande', label: 'Télécommande', icon: '📡' },
  { id: 'digicode', label: 'Digicode', icon: '🔢' },
  { id: 'autre', label: 'Autre', icon: '🔐' }
]

// Valeurs par défaut pour les clés (pré-remplissage formulaire)
export const DEFAULT_KEYS = [
  { type: 'porte_entree', quantity: 2, notes: '' },
  { type: 'porte_immeuble', quantity: 1, notes: '' },
  { type: 'boite_lettres', quantity: 1, notes: '' }
]

// =====================================================
// TYPES DE COMPTEURS
// =====================================================

export const METER_TYPES = [
  { id: 'water_cold', label: 'Eau froide', unit: 'm³', icon: '💧' },
  { id: 'water_hot', label: 'Eau chaude', unit: 'm³', icon: '🔥' },
  { id: 'electricity_hp', label: 'Électricité HP', unit: 'kWh', icon: '⚡' },
  { id: 'electricity_hc', label: 'Électricité HC', unit: 'kWh', icon: '⚡' },
  { id: 'gas', label: 'Gaz', unit: 'm³', icon: '🔥' }
]

// =====================================================
// FONCTIONS UTILITAIRES
// =====================================================

/**
 * Calcule le taux de vétusté pour un élément
 * @param {string} elementType - Type d'élément (ex: 'peinture', 'parquet_massif')
 * @param {number} yearsOfUse - Années d'utilisation depuis installation
 * @returns {number} Taux de vétusté en pourcentage (0-100)
 */
export const calculateVetusteRate = (elementType, yearsOfUse) => {
  const grid = VETUSTE_GRID[elementType]
  if (!grid) return 0

  const { lifespan, franchise, residual } = grid

  // Pendant la période de franchise, pas de vétusté
  if (yearsOfUse <= franchise) {
    return 0
  }

  // Calcul du taux annuel de dépréciation
  const depreciableYears = lifespan - franchise
  const annualRate = (100 - residual) / depreciableYears

  // Calcul de la vétusté
  const yearsAfterFranchise = yearsOfUse - franchise
  const vetuste = Math.min(100 - residual, annualRate * yearsAfterFranchise)

  return Math.round(vetuste * 100) / 100
}

/**
 * Calcule le montant à la charge du locataire après vétusté
 * @param {number} repairCost - Coût total de la réparation/remplacement
 * @param {string} elementType - Type d'élément
 * @param {number} yearsOfUse - Années d'utilisation
 * @returns {object} { vetusteRate, tenantShare, landlordShare }
 */
export const calculateTenantShare = (repairCost, elementType, yearsOfUse) => {
  const vetusteRate = calculateVetusteRate(elementType, yearsOfUse)

  const tenantPercentage = 100 - vetusteRate
  const tenantShare = Math.round((repairCost * tenantPercentage) / 100 * 100) / 100
  const landlordShare = Math.round((repairCost - tenantShare) * 100) / 100

  return {
    vetusteRate,
    tenantPercentage,
    tenantShare,
    landlordShare
  }
}

/**
 * Retourne les éléments par défaut pour un type de pièce
 * @param {string} roomType - Type de pièce
 * @returns {Array} Liste des catégories d'éléments par défaut
 */
export const getDefaultElements = (roomType) => {
  const room = ROOM_TYPES[roomType]
  return room ? room.defaultElements : ['floor', 'wall', 'ceiling']
}

/**
 * Retourne tous les éléments disponibles pour une catégorie
 * @param {string} categoryId - ID de la catégorie
 * @returns {Array} Liste des éléments
 */
export const getElementsByCategory = (categoryId) => {
  const category = ELEMENT_CATEGORIES[categoryId]
  return category ? category.elements : []
}

/**
 * Convertit un rating numérique en texte
 * @param {number} rating - Note de 1 à 5
 * @returns {object} Informations sur le rating
 */
export const getRatingInfo = (rating) => {
  return RATING_SCALE[rating] || RATING_SCALE[3]
}

/**
 * Compare deux états des lieux et retourne les différences
 * @param {object} entryInventory - État des lieux d'entrée
 * @param {object} exitInventory - État des lieux de sortie
 * @returns {Array} Liste des différences avec calcul de vétusté
 */
export const compareInventories = (entryInventory, exitInventory) => {
  // À implémenter lors de la création du service
  return []
}
