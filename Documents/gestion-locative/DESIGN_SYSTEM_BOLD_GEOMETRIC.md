# Design System "Bold Geometric"

> Documentation complète du design system utilisé dans l'application Gestion Locative
> Version 1.0 - 10 Janvier 2026

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Couleurs](#2-couleurs)
3. [Typographie](#3-typographie)
4. [Espacements](#4-espacements)
5. [Border Radius](#5-border-radius)
6. [Ombres et Effets](#6-ombres-et-effets)
7. [Animations](#7-animations)
8. [Composants UI](#8-composants-ui)
9. [Layout](#9-layout)
10. [Mode Sombre](#10-mode-sombre)
11. [Bonnes pratiques](#11-bonnes-pratiques)

---

## 1. Vue d'ensemble

Le design system "Bold Geometric" est caractérisé par :

- **Formes géométriques audacieuses** : Angles arrondis généreux, formes distinctives
- **Couleurs vives et contrastées** : Electric Blue, Vivid Coral, Lime, Purple
- **Effets de lumière** : Glow effects, gradients subtils
- **Typographie moderne** : Space Grotesk pour les titres, DM Sans pour le corps
- **Animations fluides** : Transitions douces, micro-interactions

### Philosophie

```
BOLD       → Couleurs vives, contrastes forts, présence visuelle affirmée
GEOMETRIC  → Formes nettes, angles définis, grilles structurées
MODERN     → Effets de lumière, gradients, animations fluides
```

---

## 2. Couleurs

### 2.1 Couleurs principales

| Nom | Variable CSS | Valeur | Usage |
|-----|--------------|--------|-------|
| **Electric Blue** | `--color-electric-blue` | `#0055FF` | Actions primaires, liens, éléments actifs |
| **Vivid Coral** | `--color-vivid-coral` | `#FF6B4A` | Danger, alertes urgentes, suppression |
| **Lime** | `--color-lime` | `#C6F135` | Succès alternatif, accents positifs |
| **Purple** | `--color-purple` | `#8B5CF6` | Accents secondaires, éléments premium |
| **Mint** | `--color-mint` | `#00D9A5` | Succès, validations |

### 2.2 Couleurs sémantiques

| Fonction | Variable CSS | Valeur | Usage |
|----------|--------------|--------|-------|
| **Success** | `--color-success` | `#10B981` (Emerald) | Succès, validations, paiements OK |
| **Warning** | `--color-warning` | `#F59E0B` (Amber) | Alertes, échéances proches |
| **Error** | `--color-vivid-coral` | `#FF6B4A` | Erreurs, impayés, actions dangereuses |
| **Info** | `--color-electric-blue` | `#0055FF` | Informations, liens |

### 2.3 Couleurs de surface

#### Mode Clair

| Nom | Variable CSS | Valeur |
|-----|--------------|--------|
| **Background** | `--bg` | `#F1F3F9` |
| **Surface** | `--surface` | `#FFFFFF` |
| **Surface Elevated** | `--surface-elevated` | `#F8FAFC` |
| **Border** | `--border` | `#E2E8F0` |
| **Text** | `--text` | `#1E293B` |
| **Text Secondary** | `--text-secondary` | `#64748B` |
| **Text Muted** | `--text-muted` | `#94A3B8` |

#### Mode Sombre

| Nom | Variable CSS | Valeur |
|-----|--------------|--------|
| **Background** | `--bg` | `#0A0A0F` |
| **Surface** | `--surface` | `#12121A` |
| **Surface Elevated** | `--surface-elevated` | `#1A1A24` |
| **Border** | `--border` | `#2A2A3C` |
| **Text** | `--text` | `#F1F5F9` |
| **Text Secondary** | `--text-secondary` | `#94A3B8` |
| **Text Muted** | `--text-muted` | `#64748B` |

### 2.4 Utilisation des couleurs

```jsx
// ✅ BON : Utiliser les variables CSS
<div className="bg-[var(--surface)] text-[var(--text)]" />
<button className="bg-[var(--color-electric-blue)]" />

// ✅ BON : Utiliser Tailwind avec opacité
<div className="bg-[var(--color-electric-blue)]/10" />

// ❌ MAUVAIS : Couleurs en dur
<div className="bg-white text-gray-900" />
<button className="bg-blue-600" />
```

---

## 3. Typographie

### 3.1 Familles de polices

| Famille | Variable CSS | Police | Usage |
|---------|--------------|--------|-------|
| **Display** | `--font-display` | Space Grotesk | Titres, boutons, labels, valeurs importantes |
| **Body** | `--font-body` | DM Sans | Texte courant, descriptions, paragraphes |

### 3.2 Hiérarchie typographique

| Niveau | Classes Tailwind | Taille | Usage |
|--------|------------------|--------|-------|
| **H1** | `text-3xl font-display font-bold` | 30px | Titre de page principal |
| **H2** | `text-2xl font-display font-bold` | 24px | Sections principales |
| **H3** | `text-xl font-display font-semibold` | 20px | Sous-sections |
| **H4** | `text-lg font-display font-semibold` | 18px | Titres de cartes |
| **Body** | `text-base` | 16px | Texte courant |
| **Small** | `text-sm` | 14px | Labels, métadonnées |
| **Tiny** | `text-xs` | 12px | Badges, annotations |

### 3.3 Exemples d'utilisation

```jsx
// Titre de page
<h1 className="text-3xl font-display font-bold text-[var(--text)]">
  Dashboard
</h1>

// Titre de carte
<h3 className="text-lg font-display font-semibold text-[var(--text)]">
  Mes propriétés
</h3>

// Label de formulaire
<label className="block text-sm font-display font-medium text-[var(--text)]">
  Nom de l'entité
</label>

// Texte courant
<p className="text-base text-[var(--text-secondary)]">
  Description du bien immobilier...
</p>

// Valeur importante (StatCard)
<span className="text-3xl font-display font-bold text-[var(--color-electric-blue)]">
  12 450 €
</span>
```

---

## 4. Espacements

### 4.1 Échelle d'espacements

| Token | Valeur | Tailwind | Usage |
|-------|--------|----------|-------|
| **xs** | 4px | `p-1`, `gap-1` | Micro-espacements |
| **sm** | 8px | `p-2`, `gap-2` | Espacements serrés |
| **md** | 12px | `p-3`, `gap-3` | Espacements moyens |
| **base** | 16px | `p-4`, `gap-4` | Espacements standards |
| **lg** | 24px | `p-6`, `gap-6` | Espacements généreux |
| **xl** | 32px | `p-8`, `gap-8` | Grands espacements |
| **2xl** | 48px | `p-12`, `gap-12` | Très grands espacements |

### 4.2 Conventions par contexte

| Contexte | Padding | Gap |
|----------|---------|-----|
| **Card** | `p-6` (24px) | `gap-4` (16px) |
| **Modal** | `p-6` (24px) | `gap-6` (24px) |
| **Page Content** | `p-4 sm:p-6 lg:p-8` | `space-y-6` |
| **Form Fields** | - | `space-y-6` |
| **Button Group** | - | `gap-3` |
| **Table Cell** | `px-6 py-4` | - |

---

## 5. Border Radius

### 5.1 Tokens

| Token | Valeur | Tailwind | Usage |
|-------|--------|----------|-------|
| **sm** | 8px | `rounded-lg` | Petits éléments |
| **md** | 12px | `rounded-xl` | Inputs, badges, nav items |
| **lg** | 16px | `rounded-2xl` | Cards, modals |
| **full** | 9999px | `rounded-full` | Badges ronds, avatars, toggles |

### 5.2 Conventions par composant

| Composant | Border Radius | Tailwind |
|-----------|---------------|----------|
| **Button** | 12px | `rounded-xl` |
| **Input** | 12px | `rounded-xl` |
| **Select** | 12px | `rounded-xl` |
| **Card** | 16px | `rounded-2xl` |
| **Modal** | 16px | `rounded-2xl` |
| **Badge** | 9999px | `rounded-full` |
| **Avatar** | 9999px | `rounded-full` |
| **Nav Item** | 12px | `rounded-xl` |
| **Icon Container** | 12px | `rounded-xl` |

---

## 6. Ombres et Effets

### 6.1 Ombres de carte

```css
/* Ombre standard */
--shadow-card: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);

/* Ombre au survol */
--shadow-card-hover: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 4px 10px -5px rgba(0, 0, 0, 0.04);
```

```jsx
// Tailwind
className="shadow-card hover:shadow-card-hover"
```

### 6.2 Effets Glow

| Couleur | Variable CSS | Tailwind |
|---------|--------------|----------|
| **Blue** | `--glow-blue` | `shadow-glow-blue` |
| **Coral** | `--glow-coral` | `shadow-glow-coral` |
| **Lime** | `--glow-lime` | `shadow-glow-lime` |
| **Purple** | `--glow-purple` | `shadow-glow-purple` |

```css
/* Définitions */
--glow-blue: 0 0 30px rgba(0, 85, 255, 0.25);
--glow-coral: 0 0 30px rgba(255, 107, 74, 0.25);
--glow-lime: 0 0 30px rgba(198, 241, 53, 0.25);
--glow-purple: 0 0 30px rgba(139, 92, 246, 0.25);
```

```jsx
// Usage sur boutons
<Button className="hover:shadow-glow-blue" />

// Usage sur icônes actives
<div className="shadow-glow-blue" />
```

### 6.3 Backdrop Blur

```jsx
// Header avec blur
<header className="bg-[var(--surface)]/80 backdrop-blur-xl" />

// Modal avec overlay blur
<div className="bg-black/50 backdrop-blur-sm" />
```

---

## 7. Animations

### 7.1 Animations disponibles

| Animation | Classe | Durée | Usage |
|-----------|--------|-------|-------|
| **Fade In** | `animate-fade-in` | 0.3s | Pages, modals |
| **Slide Up** | `animate-slide-up` | 0.4s | Cards, notifications |
| **Card Enter** | `animate-card-enter` | 0.3s + delay | Listes de cards |
| **Progress** | `animate-progress` | Variable | Barres de progression |
| **Spin** | `animate-spin` | 1s | Loading spinners |
| **Pulse** | `animate-pulse` | 2s | Skeletons |

### 7.2 Définitions CSS

```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

### 7.3 Transitions standards

```jsx
// Transition par défaut
className="transition-all duration-200"

// Transition de couleur
className="transition-colors duration-200"

// Transition de transform
className="transition-transform duration-200"

// Hover lift effect
className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
```

### 7.4 Delays pour listes

```jsx
// Animation échelonnée sur liste de cards
{items.map((item, index) => (
  <Card
    key={item.id}
    className={`animate-card-enter`}
    style={{ animationDelay: `${index * 50}ms` }}
  />
))}
```

---

## 8. Composants UI

### 8.1 Button

**Variants disponibles :**

| Variant | Classes | Usage |
|---------|---------|-------|
| `primary` | Gradient blue + glow | Actions principales |
| `secondary` | Surface + border | Actions secondaires |
| `danger` | Gradient coral | Suppression, annulation |
| `success` | Gradient emerald | Confirmation positive |
| `outline` | Border only | Actions tertiaires |
| `ghost` | Transparent | Actions discrètes |
| `lime` | Gradient lime | Accent positif |
| `purple` | Gradient purple | Accent premium |

```jsx
import Button from '../components/ui/Button'

<Button variant="primary" size="lg">Créer</Button>
<Button variant="danger" size="sm">Supprimer</Button>
<Button variant="ghost">Annuler</Button>
```

### 8.2 Card

**Variants disponibles :**

| Variant | Description |
|---------|-------------|
| `default` | Surface blanche avec border |
| `elevated` | Shadow plus prononcée |
| `glass` | Effet glassmorphism |
| `gradient` | Background gradient subtil |
| `accent` | Border colorée à gauche |

```jsx
import Card from '../components/ui/Card'

<Card>Contenu simple</Card>
<Card variant="elevated" title="Titre">Contenu</Card>
<Card padding={false}>Table sans padding</Card>
```

### 8.3 Badge

**Variants disponibles :**

| Variant | Couleur | Usage |
|---------|---------|-------|
| `default` | Gris | État neutre |
| `success` | Vert | Actif, payé, validé |
| `warning` | Orange | En attente, alerte |
| `danger` | Coral | Erreur, impayé |
| `info` | Bleu | Information |
| `purple` | Violet | Premium, spécial |
| `lime` | Lime | Nouveau, récent |

```jsx
import Badge from '../components/ui/Badge'

<Badge variant="success">Actif</Badge>
<Badge variant="danger">Impayé</Badge>
<Badge variant="info">En cours</Badge>
```

### 8.4 StatCard

**Variants par couleur :**

| Variant | Couleur | Usage |
|---------|---------|-------|
| `blue` | Electric Blue | Données principales |
| `emerald` | Vert | Succès, revenus |
| `purple` | Violet | Données secondaires |
| `amber` | Orange | Alertes, warnings |
| `coral` | Coral | Données critiques |
| `lime` | Lime | Accents positifs |

```jsx
import StatCard from '../components/ui/StatCard'

<StatCard
  title="Revenus mensuels"
  value="12 450 €"
  subtitle="+5% vs mois dernier"
  variant="emerald"
  icon={<EuroIcon />}
  trend="up"
  trendValue="+5%"
/>
```

### 8.5 Alert

**Variants disponibles :**

| Variant | Icône | Usage |
|---------|-------|-------|
| `info` | ℹ️ | Information générale |
| `success` | ✅ | Succès, confirmation |
| `warning` | ⚠️ | Avertissement |
| `error` | ❌ | Erreur, problème |

```jsx
import Alert from '../components/ui/Alert'

<Alert variant="warning" title="Attention">
  3 baux arrivent à échéance dans les 30 prochains jours
</Alert>
```

### 8.6 Modal

```jsx
import Modal from '../components/ui/Modal'

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirmer la suppression"
  size="md" // sm, md, lg, xl, full
>
  <p>Êtes-vous sûr ?</p>
  <Button variant="danger" onClick={handleDelete}>Supprimer</Button>
</Modal>
```

### 8.7 Skeleton

```jsx
import Skeleton from '../components/ui/Skeleton'

// Types disponibles
<Skeleton type="text" count={3} />
<Skeleton type="title" />
<Skeleton type="card" count={2} />
<Skeleton type="table-row" count={5} />
<Skeleton type="avatar" />
```

---

## 9. Layout

### 9.1 Sidebar

**Styles clés :**

```jsx
// Container
className="w-72 bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)]"

// Logo avec gradient
className="bg-gradient-to-br from-[var(--color-electric-blue)] to-[var(--color-purple)] shadow-glow-blue"

// Nav item
className="rounded-xl px-3 py-2.5 hover:bg-[var(--sidebar-hover)]"

// Nav item actif
className="bg-[var(--color-electric-blue)]/10 text-[var(--color-electric-blue)]"
```

### 9.2 Header

```jsx
// Container
className="bg-[var(--surface)]/80 backdrop-blur-xl border-b border-[var(--border)]"

// Titre de page
className="text-xl font-display font-bold text-[var(--text)]"
```

### 9.3 Content Area

```jsx
// Container principal
className="bg-[var(--bg)] min-h-screen"

// Zone de contenu
className="p-4 sm:p-6 lg:p-8"

// Espacement vertical entre sections
className="space-y-6"
```

### 9.4 Grilles

```jsx
// Grille responsive 4 colonnes (StatCards)
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"

// Grille responsive 3 colonnes (Cards)
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// Grille responsive 2 colonnes (Formulaires)
className="grid grid-cols-1 md:grid-cols-2 gap-6"
```

---

## 10. Mode Sombre

### 10.1 Activation

```jsx
// Via attribut data-theme sur <html>
document.documentElement.setAttribute('data-theme', 'dark')
document.documentElement.setAttribute('data-theme', 'light')
```

### 10.2 Variables CSS

Les variables CSS sont automatiquement adaptées via le sélecteur `[data-theme="dark"]` dans `index.css`.

### 10.3 Bonnes pratiques

```jsx
// ✅ BON : Utiliser les variables CSS
className="bg-[var(--surface)] text-[var(--text)]"

// ✅ BON : Adapter manuellement si nécessaire
className="text-emerald-600 dark:text-emerald-400"

// ❌ MAUVAIS : Couleurs statiques sans adaptation
className="bg-white text-gray-900"
```

---

## 11. Bonnes pratiques

### 11.1 Checklist composants

```
✅ Utiliser les variables CSS pour les couleurs
✅ Utiliser font-display pour titres, labels, boutons
✅ Appliquer rounded-xl sur inputs, rounded-2xl sur cards
✅ Ajouter transitions sur éléments interactifs
✅ Prévoir états hover, focus, active, disabled
✅ Tester en mode clair ET sombre
✅ Vérifier le responsive (mobile, tablet, desktop)
```

### 11.2 Classes utilitaires courantes

```jsx
// Card interactive
className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6
           transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"

// Input standard
className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)]
           rounded-xl text-[var(--text)] placeholder:text-[var(--text-muted)]
           focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)]
           focus:border-transparent transition-all"

// Bouton primaire
className="px-6 py-3 bg-gradient-to-r from-[var(--color-electric-blue)] to-[#0066FF]
           text-white font-display font-semibold rounded-xl
           hover:brightness-110 hover:shadow-glow-blue
           active:scale-[0.98] transition-all duration-200"

// Table header
className="px-6 py-4 text-left text-xs font-display font-semibold
           text-[var(--text-secondary)] uppercase tracking-wider
           bg-[var(--surface-elevated)]"
```

### 11.3 Pattern d'animation liste

```jsx
{items.map((item, index) => (
  <Card
    key={item.id}
    className="animate-card-enter"
    style={{
      animationDelay: `${Math.min(index, 5) * 50}ms`,
      animationFillMode: 'backwards'
    }}
  >
    {/* Contenu */}
  </Card>
))}
```

### 11.4 Accessibilité

```jsx
// Focus visible
className="focus:outline-none focus:ring-2 focus:ring-[var(--color-electric-blue)]
           focus:ring-offset-2 focus:ring-offset-[var(--surface)]"

// Contraste texte
// Toujours utiliser --text sur --surface
// Toujours utiliser --text-secondary pour texte secondaire
// Éviter --text-muted pour texte important

// États disabled
className="disabled:opacity-50 disabled:cursor-not-allowed"
```

---

## Fichiers de référence

- **Configuration Tailwind** : `frontend/tailwind.config.js`
- **Variables CSS** : `frontend/src/index.css`
- **Démo HTML** : `frontend/design-demos/05-bold-geometric-complete.html`
- **Composants UI** : `frontend/src/components/ui/`
- **Layout** : `frontend/src/components/layout/`

---

*Document généré le 10 Janvier 2026*
*Design System "Bold Geometric" v1.0*
