# GHL Workflow Action & Trigger Types — Complete Reference

Compiled from GHL help center documentation, reverse-engineered internal API schemas, and live workflow data.

Sources:
- https://help.gohighlevel.com/support/solutions/articles/155000002294 (Complete action list)
- https://help.gohighlevel.com/support/solutions/articles/155000002292 (Complete trigger list)
- `ghl-workflow-api/data-schemas.md` (confirmed API type strings from real workflows)

---

## Action Types

Each action step in a workflow has a `type` string in the templates array. The `type` field is the internal API identifier used in `POST/PUT /workflow/{locationId}` payloads.

### Contact Actions

| UI Name | API Type String | Description |
|---------|----------------|-------------|
| Create Contact | `create_contact` | Creates a new contact |
| Find Contact | `find_contact` | Locates existing contacts based on criteria |
| Update Contact Field | `update_contact_field` | Modifies a specific contact field value |
| Add Contact Tag | `add_contact_tag` | Adds one or more tags to the contact |
| Remove Contact Tag | `remove_contact_tag` | Removes tags from the contact |
| Assign to User | `assign_user` | Assigns the contact to a GHL user |
| Remove Assigned User | `remove_assigned_user` | Removes user assignment from the contact |
| Edit Conversation | `edit_conversation` | Marks, archives, or unarchives conversations |
| Disable/Enable DND | `set_dnd` | Controls Do Not Disturb settings on the contact |
| Add Note | `add_note` | Adds a note to the contact record |
| Add Task | `add_task` | Creates a task linked to the contact |
| Copy Contact | `copy_contact` | Duplicates the contact to another sub-account |
| Delete Contact | `delete_contact` | Removes the contact from the system |
| Modify Contact Engagement Score | `modify_engagement_score` | Adjusts the contact's engagement score |
| Add/Remove Contact Followers | `contact_followers` | Manages who can see the contact |

### Communication Actions

| UI Name | API Type String | Description |
|---------|----------------|-------------|
| Send SMS | `sms` | Sends an SMS text message |
| Send Email | `email` | Sends an email (HTML body, template vars) |
| Call | `call` | Initiates a phone call with ring-through |
| Voicemail Drop | `voicemail_drop` | Drops a pre-recorded voicemail |
| Send Slack Message | `slack_message` | Posts a message to a Slack channel |
| Messenger (Facebook) | `facebook_message` | Sends a Facebook Messenger message |
| Instagram DM | `instagram_message` | Sends an Instagram direct message |
| WhatsApp | `whatsapp` | Sends a WhatsApp message |
| GMB Messaging | `gmb_message` | Responds to Google My Business messages |
| Send Live Chat Message | `live_chat_message` | Sends a live chat message |
| Manual Action | `manual_action` | Prompts a user for manual intervention |
| Send Internal Notification | `internal_notification` | Notifies team members (email/in-app) |
| Send Review Request | `send_review_request` | Sends a review request to the contact |
| Conversation AI | `conversation_ai` | Activates/manages AI-driven conversations |
| Facebook Interactive Messenger | `fb_interactive_messenger` | Responds to Facebook post comments |
| Instagram Interactive Messenger | `ig_interactive_messenger` | Responds to Instagram post comments |
| Reply in Comments | `reply_in_comments` | Engages with social media comments |

### Send Data Actions

| UI Name | API Type String | Description |
|---------|----------------|-------------|
| Webhook / Custom Webhook | `webhook` | Sends data to an external URL via HTTP |
| Google Sheets | `google_sheets` | Reads/writes data to Google Sheets |

### Internal Tools Actions

