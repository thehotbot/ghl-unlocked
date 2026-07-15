# API Reference

All endpoints use the internal API base URL. Every request requires the authentication headers described in [auth.md](auth.md).

## Setup

```bash
export BASE="https://backend.leadconnectorhq.com"
export TOKEN="your-firebase-jwt"
export LOC="your-location-id"

# Common headers (reused in all examples)
HEADERS=(-H "token-id: $TOKEN" -H "channel: APP" -H "Content-Type: application/json")
```

---

## Workflow CRUD

### List Workflows

Returns all workflows (and folders) for a location. Supports pagination, sorting, and filtering by parent folder.

```
GET /workflow/{locationId}/list
```

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | 50 | Max results per page |
| `offset` | number | 0 | Pagination offset |
| `sortBy` | string | `updatedAt` | Sort field |
| `sortOrder` | string | `desc` | `asc` or `desc` |
| `parentId` | string | — | Filter by folder ID (omit for root) |
| `type` | string | — | `workflow` or `directory` |
| `includeCustomObjects` | boolean | — | Include custom object workflows |
| `includeObjectiveBuilder` | boolean | — | Include objective builder workflows |

```bash
# List all workflows (root level)
curl -s "$BASE/workflow/$LOC/list?limit=50&offset=0&sortBy=updatedAt&sortOrder=desc" \
  "${HEADERS[@]}" | jq '.rows[] | {id: ._id, name: .name, status: .status, type: .type}'

# List workflows in a specific folder
FOLDER_ID="ca2666ec-84af-4155-9d0a-1774430c98b7"
curl -s "$BASE/workflow/$LOC/list?parentId=$FOLDER_ID&limit=50&offset=0" \
  "${HEADERS[@]}" | jq '.rows'

# List only folders
curl -s "$BASE/workflow/$LOC/list?type=directory&limit=50&offset=0" \
  "${HEADERS[@]}" | jq '.rows[] | {id: ._id, name: .name}'
```

**Response:**
```json
{
  "rows": [
    {
      "_id": "uuid",
      "name": "My Workflow",
      "status": "draft",
      "type": "workflow",
      "version": 3,
      "parentId": null,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-16T14:30:00.000Z"
    }
  ]
}
```

---

### Create Workflow

Creates a new workflow or folder. Optionally include action steps inline.

```
POST /workflow/{locationId}
```

**Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Workflow display name |
| `parentId` | string | No | Folder ID to create inside |
| `type` | string | No | `workflow` (default) or `directory` |
| `workflowData` | object | No | `{templates: [...]}` -- action steps |

```bash
# Create empty workflow
curl -s -X POST "$BASE/workflow/$LOC" \
  "${HEADERS[@]}" \
  -d '{"name": "New Workflow"}' | jq .

# Create workflow inside a folder
curl -s -X POST "$BASE/workflow/$LOC" \
  "${HEADERS[@]}" \
  -d '{
    "name": "New Workflow in Folder",
    "parentId": "'"$FOLDER_ID"'"
  }' | jq .

# Create folder
curl -s -X POST "$BASE/workflow/$LOC" \
  "${HEADERS[@]}" \
  -d '{"name": "My Folder", "type": "directory"}' | jq .

# Create workflow with action steps
curl -s -X POST "$BASE/workflow/$LOC" \
  "${HEADERS[@]}" \
  -d '{
    "name": "Welcome Flow",
    "workflowData": {
      "templates": [
        {
          "id": "step-001",
          "order": 0,
          "name": "Tag as New Lead",
          "type": "add_contact_tag",
          "attributes": {"tags": ["new-lead"]},
          "next": "step-002",
          "parentKey": null
        },
        {
          "id": "step-002",
          "order": 1,
          "name": "Send Welcome SMS",
          "type": "sms",
          "attributes": {"body": "Hi {{contact.first_name}}, thanks for reaching out!"},
          "next": null,
          "parentKey": "step-001"
        }
      ]
    }
  }' | jq .
```

**Response:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

---

### Get Workflow

Returns full workflow metadata. The `fileUrl` field contains a signed Firebase URL to download the actual action steps (templates array).

