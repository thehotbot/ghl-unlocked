# GHL Internal API — Discovered Endpoints

## Auth

### Session Refresh
- **Method:** POST
- **URL:** `https://backend.leadconnectorhq.com/oauth/2/login/signin/refresh?version=2&location_id={comma-separated-location-ids}`
- **Request Headers:**
  - `Authorization: Bearer {ghl_jwt}`
  - `token-id: {firebase_id_token}`
  - `channel: APP`
  - `source: WEB_USER`
  - `version: 2021-07-28`
- **Request Body:** `{}` (empty JSON object)
- **Response:** `{"token": "{firebase_custom_token}", "traceId": "..."}`
- **Notes:** This endpoint refreshes the session. The GHL JWT is already present in the Authorization header. The response returns a Firebase custom token (not a GHL JWT). The Chrome extension intercepts the GHL JWT from outbound requests rather than reconstructing it.

## Workflows

### List Workflows (Copy/Status)
- **Method:** GET
- **URL:** `https://backend.leadconnectorhq.com/workflows/copyWorkflow/statusList?locationId={locId}&page=1`
- **Status:** Confirmed

### List Workflows (Folder Structure)
- **Method:** GET
- **URL:** `https://backend.leadconnectorhq.com/lists/dynamic/{locationId}?objectKey=workflow&limit=20`
- **Status:** Confirmed

### OAuth Token Check
- **Method:** GET
- **URL:** `https://backend.leadconnectorhq.com/workflow/oauth2/get-all-tokens?location_id={locId}`
- **Status:** Confirmed

### Get Workflow + Steps
- **Method:** GET
- **URL:** `https://backend.leadconnectorhq.com/workflow/{locationId}/{workflowId}?includeScheduledPauseInfo=true`
- **Response shape:** Top-level has `_id`, `name`, `status`, `version`, `workflowData`. Steps are in `workflowData.templates[]`. Each template has `id`, `order`, `name`, `type`, `attributes`, `next`, `parent`, `parentKey`.
- **Key types seen:** `update_contact_field`, `if_else`, `wait`, `add_contact_tag`, `remove_contact_tag`, `sms`, `create_opportunity`, `drip`, `add_to_workflow`, `goto`, `remove_from_workflow`, `internal_notification`
- **Status:** Confirmed

### Save Workflow (Add/Update/Delete Actions)
- **Method:** PUT
- **URL:** `https://backend.leadconnectorhq.com/workflow/{locationId}/{workflowId}` (same as GET)
- **Request Body:** Full workflow object including `workflowData.templates[]` with ALL templates
- **Change tracking fields in body:**
  - `createdSteps: ["new-uuid"]` — IDs of newly added templates
  - `deletedSteps: ["removed-uuid"]` — IDs of removed templates
  - `modifiedSteps: ["changed-uuid"]` — IDs of modified templates
- **Notes:** GHL uses a read-modify-write pattern. There is no endpoint to add/remove individual actions. The entire workflow (including all templates) is PUT back. A `validate-assets` POST runs first (optional, at `/workflow/{locationId}/validate-assets`).
- **Status:** Confirmed

### Validate Workflow Assets
- **Method:** POST
- **URL:** `https://backend.leadconnectorhq.com/workflow/{locationId}/validate-assets`
- **Request Body:** `{ templates: [...], triggers: [...], companyId: "..." }`
- **Notes:** Runs before save. Validates all templates and triggers. Not required for save to succeed.
- **Status:** Confirmed
