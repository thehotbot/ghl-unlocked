import { buildPublicClient } from '../lib/client-builder.js';
import {
  searchContacts, getContact, createContact, updateContact,
  deleteContact, upsertContact, addContactTags, removeContactTags,
  getContactNotes, createContactNote, getContactTasks, createContactTask,
} from './contacts.js';

export function registerContactsCommands(program) {
  const contacts = program.command('contacts').description('Manage contacts');

  contacts
    .command('list')
    .description('List/search contacts')
    .option('-q, --query <query>', 'Search by name/email/phone')
    .option('-l, --limit <n>', 'Max results (default: 25)', parseInt)
    .option('--after <id>', 'Paginate: start after this contact ID')
    .action(async function(opts) {
      const { client } = buildPublicClient(this);
      const params = {};
      if (opts.query) params.query = opts.query;
      if (opts.limit) params.limit = opts.limit;
      if (opts.after) params.startAfterId = opts.after;
      const results = await searchContacts(client, params);
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(results, null, 2));
      } else {
        for (const c of results) {
          const name = [c.firstName, c.lastName].filter(Boolean).join(' ') || '(no name)';
          console.log(`  ${c.id}  ${name}  ${c.email || ''}  ${c.phone || ''}`);
        }
      }
    });

  contacts
    .command('get <id>')
    .description('Get contact details')
    .action(async function(id) {
      const { client } = buildPublicClient(this);
      const contact = await getContact(client, id);
      console.log(JSON.stringify(contact, null, 2));
    });

  contacts
    .command('create')
    .description('Create a new contact')
    .option('--email <email>', 'Email address')
    .option('--phone <phone>', 'Phone number')
    .option('--firstName <name>', 'First name')
    .option('--lastName <name>', 'Last name')
    .option('--tags <tags>', 'Comma-separated tags')
    .action(async function(opts) {
      const { client } = buildPublicClient(this);
      const data = {};
      if (opts.email) data.email = opts.email;
      if (opts.phone) data.phone = opts.phone;
      if (opts.firstName) data.firstName = opts.firstName;
      if (opts.lastName) data.lastName = opts.lastName;
      if (opts.tags) data.tags = opts.tags.split(',').map(t => t.trim());
      const result = await createContact(client, data);
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`Contact created: ${result.contact?.id || result.id}`);
      }
    });

  contacts
    .command('update <id>')
    .description('Update a contact')
    .option('--email <email>', 'Email address')
    .option('--phone <phone>', 'Phone number')
    .option('--firstName <name>', 'First name')
    .option('--lastName <name>', 'Last name')
    .action(async function(id, opts) {
      const { client } = buildPublicClient(this);
      const data = {};
      if (opts.email) data.email = opts.email;
      if (opts.phone) data.phone = opts.phone;
      if (opts.firstName) data.firstName = opts.firstName;
      if (opts.lastName) data.lastName = opts.lastName;
      const result = await updateContact(client, id, data);
      console.log(JSON.stringify(result, null, 2));
    });

  contacts
    .command('delete <id>')
    .description('Delete a contact')
    .action(async function(id) {
      const { client } = buildPublicClient(this);
      await deleteContact(client, id);
      console.log('Contact deleted.');
    });

  contacts
    .command('upsert')
    .description('Create or update contact (matches on email/phone)')
    .option('--email <email>', 'Email address')
    .option('--phone <phone>', 'Phone number')
    .option('--firstName <name>', 'First name')
    .option('--lastName <name>', 'Last name')
    .option('--tags <tags>', 'Comma-separated tags')
    .action(async function(opts) {
      const { client } = buildPublicClient(this);
      const data = {};
      if (opts.email) data.email = opts.email;
      if (opts.phone) data.phone = opts.phone;
      if (opts.firstName) data.firstName = opts.firstName;
      if (opts.lastName) data.lastName = opts.lastName;
      if (opts.tags) data.tags = opts.tags.split(',').map(t => t.trim());
      const result = await upsertContact(client, data);
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        const action = result.new ? 'created' : 'updated';
        console.log(`Contact ${action}: ${result.contact?.id || result.id}`);
      }
    });

  contacts
    .command('tag <id>')
    .description('Add or remove tags')
    .option('--add <tags>', 'Comma-separated tags to add')
    .option('--remove <tags>', 'Comma-separated tags to remove')
    .action(async function(id, opts) {
      const { client } = buildPublicClient(this);
      if (opts.add) {
        const tags = opts.add.split(',').map(t => t.trim());
        await addContactTags(client, id, tags);
        console.log(`Tags added: ${tags.join(', ')}`);
      }
      if (opts.remove) {
        const tags = opts.remove.split(',').map(t => t.trim());
        await removeContactTags(client, id, tags);
        console.log(`Tags removed: ${tags.join(', ')}`);
      }
    });

  contacts
    .command('notes <id>')
    .description('List or add notes')
    .option('--add <text>', 'Add a note')
    .action(async function(id, opts) {
      const { client } = buildPublicClient(this);
      if (opts.add) {
        await createContactNote(client, id, opts.add);
        console.log('Note added.');
      } else {
        const result = await getContactNotes(client, id);
        const notes = result.notes || [];
        if (this.parent.parent.opts().json) {
          console.log(JSON.stringify(notes, null, 2));
        } else {
          for (const n of notes) {
            console.log(`  [${n.dateAdded || ''}] ${n.body}`);
          }
        }
      }
    });

  contacts
    .command('tasks <id>')
    .description('List or add tasks')
    .option('--add <title>', 'Add a task')
    .option('--due <date>', 'Due date (YYYY-MM-DD)')
    .option('--description <text>', 'Task description')
    .action(async function(id, opts) {
      const { client } = buildPublicClient(this);
      if (opts.add) {
        const data = { title: opts.add };
        if (opts.due) data.dueDate = opts.due;
        if (opts.description) data.description = opts.description;
        await createContactTask(client, id, data);
        console.log('Task added.');
      } else {
        const result = await getContactTasks(client, id);
        const tasks = result.tasks || [];
        if (this.parent.parent.opts().json) {
          console.log(JSON.stringify(tasks, null, 2));
        } else {
          for (const t of tasks) {
            console.log(`  ${t.id}  ${t.title}  [${t.status || 'open'}]${t.dueDate ? ' due:' + t.dueDate : ''}`);
          }
        }
      }
    });
}
