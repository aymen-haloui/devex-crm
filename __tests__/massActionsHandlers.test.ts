import { handleMassAction } from '@/components/tables/massActionsHandlers';
import { toast } from 'sonner';

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    // generic call would be jest.fn(),
    // we don't use others in tests
  }
}));

describe('handleMassAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // reset prompt/confirm
    (global as any).prompt = jest.fn();
    (global as any).confirm = jest.fn();
    // stub window.open for print_view tests if needed
    (global as any).open = jest.fn(() => {
      return {
        document: { write: jest.fn(), close: jest.fn() },
        print: jest.fn()
      };
    });
    // simple fetch mock
    (global as any).fetch = jest.fn(async () => ({
      json: async () => ({ success: true, message: 'ok', data: {} })
    }));
  });

  it('shows error when no items selected', async () => {
    await handleMassAction('export', 'Thing', new Set(), []);
    expect(toast.error).toHaveBeenCalledWith('No items selected');
  });

  it('mass_email with no emails shows error', async () => {
    const items = [{ id: '1', email: '' }];
    await handleMassAction('mass_email', 'Thing', new Set(['1']), items);
    expect(toast.error).toHaveBeenCalledWith('No email addresses found on selected items');
  });

  it('mass_update sends request when prompts supply values', async () => {
    const items = [{ id: '1', foo: 'bar' }];
    (global as any).prompt
      .mockReturnValueOnce('status')
      .mockReturnValueOnce('active');
    await handleMassAction('mass_update', 'Thing', new Set(['1']), items);
    expect(global.fetch).toHaveBeenCalledWith('/api/mass-actions/update', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }));
    expect(toast.success).toHaveBeenCalled();
  });

  it('manage_tags triggers API call', async () => {
    const items = [{ id: 'a' }];
    (global as any).prompt.mockReturnValueOnce('blue');
    await handleMassAction('manage_tags', 'Thing', new Set(['a']), items);
    expect(global.fetch).toHaveBeenCalledWith('/api/mass-actions/tags', expect.any(Object));
    expect(toast.success).toHaveBeenCalled();
  });

  it('deduplicate calls server and alerts when duplicates exist', async () => {
    const duplicate = { id: '1', email: 'test@example.com' };
    const items = [duplicate, duplicate];
    // make fetch return a duplicates list
    (global as any).fetch.mockResolvedValueOnce({
      json: async () => ({ success: true, data: { duplicates: [{ group: [duplicate, duplicate] }] } })
    });
    window.alert = jest.fn();
    await handleMassAction('deduplicate', 'Thing', new Set(['1']), items);
    expect(global.fetch).toHaveBeenCalledWith('/api/mass-actions/dedupe', expect.any(Object));
    expect(window.alert).toHaveBeenCalled();
  });

  it('mass_convert calls convert endpoint', async () => {
    const items = [{ id: '1' }];
    await handleMassAction('mass_convert', 'Lead', new Set(['1']), items);
    expect(global.fetch).toHaveBeenCalledWith('/api/mass-actions/convert', expect.any(Object));
    expect(toast.success).toHaveBeenCalled();
  });
});
