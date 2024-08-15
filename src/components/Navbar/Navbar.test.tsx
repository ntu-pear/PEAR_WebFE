import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';

// Mock the useTheme hook
jest.mock("@/components/theme/ThemeProvider", () => ({
  useTheme: () => ({ theme: 'light', setTheme: jest.fn() }),
}));

// Mock ResizeObserver
class ResizeObserverMock implements ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  
  // Extend the Window interface to include ResizeObserver
  declare global {
    interface Window {
      ResizeObserver: typeof ResizeObserver;
    }
  }
// Assign the mock to window.ResizeObserver
window.ResizeObserver = ResizeObserverMock;

describe('Navbar Component', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
  });

  test('displays the logo', () => {
    const logo = screen.getByAltText('Pear Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/pear.png');
  });

  test('renders navigation menu items', () => {
    expect(screen.getByText('Getting started')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  test('renders theme toggle button', () => {
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
  });

  test('displays correct content in navigation menu dropdown', () => {
    const gettingStartedTrigger = screen.getByText('Getting started');
    expect(gettingStartedTrigger).toBeInTheDocument();  
    fireEvent.click(gettingStartedTrigger);

    // Now check for the content in the opened dropdown
    expect(screen.getByText('PEAR WebFE')).toBeInTheDocument();
    expect(screen.getByText('Your application description here.')).toBeInTheDocument();
    expect(screen.getByText('Documentation')).toBeInTheDocument();
    expect(screen.getByText('Learn how to use our application.')).toBeInTheDocument();
  });
});