# GHL Unlocked

Full workflow CRUD for GoHighLevel via its internal API. A Chrome extension grabs your auth tokens, and a CLI gives you direct access to workflows, tags, custom fields, and more — things the official API doesn't expose.

Built for GHL agencies that want to automate workflow management, integrate with AI agents, or just stop clicking through the UI for repetitive tasks.

## What You Get

- **Chrome extension** that captures your GHL session tokens (works on white-label domains too)
- **CLI** for workflow operations: list, inspect, create, add actions
- **Location queries**: list tags, custom fields, and dropdown values
- **Auto-refresh**: tokens refresh automatically via Firebase — no re-pasting every hour
- **Claude Code skill** for AI-assisted workflow building (optional)

## Quick Start

### Prerequisites

- Node.js 20+
- Chrome or Chromium-based browser
- A GHL account (agency or sub-account)

### 1. Clone and install

```bash
git clone https://github.com/thehotbot/ghl-unlocked.git
cd ghl-unlocked
node install.js
```

This creates `~/.ghl-unlocked/config.json`, links the CLI globally, and installs the Claude Code skill.

If `npm link` fails, install manually:

```bash
npm install
npm link
```

### 2. Load the Chrome extension

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `chrome-extension/` folder from this repo

### 3. Grab your tokens

1. Log into GHL (app.gohighlevel.com or your white-label domain)
2. Navigate to any page inside a sub-account (you need to be inside a location)
3. Click the **GHL Unlocked** extension icon in your toolbar
4. Wait for both status indicators to turn green:
   - **GHL JWT** — captured from your browser's API requests
   - **Firebase refresh token** — read from IndexedDB
5. Click **Copy Tokens**

### 4. Save tokens to the CLI

```bash
ghl-unlocked auth add --tokens '<paste the JSON here>'
```

That's it. To verify:

```bash
ghl-unlocked auth test
```

### 5. First command

```bash
ghl-unlocked wf list
```

You should see all workflows in your sub-account.

## Usage

### Workflow commands (`wf`)

```bash
# List all workflows
ghl-unlocked wf list

# Get full workflow detail (JSON)
ghl-unlocked wf get <workflowId>

# Get just the steps/actions
ghl-unlocked wf get-steps <workflowId>

# Create a new workflow
ghl-unlocked wf create "My New Workflow"
ghl-unlocked wf create "Published Flow" --status published

# Add an action to a workflow
ghl-unlocked wf add-action <workflowId> \
  --type add_contact_tag \
  --data '{"tag": "hot-lead"}'

# Add at a specific position
ghl-unlocked wf add-action <workflowId> \
  --type wait \
  --data '{"value": 5, "unit": "minutes"}' \
  --position 0
```

**Supported action types:** `add_contact_tag`, `remove_contact_tag`, `update_contact_field`, `wait`, `sms`, `webhook`

### Location queries (`loc`)

```bash
# List all tags
ghl-unlocked loc tags

# List custom fields
ghl-unlocked loc fields

# Filter fields by model
ghl-unlocked loc fields --model contact

# List custom values (dropdown options)
ghl-unlocked loc values
```

### Auth management (`auth`)

```bash
# List profiles and token status
ghl-unlocked auth list

# Test if your token is valid
ghl-unlocked auth test

# Re-paste tokens (when JWT expires and auto-refresh fails)
ghl-unlocked auth refresh --tokens '<paste>'

# Remove a profile
ghl-unlocked auth remove
```

### Multiple accounts

Use `--profile` to manage multiple GHL sub-accounts:

```bash
# Add a second profile
ghl-unlocked --profile client-a auth add --tokens '<paste>'

# Use it
ghl-unlocked --profile client-a wf list

# Override location ID on the fly
ghl-unlocked --location CHGd7qwUa8ht5t8Gu5tM wf list
```

### JSON output

Add `--json` for machine-readable output (pipe to `jq`, use in scripts):

```bash
ghl-unlocked --json wf list | jq '.[].name'
ghl-unlocked --json loc tags | jq '.[].name'
```

