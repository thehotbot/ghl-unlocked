import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listInvoices, getInvoice, createInvoice } from '../commands/invoices.js';

describe('invoices', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      locationId: 'LOC_ABC',
    };
  });

  it('listInvoices calls GET /invoices/ with altId and altType', async () => {
    mockClient.get.mockResolvedValueOnce({ invoices: [{ id: 'inv1' }] });
    const result = await listInvoices(mockClient, { status: 'sent' });
    expect(mockClient.get).toHaveBeenCalledWith('/invoices/', {
      params: { altId: 'LOC_ABC', altType: 'location', status: 'sent' },
    });
    expect(result.invoices).toHaveLength(1);
  });

  it('getInvoice calls GET /invoices/{id}', async () => {
    mockClient.get.mockResolvedValueOnce({ id: 'inv1', title: 'Test Invoice' });
    const result = await getInvoice(mockClient, 'inv1');
    expect(mockClient.get).toHaveBeenCalledWith('/invoices/inv1', {
      params: { altId: 'LOC_ABC', altType: 'location' },
    });
    expect(result.title).toBe('Test Invoice');
  });

  it('createInvoice posts with altId and altType', async () => {
    mockClient.post.mockResolvedValueOnce({ id: 'inv2' });
    await createInvoice(mockClient, { contactId: 'c1', title: 'New' });
    expect(mockClient.post).toHaveBeenCalledWith('/invoices/', {
      altId: 'LOC_ABC',
      altType: 'location',
      contactId: 'c1',
      title: 'New',
    });
  });
});
