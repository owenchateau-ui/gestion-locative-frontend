import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { supabase } from '../lib/supabase'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Alert from '../components/ui/Alert'
import Modal from '../components/ui/Modal'
import Tabs from '../components/ui/Tabs'
import Badge from '../components/ui/Badge'
import { FileText, Mail, Clock, Save, RotateCcw, Eye, Download, Loader2, FileCheck, AlertTriangle, Receipt, Home, Calendar, Euro, Scale, UserX, Calculator, Handshake } from 'lucide-react'
import { STAT_ICON_STYLES } from '../constants/designSystem'
import {
  previewQuittance,
  previewAttestationCAF,
  previewAvisEcheance,
  previewMiseEnDemeure,
  previewAttestationLoyer,
  previewLettreIndexation,
  previewLettreResiliation,
  previewCongeVente,
  previewLettreResiliationLocataire,
  previewRegularisationCharges,
  previewAccordEcheancier,
  downloadQuittance,
  downloadAttestationCAF,
  downloadAvisEcheance,
  downloadMiseEnDemeure,
  downloadAttestationLoyer,
  downloadLettreIndexation,
  downloadLettreResiliation,
  downloadCongeVente,
  downloadLettreResiliationLocataire,
  downloadRegularisationCharges,
  downloadAccordEcheancier
} from '../services/documentGenerationService'

// Configuration par défaut des templates
const DEFAULT_TEMPLATES = {
  relance_amiable: {
    id: 'relance_amiable',
    name: 'Relance amiable',
    category: 'relances',
    description: 'Première relance envoyée quelques jours après l\'échéance',
    delay: 3,
    subject: 'Rappel - Loyer en attente de règlement',
    content: `Madame, Monsieur,

Nous nous permettons de vous rappeler que le loyer du mois de {mois} d'un montant de {montant} € est arrivé à échéance le {date_echeance}.

À ce jour, nous n'avons pas encore reçu votre règlement.

Il s'agit certainement d'un simple oubli de votre part. Nous vous serions reconnaissants de bien vouloir procéder au règlement de cette somme dans les meilleurs délais.

Dans le cas où votre paiement se serait croisé avec ce courrier, nous vous prions de ne pas tenir compte de ce rappel.

Pour toute difficulté de paiement, n'hésitez pas à nous contacter afin que nous puissions trouver ensemble une solution.

Nous vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.`
  },
  rappel_formel: {
    id: 'rappel_formel',
    name: 'Rappel formel',
    category: 'relances',
    description: 'Deuxième relance plus formelle, envoyée par courrier recommandé',
    delay: 7,
    subject: 'Rappel formel - Impayé de loyer',
    content: `Madame, Monsieur,

Malgré notre précédent courrier du {date_relance_precedente}, nous constatons que votre compte locatif présente toujours un solde débiteur.

Situation de votre compte au {date_du_jour} :
- Loyer impayé : {montant_loyer} €
- Charges : {montant_charges} €
- Total dû : {montant_total} €

Nous vous demandons de procéder au règlement de cette somme sous 8 jours à compter de la réception du présent courrier.

À défaut de règlement dans ce délai, nous nous verrons dans l'obligation d'engager une procédure de recouvrement, entraînant des frais supplémentaires à votre charge.

Nous vous rappelons que le non-paiement du loyer constitue un manquement grave à vos obligations locatives et peut entraîner la résiliation du bail.

Nous vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.`
  },
  mise_en_demeure: {
    id: 'mise_en_demeure',
    name: 'Mise en demeure',
    category: 'relances',
    description: 'Dernière relance avant procédure judiciaire',
    delay: 15,
    subject: 'MISE EN DEMEURE - Impayé de loyer',
    content: `LETTRE RECOMMANDÉE AVEC ACCUSÉ DE RÉCEPTION

Madame, Monsieur,

Malgré nos précédents rappels restés sans effet, nous constatons que vous êtes redevable de la somme de {montant_total} € au titre des loyers et charges impayés.

Détail de la dette :
{detail_dette}

Par la présente, nous vous mettons en demeure de régler l'intégralité de cette somme dans un délai de HUIT JOURS à compter de la réception du présent courrier.

À défaut de paiement dans ce délai, nous serons contraints de :
1. Faire application de la clause résolutoire prévue au bail
2. Saisir le tribunal compétent pour obtenir la résiliation du bail et votre expulsion
3. Engager toutes procédures utiles au recouvrement de notre créance

Nous vous informons que cette mise en demeure fait courir les intérêts de retard au taux légal.

Cette lettre vaut mise en demeure au sens des articles 1344 et suivants du Code civil.

Nous vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.`
  },
  bail_vide: {
    id: 'bail_vide',
    name: 'Bail vide',
    category: 'baux',
    description: 'Contrat de location pour logement vide (loi ALUR)',
    content: 'Le contenu du bail est généré automatiquement selon la loi ALUR.',
    customClauses: []
  },
  bail_meuble: {
    id: 'bail_meuble',
    name: 'Bail meublé',
    category: 'baux',
    description: 'Contrat de location pour logement meublé (loi ALUR)',
    content: 'Le contenu du bail est généré automatiquement selon la loi ALUR.',
    customClauses: []
  },
  quittance: {
    id: 'quittance',
    name: 'Quittance de loyer',
    category: 'quittances',
    description: 'Quittance mensuelle de loyer',
    content: 'La quittance est générée automatiquement avec les informations du paiement.'
  },
  regularisation_charges: {
    id: 'regularisation_charges',
    name: 'Régularisation des charges',
    category: 'charges',
    description: 'Lettre de régularisation annuelle des charges',
    content: 'La lettre de régularisation est générée automatiquement avec le décompte des charges.'
  }
}

