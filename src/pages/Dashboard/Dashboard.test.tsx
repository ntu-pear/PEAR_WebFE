import { render, screen } from '@testing-library/react';
import Dashboard from './Dashboard';

// Mock the components that are imported from other files
jest.mock('@/components/Table/DataTable', () => ({
  __esModule: true,
  default: () => <div data-testid="data-table">DataTable</div>
}));
jest.mock('@/components/Sidebar/Sidebar', () => ({
  __esModule: true,
  default: () => <div data-testid="sidebar">Sidebar</div>
}));
jest.mock('@/components/Header/Header', () => ({
  __esModule: true,
  default: () => <div data-testid="header">Header</div>
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    render(<Dashboard />);
  });

  test('renders Sidebar component', () => {
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  test('renders Header component', () => {
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  test('renders DataTable component', () => {
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  test('renders all user status tabs', () => {
    expect(screen.getByRole('tab', { name: /all users/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /inactive/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /pending/i })).toBeInTheDocument();
  });

  test('renders filter, export, and add user buttons', () => {
    expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
  });

  test('displays correct number of users in footer', () => {
    const footerText = screen.getByText(/showing/i);
    expect(footerText).toHaveTextContent('Showing 1-5 of 5 users');
  });
});