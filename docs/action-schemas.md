# GHL Workflow Builder — Action & Trigger Configuration Schemas

Deep reference for every configurable field inside each workflow action type.
Source: reverse-engineered from GHL frontend, live workflow inspection, internal API payloads, and community MCP implementations.

> For API endpoints see [api-reference.md](api-reference.md). For the step linking model see [data-schemas.md](data-schemas.md).

---

## Table of Contents

1. [Action Step Envelope](#action-step-envelope)
2. [Communication Actions](#communication-actions) (sms, email, voicemail, manual_call, live_chat_message, facebook_messenger, instagram_dm, whatsapp, gmb_message)
3. [Contact Management](#contact-management) (add_contact_tag, remove_contact_tag, update_contact_field, add_contact_to_dnd, remove_contact_from_dnd, delete_contact)
4. [Workflow Control](#workflow-control) (wait, if_else, goto, add_to_workflow, remove_from_workflow, goal_event, end)
5. [Opportunity / Pipeline](#opportunity--pipeline) (internal_create_opportunity, internal_update_opportunity, find_opportunity, delete_opportunity)
6. [User / Team](#user--team) (assign_user, internal_notification)
7. [External Actions](#external-actions) (webhook, custom_code, custom_webhook)
8. [Integrations](#integrations) (slack_message, google_sheets, google_calendar_event, stripe_create_invoice, facebook_conversion, google_ads_conversion, quickbooks, tiktok_conversion)
9. [Math / Calculation](#math--calculation) (math_operation)
10. [Reviews & Reputation](#reviews--reputation) (send_review_request)
11. [Invoicing & Payments](#invoicing--payments) (create_invoice, create_text2pay)
12. [Drip Mode](#drip-mode) (drip)
13. [AI Actions](#ai-actions) (openai_completion, conversation_ai)
14. [Multi-Path / Branching](#multi-path--branching) (transition, split)
15. [Trigger Types](#trigger-types)
16. [Condition Operators](#condition-operators)
17. [Template Variables](#template-variables)

---

## Action Step Envelope

Every action step lives in the `templates` array and shares this envelope:

```json
{
  "id": "uuid-v4",
  "order": 0,
  "name": "Display Name",
  "type": "action_type",
  "attributes": { /* action-specific config */ },
  "next": "next-step-uuid | [branch-a-uuid, branch-b-uuid] | null",
  "parentKey": "previous-step-uuid | null",
  "parent": "parent-step-uuid (for branch children)",
  "cat": "category-string (conditions, multi-path, transition)",
  "nodeType": "condition-node | branch-yes | branch-no",
  "sibling": ["sibling-step-uuids (parallel branches)"]
}
```

**Step linking rules:**
- Linear: `next` is a string (single UUID) or `[single-uuid]`
- Branching (if/else, find_opportunity): `next` is an array of UUIDs, one per branch
- Terminal: `next` is `null` (end of chain)
- `parentKey` always points backward to the immediately preceding step
- `parent` and `sibling` are used for branch children (transition steps)

---

## Communication Actions

### sms

Sends an SMS message to the contact.

```json
{
  "type": "sms",
  "attributes": {
    "body": "Hi {{contact.first_name}}, reminder about your appointment tomorrow!",
    "mediaUrls": ["https://example.com/image.jpg"],
    "fromNumber": "+1234567890",
    "testMode": false
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `body` | string | Yes | Message text. Supports template variables. Max 1600 chars. |
| `mediaUrls` | string[] | No | MMS media attachment URLs (images, PDFs). Max 10. |
| `fromNumber` | string | No | Override sender number. Omit to use location default. |
| `testMode` | boolean | No | If true, logs but doesn't actually send. |

---

### email

Sends an email to the contact.

```json
{
  "type": "email",
  "attributes": {
    "subject": "Welcome to {{location.name}}, {{contact.first_name}}!",
    "html": "<p>Hi {{contact.first_name}},</p><p>Thanks for signing up.</p>",
    "from_name": "Support Team",
    "from_email": "hello@example.com",
    "reply_to": "reply@example.com",
    "attachments": [],
    "templateId": "email-template-uuid",
    "cc": [],
    "bcc": [],
    "trackOpens": true,
    "trackClicks": true
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `subject` | string | Yes (unless templateId) | Email subject line. Supports variables. |
| `html` | string | Yes (unless templateId) | HTML body content. Supports variables. |
| `from_name` | string | No | Sender display name. Defaults to location name. |
| `from_email` | string | No | Sender email. Must be verified domain. |
| `reply_to` | string | No | Reply-to address. |
| `templateId` | string | No | Use a saved email template by ID. Overrides subject/html. |
| `attachments` | array | No | File attachment objects. |
| `cc` | string[] | No | CC recipients. |
| `bcc` | string[] | No | BCC recipients. |
| `trackOpens` | boolean | No | Track email opens (default true). |
| `trackClicks` | boolean | No | Track link clicks (default true). |

---

### voicemail

Drops a ringless voicemail.

```json
{
  "type": "voicemail",
  "attributes": {
    "audioUrl": "https://example.com/voicemail.mp3",
    "ttsMessage": "Hi {{contact.first_name}}, we have a special offer for you.",
    "voiceType": "tts"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `audioUrl` | string | Conditional | URL to pre-recorded audio file. Required if voiceType is "audio". |
| `ttsMessage` | string | Conditional | Text-to-speech message. Required if voiceType is "tts". |
| `voiceType` | `"tts"` or `"audio"` | Yes | Whether to use TTS or a pre-recorded file. |

---

### manual_call

Creates a manual call task for a user.

```json
{
  "type": "manual_call",
  "attributes": {
    "message": "Call {{contact.first_name}} about their inquiry",
    "userType": "assigned",
    "userId": "specific-user-id"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | No | Task description for the user. |
| `userType` | `"assigned"` or `"specific"` | No | Who should make the call. |
| `userId` | string | Conditional | Required if userType is "specific". |

---

### live_chat_message / facebook_messenger / instagram_dm / whatsapp / gmb_message

Channel-specific messaging. All share the same base schema as `sms`.

```json
{
  "type": "live_chat_message",
  "attributes": {
    "body": "Welcome! How can I help you today?",
    "mediaUrls": []
  }
}
```

Type strings: `"live_chat_message"`, `"facebook_messenger"`, `"instagram_dm"`, `"whatsapp"`, `"gmb_message"`

---

## Contact Management

### add_contact_tag

```json
{
  "type": "add_contact_tag",
  "attributes": {
    "tags": ["new-lead", "campaign-2024"]
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `tags` | string[] | Yes | Tag names to add. Creates tags if they don't exist. |

---

### remove_contact_tag

```json
{
  "type": "remove_contact_tag",
  "attributes": {
    "tags": ["old-tag"],
    "type": "remove_contact_tag"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `tags` | string[] | Yes | Tag names to remove. |
| `type` | string | No | Redundant type field (GHL quirk — include it for safety). |

---

### update_contact_field

Updates a standard or custom field on the contact.

```json
{
  "type": "update_contact_field",
  "attributes": {
    "fieldKey": "contact.city",
    "fieldValue": "New York",
    "appendValue": false
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fieldKey` | string | Yes | Dot-notation field path. See field key reference below. |
| `fieldValue` | string | Yes | Value to set. Supports template variables. |
| `appendValue` | boolean | No | If true, append to existing value instead of replacing. |

**Standard field keys:**
`contact.first_name`, `contact.last_name`, `contact.email`, `contact.phone`, `contact.address1`, `contact.city`, `contact.state`, `contact.postal_code`, `contact.country`, `contact.company_name`, `contact.website`, `contact.source`, `contact.date_of_birth`, `contact.timezone`

**Custom fields:** Use the custom field key from GHL, e.g. `contact.custom_field_key_here`

---

### add_contact_to_dnd

Adds the contact to Do Not Disturb list.

```json
{
  "type": "add_contact_to_dnd",
  "attributes": {
    "channel": "all"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `channel` | string | No | `"all"`, `"sms"`, `"email"`, `"phone"`, `"whatsapp"`, `"gmb"`, `"fb"` |

---

### remove_contact_from_dnd

Removes the contact from Do Not Disturb list.

```json
{
  "type": "remove_contact_from_dnd",
  "attributes": {
    "channel": "all"
  }
}
```

---

### delete_contact

Permanently deletes the contact. Use with extreme caution.

```json
{
  "type": "delete_contact",
  "attributes": {}
}
```

---

## Workflow Control

### wait

Pauses workflow execution. Multiple wait strategies available.

**Time-based delay:**
```json
{
  "type": "wait",
  "attributes": {
    "type": "time",
    "startAfter": {
      "type": "minutes",
      "value": 30,
      "when": "after"
    },
    "name": "Wait 30 Minutes",
    "isHybridAction": true,
    "hybridActionType": "wait"
  }
}
```

**Wait until specific time of day:**
```json
{
  "type": "wait",
  "attributes": {
    "type": "time",
    "startAfter": {
      "type": "specific_time",
      "value": "09:00",
      "when": "after",
      "dayOfWeek": ["mon", "tue", "wed", "thu", "fri"],
      "timezone": "America/New_York"
    },
    "isHybridAction": true,
    "hybridActionType": "wait"
  }
}
```

**Wait until specific date:**
```json
{
  "type": "wait",
  "attributes": {
    "type": "time",
    "startAfter": {
      "type": "specific_date",
      "value": "2024-12-25T09:00:00",
      "when": "after"
    },
    "isHybridAction": true,
    "hybridActionType": "wait"
  }
}
```

**Appointment-based wait (wait until X before/after appointment):**
```json
{
  "type": "wait",
  "attributes": {
    "type": "appointment",
    "startAfter": {
      "type": "hours",
      "value": 24,
      "when": "before",
      "appointmentField": "start_time"
    },
    "isHybridAction": true,
    "hybridActionType": "wait"
  }
}
```

**Event-based wait (wait for a contact event):**
```json
{
  "type": "wait",
  "attributes": {
    "type": "event",
    "eventType": "reply",
    "timeoutMinutes": 1440,
    "isHybridAction": true,
    "hybridActionType": "wait"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `attributes.type` | string | Yes | Wait strategy: `"time"`, `"appointment"`, `"event"`, `"manual"` |
| `startAfter.type` | string | Yes (for time/appointment) | `"minutes"`, `"hours"`, `"days"`, `"specific_time"`, `"specific_date"`, `"business_days"` |
| `startAfter.value` | number or string | Yes | Duration number or time/date string |
| `startAfter.when` | string | No | `"after"` (default) or `"before"` (for appointment waits) |
| `startAfter.dayOfWeek` | string[] | No | For specific_time: `["mon","tue","wed","thu","fri","sat","sun"]` |
| `startAfter.timezone` | string | No | IANA timezone. Defaults to account timezone. |
| `startAfter.appointmentField` | string | No | `"start_time"` or `"end_time"` for appointment waits |
| `eventType` | string | No | For event waits: `"reply"`, `"appointment_booked"`, `"form_submitted"`, `"tag_added"`, `"email_opened"`, `"link_clicked"` |
| `timeoutMinutes` | number | No | Max wait time before moving to next step anyway |
| `isHybridAction` | boolean | Yes | Always `true` for wait steps |
| `hybridActionType` | string | Yes | Always `"wait"` |

---

### if_else

Conditional branching. Creates two paths: Yes (condition met) and No (not met).

```json
{
  "type": "if_else",
  "name": "Check VIP Status",
  "attributes": {
    "conditions": [
      {
        "id": "condition-uuid",
        "operator": "contains",
        "field": "contact.tags",
        "value": "vip",
        "title": "Contact has VIP tag",
        "type": "select",
        "secondValue": "",
        "filterGroup": "AND"
      }
    ],
    "matchType": "all",
    "cat": "conditions",
    "nodeType": "condition-node"
  },
  "next": ["yes-branch-uuid", "no-branch-uuid"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `conditions` | array | Yes | Array of condition objects (see below) |
| `matchType` | `"all"` or `"any"` | No | Match ALL conditions (AND) or ANY (OR). Default: "all". |
| `cat` | string | Yes | Always `"conditions"` for if/else |
| `nodeType` | string | Yes | Always `"condition-node"` |

**Condition object:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | No | Unique condition ID |
| `operator` | string | Yes | Comparison operator (see Condition Operators section) |
| `field` | string | Yes | Field path to evaluate |
| `value` | string | Yes | Comparison value |
| `secondValue` | string | No | Second value for "between" operators |
| `title` | string | No | Display label |
| `type` | string | No | UI input type hint: `"text"`, `"select"`, `"number"`, `"date"` |
| `filterGroup` | `"AND"` or `"OR"` | No | How to combine with next condition in array |

---

### goto

Jumps to another step in the same workflow. Used for loops.

```json
{
  "type": "goto",
  "attributes": {
    "targetId": "target-step-uuid",
    "maxIterations": 10
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `targetId` | string | Yes | UUID of the step to jump to |
| `maxIterations` | number | No | Max loop count to prevent infinite loops |

---

### add_to_workflow

Adds the contact to a different workflow.

```json
{
  "type": "add_to_workflow",
  "attributes": {
    "workflowId": "target-workflow-uuid",
    "allowMultiple": false
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `workflowId` | string | Yes | Target workflow UUID |
| `allowMultiple` | boolean | No | Allow contact to be in target workflow multiple times |

---

### remove_from_workflow

Removes the contact from one or all workflows.

```json
{
  "type": "remove_from_workflow",
  "attributes": {
    "allWorkflows": true,
    "includeCurrent": false,
    "workflowId": ""
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `allWorkflows` | boolean | No | If true, remove from ALL workflows |
| `includeCurrent` | boolean | No | Include the current workflow in removal |
| `workflowId` | string | Conditional | Specific workflow to remove from (if allWorkflows is false) |

---

### goal_event

Marks a goal/milestone in the workflow for analytics.

```json
{
  "type": "goal_event",
  "attributes": {
    "goalName": "Booked Appointment",
    "goalValue": 100
  }
}
```

---

### end

Explicitly ends the workflow for the contact.

```json
{
  "type": "end",
  "attributes": {}
}
```

---

## Opportunity / Pipeline

### internal_create_opportunity

Creates a new opportunity in a pipeline.

```json
{
  "type": "internal_create_opportunity",
  "attributes": {
    "pipelineId": "pipeline-uuid",
    "stageId": "stage-uuid",
    "name": "{{contact.first_name}} {{contact.last_name}} - Deal",
    "monetaryValue": 5000,
    "source": "workflow",
    "assignedTo": "user-uuid",
    "status": "open",
    "tags": ["hot-lead"]
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `pipelineId` | string | Yes | Target pipeline UUID |
| `stageId` | string | Yes | Target stage UUID within pipeline |
| `name` | string | No | Opportunity name. Supports variables. |
| `monetaryValue` | number | No | Deal value in cents or dollars (location setting) |
| `source` | string | No | Lead source tag |
| `assignedTo` | string | No | User UUID to assign |
| `status` | `"open"`, `"won"`, `"lost"`, `"abandoned"` | No | Initial status |
| `tags` | string[] | No | Tags to add to the opportunity |

---

### internal_update_opportunity

Updates/moves an existing opportunity.

```json
{
  "type": "internal_update_opportunity",
  "attributes": {
    "pipelineId": "pipeline-uuid",
    "pipelineStageId": "stage-uuid",
    "allowBackward": false,
    "status": "open",
    "monetaryValue": 10000
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `pipelineId` | string | No | Move to different pipeline |
| `pipelineStageId` | string | No | Move to stage |
| `allowBackward` | boolean | No | Allow moving to earlier stage (default false) |
| `status` | string | No | `"open"`, `"won"`, `"lost"`, `"abandoned"` |
| `monetaryValue` | number | No | Update deal value |

---

### find_opportunity

Searches for an existing opportunity. Multi-path action with Found/Not Found branches.

```json
{
  "type": "find_opportunity",
  "attributes": {
    "sorting": "latest",
    "__customInputFields__": [
      {
        "value": "eq",
        "secondValue": "pipeline-uuid",
        "filterField": "pipeline_id"
      },
      {
        "value": "eq",
        "secondValue": "open",
        "filterField": "status"
      }
    ],
    "cat": "multi-path",
    "convertToMultipath": true,
    "transitions": [
      {"id": "found-branch-uuid", "name": "Found"},
      {"id": "not-found-branch-uuid", "name": "Not Found"}
    ]
  },
  "next": ["found-branch-uuid", "not-found-branch-uuid"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sorting` | `"latest"` or `"earliest"` | No | Which opportunity to return if multiple match |
| `__customInputFields__` | array | No | Filter conditions for the search |
| `cat` | string | Yes | `"multi-path"` |
| `convertToMultipath` | boolean | Yes | `true` |
| `transitions` | array | Yes | Branch definitions: `[{id, name: "Found"}, {id, name: "Not Found"}]` |

**Filter fields for `__customInputFields__`:** `"pipeline_id"`, `"stage_id"`, `"status"`, `"assigned_to"`, `"monetary_value"`

---

### delete_opportunity

Deletes an opportunity linked to the contact.

```json
{
  "type": "delete_opportunity",
  "attributes": {
    "pipelineId": "pipeline-uuid"
  }
}
```

---

## User / Team

### assign_user

Assigns a GHL user to the contact.

```json
{
  "type": "assign_user",
  "attributes": {
    "user_list": ["userId1", "userId2"],
    "traffic_split": "equally",
    "only_unassigned_contact": false,
    "skipIfAssigned": true
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_list` | string[] | Yes | User UUIDs to assign from |
| `traffic_split` | string | No | `"equally"`, `"round_robin"`, `"random"` |
| `only_unassigned_contact` | boolean | No | Only assign if contact has no assigned user |
| `skipIfAssigned` | boolean | No | Skip this step if already assigned |

---

### internal_notification

Sends an internal notification to team members.

```json
{
  "type": "internal_notification",
  "attributes": {
    "type": "email",
    "email": {
      "subject": "New lead: {{contact.first_name}} {{contact.last_name}}",
      "html": "<p>A new lead just came in from {{contact.source}}</p>",
      "userType": "assigned"
    }
  }
}
```

**For in-app notification:**
```json
{
  "type": "internal_notification",
  "attributes": {
    "type": "in_app",
    "message": "New hot lead: {{contact.first_name}}",
    "userType": "specific",
    "userId": "user-uuid"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"email"`, `"in_app"`, `"sms"` | Yes | Notification channel |
| `email.subject` | string | Conditional | Email subject (for email type) |
| `email.html` | string | No | Email body HTML |
| `email.userType` | string | No | `"assigned"`, `"specific"`, `"all"` |
| `message` | string | Conditional | Notification text (for in_app/sms) |
| `userType` | string | No | Who receives: `"assigned"`, `"specific"`, `"all"` |
| `userId` | string | Conditional | Specific user ID (if userType is "specific") |

---

## External Actions

### webhook

Sends an HTTP request to an external URL.

```json
{
  "type": "webhook",
  "attributes": {
    "url": "https://api.example.com/webhook",
    "method": "POST",
    "headers": {
      "Authorization": "Bearer {{custom_values.api_key}}",
      "Content-Type": "application/json"
    },
    "body": "{\"contact_id\": \"{{contact.id}}\", \"name\": \"{{contact.first_name}}\"}",
    "bodyType": "json",
    "retryOnFailure": true,
    "retryCount": 3,
    "retryDelay": 60,
    "timeoutSeconds": 30,
    "responseMapping": [
      {
        "responseKey": "data.status",
        "contactField": "contact.custom_status"
      }
    ]
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | Yes | Target URL. Supports variables. |
| `method` | `"GET"`, `"POST"`, `"PUT"`, `"PATCH"`, `"DELETE"` | No | HTTP method (default: POST) |
| `headers` | object | No | Key-value header pairs. Supports variables. |
| `body` | string | No | Request body (for POST/PUT/PATCH). Supports variables. |
| `bodyType` | `"json"`, `"form"`, `"text"`, `"xml"` | No | Content type of body (default: json) |
| `retryOnFailure` | boolean | No | Retry on non-2xx responses |
| `retryCount` | number | No | Max retry attempts (default: 3) |
| `retryDelay` | number | No | Seconds between retries |
| `timeoutSeconds` | number | No | Request timeout |
| `responseMapping` | array | No | Map response fields to contact custom fields |

**Response mapping object:**

| Field | Type | Description |
|-------|------|-------------|
| `responseKey` | string | Dot-notation path in the JSON response |
| `contactField` | string | Contact field to store the value |

---

### custom_code

Executes custom JavaScript code (GHL's Custom Code action).

```json
{
  "type": "custom_code",
  "attributes": {
    "code": "const result = contact.first_name + ' processed';\nreturn { customField: result };",
    "language": "javascript",
    "timeout": 30
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | string | Yes | JavaScript code to execute. Has access to contact data. |
| `language` | string | No | Always `"javascript"` currently |
| `timeout` | number | No | Execution timeout in seconds |

---

### custom_webhook

Receives an inbound webhook (wait for external event).

```json
{
  "type": "custom_webhook",
  "attributes": {
    "webhookUrl": "auto-generated",
    "timeoutMinutes": 1440,
    "responseMapping": []
  }
}
```

---

## Integrations

### slack_message

Sends a message to a Slack channel.

```json
{
  "type": "slack_message",
  "attributes": {
    "channel": {"id": "C01234567", "name": "general"},
    "text": "New lead: {{contact.first_name}} {{contact.last_name}} — {{contact.phone}}",
    "action": {"id": "", "name": ""},
    "integration": {"id": "integration-uuid", "name": "My Workspace"}
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `channel` | `{id, name}` | Yes | Slack channel to post in |
| `text` | string | Yes | Message text. Supports variables. |
| `integration` | `{id, name}` | Yes | Connected Slack integration reference |
| `action` | `{id, name}` | No | Slack workflow action (usually empty) |

---

### google_sheets

Adds/updates a row in Google Sheets.

```json
{
  "type": "google_sheets",
  "attributes": {
    "spreadsheetId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms",
    "sheetName": "Leads",
    "action": "append",
    "columns": [
      {"header": "Name", "value": "{{contact.first_name}} {{contact.last_name}}"},
      {"header": "Email", "value": "{{contact.email}}"},
      {"header": "Phone", "value": "{{contact.phone}}"},
      {"header": "Date", "value": "{{date.now}}"}
    ],
    "integration": {"id": "integration-uuid", "name": "Google Account"}
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `spreadsheetId` | string | Yes | Google Sheet ID |
| `sheetName` | string | Yes | Tab/sheet name |
| `action` | `"append"`, `"update"`, `"lookup"` | Yes | Operation type |
| `columns` | array of `{header, value}` | Yes | Column mappings |
| `integration` | `{id, name}` | Yes | Connected Google integration |
| `lookupColumn` | string | Conditional | Column to search (for update/lookup) |
| `lookupValue` | string | Conditional | Value to match (for update/lookup) |

---

### google_calendar_event

Creates an event in Google Calendar.

```json
{
  "type": "google_calendar_event",
  "attributes": {
    "title": "Meeting with {{contact.first_name}}",
    "description": "Follow up call",
    "startTime": "{{appointment.start_time}}",
    "endTime": "{{appointment.end_time}}",
    "calendarId": "primary",
    "attendees": ["{{contact.email}}"],
    "integration": {"id": "integration-uuid", "name": "Google Account"}
  }
}
```

---

### stripe_create_invoice

Creates a Stripe invoice.

```json
{
  "type": "stripe_create_invoice",
  "attributes": {
    "amount": 9900,
    "currency": "usd",
    "description": "Service fee for {{contact.first_name}}",
    "dueDate": "{{date.plus_7_days}}",
    "autoFinalize": true,
    "integration": {"id": "stripe-integration-uuid"}
  }
}
```

---

### facebook_conversion

Sends a conversion event to Facebook CAPI.

```json
{
  "type": "facebook_conversion",
  "attributes": {
    "eventName": "Lead",
    "pixelId": "123456789",
    "customData": {
      "value": 100,
      "currency": "USD"
    },
    "integration": {"id": "fb-integration-uuid"}
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `eventName` | string | Yes | `"Lead"`, `"Purchase"`, `"CompleteRegistration"`, `"Schedule"`, `"ViewContent"`, or custom |
| `pixelId` | string | Yes | Facebook Pixel ID |
| `customData` | object | No | Additional data (value, currency, content_name, etc.) |
| `integration` | `{id}` | Yes | Connected Facebook integration |

---

### google_ads_conversion

Sends a conversion event to Google Ads.

```json
{
  "type": "google_ads_conversion",
  "attributes": {
    "conversionAction": "conversion-action-id",
    "conversionValue": 100,
    "currencyCode": "USD",
    "integration": {"id": "gads-integration-uuid"}
  }
}
```

---

### tiktok_conversion

Sends a conversion event to TikTok.

```json
{
  "type": "tiktok_conversion",
  "attributes": {
    "eventName": "CompletePayment",
    "pixelId": "tiktok-pixel-id",
    "integration": {"id": "tiktok-integration-uuid"}
  }
}
```

---

### quickbooks

Syncs data with QuickBooks.

```json
{
  "type": "quickbooks",
  "attributes": {
    "action": "create_customer",
    "mapping": {
      "DisplayName": "{{contact.first_name}} {{contact.last_name}}",
      "PrimaryEmailAddr": "{{contact.email}}",
      "PrimaryPhone": "{{contact.phone}}"
    },
    "integration": {"id": "qb-integration-uuid"}
  }
}
```

---

## Math / Calculation

### math_operation

Performs arithmetic on contact fields.

```json
{
  "type": "math_operation",
  "attributes": {
    "operation": "add",
    "operand1": "{{contact.custom_score}}",
    "operand2": "10",
    "outputField": "contact.custom_score",
    "operand1Type": "field",
    "operand2Type": "value"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `operation` | string | Yes | `"add"`, `"subtract"`, `"multiply"`, `"divide"`, `"modulo"`, `"set"` |
| `operand1` | string | Yes | First value (field reference or literal) |
| `operand2` | string | Yes | Second value |
| `outputField` | string | Yes | Contact field to store result |
| `operand1Type` | `"field"` or `"value"` | No | How to interpret operand1 |
| `operand2Type` | `"field"` or `"value"` | No | How to interpret operand2 |

---

## Reviews & Reputation

### send_review_request

Sends a review request to the contact.

```json
{
  "type": "send_review_request",
  "attributes": {
    "channel": "sms",
    "templateId": "review-template-uuid",
    "message": "Hi {{contact.first_name}}, we'd love your feedback! {{review.link}}",
    "reviewLink": "https://g.page/r/your-google-review-link"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `channel` | `"sms"`, `"email"` | Yes | How to send the request |
| `templateId` | string | No | Use a saved template |
| `message` | string | No | Custom message (if no template) |
| `reviewLink` | string | No | Direct review link |

---

## Invoicing & Payments

### create_invoice

Creates a GHL invoice.

```json
{
  "type": "create_invoice",
  "attributes": {
    "name": "Service Invoice",
    "items": [
      {"name": "Consultation", "amount": 15000, "quantity": 1}
    ],
    "dueDate": "{{date.plus_30_days}}",
    "sendNow": true,
    "sendChannel": "email"
  }
}
```

---

### create_text2pay

Sends a text-to-pay link.

```json
{
  "type": "create_text2pay",
  "attributes": {
    "amount": 5000,
    "message": "Hi {{contact.first_name}}, click below to pay: {{payment.link}}",
    "description": "Session fee"
  }
}
```

---

## Drip Mode

### drip

Sends messages on a schedule (combines multiple SMS/email sends with delays).

```json
{
  "type": "drip",
  "attributes": {
    "messages": [
      {
        "type": "sms",
        "body": "Message 1",
        "delay": {"type": "hours", "value": 0}
      },
      {
        "type": "sms",
        "body": "Message 2",
        "delay": {"type": "hours", "value": 24}
      },
      {
        "type": "email",
        "subject": "Follow up",
        "html": "<p>Check this out</p>",
        "delay": {"type": "days", "value": 3}
      }
    ],
    "stopOnReply": true
  }
}
```

---

## AI Actions

### openai_completion

Runs an OpenAI prompt and stores the result.

```json
{
  "type": "openai_completion",
  "attributes": {
    "prompt": "Classify this lead based on their message: {{trigger.message}}. Return one of: hot, warm, cold.",
    "model": "gpt-4",
    "outputField": "contact.custom_lead_score",
    "maxTokens": 100,
    "temperature": 0.3
  }
}
```

---

### conversation_ai

Enables/disables the conversation AI bot for the contact.

```json
{
  "type": "conversation_ai",
  "attributes": {
    "action": "enable",
    "agentId": "conversation-agent-uuid"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | `"enable"` or `"disable"` | Yes | Enable or disable AI for this contact's conversation |
| `agentId` | string | No | Specific AI agent to use |

---

## Multi-Path / Branching

### transition

Branch entry point marker. Used as children of if/else and find_opportunity nodes.
Has no action logic — it's a structural node.

```json
{
  "type": "transition",
  "name": "Yes Branch",
  "attributes": {},
  "parentKey": "if-else-step-uuid",
  "parent": "if-else-step-uuid"
}
```

---

### split

A/B testing split. Divides contacts between paths by percentage.

```json
{
  "type": "split",
  "attributes": {
    "splits": [
      {"id": "path-a-uuid", "name": "Path A", "percentage": 50},
      {"id": "path-b-uuid", "name": "Path B", "percentage": 50}
    ],
    "cat": "multi-path",
    "convertToMultipath": true
  },
  "next": ["path-a-uuid", "path-b-uuid"]
}
```

---

## Trigger Types

Complete list of workflow trigger types:

| Type | Description | Key Conditions |
|------|-------------|----------------|
| `contact_tag_added` | Tag added to contact | `contact.tags` (tag name) |
| `contact_tag_removed` | Tag removed from contact | `contact.tags` |
| `contact_created` | New contact created | `contact.source`, `contact.tags` |
| `contact_changed` | Contact field updated | `contact.{field}` (which field changed) |
| `contact_dnd` | DND status changed | `contact.dnd` |
| `customer_replied` | Contact replies to message | `message.channel`, `message.body` |
| `appointment` | Appointment event | `appointment.status`, `appointment.eventType`, `calendar.id` |
| `appointment_booked` | Appointment specifically booked | `calendar.id` |
| `form_submitted` | Form submission | `form.id`, `form.name` |
| `survey_submitted` | Survey submission | `survey.id` |
| `opportunity_status_changed` | Opp status change | `opportunity.status`, `opportunity.pipeline_id`, `opportunity.stage_id` |
| `opportunity_stage_changed` | Opp moved to stage | `opportunity.pipeline_id`, `opportunity.stage_id` |
| `opportunity_created` | New opportunity | `opportunity.pipeline_id` |
| `opportunity_monetary_value_changed` | Deal value changed | `opportunity.monetary_value` |
| `invoice_paid` | Invoice paid | `invoice.id` |
| `payment_received` | Payment received | `payment.amount`, `payment.type` |
| `order_submitted` | Order submitted | `order.id` |
| `order_form_submitted` | Order form submitted | `form.id` |
| `stale_opportunity` | Opportunity hasn't moved | `opportunity.pipeline_id`, `stale_days` |
| `birthday_reminder` | Contact birthday | `days_before` |
| `inbound_webhook` | External webhook received | Custom headers/body matching |
| `manual` | Manual trigger (via API) | None |
| `schedule` | Time-based schedule | Cron-like config |
| `membership_signup` | Course/membership signup | `membership.id` |
| `membership_login` | Course/membership login | `membership.id` |
| `course_completed` | Course completed | `course.id` |
| `lesson_completed` | Lesson completed | `lesson.id` |
| `facebook_lead_form` | Facebook lead ad form | `form.id` |
| `call_status` | Call status change | `call.status` (`completed`, `missed`, `voicemail`) |
| `email_events` | Email open/click/bounce | `email.event` (`opened`, `clicked`, `bounced`, `unsubscribed`) |
| `task_reminder` | Task due reminder | `task.type` |
| `twilio_voice_call` | Twilio voice call event | `call.direction`, `call.status` |
| `community_event` | Community event | `event.type` |

### Trigger Condition Fields (expanded)

| Field | Used With | Description |
|-------|-----------|-------------|
| `contact.tags` | `contact_tag_added/removed` | Tag name to match |
| `contact.source` | `contact_created` | Lead source |
| `appointment.eventType` | `appointment` | `"normal"`, `"collective"`, `"round_robin"`, `"class"` |
| `appointment.status` | `appointment` | `"confirmed"`, `"cancelled"`, `"showed"`, `"noshow"`, `"rescheduled"` |
| `calendar.id` | `appointment` | Specific calendar ID |
| `form.id` | `form_submitted` | Specific form ID |
| `opportunity.pipeline_id` | opportunity triggers | Pipeline ID |
| `opportunity.stage_id` | opportunity triggers | Stage ID |
| `opportunity.status` | `opportunity_status_changed` | `"open"`, `"won"`, `"lost"`, `"abandoned"` |
| `message.channel` | `customer_replied` | `"sms"`, `"email"`, `"live_chat"`, `"facebook"`, etc. |

### Trigger Schedule Config

For `schedule` type triggers:

```json
{
  "schedule_config": {
    "frequency": "daily",
    "time": "09:00",
    "timezone": "America/New_York",
    "daysOfWeek": ["mon", "tue", "wed", "thu", "fri"],
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }
}
```

---

## Condition Operators

Complete list of operators for `if_else` conditions and trigger conditions:

| Operator | String Value | Description | Applicable Field Types |
|----------|-------------|-------------|----------------------|
| Equals | `"=="` or `"eq"` | Exact match | All |
| Not equals | `"!="` or `"neq"` | Not equal | All |
| Contains | `"contains"` | String/array contains | Text, Tags, Multi-select |
| Does not contain | `"does_not_contain"` or `"not_contains"` | Does not contain | Text, Tags, Multi-select |
| Starts with | `"starts_with"` | String starts with | Text |
| Ends with | `"ends_with"` | String ends with | Text |
| Greater than | `">"` or `"gt"` | Greater than | Number, Date |
| Less than | `"<"` or `"lt"` | Less than | Number, Date |
| Greater or equal | `">="` or `"gte"` | Greater than or equal | Number, Date |
| Less or equal | `"<="` or `"lte"` | Less than or equal | Number, Date |
| Is empty | `"is_empty"` or `"empty"` | Field has no value | All |
| Is not empty | `"is_not_empty"` or `"not_empty"` | Field has a value | All |
| Exists | `"exists"` | Field exists on contact | All |
| Does not exist | `"not_exists"` | Field does not exist | All |
| Matches regex | `"matches_regex"` or `"regex"` | Regex pattern match | Text |
| Between | `"between"` | Value is between two values | Number, Date |
| In list | `"in"` | Value is in provided list | Text, Select |
| Not in list | `"not_in"` | Value is not in list | Text, Select |
| Before (date) | `"before"` | Date is before value | Date |
| After (date) | `"after"` | Date is after value | Date |
| Within (date) | `"within"` | Within X days/hours | Date |
| Has tag | `"has_tag"` | Contact has specific tag | Tags |
| Does not have tag | `"not_has_tag"` | Contact doesn't have tag | Tags |
| Replied | `"replied"` | Contact has replied | Conversation |
| Not replied | `"not_replied"` | Contact has not replied | Conversation |

### Condition Source Fields

Fields available for use in if/else and trigger conditions:

**Contact fields:**
`contact.first_name`, `contact.last_name`, `contact.name`, `contact.email`, `contact.phone`, `contact.address1`, `contact.city`, `contact.state`, `contact.postal_code`, `contact.country`, `contact.source`, `contact.tags`, `contact.assigned_to`, `contact.company_name`, `contact.website`, `contact.date_of_birth`, `contact.timezone`, `contact.dnd`, `contact.type`, `contact.date_added`, `contact.last_activity`, `contact.custom_field_key`

**Opportunity fields:**
`opportunity.name`, `opportunity.status`, `opportunity.pipeline_id`, `opportunity.stage_id`, `opportunity.monetary_value`, `opportunity.source`, `opportunity.assigned_to`, `opportunity.created_at`, `opportunity.updated_at`

**Appointment fields:**
`appointment.status`, `appointment.start_time`, `appointment.end_time`, `appointment.calendar_id`, `appointment.title`

**Trigger/message fields:**
`trigger.message`, `trigger.channel`, `trigger.source`, `message.body`, `message.direction`

**Custom values:**
`custom_values.{key}` — location-level custom values

---

## Template Variables

Complete registry of variables available in SMS body, email subject/html, webhook body, notification text, and any other text field that supports interpolation.

### Contact Variables

| Variable | Description |
|----------|-------------|
| `{{contact.id}}` | Contact ID |
| `{{contact.first_name}}` | First name |
| `{{contact.last_name}}` | Last name |
| `{{contact.name}}` | Full name |
| `{{contact.full_name}}` | Full name (alias) |
| `{{contact.email}}` | Email address |
| `{{contact.phone}}` | Phone number |
| `{{contact.address1}}` | Street address |
| `{{contact.city}}` | City |
| `{{contact.state}}` | State |
| `{{contact.postal_code}}` | Postal/ZIP code |
| `{{contact.country}}` | Country |
| `{{contact.company_name}}` | Company name |
| `{{contact.website}}` | Website URL |
| `{{contact.date_of_birth}}` | Date of birth |
| `{{contact.source}}` | Lead source |
| `{{contact.timezone}}` | Timezone |
| `{{contact.assigned_to}}` | Assigned user name |
| `{{contact.tags}}` | Comma-separated tags |
| `{{contact.date_added}}` | Date contact was created |
| `{{contact.last_activity}}` | Date of last activity |
| `{{contact.custom_field_key}}` | Any custom field by key |

### Appointment Variables

| Variable | Description |
|----------|-------------|
| `{{appointment.id}}` | Appointment ID |
| `{{appointment.title}}` | Appointment title |
| `{{appointment.start_time}}` | Start date + time (formatted) |
| `{{appointment.end_time}}` | End date + time |
| `{{appointment.only_start_date}}` | Date only (no time) |
| `{{appointment.only_start_time}}` | Time only (no date) |
| `{{appointment.only_end_date}}` | End date only |
| `{{appointment.only_end_time}}` | End time only |
| `{{appointment.status}}` | Status (confirmed, cancelled, etc.) |
| `{{appointment.calendar_name}}` | Calendar name |
| `{{appointment.notes}}` | Appointment notes |
| `{{appointment.zoom_link}}` | Zoom meeting link |
| `{{appointment.meeting_link}}` | Generic meeting link |
| `{{appointment.google_meet_link}}` | Google Meet link |
| `{{appointment.location}}` | Meeting location |
| `{{appointment.cancellation_link}}` | Cancel link |
| `{{appointment.reschedule_link}}` | Reschedule link |
| `{{appointment.confirmation_link}}` | Confirm link |

### Location Variables

| Variable | Description |
|----------|-------------|
| `{{location.name}}` | Business name |
| `{{location.phone}}` | Business phone |
| `{{location.email}}` | Business email |
| `{{location.address}}` | Full address |
| `{{location.city}}` | City |
| `{{location.state}}` | State |
| `{{location.postal_code}}` | Postal code |
| `{{location.country}}` | Country |
| `{{location.website}}` | Website URL |
| `{{location.logo_url}}` | Logo image URL |
| `{{location.full_address}}` | Formatted full address |
| `{{location.timezone}}` | Location timezone |

### Opportunity Variables

| Variable | Description |
|----------|-------------|
| `{{opportunity.id}}` | Opportunity ID |
| `{{opportunity.name}}` | Opportunity name |
| `{{opportunity.monetary_value}}` | Deal value |
| `{{opportunity.pipeline_name}}` | Pipeline name |
| `{{opportunity.stage_name}}` | Current stage name |
| `{{opportunity.status}}` | Status (open, won, lost) |
| `{{opportunity.source}}` | Lead source |
| `{{opportunity.assigned_to}}` | Assigned user |
| `{{opportunity.created_at}}` | Created date |

### User Variables (assigned user)

| Variable | Description |
|----------|-------------|
| `{{user.name}}` | Assigned user full name |
| `{{user.first_name}}` | First name |
| `{{user.last_name}}` | Last name |
| `{{user.email}}` | Email |
| `{{user.phone}}` | Phone |
| `{{user.calendar_link}}` | Calendar booking link |

### Date Variables

| Variable | Description |
|----------|-------------|
| `{{date.now}}` | Current date/time |
| `{{date.today}}` | Today's date |
| `{{date.tomorrow}}` | Tomorrow's date |
| `{{date.plus_1_day}}` | 1 day from now |
| `{{date.plus_7_days}}` | 7 days from now |
| `{{date.plus_30_days}}` | 30 days from now |
| `{{date.day_of_week}}` | Current day name |
| `{{date.month}}` | Current month name |
| `{{date.year}}` | Current year |

### Trigger Variables

| Variable | Description |
|----------|-------------|
| `{{trigger.id}}` | Trigger event ID |
| `{{trigger.type}}` | Trigger type string |
| `{{trigger.message}}` | Incoming message text (for customer_replied) |
| `{{trigger.source}}` | Trigger source |
| `{{trigger.custom_data}}` | Custom data from inbound webhook |

### Custom Values

| Variable | Description |
|----------|-------------|
| `{{custom_values.key}}` | Location-level custom value by key |

### Payment / Invoice Variables

| Variable | Description |
|----------|-------------|
| `{{payment.amount}}` | Payment amount |
| `{{payment.link}}` | Payment link URL |
| `{{invoice.id}}` | Invoice ID |
| `{{invoice.number}}` | Invoice number |
| `{{invoice.total}}` | Invoice total |
| `{{invoice.due_date}}` | Due date |
| `{{invoice.link}}` | Invoice view link |

### Review Variables

| Variable | Description |
|----------|-------------|
| `{{review.link}}` | Review request link |
| `{{review.url}}` | Direct review URL |

### Membership / Course Variables

| Variable | Description |
|----------|-------------|
| `{{membership.name}}` | Membership/course name |
| `{{membership.login_url}}` | Login URL |
| `{{lesson.name}}` | Current lesson name |

---

## Complete Action Type Registry

Quick-reference of every known action type string:

| Action Type | Category | Branching |
|-------------|----------|-----------|
| `sms` | Communication | No |
| `email` | Communication | No |
| `voicemail` | Communication | No |
| `manual_call` | Communication | No |
| `live_chat_message` | Communication | No |
| `facebook_messenger` | Communication | No |
| `instagram_dm` | Communication | No |
| `whatsapp` | Communication | No |
| `gmb_message` | Communication | No |
| `add_contact_tag` | Contact | No |
| `remove_contact_tag` | Contact | No |
| `update_contact_field` | Contact | No |
| `add_contact_to_dnd` | Contact | No |
| `remove_contact_from_dnd` | Contact | No |
| `delete_contact` | Contact | No |
| `wait` | Control | No |
| `if_else` | Control | Yes (2 branches) |
| `goto` | Control | No |
| `add_to_workflow` | Control | No |
| `remove_from_workflow` | Control | No |
| `goal_event` | Control | No |
| `end` | Control | No |
| `internal_create_opportunity` | Pipeline | No |
| `internal_update_opportunity` | Pipeline | No |
| `find_opportunity` | Pipeline | Yes (Found/Not Found) |
| `delete_opportunity` | Pipeline | No |
| `assign_user` | Team | No |
| `internal_notification` | Team | No |
| `webhook` | External | No |
| `custom_code` | External | No |
| `custom_webhook` | External | No |
| `slack_message` | Integration | No |
| `google_sheets` | Integration | No |
| `google_calendar_event` | Integration | No |
| `stripe_create_invoice` | Integration | No |
| `facebook_conversion` | Integration | No |
| `google_ads_conversion` | Integration | No |
| `tiktok_conversion` | Integration | No |
| `quickbooks` | Integration | No |
| `math_operation` | Calculation | No |
| `send_review_request` | Reputation | No |
| `create_invoice` | Payments | No |
| `create_text2pay` | Payments | No |
| `drip` | Communication | No |
| `openai_completion` | AI | No |
| `conversation_ai` | AI | No |
| `transition` | Structural | No |
| `split` | Structural | Yes (N branches) |
