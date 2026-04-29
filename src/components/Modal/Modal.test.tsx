import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test/utils'
import userEvent from '@testing-library/user-event'
import Modal from './Modal'

describe('Modal', () => {
  it('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <p>Modal content</p>
      </Modal>
    )
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        <p>Modal content</p>
      </Modal>
    )
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
  })

  it('renders title when provided', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Modal Title">
        <p>Content</p>
      </Modal>
    )
    expect(screen.getByText('Modal Title')).toBeInTheDocument()
  })

  it('renders close button by default', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <p>Content</p>
      </Modal>
    )
    expect(screen.getByRole('button', { name: /close modal/i })).toBeInTheDocument()
  })

  it('hides close button when showCloseButton is false', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} showCloseButton={false}>
        <p>Content</p>
      </Modal>
    )
    expect(screen.queryByRole('button', { name: /close modal/i })).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={onClose}>
        <p>Content</p>
      </Modal>
    )
    await user.click(screen.getByRole('button', { name: /close modal/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when overlay is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={onClose}>
        <p>Content</p>
      </Modal>
    )
    const overlay = document.querySelector('.bg-black\\/50')
    if (overlay) {
      await user.click(overlay)
      expect(onClose).toHaveBeenCalled()
    }
  })

  it('does not call onClose when overlay click is disabled', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={onClose} closeOnOverlayClick={false}>
        <p>Content</p>
      </Modal>
    )
    const overlay = document.querySelector('.bg-black\\/50')
    if (overlay) {
      await user.click(overlay)
      expect(onClose).not.toHaveBeenCalled()
    }
  })

  it('applies size sm', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} size="sm">
        <p>Content</p>
      </Modal>
    )
    const modal = screen.getByText('Content').closest('div[class*="max-w"]')
    expect(modal).toHaveClass('max-w-sm')
  })

  it('applies size md by default', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <p>Content</p>
      </Modal>
    )
    const modal = screen.getByText('Content').closest('div[class*="max-w"]')
    expect(modal).toHaveClass('max-w-md')
  })

  it('applies size lg', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} size="lg">
        <p>Content</p>
      </Modal>
    )
    const modal = screen.getByText('Content').closest('div[class*="max-w"]')
    expect(modal).toHaveClass('max-w-lg')
  })

  it('applies size xl', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} size="xl">
        <p>Content</p>
      </Modal>
    )
    const modal = screen.getByText('Content').closest('div[class*="max-w"]')
    expect(modal).toHaveClass('max-w-xl')
  })

  it('applies size full', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} size="full">
        <p>Content</p>
      </Modal>
    )
    const modal = screen.getByText('Content').closest('div[class*="max-w"]')
    expect(modal).toHaveClass('max-w-4xl')
  })
})
