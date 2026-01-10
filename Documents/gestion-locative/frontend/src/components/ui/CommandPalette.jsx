import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home,
  Building2,
  DoorOpen,
  Users,
  FileText,
  CreditCard,
  TrendingUp,
  Plus,
  Search,
  Command,
  ArrowRight
} from 'lucide-react'

/**
 * CommandPalette - Recherche globale et navigation rapide (Cmd+K)
 *
 * Fonctionnalités :
 * - Raccourci Cmd+K / Ctrl+K pour ouvrir
 * - Navigation rapide (G D = Dashboard, G P = Paiements, etc.)
 * - Actions rapides (N P = Nouveau paiement, N B = Nouveau bail)
 * - Recherche dynamique
 */

const CommandPalette = () => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  // Commandes de navigation
  const navigationCommands = [
    {
      id: 'nav-dashboard',
      label: 'Dashboard',
      shortcut: 'G D',
      icon: Home,
      action: () => navigate('/dashboard'),
      keywords: ['accueil', 'tableau de bord', 'home']
    },
    {
      id: 'nav-entities',
      label: 'Entités',
      shortcut: 'G E',
      icon: Building2,
      action: () => navigate('/entities'),
      keywords: ['sci', 'societe', 'juridique']
    },
    {
      id: 'nav-properties',
      label: 'Propriétés',
      shortcut: 'G R',
      icon: Building2,
      action: () => navigate('/properties'),
      keywords: ['immeubles', 'biens', 'batiments']
    },
    {
      id: 'nav-lots',
      label: 'Lots',
      shortcut: 'G L',
      icon: DoorOpen,
      action: () => navigate('/lots'),
      keywords: ['appartements', 'logements', 'unites']
    },
    {
      id: 'nav-tenants',
      label: 'Locataires',
      shortcut: 'G T',
      icon: Users,
      action: () => navigate('/tenants'),
      keywords: ['occupants', 'residents']
    },
    {
      id: 'nav-leases',
      label: 'Baux',
      shortcut: 'G B',
      icon: FileText,
      action: () => navigate('/leases'),
      keywords: ['contrats', 'locations']
    },
    {
      id: 'nav-payments',
      label: 'Paiements',
      shortcut: 'G P',
      icon: CreditCard,
      action: () => navigate('/payments'),
      keywords: ['loyers', 'quittances', 'factures']
    },
    {
      id: 'nav-indexation',
      label: 'Indexation IRL',
      shortcut: 'G I',
      icon: TrendingUp,
      action: () => navigate('/indexation'),
      keywords: ['revision', 'loyer', 'augmentation']
    },
  ]

  // Commandes d'actions rapides
  const actionCommands = [
    {
      id: 'action-new-payment',
      label: 'Nouveau paiement',
      shortcut: 'N P',
      icon: Plus,
      action: () => navigate('/payments/new'),
      keywords: ['enregistrer', 'loyer', 'quittance']
    },
    {
      id: 'action-new-lease',
      label: 'Nouveau bail',
      shortcut: 'N B',
      icon: Plus,
      action: () => navigate('/leases/new'),
      keywords: ['contrat', 'location', 'creer']
    },
    {
      id: 'action-new-tenant',
      label: 'Nouveau locataire',
      shortcut: 'N T',
      icon: Plus,
      action: () => navigate('/tenants/new'),
      keywords: ['ajouter', 'occupant']
    },
    {
      id: 'action-new-lot',
      label: 'Nouveau lot',
      shortcut: 'N L',
      icon: Plus,
      action: () => navigate('/lots/new'),
      keywords: ['appartement', 'ajouter']
    },
    {
      id: 'action-new-property',
      label: 'Nouvelle propriété',
      shortcut: 'N R',
      icon: Plus,
      action: () => navigate('/properties/new'),
      keywords: ['immeuble', 'ajouter']
    },
    {
      id: 'action-new-entity',
      label: 'Nouvelle entité',
      shortcut: 'N E',
      icon: Plus,
      action: () => navigate('/entities/new'),
      keywords: ['sci', 'societe', 'ajouter']
    },
  ]

  // Toutes les commandes
  const allCommands = [
    { category: 'Navigation', items: navigationCommands },
    { category: 'Actions rapides', items: actionCommands },
  ]

  // Filtrer les commandes selon la recherche
  const filteredCommands = query
    ? allCommands.map(category => ({
        ...category,
        items: category.items.filter(item =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.keywords.some(kw => kw.toLowerCase().includes(query.toLowerCase()))
        )
      })).filter(category => category.items.length > 0)
    : allCommands

  // Liste plate pour navigation clavier
  const flatCommands = filteredCommands.flatMap(cat => cat.items)

  // Ouvrir/Fermer avec Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K ou Ctrl+K pour ouvrir
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
        setQuery('')
        setSelectedIndex(0)
      }

      // Escape pour fermer
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        setQuery('')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Raccourcis de navigation (G + lettre)
  useEffect(() => {
    if (isOpen) return // Désactiver quand palette ouverte

    let pendingKey = null
    let timeout = null

    const handleKeyDown = (e) => {
      // Ignorer si on est dans un input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return
      }

      const key = e.key.toUpperCase()

      // Si on a une touche en attente
      if (pendingKey) {
        clearTimeout(timeout)
        const combo = `${pendingKey} ${key}`

        // Chercher la commande correspondante
        const command = [...navigationCommands, ...actionCommands].find(
          cmd => cmd.shortcut === combo
        )

        if (command) {
          e.preventDefault()
          command.action()
        }

        pendingKey = null
        return
      }

      // Première touche (G ou N)
      if (key === 'G' || key === 'N') {
        pendingKey = key
        timeout = setTimeout(() => {
          pendingKey = null
        }, 500) // 500ms pour taper la deuxième touche
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (timeout) clearTimeout(timeout)
    }
  }, [isOpen, navigate])

  // Focus input quand ouvert
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Navigation clavier dans la liste
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < flatCommands.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : flatCommands.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (flatCommands[selectedIndex]) {
          flatCommands[selectedIndex].action()
          setIsOpen(false)
          setQuery('')
        }
        break
    }
  }, [isOpen, flatCommands, selectedIndex])

  // Scroll vers l'élément sélectionné
  useEffect(() => {
    if (listRef.current && flatCommands[selectedIndex]) {
      const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`)
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex, flatCommands])

  // Réinitialiser l'index quand la query change
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleSelect = (command) => {
    command.action()
    setIsOpen(false)
    setQuery('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-start justify-center pt-[15vh] px-4">
        <div
          className="relative w-full max-w-xl bg-[var(--surface)] rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden animate-scale-in"
          onKeyDown={handleKeyDown}
        >
          {/* Input de recherche */}
          <div className="flex items-center px-4 border-b border-[var(--border)]">
            <Search className="w-5 h-5 text-[var(--text-muted)]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher ou naviguer..."
              className="w-full px-3 py-4 bg-transparent text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none"
            />
            <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs text-[var(--text-muted)] bg-[var(--surface-elevated)] rounded-lg">
              <Command className="w-3 h-3" />
              K
            </kbd>
          </div>

          {/* Liste des commandes */}
          <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
            {filteredCommands.length === 0 ? (
              <div className="px-4 py-8 text-center text-[var(--text-muted)]">
                Aucun résultat pour "{query}"
              </div>
            ) : (
              filteredCommands.map((category) => (
                <div key={category.category} className="mb-2">
                  <div className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    {category.category}
                  </div>
                  {category.items.map((command) => {
                    const globalIndex = flatCommands.findIndex(c => c.id === command.id)
                    const isSelected = globalIndex === selectedIndex
                    const Icon = command.icon

                    return (
                      <button
                        key={command.id}
                        data-index={globalIndex}
                        onClick={() => handleSelect(command)}
                        className={`
                          w-full flex items-center justify-between px-3 py-2.5 rounded-xl
                          transition-colors cursor-pointer group
                          ${isSelected
                            ? 'bg-[var(--color-electric-blue)]/10 text-[var(--color-electric-blue)]'
                            : 'hover:bg-[var(--surface-elevated)] text-[var(--text-secondary)]'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-[var(--color-electric-blue)]' : 'text-[var(--text-muted)]'}`} />
                          <span className="font-medium">{command.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <kbd className={`
                            px-2 py-0.5 text-xs rounded-lg
                            ${isSelected
                              ? 'bg-[var(--color-electric-blue)]/20 text-[var(--color-electric-blue)]'
                              : 'bg-[var(--surface-elevated)] text-[var(--text-muted)]'
                            }
                          `}>
                            {command.shortcut}
                          </kbd>
                          <ArrowRight className={`
                            w-4 h-4 opacity-0 transition-opacity
                            ${isSelected ? 'opacity-100 text-[var(--color-electric-blue)]' : 'group-hover:opacity-50'}
                          `} />
                        </div>
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer avec indications */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--border)] bg-[var(--surface-elevated)] text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-[var(--border)] rounded-lg">↑↓</kbd>
                naviguer
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-[var(--border)] rounded-lg">↵</kbd>
                sélectionner
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-[var(--border)] rounded-lg">esc</kbd>
                fermer
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[var(--text-muted)]">Raccourcis :</span>
              <span><kbd className="px-1 bg-[var(--border)] rounded-lg">G</kbd> + lettre = aller</span>
              <span><kbd className="px-1 bg-[var(--border)] rounded-lg">N</kbd> + lettre = nouveau</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommandPalette
