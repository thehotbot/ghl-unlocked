import { readConfig, writeConfig, addProfile, removeProfile, DEFAULT_CONFIG_PATH } from '../lib/config.js';

function getConfigPath() {
  return process.env.GHL_UNLOCKED_CONFIG || DEFAULT_CONFIG_PATH;
}

export function registerAuthCommands(program) {
  const auth = program.command('auth').description('Manage authentication profiles');

  auth
    .command('add')
    .description('Add a new auth profile (paste JSON from Chrome extension)')
    .requiredOption('--tokens <json>', 'JSON blob: {"ghl_jwt":"...","firebase_refresh_token":"...","location_id":"..."}')
    .option('--label <label>', 'Human-readable label')
    .action((opts, cmd) => {
      const configPath = getConfigPath();
      const profileName = cmd.parent.parent.opts().profile || 'default';
      const tokens = JSON.parse(opts.tokens);

      addProfile(profileName, {
        label: opts.label || profileName,
        ghl_jwt: tokens.ghl_jwt,
        ghl_jwt_expires_at: tokens.ghl_jwt_expires_at || Date.now() + 3600_000,
        firebase_refresh_token: tokens.firebase_refresh_token,
        location_id: tokens.location_id,
      }, configPath);
      console.log(`Profile "${profileName}" added.`);
    });

  auth
    .command('list')
    .description('List all auth profiles and token status')
    .action(() => {
      const configPath = getConfigPath();
      const config = readConfig(configPath);
      const profiles = Object.entries(config.profiles);
      if (profiles.length === 0) {
        console.log('No profiles configured. Run: ghl-unlocked auth add');
        return;
      }
      for (const [name, profile] of profiles) {
        const jwtValid = profile.ghl_jwt_expires_at > Date.now();
        const status = jwtValid ? 'JWT valid' : 'JWT expired';
        const hasRefresh = profile.firebase_refresh_token ? 'refresh token present' : 'no refresh token';
        console.log(`  ${name} — ${profile.label || '(no label)'} (${profile.location_id}) [${status}, ${hasRefresh}]`);
      }
    });

  auth
    .command('test')
    .description('Validate active token for a profile')
    .action(async (opts, cmd) => {
      const configPath = getConfigPath();
      const config = readConfig(configPath);
      const profileName = cmd.parent.parent.opts().profile || 'default';
      const profile = config.profiles[profileName];
      if (!profile) {
        console.error(`Profile "${profileName}" not found.`);
        process.exit(1);
      }

      const jwtValid = profile.ghl_jwt_expires_at > Date.now();
      if (jwtValid) {
        const minutesLeft = Math.round((profile.ghl_jwt_expires_at - Date.now()) / 60000);
        console.log(`Profile "${profileName}" — GHL JWT valid (${minutesLeft} min remaining).`);
      } else if (profile.firebase_refresh_token) {
        console.log(`Profile "${profileName}" — GHL JWT expired. Firebase refresh token available — will auto-refresh on next API call.`);
      } else {
        console.error(`Profile "${profileName}" — GHL JWT expired and no refresh token. Run: ghl-unlocked auth refresh`);
        process.exit(1);
      }
    });

  auth
    .command('refresh')
    .description('Re-paste tokens from Chrome extension')
    .requiredOption('--tokens <json>', 'JSON blob from Chrome extension')
    .action((opts, cmd) => {
      const configPath = getConfigPath();
      const profileName = cmd.parent.parent.opts().profile || 'default';
      const config = readConfig(configPath);
      const existing = config.profiles[profileName];
      if (!existing) {
        console.error(`Profile "${profileName}" not found. Use "auth add" first.`);
        process.exit(1);
      }

      const tokens = JSON.parse(opts.tokens);
      existing.ghl_jwt = tokens.ghl_jwt;
      existing.ghl_jwt_expires_at = tokens.ghl_jwt_expires_at || Date.now() + 3600_000;
      if (tokens.firebase_refresh_token) {
        existing.firebase_refresh_token = tokens.firebase_refresh_token;
      }
      if (tokens.location_id) {
        existing.location_id = tokens.location_id;
      }
      writeConfig(config, configPath);
      console.log(`Profile "${profileName}" refreshed.`);
    });

  auth
    .command('remove')
    .description('Remove an auth profile')
    .action((opts, cmd) => {
      const configPath = getConfigPath();
      const profileName = cmd.parent.parent.opts().profile || 'default';
      removeProfile(profileName, configPath);
      console.log(`Profile "${profileName}" removed.`);
    });
}