```
GET /workflow/{locationId}/{workflowId}
```

```bash
WF_ID="a1b2c3d4-e5f6-7890-abcd-ef1234567890"

# Get workflow metadata
curl -s "$BASE/workflow/$LOC/$WF_ID" \
  "${HEADERS[@]}" | jq .

# Get metadata + download the action steps from Firebase
RESPONSE=$(curl -s "$BASE/workflow/$LOC/$WF_ID" "${HEADERS[@]}")
FILE_URL=$(echo "$RESPONSE" | jq -r '.fileUrl')

if [ "$FILE_URL" != "null" ] && [ -n "$FILE_URL" ]; then
  echo "--- Action Steps ---"
  curl -s "$FILE_URL" | jq '.templates'
fi
```

**Response:** See [data-schemas.md](data-schemas.md) for the full workflow metadata object.

---

### Update Workflow

Updates workflow metadata and/or action steps. The `version` field is **required** and must match the current version.

```
PUT /workflow/{locationId}/{workflowId}
```

**Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | number | **Yes** | Current version number (GET it first) |
| `name` | string | No | New name |
| `workflowData` | object | No | `{templates: [...]}` -- replaces all action steps |

```bash
WF_ID="a1b2c3d4-e5f6-7890-abcd-ef1234567890"

# First, get the current version
VERSION=$(curl -s "$BASE/workflow/$LOC/$WF_ID" "${HEADERS[@]}" | jq '.version')

# Rename workflow
curl -s -X PUT "$BASE/workflow/$LOC/$WF_ID" \
  "${HEADERS[@]}" \
  -d '{
    "version": '"$VERSION"',
    "name": "Renamed Workflow"
  }' | jq .

# Update action steps (replaces entire templates array)
curl -s -X PUT "$BASE/workflow/$LOC/$WF_ID" \
  "${HEADERS[@]}" \
  -d '{
    "version": '"$VERSION"',
    "workflowData": {
      "templates": [
        {
          "id": "step-001",
          "order": 0,
          "name": "Updated First Step",
          "type": "add_contact_tag",
          "attributes": {"tags": ["updated-tag"]},
          "next": null,
          "parentKey": null
        }
      ]
    }
  }' | jq .
```

**Important:** Each successful PUT increments the version. If you need to make multiple updates, re-fetch the version between each call.

---

### Delete Workflow

Permanently deletes a workflow.

```
DELETE /workflow/{locationId}/{workflowId}
```

```bash
curl -s -X DELETE "$BASE/workflow/$LOC/$WF_ID" \
  "${HEADERS[@]}" | jq .
```

**Response:**
```json
{
  "success": true
}
```

---

### Change Workflow Status

Publish or unpublish a workflow. Requires `updatedBy` (your user ID).

```
PUT /workflow/{locationId}/change-status/{workflowId}
```

**Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | Yes | `published` or `draft` |
| `updatedBy` | string | Yes | GHL user ID making the change |

```bash
USER_ID="YewkebOufK3hmeP1gx4B"

# Publish
curl -s -X PUT "$BASE/workflow/$LOC/change-status/$WF_ID" \
  "${HEADERS[@]}" \
  -d '{
    "status": "published",
    "updatedBy": "'"$USER_ID"'"
  }' | jq .

# Unpublish (set to draft)
curl -s -X PUT "$BASE/workflow/$LOC/change-status/$WF_ID" \
  "${HEADERS[@]}" \
  -d '{
    "status": "draft",
    "updatedBy": "'"$USER_ID"'"
  }' | jq .
```

---

## Trigger CRUD

### Create Trigger

Attaches a trigger to a workflow. The trigger defines what event starts the workflow.

```
POST /workflow/{locationId}/trigger
```

**Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Trigger event type (see [data-schemas.md](data-schemas.md)) |
| `name` | string | Yes | Display name |
| `active` | boolean | Yes | Whether trigger is active |
| `workflowId` | string | Yes | Workflow to attach to |
| `conditions` | array | No | Filter conditions for the trigger |
| `actions` | array | Yes | Usually `[{workflow_id, type: "add_to_workflow"}]` |

