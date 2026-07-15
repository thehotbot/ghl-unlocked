# GHL Unlocked

You are working in the GHL Unlocked repo — a CLI + Chrome extension that gives full workflow CRUD access to GoHighLevel via its internal (non-public) API.

## What this project does

The official GHL API doesn't expose workflow management. This tool works around that by using the same internal API that the GHL web app uses. A Chrome extension captures auth tokens from the user's browser session, and a Node.js CLI uses those tokens to make API calls.

## Setup

If the user hasn't set up yet, walk them through these steps:

```bash
cd ~/path/to/ghl-unlocked
node install.js
```

This does three things:
1. Creates `~/.ghl-unlocked/config.json` (token storage, mode 0600)
2. Links the CLI globally (`ghl-unlocked` command)
3. Copies the Claude Code skill to `~/.claude/skills/`

The Chrome extension must be loaded manually by the user:
1. `chrome://extensions` → Developer mode → Load unpacked → select `chrome-extension/`
2. Log into GHL (any domain — app.gohighlevel.com or white-label like app.thehotbot.ai)
3. Click extension icon, wait for green indicators, click "Copy Tokens"
4. `ghl-unlocked auth add --tokens '<paste>'`

**You cannot do the Chrome extension steps for the user.** Tell them what to do and wait for the token JSON.

## CLI commands

```bash
# Auth
ghl-unlocked auth add --tokens '<json>'    # Save tokens from extension
ghl-unlocked auth list                      # Show profiles + token status
ghl-unlocked auth test                      # Validate current token
ghl-unlocked auth refresh --tokens '<json>' # Re-paste expired tokens
ghl-unlocked auth remove                    # Delete a profile

# Workflows
ghl-unlocked wf list                        # List all workflows
ghl-unlocked wf get <id>                    # Full workflow JSON
ghl-unlocked wf get-steps <id>              # Just the action steps
ghl-unlocked wf create "Name"               # Create new workflow (draft)
ghl-unlocked wf create "Name" --status published
ghl-unlocked wf add-action <wfId> --type add_contact_tag --data '{"tag":"x"}'
ghl-unlocked wf add-action <wfId> --type wait --data '{"value":5,"unit":"minutes"}' --position 0

# Location queries
ghl-unlocked loc tags                       # List all tags
ghl-unlocked loc fields                     # List custom fields
ghl-unlocked loc fields --model contact     # Filter by model
ghl-unlocked loc values                     # List custom values/dropdowns

# Global flags
--profile <name>   # Use a named profile (default: "default")
--location <id>    # Override location ID
--json             # Machine-readable JSON output
```

**Supported action types:** `add_contact_tag`, `remove_contact_tag`, `update_contact_field`, `wait`, `sms`, `webhook`

## Architecture

- `cli/lib/client-builder.js` — shared auth client with two-tier token refresh
- `cli/lib/token-service.js` — JWT auto-refresh: cached JWT → Firebase refresh → GHL exchange
- `cli/lib/api-client.js` — HTTP client, adds required GHL headers to every request
- `cli/lib/config.js` — reads/writes `~/.ghl-unlocked/config.json`
- `cli/commands/workflows.js` — workflow API functions (list, get, create, save, addAction)
- `cli/commands/location.js` — location API functions (tags, fields, values)
- `cli/commands/workflow-cli.js` — CLI registration for `wf` commands
- `cli/commands/location-cli.js` — CLI registration for `loc` commands
- `cli/commands/auth.js` — CLI registration for `auth` commands

## Key technical details

**Auth flow:** Chrome extension intercepts GHL JWT from outbound XHR headers (background.js) and reads Firebase refresh token from IndexedDB (content.js). The CLI stores both. When JWT expires (~1hr), token-service.js automatically exchanges the Firebase refresh token for a new JWT without user intervention.

**API pattern:** All GHL internal API calls go to `backend.leadconnectorhq.com` with headers: `Authorization: Bearer {jwt}`, `channel: APP`, `source: WEB_USER`, `version: 2021-07-28`.

**Workflow save pattern:** GHL uses read-modify-write. There's no endpoint to add a single action — you GET the full workflow, modify `workflowData.templates[]`, and PUT the entire object back with `createdSteps`/`deletedSteps`/`modifiedSteps` arrays.

## Before modifying workflows

- Always `wf get <id>` to read the current state first
- Use `loc tags` to verify a tag exists before using it in `add_contact_tag`
- Use `loc fields` to get field IDs before using them in `update_contact_field`
- GHL validates tag names and field values — referencing nonexistent ones will fail

## Testing

```bash
npm test          # 38 tests across 7 test files
npm run test:watch
```

Tests use vitest with mocked API clients — no live GHL calls needed.

## Rules

- Never hardcode tokens or credentials in code
- Config file at `~/.ghl-unlocked/config.json` must stay mode 0600
- The Firebase API key in the code is a public client key (not a secret)
- Don't modify the Chrome extension's background.js webRequest filter — it must capture from `*://*.leadconnectorhq.com/*`
- Run `npm test` after any code changes
