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
  Menu
} from 'lucide-react'
import { useEntity } from '../../context/EntityContext'

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
      { label: 'Diagnostics', path: '/diagnostics', ready: false }
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
      { label: 'États des lieux', path: '/inspections', ready: false }
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
      { label: 'Charges', path: '/charges', ready: false },
      { label: 'Comptabilité', path: '/accounting', ready: false }
    ]
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    isCategory: true,
    children: [
      { label: 'Mes documents', path: '/documents', ready: false },
      { label: 'Modèles légaux', path: '/templates', ready: false },
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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-slate-900 text-slate-300 z-50
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          flex flex-col
        `}
      >
        {/* Header avec logo */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Building2 className="w-8 h-8 text-blue-500" />
            <span className="text-xl font-bold text-white">LocaPro</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Sélecteur d'entité */}
        <div className="p-4 border-b border-slate-800">
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Filtrer par entité
          </label>
          <select
            value={selectedEntity || 'all'}
            onChange={(e) => setSelectedEntity(e.target.value === 'all' ? null : e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {menuStructure.map((item) => (
            <div key={item.id} className="mb-1">
              {!item.isCategory ? (
                // Item simple (Dashboard)
                <Link
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                    ${isActive(item.path)
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ) : (
                // Catégorie avec sous-menus
                <div>
                  <button
                    onClick={() => toggleCategory(item.id)}
                    className={`
                      w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors
                      ${isParentActive(item)
                        ? 'text-blue-400'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {openCategories[item.id] ? (
                      <ChevronDown className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 flex-shrink-0" />
                    )}
                  </button>

                  {/* Sous-menus */}
                  {openCategories[item.id] && (
                    <div className="mt-1 ml-8 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={`
                            flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors
                            ${isActive(child.path)
                              ? 'bg-blue-600/20 text-blue-400'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            }
                          `}
                        >
                          <span>{child.label}</span>
                          {!child.ready && (
                            <span className="px-2 py-0.5 bg-slate-700 text-slate-400 text-xs rounded">
                              Bientôt
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Menu du bas */}
        <div className="border-t border-slate-800 p-2">
          {bottomMenu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors mb-1
                ${item.special
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600'
                  : isActive(item.path)
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </div>
              {!item.ready && !item.special && (
                <span className="px-2 py-0.5 bg-slate-700 text-slate-400 text-xs rounded">
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
