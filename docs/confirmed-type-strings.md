# Confirmed API Type Strings

Type strings verified from actual GHL API responses — not inferred from docs.

## Source 1: Live Workflow Data (reverse-engineered 2026-03-18)

Captured from real workflow templates JSON via Firebase Storage.

### Actions (17 confirmed)

| Type String | UI Name | Source |
|-------------|---------|--------|
| `add_contact_tag` | Add Contact Tag | Live workflow |
| `remove_contact_tag` | Remove Contact Tag | Live workflow |
| `sms` | Send SMS | Live workflow |
| `email` | Send Email | Live workflow |
| `wait` | Wait Step | Live workflow |
| `if_else` | If/Else | Live workflow |
| `assign_user` | Assign to User | Live workflow |
| `add_to_workflow` | Add to Workflow | Live workflow |
| `remove_from_workflow` | Remove from Workflow | Live workflow |
| `update_contact_field` | Update Contact Field | Live workflow |
| `find_opportunity` | Find Opportunity | Live workflow |
| `internal_create_opportunity` | Create Opportunity | Live workflow |
| `internal_update_opportunity` | Update Opportunity | Live workflow |
| `internal_notification` | Send Internal Notification | Live workflow |
| `slack_message` | Send Slack Message | Live workflow |
| `goto` | Go To | Live workflow |
| `transition` | Transition (branch marker) | Live workflow |

### Triggers (4 confirmed)

| Type String | UI Name | Source |
|-------------|---------|--------|
| `contact_tag_added` | Contact Tag Added | Live workflow |
| `appointment` | Appointment Status | Live workflow |
| `contact_created` | Contact Created | Live workflow |
| `form_submitted` | Form Submitted | Live workflow |

## Source 2: Campaign Builder JS Source (extracted 2026-03-22)

Extracted from `static.leadconnectorhq.com/1190/app.js` chunk `chunk.B3DQ7eVg.js`.
These are from the **old campaign builder** — the new workflow builder v2 may use different strings for some.

### Campaign Actions (22 confirmed)

| Type String | UI Name | Notes |
|-------------|---------|-------|
| `add_to_campaign` | Add to Campaign | Campaign-only |
| `remove_from_campaign` | Remove from Campaign | Campaign-only |
| `remove_from_all_campaigns` | Remove from All Campaigns | Campaign-only |
| `create_opportunity` | Add/Update Opportunity | Different from `internal_create_opportunity` |
| `remove_opportunity` | Remove Opportunity | |
| `add_contact_tag` | Add Contact Tag | Same as workflow builder |
| `remove_contact_tag` | Remove Contact Tag | Same as workflow builder |
| `remove_assigned_user` | Remove Assigned User | |
| `send_email` | Send Email | Campaign uses `send_email`, workflow uses `email` |
| `send_sms` | Send SMS | Campaign uses `send_sms`, workflow uses `sms` |
| `execute_webhook` | Execute Webhook | Campaign uses `execute_webhook`, workflow uses `webhook` |
| `add_notes` | Add to Notes | Campaign uses `add_notes`, workflow likely `add_note` |
| `dnd_contact` | Set Contact DND | |
| `task_notification` | Add Task | Campaign uses `task_notification` |
| `send_notification` | Send Notification | |
| `google_adword` | Add to Google AdWords | Singular, not `google_adwords` |
| `google_analytics` | Add to Google Analytics | Same |
| `assign_user` | Assign to User | Same as workflow builder |
| `stripe_one_time_charge` | Stripe One Time Charge | |
| `update_appointment_status` | Update Appointment Status | |
| `update_contact_field` | Update Contact Field | Same as workflow builder |
| `mark_conversation_read` | Mark Conversation as Read | |

### Campaign Triggers (21 confirmed)

