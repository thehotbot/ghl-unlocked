#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';

const HOME = os.homedir();
const CONFIG_DIR = path.join(HOME, '.ghl-unlocked');
const EXT_SRC = path.join(import.meta.dirname, 'chrome-extension');
const EXT_DEST = path.join(CONFIG_DIR, 'chrome-extension');
const SKILL_SRC = path.join(import.meta.dirname, 'skill', 'ghl-unlocked.md');
const SKILL_DEST_DIR = path.join(HOME, '.claude', 'skills');
const SKILL_DEST = path.join(SKILL_DEST_DIR, 'ghl-unlocked.md');

function log(msg) { console.log(`  + ${msg}`); }
function warn(msg) { console.log(`  ! ${msg}`); }

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('\nGHL Unlocked — Setup\n');

// 1. Create config directory with default config
if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}
const configFile = path.join(CONFIG_DIR, 'config.json');
if (!fs.existsSync(configFile)) {
  fs.writeFileSync(
    configFile,
    JSON.stringify({
      firebase_api_key: 'AIzaSyB_w3vXmsI7WeQtrIOkjR6xTRVN5uOieiE',
      profiles: {},
    }, null, 2) + '\n',
    { mode: 0o600 }
  );
  log('Created config: ~/.ghl-unlocked/config.json');
} else {
  log('Config already exists (preserved)');
}

// 2. Copy Chrome extension to ~/.ghl-unlocked/chrome-extension/
if (fs.existsSync(EXT_SRC)) {
  copyDirSync(EXT_SRC, EXT_DEST);
  log(`Chrome extension installed: ${EXT_DEST}`);
} else {
  warn('Chrome extension source not found — skipping');
}

// 3. Install CLI globally via npm link
try {
  execSync('npm install && npm link', { cwd: import.meta.dirname, stdio: 'pipe' });
  log('CLI installed globally (ghl-unlocked)');
} catch (err) {
  warn(`npm link failed — run manually: cd ${import.meta.dirname} && npm link`);
}

// 4. Install Claude skill (optional — only if user has Claude Code)
if (fs.existsSync(SKILL_SRC)) {
  fs.mkdirSync(SKILL_DEST_DIR, { recursive: true });
  fs.copyFileSync(SKILL_SRC, SKILL_DEST);
  log('Claude Code skill installed (optional)');
} else {
  warn('Skill file not found — skipping');
}

// 5. Next steps
const isMac = process.platform === 'darwin';
const isWin = process.platform === 'win32';

console.log('\n' + '='.repeat(50));
console.log('Setup complete! Next steps:\n');
console.log('  1. Load the Chrome extension in your browser:');
console.log('     a. Open Chrome and go to: chrome://extensions');
console.log('     b. Turn on "Developer mode" (top-right toggle)');
console.log('     c. Click "Load unpacked"');
console.log('     d. Navigate to this folder:\n');
console.log(`        ${EXT_DEST}\n`);
if (isMac) {
  console.log('     Tip (Mac): The folder is hidden. In the file picker,');
  console.log('     press Cmd+Shift+G and paste the path above.\n');
} else if (isWin) {
  console.log('     Tip (Windows): The folder is hidden. In the file picker,');
  console.log('     paste the path above into the address bar at the top.\n');
} else {
  console.log('     Tip (Linux): The folder is hidden. In the file picker,');
  console.log('     press Ctrl+L and paste the path above.\n');
}
console.log('  2. Log into GHL (app.gohighlevel.com or your white-label domain)');
console.log('     Click the GHL Unlocked extension icon, then "Copy Tokens"\n');
console.log('  3. Paste your tokens:');
console.log("     ghl-unlocked auth add --tokens '<paste>' --pit <your-pit-token>\n");
console.log('  4. Verify:');
console.log('     ghl-unlocked auth test');
console.log('     ghl-unlocked contacts list\n');
