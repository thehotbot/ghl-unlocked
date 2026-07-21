import { buildAuditClient } from '../lib/client-builder.js';
import { searchAudit, searchAuditAll, formatEvent } from './audit.js';

export function registerAuditCommands(program) {
  const audit = program.command('audit').description('Audit log — who/what/when changed a record');

  audit
    .command('search')
    .description('Search the audit log (omit --contact for the account-wide feed)')
    .option('--contact <id>', 'Filter to one contact ID (its document ID)')
    .option('--id <id>', 'Filter to any document ID (opportunity, etc.)')
    .option('--start <iso>', 'Start timestamp (ISO 8601, default: 90 days ago)')
    .option('--end <iso>', 'End timestamp (ISO 8601, default: now)')
    .option('--limit <n>', 'Page size', v => parseInt(v, 10), 20)
    .option('--page <n>', 'Page number (1-indexed)', v => parseInt(v, 10), 1)
    .option('--all', 'Auto-paginate through the full history')
    .action(async function(opts) {
      const { client } = buildAuditClient(this);
      const id = opts.contact || opts.id;
      const json = this.parent.parent.opts().json;

      if (opts.all) {
        const { logs, pages } = await searchAuditAll(client, {
          id, start: opts.start, end: opts.end, pageSize: opts.limit || 50,
        });
        if (json) {
          console.log(JSON.stringify(logs, null, 2));
        } else {
          printTable(logs);
          console.log(`\n${logs.length} events across ${pages} page(s).`);
        }
        return;
      }

      const res = await searchAudit(client, {
        id, start: opts.start, end: opts.end, page: opts.page, pageSize: opts.limit,
      });
      if (json) {
        console.log(JSON.stringify(res, null, 2));
        return;
      }
      const logs = [...(res.logs || []), ...(res.mongoLogs || [])];
      printTable(logs);
      const more = res.pagination && res.pagination.hasMore;
      console.log(`\n${logs.length} events${more ? ' (more available — use --all or --page)' : ''}.`);
    });

  // Convenience alias: `audit contact <id>` == `audit search --contact <id> --all`
  audit
    .command('contact <id>')
    .description('Full change history for one contact (auto-paginated)')
    .option('--start <iso>', 'Start timestamp (ISO 8601, default: 90 days ago)')
    .option('--end <iso>', 'End timestamp (ISO 8601, default: now)')
    .action(async function(id, opts) {
      const { client } = buildAuditClient(this);
      const json = this.parent.parent.opts().json;
      const { logs, pages } = await searchAuditAll(client, { id, start: opts.start, end: opts.end });
      if (json) {
        console.log(JSON.stringify(logs, null, 2));
      } else {
        printTable(logs);
        console.log(`\n${logs.length} events across ${pages} page(s).`);
      }
    });
}

function printTable(logs) {
  const sorted = [...logs].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  for (const l of sorted) {
    console.log('  ' + formatEvent(l));
  }
}
