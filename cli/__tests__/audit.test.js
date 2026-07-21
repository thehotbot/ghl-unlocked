import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchAudit, searchAuditAll, formatEvent } from '../commands/audit.js';

describe('audit', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = { get: vi.fn() };
  });

  it('searchAudit builds the id + paging query string', async () => {
    mockClient.get.mockResolvedValueOnce({ logs: [], pagination: { hasMore: false } });
    await searchAudit(mockClient, {
      id: 'C1', start: '2026-05-22T05:00:00.000Z', end: '2026-07-22T04:59:59.999Z', page: 1, pageSize: 20,
    });
    const path = mockClient.get.mock.calls[0][0];
    expect(path).toContain('/audit/search/v2?');
    expect(path).toContain('id=C1');
    expect(path).toContain('page=1');
    expect(path).toContain('pageSize=20');
    expect(path).toContain('startAt=2026-05-22T05%3A00%3A00.000Z');
    expect(path).toContain('refresh=true');
  });

  it('searchAudit omits id when not provided (account-wide feed)', async () => {
    mockClient.get.mockResolvedValueOnce({ logs: [], pagination: { hasMore: false } });
    await searchAudit(mockClient, {});
    expect(mockClient.get.mock.calls[0][0]).not.toContain('id=');
  });

  it('searchAuditAll paginates until hasMore is false and merges logs + mongoLogs', async () => {
    mockClient.get
      .mockResolvedValueOnce({ logs: [{ _id: 'a' }], mongoLogs: [{ _id: 'b' }], pagination: { hasMore: true } })
      .mockResolvedValueOnce({ logs: [{ _id: 'c' }], mongoLogs: [], pagination: { hasMore: false } });
    const { logs, pages } = await searchAuditAll(mockClient, { id: 'C1' });
    expect(logs.map(l => l._id)).toEqual(['a', 'b', 'c']);
    expect(pages).toBe(2);
    expect(mockClient.get).toHaveBeenCalledTimes(2);
  });

  it('searchAuditAll stops when a page returns zero logs', async () => {
    mockClient.get
      .mockResolvedValueOnce({ logs: [{ _id: 'a' }], pagination: { hasMore: true } })
      .mockResolvedValueOnce({ logs: [], mongoLogs: [], pagination: { hasMore: true } });
    const { logs } = await searchAuditAll(mockClient, {});
    expect(logs).toHaveLength(1);
    expect(mockClient.get).toHaveBeenCalledTimes(2);
  });

  it('formatEvent renders tag adds with attribution', () => {
    const line = formatEvent({
      createdAt: '2026-07-20T18:01:26.690Z', documentType: 'CONTACT', type: 'TAG_ADDED',
      source: 'WORKFLOW_NEW', sourceId: 'e7428dd2-14c9-4599', after: { tagsAdded: ['responded'] },
    });
    expect(line).toContain('CONTACT');
    expect(line).toContain('TAG_ADDED');
    expect(line).toContain('WORKFLOW_NEW');
    expect(line).toContain('e7428dd2');
    expect(line).toContain('+tags ["responded"]');
  });

  it('formatEvent renders custom field updates', () => {
    const line = formatEvent({
      createdAt: '2026-07-20T18:01:03.000Z', documentType: 'CONTACT', type: 'UPDATED',
      source: 'WORKFLOW_NEW', sourceId: 'e7428dd2',
      after: { customFields: [{ fieldName: 'Lead Type', fieldValue: 'New' }] },
    });
    expect(line).toContain('fields: Lead Type=New');
  });
});
