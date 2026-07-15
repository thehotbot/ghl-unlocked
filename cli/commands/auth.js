import { readConfig, writeConfig, addProfile, removeProfile, updateProfileField, DEFAULT_CONFIG_PATH } from '../lib/config.js';

function getConfigPath() {
  return process.env.GHL_UNLOCKED_CONFIG || DEFAULT_CONFIG_PATH;
}

export function registerAuthCommands(program) {
  const auth = program.command('auth').description('Manage authentication profiles');

  auth
    .command('add')
    .description('Add a new auth profile')
    .option('--tokens <json>', 'JSON blob from Chrome extension (for internal API / workflow CRUD)')
    .option('--pit <token>', 'Private Integration Token (for public API — contacts, opps, calendar, etc.)')
    .option('--location <id>', 'GHL Location ID (required unless provided in --tokens)')
    .option('--label <label>', 'Human-readable label')
    .action((opts, cmd) => {
      const configPath = getConfigPath();
      const profileName = cmd.parent.parent.opts().profile || 'default';

      const tokens = opts.tokens ? JSON.parse(opts.tokens) : {};
      const locationId = opts.location || tokens.location_id;

      if (!locationId) {
        console.error('Location ID required. Use --location <id> or include location_id in --tokens JSON.');
        process.exit(1);
      }

      const profileData = {
        label: opts.label || profileName,
        location_id: locationId,
      };

      if (opts.tokens) {
        profileData.ghl_jwt = tokens.ghl_jwt;
        profileData.ghl_jwt_expires_at = tokens.ghl_jwt_expires_at || Date.now() + 3600_000;
        profileData.firebase_refresh_token = tokens.firebase_refresh_token;
      }

      if (opts.pit) {
        profileData.pit = opts.pit;
      }

      addProfile(profileName, profileData, configPath);
      console.log(`Profile "${profileName}" added.`);
      if (profileData.pit) console.log('  PIT configured — public API commands ready.');
      if (profileData.ghl_jwt) console.log('  JWT configured — workflow CRUD ready.');
    });

  auth
    .command('set-pit <token>')
    .description('Set or update PIT (Private Integration Token) for a profile')
    .action((token, cmd) => {
      const configPath = getConfigPath();
      const profileName = cmd.parent.parent.opts().profile || 'default';
      const config = readConfig(configPath);
      const existing = config.profiles[profileName];

      if (!existing) {
        console.error(`Profile "${profileName}" not found. Use "auth add" first.`);
        process.exit(1);
      }

      updateProfileField(profileName, 'pit', token, configPath);
      console.log(`PIT updated for profile "${profileName}".`);
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
        const parts = [];

        // PIT status
        if (profile.pit) {
          parts.push('PIT ready');
        } else {
          parts.push('no PIT');
        }

        // JWT status
        if (profile.ghl_jwt) {
          const jwtValid = profile.ghl_jwt_expires_at > Date.now();
          parts.push(jwtValid ? 'JWT valid' : 'JWT expired');
          if (profile.firebase_refresh_token) parts.push('refresh token');
        } else {
          parts.push('no JWT');
        }

        console.log(`  ${name} — ${profile.label || '(no label)'} (${profile.location_id}) [${parts.join(', ')}]`);
      }
    });

  auth
    .command('test')
    .description('Validate active tokens for a profile')
    .action(async (opts, cmd) => {
      const configPath = getConfigPath();
      const config = readConfig(configPath);
      const profileName = cmd.parent.parent.opts().profile || 'default';
      const profile = config.profiles[profileName];
      if (!profile) {
        console.error(`Profile "${profileName}" not found.`);
        process.exit(1);
      }

      console.log(`Profile: "${profileName}" (${profile.location_id})`);

      // PIT status
      if (profile.pit) {
        console.log('  PIT: configured — public API commands ready');
      } else {
        console.log('  PIT: not set — run: ghl-unlocked auth set-pit <token>');
      }

      // JWT status
      if (profile.ghl_jwt) {
        const jwtValid = profile.ghl_jwt_expires_at > Date.now();
        if (jwtValid) {
          const minutesLeft = Math.round((profile.ghl_jwt_expires_at - Date.now()) / 60000);
          console.log(`  JWT: valid (${minutesLeft} min remaining)`);
        } else if (profile.firebase_refresh_token) {
          console.log('  JWT: expired — will auto-refresh on next API call');
        } else {
          console.log('  JWT: expired, no refresh token — run: ghl-unlocked auth refresh');
        }
      } else {
        console.log('  JWT: not set — use Chrome extension for workflow CRUD');
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
