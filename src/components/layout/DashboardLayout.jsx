import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, User, LogOut, Settings, Bell, Home, ChevronRight, Sun, Moon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { supabase } from '../../lib/supabase'
import Sidebar from './Sidebar'

function DashboardLayout({
  children,
  title = 'Dashboard',
  subtitle,
  breadcrumb,
  actions
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const userMenuRef = useRef(null)
  const isDark = theme === 'dark'

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Header - Bold Geometric Design */}
        <header className="sticky top-0 z-30 bg-[var(--surface)]/80 backdrop-blur-xl border-b border-[var(--border)]">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            {/* Top row: Mobile menu + notifications + user */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Mobile menu button */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] lg:hidden transition-all duration-200"
                >
                  <Menu className="w-5 h-5" />
                </button>

                {/* Breadcrumb - Support string ou array */}
                {breadcrumb && (
                  <nav className="hidden sm:flex items-center text-sm text-[var(--text-muted)]" aria-label="Breadcrumb">
                    {/* Icône Home */}
                    <Link
                      to="/dashboard"
                      className="text-[var(--text-muted)] hover:text-[var(--color-electric-blue)] transition-colors"
                      aria-label="Accueil"
                    >
                      <Home className="w-4 h-4" />
                    </Link>

                    {/* Support format string (legacy) */}
                    {typeof breadcrumb === 'string' && breadcrumb !== 'Dashboard' && (
                      <>
                        <ChevronRight className="w-4 h-4 mx-1.5 text-[var(--text-muted)]" />
                        <span className="text-[var(--text)] font-medium">{breadcrumb}</span>
                      </>
                    )}

                    {/* Support format array [{label, href}] */}
                    {Array.isArray(breadcrumb) && breadcrumb.map((item, index) => {
                      const isLast = index === breadcrumb.length - 1
                      return (
                        <div key={index} className="flex items-center">
                          <ChevronRight className="w-4 h-4 mx-1.5 text-[var(--text-muted)]" />
                          {isLast ? (
                            <span className="text-[var(--text)] font-medium font-display">{item.label}</span>
                          ) : (
                            <Link
                              to={item.href}
                              className="text-[var(--text-muted)] hover:text-[var(--color-electric-blue)] transition-colors"
                            >
                              {item.label}
                            </Link>
                          )}
                        </div>
                      )
                    })}
                  </nav>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
                  title={isDark ? 'Mode clair' : 'Mode sombre'}
                  className="
                    relative p-2.5 rounded-xl
                    text-[var(--text-secondary)]
                    hover:text-[var(--color-electric-blue)]
                    hover:bg-[var(--surface-hover)]
                    transition-all duration-200
                  "
                >
                  {isDark ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>

                {/* Notifications */}
                <button className="relative p-2.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition-all duration-200">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-vivid-coral)] rounded-full" />
                </button>

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 pl-1.5 pr-3 hover:bg-[var(--surface-hover)] rounded-xl transition-all duration-200"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-[var(--color-electric-blue)] to-[var(--color-purple)] rounded-xl flex items-center justify-center text-white font-display font-semibold text-sm shadow-sm">
                      {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <svg
                      className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[var(--surface)] rounded-2xl shadow-lg border border-[var(--border)] overflow-hidden z-50 animate-scale-in">
                      <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-elevated)]">
                        <p className="text-xs text-[var(--text-muted)] font-display uppercase tracking-wider">Connecté en tant que</p>
                        <p className="text-sm font-medium text-[var(--text)] truncate mt-0.5">{user?.email}</p>
                      </div>
                      <div className="p-2">
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] rounded-xl transition-all duration-200"
                        >
                          <User className="w-4 h-4" />
                          Mon profil
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] rounded-xl transition-all duration-200"
                        >
                          <Settings className="w-4 h-4" />
                          Paramètres
                        </Link>
                      </div>
                      <div className="p-2 border-t border-[var(--border)]">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false)
                            handleLogout()
                          }}
                          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-[var(--color-vivid-coral)] hover:bg-[var(--color-vivid-coral)]/10 rounded-xl transition-all duration-200"
                        >
                          <LogOut className="w-4 h-4" />
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Page Title Row */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-display font-bold text-[var(--text)]">{title}</h1>
                {subtitle && (
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{subtitle}</p>
                )}
              </div>
              {actions && (
                <div className="flex items-center gap-3">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div key={location.pathname} className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