```bash
# Trigger on contact tag added
curl -s -X POST "$BASE/workflow/$LOC/trigger" \
  "${HEADERS[@]}" \
  -d '{
    "type": "contact_tag_added",
    "name": "Tag Added: new-lead",
    "active": true,
    "workflowId": "'"$WF_ID"'",
    "conditions": [
      {"operator": "==", "field": "contact.tags", "value": "new-lead", "title": "Tag", "type": "select"}
    ],
    "actions": [{"workflow_id": "'"$WF_ID"'", "type": "add_to_workflow"}]
  }' | jq .

# Trigger on appointment booked (specific calendar)
CALENDAR_ID="your-calendar-id"
curl -s -X POST "$BASE/workflow/$LOC/trigger" \
  "${HEADERS[@]}" \
  -d '{
    "type": "appointment",
    "name": "Appointment Confirmed",
    "active": true,
    "workflowId": "'"$WF_ID"'",
    "conditions": [
      {"operator": "==", "field": "appointment.eventType", "value": "normal", "title": "Event Type", "type": "select"},
      {"operator": "==", "field": "calendar.id", "value": "'"$CALENDAR_ID"'", "title": "In calendar", "type": "select"},
      {"operator": "==", "field": "appointment.status", "value": "confirmed", "title": "Appointment status is", "type": "select"}
    ],
    "actions": [{"workflow_id": "'"$WF_ID"'", "type": "add_to_workflow"}]
  }' | jq .

# Trigger on form submitted
curl -s -X POST "$BASE/workflow/$LOC/trigger" \
  "${HEADERS[@]}" \
  -d '{
    "type": "form_submitted",
    "name": "Contact Form Submitted",
    "active": true,
    "workflowId": "'"$WF_ID"'",
    "conditions": [],
    "actions": [{"workflow_id": "'"$WF_ID"'", "type": "add_to_workflow"}]
  }' | jq .
```

**Response:**
```json
{
  "id": "trigger-uuid"
}
```

---

### Update Trigger

Updates an existing trigger's configuration.

```
PUT /workflow/{locationId}/trigger/{triggerId}
```

```bash
TRIGGER_ID="trigger-uuid"

# Deactivate a trigger
curl -s -X PUT "$BASE/workflow/$LOC/trigger/$TRIGGER_ID" \
  "${HEADERS[@]}" \
  -d '{"active": false}' | jq .

# Change trigger conditions
curl -s -X PUT "$BASE/workflow/$LOC/trigger/$TRIGGER_ID" \
  "${HEADERS[@]}" \
  -d '{
    "name": "Updated Trigger Name",
    "conditions": [
      {"operator": "==", "field": "contact.tags", "value": "vip", "title": "Tag", "type": "select"}
    ]
  }' | jq .
```

**Response:**
```json
{
  "status": "success",
  "message": "Trigger updated successfully"
}
```

---

### Delete Trigger

Removes a trigger from a workflow.

```
DELETE /workflow/{locationId}/trigger/{triggerId}
```

```bash
curl -s -X DELETE "$BASE/workflow/$LOC/trigger/$TRIGGER_ID" \
  "${HEADERS[@]}"
```

**Response:** `OK`

---

### Reading Triggers

Triggers are **not readable via a REST GET endpoint**. They are stored in Firebase Storage. To read a workflow's triggers:

1. Get the workflow metadata: `GET /workflow/{locationId}/{workflowId}`
2. Extract the `triggersFilePath` field
3. Build the Firebase Storage URL
4. Fetch the triggers JSON

```bash
# Get workflow and extract triggers file path
RESPONSE=$(curl -s "$BASE/workflow/$LOC/$WF_ID" "${HEADERS[@]}")
TRIGGERS_PATH=$(echo "$RESPONSE" | jq -r '.triggersFilePath')

if [ "$TRIGGERS_PATH" != "null" ] && [ -n "$TRIGGERS_PATH" ]; then
  # URL-encode the path
  ENCODED_PATH=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$TRIGGERS_PATH', safe=''))")
  TRIGGERS_URL="https://firebasestorage.googleapis.com/v0/b/highlevel-backend.appspot.com/o/${ENCODED_PATH}?alt=media"

  echo "--- Triggers ---"
  curl -s "$TRIGGERS_URL" | jq .
fi
```