| UI Name | API Type String | Description |
|---------|----------------|-------------|
| If/Else | `if_else` | Conditional branching (multi-branch via `next` array) |
| Wait | `wait` | Delays execution (time-based or event-based) |
| Goal Event | `goal_event` | Directs contacts to a specific goal |
| Split (A/B Test) | `split` | Splits contacts for A/B testing |
| Go To | `goto` | Jumps to another step in the workflow |
| Remove from Workflow | `remove_from_workflow` | Removes contact from workflow(s) |
| Add to Workflow | `add_to_workflow` | Adds contact to another workflow |
| Update Custom Value | `update_custom_value` | Updates a custom value/field |
| Drip Mode | `drip` | Controls batch flow rate of contacts |
| Text Formatter | `text_formatter` | Transforms and formats text strings |
| Number Formatter | `number_formatter` | Formats numbers (currency, decimals, etc.) |
| Date/Time Formatter | `date_formatter` | Formats dates and times |
| Math Operation | `math_operation` | Performs mathematical calculations |
| Custom Code | `custom_code` | Executes custom JavaScript code |
| Arrays | `arrays` | Handles collections/lists of values |

### Workflow AI Actions

| UI Name | API Type String | Description |
|---------|----------------|-------------|
| AI Prompt (GPT Powered) | `ai_prompt` | Generates AI-driven responses via OpenAI |
| AI Summarize | `ai_summarize` | Summarizes conversation or text content |

### Eliza AI Actions

| UI Name | API Type String | Description |
|---------|----------------|-------------|
| Eliza AI Appointment Booking | `eliza_appointment` | AI-powered appointment scheduling |
| Send to Eliza Agent Platform | `eliza_agent` | Routes contact to Eliza platform |

### Appointment Actions

| UI Name | API Type String | Description |
|---------|----------------|-------------|
| Update Appointment Status | `update_appointment_status` | Changes appointment state (confirmed/cancelled/showed/noshow) |
| Generate One Time Booking Link | `booking_link` | Creates a single-use booking URL |

### Opportunity / Pipeline Actions

| UI Name | API Type String | Description |
|---------|----------------|-------------|
| Create Opportunity | `internal_create_opportunity` | Creates an opportunity in a pipeline |
| Update Opportunity | `internal_update_opportunity` | Moves opportunity to a different stage |
| Find Opportunity | `find_opportunity` | Searches for opportunity (multi-path: Found/Not Found) |
| Remove Opportunity | `remove_opportunity` | Removes an opportunity from a pipeline |

### Payment Actions

| UI Name | API Type String | Description |
|---------|----------------|-------------|
| Stripe One-Time Charge | `stripe_one_time_charge` | Processes a one-time Stripe payment |
| Send Invoice | `send_invoice` | Sends an invoice to the contact |
| Send Documents and Contracts | `send_document` | Distributes document/contract templates |

### Marketing / Ads Actions

| UI Name | API Type String | Description |
|---------|----------------|-------------|
| Add to Google Analytics | `google_analytics` | Sends conversion data to GA |
| Add to Google AdWords | `google_adwords` | Manages AdWords audience data |
| Add to Custom Audience (Facebook) | `fb_add_custom_audience` | Adds contact to Facebook ad audience |
| Remove from Custom Audience (Facebook) | `fb_remove_custom_audience` | Removes from Facebook audience |
| Facebook Conversion API | `fb_conversion_api` | Tracks Facebook ad conversions (CAPI) |

### Affiliate Actions

| UI Name | API Type String | Description |
|---------|----------------|-------------|
| Add to Affiliate Manager | `add_affiliate` | Registers a new affiliate |
| Update Affiliate | `update_affiliate` | Modifies affiliate information |
| Add/Remove from Affiliate Campaign | `affiliate_campaign` | Manages campaign participation |

### Courses / Memberships Actions

| UI Name | API Type String | Description |
|---------|----------------|-------------|
| Course Grant Offer | `course_grant_offer` | Provides course access |
| Course Revoke Offer | `course_revoke_offer` | Removes course access |

### IVR (Interactive Voice Response) Actions

| UI Name | API Type String | Description |
|---------|----------------|-------------|
| Gather Input on Call | `ivr_gather_input` | Collects DTMF/speech input from caller |
| Play Message | `ivr_play_message` | Plays an audio message to the caller |
| Connect to Call | `ivr_connect_call` | Routes the call to a user or number |
| End Call | `ivr_end_call` | Terminates the call session |
| Record Voicemail | `ivr_record_voicemail` | Captures voicemail from the caller |

