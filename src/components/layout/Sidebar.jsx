import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Building,
  DoorOpen,
  ClipboardCheck,
  Users,
  UserPlus,
  FileSignature,
  ClipboardList,
  Wallet,
  Receipt,
  TrendingUp,
  Calculator,
  PiggyBank,
  FileText,
  FolderOpen,
  FileCheck,
  PenTool,
  Home,
  Settings,
  User,
  X
} from 'lucide-react'
import { useEntity } from '../../context/EntityContext'
import { useSidebarBadges } from '../../hooks/useSidebarBadges'

// Structure plate avec sections et badges dynamiques - Bold Geometric Design
// badgeKey correspond aux clés retournées par useSidebarBadges
const menuSections = [
  {
    id: 'main',
    items: [
      {
        label: 'Tableau de bord',
        path: '/dashboard',
        icon: LayoutDashboard,
        ready: true
      }
    ]
  },
  {
    id: 'patrimoine',
    sectionLabel: 'PATRIMOINE',
    items: [
      { label: 'Entités', path: '/entities', icon: Building2, ready: true },
      { label: 'Propriétés', path: '/properties', icon: Building, ready: true },
      { label: 'Lots', path: '/lots', icon: DoorOpen, ready: true, badgeKey: 'lotsVacants', badgeTitle: 'lots vacants à louer' },
      { label: 'Diagnostics', path: '/diagnostics', icon: ClipboardCheck, ready: true, badgeKey: 'diagnosticsExpiring', badgeTitle: 'diagnostics expirant bientôt' }
    ]
  },
  {
    id: 'locataires',
    sectionLabel: 'LOCATAIRES',
    items: [
      { label: 'Locataires', path: '/tenants', icon: Users, ready: true },
      { label: 'Candidatures', path: '/candidates', icon: UserPlus, ready: true, badgeKey: 'candidatesPending', badgeTitle: 'candidatures en attente' },
      { label: 'Baux', path: '/leases', icon: FileSignature, ready: true, badgeKey: 'leasesExpiring', badgeTitle: 'baux expirant dans 30 jours' },
      { label: 'États des lieux', path: '/inventories', icon: ClipboardList, ready: true }
    ]
  },
  {
    id: 'finances',
    sectionLabel: 'FINANCES',
    items: [
      { label: 'Paiements', path: '/payments', icon: Wallet, ready: true, badgeKey: 'unpaidPayments', badgeTitle: 'paiements en retard' },
      { label: 'Quittances', path: '/receipts', icon: Receipt, ready: false },
      { label: 'Indexation IRL', path: '/indexation', icon: TrendingUp, ready: true },
      { label: 'Charges', path: '/charges', icon: Calculator, ready: true },
      { label: 'Comptabilité', path: '/accounting', icon: PiggyBank, ready: false }
    ]
  },
  {
    id: 'documents',
    sectionLabel: 'DOCUMENTS',
    items: [
      { label: 'Mes documents', path: '/documents', icon: FolderOpen, ready: true },
      { label: 'Modèles légaux', path: '/templates', icon: FileCheck, ready: true },
      { label: 'Signatures', path: '/signatures', icon: PenTool, ready: false }
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
  const { entities, selectedEntity, setSelectedEntity } = useEntity()
  const { badges } = useSidebarBadges(selectedEntity)

  const isActive = (path) => location.pathname === path

  // Récupère le badge pour un item donné (0 = pas de badge affiché)
  const getBadgeCount = (item) => {
    if (!item.badgeKey) return 0
    return badges[item.badgeKey] || 0
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

      {/* Sidebar - Bold Geometric Design */}
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
            className="lg:hidden p-2 rounded-xl text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sélecteur d'entité */}
        <div className="p-4 border-b border-[var(--sidebar-border)]">
          <label className="block text-[10px] font-display font-semibold text-[var(--sidebar-text-muted)] mb-2 uppercase tracking-wider">
            Entité active
          </label>
          <select
            value={selectedEntity || 'all'}
            onChange={(e) => setSelectedEntity(e.target.value === 'all' ? null : e.target.value)}
            className="w-full px-3 py-2.5 bg-[var(--sidebar-hover)] border border-[var(--sidebar-border)] rounded-xl text-sm font-medium text-[var(--sidebar-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)] transition-all cursor-pointer"
          >
            <option value="all">Toutes les entités</option>
            {entities.map((entity) => (
              <option key={entity.id} value={entity.id}>
                {entity.name}
              </option>
            ))}
          </select>
        </div>

        {/* Navigation principale - Structure plate avec sections */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {menuSections.map((section) => (
            <div key={section.id} className="mb-4">
              {/* Label de section */}
              {section.sectionLabel && (
                <div className="px-3 mb-2">
                  <span className="text-[10px] font-display font-bold text-[var(--sidebar-text-muted)] uppercase tracking-wider">
                    {section.sectionLabel}
                  </span>
                </div>
              )}

              {/* Items de navigation */}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                      ${isActive(item.path)
                        ? 'bg-gradient-to-br from-[#0055FF] to-[#8B5CF6] text-white shadow-[0_0_30px_rgba(0,85,255,0.25)]'
                        : 'text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text)]'
                      }
                    `}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive(item.path) ? 'text-white' : 'opacity-70'}`} />
                    <span className="font-display flex-1">{item.label}</span>

                    {/* Badge de notification dynamique - Coral */}
                    {getBadgeCount(item) > 0 && (
                      <span
                        className={`
                          px-2 py-0.5 text-[11px] font-bold rounded-full
                          ${isActive(item.path)
                            ? 'bg-white/20 text-white'
                            : 'bg-[#FF6B4A] text-white'
                          }
                        `}
                        title={item.badgeTitle ? `${getBadgeCount(item)} ${item.badgeTitle}` : undefined}
                      >
                        {getBadgeCount(item)}
                      </span>
                    )}

                    {/* Badge "Bientôt" */}
                    {!item.ready && (
                      <span className="px-1.5 py-0.5 bg-[var(--sidebar-hover)] text-[var(--sidebar-text-muted)] text-[10px] font-semibold rounded uppercase tracking-wide">
                        Bientôt
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Menu du bas */}
        <div className="border-t border-[var(--sidebar-border)] p-3 space-y-1">
          {bottomMenu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${item.special
                  ? 'bg-gradient-to-r from-[var(--color-electric-blue)] to-[var(--color-purple)] text-white hover:shadow-glow-blue hover:brightness-110'
                  : isActive(item.path)
                    ? 'bg-gradient-to-br from-[#0055FF] to-[#8B5CF6] text-white shadow-[0_0_30px_rgba(0,85,255,0.25)]'
                    : 'text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text)]'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 flex-shrink-0 ${item.special || isActive(item.path) ? 'text-white' : 'opacity-70'}`} />
                <span className="font-display">{item.label}</span>
              </div>
              {!item.ready && !item.special && (
                <span className="px-1.5 py-0.5 bg-[var(--sidebar-hover)] text-[var(--sidebar-text-muted)] text-[10px] font-semibold rounded uppercase tracking-wide">
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
