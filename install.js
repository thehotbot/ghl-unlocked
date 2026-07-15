#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';

const HOME = os.homedir();
const CONFIG_DIR = path.join(HOME, '.ghl-unlocked');
const SKILL_SRC = path.join(import.meta.dirname, 'skill', 'ghl-unlocked.md');
const SKILL_DEST_DIR = path.join(HOME, '.claude', 'skills');
const SKILL_DEST = path.join(SKILL_DEST_DIR, 'ghl-unlocked.md');

function log(msg) { console.log(`  + ${msg}`); }
function warn(msg) { console.log(`  ! ${msg}`); }

console.log('\nGHL Unlocked — Setup\n');

// 1. Create config directory with default config
if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  const configFile = path.join(CONFIG_DIR, 'config.json');
  fs.writeFileSync(
    configFile,
    JSON.stringify({
      firebase_api_key: 'AIzaSyB_w3vXmsI7WeQtrIOkjR6xTRVN5uOieiE',
      profiles: {},
    }, null, 2) + '\n',
    { mode: 0o600 }
  );
  log(`Created config directory: ${CONFIG_DIR}`);
} else {
  log(`Config directory already exists: ${CONFIG_DIR}`);
}

// 2. Install CLI globally via npm link
try {
  execSync('npm install && npm link', { cwd: import.meta.dirname, stdio: 'pipe' });
  log('CLI installed globally (ghl-unlocked)');
} catch (err) {
  warn(`npm link failed — run manually: cd ${import.meta.dirname} && npm link`);
}

// 3. Install Claude skill
if (fs.existsSync(SKILL_SRC)) {
  fs.mkdirSync(SKILL_DEST_DIR, { recursive: true });
  fs.copyFileSync(SKILL_SRC, SKILL_DEST);
  log(`Claude skill installed: ${SKILL_DEST}`);
} else {
  warn('Skill file not found — skipping skill installation');
}

// 4. Next steps
console.log('\nNext steps:\n');
console.log('  1. Load the Chrome extension:');
console.log('     Chrome > Extensions > Developer Mode > Load Unpacked');
console.log(`     Select: ${path.join(import.meta.dirname, 'chrome-extension')}\n`);
console.log('  2. Navigate to GHL (app.gohighlevel.com or your white-label domain),');
console.log('     click the extension, click "Copy Tokens"\n');
console.log('  3. Run:');
console.log('     ghl-unlocked auth add --tokens \'<paste>\'\n');
console.log('  4. Test:');
console.log('     ghl-unlocked auth test\n');