### Communities Actions

| UI Name | API Type String | Description |
|---------|----------------|-------------|
| Grant Group Access | `community_grant_access` | Gives access to a community group |
| Revoke Group Access | `community_revoke_access` | Removes community group access |

### Special Step Types

| API Type String | Description |
|----------------|-------------|
| `transition` | Branch path marker for multi-path actions (find_opportunity, if_else). No attributes. |

---

## Confirmed API Type Strings (from real workflow data)

These type strings have been verified from actual GHL workflow templates JSON:

- `add_contact_tag`
- `remove_contact_tag`
- `sms`
- `email`
- `wait`
- `if_else`
- `assign_user`
- `add_to_workflow`
- `remove_from_workflow`
- `update_contact_field`
- `find_opportunity`
- `internal_create_opportunity`
- `internal_update_opportunity`
- `internal_notification`
- `slack_message`
- `goto`
- `transition`

All other API type strings above are inferred from naming conventions observed in the confirmed types. The actual strings may differ slightly (e.g., `manual_call` vs `call`, `custom_webhook` vs `webhook`).

---

## Trigger Types

Triggers define what event starts a workflow. Each trigger has a `type` string and optional `conditions` array.

### Contact Triggers

| UI Name | API Type String | Condition Fields |
|---------|----------------|-----------------|
| Birthday Reminder | `birthday_reminder` | — |
| Contact Changed | `contact_changed` | `contact.*` fields |
| Contact Created | `contact_created` | — |
| Contact DND | `contact_dnd` | DND status |
| Contact Tag (Added/Removed) | `contact_tag_added` / `contact_tag_removed` | `contact.tags` |
| Custom Date Reminder | `custom_date_reminder` | Custom date field |
| Note Added | `note_added` | — |
| Note Changed | `note_changed` | — |
| Task Added | `task_added` | — |
| Task Reminder | `task_reminder` | — |
| Task Completed | `task_completed` | — |
| Contact Engagement Score | `contact_engagement_score` | Score threshold |

### Event Triggers

| UI Name | API Type String | Condition Fields |
|---------|----------------|-----------------|
| Inbound Webhook | `inbound_webhook` | — |
| Scheduler | `scheduler` | Cron/schedule config |
| Call Details | `call_details` | Call status, direction |
| Email Events | `email_events` | Email event type (opened, clicked, bounced) |
| Customer Replied | `customer_replied` | Channel type |
| Conversation AI Trigger | `conversation_ai_trigger` | AI event type |
| Custom Trigger | `custom_trigger` | Custom event name |
| Form Submitted | `form_submitted` | Form ID |
| Survey Submitted | `survey_submitted` | Survey ID |
| Trigger Link Clicked | `trigger_link_clicked` | Link ID |
| Facebook Lead Form Submitted | `facebook_lead_form` | Form ID |
| TikTok Form Submitted | `tiktok_form_submitted` | — |
| Video Tracking | `video_tracking` | Video event |
| Number Validation | `number_validation` | Validation status |
| Messaging Error - SMS | `messaging_error_sms` | Error type |
| LinkedIn Lead Form Submitted | `linkedin_lead_form` | — |
| Funnel/Website PageView | `page_view` | Page URL |
| Quiz Submitted | `quiz_submitted` | Quiz ID |
| New Review Received | `review_received` | Rating, source |
| Prospect Generated | `prospect_generated` | — |
| Click To WhatsApp Ads | `click_to_whatsapp` | — |
| External Tracking Event | `external_tracking_event` | Event name |

### Appointment Triggers

| UI Name | API Type String | Condition Fields |
|---------|----------------|-----------------|
| Appointment Status | `appointment` | `appointment.status`, `calendar.id`, `appointment.eventType` |
| Customer Booked Appointment | `customer_booked_appointment` | Calendar ID |
| Service Booking | `service_booking` | Service ID |
| Rental Booking | `rental_booking` | Rental ID |

