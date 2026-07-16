import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/utils';
import Card from './Card';

describe('Card', () => {
  it('renders children correctly', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies default variant styles', () => {
    render(<Card data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('bg-white');
    expect(card).toHaveClass('rounded-xl');
    expect(card).toHaveClass('shadow-sm');
  });

  it('applies hover variant styles', () => {
    render(
      <Card variant="hover" data-testid="card">
        Content
      </Card>,
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('hover:shadow-md');
    expect(card).toHaveClass('hover:border-gray-300');
  });

  it('applies interactive variant styles', () => {
    render(
      <Card variant="interactive" data-testid="card">
        Content
      </Card>,
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('hover:-translate-y-0.5');
    expect(card).toHaveClass('cursor-pointer');
  });

  it('applies padding sm', () => {
    render(
      <Card padding="sm" data-testid="card">
        Content
      </Card>,
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('p-3');
  });

  it('applies padding md by default', () => {
    render(<Card data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('p-4');
  });

  it('applies padding lg', () => {
    render(
      <Card padding="lg" data-testid="card">
        Content
      </Card>,
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('p-5');
  });

  it('applies no padding when padding is none', () => {
    render(
      <Card padding="none" data-testid="card">
        Content
      </Card>,
    );
    const card = screen.getByTestId('card');
    expect(card).not.toHaveClass('p-4');
  });

  it('applies custom className', () => {
    render(
      <Card className="custom-card" data-testid="card">
        Content
      </Card>,
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('custom-card');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<Card ref={ref}>Content</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
