/**
 * Design System "Bold Geometric" - Constantes centralisees
 *
 * Les classes de fond gradient sont définies dans index.css pour garantir
 * leur inclusion par Tailwind (pas de classes dynamiques)
 *
 * Reference: 05-bold-geometric-complete.html
 */

// ============================================================
// TYPE 1 : STAT CARD ICONS
// Pattern: gradient 15% opacity background + colored icon
// Usage: StatCard, DocumentCard, sections dashboard
// Classes CSS définies dans index.css: .stat-icon-{color}
// ============================================================

export const STAT_ICON_STYLES = {
  blue: {
    container: 'stat-icon-blue',
    icon: 'text-[#0055FF]',
    hoverBorder: 'group-hover:border-[#0055FF]',
    accentGradient: 'from-[#0055FF] to-[#8B5CF6]',
  },
  emerald: {
    container: 'stat-icon-emerald',
    icon: 'text-[#10B981]',
    hoverBorder: 'group-hover:border-[#10B981]',
    accentGradient: 'from-[#10B981] to-[#00D9A5]',
  },
  purple: {
    container: 'stat-icon-purple',
    icon: 'text-[#8B5CF6]',
    hoverBorder: 'group-hover:border-[#8B5CF6]',
    accentGradient: 'from-[#8B5CF6] to-[#C4B5FD]',
  },
  amber: {
    container: 'stat-icon-amber',
    icon: 'text-[#F59E0B]',
    hoverBorder: 'group-hover:border-[#F59E0B]',
    accentGradient: 'from-[#F59E0B] to-[#FBBF24]',
  },
  coral: {
    container: 'stat-icon-coral',
    icon: 'text-[#FF6B4A]',
    hoverBorder: 'group-hover:border-[#FF6B4A]',
    accentGradient: 'from-[#FF6B4A] to-[#FF8A6B]',
  },
  lime: {
    container: 'stat-icon-lime',
    icon: 'text-[#84CC16] dark:text-[#C6F135]',
    hoverBorder: 'group-hover:border-[#84CC16]',
    accentGradient: 'from-[#C6F135] to-[#00D9A5]',
  },
  // Legacy support
  red: {
    container: 'stat-icon-red',
    icon: 'text-[#EF4444]',
    hoverBorder: 'group-hover:border-[#EF4444]',
    accentGradient: 'from-[#EF4444] to-[#FF6B4A]',
  },
  indigo: {
    container: 'stat-icon-blue',
    icon: 'text-[#0055FF]',
    hoverBorder: 'group-hover:border-[#0055FF]',
    accentGradient: 'from-[#0055FF] to-[#8B5CF6]',
  },
}

// ============================================================
// TYPE 2 : PROPERTY ICONS (Featured)
// Pattern: solid gradient bg + white icon + glow shadow
// Usage: Property cards, featured items, avatars
// Classes CSS définies dans index.css: .property-icon-{color}
// ============================================================

export const PROPERTY_ICON_STYLES = {
  blue: {
    container: 'property-icon-blue',
    icon: 'text-white',
    shadow: 'shadow-[0_0_30px_rgba(0,85,255,0.25)]',
  },
  emerald: {
    container: 'property-icon-emerald',
    icon: 'text-white',
    shadow: 'shadow-[0_0_30px_rgba(16,185,129,0.25)]',
  },
  purple: {
    container: 'property-icon-purple',
    icon: 'text-white',
    shadow: 'shadow-[0_0_30px_rgba(139,92,246,0.25)]',
  },
  amber: {
    container: 'property-icon-amber',
    icon: 'text-white',
    shadow: 'shadow-[0_0_30px_rgba(245,158,11,0.25)]',
  },
  coral: {
    container: 'property-icon-coral',
    icon: 'text-white',
    shadow: 'shadow-[0_0_30px_rgba(255,107,74,0.25)]',
  },
  lime: {
    container: 'property-icon-lime',
    icon: 'text-[#0A0A0F]', // Dark text on lime for contrast
    shadow: 'shadow-[0_0_30px_rgba(198,241,53,0.25)]',
  },
}

// ============================================================
// TYPE 3 : BADGES
// Pattern: solid bg avec rgba opacity + colored text
// Usage: Status badges, counts, tags
// Classes CSS définies dans index.css: .badge-bg-{color}
// ============================================================

export const BADGE_STYLES = {
  blue: {
    container: 'badge-bg-blue',
    text: 'text-[#0055FF]',
  },
  emerald: {
    container: 'badge-bg-emerald',
    text: 'text-[#10B981]',
  },
  success: {
    container: 'badge-bg-emerald',
    text: 'text-[#10B981]',
  },
  purple: {
    container: 'badge-bg-purple',
    text: 'text-[#8B5CF6]',
  },
  amber: {
    container: 'badge-bg-amber',
    text: 'text-[#F59E0B]',
  },
  warning: {
    container: 'badge-bg-amber',
    text: 'text-[#F59E0B]',
  },
  coral: {
    container: 'badge-bg-coral',
    text: 'text-[#FF6B4A]',
  },
  danger: {
    container: 'badge-bg-red',
    text: 'text-[#EF4444]',
  },
  lime: {
    container: 'badge-bg-lime',
    text: 'text-[#84CC16]',
  },
  info: {
    container: 'badge-bg-blue',
    text: 'text-[#0055FF]',
  },
  // Solid badges (for notifications, alert counts)
  solidCoral: {
    container: 'property-icon-coral',
    text: 'text-white',
  },
  solidBlue: {
    container: 'property-icon-blue',
    text: 'text-white',
  },
  solidEmerald: {
    container: 'bg-[#10B981]',
    text: 'text-white',
  },
}

