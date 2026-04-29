import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test/utils'
import userEvent from '@testing-library/user-event'
import Toggle from './Toggle'

describe('Toggle', () => {
  it('renders label correctly', () => {
    render(<Toggle checked={false} label="Enable feature" onChange={() => {}} />)
    expect(screen.getByText('Enable feature')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(
      <Toggle
        checked={false}
        label="Enable feature"
        description="This will enable the feature"
        onChange={() => {}}
      />
    )
    expect(screen.getByText('This will enable the feature')).toBeInTheDocument()
  })

  it('has correct aria-checked when unchecked', () => {
    render(<Toggle checked={false} label="Toggle" onChange={() => {}} />)
    const toggle = screen.getByRole('switch')
    expect(toggle).toHaveAttribute('aria-checked', 'false')
  })

  it('has correct aria-checked when checked', () => {
    render(<Toggle checked={true} label="Toggle" onChange={() => {}} />)
    const toggle = screen.getByRole('switch')
    expect(toggle).toHaveAttribute('aria-checked', 'true')
  })

  it('applies checked styles', () => {
    render(<Toggle checked={true} label="Toggle" onChange={() => {}} />)
    const toggle = screen.getByRole('switch')
    expect(toggle).toHaveClass('bg-primary-600')
  })

  it('applies unchecked styles', () => {
    render(<Toggle checked={false} label="Toggle" onChange={() => {}} />)
    const toggle = screen.getByRole('switch')
    expect(toggle).toHaveClass('bg-gray-300')
  })

  it('calls onChange with new value when clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Toggle checked={false} label="Toggle" onChange={onChange} />)
    await user.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('calls onChange with false when clicked while checked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Toggle checked={true} label="Toggle" onChange={onChange} />)
    await user.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('has correct aria-label', () => {
    render(<Toggle checked={false} label="Dark Mode" onChange={() => {}} />)
    const toggle = screen.getByRole('switch')
    expect(toggle).toHaveAttribute('aria-label', 'Dark Mode')
  })

  it('applies custom className', () => {
    render(<Toggle checked={false} label="Toggle" onChange={() => {}} className="custom-toggle" />)
    const toggle = screen.getByRole('switch')
    expect(toggle).toHaveClass('custom-toggle')
  })

  it('has role="switch"', () => {
    render(<Toggle checked={false} label="Toggle" onChange={() => {}} />)
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })
})
