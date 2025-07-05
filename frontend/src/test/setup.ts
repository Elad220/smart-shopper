import '@testing-library/jest-dom';
import { afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Robust ResizeObserver mock for all usages
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: ResizeObserver,
});
globalThis.ResizeObserver = ResizeObserver;

// Mock window.matchMedia for Material-UI
const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(), // deprecated
  removeListener: vi.fn(), // deprecated
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: matchMediaMock,
});

// Ensure window.matchMedia is available
if (!window.matchMedia) {
  window.matchMedia = matchMediaMock;
}

// Mock window.scroll
Object.defineProperty(window, 'scroll', {
  writable: true,
  value: vi.fn(),
});

Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: localStorageMock,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  writable: true,
  value: localStorageMock,
});

// Mock IntersectionObserver
globalThis.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock alert, confirm, prompt
Object.defineProperty(window, 'alert', {
  writable: true,
  value: vi.fn(),
});

Object.defineProperty(window, 'confirm', {
  writable: true,
  value: vi.fn(() => true),
});

Object.defineProperty(window, 'prompt', {
  writable: true,
  value: vi.fn(() => ''),
});

// Mock fetch for API calls
globalThis.fetch = vi.fn();

// Mock Material-UI useMediaQuery more comprehensively
vi.mock('@mui/material/useMediaQuery', () => ({
  default: vi.fn(() => false), // Always return false (not mobile)
}));

vi.mock('@mui/system/useMediaQuery', () => ({
  default: vi.fn(() => false),
}));

// Mock the actual useMediaQuery hook that's being used
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material') as any;
  return {
    ...actual,
    useMediaQuery: vi.fn(() => false),
  };
});

// Setup and teardown
beforeAll(() => {
  // Set up any global test state
  vi.clearAllMocks();
});

afterEach(() => {
  // Clean up after each test
  cleanup();
  vi.clearAllMocks();
  localStorageMock.clear();
}); 