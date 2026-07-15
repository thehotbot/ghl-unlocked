import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listProducts, getProduct, createProduct } from '../commands/products.js';

describe('products', () => {
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

  it('listProducts calls GET /products/ with locationId', async () => {
    mockClient.get.mockResolvedValueOnce({ products: [{ id: 'p1' }] });
    const result = await listProducts(mockClient, { search: 'widget' });
    expect(mockClient.get).toHaveBeenCalledWith('/products/', {
      params: { locationId: 'LOC_ABC', search: 'widget' },
    });
    expect(result.products).toHaveLength(1);
  });

  it('getProduct calls GET /products/{id}', async () => {
    mockClient.get.mockResolvedValueOnce({ id: 'p1', name: 'Widget' });
    const result = await getProduct(mockClient, 'p1');
    expect(mockClient.get).toHaveBeenCalledWith('/products/p1', {
      params: { locationId: 'LOC_ABC' },
    });
    expect(result.name).toBe('Widget');
  });

  it('createProduct posts with locationId', async () => {
    mockClient.post.mockResolvedValueOnce({ id: 'p2' });
    await createProduct(mockClient, { name: 'Gadget' });
    expect(mockClient.post).toHaveBeenCalledWith('/products/', {
      locationId: 'LOC_ABC',
      name: 'Gadget',
    });
  });
});
