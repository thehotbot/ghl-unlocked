import { buildPublicClient } from '../lib/client-builder.js';
import { searchConversations, getConversation, sendMessage, sendEmail } from './conversations.js';

export function registerConversationsCommands(program) {
  const conv = program.command('conv').description('Manage conversations and messages');

  conv
    .command('search')
    .description('Search conversations')
    .option('-q, --query <query>', 'Search by keyword')
    .option('--status <status>', 'Filter: all|read|unread|starred|recents')
    .option('--contact <id>', 'Filter by contact ID')
    .action(async function(opts) {
      const { client } = buildPublicClient(this);
      const params = {};
      if (opts.query) params.query = opts.query;
      if (opts.status) params.status = opts.status;
      if (opts.contact) params.contactId = opts.contact;
      const convos = await searchConversations(client, params);
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(convos, null, 2));
      } else {
        for (const c of convos) {
          console.log(`  ${c.id}  ${c.contactName || c.contactId || '(unknown)'}  [${c.type || ''}]`);
        }
      }
    });

  conv
    .command('messages <conversationId>')
    .description('Get messages in a conversation')
    .option('-l, --limit <n>', 'Number of messages (default: 20)', parseInt)
    .action(async function(id, opts) {
      const { client } = buildPublicClient(this);
      const params = {};
      if (opts.limit) params.limit = opts.limit;
      const result = await getConversation(client, id, params);
      console.log(JSON.stringify(result, null, 2));
    });

  conv
    .command('send')
    .description('Send a message')
    .requiredOption('--contact <id>', 'Contact ID')
    .requiredOption('--message <text>', 'Message body')
    .option('--type <type>', 'Message type: sms|email (default: sms)', 'sms')
    .option('--subject <text>', 'Email subject (required for email)')
    .action(async function(opts) {
      const { client } = buildPublicClient(this);
      if (opts.type === 'email') {
        const result = await sendEmail(client, {
          contactId: opts.contact,
          html: opts.message,
          subject: opts.subject || '(no subject)',
        });
        console.log('Email sent.');
      } else {
        const result = await sendMessage(client, {
          contactId: opts.contact,
          message: opts.message,
        });
        console.log('SMS sent.');
      }
    });
}
