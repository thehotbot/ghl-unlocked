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
- **URL:** TBD — capture by opening a workflow in the GHL UI
- **Status:** Pending

### Add Action
- **Method:** POST
- **URL:** TBD — capture by adding an action in the GHL workflow editor
- **Status:** Pending

### Update Action
- **Method:** PUT/PATCH
- **URL:** TBD
- **Status:** Pending

### Delete Action
- **Method:** DELETE
- **URL:** TBD
- **Status:** Pending
