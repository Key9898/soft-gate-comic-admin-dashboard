import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test/utils'
import userEvent from '@testing-library/user-event'
import Button from './Button'

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('applies primary variant styles by default', () => {
    render(<Button>Primary</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-primary-600')
  })

  it('applies secondary variant styles', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-gray-100')
  })

  it('applies outline variant styles', () => {
    render(<Button variant="outline">Outline</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('border-2')
    expect(button).toHaveClass('border-primary-600')
  })

  it('applies ghost variant styles', () => {
    render(<Button variant="ghost">Ghost</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('text-gray-700')
  })

  it('applies danger variant styles', () => {
    render(<Button variant="danger">Danger</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-red-600')
  })

  it('applies size sm styles', () => {
    render(<Button size="sm">Small</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-3')
    expect(button).toHaveClass('py-1.5')
    expect(button).toHaveClass('text-sm')
  })

  it('applies size md styles by default', () => {
    render(<Button>Medium</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-4')
    expect(button).toHaveClass('py-2')
  })

  it('applies size lg styles', () => {
    render(<Button size="lg">Large</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-6')
    expect(button).toHaveClass('py-3')
    expect(button).toHaveClass('text-base')
  })

  it('shows loading spinner when isLoading is true', () => {
    render(<Button isLoading>Loading</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:opacity-50')
  })

  it('handles click events', async () => {
    const user = userEvent.setup()
    let clicked = false
    render(<Button onClick={() => (clicked = true)}>Click me</Button>)
    await user.click(screen.getByRole('button'))
    expect(clicked).toBe(true)
  })

  it('does not trigger click when disabled', async () => {
    const user = userEvent.setup()
    let clicked = false
    render(
      <Button disabled onClick={() => (clicked = true)}>
        Disabled
      </Button>
    )
    await user.click(screen.getByRole('button'))
    expect(clicked).toBe(false)
  })

  it('renders left icon', () => {
    render(<Button leftIcon={<span data-testid="left-icon">←</span>}>With Icon</Button>)
    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
  })

  it('renders right icon', () => {
    render(<Button rightIcon={<span data-testid="right-icon">→</span>}>With Icon</Button>)
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })
})