### Opportunity Triggers

| UI Name | API Type String | Condition Fields |
|---------|----------------|-----------------|
| Opportunity Status Changed | `opportunity_status_changed` | Pipeline, stage, status |
| Opportunity Created | `opportunity_created` | Pipeline ID |
| Opportunity Changed | `opportunity_changed` | Field changed |
| Pipeline Stage Changed | `pipeline_stage_changed` | Pipeline, from/to stage |
| Stale Opportunities | `stale_opportunities` | Days stale, pipeline |

### Affiliate Triggers

| UI Name | API Type String | Condition Fields |
|---------|----------------|-----------------|
| Affiliate Created | `affiliate_created` | — |
| New Affiliate Sales | `affiliate_sale` | — |
| Affiliate Enrolled In Campaign | `affiliate_enrolled` | Campaign ID |
| Lead Created (Affiliate) | `affiliate_lead_created` | — |

### Courses Triggers

| UI Name | API Type String | Condition Fields |
|---------|----------------|-----------------|
| Category Started | `course_category_started` | Course/category ID |
| Category Completed | `course_category_completed` | Course/category ID |
| Lesson Started | `course_lesson_started` | Lesson ID |
| Lesson Completed | `course_lesson_completed` | Lesson ID |
| New Signup | `course_new_signup` | — |
| Offer Access Granted | `course_offer_granted` | Offer ID |
| Offer Access Removed | `course_offer_removed` | Offer ID |
| Product Access Granted | `course_product_granted` | Product ID |
| Product Access Removed | `course_product_removed` | Product ID |
| Product Started | `course_product_started` | Product ID |
| Product Completed | `course_product_completed` | Product ID |
| User Login | `course_user_login` | — |

### Payment Triggers

| UI Name | API Type String | Condition Fields |
|---------|----------------|-----------------|
| Invoice | `invoice` | Invoice status |
| Payment Received | `payment_received` | Amount, source |
| Order Form Submission | `order_form_submission` | Form ID |
| Order Submitted | `order_submitted` | — |
| Documents & Contracts | `documents_contracts` | Document status |
| Estimates | `estimates` | Estimate status |
| Subscription | `subscription` | Subscription event |
| Refund | `refund` | — |
| Coupon Code Applied | `coupon_code_applied` | Coupon, product, price/variant |
| Coupon Redemption Limit Reached | `coupon_limit_reached` | — |
| Coupon Code Expired | `coupon_code_expired` | — |
| Coupon Code Redeemed | `coupon_code_redeemed` | Coupon, product, price/variant |

### Ecommerce Triggers

| UI Name | API Type String | Condition Fields |
|---------|----------------|-----------------|
| Shopify Abandoned Cart | `shopify_abandoned_cart` | (Deprecating) |
| Shopify Order Placed | `shopify_order_placed` | — |
| Shopify Order Fulfilled | `shopify_order_fulfilled` | (Deprecating) |
| Order Fulfilled | `order_fulfilled` | — |
| Product Review Submitted | `product_review_submitted` | Product, rating |
| Abandoned Checkout | `abandoned_checkout` | — |

### IVR Triggers

| UI Name | API Type String | Condition Fields |
|---------|----------------|-----------------|
| Start IVR Trigger | `ivr_start` | — |

### Social Media Triggers

| UI Name | API Type String | Condition Fields |
|---------|----------------|-----------------|
| Facebook Comment(s) On A Post | `facebook_comment` | Post ID |
| Instagram Comment(s) On A Post | `instagram_comment` | Post ID |
| TikTok Comment(s) On A Video | `tiktok_comment` | Video ID |

### Communities Triggers

| UI Name | API Type String | Condition Fields |
|---------|----------------|-----------------|
| Group Access Granted | `community_group_access_granted` | Group ID |
| Group Access Revoked | `community_group_access_revoked` | Group ID |
| Private Channel Access Granted | `community_private_channel_granted` | Channel ID |
| Private Channel Access Revoked | `community_private_channel_revoked` | Channel ID |
| Leaderboard Level Changed | `community_leaderboard_level_changed` | Level |