// Documents légaux PDF disponibles
const LEGAL_DOCUMENTS = [
  {
    id: 'quittance',
    name: 'Quittance de loyer',
    description: 'Document attestant du paiement du loyer mensuel par le locataire. Conforme à l\'Article 21 de la loi n° 89-462.',
    icon: Receipt,
    category: 'mensuel',
    requiresPayment: true,
    color: 'emerald'
  },
  {
    id: 'attestation_caf',
    name: 'Attestation CAF',
    description: 'Attestation de loyer pour la CAF/MSA permettant au locataire de percevoir ses aides au logement.',
    icon: FileCheck,
    category: 'administratif',
    color: 'blue'
  },
  {
    id: 'avis_echeance',
    name: 'Avis d\'échéance',
    description: 'Appel de loyer envoyé avant la date d\'échéance rappelant le montant dû et les modalités de paiement.',
    icon: Calendar,
    category: 'mensuel',
    color: 'indigo'
  },
  {
    id: 'mise_en_demeure',
    name: 'Mise en demeure',
    description: 'Lettre recommandée formelle exigeant le paiement des loyers impayés sous 8 jours. Préalable aux poursuites judiciaires.',
    icon: AlertTriangle,
    category: 'contentieux',
    color: 'red'
  },
  {
    id: 'attestation_loyer',
    name: 'Attestation de loyer annuelle',
    description: 'Récapitulatif annuel des loyers payés. Utile pour les impôts, demandes administratives ou de logement.',
    icon: Euro,
    category: 'annuel',
    color: 'purple'
  },
  {
    id: 'lettre_indexation',
    name: 'Lettre d\'indexation IRL',
    description: 'Notification de révision du loyer selon l\'Indice de Référence des Loyers (IRL) de l\'INSEE.',
    icon: Scale,
    category: 'annuel',
    color: 'amber'
  },
  {
    id: 'lettre_resiliation',
    name: 'Congé bailleur',
    description: 'Lettre de résiliation du bail par le bailleur (reprise, vente, motif légitime). Préavis de 6 mois minimum.',
    icon: FileText,
    category: 'fin_bail',
    color: 'orange'
  },
  {
    id: 'conge_vente',
    name: 'Congé pour vente',
    description: 'Notification de vente avec droit de préemption du locataire. Conforme à l\'article 15-II de la loi de 1989.',
    icon: Home,
    category: 'fin_bail',
    color: 'rose'
  },
  {
    id: 'resiliation_locataire',
    name: 'Congé locataire',
    description: 'Lettre de résiliation du bail par le locataire. Préavis de 1 mois (meublé/zone tendue) ou 3 mois (non meublé).',
    icon: UserX,
    category: 'fin_bail',
    color: 'slate'
  },
  {
    id: 'regularisation_charges',
    name: 'Régularisation des charges',
    description: 'Décompte annuel des charges avec comparaison provisions versées vs charges réelles. Conforme à l\'article 23 loi 1989.',
    icon: Calculator,
    category: 'annuel',
    color: 'cyan'
  },
  {
    id: 'accord_echeancier',
    name: 'Accord d\'échéancier',
    description: 'Accord de paiement échelonné pour dette locative. Inclut calendrier des paiements et conditions de caducité.',
    icon: Handshake,
    category: 'contentieux',
    color: 'teal'
  }
]

const DOCUMENT_CATEGORIES = {
  mensuel: { label: 'Mensuel', color: 'blue' },
  administratif: { label: 'Administratif', color: 'green' },
  annuel: { label: 'Annuel', color: 'purple' },
  contentieux: { label: 'Contentieux', color: 'red' },
  fin_bail: { label: 'Fin de bail', color: 'orange' }
}

// Variables disponibles par catégorie
const AVAILABLE_VARIABLES = {
  relances: [
    { key: '{locataire}', description: 'Nom complet du locataire' },
    { key: '{civilite}', description: 'Civilité (Madame/Monsieur)' },
    { key: '{adresse}', description: 'Adresse du logement' },
    { key: '{mois}', description: 'Mois concerné' },
    { key: '{montant}', description: 'Montant du loyer' },
    { key: '{montant_loyer}', description: 'Montant du loyer HC' },
    { key: '{montant_charges}', description: 'Montant des charges' },
    { key: '{montant_total}', description: 'Montant total dû' },
    { key: '{date_echeance}', description: 'Date d\'échéance' },
    { key: '{date_du_jour}', description: 'Date du jour' },
    { key: '{date_relance_precedente}', description: 'Date de la relance précédente' },
    { key: '{detail_dette}', description: 'Détail des sommes dues' },
    { key: '{bailleur}', description: 'Nom du bailleur' }
  ],
  baux: [
    { key: '{locataire}', description: 'Nom du locataire' },
    { key: '{bailleur}', description: 'Nom du bailleur' },
    { key: '{adresse}', description: 'Adresse du bien' },
    { key: '{surface}', description: 'Surface en m²' },
    { key: '{loyer}', description: 'Montant du loyer' },
    { key: '{charges}', description: 'Montant des charges' },
    { key: '{depot_garantie}', description: 'Dépôt de garantie' },
    { key: '{date_debut}', description: 'Date de début du bail' },
    { key: '{date_fin}', description: 'Date de fin du bail' }
  ]
}

