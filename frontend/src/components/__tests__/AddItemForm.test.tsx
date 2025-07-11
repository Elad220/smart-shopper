import React from 'react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { screen, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AddItemForm from '../../../components/AddItemForm';
import { StandardCategory } from '../../../types';

// Create a test theme
const testTheme = createTheme();

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={testTheme}>
    {children}
  </ThemeProvider>
);

// Mock the alert function
beforeAll(() => {
  window.alert = vi.fn();
});

// TypeScript fix for jest-dom
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
    }
  }
}

// Mock props that are now required by the component
const mockCategories = ['Dairy', 'Bakery', 'Produce', 'My Custom Category', StandardCategory.OTHER];
const mockOnDeleteCategory = vi.fn();

const selectCategory = async (user: ReturnType<typeof userEvent.setup>, category: string) => {
  // Click the category select (it's a combobox, not a button)
  const select = screen.getByRole('combobox', { name: /category/i });
  await user.click(select);
  
  // Wait for the options to appear and select the category
  const option = await screen.findByRole('option', { name: new RegExp(category, 'i') });
  await user.click(option);
};

describe('AddItemForm Component', () => {
  it('renders form elements', async () => {
    render(
      <TestWrapper>
        <AddItemForm
          isOpen={true}
          onClose={() => {}}
          onAddItem={vi.fn()}
          categories={mockCategories}
          onDeleteCategory={mockOnDeleteCategory}
        />
      </TestWrapper>
    );
    
    expect(screen.getByPlaceholderText('e.g., Milk, Bread, Apples')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Unit')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    const onAddItem = vi.fn();
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <AddItemForm
          isOpen={true}
          onClose={() => {}}
          onAddItem={onAddItem}
          categories={mockCategories}
          onDeleteCategory={mockOnDeleteCategory}
        />
      </TestWrapper>
    );

    // Fill in the form
    await user.type(screen.getByPlaceholderText('e.g., Milk, Bread, Apples'), 'New Item');
    
    // Select category
    await selectCategory(user, 'Dairy');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /add item/i }));

    // Wait for the form submission to complete
    await waitFor(() => {
      expect(onAddItem).toHaveBeenCalledWith(expect.objectContaining({
        name: 'New Item',
        category: 'Dairy',
        amount: 1,
        units: 'pcs',
      }));
    }, { timeout: 10000 });
  }, 15000);

  it('validates required fields', async () => {
    const onAddItem = vi.fn();
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <AddItemForm
          isOpen={true}
          onClose={() => {}}
          onAddItem={onAddItem}
          categories={mockCategories}
          onDeleteCategory={mockOnDeleteCategory}
        />
      </TestWrapper>
    );

    // Try to submit without filling required fields
    await user.click(screen.getByRole('button', { name: /add item/i }));

    // Wait a bit to ensure the form validation has run
    await waitFor(() => {
      expect(onAddItem).not.toHaveBeenCalled();
    }, { timeout: 5000 });
    
    // The form now uses form validation instead of window.alert
    // Check that the form doesn't submit and stays open
    expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument();
  }, 10000);

  it('calls onAddItem and onClose after successful submission', async () => {
    const onAddItem = vi.fn();
    const onClose = vi.fn();
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <AddItemForm
          isOpen={true}
          onClose={onClose}
          onAddItem={onAddItem}
          categories={mockCategories}
          onDeleteCategory={mockOnDeleteCategory}
        />
      </TestWrapper>
    );

    // Fill in the form
    await user.type(screen.getByPlaceholderText('e.g., Milk, Bread, Apples'), 'New Item');
    
    // Select category
    await selectCategory(user, 'Dairy');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /add item/i }));

    // Wait for both callbacks to be called
    await waitFor(() => {
      expect(onAddItem).toHaveBeenCalled();
    }, { timeout: 10000 });
    
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    }, { timeout: 10000 });
  }, 15000);
});