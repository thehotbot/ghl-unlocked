import { buildPublicClient } from '../lib/client-builder.js';
import { listInvoices, getInvoice, createInvoice, sendInvoice, voidInvoice, deleteInvoice, recordPayment, generateInvoiceNumber, listInvoiceTemplates } from './invoices.js';

export function registerInvoicesCommands(program) {
  const inv = program.command('inv').description('Manage invoices');

  inv
    .command('list')
    .description('List invoices')
    .option('--status <status>', 'Filter by status')
    .option('--contact <id>', 'Filter by contact')
    .option('-q, --query <query>', 'Search')
    .action(async function(opts) {
      const { client } = buildPublicClient(this);
      const params = {};
      if (opts.status) params.status = opts.status;
      if (opts.contact) params.contactId = opts.contact;
      if (opts.query) params.search = opts.query;
      const result = await listInvoices(client, params);
      console.log(JSON.stringify(result, null, 2));
    });

  inv
    .command('get <id>')
    .description('Get invoice details')
    .action(async function(id) {
      const { client } = buildPublicClient(this);
      const result = await getInvoice(client, id);
      console.log(JSON.stringify(result, null, 2));
    });

  inv
    .command('create')
    .description('Create an invoice')
    .requiredOption('--contact <id>', 'Contact ID')
    .requiredOption('--title <title>', 'Invoice title')
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
      const result = await createInvoice(client, data);
      console.log(JSON.stringify(result, null, 2));
    });

  inv
    .command('send <id>')
    .description('Send invoice by email')
    .option('--to <email>', 'Recipient email')
    .option('--subject <text>', 'Email subject')
    .action(async function(id, opts) {
      const { client } = buildPublicClient(this);
      const data = {};
      if (opts.to) data.email = opts.to;
      if (opts.subject) data.subject = opts.subject;
      await sendInvoice(client, id, data);
      console.log('Invoice sent.');
    });

  inv
    .command('void <id>')
    .description('Void an invoice')
    .action(async function(id) {
      const { client } = buildPublicClient(this);
      await voidInvoice(client, id);
      console.log('Invoice voided.');
    });

  inv
    .command('delete <id>')
    .description('Delete an invoice')
    .action(async function(id) {
      const { client } = buildPublicClient(this);
      await deleteInvoice(client, id);
      console.log('Invoice deleted.');
    });

  inv
    .command('record-payment <id>')
    .description('Record a payment on an invoice')
    .requiredOption('--amount <cents>', 'Amount in cents', parseInt)
    .option('--method <method>', 'Payment method')
    .option('--note <text>', 'Payment note')
    .action(async function(id, opts) {
      const { client } = buildPublicClient(this);
      const data = { amount: opts.amount };
      if (opts.method) data.method = opts.method;
      if (opts.note) data.note = opts.note;
      await recordPayment(client, id, data);
      console.log('Payment recorded.');
    });

  inv
    .command('number')
    .description('Generate next invoice number')
    .action(async function() {
      const { client } = buildPublicClient(this);
      const result = await generateInvoiceNumber(client);
      console.log(JSON.stringify(result, null, 2));
    });

  inv
    .command('templates')
    .description('List invoice templates')
    .action(async function() {
      const { client } = buildPublicClient(this);
      const result = await listInvoiceTemplates(client);
      console.log(JSON.stringify(result, null, 2));
    });
}
