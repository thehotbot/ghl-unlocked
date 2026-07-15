import { buildPublicClient } from '../lib/client-builder.js';
import { listEmailCampaigns, listEmailTemplates } from './emails.js';

export function registerEmailsCommands(program) {
  const emails = program.command('emails').description('Email campaigns and templates');

  emails
    .command('campaigns')
    .description('List email campaigns')
    .action(async function() {
      const { client } = buildPublicClient(this);
      const result = await listEmailCampaigns(client);
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        const campaigns = result.campaigns || result.data || [];
        if (campaigns.length === 0) {
          console.log('No email campaigns found.');
          return;
        }
        for (const c of campaigns) {
          console.log(`  ${c.id}  ${c.name || c.subject || '(untitled)'}  [${c.status || 'unknown'}]`);
        }
      }
    });

  emails
    .command('templates')
    .description('List email templates')
    .action(async function() {
      const { client } = buildPublicClient(this);
      const result = await listEmailTemplates(client);
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        const templates = result.templates || result.data || [];
        if (templates.length === 0) {
          console.log('No email templates found.');
          return;
        }
        for (const t of templates) {
          console.log(`  ${t.id}  ${t.name || '(unnamed)'}`);
        }
      }
    });
}
