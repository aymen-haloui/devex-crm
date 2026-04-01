import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EntityAutocomplete from '@/components/ui/EntityAutocomplete';

describe('EntityAutocomplete', () => {
  beforeEach(() => {
    global.fetch = jest.fn(async (url) => {
      const u = url as string;
      if (u.startsWith('/api/test')) {
        if (u.includes('id=')) {
          return { json: async () => ({ success: true, data: { id: '1', name: 'Alpha' } }) };
        }
        return { json: async () => ({ success: true, data: [{ id: '1', name: 'Alpha' }] }) };
      }
      return { json: async () => ({ success: true, data: {} }) };
    }) as any;
  });

  it('loads initial display when value provided', async () => {
    render(<EntityAutocomplete endpoint="/api/test" value="1" onChange={() => {}} />);
    await waitFor(() => expect(screen.getByDisplayValue('Alpha')).toBeInTheDocument());
  });

  it('searches and selects', async () => {
    const onChange = jest.fn();
    render(<EntityAutocomplete endpoint="/api/test" value="" onChange={onChange} placeholder="plh" />);
    const input = screen.getByPlaceholderText('plh');
    fireEvent.change(input, { target: { value: 'a' } });
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const option = await screen.findByText('Alpha');
    fireEvent.click(option);
    expect(onChange).toHaveBeenCalledWith('1');
  });
});