### Other Triggers

| UI Name | API Type String | Condition Fields |
|---------|----------------|-----------------|
| Certificates Issued | `certificate_issued` | Certificate ID |
| Transcript Generated | `transcript_generated` | — |
| Google Lead Form Submitted | `google_lead_form` | Form ID |

---

## Confirmed Trigger Type Strings (from real workflow data)

These trigger type strings have been verified from actual GHL trigger JSON:

- `contact_tag_added`
- `appointment`
- `contact_created`
- `form_submitted`

All other trigger type strings above are inferred from naming conventions. The `masterType` field on triggers is typically `"highlevel"`.

---

## Trigger Structure (Internal JSON Schema)

```json
{
  "id": "trigger-uuid",
  "type": "contact_tag_added",
  "name": "Display Name",
  "active": true,
  "masterType": "highlevel",
  "workflow_id": "workflow-uuid",
  "location_id": "location-id",
  "conditions": [
    {
      "operator": "==",
      "field": "contact.tags",
      "value": "new-lead",
      "title": "Tag",
      "type": "select"
    }
  ],
  "actions": [
    {
      "workflow_id": "workflow-uuid",
      "type": "add_to_workflow"
    }
  ],
  "schedule_config": {}
}
```

### Trigger Field Reference

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Unique trigger identifier |
| `type` | string | Trigger event type (see catalog below) |
| `name` | string | Display name shown in UI |
| `active` | boolean | Whether trigger is enabled (true) or disabled (false) |
| `masterType` | string | Origin system. Known values: `"highlevel"` (native), `"marketplace"` (LC Premium Triggers from marketplace apps) |
| `workflow_id` | string (UUID) | Parent workflow this trigger belongs to |
| `location_id` | string | GHL location ID |
| `conditions` | array | Filter conditions (AND logic -- all must match) |
| `actions` | array | Always `[{workflow_id, type: "add_to_workflow"}]` |
| `schedule_config` | object | Schedule settings (for `scheduler` trigger type) |

### Condition Object Schema

Each condition in the `conditions` array:

