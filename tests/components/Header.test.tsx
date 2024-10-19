import { render, screen } from '@testing-library/react';
import Header from '@/components/Header';

describe('Header Component', () => {
  test('renders without crashing', () => {
    render(<Header />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  test('renders mobile menu toggle button', () => {
    render(<Header />);
    const menuToggle = screen.getByRole('button', { name: /toggle menu/i });
    expect(menuToggle).toBeInTheDocument();
  });

  test('renders search input', () => {
    render(<Header />);
    const searchInput = screen.getByPlaceholderText('Search...');
    expect(searchInput).toBeInTheDocument();
  });

  test('renders avatar dropdown', () => {
    render(<Header />);
    const avatarButton = screen.getByRole('button', { name: /avatar/i });
    expect(avatarButton).toBeInTheDocument();
  });

  test('mobile menu is not visible on larger screens', () => {
    render(<Header />);
    const menuToggle = screen.getByRole('button', { name: /toggle menu/i });
    expect(menuToggle).toHaveClass('sm:hidden');
  });
});