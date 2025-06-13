import ShoppingList from '../../../components/ShoppingList';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock the API calls
vi.mock('../../services/api', () => ({
  getItems: vi.fn(() => Promise.resolve([])),
  addItem: vi.fn(() => Promise.resolve({ id: '1', name: 'Test Item', checked: false })),
  updateItem: vi.fn(() => Promise.resolve({ id: '1', name: 'Test Item', checked: true })),
  deleteItem: vi.fn(() => Promise.resolve()),
}));

// MUI Grid warning: Update xs/sm props to new API in component code for future compatibility.

describe('ShoppingList Component', () => {
  const mockItems = [
    { id: '1', name: 'Milk', checked: false, category: 'Dairy', units: 'pcs', amount: 1, isCompleted: false },
    { id: '2', name: 'Bread', checked: true, category: 'Bakery', units: 'pcs', amount: 1, isCompleted: true },
  ];
  const mockFn = vi.fn();

  it('renders shopping list items', () => {
    render(
      <ShoppingList
        items={mockItems}
        onToggleComplete={mockFn}
        onDeleteItem={mockFn}
        onEditItem={mockFn}
        onRemoveCategory={mockFn}
        onRemoveCheckedItems={mockFn}
      />
    );
    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(screen.getByText('Bread')).toBeInTheDocument();
  });

  it('sorts items by category', () => {
    render(
      <ShoppingList
        items={mockItems}
        onToggleComplete={mockFn}
        onDeleteItem={mockFn}
        onEditItem={mockFn}
        onRemoveCategory={mockFn}
        onRemoveCheckedItems={mockFn}
      />
    );
    const categories = screen.getAllByRole('heading', { level: 2 });
    expect(categories[0]).toHaveTextContent('Dairy');
    expect(categories[1]).toHaveTextContent('Bakery');
  });

  // Add more tests as needed, always passing all required props as mockFn
}); 