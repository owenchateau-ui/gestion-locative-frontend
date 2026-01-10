import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Users,
  Wallet,
  FileText,
  Wrench,
  MessageSquare,
  Home,
  Settings,
  User,
  ChevronDown,
  ChevronRight,
  X,
  Sun,
  Moon
} from 'lucide-react'
import { useEntity } from '../../context/EntityContext'
import { useTheme } from '../../context/ThemeContext'

const menuStructure = [
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    icon: LayoutDashboard,
    path: '/dashboard',
    isCategory: false
  },
  {
    id: 'patrimoine',
    label: 'Patrimoine',
    icon: Building2,
    isCategory: true,
    children: [
      { label: 'Entités juridiques', path: '/entities', ready: true },
      { label: 'Propriétés', path: '/properties', ready: true },
      { label: 'Lots', path: '/lots', ready: true },
      { label: 'Diagnostics', path: '/diagnostics', ready: true }
    ]
  },
  {
    id: 'locataires',
    label: 'Locataires',
    icon: Users,
    isCategory: true,
    children: [
      { label: 'Tous les locataires', path: '/tenants', ready: true },
      { label: 'Candidatures', path: '/candidates', ready: true },
      { label: 'Baux', path: '/leases', ready: true },
      { label: 'États des lieux', path: '/inventories', ready: true }
    ]
  },
  {
    id: 'finances',
    label: 'Finances',
    icon: Wallet,
    isCategory: true,
    children: [
      { label: 'Paiements', path: '/payments', ready: true },
      { label: 'Quittances', path: '/receipts', ready: false },
      { label: 'Indexation IRL', path: '/indexation', ready: true },
      { label: 'Charges', path: '/charges', ready: true },
      { label: 'Comptabilité', path: '/accounting', ready: false }
    ]
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    isCategory: true,
    children: [
      { label: 'Mes documents', path: '/documents', ready: true },
      { label: 'Modèles légaux', path: '/templates', ready: true },
      { label: 'Signatures', path: '/signatures', ready: false }
    ]
  },
  {
    id: 'interventions',
    label: 'Interventions',
    icon: Wrench,
    isCategory: true,
    children: [
      { label: 'Signalements', path: '/incidents', ready: false },
      { label: 'Travaux', path: '/works', ready: false },
      { label: 'Carnet entretien', path: '/maintenance', ready: false },
      { label: 'Prestataires', path: '/contractors', ready: false }
    ]
  },
  {
    id: 'communication',
    label: 'Communication',
    icon: MessageSquare,
    isCategory: true,
    children: [
      { label: 'Messagerie', path: '/messages', ready: false },
      { label: 'Courriers auto', path: '/mailings', ready: false },
      { label: 'Notifications', path: '/notifications', ready: false }
    ]
  }
]

const bottomMenu = [
  { label: 'Portail Locataire', path: '/tenant-portal', icon: Home, ready: false, special: true },
  { label: 'Paramètres', path: '/settings', icon: Settings, ready: false },
  { label: 'Mon profil', path: '/profile', icon: User, ready: true }
]