## How It Works

### Architecture

```
Chrome Extension          CLI                    GHL Internal API
+------------------+     +------------------+   +------------------+
| background.js    |     | workflow-cli.js  |   | backend.         |
| Intercepts JWT   |     | location-cli.js  |   | leadconnectorhq  |
| from XHR headers |     | auth.js          |   | .com             |
+--------+---------+     +--------+---------+   +--------+---------+
         |                        |                       |
| content.js       |     | token-service.js |             |
| Reads Firebase   |     | Auto-refreshes   +-------------+
| refresh token    |     | expired JWTs via |
| from IndexedDB   |     | Firebase         |
+--------+---------+     +------------------+
         |
| popup.js         |
| Bundles tokens   |
| for clipboard    |
+------------------+
```

### Auth flow

1. **Initial capture**: The Chrome extension intercepts your GHL JWT from outbound API requests and reads the Firebase refresh token from IndexedDB
2. **Token storage**: You paste the JSON blob into the CLI, which saves it to `~/.ghl-unlocked/config.json` (mode 0600)
3. **Auto-refresh**: When the GHL JWT expires (typically ~1 hour), the CLI automatically exchanges the Firebase refresh token for a new one — no manual re-pasting needed
4. **Fallback**: If the Firebase refresh token has also expired (rare), you'll be prompted to re-grab tokens from the extension

### API endpoints used

| Operation | Method | Endpoint |
|-----------|--------|----------|
| List workflows | GET | `/workflows/` |
| Get workflow + steps | GET | `/workflow/{locationId}/{workflowId}` |
| Save workflow | PUT | `/workflow/{locationId}/{workflowId}` |
| Create workflow | POST | `/workflow/{locationId}` |
| List tags | GET | `/locations/{locationId}/tags` |
| List custom fields | GET | `/locations/{locationId}/customFields` |
| List custom values | GET | `/locations/{locationId}/customValues` |

All requests require these headers:
- `Authorization: Bearer {ghl_jwt}`
- `channel: APP`
- `source: WEB_USER`
- `version: 2021-07-28`

## Security

**Token sensitivity**: Your GHL JWT grants full access to the sub-account it belongs to. Treat it like a password.

- Config file (`~/.ghl-unlocked/config.json`) is created with mode `0600` (owner read/write only)
- Never commit your config file or tokens to git
- The Firebase API key hardcoded in the code is a *public* client key (same for all GHL users) — it is not a secret
- Tokens are scoped to the sub-account you were logged into when you captured them
- If you suspect token compromise, log out of GHL in your browser (invalidates the Firebase refresh token)

## Claude Code Integration

The installer copies a Claude Code skill to `~/.claude/skills/ghl-unlocked.md`. This lets Claude assist with workflow operations during conversations:

```
"List all workflows and show me the steps in the onboarding workflow"
```

The skill teaches Claude the available CLI commands and GHL API patterns.

## Development

```bash
# Run tests
npm test

# Watch mode
npm run test:watch
```

### Project structure

```
ghl-unlocked/
  chrome-extension/     # Token grabber (Manifest V3)
    manifest.json
    background.js       # JWT interception via webRequest
    content.js          # Firebase IndexedDB reader
    popup.html/js       # Token display + clipboard
  cli/
    index.js            # CLI entry point (commander)
    commands/
      auth.js           # Profile management
      workflow-cli.js    # wf commands (list, get, create, add-action)
      workflows.js       # Workflow API functions
      location-cli.js   # loc commands (tags, fields, values)
      location.js       # Location API functions
    lib/
      api-client.js     # HTTP client with GHL headers
      config.js         # Config file read/write
      firebase.js       # Firebase token exchange
      token-service.js  # Two-tier JWT auto-refresh
  docs/
    endpoints.md        # Discovered API endpoint documentation
  skill/
    ghl-unlocked.md     # Claude Code skill file
  install.js            # One-command setup script
```

## License

MIT - The Hot Bot
