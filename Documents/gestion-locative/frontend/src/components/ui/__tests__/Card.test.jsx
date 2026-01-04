/**
 * Tests unitaires: Card Component
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Card from '../Card'

describe('Card Component', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(
        <Card>
          <p>Card content</p>
        </Card>
      )
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('renders without title and subtitle', () => {
      render(<Card>Content only</Card>)
      expect(screen.getByText('Content only')).toBeInTheDocument()
    })

    it('renders with title only', () => {
      render(<Card title="My Title">Content</Card>)
      expect(screen.getByText('My Title')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('renders with title and subtitle', () => {
      render(
        <Card title="Main Title" subtitle="Secondary text">
          Content
        </Card>
      )
      expect(screen.getByText('Main Title')).toBeInTheDocument()
      expect(screen.getByText('Secondary text')).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('applies base card classes', () => {
      const { container } = render(<Card>Content</Card>)
      const card = container.firstChild
      expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow-sm')
    })

    it('applies padding when padding prop is true (default)', () => {
      const { container } = render(<Card>Content</Card>)
      const card = container.firstChild
      expect(card).toHaveClass('p-6')
    })

    it('removes padding when padding prop is false', () => {
      const { container } = render(<Card padding={false}>Content</Card>)
      const card = container.firstChild
      expect(card).not.toHaveClass('p-6')
    })

    it('applies custom className', () => {
      const { container } = render(<Card className="custom-card">Content</Card>)
      const card = container.firstChild
      expect(card).toHaveClass('custom-card')
    })
  })

  describe('Header Structure', () => {
    it('renders header section when title is provided', () => {
      const { container } = render(<Card title="Title">Content</Card>)
      const header = container.querySelector('.mb-4')
      expect(header).toBeInTheDocument()
    })

    it('title has correct heading level', () => {
      render(<Card title="My Card">Content</Card>)
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent('My Card')
    })

    it('subtitle has correct text size', () => {
      render(<Card title="Title" subtitle="Subtitle">Content</Card>)
      const subtitle = screen.getByText('Subtitle')
      expect(subtitle).toHaveClass('text-sm', 'text-gray-600')
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<Card title="Card Title">Content</Card>)
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
    })

    it('maintains semantic HTML structure', () => {
      const { container } = render(
        <Card title="Title" subtitle="Subtitle">
          <p>Content paragraph</p>
        </Card>
      )
      expect(container.querySelector('div')).toBeInTheDocument()
      expect(screen.getByRole('heading')).toBeInTheDocument()
      expect(screen.getByText('Content paragraph').tagName).toBe('P')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      const { container } = render(<Card></Card>)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('handles complex children', () => {
      render(
        <Card title="Complex Card">
          <div>
            <h3>Nested heading</h3>
            <p>Paragraph</p>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </div>
        </Card>
      )
      expect(screen.getByText('Nested heading')).toBeInTheDocument()
      expect(screen.getByText('Item 1')).toBeInTheDocument()
    })

    it('handles very long title', () => {
      const longTitle = 'A'.repeat(100)
      render(<Card title={longTitle}>Content</Card>)
      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('handles special characters in title', () => {
      render(<Card title="Title with <>&quot; special chars">Content</Card>)
      expect(screen.getByText(/Title with.*special chars/)).toBeInTheDocument()
    })
  })
})
