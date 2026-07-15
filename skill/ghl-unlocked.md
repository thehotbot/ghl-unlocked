---
name: ghl-unlocked
description: Use when editing GHL workflows, adding workflow steps, building GHL automations, or using ghl-unlocked CLI commands. Triggers on "edit GHL workflow", "add workflow step", "build GHL automation", "modify workflow actions", "use ghl-unlocked".
---

# GHL Unlocked — Claude Skill

You have access to the `ghl-unlocked` CLI which provides full read/write access to GoHighLevel workflows via the internal API.

## When to use this vs the public GHL CLI (`ghl`)

| Use `ghl` (public API) for | Use `ghl-unlocked` (internal API) for |
|---|---|
| Contacts, conversations, opportunities | Workflow step creation and editing |
| Tags, custom fields, pipelines | Reading workflow actions/triggers |
| Calendar, payments, forms | Creating/cloning workflows |
| Anything in the public v2 API | Anything the GHL UI does that the API doesn't |

## Auth check

Before running any command, verify auth is working:
```bash
ghl-unlocked auth test --profile <profile>
```

If JWT is expired and no refresh token: user needs to re-grab tokens from the Chrome extension and run `ghl-unlocked auth refresh`.

## Available commands

### Auth
```bash
ghl-unlocked auth add --tokens '<json>' --label <label>          # Add profile (paste from extension)
ghl-unlocked auth list                                            # List profiles + status
ghl-unlocked auth test [--profile <name>]                         # Check token validity
ghl-unlocked auth refresh --tokens '<json>' [--profile <name>]    # Update tokens
ghl-unlocked auth remove [--profile <name>]                       # Delete profile
```

### Workflows
```bash
ghl-unlocked wf list [--profile <name>] [--json]
ghl-unlocked wf get <workflowId> [--profile <name>]
ghl-unlocked wf get-steps <workflowId> [--profile <name>]
ghl-unlocked wf add-action <workflowId> --type <type> --data '<json>' [--position <n>] [--profile <name>]
```

### Supported action types (MVP)
- `add_contact_tag` — `{"tag": "tag_name"}`
- `remove_contact_tag` — `{"tag": "tag_name"}`
- `update_contact_field` — `{"field": "field_id", "value": "new_value"}`
- `send_sms` — `{"message": "text"}`
- `wait` — `{"duration": seconds}`
- `webhook` — `{"url": "https://...", "method": "POST"}`

### Future commands (not yet implemented)
- `wf action-schema <type>` — Print schema for an action type
- `wf update-action`, `wf delete-action`, `wf reorder-actions`
- `wf create`, `wf clone`, `wf publish`, `wf unpublish`

## Multi-step workflow build pattern

1. Read existing workflow: `ghl-unlocked wf get <id> --json`
2. Plan changes based on current actions
3. Add actions in order: `ghl-unlocked wf add-action <id> --type <type> --data '<json>'`
4. Verify: `ghl-unlocked wf get-steps <id>`

## Global flags
- `--profile <name>` — which auth profile (default: "default")
- `--location <id>` — override location ID
- `--json` — raw JSON output

## Error handling
- **JWT expired, has refresh token** — auto-refreshes on next API call
- **JWT expired, no refresh token** — `ghl-unlocked auth refresh --tokens '<json>'`
- **403 Forbidden** — wrong location ID or insufficient permissions
- **Profile not found** — `ghl-unlocked auth list` to see available profiles
