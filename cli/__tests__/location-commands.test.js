import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listTags, listCustomFields, listCustomValues } from '../commands/location.js';

describe('location commands', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
    };
  });

  describe('listTags', () => {
    it('calls GET /locations/{locationId}/tags', async () => {
      mockClient.get.mockResolvedValueOnce({
        tags: [{ name: 's2l' }, { name: 'hot-lead' }],
      });
      const result = await listTags(mockClient, 'LOC_ABC');
      expect(mockClient.get).toHaveBeenCalledWith('/locations/LOC_ABC/tags');
      expect(result).toHaveLength(2);
    });

    it('returns empty array when no tags', async () => {
      mockClient.get.mockResolvedValueOnce({});
      const result = await listTags(mockClient, 'LOC_ABC');
      expect(result).toEqual([]);
    });
  });

  describe('listCustomFields', () => {
    it('calls GET /locations/{locationId}/customFields', async () => {
      mockClient.get.mockResolvedValueOnce({
        customFields: [
          { id: 'cf1', name: 'Lead Source', model: 'contact', dataType: 'TEXT' },
        ],
      });
      const result = await listCustomFields(mockClient, 'LOC_ABC');
      expect(mockClient.get).toHaveBeenCalledWith('/locations/LOC_ABC/customFields');
      expect(result).toHaveLength(1);
    });

    it('returns empty array when no custom fields', async () => {
      mockClient.get.mockResolvedValueOnce({});
      const result = await listCustomFields(mockClient, 'LOC_ABC');
      expect(result).toEqual([]);
    });
  });

  describe('listCustomValues', () => {
    it('calls GET /locations/{locationId}/customValues', async () => {
      mockClient.get.mockResolvedValueOnce({
        customValues: [
          { id: 'cv1', name: 'Source Options' },
        ],
      });
      const result = await listCustomValues(mockClient, 'LOC_ABC');
      expect(mockClient.get).toHaveBeenCalledWith('/locations/LOC_ABC/customValues');
      expect(result).toHaveLength(1);
    });

    it('returns empty array when no custom values', async () => {
      mockClient.get.mockResolvedValueOnce({});
      const result = await listCustomValues(mockClient, 'LOC_ABC');
      expect(result).toEqual([]);
    });
  });
});