---

## Auto-Save (Advanced Canvas Sync)

Syncs workflow steps and triggers to Firebase/Firestore so they render in the advanced canvas builder. See [save-modes.md](save-modes.md) for detailed comparison of all save methods.

```
PUT /workflow/{locationId}/{workflowId}/auto-save
```

**Body:** Full workflow object with additional auto-save fields. The MCP worker (`ghl_workflow_builder_auto_save`) builds this payload automatically. Key fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | number | Yes | Current workflow version |
| `meta.advanceCanvasMeta.enabled` | boolean | Yes | Must be `true` to enable advanced canvas |
| `workflowData.templates` | array | Yes | Steps with `advanceCanvasMeta.position` for canvas layout |
| `triggersChanged` | boolean | Yes | Set `true` if triggers should be synced |
| `oldTriggers` | array | Yes | Previous trigger state |
| `newTriggers` | array | Yes | Current trigger state |
| `isAutoSave` | boolean | Yes | Must be `true` |
| `autoSaveSession` | object | Yes | Session tracking with `workflowId`, `id`, `userId`, `version`, `inProgress` |

```bash
# Simplified example -- in practice, use the MCP tool which builds the full payload
curl -s -X PUT "$BASE/workflow/$LOC/$WF_ID/auto-save" \
  "${HEADERS[@]}" \
  -d '{
    "version": '"$VERSION"',
    "status": "draft",
    "meta": {"advanceCanvasMeta": {"enabled": true}},
    "workflowData": {"templates": [...]},
    "triggersChanged": true,
    "oldTriggers": [...],
    "newTriggers": [...],
    "isAutoSave": true,
    "autoSaveSession": {
      "workflowId": "'"$WF_ID"'",
      "id": "'"$(uuidgen)"'",
      "userId": "'"$USER_ID"'",
      "version": '"$VERSION"',
      "inProgress": true
    }
  }'
```

**Important:** Auto-save should be called AFTER `save_steps` and `create_trigger`. It is the final sync step that makes everything visible in the advanced canvas UI.

---

## Utility Endpoints

### Error Notification Count

Returns the count of workflow execution errors for a location.

```
GET /workflow/{locationId}/error-notification/count
```

```bash
curl -s "$BASE/workflow/$LOC/error-notification/count" \
  "${HEADERS[@]}" | jq .
```

---

### AI Builder Settings

Returns workflow AI builder configuration for the location.

```
GET /workflow/{locationId}/workflow-ai/settings
```

```bash
curl -s "$BASE/workflow/$LOC/workflow-ai/settings" \
  "${HEADERS[@]}" | jq .
```

---

### Location Workflow Settings

Returns workflow-specific settings for the location.

```
GET /workflow/{locationId}/workflow-location-setting/settings
```

```bash
curl -s "$BASE/workflow/$LOC/workflow-location-setting/settings" \
  "${HEADERS[@]}" | jq .
```

---

### OAuth Integration Tokens

Returns all OAuth tokens for integrations connected to the location (used for Slack, Google, etc. action steps).

```
GET /workflow/oauth2/get-all-tokens?location_id={locationId}
```

```bash
curl -s "$BASE/workflow/oauth2/get-all-tokens?location_id=$LOC" \
  "${HEADERS[@]}" | jq .
```

---

## Public API (Limited)

The official GHL public API only supports listing workflows. It uses a different auth mechanism (PIT token or OAuth).

```
GET https://services.leadconnectorhq.com/workflows/
```

```bash
PIT_TOKEN="your-pit-token"

curl -s "https://services.leadconnectorhq.com/workflows/?locationId=$LOC" \
  -H "Authorization: Bearer $PIT_TOKEN" \
  -H "Version: 2021-07-28" | jq '.workflows[] | {id, name, status}'
```

This endpoint returns metadata only -- no action steps, no triggers, no way to create or update.