function DocumentTemplates() {
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewContent, setPreviewContent] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  // États pour les documents légaux
  const [leases, setLeases] = useState([])
  const [payments, setPayments] = useState([])
  const [loadingLeases, setLoadingLeases] = useState(false)
  const [selectedLease, setSelectedLease] = useState('')
  const [selectedPayment, setSelectedPayment] = useState('')
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [currentDocument, setCurrentDocument] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [documentCategory, setDocumentCategory] = useState('all')

  // Options pour les documents spécifiques
  const [resiliationMotif, setResiliationMotif] = useState('motif_legitime')
  const [resiliationBeneficiaire, setResiliationBeneficiaire] = useState({ nom: '', lien: 'conjoint' })
  const [resiliationMotifDetail, setResiliationMotifDetail] = useState('')
  const [venteDetails, setVenteDetails] = useState({
    prixVente: '',
    fraisAgence: '',
    honorairesCharge: 'vendeur',
    modePaiement: '',
    delaiRealisation: '',
    conditionsParticulieres: ''
  })
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [miseEnDemeureDelai, setMiseEnDemeureDelai] = useState(8)

  // Options pour congé locataire
  const [resiliationLocataireMotif, setResiliationLocataireMotif] = useState('convenance')
  const [resiliationLocataireDate, setResiliationLocataireDate] = useState('')
  const [resiliationLocataireDetail, setResiliationLocataireDetail] = useState('')

  // Options pour régularisation des charges
  const [regularisationPeriode, setRegularisationPeriode] = useState(new Date().getFullYear() - 1)
  const [regularisationProvisions, setRegularisationProvisions] = useState('')
  const [regularisationChargesReelles, setRegularisationChargesReelles] = useState('')
  const [regularisationDetail, setRegularisationDetail] = useState([
    { libelle: 'Eau froide/chaude', montant: '' },
    { libelle: 'Chauffage collectif', montant: '' },
    { libelle: 'Entretien parties communes', montant: '' },
    { libelle: 'Ordures ménagères', montant: '' }
  ])

  // Options pour accord d'échéancier
  const [echeancierDette, setEcheancierDette] = useState('')
  const [echeancierNombreMensualites, setEcheancierNombreMensualites] = useState(6)
  const [echeancierDateDebut, setEcheancierDateDebut] = useState('')
  const [echeancierDetteDetail, setEcheancierDetteDetail] = useState('')

  const { user } = useAuth()
  const { success, error: showError } = useToast()

  // Charger les templates personnalisés depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('documentTemplates')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setTemplates({ ...DEFAULT_TEMPLATES, ...parsed })
      } catch (e) {
        console.error('Erreur chargement templates:', e)
      }
    }
  }, [])

  // Charger les baux actifs pour la génération de documents
  const loadLeases = async () => {
    if (!user) return

    try {
      setLoadingLeases(true)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('supabase_uid', user.id)
        .single()

      if (userError) throw userError

      const { data, error } = await supabase
        .from('leases')
        .select(`
          id,
          status,
          rent_amount,
          charges_amount,
          lot:lots!inner(
            id,
            name,
            properties_new!inner(
              id,
              name,
              entities!inner(user_id)
            )
          ),
          tenant:tenants!inner(
            id,
            first_name,
            last_name,
            tenant_groups!group_id(id, name)
          )
        `)
        .eq('lot.properties_new.entities.user_id', userData.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error
      setLeases(data || [])
    } catch (err) {
      console.error('Erreur chargement baux:', err)
    } finally {
      setLoadingLeases(false)
    }
  }

  // Charger les paiements pour un bail sélectionné
  const loadPayments = async (leaseId) => {
    if (!leaseId) {
      setPayments([])
      return
    }

    try {
      const { data, error } = await supabase
        .from('payments')
        .select('id, amount, due_date, payment_date, status')
        .eq('lease_id', leaseId)
        .eq('status', 'paid')
        .order('due_date', { ascending: false })
        .limit(12)

      if (error) throw error
      setPayments(data || [])
    } catch (err) {
      console.error('Erreur chargement paiements:', err)
    }
  }

  useEffect(() => {
    if (selectedLease) {
      loadPayments(selectedLease)
    }
  }, [selectedLease])

  // Ouvrir le modal de génération
  const openGenerateModal = (document) => {
    setCurrentDocument(document)
    setShowGenerateModal(true)
    loadLeases()
  }

  // Générer le document
  const handleGenerate = async () => {
    if (!selectedLease && !currentDocument.requiresPayment) {
      showError('Veuillez sélectionner un bail')
      return
    }

    try {
      setGenerating(true)

      switch (currentDocument.id) {
        case 'quittance':
          if (!selectedPayment) {
            showError('Veuillez sélectionner un paiement')
            return
          }
          await downloadQuittance(selectedPayment)
          break
        case 'attestation_caf':
          await downloadAttestationCAF(selectedLease)
          break
        case 'avis_echeance':
          await downloadAvisEcheance(selectedLease)
          break
        case 'mise_en_demeure':
          // Le 2ème paramètre est unpaidPaymentIds ([] pour tous les impayés), le 3ème est les options
          await downloadMiseEnDemeure(selectedLease, [], { joursDelai: miseEnDemeureDelai })
          break
        case 'attestation_loyer':
          await downloadAttestationLoyer(selectedLease, selectedYear)
          break
        case 'lettre_indexation':
          await downloadLettreIndexation(selectedLease)
          break
        case 'lettre_resiliation':
          await downloadLettreResiliation(selectedLease, resiliationMotif, {
            motifDetail: resiliationMotifDetail || null,
            beneficiaire: resiliationMotif === 'reprise' && resiliationBeneficiaire.nom
              ? resiliationBeneficiaire
              : null
          })
          break
        case 'conge_vente':
          if (!venteDetails.prixVente) {
            showError('Veuillez indiquer le prix de vente')
            return
          }
          await downloadCongeVente(selectedLease, {
            prixVente: parseFloat(venteDetails.prixVente),
            fraisAgence: venteDetails.fraisAgence ? parseFloat(venteDetails.fraisAgence) : 0,
            honorairesCharge: venteDetails.honorairesCharge,
            modePaiement: venteDetails.modePaiement || null,
            delaiRealisation: venteDetails.delaiRealisation || null,
            conditionsParticulieres: venteDetails.conditionsParticulieres || null
          })
          break
        case 'resiliation_locataire':
          await downloadLettreResiliationLocataire(selectedLease, resiliationLocataireMotif, {
            dateDepart: resiliationLocataireDate || null,
            motifDetail: resiliationLocataireDetail || null
          })
          break
        case 'regularisation_charges':
          if (!regularisationProvisions || !regularisationChargesReelles) {
            showError('Veuillez renseigner les provisions et les charges réelles')
            return
          }
          const detailCharges = regularisationDetail
            .filter(d => d.montant)
            .map(d => ({ libelle: d.libelle, montant: parseFloat(d.montant) || 0 }))
          await downloadRegularisationCharges(selectedLease, {
            periode: regularisationPeriode,
            provisionsVersees: parseFloat(regularisationProvisions),
            chargesReelles: parseFloat(regularisationChargesReelles),
            detailCharges: detailCharges.length > 0 ? detailCharges : null
          })
          break
        case 'accord_echeancier':
          if (!echeancierDette) {
            showError('Veuillez indiquer le montant total de la dette')
            return
          }
          await downloadAccordEcheancier(selectedLease, {
            total: parseFloat(echeancierDette),
            nombreMensualites: echeancierNombreMensualites,
            dateDebut: echeancierDateDebut || null,
            detailDette: echeancierDetteDetail || null
          })
          break
        default:
          showError('Type de document non reconnu')
          return
      }

      success(`${currentDocument.name} généré avec succès`)
      setShowGenerateModal(false)
      resetModalState()
    } catch (err) {
      console.error('Erreur génération:', err)
      showError(`Erreur lors de la génération : ${err.message}`)
    } finally {
      setGenerating(false)
    }
  }

  const resetModalState = () => {
    setSelectedLease('')
    setSelectedPayment('')
    setResiliationMotif('motif_legitime')
    setResiliationBeneficiaire({ nom: '', lien: 'conjoint' })
    setResiliationMotifDetail('')
    setVenteDetails({ prixVente: '', fraisAgence: '', honorairesCharge: 'vendeur', modePaiement: '', delaiRealisation: '', conditionsParticulieres: '' })
    setMiseEnDemeureDelai(8)
    setResiliationLocataireMotif('convenance')
    setResiliationLocataireDate('')
    setResiliationLocataireDetail('')
    setRegularisationPeriode(new Date().getFullYear() - 1)
    setRegularisationProvisions('')
    setRegularisationChargesReelles('')
    setRegularisationDetail([
      { libelle: 'Eau froide/chaude', montant: '' },
      { libelle: 'Chauffage collectif', montant: '' },
      { libelle: 'Entretien parties communes', montant: '' },
      { libelle: 'Ordures ménagères', montant: '' }
    ])
    setEcheancierDette('')
    setEcheancierNombreMensualites(6)
    setEcheancierDateDebut('')
    setEcheancierDetteDetail('')
    setCurrentDocument(null)
  }

  const handleSave = () => {
    try {
      localStorage.setItem('documentTemplates', JSON.stringify(templates))
      setHasChanges(false)
      success('Modèles sauvegardés avec succès')
    } catch (e) {
      showError('Erreur lors de la sauvegarde')
    }
  }

  const handleReset = (templateId) => {
    if (confirm('Voulez-vous vraiment réinitialiser ce modèle aux valeurs par défaut ?')) {
      setTemplates(prev => ({
        ...prev,
        [templateId]: DEFAULT_TEMPLATES[templateId]
      }))
      setHasChanges(true)
      success('Modèle réinitialisé')
    }
  }

  const handleResetAll = () => {
    if (confirm('Voulez-vous vraiment réinitialiser TOUS les modèles aux valeurs par défaut ?')) {
      setTemplates(DEFAULT_TEMPLATES)
      localStorage.removeItem('documentTemplates')
      setHasChanges(false)
      success('Tous les modèles ont été réinitialisés')
    }
  }

  const handleTemplateChange = (templateId, field, value) => {
    setTemplates(prev => ({
      ...prev,
      [templateId]: {
        ...prev[templateId],
        [field]: value
      }
    }))
    setHasChanges(true)
  }

  const handlePreview = (template) => {
    // Remplacer les variables par des exemples
    let content = template.content
    content = content.replace(/{locataire}/g, 'Jean DUPONT')
    content = content.replace(/{civilite}/g, 'Monsieur')
    content = content.replace(/{adresse}/g, '15 rue de la Paix, 75001 Paris')
    content = content.replace(/{mois}/g, 'janvier 2026')
    content = content.replace(/{montant}/g, '850,00')
    content = content.replace(/{montant_loyer}/g, '750,00')
    content = content.replace(/{montant_charges}/g, '100,00')
    content = content.replace(/{montant_total}/g, '850,00')
    content = content.replace(/{date_echeance}/g, '1er janvier 2026')
    content = content.replace(/{date_du_jour}/g, new Date().toLocaleDateString('fr-FR'))
    content = content.replace(/{date_relance_precedente}/g, '5 janvier 2026')
    content = content.replace(/{detail_dette}/g, '- Janvier 2026 : 850,00 €')
    content = content.replace(/{bailleur}/g, 'SCI EXEMPLE')

    setPreviewContent(content)
    setShowPreview(true)
  }

  const renderRelancesTab = () => {
    const relanceTemplates = Object.values(templates).filter(t => t.category === 'relances')

    return (
      <div className="space-y-6">
        <Alert variant="info">
          Configurez les délais et le contenu des lettres de relance pour les loyers impayés.
          Les variables entre accolades seront automatiquement remplacées par les vraies valeurs.
        </Alert>

        {relanceTemplates.map(template => (
          <Card key={template.id} title={template.name}>
            <div className="space-y-4">
              <p className="text-sm text-[var(--text-secondary)]">{template.description}</p>

              {/* Délai de relance */}
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">
                  Délai après échéance (jours)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={template.delay || 0}
                    onChange={(e) => handleTemplateChange(template.id, 'delay', parseInt(e.target.value))}
                    className="w-20 px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
                  />
                  <span className="text-sm text-[var(--text-muted)]">
                    jours après la date d'échéance
                  </span>
                </div>
              </div>

              {/* Objet du courrier */}
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">
                  Objet du courrier
                </label>
                <input
                  type="text"
                  value={template.subject || ''}
                  onChange={(e) => handleTemplateChange(template.id, 'subject', e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
                />
              </div>

              {/* Contenu */}
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">
                  Contenu de la lettre
                </label>
                <textarea
                  value={template.content}
                  onChange={(e) => handleTemplateChange(template.id, 'content', e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors font-mono text-sm"
                />
              </div>

              {/* Variables disponibles */}
              <div>
                <p className="text-sm font-medium text-[var(--text)] mb-2">Variables disponibles :</p>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_VARIABLES.relances.map(variable => (
                    <span
                      key={variable.key}
                      className="px-2 py-1 bg-[var(--surface-elevated)] text-[var(--text-secondary)] text-xs rounded-lg cursor-help transition-colors"
                      title={variable.description}
                    >
                      {variable.key}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-[var(--border)]">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePreview(template)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Aperçu
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleReset(template.id)}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  const handleAddClause = (templateId) => {
    const newClause = {
      id: Date.now(),
      title: '',
      content: ''
    }
    setTemplates(prev => ({
      ...prev,
      [templateId]: {
        ...prev[templateId],
        customClauses: [...(prev[templateId].customClauses || []), newClause]
      }
    }))
    setHasChanges(true)
  }

  const handleUpdateClause = (templateId, clauseId, field, value) => {
    setTemplates(prev => ({
      ...prev,
      [templateId]: {
        ...prev[templateId],
        customClauses: (prev[templateId].customClauses || []).map(clause =>
          clause.id === clauseId ? { ...clause, [field]: value } : clause
        )
      }
    }))
    setHasChanges(true)
  }

  const handleDeleteClause = (templateId, clauseId) => {
    if (confirm('Supprimer cette clause ?')) {
      setTemplates(prev => ({
        ...prev,
        [templateId]: {
          ...prev[templateId],
          customClauses: (prev[templateId].customClauses || []).filter(clause => clause.id !== clauseId)
        }
      }))
      setHasChanges(true)
    }
  }

  const renderBauxTab = () => {
    const bauxTemplates = Object.values(templates).filter(t => t.category === 'baux')

    return (
      <div className="space-y-6">
        <Alert variant="info">
          Les contrats de bail sont générés automatiquement conformément à la loi ALUR.
          Vous pouvez ajouter des clauses particulières supplémentaires qui seront incluses dans le bail.
        </Alert>

        {bauxTemplates.map(template => (
          <Card key={template.id} title={template.name}>
            <div className="space-y-4">
              <p className="text-sm text-[var(--text-secondary)]">{template.description}</p>

              <Alert variant="warning">
                Les clauses obligatoires prévues par la loi ALUR sont automatiquement incluses.
                Les clauses ci-dessous seront ajoutées en tant que "Clauses particulières".
              </Alert>

              {/* Liste des clauses personnalisées */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-medium text-[var(--text)]">Clauses particulières</h4>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddClause(template.id)}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Ajouter une clause
                  </Button>
                </div>

                {(!template.customClauses || template.customClauses.length === 0) ? (
                  <p className="text-sm text-[var(--text-muted)] italic">
                    Aucune clause particulière. Cliquez sur "Ajouter une clause" pour en créer une.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {template.customClauses.map((clause, index) => (
                      <div key={clause.id} className="p-4 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border)]">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-sm font-medium text-[var(--text-muted)]">
                            Clause {index + 1}
                          </span>
                          <button
                            onClick={() => handleDeleteClause(template.id, clause.id)}
                            className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm transition-colors"
                          >
                            Supprimer
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-[var(--text)] mb-1">
                              Titre de la clause
                            </label>
                            <input
                              type="text"
                              value={clause.title}
                              onChange={(e) => handleUpdateClause(template.id, clause.id, 'title', e.target.value)}
                              placeholder="Ex: Clause de solidarité, Interdiction d'animaux..."
                              className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[var(--text)] mb-1">
                              Contenu de la clause
                            </label>
                            <textarea
                              value={clause.content}
                              onChange={(e) => handleUpdateClause(template.id, clause.id, 'content', e.target.value)}
                              rows={4}
                              placeholder="Rédigez le texte de la clause..."
                              className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Exemples de clauses courantes */}
              <div className="mt-4 pt-4 border-t border-[var(--border)]">
                <p className="text-sm font-medium text-[var(--text)] mb-2">Exemples de clauses courantes :</p>
                <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                  <li>• <strong className="text-[var(--text)]">Clause de solidarité</strong> : En cas de colocation</li>
                  <li>• <strong className="text-[var(--text)]">Animaux</strong> : Autorisation ou interdiction</li>
                  <li>• <strong className="text-[var(--text)]">Travaux</strong> : Travaux autorisés par le locataire</li>
                  <li>• <strong className="text-[var(--text)]">Jardin/Extérieur</strong> : Entretien des espaces verts</li>
                  <li>• <strong className="text-[var(--text)]">Sous-location</strong> : Conditions de sous-location</li>
                </ul>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  const renderChargesTab = () => {
    const chargesTemplates = Object.values(templates).filter(t => t.category === 'charges')

    return (
      <div className="space-y-6">
        <Alert variant="info">
          La lettre de régularisation des charges est générée automatiquement avec le détail
          des provisions versées et des charges réelles.
        </Alert>

        {chargesTemplates.map(template => (
          <Card key={template.id} title={template.name}>
            <div className="space-y-4">
              <p className="text-sm text-[var(--text-secondary)]">{template.description}</p>
              <p className="text-sm text-[var(--text-muted)]">
                Accédez à la page <a href="/charges" className="text-[var(--color-electric-blue)] hover:underline transition-colors">Charges</a> pour
                générer une régularisation.
              </p>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  const renderLegalDocumentsTab = () => {
    const filteredDocuments = documentCategory === 'all'
      ? LEGAL_DOCUMENTS
      : LEGAL_DOCUMENTS.filter(d => d.category === documentCategory)

    // Mapping des couleurs vers le design system Bold Geometric (TYPE 1)
    const colorMapping = {
      emerald: { container: STAT_ICON_STYLES.emerald.container, icon: STAT_ICON_STYLES.emerald.icon },
      blue: { container: STAT_ICON_STYLES.blue.container, icon: STAT_ICON_STYLES.blue.icon },
      indigo: { container: STAT_ICON_STYLES.blue.container, icon: STAT_ICON_STYLES.blue.icon },
      red: { container: STAT_ICON_STYLES.coral.container, icon: STAT_ICON_STYLES.coral.icon },
      purple: { container: STAT_ICON_STYLES.purple.container, icon: STAT_ICON_STYLES.purple.icon },
      amber: { container: STAT_ICON_STYLES.amber.container, icon: STAT_ICON_STYLES.amber.icon },
      orange: { container: STAT_ICON_STYLES.amber.container, icon: STAT_ICON_STYLES.amber.icon },
      rose: { container: STAT_ICON_STYLES.coral.container, icon: STAT_ICON_STYLES.coral.icon },
      slate: { container: 'badge-bg-neutral', icon: 'text-[#64748B]' },
      cyan: { container: STAT_ICON_STYLES.blue.container, icon: STAT_ICON_STYLES.blue.icon },
      teal: { container: STAT_ICON_STYLES.emerald.container, icon: STAT_ICON_STYLES.emerald.icon }
    }

    return (
      <div className="space-y-6">
        <Alert variant="info">
          Générez des documents légaux conformes à la législation française (loi ALUR, loi du 6 juillet 1989).
          Sélectionnez un template puis choisissez le bail concerné pour générer le document.
        </Alert>

        {/* Filtres par catégorie */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setDocumentCategory('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              documentCategory === 'all'
                ? 'bg-[var(--color-electric-blue)] text-white'
                : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:bg-[var(--border)]'
            }`}
          >
            Tous
          </button>
          {Object.entries(DOCUMENT_CATEGORIES).map(([key, { label, color }]) => (
            <button
              key={key}
              onClick={() => setDocumentCategory(key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                documentCategory === key
                  ? 'bg-[var(--color-electric-blue)] text-white'
                  : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:bg-[var(--border)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Grille de documents */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map(document => {
            const IconComponent = document.icon
            const colorStyle = colorMapping[document.color] || colorMapping.blue
            return (
              <div
                key={document.id}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${colorStyle.container}`}>
                    <IconComponent className={`w-6 h-6 ${colorStyle.icon}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-[var(--text)] mb-1">
                      {document.name}
                    </h3>
                    <Badge variant="default" className="text-xs mb-2">
                      {DOCUMENT_CATEGORIES[document.category]?.label}
                    </Badge>
                    <p className="text-sm text-[var(--text-secondary)] mb-4">
                      {document.description}
                    </p>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => openGenerateModal(document)}
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Générer
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const tabs = [
    {
      id: 'legal',
      label: 'Documents légaux',
      icon: <Scale className="w-4 h-4" />,
      badge: LEGAL_DOCUMENTS.length.toString(),
      content: renderLegalDocumentsTab()
    },
    {
      id: 'relances',
      label: 'Relances',
      icon: <Mail className="w-4 h-4" />,
      content: renderRelancesTab()
    },
    {
      id: 'baux',
      label: 'Baux',
      icon: <FileText className="w-4 h-4" />,
      content: renderBauxTab()
    },
    {
      id: 'charges',
      label: 'Charges',
      icon: <Clock className="w-4 h-4" />,
      content: renderChargesTab()
    }
  ]

  return (
    <DashboardLayout title="Modèles de documents">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-display font-bold text-[var(--text)]">Modèles de documents</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Personnalisez les lettres de relance, les délais et autres modèles
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleResetAll}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Tout réinitialiser
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges}>
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </div>

        {hasChanges && (
          <Alert variant="warning">
            Vous avez des modifications non sauvegardées. N'oubliez pas de cliquer sur "Sauvegarder".
          </Alert>
        )}

        {/* Onglets */}
        <Tabs tabs={tabs} defaultTab="legal" />

        {/* Modal Aperçu */}
        <Modal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          title="Aperçu du document"
          size="lg"
        >
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm bg-[var(--surface-elevated)] text-[var(--text)] p-4 rounded-xl">
              {previewContent}
            </pre>
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="secondary" onClick={() => setShowPreview(false)}>
              Fermer
            </Button>
          </div>
        </Modal>

        {/* Modal Génération de document */}
        <Modal
          isOpen={showGenerateModal}
          onClose={() => {
            setShowGenerateModal(false)
            resetModalState()
          }}
          title={currentDocument ? `Générer : ${currentDocument.name}` : 'Générer un document'}
          size="lg"
        >
          {currentDocument && (
            <div className="space-y-4">
              <p className="text-[var(--text-secondary)] text-sm">
                {currentDocument.description}
              </p>

              {/* Sélection du bail */}
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">
                  Sélectionner un bail *
                </label>
                {loadingLeases ? (
                  <div className="flex items-center gap-2 text-[var(--text-muted)]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Chargement des baux...
                  </div>
                ) : leases.length === 0 ? (
                  <Alert variant="warning">
                    Aucun bail actif trouvé. Créez d'abord un bail pour générer des documents.
                  </Alert>
                ) : (
                  <select
                    value={selectedLease}
                    onChange={(e) => setSelectedLease(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
                  >
                    <option value="">-- Choisir un bail --</option>
                    {leases.map(lease => (
                      <option key={lease.id} value={lease.id}>
                        {lease.lot.properties_new.name} - {lease.lot.name} | {lease.tenant.tenant_groups?.name || `${lease.tenant.first_name} ${lease.tenant.last_name}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Pour quittance : sélection du paiement */}
              {currentDocument.id === 'quittance' && selectedLease && (
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-1">
                    Sélectionner un paiement *
                  </label>
                  {payments.length === 0 ? (
                    <Alert variant="warning">
                      Aucun paiement trouvé pour ce bail. Enregistrez d'abord un paiement.
                    </Alert>
                  ) : (
                    <select
                      value={selectedPayment}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
                    >
                      <option value="">-- Choisir un paiement --</option>
                      {payments.map(payment => (
                        <option key={payment.id} value={payment.id}>
                          {new Date(payment.due_date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} - {payment.amount.toFixed(2)} €
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Pour attestation loyer : sélection de l'année */}
              {currentDocument.id === 'attestation_loyer' && (
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-1">
                    Année *
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
                  >
                    {[...Array(5)].map((_, i) => {
                      const year = new Date().getFullYear() - i
                      return (
                        <option key={year} value={year}>{year}</option>
                      )
                    })}
                  </select>
                </div>
              )}

              {/* Pour lettre résiliation : sélection du motif */}
              {currentDocument.id === 'lettre_resiliation' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-1">
                      Motif du congé *
                    </label>
                    <select
                      value={resiliationMotif}
                      onChange={(e) => setResiliationMotif(e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
                    >
                      <option value="reprise">Reprise pour habiter</option>
                      <option value="vente">Vente du logement</option>
                      <option value="motif_legitime">Motif légitime et sérieux</option>
                    </select>
                    {resiliationMotif === 'vente' && (
                      <Alert variant="info" className="mt-2">
                        Pour un congé pour vente avec droit de préemption, utilisez plutôt le template "Congé pour vente".
                      </Alert>
                    )}
                  </div>

                  {/* Bénéficiaire pour congé reprise */}
                  {resiliationMotif === 'reprise' && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl space-y-3">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Bénéficiaire de la reprise</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-[var(--text-secondary)] mb-1">Nom du bénéficiaire</label>
                          <input
                            type="text"
                            value={resiliationBeneficiaire.nom}
                            onChange={(e) => setResiliationBeneficiaire({...resiliationBeneficiaire, nom: e.target.value})}
                            placeholder="Jean DUPONT"
                            className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[var(--text-secondary)] mb-1">Lien de parenté</label>
                          <select
                            value={resiliationBeneficiaire.lien}
                            onChange={(e) => setResiliationBeneficiaire({...resiliationBeneficiaire, lien: e.target.value})}
                            className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
                          >
                            <option value="bailleur">Le bailleur lui-même</option>
                            <option value="conjoint">Conjoint</option>
                            <option value="partenaire">Partenaire PACS</option>
                            <option value="concubin">Concubin(e)</option>
                            <option value="ascendant">Ascendant (parent, grand-parent)</option>
                            <option value="descendant">Descendant (enfant, petit-enfant)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Motif détaillé */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-1">
                      Précisions sur le motif (optionnel)
                    </label>
                    <textarea
                      value={resiliationMotifDetail}
                      onChange={(e) => setResiliationMotifDetail(e.target.value)}
                      rows={2}
                      placeholder="Détails complémentaires si nécessaire..."
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Pour mise en demeure : délai personnalisable */}
              {currentDocument.id === 'mise_en_demeure' && (
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-1">
                    Délai de paiement (jours)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="5"
                      max="30"
                      value={miseEnDemeureDelai}
                      onChange={(e) => setMiseEnDemeureDelai(parseInt(e.target.value) || 8)}
                      className="w-20 px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
                    />
                    <span className="text-sm text-[var(--text-muted)]">jours pour régulariser (minimum légal : 8 jours)</span>
                  </div>
                </div>
              )}

              {/* Pour congé vente : infos vente */}
              {currentDocument.id === 'conge_vente' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text)] mb-1">
                        Prix de vente (€) *
                      </label>
                      <input
                        type="number"
                        value={venteDetails.prixVente}
                        onChange={(e) => setVenteDetails({...venteDetails, prixVente: e.target.value})}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
                        placeholder="250000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text)] mb-1">
                        Frais d'agence (€)
                      </label>
                      <input
                        type="number"
                        value={venteDetails.fraisAgence}
                        onChange={(e) => setVenteDetails({...venteDetails, fraisAgence: e.target.value})}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
                        placeholder="10000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-1">
                      Honoraires à la charge de
                    </label>
                    <select
                      value={venteDetails.honorairesCharge}
                      onChange={(e) => setVenteDetails({...venteDetails, honorairesCharge: e.target.value})}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
                    >
                      <option value="vendeur">Vendeur</option>
                      <option value="acquereur">Acquéreur</option>
                      <option value="partage">Partagés</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text)] mb-1">
                        Mode de paiement
                      </label>
                      <input
                        type="text"
                        value={venteDetails.modePaiement}
                        onChange={(e) => setVenteDetails({...venteDetails, modePaiement: e.target.value})}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
                        placeholder="Comptant à la signature (par défaut)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text)] mb-1">
                        Délai de réalisation
                      </label>
                      <input
                        type="text"
                        value={venteDetails.delaiRealisation}
                        onChange={(e) => setVenteDetails({...venteDetails, delaiRealisation: e.target.value})}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
                        placeholder="4 mois après acceptation (par défaut)"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-1">
                      Conditions particulières
                    </label>
                    <textarea
                      value={venteDetails.conditionsParticulieres}
                      onChange={(e) => setVenteDetails({...venteDetails, conditionsParticulieres: e.target.value})}
                      rows={2}
                      placeholder="Conditions spécifiques si nécessaire..."
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Pour congé locataire */}
              {currentDocument.id === 'resiliation_locataire' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-1">
                      Motif du départ *
                    </label>
                    <select
                      value={resiliationLocataireMotif}
                      onChange={(e) => setResiliationLocataireMotif(e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
                    >
                      <option value="convenance">Convenance personnelle (préavis 3 mois)</option>
                      <option value="mutation">Mutation professionnelle (préavis 1 mois)</option>
                      <option value="perte_emploi">Perte d'emploi (préavis 1 mois)</option>
                      <option value="nouvel_emploi">Nouvel emploi après chômage (préavis 1 mois)</option>
                      <option value="sante">Raison de santé (préavis 1 mois)</option>
                      <option value="rsa">Bénéficiaire RSA ou AAH (préavis 1 mois)</option>
                      <option value="attribution_logement_social">Attribution logement social (préavis 1 mois)</option>
                      <option value="zone_tendue">Zone tendue (préavis 1 mois)</option>
                    </select>
                    {['mutation', 'perte_emploi', 'nouvel_emploi', 'sante', 'rsa', 'attribution_logement_social', 'zone_tendue'].includes(resiliationLocataireMotif) && (
                      <Alert variant="info" className="mt-2">
                        Ce motif permet un préavis réduit à 1 mois. Un justificatif pourra être demandé.
                      </Alert>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-1">
                      Date de départ souhaitée
                    </label>
                    <input
                      type="date"
                      value={resiliationLocataireDate}
                      onChange={(e) => setResiliationLocataireDate(e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
                    />
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Laissez vide pour calculer automatiquement selon le préavis applicable
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-1">
                      Précisions complémentaires
                    </label>
                    <textarea
                      value={resiliationLocataireDetail}
                      onChange={(e) => setResiliationLocataireDetail(e.target.value)}
                      rows={2}
                      placeholder="Détails sur le motif si nécessaire..."
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Pour régularisation des charges */}
              {currentDocument.id === 'regularisation_charges' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-1">
                      Année de régularisation *
                    </label>
                    <select
                      value={regularisationPeriode}
                      onChange={(e) => setRegularisationPeriode(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
                    >
                      {[...Array(5)].map((_, i) => {
                        const year = new Date().getFullYear() - 1 - i
                        return <option key={year} value={year}>{year}</option>
                      })}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text)] mb-1">
                        Provisions versées (€) *
                      </label>
                      <input
                        type="number"
                        value={regularisationProvisions}
                        onChange={(e) => setRegularisationProvisions(e.target.value)}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
                        placeholder="1800"
                      />
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Total des provisions sur l'année (charges mensuelles × 12)
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text)] mb-1">
                        Charges réelles (€) *
                      </label>
                      <input
                        type="number"
                        value={regularisationChargesReelles}
                        onChange={(e) => setRegularisationChargesReelles(e.target.value)}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
                        placeholder="1650"
                      />
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Total des charges réelles à répartir
                      </p>
                    </div>
                  </div>

                  {/* Solde calculé */}
                  {regularisationProvisions && regularisationChargesReelles && (
                    <div className={`p-3 rounded-xl ${
                      parseFloat(regularisationProvisions) >= parseFloat(regularisationChargesReelles)
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    }`}>
                      <p className={`text-sm font-medium ${
                        parseFloat(regularisationProvisions) >= parseFloat(regularisationChargesReelles)
                          ? 'text-green-800 dark:text-green-300'
                          : 'text-red-800 dark:text-red-300'
                      }`}>
                        Solde : {(parseFloat(regularisationProvisions) - parseFloat(regularisationChargesReelles)).toFixed(2)} €
                      </p>
                      <p className={`text-xs mt-1 ${
                        parseFloat(regularisationProvisions) >= parseFloat(regularisationChargesReelles)
                          ? 'text-green-700 dark:text-green-400'
                          : 'text-red-700 dark:text-red-400'
                      }`}>
                        {parseFloat(regularisationProvisions) >= parseFloat(regularisationChargesReelles)
                          ? '→ Remboursement au locataire'
                          : '→ Complément à demander au locataire'}
                      </p>
                    </div>
                  )}

                  {/* Détail des charges */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-2">
                      Détail des charges (optionnel)
                    </label>
                    <div className="space-y-2">
                      {regularisationDetail.map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={item.libelle}
                            onChange={(e) => {
                              const newDetail = [...regularisationDetail]
                              newDetail[index].libelle = e.target.value
                              setRegularisationDetail(newDetail)
                            }}
                            className="flex-1 px-3 py-2 text-sm border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
                            placeholder="Libellé"
                          />
                          <input
                            type="number"
                            value={item.montant}
                            onChange={(e) => {
                              const newDetail = [...regularisationDetail]
                              newDetail[index].montant = e.target.value
                              setRegularisationDetail(newDetail)
                            }}
                            className="w-24 px-3 py-2 text-sm border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
                            placeholder="€"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Pour accord d'échéancier */}
              {currentDocument.id === 'accord_echeancier' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-1">
                      Montant total de la dette (€) *
                    </label>
                    <input
                      type="number"
                      value={echeancierDette}
                      onChange={(e) => setEcheancierDette(e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
                      placeholder="2500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text)] mb-1">
                        Nombre de mensualités
                      </label>
                      <select
                        value={echeancierNombreMensualites}
                        onChange={(e) => setEcheancierNombreMensualites(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
                      >
                        {[3, 4, 5, 6, 8, 10, 12, 18, 24].map(n => (
                          <option key={n} value={n}>{n} mois</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text)] mb-1">
                        Date première échéance
                      </label>
                      <input
                        type="date"
                        value={echeancierDateDebut}
                        onChange={(e) => setEcheancierDateDebut(e.target.value)}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Calcul mensualité */}
                  {echeancierDette && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                        Mensualité calculée : {(parseFloat(echeancierDette) / echeancierNombreMensualites).toFixed(2)} €
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        ({echeancierNombreMensualites} versements de {(parseFloat(echeancierDette) / echeancierNombreMensualites).toFixed(2)} €)
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-1">
                      Détail de la dette (optionnel)
                    </label>
                    <textarea
                      value={echeancierDetteDetail}
                      onChange={(e) => setEcheancierDetteDetail(e.target.value)}
                      rows={2}
                      placeholder="Ex: Loyers janvier, février, mars 2026..."
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--color-electric-blue)] focus:border-transparent focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Boutons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowGenerateModal(false)
                    resetModalState()
                  }}
                >
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  onClick={handleGenerate}
                  disabled={generating || !selectedLease || (currentDocument.id === 'quittance' && !selectedPayment)}
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  )
}

export default DocumentTemplates
