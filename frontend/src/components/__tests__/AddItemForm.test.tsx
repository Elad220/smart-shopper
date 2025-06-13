import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddItemForm from '../../../components/AddItemForm';

// Mock window.alert for all tests
beforeAll(() => {
  window.alert = vi.fn();
});

describe('AddItemForm Component', () => {
  it('renders form elements', () => {
    render(<AddItemForm isOpen={true} onClose={() => {}} onAddItem={vi.fn()} />);

    expect(screen.getByPlaceholderText('e.g., Whole Milk')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Units')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    const onAddItem = vi.fn();
    render(<AddItemForm isOpen={true} onClose={() => {}} onAddItem={onAddItem} />);

    const nameInput = screen.getByPlaceholderText('e.g., Whole Milk');
    const categorySelect = screen.getByLabelText('Category');
    const submitButton = screen.getByRole('button', { name: /add/i });

    await userEvent.type(nameInput, 'New Item');
    await userEvent.click(categorySelect);
    await userEvent.click(screen.getByText('Dairy'));
    await userEvent.click(submitButton);

    expect(onAddItem).toHaveBeenCalled();
  });

  it('validates required fields', () => {
    const onAddItem = vi.fn();
    render(<AddItemForm isOpen={true} onClose={() => {}} onAddItem={onAddItem} />);

    const submitButton = screen.getByRole('button', { name: /add/i });
    fireEvent.click(submitButton);

    expect(onAddItem).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Item name cannot be empty.');
  });

  it('calls onAddItem and onClose after successful submission', async () => {
    const onAddItem = vi.fn();
    const onClose = vi.fn();
    render(<AddItemForm isOpen={true} onClose={onClose} onAddItem={onAddItem} />);

    const nameInput = screen.getByPlaceholderText('e.g., Whole Milk');
    const categorySelect = screen.getByLabelText('Category');
    const submitButton = screen.getByRole('button', { name: /add/i });

    await userEvent.type(nameInput, 'New Item');
    await userEvent.click(categorySelect);
    await userEvent.click(screen.getByText('Dairy'));
    await userEvent.click(submitButton);

    expect(onAddItem).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
}); 