```json
{
  "operator": "==",
  "field": "contact.tags",
  "value": "new-lead",
  "title": "Tag",
  "type": "select"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `operator` | string | Comparison operator (see operator catalog) |
| `field` | string | Dot-notation field path to evaluate |
| `value` | string/number/boolean | Value to compare against |
| `title` | string | Human-readable label shown in UI |
| `type` | string | Input widget type: `"select"`, `"text"`, `"number"`, `"date"`, `"checkbox"`, `"radio"`, `"multiple_select"`, `"dynamic"` |

### Condition Operator Catalog

**General Operators (available across most field types):**

| Operator | UI Label | Applies To |
|----------|----------|------------|
| `==` | Equals / Is | select, text, number, date |
| `!=` | Is Not / Not Equals | select, text, number |
| `>` | Greater Than | number, date, score |
| `<` | Less Than | number, date, score |
| `>=` | Greater Than or Equal To | number, date, score |
| `<=` | Less Than or Equal To | number, date, score |
| `contains` | Contains Phrase | text, tags |
| `not_contains` | Does Not Contain Phrase | text |
| `is_empty` | Is Empty | all field types |
| `is_not_empty` | Is Not Empty | all field types |

**Change-Detection Operators (for "Changed" triggers like `opportunity_changed`, `contact_changed`, `company_changed`):**

| Operator | UI Label | Description |
|----------|----------|-------------|
| `has_changed` | Has Changed | Field changed to ANY new value |
| `has_changed_to` | Has Changed To | Field changed to a SPECIFIC value |
| `==` | Equals | Current value matches (fires on any update to record if field matches) |

**Checkbox-Specific Operators:**

| Operator | UI Label |
|----------|----------|
| `added` | Added (checked) |
| `removed` | Removed (unchecked) |
| `==` | Equals |

---

## Trigger Filter Configurations (Per Trigger Type)

### Contact Tag (`contact_tag_added` / `contact_tag_removed`)

| Filter | Operators | Values |
|--------|-----------|--------|
| Tag | `==` | Tag name (select from existing or create new) |
| Direction | implicit | Chosen by selecting `contact_tag_added` vs `contact_tag_removed` type |

Notes: No scheduling options. No retroactive triggering -- tags must be added/removed AFTER workflow is active. Multiple workflows can share identical tag triggers and fire simultaneously.

### Contact Changed (`contact_changed`)

| Filter | Operators | Values |
|--------|-----------|--------|
| Any contact field | `has_changed`, `has_changed_to`, `==`, `is_empty`, `is_not_empty`, `contains` | Field-specific |
| Custom fields | Same operators as their field type (checkbox: added/removed/equals; dropdown: has_changed/has_changed_to/equals; date: has_changed/has_changed_to/equals) |

### Contact Engagement Score (`contact_engagement_score`)

| Filter | Operators | Values |
|--------|-----------|--------|
| Score | `==`, `>`, `>=`, `<`, `<=`, `is_empty`, `is_not_empty`, `contains`, `not_contains` | Numeric threshold |
| Business Niche | `contains`, `not_contains` | Text phrase |

### Appointment Status (`appointment`)

| Filter | Operators | Values |
|--------|-----------|--------|
| `appointment.status` | `==` | `"confirmed"`, `"cancelled"`, `"showed"`, `"noshow"`, `"rescheduled"`, `"booked"` |
| `appointment.eventType` | `==` | `"normal"`, `"collective"` |
| `calendar.id` | `==` | Calendar UUID (specific calendar filter) |

### Call Details (`call_details`)

| Filter | Operators | Values |
|--------|-----------|--------|
| Call Direction | `==` | `"inbound"`, `"outbound"`, `"both"` |
| Call Status | `==` | `"no_answer"`, `"voicemail"`, `"busy"`, `"missed"`, `"completed"` |
| In Number Pool | `==` | Number pool ID |
| In Phone Number | `==` | Phone number ID |
| Custom Disposition | `==` | Disposition value |

Notes: All filters use AND logic -- all must match for the workflow to fire.

### Opportunity Changed (`opportunity_changed`)

| Filter | Operators | Values |
|--------|-----------|--------|
| Assigned To | `has_changed`, `has_changed_to`, `==` | User ID |
| Tag | `==` | Tag name |
| In Pipeline | `has_changed`, `has_changed_to`, `==` | Pipeline ID |
| Lead Value | `>`, `<`, `==`, `>=`, `<=` | Numeric amount |
| Lost Reason | `has_changed`, `has_changed_to`, `==` | Reason string |
| Status | `==` (Is), `!=` (Is Not), `has_changed`, `has_changed_to` | Status value |
| Custom Fields (checkbox) | `added`, `removed`, `==` | Boolean |
| Custom Fields (radio/select) | `has_changed`, `has_changed_to`, `==` | Option value |
| Custom Fields (dropdown) | `has_changed`, `has_changed_to`, `==` | Option value |
| Custom Fields (date) | `has_changed`, `has_changed_to`, `==` | Date value |

### Stale Opportunities (`stale_opportunities`)

| Filter | Operators | Values |
|--------|-----------|--------|
| Stale Duration | `>=` | Number of days (e.g., 2) |
| In Pipeline | `==` | Pipeline ID |
| Pipeline Stage | `==` | Stage ID (specific stage within pipeline) |

Notes: Trigger resets when the opportunity moves to a new stage or is updated. Will not repeatedly fire on unchanged stale opportunities.

### Invoice (`invoice`)

| Filter | Operators | Values |
|--------|-----------|--------|
| Invoice Status | `==` | `"paid"`, `"partially_paid"`, `"sent"`, `"viewed"`, `"void"` |
| Tag | `==` | Tag name |
| Custom Fields | varies by type | Custom field values |

### Estimates (`estimates`)

| Filter | Operators | Values |
|--------|-----------|--------|
| Estimate Status | `==`, `is_empty`, `!=`, `is_not_empty` | `"sent"`, `"viewed"`, `"accepted"`, `"declined"`, `"invoiced"` |
| Estimate Value | `==`, `>`, `>=`, `<`, `<=`, `!=`, `is_empty`, `is_not_empty` | Numeric amount |
| Estimate Template | `==`, `is_empty`, `!=`, `is_not_empty` | Template ID |

### Order Submitted (`order_submitted`)

| Filter | Operators | Values |
|--------|-----------|--------|
| Global Product | `==` (Is), `!=` (Is Not) | Product ID |
| Product Price | `==` (Is), `!=` (Is Not) | Price value |
| Order Source | `==` (Is), `!=` (Is Not) | `"external"`, `"form"`, `"membership"`, `"order_form"`, `"payment_link"`, `"online_store"`, `"survey"` |
| Sub-Source | `==` (Is), `!=` (Is Not) | Specific funnel/website ID |
| In Funnel/Website | `==` (Is), `!=` (Is Not) | Funnel/website ID |
| Page Is | `==` (Is), `!=` (Is Not) | Page ID |
| Submission Type | `==` | `"primary"`, `"bump"`, `"upsell"` |

### Survey Submitted (`survey_submitted`)

| Filter | Operators | Values |
|--------|-----------|--------|
| Survey Is | `==` | Survey ID (or blank for all surveys) |
| Disqualified | `==` | `true`, `false` |

Notes: Does not directly evaluate survey answers. Use custom fields or tags applied via survey logic to build conditional automation.

### Form Submitted (`form_submitted`)

| Filter | Operators | Values |
|--------|-----------|--------|
| Form Is | `==` | Form ID (or blank for all forms) |

### Task Completed (`task_completed`)

| Filter | Operators | Values |
|--------|-----------|--------|
| Assigned User | `==` (Is), `is_empty`, `!=` (Is Not), `is_not_empty` | User ID |

### Task Added (`task_added`)

| Filter | Operators | Values |
|--------|-----------|--------|
| Assigned User | `==` | User ID (one or multiple) |

### Note Added (`note_added`) / Note Changed (`note_changed`)

| Filter | Operators | Values |
|--------|-----------|--------|
| Has Tag | `==` | Tag name |
| Contact fields | varies | Standard/custom field values |

### Company Changed (`company_changed`)

| Filter | Operators | Values |
|--------|-----------|--------|
| Standard Company fields | `is_not_empty`, `contains` | Industry, Domain, Status, etc. |
| Custom Company fields | `is_not_empty`, `contains` | Custom field values |

Notes: All conditions use AND logic.

### Coupon Code Applied / Redeemed (`coupon_code_applied` / `coupon_code_redeemed`)

| Filter | Operators | Values |
|--------|-----------|--------|
| Product | `==` | Product ID |
| Price / Variant | `==` | Price/variant ID (dependent filter on Product) |

---

## Trigger Architecture

### Multiple Triggers Per Workflow

- A single workflow can have **multiple triggers** attached
- Multiple triggers operate as **OR logic** -- any one trigger firing enrolls the contact
- Within a single trigger, filter conditions operate as **AND logic** -- ALL conditions must match
- A contact enters a workflow ONCE per enrollment event -- only one trigger "wins" per enrollment
- If `allowMultiple` is true on the workflow, the same contact can re-enter via a different trigger later

### Go-To Connections (Advanced Builder)

- Each trigger can have a **Go-To connection** pointing to a specific action step (dashed line in UI)
- 1:1 mapping: each trigger connects to exactly one action
- Actions can only have one incoming trigger connection
- Unassigned triggers auto-connect to the Root (first) action
- Contacts skip intermediate steps and start at the connected action

### Trigger Enrollment Priority

- Triggers fire based on event matching, not priority ordering
- If multiple triggers could match the same event, only one enrollment occurs
- The system attributes enrollment to the single trigger that fired
- No explicit priority/ordering mechanism exists between triggers

### Active Toggle Behavior

- `active: true` -- trigger evaluates events and enrolls contacts
- `active: false` -- trigger is disabled, events are ignored
- Toggling active does NOT retroactively fire for missed events
- Statistics (attempted/matched/unmatched) only tracked for active triggers

### Trigger Statistics

Each active trigger tracks 3 metrics (rolling 30-day window):
- **Attempted**: Total contacts evaluated by the trigger
- **Matched**: Contacts that met all conditions and enrolled
- **Unmatched**: Contacts that failed at least one condition

Unmatched contacts show diagnostic details: which specific condition failed, the actual vs expected value.

---

## masterType Values

| Value | Description |
|-------|-------------|
| `"highlevel"` | Native GHL trigger -- built into the platform |
| `"marketplace"` | LC Premium Trigger from a marketplace app. Requires app installation on the sub-account. Supports contactless execution. Has subscription URL for CREATED/UPDATED/DELETED lifecycle events. |

Marketplace triggers additionally support:
- **Filter types**: `string`, `select`, `multiple_select`, `dynamic` (API-driven options)
- **Option sources**: `constants` (static label-value pairs), `internal_reference` (HighLevel module data), `external_api` (GET endpoint returning options)
- **Sample payload**: Required JSON structure that defines available filter fields and custom variables
- **Scope requirement**: `workflows.readonly` scope must be enabled

---

## Schedule Configurations

### Scheduler Trigger (`scheduler`)

The `scheduler` trigger fires on a time-based schedule without needing a contact event. Configuration lives in `schedule_config`:

```json
{
  "type": "scheduler",
  "schedule_config": {
    "frequency": "daily|weekly|monthly|custom",
    "time": "09:00",
    "timezone": "America/New_York",
    "days_of_week": [1, 3, 5],
    "day_of_month": 15
  }
}
```

### Stale Opportunities (`stale_opportunities`)

Uses a days-based inactivity timer rather than a cron schedule. Resets on any opportunity update.

### Birthday Reminder / Custom Date Reminder

Fire relative to a date field:
- **Birthday**: Fires on/around contact's birthday field
- **Custom Date**: Configurable offset (before/on/after) a custom date field

### Frequency Limits

- No built-in "once per contact per day" limiter at the trigger level
- Use `allowMultiple: false` on the workflow to prevent re-enrollment while contact is active in the workflow
- For rate limiting, use If/Else + custom field checks within the workflow actions

---

## Action Step Structure

```json
{
  "id": "step-uuid",
  "order": 0,
  "name": "Display Name",
  "type": "action_type_string",
  "attributes": {},
  "next": "next-step-uuid",
  "parentKey": "previous-step-uuid"
}
```

---

## Action Categories (UI Sidebar Grouping)

1. **Contact** (15 actions)
2. **Communication** (17 actions)
3. **Send Data** (2 actions)
4. **Internal Tools** (15 actions)
5. **Workflow AI** (2 actions)
6. **Eliza AI** (2 actions)
7. **Appointments** (2 actions)
8. **Opportunities** (4 actions)
9. **Payments** (3 actions)
10. **Marketing** (5 actions)
11. **Affiliate** (3 actions)
12. **Courses** (2 actions)
13. **IVR** (5 actions)
14. **Communities** (2 actions)

**Total: ~79 action types + 1 special type (transition)**

## Trigger Categories (UI Sidebar Grouping)

1. **Contact** (12 triggers)
2. **Events** (22 triggers)
3. **Appointments** (4 triggers)
4. **Opportunities** (5 triggers)
5. **Affiliate** (4 triggers)
6. **Courses** (12 triggers)
7. **Payments** (12 triggers)
8. **Ecommerce Stores** (6 triggers)
9. **IVR** (1 trigger)
10. **Facebook/Instagram Events** (2 triggers)
11. **Communities** (5 triggers)
12. **Certificates** (1 trigger)
13. **Communication** (2 triggers)
14. **Google Ads** (1 trigger)

**Total: 93 trigger types across 14 categories**
