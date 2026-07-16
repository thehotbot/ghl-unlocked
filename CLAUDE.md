# GHL Unlocked

CLI + Chrome extension for full GoHighLevel access. 19 command domains, 100+ operations, 55+ workflow action types. Wraps both the public API v2 and the internal API (for workflow CRUD, funnels, and forms that the public API doesn't expose).

## Setup

```bash
node install.js
```

Two auth methods:
- **PIT** (Private Integration Token) — covers 15/17 domains. Simple, no expiry.
- **JWT** (session token via Chrome extension) — needed for workflow deep access (`wf get-steps`, `wf add-action`)

```bash
# PIT only (most users)
ghl-unlocked auth add --pit <token> --location <locationId>

# Full access (PIT + JWT)
ghl-unlocked auth add --tokens '<json from extension>' --pit <token>

# Add PIT to existing profile
ghl-unlocked auth set-pit <token>
```

**You cannot do the Chrome extension steps for the user.** Tell them to load the extension, log into GHL, click "Copy Tokens".

## All Commands

```bash
# Auth
auth add [--pit <token>] [--tokens <json>] [--location <id>]
auth set-pit <token>       # Add/update PIT
auth list | test | refresh --tokens '<json>' | remove

# Contacts (PIT)
contacts list [-q <query>] [-l <limit>] [--after <id>]
contacts get|delete <id>
contacts create|upsert [--email] [--phone] [--firstName] [--lastName] [--tags]
contacts update <id> [--email] [--phone] [--firstName] [--lastName]
contacts tag <id> [--add <tags>] [--remove <tags>]
contacts notes <id> [--add <text>]
contacts tasks <id> [--add <title>] [--due <date>]

# Opportunities (PIT)
opp search [-q] [--pipeline <id>] [--status open|won|lost|abandoned]
opp get|delete <id>
opp create --name <n> --pipeline <pid> --contact <cid> [--stage <sid>] [--value <n>]
opp update <id> [--name] [--status] [--value] [--stage]
opp pipeline                # List pipelines + stages

# Conversations (PIT)
conv search [-q] [--status all|read|unread|starred] [--contact <id>]
conv messages <conversationId> [-l <limit>]
conv send --contact <id> --message <text> [--type sms|email] [--subject]

# Calendar (PIT)
cal list
cal events <calId> [--start] [--end]
cal slots <calId> --start <date> --end <date> [--duration <min>] [--timezone]
cal book --calendar <id> --contact <id> --title <t> --start <iso> --end <iso>
cal cancel <appointmentId>

# Workflows (JWT -- internal API)
wf list | get|get-steps <id>
wf create <name> [--status draft|published]
wf clone <id> [--name <n>]         # Clone with remapped step IDs
wf delete <id>
wf publish|unpublish <id>          # Publish adds trigger if missing
wf enroll <wfId> --contact <cid>   # Add contact to workflow
wf unenroll <wfId> --contact <cid>
wf errors                          # Workflow error count
wf add-action <wfId> --type <type> --data '<json>' [--position <n>]
# 55+ action types: sms, email, wait, if_else, custom_code, add_contact_tag,
# internal_create_opportunity, assign_user, webhook, slack_message, google_sheets,
# ai_prompt, voicemail, whatsapp, and 40+ more (see README for full list)

# Funnels (JWT -- internal API)
funnels list | get <id> | pages <funnelId>

# Forms (JWT -- internal API)
forms list | get <id>

# Location (PIT)
loc get | tags | fields [--model] | values
loc tag-create --name <n> | tag-delete <id>
loc field-create --name <n> --type <t> [--model] | field-delete <id>
loc value-create --name <n>
loc templates --originId <id> [--type sms|email]

# Invoices (PIT)
inv list [--status] [--contact] [-q] | get|delete|void <id>
inv create --contact <cid> --title <t> [--currency] [--due]
inv send <id> [--to] [--subject]
inv record-payment <id> --amount <cents> [--method] [--note]
inv number | templates

# Estimates (PIT)
est list | create --contact <cid> --title <t> | send <id>

# Products (PIT)
prod list [-q] | get|delete <id>
prod create --name <n> | update <id> [--name]
prod prices <productId> | price-create <productId> --name <n> --amount <cents>
prod collections | collection-create --name <n> | inventory

# Payments (PIT)
pay orders | order <id> | transactions | transaction <id>
pay subscriptions | subscription <id>
pay coupons | coupon-create --name --code --type --value

# Blog (PIT)
blog sites | posts <siteId> | post <id>
blog post-create <siteId> --title --content | post-update <id> | post-delete <id>
blog authors|categories <siteId>

# Social (PIT)
social list | get|delete <id> | create --content <text> | accounts

# Media (PIT)
media list | delete <id>

# Emails (PIT)
emails campaigns | templates

# Surveys (PIT)
surveys list | submissions <surveyId>

# Objects (PIT)
obj schemas | schema <key>
obj records <schemaKey> | record <schemaKey> <id>
obj record-create <schemaKey> --data '<json>'
obj record-update <schemaKey> <id> --data '<json>'
obj record-delete <schemaKey> <id>

# Global flags
--profile <name>   --location <id>   --json
```

## Architecture

Two API clients:
- `cli/lib/api-client.js` — internal API (`backend.leadconnectorhq.com`), JWT auth, GHL headers
- `cli/lib/public-api-client.js` — public API v2 (`services.leadconnectorhq.com`), PIT auth, Version header
- `cli/lib/client-builder.js` — `buildClient()` for internal, `buildPublicClient()` for public

Each domain has two files: `{domain}.js` (API functions) and `{domain}-cli.js` (CLI registration).

## Testing

```bash
npm test          # 76 tests across 16 test files
```

## Rules

- Never hardcode tokens or credentials
- Config file must stay mode 0600
- Run `npm test` after code changes
- Before modifying workflows: `wf get <id>` first, `loc tags` to verify tags exist
