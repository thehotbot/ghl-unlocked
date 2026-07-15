# GHL Internal API Research

## Sources
- drleadflow/ghl-automation-builder (GitHub) — primary reverse-engineering source
- Live endpoint probing (Jul 15 2026) against Roya location
- GHL Ideas board (896-vote "API First" request)
- GHL App Manifest: 97 federated micro-apps

## Confirmed Live Endpoints (200 status, probed directly)

| Method | Path | Data |
|--------|------|------|
| GET | `/funnels/funnel/list?locationId=X` | `{ funnels, count }` |
| GET | `/funnels/funnel/{id}?locationId=X` | Full funnel detail (steps, pages, domain, tracking code) |
| GET | `/funnels/page/list?funnelId=X&locationId=X` | Pages within a funnel |
| GET | `/forms/?locationId=X` | `{ forms, total }` |
| GET | `/forms/{id}?locationId=X` | `{ form }` — full form detail |
| GET | `/links/?locationId=X` | `{ links }` — trigger links |
| GET | `/campaigns/?locationId=X` | `{ campaigns }` |
| GET | `/triggers/?locationId=X` | `{ triggers }` |
| GET | `/users/?locationId=X` | `{ users }` — team members with roles |
| GET | `/custom-menus/?locationId=X` | `{ customMenus, totalLinks }` |
| GET | `/calendars/services?locationId=X` | `{ services }` |
| GET | `/calendars/groups?locationId=X` | Calendar groups |

## Documented But Not Yet Probed

### Workflow Endpoints (from drleadflow)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/workflow/{locId}/list` | List with folders, pagination, sorting |
| DELETE | `/workflow/{locId}/{wfId}` | Delete workflow |
| PUT | `/workflow/{locId}/change-status/{wfId}` | Publish/unpublish (better than our current approach) |
| POST | `/workflow/{locId}/trigger` | Create trigger |
| PUT | `/workflow/{locId}/trigger/{triggerId}` | Update trigger |
| DELETE | `/workflow/{locId}/trigger/{triggerId}` | Delete trigger |
| GET | `/workflow/{locId}/error-notification/count` | Workflow error count |
| GET | `/workflow/{locId}/workflow-ai/settings` | AI builder config |
| GET | `/workflow/oauth2/get-all-tokens?location_id=X` | OAuth tokens for integrations |
| PUT | `/emails/builder/meta/{templateId}` | Save email template metadata |

## Workflow Action Types (95 confirmed)

### Currently supported in CLI (6):
add_contact_tag, remove_contact_tag, update_contact_field, wait, sms, webhook

### High-value additions:
- **Communication:** email, voicemail, manual_call, live_chat_message, whatsapp, gmb_message, facebook_messenger, instagram_dm
- **Contact:** delete_contact, create_contact, find_contact, assign_user, remove_assigned_user, add_contact_to_dnd, remove_contact_from_dnd, add_note, add_task, set_dnd, edit_conversation, copy_contact
- **Pipeline:** internal_create_opportunity, internal_update_opportunity, find_opportunity, delete_opportunity
- **Flow control:** if_else, goto, add_to_workflow, remove_from_workflow, goal_event, end, split
- **Integrations:** custom_code, slack_message, google_sheets, google_calendar_event, stripe_create_invoice, facebook_conversion, google_ads_conversion, quickbooks
- **AI:** openai_completion, conversation_ai
- **Payments:** create_invoice, create_text2pay

## Trigger Types (54 confirmed)

Key ones: contact_tag, form_submission, trigger_link, appointment, pipeline_stage_updated, opportunity_decay, mailgun_email_event, dnd_contact, manual_trigger, inbound_webhook, scheduler_trigger, ivr_incoming_call, conv_ai_trigger, conv_ai_autonomous_trigger

## AI Employee System
- Bot types: FORM_BASED_BOT, PROMPT_BASED_BOT, FLOW_BUILDER_BOT
- Modes: off, suggestive, auto-pilot
- Channels: IG, FB, SMS, WebChat, Live_Chat, GMB, WhatsApp
- 16 action types including appointmentBooking, triggerWorkflow, humanHandover

## Endpoints NOT Found (need browser sniffing)
- Reporting/analytics (reportingApp micro-app exists)
- Phone number provisioning
- Conversation AI configuration (bot prompts, knowledge bases)
- Membership/courses CRUD
- Reputation management
- Snapshots create/push (403 at agency level)
- Communities

## Priority Roadmap
1. Funnels (confirmed live, high demand)
2. Forms (confirmed live)
3. More action types (89 missing, trivial to add)
4. Trigger CRUD (documented, not yet built)
5. Campaigns (confirmed live)
6. Users/team (confirmed live)
7. Workflow delete + proper publish endpoint
