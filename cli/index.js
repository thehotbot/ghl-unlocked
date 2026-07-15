#!/usr/bin/env node
import { Command } from 'commander';
import { registerAuthCommands } from './commands/auth.js';
import { registerWorkflowCommands } from './commands/workflow-cli.js';
import { registerLocationCommands } from './commands/location-cli.js';
import { registerContactsCommands } from './commands/contacts-cli.js';
import { registerOpportunitiesCommands } from './commands/opportunities-cli.js';
import { registerConversationsCommands } from './commands/conversations-cli.js';
import { registerCalendarCommands } from './commands/calendar-cli.js';
import { registerInvoicesCommands } from './commands/invoices-cli.js';
import { registerEstimatesCommands } from './commands/estimates-cli.js';
import { registerProductsCommands } from './commands/products-cli.js';
import { registerPaymentsCommands } from './commands/payments-cli.js';
import { registerBlogCommands } from './commands/blog-cli.js';
import { registerSocialCommands } from './commands/social-cli.js';
import { registerMediaCommands } from './commands/media-cli.js';
import { registerEmailsCommands } from './commands/emails-cli.js';
import { registerSurveysCommands } from './commands/surveys-cli.js';
import { registerObjectsCommands } from './commands/objects-cli.js';
import { registerFunnelsCommands } from './commands/funnels-cli.js';
import { registerFormsInternalCommands } from './commands/forms-internal-cli.js';

const program = new Command();

program
  .name('ghl-unlocked')
  .description('Full GHL access — workflows, contacts, pipelines, and more')
  .version('0.2.0');

// Global flags
program
  .option('--profile <name>', 'Auth profile to use', 'default')
  .option('--location <id>', 'Override location ID')
  .option('--json', 'Raw JSON output');

registerAuthCommands(program);
registerWorkflowCommands(program);
registerLocationCommands(program);
registerContactsCommands(program);
registerOpportunitiesCommands(program);
registerConversationsCommands(program);
registerCalendarCommands(program);
registerInvoicesCommands(program);
registerEstimatesCommands(program);
registerProductsCommands(program);
registerPaymentsCommands(program);
registerBlogCommands(program);
registerSocialCommands(program);
registerMediaCommands(program);
registerEmailsCommands(program);
registerSurveysCommands(program);
registerObjectsCommands(program);
registerFunnelsCommands(program);
registerFormsInternalCommands(program);

program.parse();
