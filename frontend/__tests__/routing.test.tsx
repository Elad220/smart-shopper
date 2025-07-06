import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Helper to mock useAuth with custom return value
const mockAuth = (overrides: Partial<ReturnType<typeof import('../hooks/useAuth').useAuth>>) => {
  vi.doMock('../hooks/useAuth', () => ({
    useAuth: () => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      ...(overrides as any),
    }),
  }));
};

describe('Routing guards', () => {
  it('redirects unauthenticated user from /app to /', async () => {
    mockAuth({ isAuthenticated: false, user: null });

    render(
      <MemoryRouter initialEntries={["/app"]}>
        <App />
      </MemoryRouter>
    );

    // Landing page has Get Started button
    expect(await screen.findByRole('button', { name: /get started/i })).toBeInTheDocument();
  });

  it('redirects authenticated user from /auth to /app', async () => {
    mockAuth({
      isAuthenticated: true,
      user: { id: '1', email: 'test@example.com', username: 'test', token: 'token' },
    });

    render(
      <MemoryRouter initialEntries={["/auth"]}>
        <App />
      </MemoryRouter>
    );

    // Header appears in protected area (contains "Menu" side menu heading)
    expect(await screen.findByText(/menu/i)).toBeInTheDocument();
  });
});