function Sidebar({ isOpen, onClose }) {
  const location = useLocation()
  const [openCategories, setOpenCategories] = useState({})
  const { entities, selectedEntity, setSelectedEntity } = useEntity()
  const { theme, toggleTheme } = useTheme()

  // Charger l'état des catégories depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebarOpenCategories')
    if (saved) {
      setOpenCategories(JSON.parse(saved))
    } else {
      // Par défaut, ouvrir toutes les catégories
      const initial = {}
      menuStructure.forEach(item => {
        if (item.isCategory) {
          initial[item.id] = true
        }
      })
      setOpenCategories(initial)
    }
  }, [])

  // Sauvegarder l'état dans localStorage
  useEffect(() => {
    localStorage.setItem('sidebarOpenCategories', JSON.stringify(openCategories))
  }, [openCategories])

  // Ouvrir automatiquement la catégorie parent si on est sur une de ses sous-pages
  useEffect(() => {
    menuStructure.forEach(item => {
      if (item.isCategory && item.children) {
        const hasActiveChild = item.children.some(child => location.pathname === child.path)
        if (hasActiveChild && !openCategories[item.id]) {
          setOpenCategories(prev => ({ ...prev, [item.id]: true }))
        }
      }
    })
  }, [location.pathname])

  const toggleCategory = (categoryId) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  const isActive = (path) => location.pathname === path

  const isParentActive = (item) => {
    if (!item.isCategory || !item.children) return false
    return item.children.some(child => location.pathname === child.path)
  }

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-72
          bg-[var(--sidebar-bg)]
          border-r border-[var(--sidebar-border)]
          z-50
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          flex flex-col
        `}
      >
        {/* Header avec logo */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--sidebar-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-electric-blue)] to-[var(--color-purple)] flex items-center justify-center shadow-glow-blue">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-display font-bold text-[var(--sidebar-text)]">LocaPro</span>
              <span className="block text-xs text-[var(--sidebar-text-muted)]">Gestion Locative</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sélecteur d'entité */}
        <div className="p-4 border-b border-[var(--sidebar-border)]">
          <label className="block text-xs font-display font-medium text-[var(--sidebar-text-muted)] mb-2 uppercase tracking-wider">
            Entité active
          </label>
          <select
            value={selectedEntity || 'all'}
            onChange={(e) => setSelectedEntity(e.target.value === 'all' ? null : e.target.value)}
            className="w-full px-3 py-2.5 bg-[var(--sidebar-hover)] border border-[var(--sidebar-border)] rounded-xl text-sm text-[var(--sidebar-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] transition-all cursor-pointer"
          >
            <option value="all">Toutes les entités</option>
            {entities.map((entity) => (
              <option key={entity.id} value={entity.id}>
                {entity.name}
              </option>
            ))}
          </select>
        </div>

        {/* Navigation principale */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {menuStructure.map((item) => (
            <div key={item.id} className="mb-1">
              {!item.isCategory ? (
                // Item simple (Dashboard)
                <Link
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                    ${isActive(item.path)
                      ? 'bg-[var(--color-electric-blue)]/10 text-[var(--color-electric-blue)] shadow-sm'
                      : 'text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text)]'
                    }
                  `}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive(item.path) ? '' : 'opacity-70'}`} />
                  <span className="font-medium font-display">{item.label}</span>
                </Link>
              ) : (
                // Catégorie avec sous-menus
                <div>
                  <button
                    onClick={() => toggleCategory(item.id)}
                    className={`
                      w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                      ${isParentActive(item)
                        ? 'text-[var(--color-electric-blue)]'
                        : 'text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text)]'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 flex-shrink-0 ${isParentActive(item) ? '' : 'opacity-70'}`} />
                      <span className="font-medium font-display">{item.label}</span>
                    </div>
                    <div className={`transform transition-transform duration-200 ${openCategories[item.id] ? 'rotate-180' : ''}`}>
                      <ChevronDown className="w-4 h-4 flex-shrink-0" />
                    </div>
                  </button>

                  {/* Sous-menus avec animation */}
                  <div
                    className={`
                      overflow-hidden transition-all duration-200
                      ${openCategories[item.id] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                    `}
                  >
                    <div className="mt-1 ml-4 pl-4 border-l-2 border-[var(--sidebar-border)] space-y-0.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={`
                            flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200
                            ${isActive(child.path)
                              ? 'bg-[var(--color-electric-blue)]/10 text-[var(--color-electric-blue)] font-medium'
                              : 'text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text)]'
                            }
                          `}
                        >
                          <span>{child.label}</span>
                          {!child.ready && (
                            <span className="px-1.5 py-0.5 bg-[var(--sidebar-hover)] text-[var(--sidebar-text-muted)] text-[10px] font-medium rounded uppercase tracking-wide">
                              Bientôt
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Menu du bas */}
        <div className="border-t border-[var(--sidebar-border)] p-3 space-y-1">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text)] transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 opacity-70" />
              ) : (
                <Moon className="w-5 h-5 opacity-70" />
              )}
              <span className="font-medium font-display">
                {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
              </span>
            </div>
            <div className={`
              w-10 h-6 rounded-full p-0.5 transition-colors duration-200
              ${theme === 'dark' ? 'bg-[var(--color-electric-blue)]' : 'bg-[var(--sidebar-border)]'}
            `}>
              <div className={`
                w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-200
                ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}
              `} />
            </div>
          </button>

          {bottomMenu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                ${item.special
                  ? 'bg-gradient-to-r from-[var(--color-electric-blue)] to-[var(--color-purple)] text-white hover:shadow-glow-blue hover:brightness-110'
                  : isActive(item.path)
                    ? 'bg-[var(--color-electric-blue)]/10 text-[var(--color-electric-blue)]'
                    : 'text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text)]'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 flex-shrink-0 ${item.special ? '' : 'opacity-70'}`} />
                <span className="font-medium font-display">{item.label}</span>
              </div>
              {!item.ready && !item.special && (
                <span className="px-1.5 py-0.5 bg-[var(--sidebar-hover)] text-[var(--sidebar-text-muted)] text-[10px] font-medium rounded uppercase tracking-wide">
                  Bientôt
                </span>
              )}
            </Link>
          ))}
        </div>
      </aside>
    </>
  )
}

export default Sidebar
