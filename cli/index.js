#!/usr/bin/env node
import { Command } from 'commander';
import { registerAuthCommands } from './commands/auth.js';
import { registerWorkflowCommands } from './commands/workflow-cli.js';

const program = new Command();

program
  .name('ghl-unlocked')
  .description('Full GHL workflow access via internal API')
  .version('0.1.0');

// Global flags — profile is top-level, used by all command groups
program
  .option('--profile <name>', 'Auth profile to use', 'default')
  .option('--location <id>', 'Override location ID')
  .option('--json', 'Raw JSON output');

registerAuthCommands(program);
registerWorkflowCommands(program);

program.parse();
