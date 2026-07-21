const MAX_PAGES = 100; // safety cap for --all pagination

function ninetyDaysAgoISO() {
  return new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Query one page of the audit log.
 * `id` filters to a single document (contact ID, opportunity ID, etc.).
 * Omit `id` for the account-wide feed.
 */
export async function searchAudit(client, { id, start, end, page = 1, pageSize = 20 } = {}) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  params.set('startAt', start || ninetyDaysAgoISO());
  params.set('endAt', end || new Date().toISOString());
  if (id) params.set('id', id);
  params.set('refresh', 'true');
  return client.get(`/audit/search/v2?${params.toString()}`);
}

/**
 * Pull every page until the API reports no more, merging logs + mongoLogs.
 * Pagination is page-based (cursor tokens are not accepted as query params).
 */
export async function searchAuditAll(client, opts = {}) {
  const pageSize = opts.pageSize || 50;
  let page = 1;
  const all = [];
  let lastPagination = null;
  while (page <= MAX_PAGES) {
    const res = await searchAudit(client, { ...opts, page, pageSize });
    const logs = [...(res.logs || []), ...(res.mongoLogs || [])];
    all.push(...logs);
    lastPagination = res.pagination || null;
    if (!lastPagination || !lastPagination.hasMore || logs.length === 0) break;
    page += 1;
  }
  return { logs: all, pages: page, pagination: lastPagination };
}

/** One-line human summary of a single audit event. */
export function formatEvent(l) {
  const ts = (l.createdAt || '').slice(0, 19).replace('T', ' ');
  const who = l.source || '?';
  const sid = (l.sourceId || '').slice(0, 8);
  const after = l.after || {};
  let detail = '';
  switch (l.type) {
    case 'TAG_ADDED':
      detail = '+tags ' + JSON.stringify(after.tagsAdded || []);
      break;
    case 'TAG_REMOVED':
      detail = '-tags ' + JSON.stringify(after.tagsRemoved || []);
      break;
    default:
      if (Array.isArray(after.customFields)) {
        detail = 'fields: ' + after.customFields
          .map(c => `${c.fieldName || c.id}=${c.fieldValue}`)
          .join(', ');
      } else if (after.pipelineStageName) {
        detail = 'stage-> ' + after.pipelineStageName;
      } else {
        detail = (l.changedFields || []).join(', ');
      }
  }
  const pad = (s, n) => String(s).padEnd(n);
  return `${ts}  ${pad(l.documentType || '', 11)} ${pad(l.type || '', 12)} via ${pad(who, 13)} ${pad(sid, 8)}  ${detail.slice(0, 70)}`;
}
