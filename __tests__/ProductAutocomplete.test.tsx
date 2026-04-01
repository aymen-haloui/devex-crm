import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductAutocomplete from '@/components/ui/ProductAutocomplete';

// mock fetch
beforeEach(() => {
  global.fetch = jest.fn(async (url) => {
    if ((url as string).startsWith('/api/products')) {
      return {
        json: async () => ({ success: true, data: [{ id: '1', name: 'Foo' }] }),
      };
    }
    return { json: async () => ({}) };
  }) as any;
});

describe('ProductAutocomplete', () => {
  it('calls onChange when an item selected', async () => {
    const handle = jest.fn();
    render(<ProductAutocomplete value="" onChange={handle} placeholder="Search" />);
    const input = screen.getByPlaceholderText('Search');
    fireEvent.change(input, { target: { value: 'f' } });

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    // click on first item
    const option = await screen.findByText('Foo');
    fireEvent.click(option);
    expect(handle).toHaveBeenCalledWith('1');
  });
});
