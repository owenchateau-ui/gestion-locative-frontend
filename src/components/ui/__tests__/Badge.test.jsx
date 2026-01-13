/**
 * Tests unitaires: Badge Component
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Badge from '../Badge'

describe('Badge Component', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(<Badge>Active</Badge>)
      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('renders with default variant', () => {
      const { container } = render(<Badge>Default</Badge>)
      const badge = container.firstChild
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800')
    })
  })

  describe('Variants', () => {
    it('applies success variant classes', () => {
      const { container } = render(<Badge variant="success">Success</Badge>)
      const badge = container.firstChild
      expect(badge).toHaveClass('bg-emerald-100', 'text-emerald-800')
    })

    it('applies danger variant classes', () => {
      const { container } = render(<Badge variant="danger">Danger</Badge>)
      const badge = container.firstChild
      expect(badge).toHaveClass('bg-red-100', 'text-red-800')
    })

    it('applies warning variant classes', () => {
      const { container } = render(<Badge variant="warning">Warning</Badge>)
      const badge = container.firstChild
      expect(badge).toHaveClass('bg-amber-100', 'text-amber-800')
    })

    it('applies info variant classes', () => {
      const { container } = render(<Badge variant="info">Info</Badge>)
      const badge = container.firstChild
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800')
    })

    it('applies default variant when variant is invalid', () => {
      const { container } = render(<Badge variant="invalid">Default</Badge>)
      const badge = container.firstChild
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800')
    })
  })

  describe('Styling', () => {
    it('applies base badge classes', () => {
      const { container } = render(<Badge>Badge</Badge>)
      const badge = container.firstChild
      expect(badge).toHaveClass(
        'inline-flex',
        'items-center',
        'px-2.5',
        'py-0.5',
        'rounded-full',
        'text-xs',
        'font-medium'
      )
    })

    it('applies custom className', () => {
      const { container } = render(<Badge className="custom-badge">Custom</Badge>)
      const badge = container.firstChild
      expect(badge).toHaveClass('custom-badge')
    })

    it('merges custom className with variant classes', () => {
      const { container } = render(
        <Badge variant="success" className="ml-2">
          Success
        </Badge>
      )
      const badge = container.firstChild
      expect(badge).toHaveClass('bg-emerald-100', 'ml-2')
    })
  })

  describe('Content', () => {
    it('handles text content', () => {
      render(<Badge>Text Badge</Badge>)
      expect(screen.getByText('Text Badge')).toBeInTheDocument()
    })

    it('handles numeric content', () => {
      render(<Badge>{42}</Badge>)
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('handles empty content', () => {
      const { container } = render(<Badge></Badge>)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('handles long content', () => {
      const longText = 'Very Long Badge Text That Should Still Render'
      render(<Badge>{longText}</Badge>)
      expect(screen.getByText(longText)).toBeInTheDocument()
    })
  })

  describe('Use Cases', () => {
    it('renders status badges correctly', () => {
      const { rerender } = render(<Badge variant="success">Payé</Badge>)
      expect(screen.getByText('Payé')).toBeInTheDocument()

      rerender(<Badge variant="danger">En retard</Badge>)
      expect(screen.getByText('En retard')).toBeInTheDocument()

      rerender(<Badge variant="warning">En attente</Badge>)
      expect(screen.getByText('En attente')).toBeInTheDocument()
    })

    it('renders lease status badges', () => {
      render(<Badge variant="success">Actif</Badge>)
      expect(screen.getByText('Actif')).toBeInTheDocument()
    })

    it('renders property status badges', () => {
      const { rerender } = render(<Badge variant="success">Occupé</Badge>)
      expect(screen.getByText('Occupé')).toBeInTheDocument()

      rerender(<Badge variant="warning">Vacant</Badge>)
      expect(screen.getByText('Vacant')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('uses span element', () => {
      const { container } = render(<Badge>Badge</Badge>)
      expect(container.firstChild.tagName).toBe('SPAN')
    })

    it('maintains text readability with proper contrast', () => {
      const { container: successContainer } = render(
        <Badge variant="success">Success</Badge>
      )
      const successBadge = successContainer.firstChild
      expect(successBadge).toHaveClass('text-emerald-800')

      const { container: dangerContainer } = render(<Badge variant="danger">Danger</Badge>)
      const dangerBadge = dangerContainer.firstChild
      expect(dangerBadge).toHaveClass('text-red-800')
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined variant gracefully', () => {
      const { container } = render(<Badge variant={undefined}>Badge</Badge>)
      const badge = container.firstChild
      expect(badge).toHaveClass('bg-gray-100')
    })

    it('handles null children', () => {
      const { container } = render(<Badge>{null}</Badge>)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('handles special characters', () => {
      render(<Badge>€ 1,234.56</Badge>)
      expect(screen.getByText('€ 1,234.56')).toBeInTheDocument()
    })

    it('handles JSX children', () => {
      render(
        <Badge>
          <strong>Bold</strong> text
        </Badge>
      )
      expect(screen.getByText('Bold')).toBeInTheDocument()
      expect(screen.getByText(/text/)).toBeInTheDocument()
    })
  })
})
