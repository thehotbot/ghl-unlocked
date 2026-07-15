import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listOrders, getOrder, listTransactions } from '../commands/payments.js';

describe('payments', () => {
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

  it('listOrders calls GET /payments/orders with altId and altType', async () => {
    mockClient.get.mockResolvedValueOnce({ orders: [{ id: 'o1' }] });
    const result = await listOrders(mockClient);
    expect(mockClient.get).toHaveBeenCalledWith('/payments/orders', {
      params: { altId: 'LOC_ABC', altType: 'location' },
    });
    expect(result.orders).toHaveLength(1);
  });

  it('getOrder calls GET /payments/orders/{id}', async () => {
    mockClient.get.mockResolvedValueOnce({ id: 'o1', status: 'completed' });
    const result = await getOrder(mockClient, 'o1');
    expect(mockClient.get).toHaveBeenCalledWith('/payments/orders/o1');
    expect(result.status).toBe('completed');
  });

  it('listTransactions calls GET /payments/transactions with locationId', async () => {
    mockClient.get.mockResolvedValueOnce({ transactions: [{ id: 't1' }] });
    const result = await listTransactions(mockClient);
    expect(mockClient.get).toHaveBeenCalledWith('/payments/transactions', {
      params: { locationId: 'LOC_ABC' },
    });
    expect(result.transactions).toHaveLength(1);
  });
});
