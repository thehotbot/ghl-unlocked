import { buildPublicClient } from '../lib/client-builder.js';
import { listEstimates, createEstimate, sendEstimate } from './estimates.js';

export function registerEstimatesCommands(program) {
  const est = program.command('est').description('Manage estimates and quotes');

  est
    .command('list')
    .description('List estimates')
    .action(async function() {
      const { client } = buildPublicClient(this);
      const result = await listEstimates(client);
      console.log(JSON.stringify(result, null, 2));
    });

  est
    .command('create')
    .description('Create an estimate')
    .requiredOption('--contact <id>', 'Contact ID')
    .requiredOption('--title <title>', 'Estimate title')
    .option('--currency <code>', 'Currency (default: USD)', 'USD')
    .option('--due <date>', 'Due date (YYYY-MM-DD)')
    .action(async function(opts) {
      const { client } = buildPublicClient(this);
      const data = {
        contactId: opts.contact,
        title: opts.title,
        currency: opts.currency,
      };
      if (opts.due) data.dueDate = opts.due;
      const result = await createEstimate(client, data);
      console.log(JSON.stringify(result, null, 2));
    });

  est
    .command('send <id>')
    .description('Send estimate by email')
    .option('--to <email>', 'Recipient email')
    .option('--subject <text>', 'Email subject')
    .action(async function(id, opts) {
      const { client } = buildPublicClient(this);
      const data = {};
      if (opts.to) data.email = opts.to;
      if (opts.subject) data.subject = opts.subject;
      await sendEstimate(client, id, data);
      console.log('Estimate sent.');
    });
}
