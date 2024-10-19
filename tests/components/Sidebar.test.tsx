import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../Sidebar';

describe('Sidebar Component', () => {
    beforeEach(() => {
      render(
        <BrowserRouter>
          <Sidebar />
        </BrowserRouter>
      );
    });
  
    test('renders the sidebar', () => {
      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });
  
    test('renders the main logo link', () => {
      const logoLink = screen.getByRole('link', { name: /acme inc/i });
      expect(logoLink).toBeInTheDocument();
      expect(logoLink).toHaveAttribute('href', '/');
    });
  
    test('renders all navigation links', () => {
      const links = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Orders', href: '/orders' },
        { name: 'Products', href: '/products' },
        { name: 'Customers', href: '/customers' },
        { name: 'Analytics', href: '/analytics' },
        { name: 'Settings', href: '/settings' },
      ];
  
      links.forEach(link => {
        const linkElement = screen.getByRole('link', { name: link.name });
        expect(linkElement).toBeInTheDocument();
        expect(linkElement).toHaveAttribute('href', link.href);
      });
    });
  });