| Type String | UI Name | Notes |
|-------------|---------|-------|
| `added_to_campaign` | Added to Campaign | Campaign-only |
| `customer_reply` | Customer Replied | Not `customer_replied` |
| `customer_appointment` | Customer Booked Appointment | Not `customer_booked_appointment` |
| `pipeline_stage_updated` | Pipeline Stage Changed | Not `pipeline_stage_changed` |
| `appointment` | Appointment Status | Same |
| `trigger_link` | Trigger Link Clicked | Not `trigger_link_clicked` |
| `opportunity_decay` | Stale Opportunities | Not `stale_opportunities` |
| `form_submission` | Form Submitted | Not `form_submitted` (different!) |
| `contact_tag` | Contact Tag | Not `contact_tag_added` (different!) |
| `opportunity_status_changed` | Opportunity Status Changed | Same |
| `survey_submission` | Survey Submitted | Not `survey_submitted` |
| `birthday_reminder` | Birthday Reminder | Same |
| `custom_date_reminder` | Custom Date Reminder | Same |
| `dnd_contact` | Contact DND | Not `contact_dnd` |
| `call_status` | Call Status | Same |
| `task_due_date_reminder` | Task Reminder | Not `task_reminder` |
| `two_step_form_submission` | Order Form Submission | Not `order_form_submission` |
| `mailgun_email_event` | Email Events | Not `email_events` |
| `note_add` | Note Added | Not `note_added` |
| `task_added` | Task Added | Same |
| `validation_error` | Twilio Validation Error | Not `number_validation` |

### Membership Triggers (7 confirmed from JS)

| Type String | UI Name |
|-------------|---------|
| `product_access_granted` | Product Access Granted |
| `product_access_removed` | Product Access Removed |
| `user_log_in` | User Login |
| `product_completed` | Product Completed |
| `membership_contact_created` | Membership New Signup |
| `offer_access_granted` | Offer Access Granted |
| `offer_access_removed` | Offer Access Removed |

### Facebook Trigger (1 confirmed from JS)

| Type String | UI Name |
|-------------|---------|
| `facebook_lead_gen` | Facebook Lead Form Submitted |

## CRITICAL: Campaign vs Workflow Builder Type String Differences

The old campaign builder and the new workflow builder use **different type strings** for the same actions:

| Campaign Builder | Workflow Builder v2 | UI Name |
|-----------------|--------------------|---------|
| `send_sms` | `sms` | Send SMS |
| `send_email` | `email` | Send Email |
| `execute_webhook` | `webhook` | Webhook |
| `add_notes` | `add_note` (inferred) | Add Note |
| `task_notification` | `add_task` (inferred) | Add Task |
| `create_opportunity` | `internal_create_opportunity` | Create Opportunity |
| `send_notification` | `internal_notification` | Send Notification |
| `form_submission` | `form_submitted` | Form Submitted |
| `contact_tag` | `contact_tag_added` | Contact Tag |
| `customer_reply` | `customer_replied` (inferred) | Customer Replied |
| `pipeline_stage_updated` | `pipeline_stage_changed` (inferred) | Pipeline Stage Changed |
| `opportunity_decay` | `stale_opportunities` (inferred) | Stale Opportunities |
| `trigger_link` | `trigger_link_clicked` (inferred) | Trigger Link Clicked |
| `survey_submission` | `survey_submitted` (inferred) | Survey Submitted |
| `dnd_contact` | `contact_dnd` (inferred) | Contact DND |
| `mailgun_email_event` | `email_events` (inferred) | Email Events |
| `note_add` | `note_added` (inferred) | Note Added |
| `validation_error` | `number_validation` (inferred) | Number Validation |
| `task_due_date_reminder` | `task_reminder` (inferred) | Task Reminder |
| `two_step_form_submission` | `order_form_submission` (inferred) | Order Form Submission |
| `membership_contact_created` | `course_new_signup` (inferred) | Membership New Signup |

**The workflow builder v2 type strings in the right column that say "(inferred)" still need live verification.** The left column strings are confirmed from the JS source.

## Verification Status

| Source | Actions Confirmed | Triggers Confirmed |
|--------|------------------|--------------------|
| Live workflow data | 17 | 4 |
| Campaign builder JS | 22 | 29 |
| **Total unique confirmed** | **~33** | **~31** |
| Still inferred | ~62 | ~62 |

## How to Verify Remaining

1. Refresh Firebase JWT (extract from GHL browser IndexedDB)
2. Create test workflow with each action/trigger type in GHL UI
3. Read back via `ghl_workflow_builder_get_steps` / `ghl_workflow_builder_get_triggers`
4. Document exact type string and default attribute schema
