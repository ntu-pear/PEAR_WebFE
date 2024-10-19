import { render, act, screen } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../../src/components/ThemeProvider";
import mockMatchMedia from "../../src/mocks/mockMatchMedia";

describe("ThemeProvider", () => {
  const TestComponent = () => {
    const { theme, setTheme } = useTheme();
    return (
      <>
        <div data-testid="theme">{theme}</div>
        <button onClick={() => setTheme("dark")}>Set Dark</button>
        <button onClick={() => setTheme("light")}>Set Light</button>
        <button onClick={() => setTheme("system")}>Set System</button>
      </>
    );
  };

  beforeAll(() => {
    mockMatchMedia();
  });

  test("provides the default theme context", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme").textContent).toBe("system");
  });

  test("allows setting the theme to dark", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    act(() => {
      screen.getByText("Set Dark").click();
    });

    expect(screen.getByTestId("theme").textContent).toBe("dark");
  });

  test("allows setting the theme to light", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    act(() => {
      screen.getByText("Set Light").click();
    });

    expect(screen.getByTestId("theme").textContent).toBe("light");
  });

  test("persists the theme in localStorage", () => {
    const { rerender } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    act(() => {
      screen.getByText("Set Dark").click();
    });

    // Re-render to simulate a page refresh
    rerender(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(localStorage.getItem("vite-ui-theme")).toBe("dark");
  });

  test("uses system preference when set to system", () => {
    // Mock system preference to dark
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === "(prefers-color-scheme: dark)",
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    act(() => {
      screen.getByText("Set System").click();
    });

    expect(screen.getByTestId("theme").textContent).toBe("system");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
