import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/utils';
import userEvent from '@testing-library/user-event';
import Input from './Input';

describe('Input', () => {
  it('renders input element', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('generates id from label when id not provided', () => {
    render(<Input label="Email Address" />);
    expect(screen.getByLabelText('Email Address')).toHaveAttribute('id', 'email-address');
  });

  it('uses provided id', () => {
    render(<Input label="Email" id="custom-email" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'custom-email');
  });

  it('displays error message', () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
    const input = screen.getByLabelText('Email');
    expect(input).toHaveClass('border-red-500');
  });

  it('displays hint when no error', () => {
    render(<Input label="Email" hint="Enter your email address" />);
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  it('does not display hint when error is present', () => {
    render(<Input label="Email" hint="Enter your email" error="Invalid" />);
    expect(screen.queryByText('Enter your email')).not.toBeInTheDocument();
    expect(screen.getByText('Invalid')).toBeInTheDocument();
  });

  it('renders left icon', () => {
    render(<Input leftIcon={<span data-testid="left-icon">@</span>} />);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('renders right icon', () => {
    render(<Input rightIcon={<span data-testid="right-icon">✓</span>} />);
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(<Input label="Password" type="password" />);
    const input = screen.getByLabelText('Password') as HTMLInputElement;
    expect(input.type).toBe('password');

    const toggleButton = screen.getByRole('button');
    await user.click(toggleButton);
    expect(input.type).toBe('text');

    await user.click(toggleButton);
    expect(input.type).toBe('password');
  });

  it('handles text input', async () => {
    const user = userEvent.setup();
    render(<Input label="Email" />);
    const input = screen.getByLabelText('Email');
    await user.type(input, 'test@example.com');
    expect(input).toHaveValue('test@example.com');
  });

  it('can be disabled', () => {
    render(<Input label="Email" disabled />);
    expect(screen.getByLabelText('Email')).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<Input className="custom-input" data-testid="custom-input" />);
    const input = screen.getByTestId('custom-input');
    expect(input).toHaveClass('custom-input');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