// ============================================================
// TYPE 4 : ALERT DOTS
// Pattern: solid bg + glow + optional pulse animation
// Usage: Notification dots, status indicators
// ============================================================

export const ALERT_DOT_STYLES = {
  urgent: {
    base: 'bg-[#FF6B4A]',
    glow: 'shadow-[0_0_10px_rgba(255,107,74,0.5)]',
    pulse: 'animate-pulse',
  },
  warning: {
    base: 'bg-[#F59E0B]',
    glow: 'shadow-[0_0_10px_rgba(245,158,11,0.4)]',
    pulse: '',
  },
  info: {
    base: 'bg-[#0055FF]',
    glow: 'shadow-[0_0_10px_rgba(0,85,255,0.4)]',
    pulse: '',
  },
  success: {
    base: 'bg-[#10B981]',
    glow: 'shadow-[0_0_10px_rgba(16,185,129,0.4)]',
    pulse: '',
  },
}

// ============================================================
// PROGRESS BARS
// Pattern: gradient horizontal (90deg) pour le remplissage
// Classes CSS définies dans index.css: .progress-fill-{color}
// ============================================================

export const PROGRESS_STYLES = {
  blue: {
    track: 'bg-[var(--border)]',
    fill: 'progress-fill-blue',
  },
  emerald: {
    track: 'bg-[var(--border)]',
    fill: 'progress-fill-emerald',
  },
  coral: {
    track: 'bg-[var(--border)]',
    fill: 'progress-fill-coral',
  },
  amber: {
    track: 'bg-[var(--border)]',
    fill: 'progress-fill-amber',
  },
  purple: {
    track: 'bg-[var(--border)]',
    fill: 'progress-fill-purple',
  },
  lime: {
    track: 'bg-[var(--border)]',
    fill: 'progress-fill-lime',
  },
}

// ============================================================
// CHART STYLES
// Pattern: gradient vertical (to top) pour les barres
// ============================================================

export const CHART_STYLES = {
  bar: {
    default: 'property-icon-blue',
    hover: 'hover:brightness-[1.2] hover:scale-y-[1.05]',
  },
  colors: {
    primary: ['#0055FF', '#8B5CF6', '#10B981', '#F59E0B', '#FF6B4A'],
    gradients: {
      blue: 'linear-gradient(to top, #0055FF, #8B5CF6)',
      emerald: 'linear-gradient(to top, #10B981, #00D9A5)',
      coral: 'linear-gradient(to top, #FF6B4A, #FF8A6B)',
    },
  },
}

// ============================================================
// TREND INDICATORS
// Pattern: fond solide avec couleur semantique
// ============================================================

export const TREND_STYLES = {
  up: {
    container: 'badge-bg-emerald',
    text: 'text-[#10B981]',
  },
  positive: {
    container: 'badge-bg-emerald',
    text: 'text-[#10B981]',
  },
  down: {
    container: 'badge-bg-red',
    text: 'text-[#EF4444]',
  },
  negative: {
    container: 'badge-bg-red',
    text: 'text-[#EF4444]',
  },
  neutral: {
    container: 'badge-bg-neutral',
    text: 'text-[#64748B]',
  },
}

// ============================================================
// GLOW SHADOWS
// ============================================================

export const GLOW_SHADOWS = {
  blue: 'shadow-[0_0_30px_rgba(0,85,255,0.25)]',
  purple: 'shadow-[0_0_30px_rgba(139,92,246,0.25)]',
  coral: 'shadow-[0_0_30px_rgba(255,107,74,0.25)]',
  emerald: 'shadow-[0_0_30px_rgba(16,185,129,0.25)]',
  lime: 'shadow-[0_0_30px_rgba(198,241,53,0.25)]',
}

// ============================================================
// CARD HOVER EFFECTS
// ============================================================

export const CARD_HOVER = {
  base: 'transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.12)]',
  borderBlue: 'hover:border-[#0055FF]',
  borderPurple: 'hover:border-[#8B5CF6]',
  borderCoral: 'hover:border-[#FF6B4A]',
  borderEmerald: 'hover:border-[#10B981]',
  borderLime: 'hover:border-[#C6F135]',
}

export default {
  STAT_ICON_STYLES,
  PROPERTY_ICON_STYLES,
  BADGE_STYLES,
  ALERT_DOT_STYLES,
  PROGRESS_STYLES,
  CHART_STYLES,
  TREND_STYLES,
  GLOW_SHADOWS,
  CARD_HOVER,
}
