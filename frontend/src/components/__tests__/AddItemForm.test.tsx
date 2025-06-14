import { describe, it, expect, vi, beforeAll } from 'vitest';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddItemForm from '../../../components/AddItemForm';
import { StandardCategory } from '../../../types';

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

const selectCategory = async (user: ReturnType<typeof userEvent.setup>, category: string) => {
  // Click the select button
  const select = screen.getByRole('button', { name: /category/i });
  await user.click(select);
  
  // Wait for the options to appear and select the category
  const option = await screen.findByRole('option', { name: new RegExp(category, 'i') });
  await user.click(option);
};

describe('AddItemForm Component', () => {
  it('renders form elements', async () => {
    render(<AddItemForm isOpen={true} onClose={() => {}} onAddItem={vi.fn()} />);
    
    expect(screen.getByPlaceholderText('e.g., Whole Milk')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Units')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    const onAddItem = vi.fn();
    const user = userEvent.setup();
    
    render(<AddItemForm isOpen={true} onClose={() => {}} onAddItem={onAddItem} />);

    // Fill in the form
    await user.type(screen.getByPlaceholderText('e.g., Whole Milk'), 'New Item');
    
    // Select category
    await selectCategory(user, 'Dairy');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /add/i }));

    // Check that onAddItem was called with the correct data
    expect(onAddItem).toHaveBeenCalledWith(expect.objectContaining({
      name: 'New Item',
      category: StandardCategory.DAIRY,
      amount: 1,
      units: 'pcs',
      isCompleted: false
    }));
  });

  it('validates required fields', async () => {
    const onAddItem = vi.fn();
    const user = userEvent.setup();
    
    render(<AddItemForm isOpen={true} onClose={() => {}} onAddItem={onAddItem} />);

    // Try to submit without filling required fields
    await user.click(screen.getByRole('button', { name: /add/i }));

    expect(onAddItem).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Item name cannot be empty.');
  });

  it('calls onAddItem and onClose after successful submission', async () => {
    const onAddItem = vi.fn();
    const onClose = vi.fn();
    const user = userEvent.setup();
    
    render(<AddItemForm isOpen={true} onClose={onClose} onAddItem={onAddItem} />);

    // Fill in the form
    await user.type(screen.getByPlaceholderText('e.g., Whole Milk'), 'New Item');
    
    // Select category
    await selectCategory(user, 'Dairy');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /add/i }));

    // Check that both callbacks were called
    expect(onAddItem).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});