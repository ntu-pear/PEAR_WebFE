import { render, screen } from '@testing-library/react';
import PatientTable from './PatientTable';


// Mock the components that are imported from other files
jest.mock('@/components/Table/DataTable', () => ({
  __esModule: true,
  default: () => <div data-testid="data-table">DataTable</div>
}));

jest.mock('@/components/Header/Header', () => ({
  __esModule: true,
  default: () => <div data-testid="header">Header</div>
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    render(<PatientTable />);
  });

  test('renders Header component', () => {
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  test('renders DataTable component', () => {
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  test('renders all patients tabs', () => {
    expect(screen.getByRole('tab', { name: /All Patients/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /My Patients/i })).toBeInTheDocument();
  });

  test('renders filter, export, and add user buttons', () => {
    expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add patient/i })).toBeInTheDocument();
  });

  test('displays correct number of users in footer', () => {
    const footerText = screen.getByText(/showing/i);
    expect(footerText).toHaveTextContent('Showing 1-20 of 20 patients');
  });
});