import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchContacts, getContact, createContact, upsertContact, addContactTags } from '../commands/contacts.js';

describe('contacts', () => {
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

  it('searchContacts calls GET /contacts/ with locationId', async () => {
    mockClient.get.mockResolvedValueOnce({ contacts: [{ id: 'c1', firstName: 'John' }] });
    const result = await searchContacts(mockClient, { query: 'john' });
    expect(mockClient.get).toHaveBeenCalledWith('/contacts/', { params: { locationId: 'LOC_ABC', query: 'john' } });
    expect(result).toHaveLength(1);
  });

  it('getContact calls GET /contacts/{id}', async () => {
    mockClient.get.mockResolvedValueOnce({ id: 'c1', firstName: 'John' });
    const result = await getContact(mockClient, 'c1');
    expect(mockClient.get).toHaveBeenCalledWith('/contacts/c1');
    expect(result.firstName).toBe('John');
  });

  it('createContact posts with locationId', async () => {
    mockClient.post.mockResolvedValueOnce({ contact: { id: 'c1' } });
    await createContact(mockClient, { email: 'j@d.com' });
    expect(mockClient.post).toHaveBeenCalledWith('/contacts/', { locationId: 'LOC_ABC', email: 'j@d.com' });
  });

  it('upsertContact posts to /contacts/upsert', async () => {
    mockClient.post.mockResolvedValueOnce({ contact: { id: 'c1' }, new: true });
    await upsertContact(mockClient, { email: 'j@d.com' });
    expect(mockClient.post).toHaveBeenCalledWith('/contacts/upsert', { locationId: 'LOC_ABC', email: 'j@d.com' });
  });

  it('addContactTags posts tags array', async () => {
    mockClient.post.mockResolvedValueOnce({ tags: ['vip'] });
    await addContactTags(mockClient, 'c1', ['vip']);
    expect(mockClient.post).toHaveBeenCalledWith('/contacts/c1/tags', { tags: ['vip'] });
  });
});
