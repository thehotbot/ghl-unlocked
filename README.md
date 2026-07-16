# GHL Unlocked

Full access to GoHighLevel from the command line. **19 command domains, 100+ operations, 55+ workflow action types** -- contacts, pipelines, workflows, funnels, calendars, invoices, and more.

What makes this different: workflow CRUD that the official API doesn't expose (create, clone, delete, add actions, publish, enroll contacts), funnel/form access, plus the entire public API surface in one CLI. Built for GHL agencies, AI agents, and power users.

## What You Get

- **19 command domains** -- contacts, opportunities, conversations, calendar, workflows, funnels, forms, invoices, estimates, products, payments, blog, social, media, emails, surveys, custom objects, location settings, auth
- **Workflow deep access** -- list, inspect steps, create, clone, delete, publish, add 55+ action types, enroll contacts (internal API, not available in official API)
- **Funnel and form access** -- list funnels, inspect pages, list forms (internal API)
- **Chrome extension** for token capture (works on white-label domains)
- **Two-tier auth** -- PIT for public API, JWT for internal API, auto-refresh via Firebase
- **AI-ready** -- JSON output, pipe to `jq`, works with Claude Code, Cursor, Codex CLI

## Quick Start

### Prerequisites

- **Node.js 20+** — check with `node -v` ([install](https://nodejs.org/))
- **npm** — comes with Node.js
- **Git** — to clone the repo
- **A GHL account** — agency or sub-account level access

Works on **macOS, Linux, and Windows**. No Python, Docker, or platform-specific dependencies.

### 1. Clone and install

```bash
git clone https://github.com/thehotbot/ghl-unlocked.git
cd ghl-unlocked
node install.js
```

### 2. Set up auth

**Option A: PIT only (quickest — covers contacts, opps, calendar, invoices, etc.)**

Get your Private Integration Token from GHL Settings > Business Profile > API Key, then:

```bash
ghl-unlocked auth add --pit <your-token> --location <your-location-id>
```

**Option B: Full access (adds workflow CRUD via internal API)**

1. Load the Chrome extension:
   - Open `chrome://extensions` and enable **Developer mode** (top-right toggle)
   - Click **Load unpacked** and navigate to `~/.ghl-unlocked/chrome-extension/`
   - **Mac:** In the file picker, press **Cmd+Shift+G** and paste: `~/.ghl-unlocked/chrome-extension`
   - **Windows:** Paste into the address bar: `%USERPROFILE%\.ghl-unlocked\chrome-extension`
   - **Linux:** Press **Ctrl+L** and paste the path
2. Log into GHL, click the extension icon, click "Copy Tokens"
3. Run:

```bash
ghl-unlocked auth add --tokens '<paste JSON>' --pit <your-pit>
```

### 3. Verify

```bash
ghl-unlocked auth test
ghl-unlocked contacts list
ghl-unlocked wf list
```

## Command Reference

### Contacts

```bash
ghl-unlocked contacts list                          # List all contacts
ghl-unlocked contacts list -q "john"                # Search
ghl-unlocked contacts get <id>                      # Get details
ghl-unlocked contacts create --email j@d.com --firstName John --tags "lead,vip"
ghl-unlocked contacts update <id> --phone "+1234567890"
ghl-unlocked contacts delete <id>
ghl-unlocked contacts upsert --email j@d.com --firstName John  # Create or update
ghl-unlocked contacts tag <id> --add "vip,client" --remove "lead"
ghl-unlocked contacts notes <id>                    # List notes
ghl-unlocked contacts notes <id> --add "Called today"
ghl-unlocked contacts tasks <id>                    # List tasks
ghl-unlocked contacts tasks <id> --add "Follow up" --due 2026-03-15
```

### Opportunities (Sales Pipeline)

```bash
ghl-unlocked opp search                             # List all
ghl-unlocked opp search -q "acme" --status open
ghl-unlocked opp get <id>
ghl-unlocked opp create --name "Acme Deal" --pipeline <pid> --contact <cid> --value 5000
ghl-unlocked opp update <id> --status won --value 7500
ghl-unlocked opp delete <id>
ghl-unlocked opp pipeline                           # List pipelines + stages
```

### Conversations

```bash
ghl-unlocked conv search                            # List conversations
ghl-unlocked conv search --status unread --contact <id>
ghl-unlocked conv messages <conversationId>
ghl-unlocked conv send --contact <id> --message "Hello!"
ghl-unlocked conv send --contact <id> --type email --subject "Follow up" --message "<p>Hi</p>"
```

### Calendar

```bash
ghl-unlocked cal list                               # List calendars
ghl-unlocked cal events <calId> --start 2026-03-01 --end 2026-03-31
ghl-unlocked cal slots <calId> --start 2026-03-12 --end 2026-03-15 --duration 30
ghl-unlocked cal book --calendar <calId> --contact <cid> --title "Kickoff" \
  --start "2026-03-13T10:00:00" --end "2026-03-13T10:30:00"
ghl-unlocked cal cancel <appointmentId>
```

### Workflows (Internal API)

```bash
# CRUD
ghl-unlocked wf list                                # List all workflows
ghl-unlocked wf get <id>                            # Full workflow JSON
ghl-unlocked wf get-steps <id>                      # Just the action steps
ghl-unlocked wf create "My Workflow"                # Create (draft)
ghl-unlocked wf clone <id> --name "Copy of Flow"    # Clone with remapped IDs
ghl-unlocked wf delete <id>                         # Delete a workflow
ghl-unlocked wf errors                              # Workflow error count

# Lifecycle
ghl-unlocked wf publish <id>                        # Publish (adds trigger if missing)
ghl-unlocked wf unpublish <id>                      # Set to draft
ghl-unlocked wf enroll <wfId> --contact <cid>       # Add contact to workflow
ghl-unlocked wf unenroll <wfId> --contact <cid>     # Remove contact

# Add actions
ghl-unlocked wf add-action <wfId> --type sms --data '{"body":"Hello!"}'
ghl-unlocked wf add-action <wfId> --type email --data '{"subject":"Hi","html":"<p>Hello</p>"}'
ghl-unlocked wf add-action <wfId> --type if_else --data '{"conditions":[{"operator":"contains","field":"contact.tags","value":"vip"}]}'
ghl-unlocked wf add-action <wfId> --type internal_create_opportunity --data '{"pipeline":"<pid>","stage":"<sid>","value":5000}'
ghl-unlocked wf add-action <wfId> --type custom_code --data '{"code":"return {result: contact.first_name}"}'
ghl-unlocked wf add-action <wfId> --type wait --data '{"value":5,"unit":"minutes"}' --position 0
```

**55+ supported action types:**

| Category | Types |
|----------|-------|
| Communication | `sms`, `email`, `voicemail`, `manual_call`, `whatsapp`, `facebook_messenger`, `instagram_dm`, `gmb_message`, `live_chat_message`, `internal_notification`, `conversation_ai` |
| Contact | `add_contact_tag`, `remove_contact_tag`, `update_contact_field`, `create_contact`, `find_contact`, `delete_contact`, `assign_user`, `remove_assigned_user`, `add_note`, `add_task`, `copy_contact`, `edit_conversation`, `set_dnd`, `add_contact_to_dnd`, `remove_contact_from_dnd` |
| Flow control | `wait`, `if_else`, `goto`, `add_to_workflow`, `remove_from_workflow`, `goal_event`, `end`, `split`, `drip`, `custom_code`, `math_operation` |
| Pipeline | `internal_create_opportunity`, `internal_update_opportunity`, `find_opportunity`, `delete_opportunity`, `remove_opportunity` |
| Integrations | `webhook`, `slack_message`, `google_sheets`, `fb_conversion_api`, `stripe_one_time_charge` |
| AI | `ai_prompt`, `conversation_ai` |
| Appointments | `update_appointment_status`, `booking_link` |
| IVR | `ivr_gather_input`, `ivr_play_message`, `ivr_connect_call`, `ivr_end_call` |
| Other | `send_invoice`, `send_review_request`, `course_grant_offer`, `course_revoke_offer` |

### Funnels (Internal API)

```bash
ghl-unlocked funnels list                           # List all funnels/sites
ghl-unlocked funnels get <id>                       # Funnel detail (domain, tracking, steps)
ghl-unlocked funnels pages <funnelId>               # List pages in a funnel
```

### Forms (Internal API)

```bash
ghl-unlocked forms list                             # List all forms
ghl-unlocked forms get <id>                         # Form detail
```

### Invoices

```bash
ghl-unlocked inv list                               # List invoices
ghl-unlocked inv get <id>
ghl-unlocked inv create --contact <cid> --title "March Retainer" --currency USD
ghl-unlocked inv send <id>                          # Email to client
ghl-unlocked inv void <id>
ghl-unlocked inv delete <id>
ghl-unlocked inv record-payment <id> --amount 5000  # $50.00 in cents
ghl-unlocked inv number                             # Generate next number
ghl-unlocked inv templates                          # List templates
```

### Estimates

```bash
ghl-unlocked est list
ghl-unlocked est create --contact <cid> --title "Website Quote" --currency USD
ghl-unlocked est send <id>
```

### Products

```bash
ghl-unlocked prod list
ghl-unlocked prod get <id>
ghl-unlocked prod create --name "Consulting Hour"
ghl-unlocked prod update <id> --name "Premium Hour"
ghl-unlocked prod delete <id>
ghl-unlocked prod prices <productId>
ghl-unlocked prod price-create <productId> --name "Standard" --amount 9900
ghl-unlocked prod collections
ghl-unlocked prod collection-create --name "Services"
ghl-unlocked prod inventory
```

### Payments

```bash
ghl-unlocked pay orders                             # List orders
ghl-unlocked pay order <id>
ghl-unlocked pay transactions
ghl-unlocked pay transaction <id>
ghl-unlocked pay subscriptions
ghl-unlocked pay subscription <id>
ghl-unlocked pay coupons
ghl-unlocked pay coupon-create --name "Summer20" --code SUMMER20 --type percentage --value 20
```

### Location Settings

```bash
ghl-unlocked loc get                                # Location details
ghl-unlocked loc tags                               # List tags
ghl-unlocked loc tag-create --name "Premium"
ghl-unlocked loc tag-delete <tagId>
ghl-unlocked loc fields                             # Custom fields
ghl-unlocked loc fields --model contact
ghl-unlocked loc field-create --name "Lead Source" --type TEXT
ghl-unlocked loc field-delete <fieldId>
ghl-unlocked loc values                             # Custom values
ghl-unlocked loc value-create --name "Source Options"
ghl-unlocked loc templates --originId <id>
```

### Blog

```bash
ghl-unlocked blog sites
ghl-unlocked blog posts <siteId>
ghl-unlocked blog post <postId>
ghl-unlocked blog post-create <siteId> --title "My Post" --content "<p>Hello</p>"
ghl-unlocked blog post-update <postId> --title "Updated"
ghl-unlocked blog post-delete <postId>
ghl-unlocked blog authors <siteId>
ghl-unlocked blog categories <siteId>
```

### Social Media

```bash
ghl-unlocked social list
ghl-unlocked social get <id>
ghl-unlocked social create --content "Hello from the CLI!"
ghl-unlocked social delete <id>
ghl-unlocked social accounts                        # Connected accounts
```

### Media

```bash
ghl-unlocked media list
ghl-unlocked media delete <id>
```

### Emails

```bash
ghl-unlocked emails campaigns
ghl-unlocked emails templates
```

### Surveys

```bash
ghl-unlocked surveys list
ghl-unlocked surveys submissions <surveyId>
```

### Custom Objects

```bash
ghl-unlocked obj schemas
ghl-unlocked obj schema <key>
ghl-unlocked obj records <schemaKey>
ghl-unlocked obj record <schemaKey> <id>
ghl-unlocked obj record-create <schemaKey> --data '{"name":"Acme"}'
ghl-unlocked obj record-update <schemaKey> <id> --data '{"name":"Acme Corp"}'
ghl-unlocked obj record-delete <schemaKey> <id>
```

### Auth Management

```bash
ghl-unlocked auth add --pit <token> --location <id>       # PIT-only setup
ghl-unlocked auth add --tokens '<json>' --pit <token>      # Full setup
ghl-unlocked auth set-pit <token>                          # Add/update PIT
ghl-unlocked auth list                                     # Show all profiles
ghl-unlocked auth test                                     # Check token status
ghl-unlocked auth refresh --tokens '<json>'                # Re-paste JWT tokens
ghl-unlocked auth remove                                   # Delete profile
```

### Global Flags

```bash
--profile <name>   # Named profile (default: "default")
--location <id>    # Override location ID
--json             # Machine-readable JSON output
```

## Piping and Scripting

```bash
# Extract emails from contacts
ghl-unlocked --json contacts list -q "john" | jq '.[].email'

# Count open deals
ghl-unlocked --json opp search --status open | jq 'length'

# Onboard a client
CONTACT=$(ghl-unlocked --json contacts upsert --email "john@acme.com" --firstName John | jq -r '.contact.id')
ghl-unlocked contacts tag $CONTACT --add "client"
ghl-unlocked opp create --name "John - Premium" --pipeline <pid> --contact $CONTACT --value 5000
```

## Two-Tier Auth

GHL Unlocked uses two APIs:

| API | Base URL | Auth | Used for |
|-----|----------|------|----------|
| **Public API v2** | `services.leadconnectorhq.com` | PIT (never expires) | Contacts, opps, calendar, invoices, etc. |
| **Internal API** | `backend.leadconnectorhq.com` | Session JWT (auto-refreshes) | Workflow CRUD, step inspection |

**Most users only need a PIT** -- it covers 16 of 19 command domains. The Chrome extension + JWT is only needed for workflow deep access, funnels, and forms.

## Security

- Config file (`~/.ghl-unlocked/config.json`) is created with mode `0600` (owner read/write only)
- Never commit your config file or tokens to git
- PIT tokens grant full access to the sub-account — treat like a password
- The Firebase API key in the code is a *public* client key (not a secret)
- If you suspect token compromise, rotate your PIT in GHL Settings

## AI Integration

The CLI is just shell commands — any AI coding assistant with terminal access can use it:

- **Claude Code** — full support. Includes `CLAUDE.md` and an installable skill.
- **Cursor / Windsurf / Copilot** — works out of the box.
- **Codex CLI / aider** — any terminal-based AI agent can run the commands.

Does NOT work with ChatGPT/Grok/Gemini web (no terminal access).

## Development

```bash
npm test              # 76 tests
npm run test:watch
```

## License

MIT - The Hot Bot
