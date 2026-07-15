import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchConversations, sendMessage } from '../commands/conversations.js';

describe('conversations', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      locationId: 'LOC_ABC',
      CONVERSATIONS_VERSION: '2021-04-15',
    };
  });

  it('searchConversations calls GET with correct version', async () => {
    mockClient.get.mockResolvedValueOnce({ conversations: [{ id: 'cv1' }] });
    const result = await searchConversations(mockClient);
    expect(mockClient.get).toHaveBeenCalledWith('/conversations/search', {
      params: { locationId: 'LOC_ABC' },
      version: '2021-04-15',
    });
    expect(result).toHaveLength(1);
  });

  it('sendMessage posts SMS with locationId', async () => {
    mockClient.post.mockResolvedValueOnce({ messageId: 'm1' });
    await sendMessage(mockClient, { contactId: 'c1', message: 'Hello' });
    expect(mockClient.post).toHaveBeenCalledWith('/conversations/messages', {
      locationId: 'LOC_ABC', type: 'SMS', contactId: 'c1', message: 'Hello',
    }, { version: '2021-04-15' });
  });
});
